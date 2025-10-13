"""
Tests for the configuration management system.

This module contains tests for the Pydantic Settings configuration,
environment variable loading, and validation.
"""

import os
import pytest
from unittest.mock import patch
from pydantic import ValidationError

from app.core.config import Settings, get_settings


@pytest.mark.unit
class TestSettingsDefaultValues:
    """Test cases for default configuration values."""
    
    def test_default_app_name(self):
        """Test that the default app name is set correctly."""
        settings = Settings()
        assert settings.app_name == "Personal Finance Tracker API"
    
    def test_default_debug_mode(self):
        """Test that debug mode defaults to False."""
        settings = Settings()
        assert settings.debug is False
    
    def test_default_log_level(self):
        """Test that log level defaults to INFO."""
        settings = Settings()
        assert settings.log_level == "INFO"
    
    def test_default_api_prefix(self):
        """Test that API v1 prefix defaults to /api/v1."""
        settings = Settings()
        assert settings.api_v1_prefix == "/api/v1"
    
    def test_default_server_settings(self):
        """Test that server settings have correct defaults."""
        settings = Settings()
        assert settings.host == "0.0.0.0"
        assert settings.port == 8000
    
    def test_default_cors_settings(self):
        """Test that CORS settings have correct defaults."""
        settings = Settings()
        assert settings.cors_origins == ["*"]
        assert settings.cors_allow_credentials is True
        assert settings.cors_allow_methods == ["*"]
        assert settings.cors_allow_headers == ["*"]


@pytest.mark.unit
class TestSettingsEnvironmentVariables:
    """Test cases for environment variable loading."""
    
    def test_app_name_from_env(self):
        """Test that app name can be set from environment variable."""
        with patch.dict(os.environ, {"APP_NAME": "Test API"}):
            settings = Settings()
            assert settings.app_name == "Test API"
    
    def test_debug_from_env(self):
        """Test that debug mode can be set from environment variable."""
        with patch.dict(os.environ, {"DEBUG": "true"}):
            settings = Settings()
            assert settings.debug is True
        
        with patch.dict(os.environ, {"DEBUG": "false"}):
            settings = Settings()
            assert settings.debug is False
    
    def test_log_level_from_env(self):
        """Test that log level can be set from environment variable."""
        with patch.dict(os.environ, {"LOG_LEVEL": "DEBUG"}):
            settings = Settings()
            assert settings.log_level == "DEBUG"
        
        with patch.dict(os.environ, {"LOG_LEVEL": "ERROR"}):
            settings = Settings()
            assert settings.log_level == "ERROR"
    
    def test_api_prefix_from_env(self):
        """Test that API prefix can be set from environment variable."""
        with patch.dict(os.environ, {"API_V1_PREFIX": "/api/v2"}):
            settings = Settings()
            assert settings.api_v1_prefix == "/api/v2"
    
    def test_server_settings_from_env(self):
        """Test that server settings can be set from environment variables."""
        with patch.dict(os.environ, {"HOST": "127.0.0.1", "PORT": "9000"}):
            settings = Settings()
            assert settings.host == "127.0.0.1"
            assert settings.port == 9000
    
    def test_cors_origins_from_env(self):
        """Test that CORS origins can be set from environment variable."""
        with patch.dict(os.environ, {"CORS_ORIGINS": "http://localhost:3000,https://example.com"}):
            settings = Settings()
            assert settings.cors_origins == ["http://localhost:3000", "https://example.com"]
    
    def test_cors_credentials_from_env(self):
        """Test that CORS credentials can be set from environment variable."""
        with patch.dict(os.environ, {"CORS_ALLOW_CREDENTIALS": "false"}):
            settings = Settings()
            assert settings.cors_allow_credentials is False


@pytest.mark.unit
class TestSettingsValidation:
    """Test cases for configuration validation."""
    
    def test_invalid_log_level_raises_error(self):
        """Test that invalid log level raises ValidationError."""
        with patch.dict(os.environ, {"LOG_LEVEL": "INVALID"}):
            with pytest.raises(ValidationError) as exc_info:
                Settings()
            
            # Check that the error message contains information about the invalid value
            error_messages = str(exc_info.value)
            assert "INVALID" in error_messages
    
    def test_invalid_port_raises_error(self):
        """Test that invalid port number raises ValidationError."""
        with patch.dict(os.environ, {"PORT": "invalid"}):
            with pytest.raises(ValidationError) as exc_info:
                Settings()
            
            error_messages = str(exc_info.value)
            assert "invalid" in error_messages
    
    def test_negative_port_raises_error(self):
        """Test that negative port number raises ValidationError."""
        with patch.dict(os.environ, {"PORT": "-1"}):
            with pytest.raises(ValidationError) as exc_info:
                Settings()
            
            error_messages = str(exc_info.value)
            assert "greater than or equal to 1" in error_messages
    
    def test_port_out_of_range_raises_error(self):
        """Test that port number out of valid range raises ValidationError."""
        with patch.dict(os.environ, {"PORT": "65536"}):
            with pytest.raises(ValidationError) as exc_info:
                Settings()
            
            error_messages = str(exc_info.value)
            assert "less than or equal to 65535" in error_messages


