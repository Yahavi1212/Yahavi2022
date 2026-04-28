#!/bin/bash
# Auto-deploy script for HackKnow
# Pulls latest code, rebuilds, and deploys
# Usage: ./auto-deploy.sh [branch-name]

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log()     { echo -e "${BLUE}[DEPLOY]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

REPO_DIR="${HACKKNOW_REPO_DIR:-/var/www/hackknow/repo}"
DEPLOY_DIR="${HACKKNOW_DEPLOY_DIR:-/var/www/hackknow/dist}"
BRANCH="${1:-main}"
LOCK_FILE="/tmp/hackknow-deploy.lock"

cleanup() { rm -f "$LOCK_FILE"; }
trap cleanup EXIT

# Reject branches that would fail validation upstream
case "$BRANCH" in
    *[^a-zA-Z0-9._/-]*|-*|"")
        error "Invalid branch name: $BRANCH"
        ;;
esac

if [ -f "$LOCK_FILE" ]; then
    warn "Another deployment is already in progress"
    exit 1
fi
touch "$LOCK_FILE"

log "Starting deployment at $(date)"
log "Branch: $BRANCH"

[ -d "$REPO_DIR/.git" ] || error "Repository not found at $REPO_DIR"

cd "$REPO_DIR"

# Reset to origin (no stash drift, no local commits)
git fetch --prune origin
git reset --hard "origin/${BRANCH}" || error "Failed to reset to origin/$BRANCH"
git clean -fdx app/dist || true

COMMIT=$(git log -1 --pretty=format:"%h - %s (%ci)")
success "Latest commit: $COMMIT"

log "Installing dependencies..."
cd "$REPO_DIR/app"
npm ci || error "npm ci failed"

log "Building application..."
npm run build || error "Build failed"

[ -d "$REPO_DIR/app/dist" ] || error "Build output not found at $REPO_DIR/app/dist"

# Backup current deployment
if [ -d "$DEPLOY_DIR" ]; then
    BACKUP_DIR="/var/www/hackknow/dist-backup-$(date +%Y%m%d-%H%M%S)"
    cp -r "$DEPLOY_DIR" "$BACKUP_DIR"
    log "Backup created: $BACKUP_DIR"
fi

log "Deploying new build..."
mkdir -p "$DEPLOY_DIR"
rm -rf "$DEPLOY_DIR"/*
cp -r "$REPO_DIR/app/dist"/* "$DEPLOY_DIR/"

chown -R www-data:www-data "$DEPLOY_DIR" || warn "chown failed (need root?)"
chmod -R 755 "$DEPLOY_DIR"

log "Reloading Nginx..."
systemctl reload nginx || warn "Nginx reload had issues"

success "Deployment completed successfully!"
success "Deployed at: $(date)"
success "Commit: $COMMIT"

# Keep last 5 backups
ls -t /var/www/hackknow/dist-backup-* 2>/dev/null | tail -n +6 | xargs -r rm -rf

log "Deployment finished at $(date)"
