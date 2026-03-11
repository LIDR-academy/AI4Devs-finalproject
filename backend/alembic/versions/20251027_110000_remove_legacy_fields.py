"""remove legacy fields from comparison_fields

Revision ID: 20251027_110000
Revises: 20251027_105500
Create Date: 2025-10-27 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20251027_110000'
down_revision: Union[str, None] = '20251027_105500'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Remove legacy columns from comparison_fields table.
    
    These columns were from an older implementation and are no longer used
    in the new persistence system. The new system uses:
    - field_id (instead of field_name)
    - status (instead of change_type)
    - source_*/target_* fields (instead of old_value/new_value)
    - source_position/target_position JSONB (instead of position_x/position_y)
    """
    # Drop legacy columns
    op.drop_column('comparison_fields', 'field_name')
    op.drop_column('comparison_fields', 'change_type')
    op.drop_column('comparison_fields', 'old_value')
    op.drop_column('comparison_fields', 'new_value')
    op.drop_column('comparison_fields', 'position_x')
    op.drop_column('comparison_fields', 'position_y')


def downgrade() -> None:
    """
    Restore legacy columns (if needed for rollback).
    
    Note: Data in these columns will be lost after upgrade.
    """
    # Restore legacy columns
    op.add_column(
        'comparison_fields',
        sa.Column('field_name', sa.String(255), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('change_type', sa.String(50), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('old_value', sa.Text(), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('new_value', sa.Text(), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('position_x', sa.Float(), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('position_y', sa.Float(), nullable=True)
    )

