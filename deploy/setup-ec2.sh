#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Strive — EC2 Bare Metal Setup Script
# Run this on a fresh Amazon Linux 2023 EC2 instance (amd64)
# Usage:  chmod +x deploy/setup-ec2.sh && sudo ./deploy/setup-ec2.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

echo "═══════════════════════════════════════════════════════"
echo " Strive — EC2 Bare Metal Setup (Amazon Linux 2023)"
echo "═══════════════════════════════════════════════════════"

# ── 1. System packages ──────────────────────────────────────
echo "→ Installing system dependencies..."
dnf install -y \
  wget curl gnupg2 ca-certificates \
  xorg-x11-server-Xvfb \
  liberation-fonts google-noto-emoji-color-fonts \
  alsa-lib atk at-spi2-atk cups-libs libdrm expat \
  fontconfig libgbm gtk3 nspr nss pango \
  libX11 libXcomposite libXcursor libXdamage libXext \
  libXfixes libXi libXrandr libXrender libXss libXtst \
  xdg-utils nginx openssl git

# ── 2. Google Chrome (not Chromium) ─────────────────────────
echo "→ Installing Google Chrome stable..."
if ! command -v google-chrome-stable &> /dev/null; then
  cat > /etc/yum.repos.d/google-chrome.repo << 'EOF'
[google-chrome]
name=Google Chrome
baseurl=https://dl.google.com/linux/chrome/rpm/stable/x86_64
enabled=1
gpgcheck=1
gpgkey=https://dl.google.com/linux/linux_signing_key.pub
EOF
  dnf install -y google-chrome-stable
  echo "✅ Chrome installed: $(google-chrome-stable --version)"
else
  echo "✅ Chrome already installed: $(google-chrome-stable --version)"
fi

# ── 3. Node.js 20 LTS ──────────────────────────────────────
echo "→ Installing Node.js 20..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
  dnf install -y nodejs
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
mkdir -p /home/ec2-user/strive/logs
chown -R ec2-user:ec2-user /home/ec2-user/strive

# ── 8. Nginx ────────────────────────────────────────────────
echo "→ Configuring Nginx..."
cat > /etc/nginx/conf.d/strive.conf << 'EOF'
server {
    listen 80;
    server_name _;

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

        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
}
EOF

systemctl enable nginx
nginx -t && systemctl restart nginx
echo "✅ Nginx configured"

# ── 9. PM2 startup ─────────────────────────────────────────
echo "→ Configuring PM2 startup..."
env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user
echo "✅ PM2 startup configured"

echo ""
echo "═══════════════════════════════════════════════════════"
echo " ✅ Setup complete!"
echo ""
echo " Next steps (as ec2-user):"
echo "   1. cd /home/ec2-user/strive"
echo "   2. git clone <your-repo> . "
echo "   3. cp .env.example .env  # fill in secrets"
echo "   4. yarn install"
echo "   5. npx prisma db push"
echo "   6. yarn build"
echo "   7. pm2 start ecosystem.config.cjs"
echo "   8. pm2 save"
echo "═══════════════════════════════════════════════════════"
