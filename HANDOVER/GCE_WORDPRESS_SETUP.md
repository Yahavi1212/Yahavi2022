# Complete GCE + WordPress + Auto-Deploy Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HACKKNOW ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────────────┐         ┌──────────────────┐         ┌────────────┐   │
│   │   GitHub         │◄────────│   GitHub         │────────►│   GCE VM   │   │
│   │   Repository     │  Push   │   Webhook        │  Trigger│   (e2-micro)│   │
│   │   (Source Code)  │         │                  │         │            │   │
│   └──────────────────┘         └──────────────────┘         │  ┌──────┐  │   │
│                                                             │  │Nginx │  │   │
│   ┌──────────────────┐                                       │  │React │  │   │
│   │   Cloud Storage  │◄─────────────────────────────────────┘  │Static│  │   │
│   │   (Product       │          Serves product images           │Files│  │   │
│   │    Images)       │                                        └──────┘  │   │
│   └──────────────────┘                                                   │   │
│          ▲                                                               │   │
│          │ Fetch Products                                                 │   │
│          │ via WPGraphQL                                                │   │
│   ┌──────────────────┐         ┌──────────────────┐                       │   │
│   │   Hostinger      │◄───────│   WordPress      │                       │   │
│   │   WordPress      │  Admin  │   + WooCommerce  │                       │   │
│   │   (Backend)      │         │   + WPGraphQL    │                       │   │
│   │                  │         │                  │                       │   │
│   │  • Products      │         │  • Product API   │                       │   │
│   │  • Descriptions  │         │  • Orders        │                       │   │
│   │  • Prices        │         │  • Users         │                       │   │
│   │  • Files (DL)    │         │                  │                       │   │
│   └──────────────────┘         └──────────────────┘                       │   │
│                                                                             │
│   PAYMENT: Razorpay (client-side from GCE)                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Setup Guide

### PHASE 1: Create GCE VM

```bash
# 1. Create VM instance
gcloud compute instances create hackknow-vm \
  --machine-type=e2-micro \
  --zone=us-central1-a \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB \
  --tags=http-server,https-server

# 2. Get external IP
gcloud compute instances describe hackknow-vm \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'

# Output: 34.XXX.XXX.XXX (SAVE THIS IP)
```

---

### PHASE 2: Setup Cloud Storage for Images

```bash
# 1. Create storage bucket
# Go to: https://console.cloud.google.com/storage/create-bucket
# Bucket name: hackknow-images
# Location: us-central1
# Access: Fine-grained

# 2. Make bucket public for product images
gsutil iam ch allUsers:objectViewer gs://hackknow-images

# 3. Upload product images
gsutil cp local-image.jpg gs://hacknow-images/products/

# 4. Get public URL format:
# https://storage.googleapis.com/hackknow-images/products/image-name.jpg
```

---

### PHASE 3: SSH into VM and Setup

```bash
# SSH into VM
gcloud compute ssh hackknow-vm --zone=us-central1-a

# Or use: ssh username@YOUR_VM_IP
```

On the VM, run these commands:

```bash
# 1. Set environment variables
export RAZORPAY_KEY=rzp_live_YOUR_RAZORPAY_KEY_HERE
export GITHUB_WEBHOOK_SECRET=hackknow-deploy-secret

# 2. Update system
sudo apt-get update

# 3. Install dependencies
sudo apt-get install -y curl wget git nginx software-properties-common

# 4. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# 5. Setup swap (required for e2-micro)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 6. Create web directory
sudo mkdir -p /var/www/hackknow/dist
sudo chown -R $USER:$USER /var/www/hackknow
```

---

### PHASE 4: Clone Repo and Build

```bash
# 1. Clone repository
cd /var/www/hackknow
git clone https://github.com/gaganchauhan1997/Yahavi2022.git repo
cd repo/app

# 2. Create .env file
cat > .env << 'EOF'
VITE_WORDPRESS_URL=https://your-hostinger-site.com/graphql
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_RAZORPAY_KEY
VITE_GCS_BUCKET=https://storage.googleapis.com/hackknow-images
EOF

# 3. Install dependencies
npm ci --max-old-space-size=1536

# 4. Build
npm run build

# 5. Copy build to web root
cp -r dist/* /var/www/hackknow/dist/
rm -f .env  # Remove for security
```

---

### PHASE 5: Configure Nginx

Create nginx config:

```bash
sudo tee /etc/nginx/sites-available/hackknow << 'EOF'
server {
    listen 80;
    server_name hackknow.com www.hackknow.com YOUR_VM_IP;
    
    root /var/www/hackknow/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Webhook endpoint for auto-deploy
    location /github-webhook {
        proxy_pass http://localhost:9000/github-webhook;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Hub-Signature-256 $http_x_hub_signature_256;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/hackknow /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and start
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

### PHASE 6: Setup Auto-Deploy Webhook

Create webhook server:

```bash
# Install Node.js webhook service
cd /var/www/hackknow/repo
npm install -g pm2

