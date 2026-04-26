# SSL Certificate Setup for hackknow.com

## Current Status
- Website running on: http://34.44.252.70
- Domain: hackknow.com (needs DNS setup)
- SSL: Not configured yet

---

## Step 1: DNS Configuration

### Update your DNS records (GoDaddy/Namecheap/Cloudflare):

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | 34.44.252.70 | 600 |
| A | www | 34.44.252.70 | 600 |

### Check DNS propagation:
```bash
nslookup hackknow.com
nslookup www.hackknow.com
```

---

## Step 2: SSL Certificate with Certbot

### SSH into your VM:
```bash
gcloud compute ssh hackknow-vm --zone=us-central1-a
```

### Run Certbot:
```bash
sudo certbot --nginx -d hackknow.com -d www.hackknow.com
```

### Follow prompts:
1. Enter email address
2. Agree to terms
3. Choose: Redirect HTTP to HTTPS (recommended)

### Verify SSL:
```bash
sudo certbot certificates
```

---

## Step 3: Update GitHub Webhook

1. Go to: https://github.com/gaganchauhan1997/Yahavi2022/settings/hooks
2. Edit your webhook
3. Update URL to: `https://hackknow.com/github-webhook`
4. Save

---

## Step 4: Update .env on Server

```bash
# SSH into VM
gcloud compute ssh hackknow-vm --zone=us-central1-a

# Edit .env
cd /var/www/hackknow/repo/app
nano .env
```

Update:
```env
VITE_WORDPRESS_URL=https://shop.hackknow.com/graphql
VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
VITE_GCS_BUCKET=https://storage.googleapis.com/hackknow-images
```

Rebuild:
```bash
cd /var/www/hackknow/repo/app
npm ci
npm run build
cp -r dist/* /var/www/hackknow/dist/
sudo systemctl restart nginx
```

---

## Step 5: Test HTTPS

Visit:
- https://hackknow.com
- https://hackknow.com/shop
- https://hackknow.com/account

Check SSL rating:
- https://www.ssllabs.com/ssltest/analyze.html?d=hackknow.com

---

## Auto-Renewal (Automatic)

Certbot already set up auto-renewal. Verify:
```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

---

## Troubleshooting

### "Domain not found" error:
→ Wait for DNS propagation (5-60 minutes)

### "Connection refused":
→ Check VM firewall: `sudo ufw status`
→ Check GCP firewall rules

### SSL not working:
```bash
# Check nginx config
sudo nginx -t

# Check certbot logs
sudo journalctl -u certbot

# Restart services
sudo systemctl restart nginx
sudo systemctl restart certbot
```

### Mixed content errors:
→ Ensure all resources load over HTTPS
→ Update WordPress URLs to HTTPS

---

## Security Headers Added

Your nginx config already includes:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

After SSL:
- Strict-Transport-Security (HSTS) will be added

---

## Final Checklist

- [ ] DNS A records pointing to 34.44.252.70
- [ ] DNS propagated (checked with nslookup)
- [ ] SSL certificate installed
- [ ] HTTPS working (no warnings)
- [ ] Auto-renewal verified
- [ ] GitHub webhook updated to HTTPS
- [ ] Website loads on https://hackknow.com