@pytest.mark.unit
class TestSettingsImmutability:
    """Test cases for settings immutability."""
    
    def test_settings_can_be_modified(self):
        """Test that settings can be modified after creation (Pydantic v2 behavior)."""
        settings = Settings()
        
        # In Pydantic v2, settings can be modified
        original_name = settings.app_name
        settings.app_name = "Modified Name"
        assert settings.app_name == "Modified Name"
        
        # Restore original value
        settings.app_name = original_name
        assert settings.app_name == original_name


@pytest.mark.unit
class TestGetSettingsFunction:
    """Test cases for the get_settings function."""
    
    def test_get_settings_returns_settings_instance(self):
        """Test that get_settings returns a Settings instance."""
        settings = get_settings()
        assert isinstance(settings, Settings)
    
    def test_get_settings_returns_same_instance(self):
        """Test that get_settings returns the same instance (singleton behavior)."""
        settings1 = get_settings()
        settings2 = get_settings()
        assert settings1 is settings2


@pytest.mark.unit
class TestSettingsWithEnvFile:
    """Test cases for .env file loading."""
    
    def test_settings_load_from_env_file(self, temp_env_file):
        """Test that settings can be loaded from a .env file."""
        # Create a temporary .env file
        env_file = temp_env_file / ".env"
        env_file.write_text("""
APP_NAME=Test API from .env
DEBUG=true
LOG_LEVEL=DEBUG
PORT=9000
""")
        
        # Create settings with the temporary .env file
        with patch.dict(os.environ, {}, clear=True):
            settings = Settings(_env_file=str(env_file))
            assert settings.app_name == "Test API from .env"
            assert settings.debug is True
            assert settings.log_level == "DEBUG"
            assert settings.port == 9000
    
    def test_env_file_overrides_defaults(self, temp_env_file):
        """Test that .env file values override default values."""
        # Create a temporary .env file with only some values
        env_file = temp_env_file / ".env"
        env_file.write_text("""
DEBUG=true
LOG_LEVEL=ERROR
""")
        
        with patch.dict(os.environ, {}, clear=True):
            settings = Settings(_env_file=str(env_file))
            # Values from .env file
            assert settings.debug is True
            assert settings.log_level == "ERROR"
            # Default values should still be used
            assert settings.app_name == "Personal Finance Tracker API"
            assert settings.port == 8000
    
    def test_environment_variables_override_env_file(self, temp_env_file):
        """Test that environment variables override .env file values."""
        # Create a temporary .env file
        env_file = temp_env_file / ".env"
        env_file.write_text("""
DEBUG=false
LOG_LEVEL=INFO
""")
        
        # Set environment variables that should override .env file
        with patch.dict(os.environ, {"DEBUG": "true", "LOG_LEVEL": "DEBUG"}):
            settings = Settings(_env_file=str(env_file))
            # Environment variables should take precedence
            assert settings.debug is True
            assert settings.log_level == "DEBUG"


@pytest.mark.unit
class TestSettingsCaseInsensitivity:
    """Test cases for case-insensitive environment variable handling."""
    
    def test_case_insensitive_env_vars(self):
        """Test that environment variables are case-insensitive."""
        with patch.dict(os.environ, {"app_name": "Lowercase API", "DEBUG": "true"}):
            settings = Settings()
            assert settings.app_name == "Lowercase API"
            assert settings.debug is True
    
    def test_mixed_case_env_vars(self):
        """Test that mixed case environment variables work."""
        with patch.dict(os.environ, {"App_Name": "Mixed Case API", "Log_Level": "WARNING"}):
            settings = Settings()
            assert settings.app_name == "Mixed Case API"
            assert settings.log_level == "WARNING"