# Create deploy script
cat > deploy-webhook.js << 'EOF'
const http = require('http');
const { exec } = require('child_process');
const crypto = require('crypto');

const SECRET = 'hackknow-deploy-secret';
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
                console.log('Deploying...');
                exec(`
                    cd /var/www/hackknow/repo && \
                    git pull origin main && \
                    cd app && \
                    npm ci --max-old-space-size=1536 && \
                    npm run build && \
                    cp -r dist/* /var/www/hackknow/dist/ && \
                    sudo systemctl restart nginx && \
                    echo "Deploy successful: $(date)"
                `, (error, stdout, stderr) => {
                    if (error) console.error('Deploy failed:', error);
                    else console.log('Deploy output:', stdout);
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
    console.log(`Webhook server running on port ${PORT}`);
});
EOF

# Start with PM2
pm2 start deploy-webhook.js --name "hackknow-deploy"
pm2 startup
pm2 save
```

---

### PHASE 7: Configure GitHub Webhook

1. Go to: https://github.com/gaganchauhan1997/Yahavi2022/settings/hooks
2. Click "Add webhook"
3. **Payload URL:** `http://YOUR_VM_IP/github-webhook`
4. **Content type:** `application/json`
5. **Secret:** `hackknow-deploy-secret`
6. Select: "Just the push event"
7. Click "Add webhook"

---

### PHASE 8: Setup WordPress (Hostinger)

#### Install Required Plugins:
1. **WPGraphQL** - Enables GraphQL API
2. **WooCommerce** - E-commerce functionality
3. **WPGraphQL for WooCommerce** - Connects WooCommerce to GraphQL
4. **Advanced Custom Fields (ACF)** - Custom product fields

#### Configure CORS:
Add to WordPress `wp-config.php`:
```php
// Allow GCE origin
header("Access-Control-Allow-Origin: http://YOUR_VM_IP");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
```

Or use plugin: "WP CORS"

#### Update GraphQL Endpoint in Code:
Edit `app/.env`:
```
VITE_WORDPRESS_URL=https://your-hostinger-site.com/graphql
```

---

### PHASE 9: SSL Certificate (HTTPS)

```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d hackknow.com -d www.hackknow.com

# Auto-renewal is configured automatically
```

---

### PHASE 10: Update GitHub Webhook to HTTPS

After SSL is working:
1. Go to GitHub webhook settings
2. Update Payload URL to: `https://hackknow.com/github-webhook`

---

## Product Image Workflow

### Option A: Google Cloud Storage (Recommended)

1. **Upload images to GCS:**
   ```bash
   gsutil cp product-image.jpg gs://hackknow-images/products/
   ```

2. **Get public URL:**
   ```
   https://storage.googleapis.com/hackknow-images/products/product-image.jpg
   ```

3. **Store in WordPress:**
   - Add image URL to product "Featured Image" or custom field
   - Use ACF to create "Product Image URL" field

### Option B: Hostinger Hosting

1. Upload images to Hostinger file manager
2. Use WordPress media library
3. WPGraphQL will serve media URLs

---

## WordPress Product Setup

### Create Product in WooCommerce:
1. Go to WordPress Admin → Products → Add New
2. Set product name, description, price
3. Add featured image (or external image URL)
4. Set product category
5. Add download file (for digital products)
6. Publish

### WPGraphQL Query Example:
```graphql
query GetProducts {
  products {
    nodes {
      id
      name
      description
      price
      image {
        sourceUrl
      }
      categories {
        nodes {
          name
        }
      }
    }
  }
}
```

---

## Testing Checklist

- [ ] GCE VM running and accessible
- [ ] Website loads at `http://VM_IP`
- [ ] HTTPS working (after SSL)
- [ ] GitHub push triggers auto-deploy
- [ ] WordPress products showing on site
- [ ] Product images loading
- [ ] Cart functionality working
- [ ] Razorpay payment loading

---

## Maintenance Commands

```bash
# SSH into VM
gcloud compute ssh hackknow-vm --zone=us-central1-a

# Check deploy logs
pm2 logs hackknow-deploy

# Manual deploy
cd /var/www/hackknow/repo
git pull origin main
cd app && npm ci && npm run build
cp -r dist/* /var/www/hackknow/dist/
sudo systemctl restart nginx

# Check nginx status
sudo systemctl status nginx

# View website logs
sudo tail -f /var/log/nginx/access.log
```

---

## Cost Estimate (Monthly)

| Service | Cost |
|---------|------|
| GCE e2-micro (us-central1) | FREE (always free tier) |
| 10GB disk | FREE |
| Cloud Storage (10GB) | ~$0.20 |
| Hostinger WordPress | ~$2.99 |
| **Total** | **~$3.19/month** |
