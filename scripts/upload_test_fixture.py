#!/usr/bin/env python3
"""
Upload test fixture to Supabase Storage for integration tests.
Usage: python scripts/upload_test_fixture.py
"""
import os
from pathlib import Path
from supabase import create_client, Client

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  # Service role key needed for uploads
BUCKET_NAME = "raw-uploads"
SOURCE_FILE = "tests/fixtures/test-model.3dm"
DESTINATION_PATH = "test-fixtures/test-model.3dm"

def main():
    # Validate environment
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Error: SUPABASE_URL and SUPABASE_KEY must be set")
        print("   Export them from docker-compose.yml or .env")
        return 1
    
    # Initialize client
    print(f"🔌 Connecting to Supabase: {SUPABASE_URL}")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Check file exists
    source_path = Path(SOURCE_FILE)
    if not source_path.exists():
        print(f"❌ Error: File not found: {SOURCE_FILE}")
        return 1
    
    file_size_mb = source_path.stat().st_size / (1024 * 1024)
    print(f"📁 File found: {SOURCE_FILE} ({file_size_mb:.2f} MB)")
    
    # Upload file
    print(f"⬆️  Uploading to {BUCKET_NAME}/{DESTINATION_PATH}...")
    
    try:
        with open(source_path, 'rb') as file:
            response = supabase.storage.from_(BUCKET_NAME).upload(
                path=DESTINATION_PATH,
                file=file,
                file_options={"content-type": "application/octet-stream", "upsert": "true"}
            )
        
        print(f"✅ Upload successful!")
        print(f"   Path: {BUCKET_NAME}/{DESTINATION_PATH}")
        print(f"   Size: {file_size_mb:.2f} MB")
        
        # Verify upload
        print(f"\n🔍 Verifying upload...")
        files = supabase.storage.from_(BUCKET_NAME).list("test-fixtures")
        uploaded_file = next((f for f in files if f['name'] == 'test-model.3dm'), None)
        
        if uploaded_file:
            print(f"✅ Verification successful: {uploaded_file['name']} exists")
            return 0
        else:
            print(f"⚠️  File uploaded but not found in listing")
            return 1
            
    except Exception as e:
        print(f"❌ Upload failed: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
