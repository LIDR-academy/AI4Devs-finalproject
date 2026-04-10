"""
Unit tests for prompt versioning module.
"""
import pytest
from app.shared.models import PromptVersion


def test_only_one_active_prompt(db):
    """There should never be more than one active prompt at a time."""
    p1 = PromptVersion(version_number=1, content="Prompt 1", is_active=False, created_by="system")
    p2 = PromptVersion(version_number=2, content="Prompt 2", is_active=True, created_by="admin")
    db.add_all([p1, p2])
    db.commit()

    active = db.query(PromptVersion).filter(PromptVersion.is_active == True).all()
    assert len(active) == 1
    assert active[0].version_number == 2


def test_prompt_version_number_increments(db):
    """Version numbers should be sequential."""
    for i in range(1, 4):
        p = PromptVersion(version_number=i, content=f"Prompt {i}", is_active=(i == 3), created_by="system")
        db.add(p)
    db.commit()

    prompts = db.query(PromptVersion).order_by(PromptVersion.version_number).all()
    assert [p.version_number for p in prompts] == [1, 2, 3]


def test_get_active_prompt_endpoint(client, seed_prompt):
    """GET /api/v1/prompts/active must return the active prompt."""
    res = client.get("/api/v1/prompts/active")
    assert res.status_code == 200
    data = res.json()
    assert data["is_active"] is True
    assert data["version_number"] == 1


def test_list_prompts_endpoint(client, seed_prompt):
    """GET /api/v1/prompts must return a list."""
    res = client.get("/api/v1/prompts")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_activate_prompt_endpoint(client, db):
    """POST /api/v1/prompts/{id}/activate must switch active version."""
    p1 = PromptVersion(version_number=1, content="Old prompt", is_active=True, created_by="system")
    p2 = PromptVersion(version_number=2, content="New prompt", is_active=False, created_by="admin")
    db.add_all([p1, p2])
    db.commit()
    db.refresh(p1)
    db.refresh(p2)

    res = client.post(f"/api/v1/prompts/{p1.id}/activate")
    assert res.status_code == 200

    db.expire_all()
    active = db.query(PromptVersion).filter(PromptVersion.is_active == True).all()
    assert len(active) == 1
    assert str(active[0].id) == str(p1.id)
