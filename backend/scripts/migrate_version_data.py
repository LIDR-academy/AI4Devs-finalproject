"""
Script to migrate data for template versions that were created before the refactoring.

This script populates file_path, file_size_bytes, field_count, and sepe_url
for TemplateVersion records that are missing these fields (old data).
"""
import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import engine, SessionLocal
from app.models.template import PDFTemplate, TemplateVersion


def migrate_version_data():
    """
    Migrate file-related data to template_versions for old records.
    
    This handles the case where:
    1. pdf_templates still has the old columns (before migration)
    2. template_versions exists but doesn't have the new columns filled
    """
    db = SessionLocal()
    
    try:
        print("=" * 80)
        print("TEMPLATE VERSION DATA MIGRATION")
        print("=" * 80)
        print()
        
        # Check if we need to migrate data
        with engine.connect() as conn:
            # Check if template_versions has the new columns
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'template_versions' 
                AND column_name IN ('file_path', 'file_size_bytes', 'field_count', 'sepe_url')
            """))
            columns = [row[0] for row in result]
            
            if len(columns) < 4:
                print("❌ Error: template_versions table is missing new columns.")
                print(f"   Found columns: {columns}")
                print("   Please run: alembic upgrade head")
                return False
            
            print("✅ Schema check passed: template_versions has new columns")
            print()
            
            # Check for versions with NULL file_path
            result = conn.execute(text("""
                SELECT COUNT(*) 
                FROM template_versions 
                WHERE file_path IS NULL
            """))
            null_count = result.scalar()
            
            print(f"📊 Found {null_count} template versions with missing file data")
            
            if null_count == 0:
                print("✅ All template versions already have file data. No migration needed.")
                return True
            
            print()
            print(f"🔄 Migrating data for {null_count} template versions...")
            print()
            
            # Attempt to get data from pdf_templates (if columns still exist)
            # This handles the case where migration was only partially run
            try:
                result = conn.execute(text("""
                    UPDATE template_versions tv
                    SET 
                        file_path = pt.file_path,
                        file_size_bytes = pt.file_size_bytes,
                        field_count = pt.field_count,
                        sepe_url = pt.sepe_url
                    FROM pdf_templates pt
                    WHERE tv.template_id = pt.id
                    AND tv.file_path IS NULL
                    AND pt.file_path IS NOT NULL
                """))
                
                rows_updated = result.rowcount
                conn.commit()
                
                print(f"✅ Successfully migrated {rows_updated} versions from pdf_templates")
                
                # Check remaining NULL values
                result = conn.execute(text("""
                    SELECT COUNT(*) 
                    FROM template_versions 
                    WHERE file_path IS NULL
                """))
                remaining_null = result.scalar()
                
                if remaining_null > 0:
                    print(f"⚠️  Warning: {remaining_null} versions still have NULL file_path")
                    print("   These may be orphaned records or created after migration.")
                    print("   Consider deleting them or setting default values.")
                
            except Exception as e:
                print(f"ℹ️  Note: Could not migrate from pdf_templates (columns may not exist)")
                print(f"   This is expected if migration already removed the columns: {e}")
                print()
                print("   For versions with NULL values, you may need to:")
                print("   1. Delete orphaned template_versions records")
                print("   2. Or set default values manually")
            
            print()
            print("=" * 80)
            print("MIGRATION COMPLETE")
            print("=" * 80)
            
            return True
            
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()


def verify_data_integrity():
    """Verify that the migration was successful."""
    db = SessionLocal()
    
    try:
        print()
        print("=" * 80)
        print("DATA INTEGRITY VERIFICATION")
        print("=" * 80)
        print()
        
        # Count total versions
        total_versions = db.query(TemplateVersion).count()
        print(f"📊 Total template versions: {total_versions}")
        
        # Count versions with NULL file data
        null_file_path = db.query(TemplateVersion).filter(
            TemplateVersion.file_path.is_(None)
        ).count()
        null_file_size = db.query(TemplateVersion).filter(
            TemplateVersion.file_size_bytes.is_(None)
        ).count()
        null_field_count = db.query(TemplateVersion).filter(
            TemplateVersion.field_count.is_(None)
        ).count()
        
        print(f"   Versions with NULL file_path: {null_file_path}")
        print(f"   Versions with NULL file_size_bytes: {null_file_size}")
        print(f"   Versions with NULL field_count: {null_field_count}")
        print()
        
        if null_file_path == 0 and null_file_size == 0 and null_field_count == 0:
            print("✅ All template versions have complete file data!")
        else:
            print("⚠️  Some versions have incomplete data.")
            print("   This is acceptable for backward compatibility.")
            print("   New ingestions will have complete data.")
        
        print()
        print("=" * 80)
        
    finally:
        db.close()


if __name__ == "__main__":
    print()
    print("Starting Template Version Data Migration...")
    print()
    
    success = migrate_version_data()
    
    if success:
        verify_data_integrity()
        print()
        print("✅ Migration script completed successfully!")
        print()
    else:
        print()
        print("❌ Migration script failed. Please check errors above.")
        print()
        sys.exit(1)

