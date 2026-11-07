#!/usr/bin/env bash
set -euo pipefail

TODAY=$(date +%Y-%m-%d)
BRANCH="release/$TODAY"

echo "📦 Creating release: $BRANCH"

git fetch origin --prune

git checkout main
git pull origin main

git checkout -B "$BRANCH"

echo "⬆️  Pushing $BRANCH to origin..."
git push origin "$BRANCH"

echo "🚀 Deploying $BRANCH → prod..."
git push origin "$BRANCH:prod" --force

echo "🧹 Cleaning old release branches..."

for OLD in $(git branch -r | grep 'origin/release/' | grep -v "$BRANCH"); do
    CLEAN=${OLD#origin/}
    echo "   🔥 Deleting $CLEAN ..."
    git push origin --delete "$CLEAN" || true
    git branch -D "$CLEAN" 2>/dev/null || true
done

echo "✨ Done. Only $BRANCH kept."
