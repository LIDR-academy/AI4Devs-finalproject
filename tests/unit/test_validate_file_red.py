import pytest


def test_validate_file_contract_placeholder():
    """
    GREEN test: validate_file task exists and has placeholder implementation
    
    This test verifies the Celery task `validate_file` is present and callable,
    and that it raises NotImplementedError as expected for T-023-TEST phase.
    Full implementation will come in T-024-AGENT.
    """
    from src.agent.tasks import validate_file

    # Basic sanity: function should be present and callable
    assert callable(validate_file), "validate_file must be callable"
    
    # Verify placeholder behavior: should raise NotImplementedError
    # when called (implementation pending T-024-AGENT)
    with pytest.raises(NotImplementedError, match="Placeholder for T-024-AGENT"):
        # Call the actual task function (not .delay() which enqueues)
        validate_file("test-part-id", "test-s3-key")
