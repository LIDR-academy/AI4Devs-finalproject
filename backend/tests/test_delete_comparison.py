"""
Tests for DELETE /api/v1/comparisons/{comparison_id} endpoint.

These tests verify the deletion of comparisons with proper authorization
checks, CASCADE deletion, and activity logging.
"""

import pytest
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
def test_comparison(db_session: Session, test_user: User) -> Comparison:
    """Create a test comparison with versions and fields."""
    # Create template
    template = PDFTemplate(
        name="Test Template",
        current_version="v2",
        uploaded_by=test_user.id
    )
    db_session.add(template)
    db_session.flush()
    
    # Create versions
    version1 = TemplateVersion(
        template_id=template.id,
        version_number="v1",
        is_current=False,
        file_path="/test/v1.pdf",
        file_size_bytes=1000,
        field_count=2,
        page_count=1
    )
    version2 = TemplateVersion(
        template_id=template.id,
        version_number="v2",
        is_current=True,
        file_path="/test/v2.pdf",
        file_size_bytes=1500,
        field_count=3,
        page_count=1
    )
    db_session.add_all([version1, version2])
    db_session.flush()
    
    # Create comparison
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
    
    # Create comparison fields
    comp_field = ComparisonField(
        comparison_id=comparison.id,
        field_id="field3",
        status="ADDED",
        field_type="text",
        target_page_number=1
    )
    db_session.add(comp_field)
    db_session.commit()
    db_session.refresh(comparison)
    
    return comparison


def test_delete_comparison_success(
    db_session: Session,
    test_comparison: Comparison,
    auth_headers: dict
):
    """Test successful deletion of a comparison."""
    comparison_id = test_comparison.id
    
    # Verify comparison and field exist before deletion
    assert db_session.query(Comparison).filter_by(id=comparison_id).count() == 1
    assert db_session.query(ComparisonField).filter_by(comparison_id=comparison_id).count() == 1
    
    # Delete comparison
    response = client.delete(
        f"/api/v1/comparisons/{comparison_id}",
        headers=auth_headers
    )
    
    # Verify response
    assert response.status_code == 204
    assert response.content == b''
    
    # Verify comparison is deleted
    assert db_session.query(Comparison).filter_by(id=comparison_id).count() == 0
    
    # Verify comparison fields are CASCADE deleted
    assert db_session.query(ComparisonField).filter_by(comparison_id=comparison_id).count() == 0


def test_delete_comparison_logs_activity(
    db_session: Session,
    test_comparison: Comparison,
    test_user: User,
    auth_headers: dict
):
    """Test that deleting a comparison logs an activity."""
    comparison_id = test_comparison.id
    
    # Count activities before deletion
    activities_before = db_session.query(Activity).filter_by(
        activity_type=ActivityType.COMPARISON_DELETED.value
    ).count()
    
    # Delete comparison
    response = client.delete(
        f"/api/v1/comparisons/{comparison_id}",
        headers=auth_headers
    )
    
    assert response.status_code == 204
    
    # Verify activity was logged
    activities_after = db_session.query(Activity).filter_by(
        activity_type=ActivityType.COMPARISON_DELETED.value
    ).count()
    
    assert activities_after == activities_before + 1
    
    # Verify activity details
    activity = db_session.query(Activity).filter_by(
        activity_type=ActivityType.COMPARISON_DELETED.value
    ).order_by(Activity.timestamp.desc()).first()
    
    assert activity is not None
    assert activity.user_id == test_user.id
    assert str(comparison_id) in str(activity.entity_id)
    assert "deleted" in activity.description.lower()


def test_delete_comparison_not_found(
    db_session: Session,
    auth_headers: dict
):
    """Test deleting a non-existent comparison."""
    response = client.delete(
        "/api/v1/comparisons/99999",
        headers=auth_headers
    )
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_delete_comparison_unauthorized(
    db_session: Session,
    test_comparison: Comparison
):
    """Test deleting a comparison without authentication."""
    response = client.delete(f"/api/v1/comparisons/{test_comparison.id}")
    
    assert response.status_code == 401


def test_delete_comparison_forbidden(
    db_session: Session,
    test_comparison: Comparison,
    other_auth_headers: dict
):
    """Test that users cannot delete comparisons they don't own."""
    response = client.delete(
        f"/api/v1/comparisons/{test_comparison.id}",
        headers=other_auth_headers
    )
    
    assert response.status_code == 403
    assert "not authorized" in response.json()["detail"].lower()
    
    # Verify comparison still exists
    assert db_session.query(Comparison).filter_by(id=test_comparison.id).count() == 1


def test_delete_comparison_cascade_to_fields(
    db_session: Session,
    test_comparison: Comparison,
    auth_headers: dict
):
    """Test that deleting a comparison cascades to comparison_fields."""
    comparison_id = test_comparison.id
    
    # Add more comparison fields
    for i in range(5):
        field = ComparisonField(
            comparison_id=comparison_id,
            field_id=f"field_{i}",
            status="MODIFIED",
            field_type="text",
            source_page_number=1,
            target_page_number=1
        )
        db_session.add(field)
    db_session.commit()
    
    # Verify we have 6 fields (1 from fixture + 5 new)
    assert db_session.query(ComparisonField).filter_by(comparison_id=comparison_id).count() == 6
    
    # Delete comparison
    response = client.delete(
        f"/api/v1/comparisons/{comparison_id}",
        headers=auth_headers
    )
    
    assert response.status_code == 204
    
    # Verify all comparison fields are deleted
    assert db_session.query(ComparisonField).filter_by(comparison_id=comparison_id).count() == 0


def test_delete_comparison_does_not_delete_versions(
    db_session: Session,
    test_comparison: Comparison,
    auth_headers: dict
):
    """Test that deleting a comparison does NOT delete the template versions."""
    source_version_id = test_comparison.source_version_id
    target_version_id = test_comparison.target_version_id
    
    # Delete comparison
    response = client.delete(
        f"/api/v1/comparisons/{test_comparison.id}",
        headers=auth_headers
    )
    
    assert response.status_code == 204
    
    # Verify versions still exist
    assert db_session.query(TemplateVersion).filter_by(id=source_version_id).count() == 1
    assert db_session.query(TemplateVersion).filter_by(id=target_version_id).count() == 1