@pytest.mark.unit
class TestSettingsExtraFields:
    """Test cases for handling extra fields."""
    
    def test_extra_fields_ignored(self):
        """Test that extra environment variables are ignored."""
        with patch.dict(os.environ, {"EXTRA_FIELD": "value", "ANOTHER_EXTRA": "another_value"}):
            # Should not raise an error
            settings = Settings()
            # Extra fields should not be accessible
            assert not hasattr(settings, "extra_field")
            assert not hasattr(settings, "another_extra")


@pytest.mark.unit
class TestSettingsDatabaseConfiguration:
    """Test cases for database configuration settings."""
    
    def test_default_database_url(self):
        """Test that database URL defaults to SQLite."""
        settings = Settings()
        assert settings.database_url == "sqlite:///./app.db"
    
    def test_default_db_echo(self):
        """Test that db_echo defaults to False."""
        settings = Settings()
        assert settings.db_echo is False
    
    def test_database_url_from_env(self):
        """Test that DATABASE_URL can be set from environment variable."""
        with patch.dict(os.environ, {"DATABASE_URL": "sqlite:///./test.db"}):
            settings = Settings()
            assert settings.database_url == "sqlite:///./test.db"
    
    def test_database_url_postgresql_format(self):
        """Test that PostgreSQL URL format is accepted."""
        postgres_url = "postgresql://user:password@localhost:5432/testdb"
        with patch.dict(os.environ, {"DATABASE_URL": postgres_url}):
            settings = Settings()
            assert settings.database_url == postgres_url
    
    def test_database_url_mysql_format(self):
        """Test that MySQL URL format is accepted."""
        mysql_url = "mysql://user:password@localhost:3306/testdb"
        with patch.dict(os.environ, {"DATABASE_URL": mysql_url}):
            settings = Settings()
            assert settings.database_url == mysql_url
    
    def test_database_url_absolute_path(self):
        """Test that SQLite absolute path format is accepted."""
        absolute_url = "sqlite:////absolute/path/to/app.db"
        with patch.dict(os.environ, {"DATABASE_URL": absolute_url}):
            settings = Settings()
            assert settings.database_url == absolute_url
    
    def test_db_echo_from_env(self):
        """Test that DB_ECHO can be set from environment variable."""
        with patch.dict(os.environ, {"DB_ECHO": "true"}):
            settings = Settings()
            assert settings.db_echo is True
        
        with patch.dict(os.environ, {"DB_ECHO": "false"}):
            settings = Settings()
            assert settings.db_echo is False
    
    def test_database_settings_from_env_file(self, temp_env_file):
        """Test that database settings can be loaded from .env file."""
        env_file = temp_env_file / ".env"
        env_file.write_text("""
DATABASE_URL=sqlite:///./custom.db
DB_ECHO=true
""")
        
        with patch.dict(os.environ, {}, clear=True):
            settings = Settings(_env_file=str(env_file))
            assert settings.database_url == "sqlite:///./custom.db"
            assert settings.db_echo is True
    
    def test_database_env_overrides_env_file(self, temp_env_file):
        """Test that DATABASE_URL environment variable overrides .env file."""
        env_file = temp_env_file / ".env"
        env_file.write_text("""
DATABASE_URL=sqlite:///./from_file.db
DB_ECHO=false
""")
        
        with patch.dict(os.environ, {"DATABASE_URL": "sqlite:///./from_env.db", "DB_ECHO": "true"}):
            settings = Settings(_env_file=str(env_file))
            assert settings.database_url == "sqlite:///./from_env.db"
            assert settings.db_echo is True
    
    def test_database_url_case_insensitive(self):
        """Test that database URL environment variable is case-insensitive."""
        with patch.dict(os.environ, {"database_url": "sqlite:///./lowercase.db"}):
            settings = Settings()
            assert settings.database_url == "sqlite:///./lowercase.db"


@pytest.mark.unit
class TestSettingsDocumentation:
    """Test cases for settings documentation and metadata."""
    
    def test_settings_have_descriptions(self):
        """Test that all settings fields have descriptions."""
        # Get field information from the model class (not instance)
        for field_name, field_info in Settings.model_fields.items():
            assert field_info.description is not None, f"Field {field_name} should have a description"
            assert len(field_info.description) > 0, f"Field {field_name} should have a non-empty description"
    
    def test_settings_model_config(self):
        """Test that the model configuration is set correctly."""
        settings = Settings()
        
        # Check model configuration
        assert settings.model_config["env_file"] == ".env"
        assert settings.model_config["env_file_encoding"] == "utf-8"
        assert settings.model_config["case_sensitive"] is False
        assert settings.model_config["extra"] == "ignore"
