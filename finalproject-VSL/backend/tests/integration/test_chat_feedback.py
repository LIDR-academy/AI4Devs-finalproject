"""
Integration tests for chat and feedback endpoints.
OpenAI is mocked — no real API calls.
"""
import pytest
import json
from unittest.mock import MagicMock, patch
from app.shared.models import (
    Conversation, Message, MessageRole,
    Feedback, FeedbackStatus, FeedbackAnalysis, RootCause, PromptVersion
)


# ─── CHAT ENDPOINT ────────────────────────────────────────────────────────────

def test_chat_returns_response(client, seed_prompt):
    """POST /api/v1/chat must return a response from the bot."""
    mock_resp = MagicMock()
    mock_resp.choices[0].message.content = "Hello! How can I help?"

    with patch("app.modules.chatbot.router.client") as mock_openai:
        mock_openai.chat.completions.create.return_value = mock_resp

        res = client.post("/api/v1/chat", json={
            "message": "Hi there",
            "session_id": "test-session-001"
        })

    assert res.status_code == 200
    data = res.json()
    assert "response" in data
    assert data["response"] == "Hello! How can I help?"
    assert "message_id" in data
    assert "conversation_id" in data


def test_chat_creates_conversation(client, db, seed_prompt):
    """Chat must create a Conversation record in the DB."""
    mock_resp = MagicMock()
    mock_resp.choices[0].message.content = "Sure!"

    with patch("app.modules.chatbot.router.client") as mock_openai:
        mock_openai.chat.completions.create.return_value = mock_resp
        client.post("/api/v1/chat", json={
            "message": "Test message",
            "session_id": "session-abc"
        })

    convs = db.query(Conversation).filter(Conversation.session_id == "session-abc").all()
    assert len(convs) == 1


def test_chat_creates_two_messages(client, db, seed_prompt):
    """Chat must create both user and assistant messages."""
    mock_resp = MagicMock()
    mock_resp.choices[0].message.content = "Response"

    with patch("app.modules.chatbot.router.client") as mock_openai:
        mock_openai.chat.completions.create.return_value = mock_resp
        client.post("/api/v1/chat", json={
            "message": "Hello",
            "session_id": "session-xyz"
        })

    conv = db.query(Conversation).filter(Conversation.session_id == "session-xyz").first()
    assert conv is not None
    assert len(conv.messages) == 2
    assert conv.messages[0].role == MessageRole.user
    assert conv.messages[1].role == MessageRole.assistant


def test_chat_reuses_existing_session(client, db, seed_prompt):
    """Multiple messages with the same session_id reuse the same conversation."""
    mock_resp = MagicMock()
    mock_resp.choices[0].message.content = "OK"

    with patch("app.modules.chatbot.router.client") as mock_openai:
        mock_openai.chat.completions.create.return_value = mock_resp
        for _ in range(2):
            client.post("/api/v1/chat", json={
                "message": "Message",
                "session_id": "same-session"
            })

    convs = db.query(Conversation).filter(Conversation.session_id == "same-session").all()
    assert len(convs) == 1
    assert len(convs[0].messages) == 4  # 2 user + 2 assistant


# ─── FEEDBACK ENDPOINT ────────────────────────────────────────────────────────

def _create_conversation_with_assistant_message(db):
    """Helper: create a conversation with one assistant message."""
    conv = Conversation(session_id="test-session", user_identifier="test@test.com")
    db.add(conv)
    db.flush()

    user_msg = Message(conversation_id=conv.id, role=MessageRole.user, content="Hi")
    assistant_msg = Message(conversation_id=conv.id, role=MessageRole.assistant, content="Hello!")
    db.add_all([user_msg, assistant_msg])
    db.commit()
    db.refresh(assistant_msg)
    return assistant_msg


def test_create_feedback_success(client, db):
    """POST /api/v1/feedback must create a PENDING feedback."""
    msg = _create_conversation_with_assistant_message(db)

    res = client.post("/api/v1/feedback", json={
        "message_id": str(msg.id),
        "admin_comment": "Response was too vague",
        "expected_response": "A more specific answer"
    })

    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "PENDING"
    assert data["admin_comment"] == "Response was too vague"


def test_create_feedback_on_user_message_fails(client, db):
    """Cannot create feedback on a user message — only assistant messages."""
    conv = Conversation(session_id="s1")
    db.add(conv)
    db.flush()
    user_msg = Message(conversation_id=conv.id, role=MessageRole.user, content="Hi")
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    res = client.post("/api/v1/feedback", json={
        "message_id": str(user_msg.id),
        "admin_comment": "Wrong"
    })

    assert res.status_code == 400


def test_duplicate_feedback_fails(client, db):
    """Cannot create two feedbacks for the same message."""
    msg = _create_conversation_with_assistant_message(db)

    client.post("/api/v1/feedback", json={
        "message_id": str(msg.id),
        "admin_comment": "First feedback"
    })

    res = client.post("/api/v1/feedback", json={
        "message_id": str(msg.id),
        "admin_comment": "Second feedback"
    })

    assert res.status_code == 409


def test_list_feedback(client, db):
    """GET /api/v1/feedback must return a list."""
    msg = _create_conversation_with_assistant_message(db)
    client.post("/api/v1/feedback", json={
        "message_id": str(msg.id),
        "admin_comment": "Problem"
    })

    res = client.get("/api/v1/feedback")
    assert res.status_code == 200
    assert len(res.json()) >= 1


def test_list_conversations(client, db, seed_prompt):
    """GET /api/v1/conversations must return list."""
    mock_resp = MagicMock()
    mock_resp.choices[0].message.content = "Hi"

    with patch("app.modules.chatbot.router.client") as mock:
        mock.chat.completions.create.return_value = mock_resp
        client.post("/api/v1/chat", json={"message": "Hello", "session_id": "s1"})

    res = client.get("/api/v1/conversations")
    assert res.status_code == 200
    assert len(res.json()) >= 1


def test_get_conversation_detail(client, db, seed_prompt):
    """GET /api/v1/conversations/{id} must return messages."""
    mock_resp = MagicMock()
    mock_resp.choices[0].message.content = "Sure"

    with patch("app.modules.chatbot.router.client") as mock:
        mock.chat.completions.create.return_value = mock_resp
        chat_res = client.post("/api/v1/chat", json={"message": "Hello", "session_id": "s2"})

    conv_id = chat_res.json()["conversation_id"]
    res = client.get(f"/api/v1/conversations/{conv_id}")
    assert res.status_code == 200
    assert "messages" in res.json()
    assert len(res.json()["messages"]) == 2
