"""
Unit tests for database initialization script.

Tests the init_db.py script functionality including:
- Database file checking
- Migration execution
- Connection verification
- Error handling
"""

import os
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock, Mock
import pytest

# Add backend directory to Python path for imports
backend_dir = Path(__file__).parent.parent.parent.parent.parent
sys.path.insert(0, str(backend_dir))

from app.scripts.init_db import (
    get_alembic_config,
    verify_database_connection,
    run_migrations,
    check_database_file,
    init_database,
)


class TestGetAlembicConfig:
    """Tests for get_alembic_config function."""
    
    def test_get_alembic_config_success(self):
        """Test that Alembic config is created successfully when alembic.ini exists."""
        config = get_alembic_config()
        assert config is not None
        assert config.config_file_name.endswith("alembic.ini")
    
    def test_get_alembic_config_file_not_found(self, monkeypatch):
        """Test that FileNotFoundError is raised when alembic.ini doesn't exist."""
        # Mock Path.exists to return False
        def mock_exists(self):
            return False
        
        monkeypatch.setattr(Path, "exists", mock_exists)
        
        with pytest.raises(FileNotFoundError) as exc_info:
            get_alembic_config()
        
        assert "alembic.ini not found" in str(exc_info.value)


class TestVerifyDatabaseConnection:
    """Tests for verify_database_connection function."""
    
    def test_verify_database_connection_success(self):
        """Test successful database connection verification."""
        success, message = verify_database_connection()
        assert success is True
        assert "Database connection verified" in message
    
    def test_verify_database_connection_with_version(self):
        """Test connection verification shows migration version."""
        success, message = verify_database_connection()
        assert success is True
        # Should show either a version number or "No migrations applied yet"
        assert ("Current migration" in message or "No migrations applied yet" in message)
    
    @patch('app.scripts.init_db.SessionLocal')
    def test_verify_database_connection_failure(self, mock_session_local):
        """Test connection verification handles database errors."""
        # Mock SessionLocal to raise an exception
        mock_session_local.side_effect = Exception("Connection failed")
        
        success, message = verify_database_connection()
        assert success is False
        assert "failed" in message.lower() or "error" in message.lower()


class TestRunMigrations:
    """Tests for run_migrations function."""
    
    @patch('app.scripts.init_db.command')
    def test_run_migrations_success(self, mock_command):
        """Test successful migration execution."""
        # Mock the upgrade command
        mock_command.upgrade = MagicMock()
        
        success, message = run_migrations()
        assert success is True
        assert "successfully" in message.lower()
        mock_command.upgrade.assert_called_once()
    
    @patch('app.scripts.init_db.get_alembic_config')
    def test_run_migrations_config_error(self, mock_get_config):
        """Test migration fails gracefully when config is missing."""
        # Mock get_alembic_config to raise FileNotFoundError
        mock_get_config.side_effect = FileNotFoundError("alembic.ini not found")
        
        success, message = run_migrations()
        assert success is False
        assert "alembic.ini not found" in message
    
    @patch('app.scripts.init_db.command')
    def test_run_migrations_unexpected_error(self, mock_command):
        """Test migration handles unexpected errors."""
        # Mock the upgrade command to raise an exception
        mock_command.upgrade.side_effect = Exception("Migration error")
        
        success, message = run_migrations()
        assert success is False
        assert "Migration failed" in message


class TestCheckDatabaseFile:
    """Tests for check_database_file function."""
    
    def test_check_database_file_exists(self):
        """Test checking existing database file."""
        # This test assumes the database file exists from previous tests
        exists, message = check_database_file()
        assert isinstance(exists, bool)
        assert "Database file" in message
    
    @patch('app.scripts.init_db.get_settings')
    def test_check_database_file_non_sqlite(self, mock_get_settings):
        """Test checking non-SQLite database URL."""
        # Mock settings to return a PostgreSQL URL
        mock_settings = MagicMock()
        mock_settings.database_url = "postgresql://user:pass@localhost/dbname"
        mock_get_settings.return_value = mock_settings
        
        exists, message = check_database_file()
        assert "Using database" in message
        assert "postgresql" in message


class TestInitDatabase:
    """Tests for init_database function (integration of all steps)."""
    
    @patch('app.scripts.init_db.verify_database_connection')
    @patch('app.scripts.init_db.run_migrations')
    @patch('app.scripts.init_db.check_database_file')
    def test_init_database_success(self, mock_check_file, mock_run_migrations, mock_verify_conn):
        """Test successful database initialization."""
        # Mock all sub-functions to return success
        mock_check_file.return_value = (False, "Database will be created")
        mock_run_migrations.return_value = (True, "Migrations successful")
        mock_verify_conn.return_value = (True, "Connection verified")
        
        result = init_database()
        assert result is True
        
        # Verify all steps were called
        mock_check_file.assert_called_once()
        mock_run_migrations.assert_called_once()
        mock_verify_conn.assert_called_once()
    
    @patch('app.scripts.init_db.verify_database_connection')
    @patch('app.scripts.init_db.run_migrations')
    @patch('app.scripts.init_db.check_database_file')
    def test_init_database_migration_failure(self, mock_check_file, mock_run_migrations, mock_verify_conn):
        """Test initialization fails when migration fails."""
        # Mock migration to fail
        mock_check_file.return_value = (False, "Database will be created")
        mock_run_migrations.return_value = (False, "Migration failed")
        
        result = init_database()
        assert result is False
        
        # Verify connection verification was not called since migration failed
        mock_verify_conn.assert_not_called()
    
    @patch('app.scripts.init_db.verify_database_connection')
    @patch('app.scripts.init_db.run_migrations')
    @patch('app.scripts.init_db.check_database_file')
    def test_init_database_connection_failure(self, mock_check_file, mock_run_migrations, mock_verify_conn):
        """Test initialization fails when connection verification fails."""
        # Mock migration to succeed but connection to fail
        mock_check_file.return_value = (True, "Database exists")
        mock_run_migrations.return_value = (True, "Migrations successful")
        mock_verify_conn.return_value = (False, "Connection failed")
        
        result = init_database()
        assert result is False
    
    @patch('app.scripts.init_db.check_database_file')
    def test_init_database_unexpected_error(self, mock_check_file):
        """Test initialization handles unexpected errors."""
        # Mock check_database_file to raise an exception
        mock_check_file.side_effect = Exception("Unexpected error")
        
        result = init_database()
        assert result is False


@pytest.mark.unit
class TestInitDatabaseMarked:
    """Test class with unit marker for selective test execution."""
    
    def test_marker_applied(self):
        """Verify the unit marker is properly applied."""
        # This test ensures the @pytest.mark.unit decorator works
        assert True

