"""make legacy fields nullable in comparison_fields

Revision ID: 20251027_105500
Revises: 20251027_094913
Create Date: 2025-10-27 10:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20251027_105500'
down_revision: Union[str, None] = '20251027_094913'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Make legacy columns in comparison_fields nullable.
    
    These columns were kept for backward compatibility but are not used
    in the new persistence implementation. Making them nullable allows
    the new system to work without populating these legacy fields.
    """
    # Make legacy columns nullable
    op.alter_column(
        'comparison_fields',
        'field_name',
        existing_type=sa.String(255),
        nullable=True
    )
    
    op.alter_column(
        'comparison_fields',
        'change_type',
        existing_type=sa.String(50),
        nullable=True
    )
    
    op.alter_column(
        'comparison_fields',
        'old_value',
        existing_type=sa.Text(),
        nullable=True
    )
    
    op.alter_column(
        'comparison_fields',
        'new_value',
        existing_type=sa.Text(),
        nullable=True
    )


def downgrade() -> None:
    """
    Revert nullable changes (note: this may fail if NULL values exist).
    """
    # Revert to NOT NULL (may fail if NULL values exist)
    op.alter_column(
        'comparison_fields',
        'field_name',
        existing_type=sa.String(255),
        nullable=False
    )
    
    op.alter_column(
        'comparison_fields',
        'change_type',
        existing_type=sa.String(50),
        nullable=False
    )
    
    op.alter_column(
        'comparison_fields',
        'old_value',
        existing_type=sa.Text(),
        nullable=False
    )
    
    op.alter_column(
        'comparison_fields',
        'new_value',
        existing_type=sa.Text(),
        nullable=False
    )

