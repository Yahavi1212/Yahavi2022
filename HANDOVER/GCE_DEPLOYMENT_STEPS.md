# GCE Deployment Steps - Quick Reference

## Prerequisites
- GCP account with billing enabled
- Domain name (hackknow.com)
- Razorpay live key
- WordPress site with WPGraphQL

---

## Step 1: Create GCE Instance

```bash
# Using gcloud CLI
gcloud compute instances create hackknow-vm \
  --machine-type=e2-micro \
  --zone=us-central1-a \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB \
  --tags=http-server,https-server

# Get external IP
gcloud compute instances describe hackknow-vm \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

**Or use GCP Console:**
1. Compute Engine > VM Instances > Create
2. Machine type: e2-micro
3. Boot disk: Ubuntu 22.04 LTS
4. Check "Allow HTTP/HTTPS traffic"
5. Create

---

## Step 2: Configure DNS

Point domain to VM IP:

| Type | Host | Value |
|------|------|-------|
| A | @ | YOUR_VM_IP |
| A | www | YOUR_VM_IP |

---

## Step 3: SSH into VM

```bash
# Option A: gcloud
gcloud compute ssh hackknow-vm --zone=us-central1-a

# Option B: Regular SSH
ssh username@YOUR_VM_IP
```

---

## Step 4: Run Setup Script

```bash
# On the VM, run:
export RAZORPAY_KEY=rzp_live_YOUR_RAZORPAY_KEY

# Download and run setup script
wget https://raw.githubusercontent.com/gaganchauhan1997/Yahavi2022/main/gce/setup_gce.sh
chmod +x setup_gce.sh
sudo ./setup_gce.sh
```

---

## Step 5: Install SSL Certificate

```bash
sudo certbot --nginx -d hackknow.com -d www.hackknow.com
```

---

## Step 6: Verify Deployment

```bash
# Check nginx status
sudo systemctl status nginx

# Test website
curl http://YOUR_VM_IP
```

---

## Post-Deployment: Configure GitHub Webhook

1. Go to GitHub repo > Settings > Webhooks > Add webhook
2. Payload URL: `https://hackknow.com/github-webhook`
3. Content type: `application/json`
4. Secret: `hackknow-deploy-secret`
5. Select: "Just the push event"

Now every push to main will auto-deploy!

---

## Troubleshooting

### Build fails with "Out of Memory"
```bash
# Check swap
free -h

# If no swap, create manually
sudo fallocate -l 2G /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Nginx 404 errors
```bash
# Test config
sudo nginx -t

# Check files
ls -la /var/www/hackknow/dist/

# Fix permissions
sudo chown -R www-data:www-data /var/www/hackknow
```

### Products not loading
```bash
# Test WordPress endpoint
curl https://shop.hackknow.com/graphql

# Check browser console for CORS errors
```

---

## Maintenance Commands

```bash
# Update code
cd /var/www/hackknow/repo
git pull origin main
cd app
npm ci
npm run build
cp -r dist/* /var/www/hackknow/dist/
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check webhook logs
sudo journalctl -u deploy-webhook -f
```
