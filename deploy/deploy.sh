#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Strive — Deploy / Update Script
# Run as ubuntu user:  ./deploy/deploy.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="/home/ubuntu/strive"
cd "$APP_DIR"

echo "→ Pulling latest code..."
git pull origin main

echo "→ Installing dependencies..."
yarn install --frozen-lockfile

echo "→ Running database migrations..."
npx prisma db push --accept-data-loss

echo "→ Building application..."
yarn build

echo "→ Restarting PM2..."
pm2 restart ecosystem.config.cjs
pm2 save

echo "✅ Deploy complete!"
echo "   Logs: pm2 logs strive"
