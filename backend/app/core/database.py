from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import settings

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Base(DeclarativeBase):
    """Declarative base shared by all ORM models."""


def _build_engine(database_url: str):
    """Create an engine, transparently supporting SQLite (used in tests)."""
    connect_args: dict = {}
    engine_kwargs: dict = {}

    if database_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
        if ":memory:" in database_url:
            engine_kwargs["poolclass"] = StaticPool

    return create_engine(database_url, connect_args=connect_args, **engine_kwargs)


engine = _build_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def init_db() -> None:
    """Create all tables directly from metadata (used for SQLite/tests)."""
    # Import models so they register on the metadata before create_all.
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def run_migrations() -> None:
    """Bring the database up to the latest Alembic revision (Postgres)."""
    from alembic import command
    from alembic.config import Config

    cfg = Config(str(BACKEND_DIR / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    cfg.set_main_option("sqlalchemy.url", settings.database_url)
    command.upgrade(cfg, "head")


def prepare_database() -> None:
    """Schema bootstrap chosen by backend: migrations for Postgres, create_all for SQLite."""
    if settings.database_url.startswith("sqlite"):
        init_db()
    else:
        run_migrations()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a scoped database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
