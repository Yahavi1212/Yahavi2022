#!/usr/bin/env node
/**
 * Simple deployment webhook server for HackKnow
 * Listens for POST requests and triggers auto-deploy script
 * 
 * Usage: node deploy-webhook.js
 * Default port: 9000
 * 
 * Environment variables:
 *   DEPLOY_SECRET - Secret token for webhook authentication
 *   DEPLOY_PORT - Port to listen on (default: 9000)
 *   DEPLOY_BRANCH - Branch to deploy (default: main)
 */

const http = require('http');
const { exec } = require('child_process');
const crypto = require('crypto');
const path = require('path');

const PORT = process.env.DEPLOY_PORT || 9000;
const SECRET = process.env.DEPLOY_SECRET || 'hackknow-deploy-secret';
const BRANCH = process.env.DEPLOY_BRANCH || 'main';
const SCRIPT_PATH = path.join(__dirname, 'auto-deploy.sh');

// Deployment lock to prevent concurrent deployments
let isDeploying = false;

function verifySignature(body, signature) {
    if (!signature) return false;
    const hmac = crypto.createHmac('sha256', SECRET);
    const digest = 'sha256=' + hmac.update(body).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

function runDeploy() {
    if (isDeploying) {
        console.log('[WEBHOOK] Deployment already in progress, skipping...');
        return Promise.resolve({ success: false, message: 'Deployment already in progress' });
    }

    isDeploying = true;
    console.log('[WEBHOOK] Starting deployment...');

    return new Promise((resolve) => {
        const child = exec(`bash "${SCRIPT_PATH}" ${BRANCH}`, {
            maxBuffer: 1024 * 1024 * 10, // 10MB output buffer
            timeout: 300000, // 5 minutes timeout
        }, (error, stdout, stderr) => {
            isDeploying = false;
            
            if (error) {
                console.error('[WEBHOOK] Deployment failed:', error);
                resolve({ 
                    success: false, 
                    message: 'Deployment failed', 
                    error: error.message,
                    stdout,
                    stderr 
                });
            } else {
                console.log('[WEBHOOK] Deployment successful');
                console.log(stdout);
                resolve({ 
                    success: true, 
                    message: 'Deployment completed',
                    stdout 
                });
            }
        });
    });
}

const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Hub-Signature-256');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Health check endpoint
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'ok', 
            deploying: isDeploying,
            timestamp: new Date().toISOString()
        }));
        return;
    }

    // Manual deploy endpoint (requires secret in query)
    if (req.method === 'POST' && req.url.startsWith('/deploy')) {
        const url = new URL(req.url, `http://localhost:${PORT}`);
        const providedSecret = url.searchParams.get('secret');
        
        if (providedSecret !== SECRET) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
        }

        res.writeHead(202, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            message: 'Deployment started',
            status: 'deploying',
            timestamp: new Date().toISOString()
        }));

        // Run deployment after response
        await runDeploy();
        return;
    }

    // GitHub webhook endpoint
    if (req.method === 'POST' && req.url === '/github-webhook') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            // Verify signature if present
            const signature = req.headers['x-hub-signature-256'];
            if (signature && !verifySignature(body, signature)) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid signature' }));
                return;
            }

            try {
                const payload = JSON.parse(body);
                
                // Check if push to main/master branch
                const ref = payload.ref;
                if (!ref || (!ref.includes('main') && !ref.includes('master'))) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ 
                        message: 'Ignored - not main/master branch',
                        ref 
                    }));
                    return;
                }

                // Trigger deployment
                res.writeHead(202, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    message: 'Webhook received - deployment started',
                    commit: payload.head_commit?.id,
                    timestamp: new Date().toISOString()
                }));

                await runDeploy();
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            }
        });
        return;
    }

    // Default 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
    console.log(`[WEBHOOK] Deployment server running on port ${PORT}`);
    console.log(`[WEBHOOK] Endpoints:`);
    console.log(`  - GET  /health           - Health check`);
    console.log(`  - POST /deploy?secret=   - Manual deploy (requires secret)`);
    console.log(`  - POST /github-webhook   - GitHub webhook endpoint`);
    console.log(`[WEBHOOK] Secret configured: ${SECRET ? 'Yes' : 'No (using default)'}`);
    console.log(`[WEBHOOK] Branch: ${BRANCH}`);
});
