"""
Database configuration and session management for SEPE Templates Comparator.

This module handles SQLAlchemy configuration, database connection,
and session management with proper dependency injection support.
"""

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from typing import Generator
import logging

from app.core.config import settings


logger = logging.getLogger(__name__)

# SQLAlchemy configuration
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    pool_pre_ping=True,
    # Use StaticPool for SQLite in testing
    poolclass=StaticPool if "sqlite" in settings.DATABASE_URL else None,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# Create sessionmaker
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Create declarative base with custom metadata
metadata = MetaData(
    naming_convention={
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s"
    }
)

Base = declarative_base(metadata=metadata)


def get_db() -> Generator[Session, None, None]:
    """Dependency function to get database session.
    
    This function provides a database session for dependency injection
    in FastAPI endpoints. It ensures proper session cleanup.
    
    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Database session error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


def create_tables() -> None:
    """Create all database tables.
    
    This function creates all tables defined by SQLAlchemy models.
    Should be called during application startup or migrations.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {str(e)}")
        raise


def drop_tables() -> None:
    """Drop all database tables.
    
    This function drops all tables. Should only be used in testing
    or during development for clean resets.
    """
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("Database tables dropped successfully")
    except Exception as e:
        logger.error(f"Failed to drop database tables: {str(e)}")
        raise


def check_database_connection() -> bool:
    """Check if database connection is working.
    
    Returns:
        bool: True if connection is successful, False otherwise
    """
    try:
        from sqlalchemy import text
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        return False
