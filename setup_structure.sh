#!/bin/bash

# Create root directories
mkdir -p .github/workflows
mkdir -p src/backend
mkdir -p src/frontend
mkdir -p src/agent
mkdir -p src/shared
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/fixtures
mkdir -p infra
mkdir -p data

# Create gitkeep files to ensure directories are tracked
touch .github/workflows/.gitkeep
touch src/shared/.gitkeep
touch tests/unit/.gitkeep
touch tests/integration/.gitkeep
touch tests/fixtures/.gitkeep
touch infra/.gitkeep
touch data/.gitkeep

echo "✅ Project structure created successfully."
