#!/bin/bash
# Complete HackKnow GCE Setup with GitHub Auto-Deploy
# Run this on your GCE VM

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Check root
[[ $EUID -ne 0 ]] && error "Run as root: sudo ./complete-setup.sh"

# Get inputs
read -p "Enter your Razorpay Live Key (rzp_live_...): " RAZORPAY_KEY
read -p "Enter your WordPress GraphQL URL (https://site.com/graphql): " WP_URL
read -p "Enter GitHub Webhook Secret (any random string): " WEBHOOK_SECRET
read -p "Enter your domain (hackknow.com) or VM IP: " DOMAIN

echo ""
echo "======================================"
echo "  HackKnow Complete GCE Setup"
echo "======================================"
echo ""

# 1. Update system
log "Updating system..."
apt-get update -y
apt-get install -y curl wget git nginx software-properties-common apt-transport-https ca-certificates gnupg2 build-essential

# 2. Setup swap
log "Setting up swap..."
if [[ ! -f /swapfile ]]; then
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1024 count=2097152
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    success "Swap configured"
fi

# 3. Install Node.js
log "Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
success "Node.js $(node -v)"

# 4. Install PM2
log "Installing PM2..."
npm install -g pm2

# 5. Create directories
log "Creating web directories..."
mkdir -p /var/www/hackknow/dist
mkdir -p /var/www/hackknow/logs

# 6. Clone repo
log "Cloning repository..."
cd /var/www/hackknow
if [[ -d repo ]]; then
    rm -rf repo
fi
git clone https://github.com/gaganchauhan1997/Yahavi2022.git repo
cd repo/app

# 7. Create .env
cat > .env << EOF
VITE_WORDPRESS_URL=${WP_URL}
VITE_RAZORPAY_KEY_ID=${RAZORPAY_KEY}
EOF
success ".env created"

# 8. Build
log "Installing dependencies..."
npm ci --max-old-space-size=1536 || npm install --max-old-space-size=1536

log "Building application..."
npm run build

# 9. Copy to web root
cp -r dist/* /var/www/hackknow/dist/
rm -f .env
success "Build complete"

# 10. Nginx config
cat > /etc/nginx/sites-available/hackknow << 'NGINX'
server {
    listen 80;
    server_name _;
    
    root /var/www/hackknow/dist;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    
    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # GitHub webhook
    location /github-webhook {
        proxy_pass http://localhost:9000/github-webhook;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Hub-Signature-256 $http_x_hub_signature_256;
    }
}
NGINX

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/hackknow /etc/nginx/sites-enabled/hackknow

# Optimize nginx for single core
sed -i 's/worker_processes auto/worker_processes 1/' /etc/nginx/nginx.conf

nginx -t
systemctl restart nginx
systemctl enable nginx
success "Nginx configured"

# 11. Create webhook server
cat > /var/www/hackknow/webhook.js << 'WEBHOOK'
const http = require('http');
const { exec } = require('child_process');
const crypto = require('crypto');

const SECRET = process.env.WEBHOOK_SECRET || 'hackknow-deploy-secret';
const PORT = 9000;

function verifySignature(body, signature) {
    const hmac = crypto.createHmac('sha256', SECRET);
    const digest = 'sha256=' + hmac.update(body).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

const server = http.createServer((req, res) => {
    if (req.url === '/github-webhook' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const signature = req.headers['x-hub-signature-256'] || '';
            
            if (!verifySignature(body, signature)) {
                res.statusCode = 401;
                res.end('Unauthorized');
                return;
            }
            
            const payload = JSON.parse(body);
            if (payload.ref === 'refs/heads/main') {
                console.log('[' + new Date().toISOString() + '] Deploying...');
                exec(`cd /var/www/hackknow/repo && git pull origin main && cd app && npm ci --max-old-space-size=1536 && npm run build && cp -r dist/* /var/www/hackknow/dist/ && sudo systemctl restart nginx`, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Deploy failed:', error);
                    } else {
                        console.log('Deploy successful:', new Date().toISOString());
                    }
                });
            }
            
            res.statusCode = 200;
            res.end('OK');
        });
    } else {
        res.statusCode = 404;
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Webhook server on port ${PORT}`);
});
WEBHOOK

# 12. PM2 config
cat > /var/www/hackknow/ecosystem.config.js << 'PM2'
module.exports = {
    apps: [{
        name: 'hackknow-webhook',
        script: '/var/www/hackknow/webhook.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '100M',
        env: {
            WEBHOOK_SECRET: '${WEBHOOK_SECRET}'
        },
        log_file: '/var/www/hackknow/logs/webhook.log',
        out_file: '/var/www/hackknow/logs/webhook-out.log',
        error_file: '/var/www/hackknow/logs/webhook-error.log'
    }]
};
PM2

# Start webhook
cd /var/www/hackknow
pm2 start ecosystem.config.js
pm2 startup
pm2 save
success "Webhook server started"

# 13. Install certbot
apt-get install -y certbot python3-certbot-nginx || warn "Certbot install failed"

echo ""
echo "======================================"
echo "       SETUP COMPLETE!"
echo "======================================"
echo ""
echo "Your website is running at:"
echo "  http://$(curl -s -4 ifconfig.me)"
echo ""
echo "Next steps:"
echo "1. Point your domain DNS to: $(curl -s -4 ifconfig.me)"
echo "2. Setup SSL: sudo certbot --nginx -d ${DOMAIN}"
echo "3. Configure GitHub webhook:"
echo "   URL: http://$(curl -s -4 ifconfig.me)/github-webhook"
echo "   Secret: ${WEBHOOK_SECRET}"
echo ""
echo "Logs:"
echo "  PM2 logs: pm2 logs"
echo "  Nginx logs: sudo tail -f /var/log/nginx/access.log"
echo ""
