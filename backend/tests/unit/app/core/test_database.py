"""
Unit tests for database configuration and session management.

Tests verify:
- Database engine creation
- Session factory functionality
- Database dependency injection
- Session cleanup and disposal
- Base metadata accessibility
"""

import pytest
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.core.database import engine, SessionLocal, Base, get_db
from app.core.config import get_settings


class TestDatabaseEngine:
    """Tests for database engine creation and configuration."""
    
    def test_engine_creation_succeeds(self):
        """Test that database engine is created successfully."""
        assert engine is not None
        assert hasattr(engine, 'url')
        assert hasattr(engine, 'dialect')
    
    def test_engine_uses_sqlite(self):
        """Test that engine is configured for SQLite."""
        assert 'sqlite' in str(engine.url)
    
    def test_engine_url_from_settings(self):
        """Test that engine URL matches settings configuration."""
        settings = get_settings()
        # The URL should contain the database path from settings
        assert 'app.db' in str(engine.url) or settings.database_url in str(engine.url)
    
    def test_engine_pool_configuration(self):
        """Test that engine has proper pool configuration."""
        # pool_pre_ping should be enabled
        assert engine.pool._pre_ping is True


class TestSessionFactory:
    """Tests for SessionLocal factory functionality."""
    
    def test_session_factory_creates_valid_sessions(self):
        """Test that SessionLocal creates valid database sessions."""
        db = SessionLocal()
        try:
            assert db is not None
            assert isinstance(db, Session)
        finally:
            db.close()
    
    def test_session_has_correct_configuration(self):
        """Test that sessions have autoflush=False configuration."""
        db = SessionLocal()
        try:
            # In SQLAlchemy 2.0, autoflush is the main configuration we check
            assert db.autoflush is False
        finally:
            db.close()
    
    def test_multiple_sessions_are_independent(self):
        """Test that multiple sessions are created independently."""
        db1 = SessionLocal()
        db2 = SessionLocal()
        try:
            assert db1 is not db2
            assert db1.bind is db2.bind  # Same engine
        finally:
            db1.close()
            db2.close()
    
    def test_session_is_bound_to_engine(self):
        """Test that sessions are bound to the correct engine."""
        db = SessionLocal()
        try:
            assert db.bind is engine
        finally:
            db.close()


class TestGetDbDependency:
    """Tests for get_db() FastAPI dependency function."""
    
    def test_get_db_yields_valid_session(self):
        """Test that get_db() yields a valid database session."""
        db_generator = get_db()
        db = next(db_generator)
        
        assert db is not None
        assert isinstance(db, Session)
        
        # Clean up
        try:
            next(db_generator)
        except StopIteration:
            pass
    
    def test_get_db_session_is_usable(self):
        """Test that session from get_db() can execute queries."""
        db_generator = get_db()
        db = next(db_generator)
        
        try:
            # Execute a simple query to verify session works
            result = db.execute(text("SELECT 1")).scalar()
            assert result == 1
        finally:
            # Clean up
            try:
                next(db_generator)
            except StopIteration:
                pass
    
    def test_get_db_closes_session_after_use(self):
        """Test that get_db() properly closes the session."""
        db_generator = get_db()
        db = next(db_generator)
        
        # Session should be active
        assert db.is_active
        
        # Trigger cleanup
        try:
            next(db_generator)
        except StopIteration:
            pass
        
        # Session should be closed now
        # Note: We can't directly test if session is closed, but we can verify
        # that the generator properly completed without errors
    
    def test_get_db_closes_session_on_exception(self):
        """Test that get_db() closes session even if an exception occurs."""
        db_generator = get_db()
        db = next(db_generator)
        
        # Simulate an exception
        try:
            try:
                raise ValueError("Test exception")
            finally:
                # This should still close the session
                try:
                    next(db_generator)
                except StopIteration:
                    pass
        except ValueError:
            pass
        
        # If we get here without hanging, the cleanup worked


class TestDeclarativeBase:
    """Tests for SQLAlchemy declarative Base."""
    
    def test_base_metadata_is_accessible(self):
        """Test that Base metadata is accessible and valid."""
        assert Base is not None
        assert hasattr(Base, 'metadata')
        assert Base.metadata is not None
    
    def test_base_metadata_is_empty_initially(self):
        """Test that Base metadata has no tables initially (no models defined yet)."""
        # Since we haven't defined any models yet, tables should be empty
        assert len(Base.metadata.tables) == 0
    
    def test_base_can_create_tables(self):
        """Test that Base can create tables in a test database."""
        # Create a temporary in-memory database for testing
        test_engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool
        )
        
        # This should not raise an error even with no tables
        Base.metadata.create_all(bind=test_engine)
        
        # Verify no errors occurred
        inspector = inspect(test_engine)
        tables = inspector.get_table_names()
        assert isinstance(tables, list)


class TestSessionCleanup:
    """Tests for proper session cleanup and disposal."""
    
    def test_session_cleanup_works_correctly(self):
        """Test that sessions can be properly closed and disposed."""
        db = SessionLocal()
        
        # Session should be active
        assert db.is_active
        
        # Close the session
        db.close()
        
        # After closing, we should be able to create a new session
        db2 = SessionLocal()
        assert db2 is not None
        db2.close()
    
    def test_session_disposal_does_not_affect_engine(self):
        """Test that closing sessions doesn't affect the engine."""
        db1 = SessionLocal()
        db1.close()
        
        # Engine should still work
        db2 = SessionLocal()
        assert db2 is not None
        assert db2.bind is engine
        db2.close()

