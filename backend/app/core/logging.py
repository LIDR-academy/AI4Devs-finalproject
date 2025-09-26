import json
import logging
from datetime import datetime
from typing import Any, Dict

from app.core.config import get_settings


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging in production."""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON."""
        log_data: Dict[str, Any] = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        # Add extra fields if present
        if hasattr(record, "extra"):
            log_data.update(record.extra)
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)


def get_logger(name: str = "app") -> logging.Logger:
    """
    Get a logger instance with the specified name.
    
    Args:
        name: The name of the logger. Defaults to "app".
        
    Returns:
        A Python logger instance configured with the application's log level
        and appropriate formatter based on debug mode.
    """
    settings = get_settings()
    logger = logging.getLogger(name)
    
    # Convert string log level to logging constant
    log_level = getattr(logging, settings.log_level.upper())
    logger.setLevel(log_level)
    
    # Configure handler with appropriate formatter if not already configured
    if not logger.handlers:
        handler = logging.StreamHandler()
        
        if settings.debug:
            # Human-readable format for development
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
        else:
            # JSON format for production
            formatter = JSONFormatter()
        
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    
    return logger
