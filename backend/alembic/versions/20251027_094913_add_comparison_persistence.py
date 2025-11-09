"""add_comparison_persistence

Modify comparisons and comparison_fields tables to support persistence of
complete comparison analysis results with version-based foreign keys.

Critical Changes:
- Change comparisons FKs from pdf_templates to template_versions
- Add global metrics columns to comparisons table
- Add complete field change data columns to comparison_fields table

Revision ID: 20251027_094913
Revises: 51b79a431ff8
Create Date: 2025-10-27 09:49:13.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '20251027_094913'
down_revision: Union[str, None] = '51b79a431ff8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Upgrade database schema for comparison persistence.
    
    This migration transforms the comparisons table to reference template versions
    instead of templates, and extends both tables to store complete comparison data.
    """
    
    # ============================================================================
    # STEP 1: Drop existing foreign key constraints on comparisons table
    # ============================================================================
    op.drop_constraint(
        'fk_comparisons_source_template_id_pdf_templates',
        'comparisons',
        type_='foreignkey'
    )
    op.drop_constraint(
        'fk_comparisons_target_template_id_pdf_templates',
        'comparisons',
        type_='foreignkey'
    )
    
    # ============================================================================
    # STEP 2: Rename columns to reflect version-based relationships
    # ============================================================================
    op.alter_column(
        'comparisons',
        'source_template_id',
        new_column_name='source_version_id'
    )
    op.alter_column(
        'comparisons',
        'target_template_id',
        new_column_name='target_version_id'
    )
    
    # ============================================================================
    # STEP 3: Add new foreign key constraints to template_versions
    # ============================================================================
    op.create_foreign_key(
        'fk_comparisons_source_version_id',
        'comparisons',
        'template_versions',
        ['source_version_id'],
        ['id'],
        ondelete='CASCADE'
    )
    op.create_foreign_key(
        'fk_comparisons_target_version_id',
        'comparisons',
        'template_versions',
        ['target_version_id'],
        ['id'],
        ondelete='CASCADE'
    )
    
    # ============================================================================
    # STEP 4: Add new global metrics columns to comparisons table
    # ============================================================================
    op.add_column(
        'comparisons',
        sa.Column(
            'modification_percentage',
            sa.Float(),
            nullable=False,
            server_default='0.0'
        )
    )
    op.add_column(
        'comparisons',
        sa.Column(
            'fields_added',
            sa.Integer(),
            nullable=False,
            server_default='0'
        )
    )
    op.add_column(
        'comparisons',
        sa.Column(
            'fields_removed',
            sa.Integer(),
            nullable=False,
            server_default='0'
        )
    )
    op.add_column(
        'comparisons',
        sa.Column(
            'fields_modified',
            sa.Integer(),
            nullable=False,
            server_default='0'
        )
    )
    op.add_column(
        'comparisons',
        sa.Column(
            'fields_unchanged',
            sa.Integer(),
            nullable=False,
            server_default='0'
        )
    )
    
    # ============================================================================
    # STEP 5: Add new field change data columns to comparison_fields table
    # ============================================================================
    
    # Field identification and status
    op.add_column(
        'comparison_fields',
        sa.Column(
            'field_id',
            sa.String(255),
            nullable=False,
            server_default=''
        )
    )
    op.add_column(
        'comparison_fields',
        sa.Column(
            'status',
            sa.String(20),
            nullable=False,
            server_default='UNCHANGED'
        )
    )
    
    # Page number information
    op.add_column(
        'comparison_fields',
        sa.Column('source_page_number', sa.Integer(), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('target_page_number', sa.Integer(), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column(
            'page_number_changed',
            sa.Boolean(),
            nullable=False,
            server_default='false'
        )
    )
    
    # Near text comparison
    op.add_column(
        'comparison_fields',
        sa.Column('near_text_diff', sa.String(20), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('source_near_text', sa.Text(), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column('target_near_text', sa.Text(), nullable=True)
    )
    
    # Value options comparison (JSONB for flexibility)
    op.add_column(
        'comparison_fields',
        sa.Column(
            'value_options_diff',
            sa.String(20),
            nullable=True
        )
    )
    op.add_column(
        'comparison_fields',
        sa.Column(
            'source_value_options',
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True
        )
    )
    op.add_column(
        'comparison_fields',
        sa.Column(
            'target_value_options',
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True
        )
    )
    
    # Position comparison (JSONB for {x0, y0, x1, y1} structure)
    op.add_column(
        'comparison_fields',
        sa.Column('position_change', sa.String(20), nullable=True)
    )
    op.add_column(
        'comparison_fields',
        sa.Column(
            'source_position',
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True
        )
    )
    op.add_column(
        'comparison_fields',
        sa.Column(
            'target_position',
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True
        )
    )
    
    # ============================================================================
    # STEP 6: Drop old indexes and create new ones
    # ============================================================================
    
    # Drop old template-based indexes
    op.drop_index('ix_comparisons_source_template_id', table_name='comparisons')
    op.drop_index('ix_comparisons_target_template_id', table_name='comparisons')
    
    # Create new version-based indexes
    op.create_index(
        'ix_comparisons_source_version_id',
        'comparisons',
        ['source_version_id']
    )
    op.create_index(
        'ix_comparisons_target_version_id',
        'comparisons',
        ['target_version_id']
    )
    
    # Add index for sorting by modification percentage
    op.create_index(
        'ix_comparisons_modification_percentage',
        'comparisons',
        ['modification_percentage']
    )
    
    # Add indexes for comparison_fields filtering
    op.create_index(
        'ix_comparison_fields_field_id',
        'comparison_fields',
        ['field_id']
    )
    op.create_index(
        'ix_comparison_fields_status',
        'comparison_fields',
        ['status']
    )
    
    # ============================================================================
    # STEP 7: Add check constraints for data integrity
    # ============================================================================
    
    # Ensure source and target versions are different
    op.create_check_constraint(
        'chk_comparisons_different_versions',
        'comparisons',
        'source_version_id != target_version_id'
    )
    
    # Ensure modification percentage is between 0 and 100
    op.create_check_constraint(
        'chk_comparisons_modification_percentage',
        'comparisons',
        'modification_percentage >= 0 AND modification_percentage <= 100'
    )
    
    # Ensure field counts are non-negative
    op.create_check_constraint(
        'chk_comparisons_field_counts',
        'comparisons',
        'fields_added >= 0 AND fields_removed >= 0 AND fields_modified >= 0 AND fields_unchanged >= 0'
    )
    
    # Ensure status is one of the valid enum values
    op.create_check_constraint(
        'chk_comparison_fields_status',
        'comparison_fields',
        "status IN ('ADDED', 'REMOVED', 'MODIFIED', 'UNCHANGED')"
    )
    
    # Ensure diff status fields are valid or NULL
    op.create_check_constraint(
        'chk_comparison_fields_near_text_diff',
        'comparison_fields',
        "near_text_diff IN ('EQUAL', 'DIFFERENT', 'NOT_APPLICABLE') OR near_text_diff IS NULL"
    )
    op.create_check_constraint(
        'chk_comparison_fields_value_options_diff',
        'comparison_fields',
        "value_options_diff IN ('EQUAL', 'DIFFERENT', 'NOT_APPLICABLE') OR value_options_diff IS NULL"
    )
    op.create_check_constraint(
        'chk_comparison_fields_position_change',
        'comparison_fields',
        "position_change IN ('EQUAL', 'DIFFERENT', 'NOT_APPLICABLE') OR position_change IS NULL"
    )


def downgrade() -> None:
    """
    Downgrade database schema (rollback all changes).
    
    This function reverses all operations performed in upgrade() to restore
    the previous schema structure.
    """
    
    # ============================================================================
    # STEP 1: Drop check constraints
    # ============================================================================
    op.drop_constraint(
        'chk_comparison_fields_position_change',
        'comparison_fields',
        type_='check'
    )
    op.drop_constraint(
        'chk_comparison_fields_value_options_diff',
        'comparison_fields',
        type_='check'
    )
    op.drop_constraint(
        'chk_comparison_fields_near_text_diff',
        'comparison_fields',
        type_='check'
    )
    op.drop_constraint(
        'chk_comparison_fields_status',
        'comparison_fields',
        type_='check'
    )
    op.drop_constraint(
        'chk_comparisons_field_counts',
        'comparisons',
        type_='check'
    )
    op.drop_constraint(
        'chk_comparisons_modification_percentage',
        'comparisons',
        type_='check'
    )
    op.drop_constraint(
        'chk_comparisons_different_versions',
        'comparisons',
        type_='check'
    )
    
    # ============================================================================
    # STEP 2: Drop new indexes
    # ============================================================================
    op.drop_index('ix_comparison_fields_status', table_name='comparison_fields')
    op.drop_index('ix_comparison_fields_field_id', table_name='comparison_fields')
    op.drop_index('ix_comparisons_modification_percentage', table_name='comparisons')
    op.drop_index('ix_comparisons_target_version_id', table_name='comparisons')
    op.drop_index('ix_comparisons_source_version_id', table_name='comparisons')
    
    # ============================================================================
    # STEP 3: Drop new columns from comparison_fields
    # ============================================================================
    op.drop_column('comparison_fields', 'target_position')
    op.drop_column('comparison_fields', 'source_position')
    op.drop_column('comparison_fields', 'position_change')
    op.drop_column('comparison_fields', 'target_value_options')
    op.drop_column('comparison_fields', 'source_value_options')
    op.drop_column('comparison_fields', 'value_options_diff')
    op.drop_column('comparison_fields', 'target_near_text')
    op.drop_column('comparison_fields', 'source_near_text')
    op.drop_column('comparison_fields', 'near_text_diff')
    op.drop_column('comparison_fields', 'page_number_changed')
    op.drop_column('comparison_fields', 'target_page_number')
    op.drop_column('comparison_fields', 'source_page_number')
    op.drop_column('comparison_fields', 'status')
    op.drop_column('comparison_fields', 'field_id')
    
    # ============================================================================
    # STEP 4: Drop new columns from comparisons
    # ============================================================================
    op.drop_column('comparisons', 'fields_unchanged')
    op.drop_column('comparisons', 'fields_modified')
    op.drop_column('comparisons', 'fields_removed')
    op.drop_column('comparisons', 'fields_added')
    op.drop_column('comparisons', 'modification_percentage')
    
    # ============================================================================
    # STEP 5: Drop new foreign key constraints
    # ============================================================================
    op.drop_constraint(
        'fk_comparisons_target_version_id',
        'comparisons',
        type_='foreignkey'
    )
    op.drop_constraint(
        'fk_comparisons_source_version_id',
        'comparisons',
        type_='foreignkey'
    )
    
    # ============================================================================
    # STEP 6: Rename columns back to original names
    # ============================================================================
    op.alter_column(
        'comparisons',
        'target_version_id',
        new_column_name='target_template_id'
    )
    op.alter_column(
        'comparisons',
        'source_version_id',
        new_column_name='source_template_id'
    )
    
    # ============================================================================
    # STEP 7: Recreate old foreign key constraints
    # ============================================================================
    op.create_foreign_key(
        'fk_comparisons_target_template_id_pdf_templates',
        'comparisons',
        'pdf_templates',
        ['target_template_id'],
        ['id']
    )
    op.create_foreign_key(
        'fk_comparisons_source_template_id_pdf_templates',
        'comparisons',
        'pdf_templates',
        ['source_template_id'],
        ['id']
    )
    
    # ============================================================================
    # STEP 8: Recreate old indexes
    # ============================================================================
    op.create_index(
        'ix_comparisons_target_template_id',
        'comparisons',
        ['target_template_id']
    )
    op.create_index(
        'ix_comparisons_source_template_id',
        'comparisons',
        ['source_template_id']
    )

