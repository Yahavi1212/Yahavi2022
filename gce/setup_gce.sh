#!/bin/bash
# HackKnow — Production GCE Deployment Script
# Optimized for Google Compute Engine Free Tier (e2-micro)
# Ubuntu 22.04 LTS Recommended
#
# IMPORTANT: Set these environment variables before running:
#   export RAZORPAY_KEY=rzp_live_YOUR_KEY_HERE
#
# Usage: sudo ./setup_gce.sh

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Error handler
error_exit() {
    log_error "$1"
    exit 1
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error_exit "This script must be run as root (use sudo)"
fi

# Check environment variables
if [[ -z "${RAZORPAY_KEY:-}" ]]; then
    error_exit "RAZORPAY_KEY environment variable is not set!\nSet it with: export RAZORPAY_KEY=rzp_live_YOUR_KEY"
fi

# Check if running on GCE (optional but recommended)
if [[ -f /etc/google-instance-id ]]; then
    log_success "Running on Google Compute Engine ✓"
else
    log_warn "Not running on GCE - some optimizations may not apply"
fi

echo ""
echo "======================================"
echo "   HackKnow GCE Production Setup"
echo "======================================"
echo ""

# ── 1. System Update & Base Dependencies ─────────────────────────────────────
log_info "[1/8] Updating system and installing base dependencies..."
apt-get update -y || error_exit "Failed to update package lists"
apt-get install -y curl wget git nginx software-properties-common apt-transport-https ca-certificates gnupg2 || error_exit "Failed to install base packages"
log_success "Base dependencies installed"

# ── 2. Setup Swap (Critical for GCE Free Tier e2-micro) ─────────────────────
log_info "[2/8] Setting up swap space (required for e2-micro)..."
if [[ ! -f /swapfile ]]; then
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1024 count=2097152
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    log_success "2GB swap space created"
else
    log_warn "Swap file already exists, skipping"
fi

# Optimize swap settings for low-memory VM
echo 'vm.swappiness=10' >> /etc/sysctl.conf
echo 'vm.vfs_cache_pressure=50' >> /etc/sysctl.conf
sysctl -p || true

# ── 3. Install Node.js 20 LTS ───────────────────────────────────────────────
log_info "[3/8] Installing Node.js 20 LTS..."
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
    # Remove old Node.js if exists
    apt-get remove -y nodejs npm 2>/dev/null || true
    
    # Install NodeSource Node.js 20.x
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs || error_exit "Failed to install Node.js"
    
    log_success "Node.js $(node -v) installed"
else
    log_success "Node.js $(node -v) already installed ✓"
fi

# ── 4. Setup Web Directory ──────────────────────────────────────────────────
log_info "[4/8] Setting up web directory..."
mkdir -p /var/www/hackknow/dist
chown -R $SUDO_USER:$SUDO_USER /var/www/hackknow || chown -R root:root /var/www/hackknow
log_success "Web directory ready at /var/www/hackknow"

# ── 5. Clone Repository & Build ─────────────────────────────────────────────
log_info "[5/8] Cloning repository and building application..."
cd /var/www/hackknow

# Remove old repo if exists (for clean builds)
if [[ -d repo ]]; then
    log_warn "Existing repo found, removing for clean build..."
    rm -rf repo
fi

# Clone repository
git clone https://github.com/gaganchauhan1997/Yahavi2022.git repo || error_exit "Failed to clone repository"
cd repo/app

# Create production .env file
cat > .env << ENVEOF
VITE_WORDPRESS_URL=https://shop.hackknow.com/graphql
VITE_RAZORPAY_KEY_ID=${RAZORPAY_KEY}
ENVEOF
log_success ".env file created with production keys"

# Install dependencies with memory optimization for low-RAM VPS
log_info "Installing npm packages (this may take a few minutes)..."
npm ci --production=false --max-old-space-size=1536 || npm install --max-old-space-size=1536 || error_exit "Failed to install npm packages"

# Build production bundle
log_info "Building production bundle..."
npm run build || error_exit "Build failed"

# Copy build to web root
cp -r dist/* /var/www/hackknow/dist/
log_success "Build copied to /var/www/hackknow/dist"

# Clean up .env file for security
rm -f .env
log_success "Cleaned up .env file for security"

# ── 6. Configure Nginx with Optimizations ───────────────────────────────────
log_info "[6/8] Configuring Nginx with PageSpeed optimizations..."

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Copy custom nginx config
cp /var/www/hackknow/repo/gce/nginx.conf /etc/nginx/sites-available/hackknow
ln -sf /etc/nginx/sites-available/hackknow /etc/nginx/sites-enabled/hackknow

# Test nginx config
nginx -t || error_exit "Nginx configuration test failed"

# Optimize nginx worker processes for single-core e2-micro
sed -i 's/worker_processes auto/worker_processes 1/' /etc/nginx/nginx.conf
sed -i 's/#gzip on/gzip on/' /etc/nginx/nginx.conf 2>/dev/null || true

# Start nginx
systemctl restart nginx
systemctl enable nginx
log_success "Nginx configured and running"

# ── 7. Firewall Configuration ─────────────────────────────────────────────────
log_info "[7/8] Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 'Nginx Full' comment 'Nginx HTTP/HTTPS'
    ufw allow 22/tcp comment 'SSH'
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'
    ufw --force enable
    log_success "UFW firewall configured"
else
    log_warn "UFW not installed, using GCP firewall rules instead"
fi

# ── 8. SSL Certificate (Certbot) ─────────────────────────────────────────────
log_info "[8/8] Installing Certbot for SSL..."
apt-get install -y certbot python3-certbot-nginx || log_warn "Certbot installation failed - install manually later"

# ── 9. Auto-Deploy Setup ──────────────────────────────────────────────────────
log_info "[9/9] Setting up auto-deployment..."

# Make scripts executable
chmod +x "$REPO_DIR/gce/auto-deploy.sh"
chmod +x "$REPO_DIR/gce/deploy-webhook.js"

# Install webhook service
ln -sf "$REPO_DIR/gce/deploy-webhook.service" /etc/systemd/system/deploy-webhook.service
systemctl daemon-reload

# Start webhook server
systemctl enable deploy-webhook.service
systemctl start deploy-webhook.service || log_warn "Webhook service failed to start - check logs with: journalctl -u deploy-webhook"

# Configure nginx reverse proxy for webhook
if ! grep -q "deploy-webhook" /etc/nginx/sites-available/default; then
    cat >> /etc/nginx/sites-available/default << 'NGINX_WEBHOOK'

# Auto-deploy webhook endpoint
location /deploy {
    proxy_pass http://localhost:9000/deploy;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# GitHub webhook endpoint
location /github-webhook {
    proxy_pass http://localhost:9000/github-webhook;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Hub-Signature-256 $http_x_hub_signature_256;
}
NGINX_WEBHOOK
    nginx -t && systemctl reload nginx || log_warn "Nginx webhook config failed"
fi

log_success "Auto-deploy configured"

echo ""
echo "======================================"
echo "   SETUP COMPLETE! "
echo "======================================"
echo ""
log_success "HackKnow is deployed and running!"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Point your domain (hackknow.com) to this server's IP:"
echo -e "     $(curl -s -4 ifconfig.me)"
echo ""
echo "  2. Run SSL certificate installation:"
echo -e "     ${YELLOW}sudo certbot --nginx -d hackknow.com -d www.hackknow.com${NC}"
echo ""
echo "  3. Test your site:"
echo -e "     ${YELLOW}http://$(curl -s -4 ifconfig.me)${NC}"
echo ""
echo -e "${BLUE}Performance Tips for GCE Free Tier:${NC}"
echo "  - 2GB swap space configured for low memory"
echo "  - Nginx optimized for single-core e2-micro"
echo "  - Gzip and Brotli compression enabled"
echo "  - Static assets cached for 1 year"
echo ""
echo -e "${BLUE}Auto-Deploy:${NC}"
echo "  Your site will automatically update when you push to GitHub!"
echo "  Webhook endpoints configured:"
echo -e "    - ${YELLOW}https://YOUR_DOMAIN/github-webhook${NC} (GitHub webhook)"
echo -e "    - ${YELLOW}https://YOUR_DOMAIN/deploy?secret=hackknow-deploy-secret${NC} (Manual trigger)"
echo ""
echo "  GitHub Webhook Setup:"
echo "    1. Go to your repo Settings > Webhooks > Add webhook"
echo "    2. Payload URL: https://YOUR_DOMAIN/github-webhook"
echo "    3. Content type: application/json"
echo "    4. Secret: hackknow-deploy-secret"
echo "    5. Select 'Just the push event'"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  - Check Nginx: sudo systemctl status nginx"
echo "  - View logs: sudo tail -f /var/log/nginx/access.log"
echo "  - Check webhook: sudo systemctl status deploy-webhook"
echo "  - View deploy logs: sudo journalctl -u deploy-webhook -f"
echo "  - Manual deploy: curl -X POST 'https://YOUR_DOMAIN/deploy?secret=hackknow-deploy-secret'"
echo "  - Rebuild: cd /var/www/hackknow/repo/app && npm run build && cp -r dist/* /var/www/hackknow/dist/"
echo ""
echo "======================================"
