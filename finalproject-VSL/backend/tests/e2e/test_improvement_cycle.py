"""
E2E test: Complete human-in-the-loop improvement cycle.
"""
import pytest
import json
import uuid as uuid_lib
from unittest.mock import MagicMock, patch
from app.shared.models import PromptVersion, Feedback, FeedbackStatus

INITIAL_PROMPT = "You are a helpful customer service assistant. Be concise and friendly."
IMPROVED_PROMPT = (
    "You are a helpful customer service assistant. Be concise and friendly. "
    "Always ask the user for their order number when they mention delivery issues."
)

@pytest.fixture
def seed_initial_prompt(db):
    prompt = PromptVersion(version_number=1, content=INITIAL_PROMPT, is_active=True, created_by="system")
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt

def test_full_improvement_cycle(client, db, seed_initial_prompt):
    mock_chat = MagicMock()
    mock_chat.choices[0].message.content = "Your order is being processed. Please wait."

    with patch("app.modules.chatbot.router.client") as mock_openai:
        mock_openai.chat.completions.create.return_value = mock_chat
        chat_res = client.post("/api/v1/chat", json={
            "message": "I haven't received my order yet.",
            "session_id": "e2e-session-001",
            "user_identifier": "customer@example.com"
        })

    assert chat_res.status_code == 200
    conversation_id = chat_res.json()["conversation_id"]
    assistant_message_id = chat_res.json()["message_id"]

    conv_res = client.get(f"/api/v1/conversations/{conversation_id}")
    assert conv_res.status_code == 200
    assert len(conv_res.json()["messages"]) == 2

    feedback_res = client.post("/api/v1/feedback", json={
        "message_id": assistant_message_id,
        "admin_comment": "Bot should ask for order number first.",
        "expected_response": "Could you provide your order number?"
    })
    assert feedback_res.status_code == 201
    feedback_id = feedback_res.json()["id"]
    assert feedback_res.json()["status"] == "PENDING"

    mock_analysis = MagicMock()
    mock_analysis.choices[0].message.content = json.dumps({
        "root_cause": "PROMPT",
        "analysis": "The prompt does not instruct the bot to ask for order details.",
        "proposed_prompt": IMPROVED_PROMPT
    })

    with patch("app.modules.meta_agent.router.client") as mock_meta:
        mock_meta.chat.completions.create.return_value = mock_analysis
        analysis_res = client.post(f"/api/v1/feedback/{feedback_id}/analyse")

    assert analysis_res.status_code == 200
    assert analysis_res.json()["root_cause"] == "PROMPT"
    assert analysis_res.json()["proposed_prompt"] == IMPROVED_PROMPT

    db.expire_all()
    fb = db.query(Feedback).filter(Feedback.id == uuid_lib.UUID(feedback_id)).first()
    assert fb.status == FeedbackStatus.ANALYSED

    apply_res = client.post(f"/api/v1/feedback/{feedback_id}/apply")
    assert apply_res.status_code == 200
    assert apply_res.json()["new_version"] == 2

    prompts = client.get("/api/v1/prompts").json()
    assert len(prompts) == 2
    active = next(p for p in prompts if p["is_active"])
    assert active["version_number"] == 2
    assert active["content"] == IMPROVED_PROMPT
    assert active["feedback_analysis_id"] is not None

    db.expire_all()
    fb = db.query(Feedback).filter(Feedback.id == uuid_lib.UUID(feedback_id)).first()
    assert fb.status == FeedbackStatus.APPLIED

    active_res = client.get("/api/v1/prompts/active")
    assert active_res.json()["version_number"] == 2

    print("\n✅ E2E test passed: Full human-in-the-loop cycle verified")
