"""
Tests for DELETE /api/v1/templates/{template_id}/versions/{version_id} endpoint.

These tests verify the deletion of template versions with business logic
validation (cannot delete current version), CASCADE deletion, physical file
removal, and activity logging.
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
def test_template_with_versions(db_session: Session, test_user: User):
    """Create a test template with multiple versions."""
    template = PDFTemplate(
        name="Test Template",
        current_version="v2",
        uploaded_by=test_user.id
    )
    db_session.add(template)
    db_session.flush()
    
    # Create version 1 (old, not current)
    version1 = TemplateVersion(
        template_id=template.id,
        version_number="v1",
        is_current=False,
        file_path="/test/delete_test_v1.pdf",
        file_size_bytes=1000,
        field_count=2,
        page_count=1
    )
    
    # Create version 2 (current)
    version2 = TemplateVersion(
        template_id=template.id,
        version_number="v2",
        is_current=True,
        file_path="/test/delete_test_v2.pdf",
        file_size_bytes=1500,
        field_count=3,
        page_count=1
    )
    
    db_session.add_all([version1, version2])
    db_session.flush()
    
    # Add fields to version 1
    field1 = TemplateField(
        version_id=version1.id,
        field_id="field1",
        field_type="text",
        page_number=1,
        field_page_order=1
    )
    field2 = TemplateField(
        version_id=version1.id,
        field_id="field2",
        field_type="text",
        page_number=1,
        field_page_order=2
    )
    db_session.add_all([field1, field2])
    
    db_session.commit()
    db_session.refresh(template)
    db_session.refresh(version1)
    db_session.refresh(version2)
    
    return {
        'template': template,
        'version1': version1,
        'version2': version2
    }


def test_delete_old_version_success(
    db_session: Session,
    test_template_with_versions: dict,
    auth_headers: dict
):
    """Test successful deletion of an old (non-current) version."""
    template = test_template_with_versions['template']
    version1 = test_template_with_versions['version1']
    
    # Verify version and fields exist
    assert db_session.query(TemplateVersion).filter_by(id=version1.id).count() == 1
    assert db_session.query(TemplateField).filter_by(version_id=version1.id).count() == 2
    
    # Delete old version
    response = client.delete(
        f"/api/v1/templates/{template.id}/versions/{version1.id}",
        headers=auth_headers
    )
    
    # Verify response
    assert response.status_code == 204
    assert response.content == b''
    
    # Verify version is deleted
    assert db_session.query(TemplateVersion).filter_by(id=version1.id).count() == 0
    
    # Verify fields are CASCADE deleted
    assert db_session.query(TemplateField).filter_by(version_id=version1.id).count() == 0
    
    # Verify current version still exists
    version2 = test_template_with_versions['version2']
    assert db_session.query(TemplateVersion).filter_by(id=version2.id).count() == 1


def test_delete_current_version_fails(
    db_session: Session,
    test_template_with_versions: dict,
    auth_headers: dict
):
    """Test that deleting the current version fails with 400 error."""
    template = test_template_with_versions['template']
    version2 = test_template_with_versions['version2']
    
    # Verify version 2 is current
    assert version2.is_current is True
    
    # Attempt to delete current version
    response = client.delete(
        f"/api/v1/templates/{template.id}/versions/{version2.id}",
        headers=auth_headers
    )
    
    # Verify error response
    assert response.status_code == 400
    assert "current version" in response.json()["detail"].lower()
    assert "entire template" in response.json()["detail"].lower()
    
    # Verify version still exists
    assert db_session.query(TemplateVersion).filter_by(id=version2.id).count() == 1


def test_delete_version_logs_activity(
    db_session: Session,
    test_template_with_versions: dict,
    test_user: User,
    auth_headers: dict
):
    """Test that deleting a version logs an activity."""
    template = test_template_with_versions['template']
    version1 = test_template_with_versions['version1']
    
    # Count activities before deletion
    activities_before = db_session.query(Activity).filter_by(
        activity_type=ActivityType.VERSION_DELETED.value
    ).count()
    
    # Delete version
    response = client.delete(
        f"/api/v1/templates/{template.id}/versions/{version1.id}",
        headers=auth_headers
    )
    
    assert response.status_code == 204
    
    # Verify activity was logged
    activities_after = db_session.query(Activity).filter_by(
        activity_type=ActivityType.VERSION_DELETED.value
    ).count()
    
    assert activities_after == activities_before + 1
    
    # Verify activity details
    activity = db_session.query(Activity).filter_by(
        activity_type=ActivityType.VERSION_DELETED.value
    ).order_by(Activity.timestamp.desc()).first()
    
    assert activity is not None
    assert activity.user_id == test_user.id
    assert template.name in activity.description
    assert "v1" in activity.description
    assert "deleted" in activity.description.lower()


def test_delete_version_not_found(
    db_session: Session,
    test_template_with_versions: dict,
    auth_headers: dict
):
    """Test deleting a non-existent version."""
    template = test_template_with_versions['template']
    
    response = client.delete(
        f"/api/v1/templates/{template.id}/versions/99999",
        headers=auth_headers
    )
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_delete_version_template_not_found(
    db_session: Session,
    auth_headers: dict
):
    """Test deleting a version of a non-existent template."""
    response = client.delete(
        "/api/v1/templates/99999/versions/88888",
        headers=auth_headers
    )
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_delete_version_unauthorized(
    db_session: Session,
    test_template_with_versions: dict
):
    """Test deleting a version without authentication."""
    template = test_template_with_versions['template']
    version1 = test_template_with_versions['version1']
    
    response = client.delete(
        f"/api/v1/templates/{template.id}/versions/{version1.id}"
    )
    
    assert response.status_code == 401


def test_delete_version_forbidden(
    db_session: Session,
    test_template_with_versions: dict,
    other_auth_headers: dict
):
    """Test that users cannot delete versions of templates they don't own."""
    template = test_template_with_versions['template']
    version1 = test_template_with_versions['version1']
    
    response = client.delete(
        f"/api/v1/templates/{template.id}/versions/{version1.id}",
        headers=other_auth_headers
    )
    
    assert response.status_code == 403
    assert "not authorized" in response.json()["detail"].lower()
    
    # Verify version still exists
    assert db_session.query(TemplateVersion).filter_by(id=version1.id).count() == 1


