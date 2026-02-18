#!/bin/bash
# POC Automated Comparison Script
# Runs complete glTF+Draco vs ThatOpen benchmark

set -e  # Exit on error

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 POC: glTF+Draco vs ThatOpen Fragments"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${BLUE}[1/6] Checking prerequisites...${NC}"

if [ ! -d "dataset/raw" ] || [ -z "$(ls -A dataset/raw/*.3dm 2>/dev/null)" ]; then
    echo -e "${RED}❌ No .3dm files found in dataset/raw/${NC}"
    echo "   Please add test files first:"
    echo "   mkdir -p dataset/raw"
    echo "   cp /path/to/test-files/*.3dm dataset/raw/"
    exit 1
fi

echo -e "${GREEN}✓ .3dm files found${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python 3 installed${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js installed${NC}"
echo ""

# Step 2: Install Python dependencies
echo -e "${BLUE}[2/6] Installing Python dependencies...${NC}"

cd exporters
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install -q -r requirements.txt

echo -e "${GREEN}✓ Python dependencies installed${NC}"
echo ""

# Step 3: Export glTF+Draco
echo -e "${BLUE}[3/6] Exporting glTF+Draco files...${NC}"

python export_gltf_draco.py

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ glTF+Draco export completed${NC}"
else
    echo -e "${RED}❌ glTF export failed${NC}"
    exit 1
fi
echo ""

# Step 4: Export ThatOpen Fragments
echo -e "${BLUE}[4/6] Exporting ThatOpen Fragments...${NC}"

python export_thatopen_frag.py

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ ThatOpen export completed (properties JSON ready)${NC}"
    echo -e "${YELLOW}⚠️  Note: .frag file requires Node.js conversion (optional)${NC}"
else
    echo -e "${YELLOW}⚠️  ThatOpen export partially completed${NC}"
fi

deactivate
cd ..
echo ""

# Step 5: Install Frontend dependencies
echo -e "${BLUE}[5/6] Installing Frontend dependencies...${NC}"

npm install

echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

# Step 6: Start dev server
echo -e "${BLUE}[6/6] Starting dev server...${NC}"
echo ""
echo -e "${GREEN}✅ POC setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Open browser: http://localhost:5173"
echo "  2. Compare glTF+Draco performance (left panel)"
echo "  3. View metrics overlay"
echo ""
echo "To run benchmarks in headless mode:"
echo "  npm run benchmark"
echo ""
echo -e "${YELLOW}Starting server in 3 seconds...${NC}"
sleep 3

npm run dev
