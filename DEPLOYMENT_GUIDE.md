# HackKnow - Production Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         HACKKNOW DEPLOYMENT                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐         ┌──────────────┐         ┌──────────────┐    │
│   │   Google     │         │   Google     │         │  WordPress   │    │
│   │   Compute    │◄───────►│   Cloud      │◄───────►│  WooCommerce │    │
│   │   Engine     │  HTTPS  │   DNS        │         │  (Backend)   │    │
│   │  (e2-micro)  │         │              │         │ shop.hack... │    │
│   └──────────────┘         └──────────────┘         └──────────────┘    │
│          │                                                              │
│          │ Nginx + Static Files                                         │
│          ▼                                                              │
│   ┌──────────────┐                                                      │
│   │   React +    │                                                      │
│   │   Vite Build │                                                      │
│   │   (Frontend) │                                                      │
│   └──────────────┘                                                      │
│                                                                          │
│   Payment: Razorpay (Client-side integration)                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## One-Shot Deployment Commands

### Step 1: Local Build & Test

```bash
# Navigate to app directory
cd app

# Install dependencies
npm install

# Create production .env
cat > .env << EOF
VITE_WORDPRESS_URL=https://shop.hackknow.com/graphql
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_RAZORPAY_KEY
EOF

# Build for production
npm run build

# Preview locally (optional)
npm run preview
```

### Step 2: GCE VM Setup

```bash
# SSH into your GCE instance
gcloud compute ssh hackknow-vm --zone=us-central1-a

# Or use regular SSH
ssh username@YOUR_VM_IP
```

### Step 3: One-Shot Server Setup

```bash
# On the GCE VM, run:
export RAZORPAY_KEY=rzp_live_YOUR_RAZORPAY_KEY
wget https://raw.githubusercontent.com/gaganchauhan1997/Yahavi2022/main/gce/setup_gce.sh
chmod +x setup_gce.sh
sudo ./setup_gce.sh
```

### Step 4: SSL Certificate

```bash
sudo certbot --nginx -d hackknow.com -d www.hackknow.com
```

## Prerequisites Checklist

### Accounts Required
- [ ] Google Cloud Platform account (with billing enabled)
- [ ] Domain name (hackknow.com) - DNS managed at your registrar
- [ ] Razorpay account with Live Key ID
- [ ] WordPress WooCommerce site (shop.hackknow.com) with WPGraphQL plugin

### GCE Free Tier Requirements
- [ ] e2-micro instance (1 shared vCPU, 1 GB memory)
- [ ] us-central1, us-west1, or us-east1 region (free tier eligible)
- [ ] 10 GB standard persistent disk (free tier eligible)
- [ ] Allow HTTP/HTTPS traffic in firewall rules

## Detailed Setup Instructions

### 1. Create GCE Instance

```bash
gcloud compute instances create hackknow-vm \
  --machine-type=e2-micro \
  --zone=us-central1-a \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB \
  --tags=http-server,https-server
```

Or via Google Cloud Console:
1. Go to Compute Engine > VM Instances
2. Click "Create Instance"
3. Select "e2-micro" machine type
4. Choose "Ubuntu 22.04 LTS" boot disk
5. Check "Allow HTTP traffic" and "Allow HTTPS traffic"
6. Create

### 2. Configure DNS

Point your domain to the GCE instance external IP:

| Type | Host | Value |
|------|------|-------|
| A | @ | YOUR_GCE_EXTERNAL_IP |
| A | www | YOUR_GCE_EXTERNAL_IP |

### 3. Environment Variables

Required environment variables on the server:

```bash
export RAZORPAY_KEY=rzp_live_YOUR_RAZORPAY_KEY_HERE
```

### 4. Firewall Rules (GCP Console)

Ensure these firewall rules exist:
- default-allow-http (port 80)
- default-allow-https (port 443)
- default-allow-ssh (port 22)

## GCE Free Tier Optimizations Included

### Memory Management
- **2GB Swap Space**: Created automatically for e2-micro (1GB RAM insufficient for Node builds)
- **Optimized swappiness**: vm.swappiness=10 prevents excessive swapping
- **Memory-limited Node builds**: --max-old-space-size=1536

### Nginx Optimizations
- **Single worker process**: Optimized for 1 vCPU
- **Brotli compression**: Better than gzip (if nginx-module-brotli available)
- **Aggressive caching**: Static assets cached 1 year with immutable flag
- **Security headers**: X-Frame-Options, HSTS ready for HTTPS

### Build Optimizations
- **npm ci**: Faster, deterministic builds
- **Clean rebuilds**: Removes old repo before cloning
- **Production-only env**: Keys only exist during build

## Maintenance Commands

### Rebuild After Code Changes

```bash
ssh username@YOUR_VM_IP
cd /var/www/hackknow/repo
sudo git pull origin main
cd app
sudo npm ci
sudo npm run build
sudo cp -r dist/* /var/www/hackknow/dist/
sudo systemctl restart nginx
```

### Monitor Server

```bash
# Check nginx status
sudo systemctl status nginx

# View real-time logs
sudo tail -f /var/log/nginx/access.log

# Check memory usage
free -h

# Check disk usage
df -h

# Monitor processes
htop
```

### SSL Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

## Troubleshooting

### Build Fails with "Out of Memory"
- Swap space should be automatically configured
- If not, manually create: `sudo fallocate -l 2G /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`

### Nginx 404 Errors
- Check config: `sudo nginx -t`
- Verify dist files: `ls -la /var/www/hackknow/dist/`
- Check permissions: `sudo chown -R www-data:www-data /var/www/hackknow`

### Products Not Loading
- Check WPGraphQL endpoint: `curl https://shop.hackknow.com/graphql`
- Verify CORS settings in WordPress
- Check browser console for errors

### Razorpay Not Working
- Verify RAZORPAY_KEY is set correctly in .env
- Check key is "rzp_live_" (not test key)
- Ensure domain is added to Razorpay dashboard allowed origins

## Performance Checklist

### PageSpeed Insights Targets
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] TTFB (Time to First Byte) < 600ms

### Implemented Optimizations
- [x] Gzip compression (level 6)
- [x] Brotli compression (if available)
- [x] Static asset caching (1 year)
- [x] Font preconnect hints
- [x] DNS prefetch
- [x] Security headers
- [x] Lazy loading styles
- [x] Font display swap

### Security Headers Applied
- [x] X-Frame-Options: SAMEORIGIN
- [x] X-Content-Type-Options: nosniff
- [x] X-XSS-Protection: 1; mode=block
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Strict-Transport-Security (enable after SSL)

## Files Reference

| File | Purpose | Location |
|------|---------|----------|
| `app/` | React frontend source | Repository root |
| `gce/setup_gce.sh` | Server setup script | `gce/setup_gce.sh` |
| `gce/nginx.conf` | Nginx configuration | `gce/nginx.conf` |
| `gce/create_firewall.sh` | GCP firewall rules | `gce/create_firewall.sh` |

## Support

For issues or questions:
1. Check logs: `sudo tail -f /var/log/nginx/error.log`
2. Verify environment: `sudo systemctl status nginx`
3. Review this guide's troubleshooting section

---

**Last Updated**: April 2026  
**GCE Instance Type**: e2-micro (Free Tier Eligible)  
**Frontend**: React 19 + Vite + Tailwind CSS  
**Backend**: WordPress + WooCommerce + WPGraphQL  
**Payment**: Razorpay
