#!/bin/bash
# Wrapper script to run ThatOpen Fragments exporter with proper venv activation
# Usage: ./run-fragments-export.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Running ThatOpen Fragments Exporter${NC}"
echo "========================================"
echo ""

# Check if venv exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found${NC}"
    echo "   Running fix-python-deps.sh first..."
    echo ""
    
    cd ../scripts
    bash fix-python-deps.sh
    cd ../exporters
    
    if [ ! -d "venv" ]; then
        echo -e "${RED}❌ Failed to create virtual environment${NC}"
        exit 1
    fi
fi

# Activate venv
echo -e "${GREEN}Activating virtual environment...${NC}"
source venv/bin/activate

# Verify dependencies
echo -e "${GREEN}Verifying dependencies...${NC}"
python3 << 'EOF'
try:
    import rhino3dm
    import trimesh
    import numpy
    print("✅ All dependencies available")
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    exit(1)
EOF

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Dependencies not installed correctly${NC}"
    echo "   Try running: bash ../scripts/fix-python-deps.sh"
    exit 1
fi

echo ""
echo -e "${GREEN}Running exporter...${NC}"
echo ""

# Run the exporter
python export_thatopen_frag.py

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Export completed successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Check properties: cat ../dataset/fragments/sagrada-sample.frag.json | head -20"
    echo "  2. Optional: Convert to .frag with Node.js (requires IFC source)"
    echo "  3. Start frontend: cd .. && npm run dev"
else
    echo ""
    echo -e "${RED}❌ Export failed${NC}"
    echo "   Check error messages above"
    exit 1
fi

# Deactivate venv
deactivate
