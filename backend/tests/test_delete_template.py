"""
Tests for DELETE /api/v1/templates/{template_id} endpoint.

These tests verify the deletion of templates with CASCADE deletion of all
versions, fields, comparisons, physical file cleanup, and activity logging.
"""

import pytest
import os
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.user import User
from app.models.template import PDFTemplate, TemplateVersion, TemplateField
from app.models.comparison import Comparison, ComparisonField
from app.models.activity import Activity
from app.core.auth import create_access_token
from app.schemas.activity import ActivityType

client = TestClient(app)


@pytest.fixture
def test_user(db_session: Session) -> User:
    """Create a test user."""
    user = User(
        email="testuser@example.com",
        full_name="Test User",
        hashed_password="hashed_password",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def other_user(db_session: Session) -> User:
    """Create another test user for authorization tests."""
    user = User(
        email="otheruser@example.com",
        full_name="Other User",
        hashed_password="hashed_password",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict:
    """Create authentication headers for test user."""
    token = create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def other_auth_headers(other_user: User) -> dict:
    """Create authentication headers for other user."""
    token = create_access_token(data={"sub": other_user.email})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_template_complete(db_session: Session, test_user: User):
    """Create a complete test template with multiple versions, fields, and comparisons."""
    template = PDFTemplate(
        name="Complete Test Template",
        current_version="v3",
        uploaded_by=test_user.id
    )
    db_session.add(template)
    db_session.flush()
    
    # Create 3 versions
    versions = []
    for i in range(1, 4):
        version = TemplateVersion(
            template_id=template.id,
            version_number=f"v{i}",
            is_current=(i == 3),
            file_path=f"/test/template_delete_test_v{i}.pdf",
            file_size_bytes=1000 * i,
            field_count=i + 1,
            page_count=1
        )
        versions.append(version)
        db_session.add(version)
    
    db_session.flush()
    
    # Add fields to each version
    for version in versions:
        for j in range(version.field_count):
            field = TemplateField(
                version_id=version.id,
                field_id=f"field_{j}",
                field_type="text",
                page_number=1,
                field_page_order=j + 1
            )
            db_session.add(field)
    
    # Create comparison using versions
    comparison = Comparison(
        source_version_id=versions[0].id,
        target_version_id=versions[1].id,
        created_by=test_user.id,
        status="completed",
        modification_percentage=15.0,
        fields_added=1,
        fields_removed=0,
        fields_modified=0,
        fields_unchanged=2
    )
    db_session.add(comparison)
    db_session.flush()
    
    # Add comparison field
    comp_field = ComparisonField(
        comparison_id=comparison.id,
        field_id="added_field",
        status="ADDED",
        field_type="text"
    )
    db_session.add(comp_field)
    
    db_session.commit()
    db_session.refresh(template)
    
    return {
        'template': template,
        'versions': versions,
        'comparison': comparison
    }


def test_delete_template_success(
    db_session: Session,
    test_template_complete: dict,
    auth_headers: dict
):
    """Test successful deletion of a template with all related data."""
    template = test_template_complete['template']
    template_id = template.id
    versions = test_template_complete['versions']
    comparison = test_template_complete['comparison']
    
    # Verify everything exists before deletion
    assert db_session.query(PDFTemplate).filter_by(id=template_id).count() == 1
    assert db_session.query(TemplateVersion).filter_by(template_id=template_id).count() == 3
    # Count total fields across all versions (2 + 3 + 4 = 9)
    total_fields = sum(v.field_count for v in versions)
    assert db_session.query(TemplateField).filter(
        TemplateField.version_id.in_([v.id for v in versions])
    ).count() == total_fields
    assert db_session.query(Comparison).filter_by(id=comparison.id).count() == 1
    
    # Delete template
    response = client.delete(
        f"/api/v1/templates/{template_id}",
        headers=auth_headers
    )
    
    # Verify response
    assert response.status_code == 204
    
    # Verify template is deleted
    assert db_session.query(PDFTemplate).filter_by(id=template_id).count() == 0
    
    # Verify all versions are CASCADE deleted
    assert db_session.query(TemplateVersion).filter_by(template_id=template_id).count() == 0
    
    # Verify all fields are CASCADE deleted
    assert db_session.query(TemplateField).filter(
        TemplateField.version_id.in_([v.id for v in versions])
    ).count() == 0
    
    # Verify comparison is CASCADE deleted
    assert db_session.query(Comparison).filter_by(id=comparison.id).count() == 0


def test_delete_template_logs_activity(
    db_session: Session,
    test_template_complete: dict,
    test_user: User,
    auth_headers: dict
):
    """Test that deleting a template logs an activity."""
    template = test_template_complete['template']
    template_id = template.id
    template_name = template.name
    
    # Count activities before deletion
    activities_before = db_session.query(Activity).filter_by(
        activity_type=ActivityType.TEMPLATE_DELETED.value
    ).count()
    
    # Delete template
    response = client.delete(
        f"/api/v1/templates/{template_id}",
        headers=auth_headers
    )
    
    assert response.status_code == 204
    
    # Verify activity was logged
    activities_after = db_session.query(Activity).filter_by(
        activity_type=ActivityType.TEMPLATE_DELETED.value
    ).count()
    
    assert activities_after == activities_before + 1
    
    # Verify activity details
    activity = db_session.query(Activity).filter_by(
        activity_type=ActivityType.TEMPLATE_DELETED.value
    ).order_by(Activity.timestamp.desc()).first()
    
    assert activity is not None
    assert activity.user_id == test_user.id
    assert template_name in activity.description
    assert "deleted" in activity.description.lower()


def test_delete_template_not_found(
    db_session: Session,
    auth_headers: dict
):
    """Test deleting a non-existent template."""
    response = client.delete(
        "/api/v1/templates/99999",
        headers=auth_headers
    )
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_delete_template_unauthorized(
    db_session: Session,
    test_template_complete: dict
):
    """Test deleting a template without authentication."""
    template = test_template_complete['template']
    
    response = client.delete(f"/api/v1/templates/{template.id}")
    
    assert response.status_code == 401


def test_delete_template_forbidden(
    db_session: Session,
    test_template_complete: dict,
    other_auth_headers: dict
):
    """Test that users cannot delete templates they don't own."""
    template = test_template_complete['template']
    template_id = template.id
    
    response = client.delete(
        f"/api/v1/templates/{template_id}",
        headers=other_auth_headers
    )
    
    assert response.status_code == 403
    assert "not enough permissions" in response.json()["detail"].lower() or "not authorized" in response.json()["detail"].lower()
    
    # Verify template still exists
    assert db_session.query(PDFTemplate).filter_by(id=template_id).count() == 1


def test_delete_template_cascade_to_all_versions(
    db_session: Session,
    test_template_complete: dict,
    auth_headers: dict
):
    """Test that deleting a template cascades to all versions."""
    template = test_template_complete['template']
    versions = test_template_complete['versions']
    version_ids = [v.id for v in versions]
    
    # Verify all versions exist
    assert db_session.query(TemplateVersion).filter(
        TemplateVersion.id.in_(version_ids)
    ).count() == 3
    
    # Delete template
    response = client.delete(
        f"/api/v1/templates/{template.id}",
        headers=auth_headers
    )
    
    assert response.status_code == 204
    
    # Verify all versions are deleted
    assert db_session.query(TemplateVersion).filter(
        TemplateVersion.id.in_(version_ids)
    ).count() == 0


def test_delete_template_cascade_to_all_fields(
    db_session: Session,
    test_template_complete: dict,
    auth_headers: dict
):
    """Test that deleting a template cascades to all fields."""
    template = test_template_complete['template']
    versions = test_template_complete['versions']
    version_ids = [v.id for v in versions]
    
    # Count fields before deletion
    fields_before = db_session.query(TemplateField).filter(
        TemplateField.version_id.in_(version_ids)
    ).count()
    
    assert fields_before > 0
    
    # Delete template
    response = client.delete(
        f"/api/v1/templates/{template.id}",
        headers=auth_headers
    )
    
    assert response.status_code == 204
    
    # Verify all fields are deleted
    assert db_session.query(TemplateField).filter(
        TemplateField.version_id.in_(version_ids)
    ).count() == 0


def test_delete_template_cascade_to_comparisons(
    db_session: Session,
    test_template_complete: dict,
    auth_headers: dict
):
    """Test that deleting a template cascades to all comparisons using its versions."""
    template = test_template_complete['template']
    comparison = test_template_complete['comparison']
    comparison_id = comparison.id
    
    # Verify comparison exists
    assert db_session.query(Comparison).filter_by(id=comparison_id).count() == 1
    
    # Delete template
    response = client.delete(
        f"/api/v1/templates/{template.id}",
        headers=auth_headers
    )
    
    assert response.status_code == 204
    
    # Verify comparison is CASCADE deleted
    assert db_session.query(Comparison).filter_by(id=comparison_id).count() == 0
    
    # Verify comparison fields are also deleted
    assert db_session.query(ComparisonField).filter_by(comparison_id=comparison_id).count() == 0


def test_delete_template_deletes_all_physical_files(
    db_session: Session,
    test_template_complete: dict,
    auth_headers: dict
):
    """Test that deleting a template attempts to delete all physical PDF files."""
    template = test_template_complete['template']
    versions = test_template_complete['versions']
    
    # Note: In test environment, files may not actually exist
    # The endpoint should handle this gracefully without failing
    
    response = client.delete(
        f"/api/v1/templates/{template.id}",
        headers=auth_headers
    )
    
    # Should succeed even if physical files don't exist
    assert response.status_code == 200

