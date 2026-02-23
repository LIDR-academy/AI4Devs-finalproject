#!/bin/bash
# scripts/update_gemfile_lock.sh
# Script to update Gemfile.lock locally before deployment
#
# Usage: ./scripts/update_gemfile_lock.sh

set -euo pipefail

echo "🔄 Updating Gemfile.lock..."

cd "$(dirname "$0")/.." || exit 1

# Check if bundle is available
if ! command -v bundle &> /dev/null; then
  echo "❌ Error: bundle command not found"
  echo "Please install bundler: gem install bundler"
  exit 1
fi

# Install dependencies and update lockfile
echo "📦 Running bundle install..."
bundle install

# Verify lockfile is updated
if [ -f "Gemfile.lock" ]; then
  echo "✅ Gemfile.lock updated successfully"
  echo ""
  echo "📝 Next steps:"
  echo "  1. Review changes: git diff Gemfile.lock"
  echo "  2. Commit: git add Gemfile.lock && git commit -m 'Update Gemfile.lock'"
  echo "  3. Push: git push"
else
  echo "❌ Error: Gemfile.lock not found"
  exit 1
fi