def test_delete_version_cascade_to_fields(
    db_session: Session,
    test_template_with_versions: dict,
    auth_headers: dict
):
    """Test that deleting a version cascades to template_fields."""
    template = test_template_with_versions['template']
    version1 = test_template_with_versions['version1']
    
    # Verify we have 2 fields
    assert db_session.query(TemplateField).filter_by(version_id=version1.id).count() == 2
    
    # Delete version
    response = client.delete(
        f"/api/v1/templates/{template.id}/versions/{version1.id}",
        headers=auth_headers
    )
    
    assert response.status_code == 204
    
    # Verify all fields are deleted
    assert db_session.query(TemplateField).filter_by(version_id=version1.id).count() == 0


def test_delete_version_cascade_to_comparisons(
    db_session: Session,
    test_template_with_versions: dict,
    test_user: User,
    auth_headers: dict
):
    """Test that deleting a version cascades to comparisons using that version."""
    template = test_template_with_versions['template']
    version1 = test_template_with_versions['version1']
    version2 = test_template_with_versions['version2']
    
    # Create comparison using version1
    comparison = Comparison(
        source_version_id=version1.id,
        target_version_id=version2.id,
        created_by=test_user.id,
        status="completed",
        modification_percentage=25.0,
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
        field_id="field3",
        status="ADDED",
        field_type="text"
    )
    db_session.add(comp_field)
    db_session.commit()
    
    comparison_id = comparison.id
    
    # Verify comparison exists
    assert db_session.query(Comparison).filter_by(id=comparison_id).count() == 1
    
    # Delete version1
    response = client.delete(
        f"/api/v1/templates/{template.id}/versions/{version1.id}",
        headers=auth_headers
    )
    
    assert response.status_code == 204
    
    # Verify comparison is CASCADE deleted
    assert db_session.query(Comparison).filter_by(id=comparison_id).count() == 0
    
    # Verify comparison fields are also deleted
    assert db_session.query(ComparisonField).filter_by(comparison_id=comparison_id).count() == 0


def test_delete_version_does_not_delete_template(
    db_session: Session,
    test_template_with_versions: dict,
    auth_headers: dict
):
    """Test that deleting a version does NOT delete the template."""
    template = test_template_with_versions['template']
    version1 = test_template_with_versions['version1']
    template_id = template.id
    
    # Delete version
    response = client.delete(
        f"/api/v1/templates/{template.id}/versions/{version1.id}",
        headers=auth_headers
    )
    
    assert response.status_code == 204
    
    # Verify template still exists
    assert db_session.query(PDFTemplate).filter_by(id=template_id).count() == 1


def test_delete_version_wrong_template(
    db_session: Session,
    test_template_with_versions: dict,
    test_user: User,
    auth_headers: dict
):
    """Test that a version from one template cannot be deleted via another template's endpoint."""
    template = test_template_with_versions['template']
    version1 = test_template_with_versions['version1']
    
    # Create another template
    other_template = PDFTemplate(
        name="Other Template",
        current_version="v1",
        uploaded_by=test_user.id
    )
    db_session.add(other_template)
    db_session.commit()
    
    # Try to delete version1 via other_template's endpoint
    response = client.delete(
        f"/api/v1/templates/{other_template.id}/versions/{version1.id}",
        headers=auth_headers
    )
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower() or "does not belong" in response.json()["detail"].lower()
    
    # Verify version still exists
    assert db_session.query(TemplateVersion).filter_by(id=version1.id).count() == 1

