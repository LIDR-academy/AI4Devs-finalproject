#!/bin/bash

# Complete Development Environment Reset Script
# This script resets everything to a clean state:
# - Cleans uploads/documents directory
# - Cleans prisma/temp directory  
# - Runs database seed
# - Moves example files to uploads
# Usage: ./scripts/reset-development.sh

echo "🔄 Resetting development environment to clean state..."

# Navigate to backend directory
cd "$(dirname "$0")/../backend" || exit 1

echo "📍 Working directory: $(pwd)"

# Step 1: Clean uploads/documents directory
echo "🧹 Step 1: Cleaning uploads/documents directory..."
if [ -d "uploads/documents" ]; then
    file_count=$(ls uploads/documents/ 2>/dev/null | wc -l)
    if [ "$file_count" -gt 0 ]; then
        echo "   🗂️  Removing $file_count files from uploads/documents/..."
        rm -f uploads/documents/*
        echo "   ✅ Uploads directory cleaned"
    else
        echo "   ℹ️  Uploads directory already empty"
    fi
else
    echo "   📁 Creating uploads/documents directory..."
    mkdir -p uploads/documents
fi

# Step 2: Clean prisma/temp directory (preserve PDF files)
echo "🧹 Step 2: Cleaning prisma/temp directory (preserving PDF files)..."
if [ -d "prisma/temp" ]; then
    # Count non-PDF files
    non_pdf_count=$(find prisma/temp -type f ! -name "*.pdf" 2>/dev/null | wc -l)
    if [ "$non_pdf_count" -gt 0 ]; then
        echo "   🗂️  Removing $non_pdf_count non-PDF files from prisma/temp/..."
        find prisma/temp -type f ! -name "*.pdf" -delete
        echo "   ✅ Temp directory cleaned (PDF files preserved)"
    else
        echo "   ℹ️  No non-PDF files to clean in temp directory"
    fi
    
    # Show preserved PDF files
    pdf_count=$(find prisma/temp -name "*.pdf" 2>/dev/null | wc -l)
    if [ "$pdf_count" -gt 0 ]; then
        echo "   📄 Preserved $pdf_count PDF files in temp directory"
    fi
fi

# Step 3: Run database seed (this will populate prisma/temp with example files)
echo "🌱 Step 3: Running database seed..."
npx prisma db seed

# Step 4: Move example files from temp to uploads
echo "📁 Step 4: Moving example files to uploads..."
if [ -d "prisma/temp" ]; then
    # Check for any files in temp directory
    temp_files=$(find prisma/temp -type f 2>/dev/null | wc -l)
    if [ "$temp_files" -gt 0 ]; then
        echo "   📄 Found $temp_files files in temp directory"
        
        # Move all files (not just specific extensions)
        for file in prisma/temp/*; do
            if [ -f "$file" ]; then
                filename=$(basename "$file")
                echo "      → Moving: $filename"
                cp "$file" "uploads/documents/$filename"
            fi
        done
        echo "   ✅ All files moved successfully"
    else
        echo "   ℹ️  No files found in prisma/temp directory"
    fi
else
    echo "   ⚠️  No prisma/temp directory found"
fi

# Step 5: Final verification
echo "📊 Step 5: Verification..."
uploads_count=$(ls uploads/documents/ 2>/dev/null | wc -l)
echo "   📁 Files in uploads/documents: $uploads_count"

echo ""
echo "🎉 Development environment reset completed successfully!"
echo "✨ Your system is now in a clean state with fresh data and example files" 