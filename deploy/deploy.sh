#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Strive — Deploy / Update Script
# Run as ec2-user after build artifacts are SCP'd to the server
# Usage:  bash deploy/deploy.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="/home/realjefienemokwu/strive"
cd "$APP_DIR"

echo "🗄️ Running database migrations..."
npx prisma db push --accept-data-loss

echo "🚦 Restarting with PM2..."
pm2 delete "strive" || true

echo "🚀 Starting app via Ecosystem..."
mkdir -p logs
pm2 start ecosystem.config.cjs

echo "💾 Saving PM2 state..."
pm2 save

echo "✅ Deploy complete!"
echo "   Logs: pm2 logs strive"

