import io
import json
import logging
from unittest.mock import Mock, patch

from app.core.logging import get_logger


class TestGetLogger:
    """Test suite for get_logger function."""
    
    def test_get_logger_returns_logger_instance(self):
        """Test that get_logger() returns a Python logger instance."""
        # Act
        logger = get_logger()
        
        # Assert
        assert isinstance(logger, logging.Logger)
        assert logger.name == "app"
    
    def test_logger_respects_environment_log_level(self):
        """Test that logger level matches settings.log_level."""
        # Test with different log levels
        test_cases = [
            ("DEBUG", logging.DEBUG),
            ("INFO", logging.INFO),
            ("WARNING", logging.WARNING),
            ("ERROR", logging.ERROR),
            ("CRITICAL", logging.CRITICAL),
        ]
        
        for log_level_str, expected_level in test_cases:
            # Arrange - create mock settings
            mock_settings = Mock()
            mock_settings.log_level = log_level_str
            
            with patch('app.core.logging.get_settings', return_value=mock_settings):
                # Act
                logger = get_logger()
                
                # Assert
                assert logger.level == expected_level, f"Logger level should be {expected_level} for LOG_LEVEL={log_level_str}"
    
    def test_development_format_is_human_readable(self):
        """Test that when DEBUG=true, log format is human-readable."""
        # Arrange
        mock_settings = Mock()
        mock_settings.log_level = "INFO"
        mock_settings.debug = True
        
        # Create a string stream to capture log output
        log_stream = io.StringIO()
        
        with patch('app.core.logging.get_settings', return_value=mock_settings):
            # Get logger - ensure it's a fresh logger without handlers
            logger_name = "test_dev_logger"
            # Remove any existing handlers
            existing_logger = logging.getLogger(logger_name)
            existing_logger.handlers.clear()
            
            # Now get our configured logger
            logger = get_logger(logger_name)
            
            # Replace the handler's stream with our test stream
            if logger.handlers:
                handler = logger.handlers[0]
                handler.stream = log_stream
            
            # Act - log a test message
            test_message = "Test log message"
            logger.info(test_message)
            
            # Assert
            log_output = log_stream.getvalue()
            assert test_message in log_output
            # Human-readable format should include timestamp and level
            assert "INFO" in log_output
            # Should NOT be JSON
            try:
                json.loads(log_output.strip())
                assert False, "Development logs should not be JSON formatted"
            except json.JSONDecodeError:
                # Expected - not JSON format
                pass
    
    def test_production_format_is_json(self):
        """Test that when DEBUG=false, log format is JSON."""
        # Arrange
        mock_settings = Mock()
        mock_settings.log_level = "INFO"
        mock_settings.debug = False
        
        # Create a string stream to capture log output
        log_stream = io.StringIO()
        
        with patch('app.core.logging.get_settings', return_value=mock_settings):
            # Get logger - ensure it's a fresh logger without handlers
            logger_name = "test_prod_logger"
            # Remove any existing handlers
            existing_logger = logging.getLogger(logger_name)
            existing_logger.handlers.clear()
            
            # Now get our configured logger
            logger = get_logger(logger_name)
            
            # Replace the handler's stream with our test stream
            if logger.handlers:
                handler = logger.handlers[0]
                handler.stream = log_stream
            
            # Act - log a test message
            test_message = "Test log message"
            logger.info(test_message)
            
            # Assert
            log_output = log_stream.getvalue().strip()
            # Should be valid JSON
            try:
                log_data = json.loads(log_output)
                assert "message" in log_data
                assert log_data["message"] == test_message
                assert "level" in log_data
                assert log_data["level"] == "INFO"
                assert "timestamp" in log_data
                assert "logger" in log_data
                assert log_data["logger"] == logger_name
            except json.JSONDecodeError:
                assert False, f"Production logs should be JSON formatted. Got: {log_output}"
