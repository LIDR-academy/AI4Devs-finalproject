"""
Database configuration and session management.

This module provides SQLAlchemy engine, session factory, and database
dependency for FastAPI endpoints.
"""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase

from app.core.config import get_settings

# Get settings instance
settings = get_settings()

# Create SQLAlchemy engine
# For SQLite, we need check_same_thread=False to allow FastAPI to use the same
# connection across different threads (FastAPI uses thread pool for async operations)
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
    echo=settings.db_echo,
    # For SQLite, we don't need pooling, but for other databases this would be configured here
    pool_pre_ping=True,  # Verify connections before using them
)

# Create SessionLocal class
# Each instance will be a database session
# autocommit=False: Don't automatically commit after each operation
# autoflush=False: Don't automatically flush before queries
# bind: Bind to our engine
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Create Base class for declarative models using SQLAlchemy 2.0 style
# All database models will inherit from this Base class
class Base(DeclarativeBase):
    """Base class for all database models."""
    pass


def get_db() -> Generator[Session, None, None]:
    """
    Database dependency for FastAPI endpoints.
    
    Creates a new database session for each request and ensures it's
    properly closed after the request completes, even if an exception occurs.
    
    Yields:
        Session: A SQLAlchemy database session
        
    Example:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

