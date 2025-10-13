"""
Database initialization script.

This script initializes the database by:
1. Creating the database file if it doesn't exist
2. Running all pending Alembic migrations
3. Verifying the database connection
4. Logging all initialization steps

The script is idempotent and can be run multiple times safely.

Usage:
    # As a module
    python -m app.scripts.init_db
    
    # As a standalone script
    python app/scripts/init_db.py
    
    # From Python code
    from app.scripts.init_db import init_database
    init_database()
"""

import sys
import os
from pathlib import Path
from typing import Tuple

# Add the backend directory to Python path if running as standalone script
if __name__ == "__main__":
    backend_dir = Path(__file__).parent.parent.parent
    sys.path.insert(0, str(backend_dir))

from alembic import command
from alembic.config import Config
from sqlalchemy import text, inspect
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import engine, SessionLocal
from app.core.logging import get_logger
from app.core.config import get_settings

# Get logger for this module
logger = get_logger(__name__)


def get_alembic_config() -> Config:
    """
    Get Alembic configuration object.
    
    Returns:
        Config: Alembic configuration object
        
    Raises:
        FileNotFoundError: If alembic.ini is not found
    """
    # Get the backend directory (where alembic.ini is located)
    backend_dir = Path(__file__).parent.parent.parent
    alembic_ini_path = backend_dir / "alembic.ini"
    
    if not alembic_ini_path.exists():
        raise FileNotFoundError(
            f"alembic.ini not found at {alembic_ini_path}. "
            "Ensure you're running from the correct directory."
        )
    
    # Create Alembic config
    alembic_cfg = Config(str(alembic_ini_path))
    
    # Set the script location (where migrations are stored)
    alembic_cfg.set_main_option("script_location", str(backend_dir / "alembic"))
    
    return alembic_cfg


def verify_database_connection() -> Tuple[bool, str]:
    """
    Verify database connection is working.
    
    Returns:
        Tuple[bool, str]: (success, message)
    """
    try:
        # Create a session and test the connection
        db = SessionLocal()
        try:
            # Execute a simple query
            result = db.execute(text("SELECT 1"))
            result.fetchone()
            
            # Check if alembic_version table exists (indicates migrations have run)
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            
            if "alembic_version" in tables:
                # Get current migration version
                version_result = db.execute(text("SELECT version_num FROM alembic_version"))
                version = version_result.fetchone()
                version_num = version[0] if version else "No version"
                
                return True, f"Database connection verified. Current migration: {version_num}"
            else:
                return True, "Database connection verified. No migrations applied yet."
                
        finally:
            db.close()
            
    except SQLAlchemyError as e:
        return False, f"Database connection failed: {str(e)}"
    except Exception as e:
        return False, f"Unexpected error during connection verification: {str(e)}"


def run_migrations() -> Tuple[bool, str]:
    """
    Run all pending Alembic migrations.
    
    Returns:
        Tuple[bool, str]: (success, message)
    """
    try:
        logger.info("Starting database migrations...")
        
        # Get Alembic configuration
        alembic_cfg = get_alembic_config()
        
        # Run migrations to head (latest version)
        command.upgrade(alembic_cfg, "head")
        
        logger.info("Database migrations completed successfully")
        return True, "All migrations applied successfully"
        
    except FileNotFoundError as e:
        error_msg = str(e)
        logger.error(f"Configuration error: {error_msg}")
        return False, error_msg
        
    except Exception as e:
        error_msg = f"Migration failed: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return False, error_msg


def check_database_file() -> Tuple[bool, str]:
    """
    Check if database file exists and log its status.
    
    Returns:
        Tuple[bool, str]: (exists, message)
    """
    settings = get_settings()
    db_url = settings.database_url
    
    # For SQLite, extract the file path from the URL
    if db_url.startswith("sqlite:///"):
        db_path_str = db_url.replace("sqlite:///", "")
        
        # Handle relative paths
        if not db_path_str.startswith("/"):
            backend_dir = Path(__file__).parent.parent.parent
            db_path = backend_dir / db_path_str
        else:
            db_path = Path(db_path_str)
        
        exists = db_path.exists()
        
        if exists:
            size = db_path.stat().st_size
            return True, f"Database file exists at {db_path} (size: {size} bytes)"
        else:
            return False, f"Database file will be created at {db_path}"
    else:
        # For non-SQLite databases, we can't check file existence
        return True, f"Using database: {db_url}"


def init_database() -> bool:
    """
    Initialize the database with all migrations.
    
    This function:
    1. Checks database file status
    2. Runs all pending migrations
    3. Verifies the database connection
    
    Returns:
        bool: True if initialization successful, False otherwise
    """
    logger.info("=" * 60)
    logger.info("Starting database initialization")
    logger.info("=" * 60)
    
    try:
        # Step 1: Check database file status
        logger.info("Step 1: Checking database file status...")
        exists, message = check_database_file()
        logger.info(message)
        
        # Step 2: Run migrations
        logger.info("Step 2: Running database migrations...")
        success, message = run_migrations()
        if not success:
            logger.error(f"❌ Database initialization failed: {message}")
            return False
        logger.info(f"✓ {message}")
        
        # Step 3: Verify connection
        logger.info("Step 3: Verifying database connection...")
        success, message = verify_database_connection()
        if not success:
            logger.error(f"❌ Database initialization failed: {message}")
            return False
        logger.info(f"✓ {message}")
        
        logger.info("=" * 60)
        logger.info("✓ Database initialization completed successfully!")
        logger.info("=" * 60)
        return True
        
    except Exception as e:
        logger.error(f"❌ Unexpected error during database initialization: {str(e)}", exc_info=True)
        return False


def main() -> int:
    """
    Main entry point for the script.
    
    Returns:
        int: Exit code (0 for success, 1 for failure)
    """
    try:
        success = init_database()
        return 0 if success else 1
    except KeyboardInterrupt:
        logger.warning("Database initialization interrupted by user")
        return 1
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}", exc_info=True)
        return 1


if __name__ == "__main__":
    sys.exit(main())

