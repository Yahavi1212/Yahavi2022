#!/usr/bin/env node
/**
 * Deployment webhook server for HackKnow.
 * Hardened version of the original script:
 *  - Mandatory DEPLOY_SECRET (no defaults)
 *  - GitHub-style HMAC signature is REQUIRED (not optional)
 *  - Manual /deploy uses constant-time secret comparison
 *  - Listens on 127.0.0.1 by default; nginx exposes /wp-deploy/ publicly
 *  - Strict branch + ref validation
 *
 * Environment variables:
 *   DEPLOY_SECRET - Shared secret for HMAC + manual triggers (REQUIRED)
 *   DEPLOY_PORT   - Port to listen on (default: 9000)
 *   DEPLOY_HOST   - Bind host (default: 127.0.0.1)
 *   DEPLOY_BRANCH - Branch to deploy (default: main)
 */

const http = require('http');
const { spawn } = require('child_process');
const crypto = require('crypto');
const path = require('path');

const PORT = Number(process.env.DEPLOY_PORT || 9000);
const HOST = process.env.DEPLOY_HOST || '127.0.0.1';
const SECRET = process.env.DEPLOY_SECRET || '';
const BRANCH = process.env.DEPLOY_BRANCH || 'main';
const SCRIPT_PATH = path.join(__dirname, 'auto-deploy.sh');

if (!SECRET) {
    console.error('[WEBHOOK] FATAL: DEPLOY_SECRET is not set. Refusing to start.');
    process.exit(1);
}

let isDeploying = false;

function timingSafeEquals(a, b) {
    const aBuf = Buffer.from(a, 'utf8');
    const bBuf = Buffer.from(b, 'utf8');
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
}

function verifyGithubSignature(body, signatureHeader) {
    if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;
    const hmac = crypto.createHmac('sha256', SECRET);
    const digest = 'sha256=' + hmac.update(body).digest('hex');
    try {
        return crypto.timingSafeEqual(
            Buffer.from(signatureHeader),
            Buffer.from(digest)
        );
    } catch {
        return false;
    }
}

function isValidBranch(name) {
    return typeof name === 'string' && /^[a-zA-Z0-9._/-]{1,128}$/.test(name) && !name.startsWith('-');
}

function runDeploy(branch) {
    if (isDeploying) {
        console.log('[WEBHOOK] Deployment already in progress, skipping...');
        return Promise.resolve({ success: false, message: 'Deployment already in progress' });
    }
    if (!isValidBranch(branch)) {
        return Promise.resolve({ success: false, message: 'Invalid branch name' });
    }

    isDeploying = true;
    console.log(`[WEBHOOK] Starting deployment for branch ${branch}...`);

    return new Promise((resolve) => {
        const child = spawn('bash', [SCRIPT_PATH, branch], {
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (d) => { stdout += d.toString(); });
        child.stderr.on('data', (d) => { stderr += d.toString(); });

        const killTimer = setTimeout(() => {
            console.error('[WEBHOOK] Deployment timed out, killing.');
            child.kill('SIGKILL');
        }, 600_000); // 10 minutes

        child.on('close', (code) => {
            clearTimeout(killTimer);
            isDeploying = false;
            if (code === 0) {
                console.log('[WEBHOOK] Deployment successful');
                resolve({ success: true, message: 'Deployment completed', stdout });
            } else {
                console.error('[WEBHOOK] Deployment failed with code', code);
                resolve({ success: false, message: 'Deployment failed', code, stdout, stderr });
            }
        });
    });
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            deploying: isDeploying,
            timestamp: new Date().toISOString(),
        }));
        return;
    }

    // Manual deploy: secret must be passed in X-Deploy-Secret header (NOT query string)
    if (req.method === 'POST' && req.url === '/deploy') {
        const provided = req.headers['x-deploy-secret'];
        if (typeof provided !== 'string' || !timingSafeEquals(provided, SECRET)) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
        }

        res.writeHead(202, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            message: 'Deployment started',
            timestamp: new Date().toISOString(),
        }));
        await runDeploy(BRANCH);
        return;
    }

    if (req.method === 'POST' && req.url === '/github-webhook') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
            if (body.length > 1_000_000) {
                req.destroy();
            }
        });
        req.on('end', async () => {
            const signature = req.headers['x-hub-signature-256'];
            if (!signature || !verifyGithubSignature(body, signature)) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid or missing signature' }));
                return;
            }

            let payload;
            try {
                payload = JSON.parse(body);
            } catch {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
                return;
            }

            const ref = typeof payload.ref === 'string' ? payload.ref : '';
            const expectedRef = `refs/heads/${BRANCH}`;
            if (ref !== expectedRef) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Ignored - ref does not match', ref }));
                return;
            }

            res.writeHead(202, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                message: 'Webhook received - deployment started',
                commit: payload.head_commit?.id,
                timestamp: new Date().toISOString(),
            }));

            await runDeploy(BRANCH);
        });
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, HOST, () => {
    console.log(`[WEBHOOK] Listening on http://${HOST}:${PORT}`);
    console.log(`[WEBHOOK] Branch: ${BRANCH}`);
    console.log('[WEBHOOK] Endpoints:');
    console.log('  - GET  /health');
    console.log('  - POST /deploy            (X-Deploy-Secret header required)');
    console.log('  - POST /github-webhook    (X-Hub-Signature-256 required)');
});
