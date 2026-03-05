#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Strive — EC2 Bare Metal Setup Script
# Run this on a fresh Ubuntu 22.04+ EC2 instance (amd64)
# Usage:  chmod +x deploy/setup-ec2.sh && sudo ./deploy/setup-ec2.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

echo "═══════════════════════════════════════════════════════"
echo " Strive — EC2 Bare Metal Setup"
echo "═══════════════════════════════════════════════════════"

# ── 1. System packages ──────────────────────────────────────
echo "→ Installing system dependencies..."
apt-get update
apt-get install -y \
  curl wget gnupg2 ca-certificates apt-transport-https \
  xvfb \
  fonts-liberation fonts-noto-color-emoji fonts-freefont-ttf \
  libasound2 libatk-bridge2.0-0 libatk1.0-0 libcairo2 \
  libcups2 libdbus-1-3 libdrm2 libexpat1 libfontconfig1 \
  libgbm1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 \
  libpango-1.0-0 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
  libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 \
  libxrandr2 libxrender1 libxshmfence1 libxss1 libxtst6 \
  xdg-utils nginx openssl git

# ── 2. Google Chrome (not Chromium) ─────────────────────────
echo "→ Installing Google Chrome stable..."
if ! command -v google-chrome-stable &> /dev/null; then
  wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | \
    gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg
  echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] \
    http://dl.google.com/linux/chrome/deb/ stable main" \
    > /etc/apt/sources.list.d/google-chrome.list
  apt-get update
  apt-get install -y google-chrome-stable
  echo "✅ Chrome installed: $(google-chrome-stable --version)"
else
  echo "✅ Chrome already installed: $(google-chrome-stable --version)"
fi

# ── 3. Node.js 20 LTS ──────────────────────────────────────
echo "→ Installing Node.js 20..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  echo "✅ Node.js installed: $(node --version)"
else
  echo "✅ Node.js already installed: $(node --version)"
fi

# ── 4. Yarn ─────────────────────────────────────────────────
echo "→ Installing Yarn..."
npm install -g yarn

# ── 5. PM2 ──────────────────────────────────────────────────
echo "→ Installing PM2..."
npm install -g pm2

# ── 6. Xvfb systemd service ────────────────────────────────
echo "→ Setting up Xvfb virtual display..."
cat > /etc/systemd/system/xvfb.service << 'EOF'
[Unit]
Description=X Virtual Frame Buffer (Xvfb) on display :99
After=network.target

[Service]
ExecStart=/usr/bin/Xvfb :99 -screen 0 1920x1080x24 -ac -nolisten tcp
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable xvfb
systemctl start xvfb
echo "✅ Xvfb running on DISPLAY=:99"

# ── 7. Create app directory & logs ──────────────────────────
echo "→ Setting up app directory..."
mkdir -p /home/ubuntu/strive/logs
chown -R ubuntu:ubuntu /home/ubuntu/strive

# ── 8. Nginx ────────────────────────────────────────────────
echo "→ Configuring Nginx..."
cat > /etc/nginx/sites-available/strive << 'EOF'
server {
    listen 80;
    server_name _;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_comp_level 6;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Extended timeouts for Puppeteer
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/strive /etc/nginx/sites-enabled/strive
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
echo "✅ Nginx configured"

# ── 9. PM2 startup ─────────────────────────────────────────
echo "→ Configuring PM2 startup..."
env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
echo "✅ PM2 startup configured"

echo ""
echo "═══════════════════════════════════════════════════════"
echo " ✅ Setup complete!"
echo ""
echo " Next steps (as ubuntu user):"
echo "   1. cd /home/ubuntu/strive"
echo "   2. git clone <your-repo> . "
echo "   3. cp .env.example .env  # fill in secrets"
echo "   4. yarn install"
echo "   5. npx prisma db push"
echo "   6. yarn build"
echo "   7. pm2 start ecosystem.config.cjs"
echo "   8. pm2 save"
echo "═══════════════════════════════════════════════════════"
