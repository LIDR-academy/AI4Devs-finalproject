#!/bin/bash
# Quick Fix Script for Python Dependencies Issues
# Resolves common installation errors on macOS

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT/exporters"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔧 Python Dependencies Quick Fix${NC}"
echo "=================================="
echo ""

# 1. Clean previous installation
if [ -d "venv" ]; then
    echo -e "${YELLOW}Removing old venv...${NC}"
    rm -rf venv
fi

# 2. Create fresh venv
echo -e "${GREEN}Creating fresh virtual environment...${NC}"
python3 -m venv venv

# 3. Activate venv
source venv/bin/activate

# 4. Upgrade pip first (silences warnings)
echo -e "${GREEN}Upgrading pip...${NC}"
pip install --upgrade pip --quiet

# 5. Install dependencies one by one (easier to debug)
echo -e "${GREEN}Installing core dependencies...${NC}"

echo "  - rhino3dm..."
pip install rhino3dm==8.4.0 --quiet

echo "  - numpy..."
pip install numpy==1.26.3 --quiet

echo "  - trimesh..."
pip install trimesh==4.0.5 --quiet

echo "  - pygltflib..."
pip install pygltflib==1.16.1 --quiet

echo "  - tqdm..."
pip install tqdm==4.66.1 --quiet

echo ""
echo -e "${GREEN}✅ All dependencies installed successfully!${NC}"
echo ""
echo "To activate this environment manually:"
echo "  cd $PROJECT_ROOT/exporters"
echo "  source venv/bin/activate"
echo ""

# Test imports
echo -e "${GREEN}Testing imports...${NC}"
python3 << 'EOF'
try:
    import rhino3dm as r3dm
    import trimesh
    import numpy as np
    from pygltflib import GLTF2
    from tqdm import tqdm
    print("✅ All imports successful!")
except ImportError as e:
    print(f"❌ Import failed: {e}")
    exit(1)
EOF

echo ""
echo -e "${GREEN}✅ Environment ready!${NC}"
echo ""
echo "Next steps:"
echo "  1. python export_gltf_draco.py"
echo "  2. python export_thatopen_frag.py"
