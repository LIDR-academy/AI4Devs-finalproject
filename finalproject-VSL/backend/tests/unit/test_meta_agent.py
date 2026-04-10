"""
Unit tests for the meta-agent module.
Tests the prompt building logic and root cause classification.
"""
import pytest
import json
from unittest.mock import MagicMock, patch


def test_build_meta_agent_prompt_includes_conversation():
    """The meta-agent prompt must include conversation messages."""
    from app.modules.meta_agent.router import build_meta_agent_prompt

    messages = [
        {"role": "user", "content": "What is the return policy?"},
        {"role": "assistant", "content": "I don't know."},
    ]
    result = build_meta_agent_prompt(
        current_prompt="You are a helpful assistant.",
        conversation_messages=messages,
        admin_comment="The bot should know the return policy.",
        expected_response="Our return policy is 30 days."
    )

    assert "What is the return policy?" in result
    assert "I don't know." in result
    assert "The bot should know the return policy." in result
    assert "Our return policy is 30 days." in result


def test_build_meta_agent_prompt_includes_current_prompt():
    """The meta-agent prompt must include the current system prompt."""
    from app.modules.meta_agent.router import build_meta_agent_prompt

    result = build_meta_agent_prompt(
        current_prompt="You are a shopping assistant.",
        conversation_messages=[],
        admin_comment="Bad response",
        expected_response=None
    )

    assert "You are a shopping assistant." in result


def test_build_meta_agent_prompt_no_expected_response():
    """Expected response is optional — prompt should still build correctly."""
    from app.modules.meta_agent.router import build_meta_agent_prompt

    result = build_meta_agent_prompt(
        current_prompt="You are helpful.",
        conversation_messages=[{"role": "user", "content": "Hi"}],
        admin_comment="Too short",
        expected_response=None
    )

    assert "Too short" in result
    assert result is not None
    assert len(result) > 0


def test_meta_agent_system_prompt_requires_json():
    """The meta-agent system prompt must instruct to return JSON only."""
    from app.modules.meta_agent.router import META_AGENT_SYSTEM_PROMPT

    assert "JSON" in META_AGENT_SYSTEM_PROMPT
    assert "root_cause" in META_AGENT_SYSTEM_PROMPT
    assert "proposed_prompt" in META_AGENT_SYSTEM_PROMPT


def test_root_cause_enum_values():
    """RootCause enum must have the 4 expected values."""
    from app.shared.models import RootCause

    assert RootCause.PROMPT == "PROMPT"
    assert RootCause.EXTERNAL_DATA == "EXTERNAL_DATA"
    assert RootCause.WORKFLOW == "WORKFLOW"
    assert RootCause.UNKNOWN == "UNKNOWN"


def test_feedback_status_transitions():
    """FeedbackStatus enum must have the 4 expected states."""
    from app.shared.models import FeedbackStatus

    assert FeedbackStatus.PENDING == "PENDING"
    assert FeedbackStatus.ANALYSED == "ANALYSED"
    assert FeedbackStatus.APPLIED == "APPLIED"
    assert FeedbackStatus.REJECTED == "REJECTED"


def test_prompt_version_model_fields():
    """PromptVersion model must have all required fields."""
    from app.shared.models import PromptVersion
    columns = [c.key for c in PromptVersion.__table__.columns]

    assert "id" in columns
    assert "version_number" in columns
    assert "content" in columns
    assert "is_active" in columns
    assert "feedback_analysis_id" in columns
    assert "created_by" in columns
