"""refactor_template_versioning_structure

Refactor database to implement proper version atomicity by moving
version-specific attributes from pdf_templates to template_versions.

Changes:
- Rename pdf_templates.version to current_version
- Add pdf_templates.comment field
- Move file_path, file_size_bytes, field_count, sepe_url from pdf_templates to template_versions
- Migrate existing data to new structure

Revision ID: 51b79a431ff8
Revises: fa338313b3a3
Create Date: 2025-10-26 08:37:42.167801

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = '51b79a431ff8'
down_revision: Union[str, None] = 'fa338313b3a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Upgrade database schema to move version-specific fields to template_versions table.
    
    Steps:
    1. Add new columns to template_versions (temporarily nullable)
    2. Rename pdf_templates.version to current_version
    3. Add comment column to pdf_templates
    4. Migrate data from pdf_templates to template_versions
    5. Make new columns NOT NULL (except sepe_url)
    6. Drop old columns from pdf_templates
    7. Add unique constraint on (template_id, version_number)
    8. Add optimized indexes
    """
    
    # Step 1: Add new columns to template_versions (temporarily nullable for data migration)
    op.add_column('template_versions', 
                  sa.Column('file_path', sa.String(length=500), nullable=True))
    op.add_column('template_versions', 
                  sa.Column('file_size_bytes', sa.Integer(), nullable=True))
    op.add_column('template_versions', 
                  sa.Column('field_count', sa.Integer(), nullable=True))
    op.add_column('template_versions', 
                  sa.Column('sepe_url', sa.String(length=1000), nullable=True))
    
    # Step 2: Rename column in pdf_templates
    op.alter_column('pdf_templates', 'version', 
                    new_column_name='current_version')
    
    # Step 3: Add comment column to pdf_templates
    op.add_column('pdf_templates', 
                  sa.Column('comment', sa.Text(), nullable=True))
    
    # Step 4: Migrate data from pdf_templates to template_versions
    # Copy file metadata from parent templates to ALL their versions
    # This ensures historical accuracy even for non-current versions
    connection = op.get_bind()
    connection.execute(text("""
        UPDATE template_versions tv
        SET 
            file_path = pt.file_path,
            file_size_bytes = pt.file_size_bytes,
            field_count = pt.field_count,
            sepe_url = pt.sepe_url
        FROM pdf_templates pt
        WHERE tv.template_id = pt.id
    """))
    
    # Step 5: Make new columns NOT NULL (except sepe_url which remains nullable)
    op.alter_column('template_versions', 'file_path', nullable=False)
    op.alter_column('template_versions', 'file_size_bytes', nullable=False)
    op.alter_column('template_versions', 'field_count', nullable=False,
                    server_default='0')
    
    # Step 6: Drop old columns from pdf_templates
    op.drop_column('pdf_templates', 'sepe_url')
    op.drop_column('pdf_templates', 'field_count')
    op.drop_column('pdf_templates', 'file_size_bytes')
    op.drop_column('pdf_templates', 'file_path')
    
    # Step 7: Add unique constraint to prevent duplicate version numbers per template
    op.create_unique_constraint(
        'uq_template_versions_template_id_version_number',
        'template_versions',
        ['template_id', 'version_number']
    )
    
    # Step 8: Add optimized indexes for common queries
    # Index for fast lookup of current version
    op.create_index(
        'idx_template_versions_current_lookup',
        'template_versions',
        ['template_id', 'is_current'],
        postgresql_where=text('is_current = true')
    )
    
    # Index for version number searches
    op.create_index(
        'idx_template_versions_version_number',
        'template_versions',
        ['version_number']
    )


def downgrade() -> None:
    """
    Downgrade database schema by moving version-specific fields back to pdf_templates.
    
    WARNING: This will lose historical version data as only current version data
    will be restored to pdf_templates. The comment field will also be lost.
    
    Steps:
    1. Add columns back to pdf_templates (temporarily nullable)
    2. Migrate data from current version back to pdf_templates
    3. Make columns NOT NULL (except sepe_url)
    4. Drop columns from template_versions
    5. Rename current_version back to version
    6. Drop comment column from pdf_templates
    7. Drop unique constraint
    8. Drop added indexes
    """
    
    # Step 1: Add columns back to pdf_templates (temporarily nullable)
    op.add_column('pdf_templates', 
                  sa.Column('file_path', sa.String(length=500), nullable=True))
    op.add_column('pdf_templates', 
                  sa.Column('file_size_bytes', sa.Integer(), nullable=True))
    op.add_column('pdf_templates', 
                  sa.Column('field_count', sa.Integer(), nullable=True))
    op.add_column('pdf_templates', 
                  sa.Column('sepe_url', sa.String(length=1000), nullable=True))
    
    # Step 2: Migrate data back from template_versions to pdf_templates (current version only)
    connection = op.get_bind()
    connection.execute(text("""
        UPDATE pdf_templates pt
        SET 
            file_path = tv.file_path,
            file_size_bytes = tv.file_size_bytes,
            field_count = tv.field_count,
            sepe_url = tv.sepe_url
        FROM template_versions tv
        WHERE tv.template_id = pt.id AND tv.is_current = TRUE
    """))
    
    # Step 3: Make columns NOT NULL (except sepe_url)
    op.alter_column('pdf_templates', 'file_path', nullable=False)
    op.alter_column('pdf_templates', 'file_size_bytes', nullable=False)
    op.alter_column('pdf_templates', 'field_count', nullable=False,
                    server_default='0')
    
    # Step 4: Drop columns from template_versions
    op.drop_column('template_versions', 'sepe_url')
    op.drop_column('template_versions', 'field_count')
    op.drop_column('template_versions', 'file_size_bytes')
    op.drop_column('template_versions', 'file_path')
    
    # Step 5: Rename column in pdf_templates back
    op.alter_column('pdf_templates', 'current_version', 
                    new_column_name='version')
    
    # Step 6: Drop comment column from pdf_templates
    op.drop_column('pdf_templates', 'comment')
    
    # Step 7: Drop unique constraint
    op.drop_constraint(
        'uq_template_versions_template_id_version_number',
        'template_versions',
        type_='unique'
    )
    
    # Step 8: Drop added indexes
    op.drop_index('idx_template_versions_version_number', 
                  table_name='template_versions')
    op.drop_index('idx_template_versions_current_lookup', 
                  table_name='template_versions',
                  postgresql_where=text('is_current = true'))
