"""
Integration tests for meta-agent analyse, apply and reject endpoints.
OpenAI is fully mocked.
"""
import pytest
import json
from unittest.mock import MagicMock, patch
from app.shared.models import (
    Conversation, Message, MessageRole,
    Feedback, FeedbackStatus, FeedbackAnalysis, RootCause, PromptVersion
)


def _setup_feedback_scenario(db, root_cause="PROMPT"):
    """Helper: full scenario with conversation + feedback ready to analyse."""
    # Active prompt
    prompt = PromptVersion(
        version_number=1,
        content="You are a helpful assistant.",
        is_active=True,
        created_by="system"
    )
    db.add(prompt)

    # Conversation
    conv = Conversation(session_id="test-s", user_identifier="u@u.com")
    db.add(conv)
    db.flush()

    user_msg = Message(conversation_id=conv.id, role=MessageRole.user, content="What is your return policy?")
    assistant_msg = Message(conversation_id=conv.id, role=MessageRole.assistant, content="I don't know.")
    db.add_all([user_msg, assistant_msg])
    db.flush()

    feedback = Feedback(
        message_id=assistant_msg.id,
        admin_comment="Bot should know the return policy",
        expected_response="Our return policy is 30 days.",
        status=FeedbackStatus.PENDING
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback, prompt


def _mock_openai_analysis(root_cause="PROMPT", proposed_prompt="Improved prompt here."):
    """Build a mock OpenAI response for meta-agent analysis."""
    mock_resp = MagicMock()
    mock_resp.choices[0].message.content = json.dumps({
        "root_cause": root_cause,
        "analysis": "The prompt lacks information about return policy.",
        "proposed_prompt": proposed_prompt if root_cause == "PROMPT" else None
    })
    return mock_resp


def test_analyse_feedback_returns_analysis(client, db):
    """POST /feedback/{id}/analyse must return analysis with root_cause."""
    feedback, _ = _setup_feedback_scenario(db)

    with patch("app.modules.meta_agent.router.client") as mock_openai:
        mock_openai.chat.completions.create.return_value = _mock_openai_analysis()

        res = client.post(f"/api/v1/feedback/{feedback.id}/analyse")

    assert res.status_code == 200
    data = res.json()
    assert data["root_cause"] == "PROMPT"
    assert "analysis" in data
    assert data["proposed_prompt"] is not None


def test_analyse_changes_feedback_status_to_analysed(client, db):
    """After analysis, feedback status must be ANALYSED."""
    feedback, _ = _setup_feedback_scenario(db)

    with patch("app.modules.meta_agent.router.client") as mock_openai:
        mock_openai.chat.completions.create.return_value = _mock_openai_analysis()
        client.post(f"/api/v1/feedback/{feedback.id}/analyse")

    db.expire_all()
    updated = db.query(Feedback).filter(Feedback.id == feedback.id).first()
    assert updated.status == FeedbackStatus.ANALYSED


def test_analyse_is_idempotent(client, db):
    """Calling analyse twice returns the same result without calling OpenAI again."""
    feedback, _ = _setup_feedback_scenario(db)

    with patch("app.modules.meta_agent.router.client") as mock_openai:
        mock_openai.chat.completions.create.return_value = _mock_openai_analysis()
        client.post(f"/api/v1/feedback/{feedback.id}/analyse")

    # Second call — OpenAI should NOT be called again
    with patch("app.modules.meta_agent.router.client") as mock_openai2:
        mock_openai2.chat.completions.create.return_value = _mock_openai_analysis()
        res = client.post(f"/api/v1/feedback/{feedback.id}/analyse")
        mock_openai2.chat.completions.create.assert_not_called()

    assert res.status_code == 200


def test_apply_proposal_creates_new_prompt_version(client, db):
    """POST /feedback/{id}/apply must create a new active prompt version."""
    feedback, old_prompt = _setup_feedback_scenario(db)

    with patch("app.modules.meta_agent.router.client") as mock_openai:
        mock_openai.chat.completions.create.return_value = _mock_openai_analysis(
            proposed_prompt="You are a helpful assistant. Return policy is 30 days."
        )
        client.post(f"/api/v1/feedback/{feedback.id}/analyse")

    res = client.post(f"/api/v1/feedback/{feedback.id}/apply")
    assert res.status_code == 200
    assert res.json()["new_version"] == 2

    db.expire_all()
    active = db.query(PromptVersion).filter(PromptVersion.is_active == True).first()
    assert active.version_number == 2
    assert "Return policy" in active.content


def test_apply_deactivates_old_prompt(client, db):
    """After apply, the old prompt must be inactive."""
    feedback, old_prompt = _setup_feedback_scenario(db)

    with patch("app.modules.meta_agent.router.client") as mock_openai:
        mock_openai.chat.completions.create.return_value = _mock_openai_analysis()
        client.post(f"/api/v1/feedback/{feedback.id}/analyse")
        client.post(f"/api/v1/feedback/{feedback.id}/apply")

    db.expire_all()
    old = db.query(PromptVersion).filter(PromptVersion.id == old_prompt.id).first()
    assert old.is_active is False


def test_reject_proposal_keeps_prompt_unchanged(client, db):
    """POST /feedback/{id}/reject must not change any prompt."""
    feedback, old_prompt = _setup_feedback_scenario(db)

    with patch("app.modules.meta_agent.router.client") as mock_openai:
        mock_openai.chat.completions.create.return_value = _mock_openai_analysis()
        client.post(f"/api/v1/feedback/{feedback.id}/analyse")

    res = client.post(f"/api/v1/feedback/{feedback.id}/reject")
    assert res.status_code == 200

    db.expire_all()
    prompts = db.query(PromptVersion).all()
    assert len(prompts) == 1  # No new prompt created

    fb = db.query(Feedback).filter(Feedback.id == feedback.id).first()
    assert fb.status == FeedbackStatus.REJECTED


def test_apply_without_analysis_fails(client, db):
    """Cannot apply a proposal if feedback is still PENDING."""
    feedback, _ = _setup_feedback_scenario(db)

    res = client.post(f"/api/v1/feedback/{feedback.id}/apply")
    assert res.status_code == 400


def test_analyse_nonexistent_feedback_returns_404(client, db):
    """Analysing a non-existent feedback must return 404."""
    res = client.post("/api/v1/feedback/00000000-0000-0000-0000-000000000000/analyse")
    assert res.status_code == 404
