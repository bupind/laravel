/**
 * WhatsApp Server (whatsapp-web.js / wwebjs)
 *
 * Jalankan paralel dengan Laravel:
 *   npm run dev:whatsapp
 *
 * Endpoint:
 *   GET  /api/qr        → ambil QR login { status, qr }
 *   GET  /api/status    → cek status koneksi
 *   POST /api/restart   → restart client kalau QR tidak muncul
 *   POST /api/send      → kirim pesan { to, message }
 *   POST /api/sendText  → alias send
 */

const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const PORT = Number(process.env.WWEBJS_PORT || process.env.PORT || 3001);
const SECRET = process.env.WWEBJS_SECRET || ''; // opsional, Bearer token
const CLIENT_ID = process.env.WWEBJS_CLIENT_ID || 'default';
const RUNTIME_PATH = process.env.WWEBJS_RUNTIME_PATH || path.join(process.cwd(), 'storage', 'app', 'wwebjs');
const DATA_PATH = process.env.WWEBJS_DATA_PATH || path.join(RUNTIME_PATH, 'auth');
const CACHE_PATH = process.env.WWEBJS_CACHE_PATH || path.join(RUNTIME_PATH, 'cache');
const HEADLESS = String(process.env.WWEBJS_HEADLESS || 'true').toLowerCase() !== 'false';
const WEB_VERSION = process.env.WWEBJS_WEB_VERSION || '';
const WEB_VERSION_CACHE = process.env.WWEBJS_WEB_VERSION_CACHE || '';

const app = express();
app.use(express.json({ limit: '5mb' }));

// ─── Optional auth middleware ────────────────────────────────────────────────
app.use((req, res, next) => {
    if (!SECRET) return next();

    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${SECRET}`) {
        return res.status(401).json({ ok: false, status: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    next();
});

// ─── Runtime State ───────────────────────────────────────────────────────────
let client = null;
let initializing = false;
let restartTimer = null;
let currentQrBase64 = null;
let currentQrRaw = null;
let status = 'DISCONNECTED'; // DISCONNECTED | INITIALIZING | QR_READY | AUTHENTICATED | CONNECTED | RESTARTING | AUTH_FAILURE
let lastError = null;
let lastReason = null;
let startedAt = null;
let readyAt = null;
let qrAt = null;
let restartCount = 0;
let intentionalStop = false;

function publicState(extra = {}) {
    return {
        ok: status === 'CONNECTED' || status === 'QR_READY' || status === 'AUTHENTICATED' || status === 'INITIALIZING' || status === 'RESTARTING',
        status,
        connected: status === 'CONNECTED',
        hasQr: Boolean(currentQrBase64),
        lastError,
        lastReason,
        startedAt,
        readyAt,
        qrAt,
        restartCount,
        ...extra,
    };
}

function buildClientOptions() {
    const options = {
        authStrategy: new LocalAuth({
            clientId: CLIENT_ID,
            dataPath: DATA_PATH,
        }),
        qrMaxRetries: 0,
        webVersionCache: {
            type: 'local',
            path: CACHE_PATH,
        },
        authTimeoutMs: 120000,
        takeoverOnConflict: true,
        takeoverTimeoutMs: 0,
        puppeteer: {
            headless: HEADLESS,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-extensions',
                '--no-first-run',
                '--no-zygote',
                '--disable-accelerated-2d-canvas',
            ],
        },
    };

    if (WEB_VERSION) {
        options.webVersion = WEB_VERSION;
    }

    if (WEB_VERSION_CACHE) {
        options.webVersionCache = {
            type: 'remote',
            remotePath: WEB_VERSION_CACHE,
        };
    }

    return options;
}

function bindClientEvents(instance) {
    instance.on('loading_screen', (percent, message) => {
        status = currentQrBase64 ? 'QR_READY' : 'INITIALIZING';
        console.log(`[wwebjs] loading ${percent}% ${message || ''}`.trim());
    });

    instance.on('qr', async (qr) => {
        try {
            currentQrRaw = qr;
            currentQrBase64 = await qrcode.toDataURL(qr, { margin: 1, width: 320 });
            status = 'QR_READY';
            lastError = null;
            lastReason = null;
            qrAt = new Date().toISOString();

        } catch (error) {
            status = 'AUTH_FAILURE';
            lastError = `Gagal membuat QR image: ${error.message}`;
            console.error('[wwebjs] QR render error:', error);
        }
    });

    instance.on('authenticated', () => {
        status = 'AUTHENTICATED';
        lastError = null;
        console.log('[wwebjs] Authenticated. Menunggu ready...');
    });

    instance.on('ready', () => {
        status = 'CONNECTED';
        currentQrBase64 = null;
        currentQrRaw = null;
        lastError = null;
        lastReason = null;
        readyAt = new Date().toISOString();
        console.log('[wwebjs] WhatsApp CONNECTED ✓');
    });

    instance.on('auth_failure', (message) => {
        status = 'AUTH_FAILURE';
        currentQrBase64 = null;
        currentQrRaw = null;
        lastError = message || 'Authentication failure';
        console.error('[wwebjs] Auth failure:', message);
        scheduleRestart('auth_failure');
    });

    instance.on('disconnected', (reason) => {
        status = 'DISCONNECTED';
        currentQrBase64 = null;
        currentQrRaw = null;
        lastReason = reason || 'disconnected';
        console.warn('[wwebjs] Disconnected:', reason);
        scheduleRestart(reason || 'disconnected');
    });

    instance.on('change_state', (state) => {
        console.log('[wwebjs] change_state:', state);
    });
}

async function startClient(reason = 'manual') {
    if (status === 'CONNECTED' || status === 'QR_READY' || status === 'AUTHENTICATED' || initializing) {
        return;
    }

    initializing = true;
    status = 'INITIALIZING';
    startedAt = new Date().toISOString();
    lastError = null;

    try {
        console.log(`[wwebjs] Initializing client (${reason})...`);
        client = new Client(buildClientOptions());
        bindClientEvents(client);
        await client.initialize();
    } catch (error) {
        status = 'DISCONNECTED';
        lastError = error?.stack || error?.message || String(error);
        console.error('[wwebjs] Initialize error:', lastError);
        scheduleRestart('initialize_error');
    } finally {
        initializing = false;
    }
}

async function stopClient() {
    if (restartTimer) {
        clearTimeout(restartTimer);
        restartTimer = null;
    }

    if (!client) return;

    const oldClient = client;
    client = null;
    intentionalStop = true;

    try {
        await oldClient.destroy();
    } catch (error) {
        console.warn('[wwebjs] Destroy warning:', error?.message || error);
    } finally {
        intentionalStop = false;
    }
}

function scheduleRestart(reason) {
    if (intentionalStop) return;
    if (restartTimer) return;

    status = status === 'CONNECTED' ? 'CONNECTED' : 'RESTARTING';
    restartTimer = setTimeout(async () => {
        restartTimer = null;
        restartCount += 1;
        await stopClient();
        status = 'DISCONNECTED';
        await startClient(`auto_restart:${reason}`);
    }, 3000);
}


async function clearSessionFiles() {
    const targets = [DATA_PATH, CACHE_PATH];

    for (const target of targets) {
        try {
            await fs.rm(target, { recursive: true, force: true });
            console.log(`[wwebjs] Cleared runtime path: ${target}`);
        } catch (error) {
            console.warn(`[wwebjs] Clear path warning (${target}):`, error?.message || error);
        }
    }

    currentQrBase64 = null;
    currentQrRaw = null;
    readyAt = null;
    qrAt = null;
    lastError = null;
}

async function logoutAndClearSession() {
    restartCount += 1;
    status = 'RESTARTING';

    if (client) {
        try {
            await client.logout();
            console.log('[wwebjs] Client logout success.');
        } catch (error) {
            console.warn('[wwebjs] Logout warning:', error?.message || error);
        }
    }

    await stopClient();
    await clearSessionFiles();
    status = 'DISCONNECTED';
    await startClient('api_logout_clear_session');
}

async function restartClient(reason = 'manual_restart') {
    restartCount += 1;
    status = 'RESTARTING';
    currentQrBase64 = null;
    currentQrRaw = null;
    await stopClient();
    status = 'DISCONNECTED';
    await startClient(reason);
}

async function ensureClientStarted() {
    if (!client && !initializing) {
        await startClient('api_request');
    }
}

// ─── Routes ──────────────────────────────────────────────────────────────────

app.get('/', (_req, res) => {
    res.json(publicState({ message: 'wwebjs server aktif.' }));
});

app.get('/api/status', (_req, res) => {
    res.json(publicState());
});

app.get('/api/qr', async (_req, res) => {
    await ensureClientStarted();

    if (status === 'CONNECTED') {
        return res.json(publicState({ message: 'WhatsApp sudah terhubung, tidak perlu scan QR.' }));
    }

    if (currentQrBase64) {
        return res.json(publicState({ qr: currentQrBase64, raw: currentQrRaw, message: 'QR siap discan.' }));
    }

    return res.json(publicState({
        message: status === 'RESTARTING'
            ? 'Client sedang restart. Tunggu beberapa detik lalu klik Scan QR lagi.'
            : 'QR belum tersedia. Client sedang menyiapkan WhatsApp Web, tunggu beberapa detik lalu klik Scan QR lagi.',
    }));
});

app.post('/api/restart', async (_req, res) => {
    await restartClient('api_restart');
    res.json(publicState({ message: 'Client wwebjs direstart.' }));
});

app.post('/api/logout', async (_req, res) => {
    try {
        await logoutAndClearSession();
        res.json(publicState({ message: 'Session WhatsApp dihapus. QR baru akan dibuat ulang.' }));
    } catch (error) {
        res.status(500).json(publicState({ ok: false, message: error?.message || String(error) }));
    }
});

async function handleSend(req, res) {
    if (status !== 'CONNECTED' || !client) {
        return res.status(503).json(publicState({ ok: false, message: `WhatsApp belum terhubung. Status: ${status}` }));
    }

    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).json({ ok: false, message: 'Field `to` dan `message` wajib diisi.' });
    }

    const normalized = String(to).replace(/[^0-9]/g, '');
    const chatId = normalized.endsWith('@c.us') ? normalized : `${normalized}@c.us`;

    try {
        const result = await client.sendMessage(chatId, String(message));
        res.json({ ok: true, status: 'SENT', messageId: result.id._serialized });
    } catch (error) {
        res.status(500).json(publicState({ ok: false, message: error?.message || String(error) }));
    }
}

app.post('/api/send', handleSend);
app.post('/api/sendText', handleSend);

// ─── Start HTTP Server ───────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
    console.log(`[wwebjs] Runtime path: ${RUNTIME_PATH}`);
    console.log(`[wwebjs] Auth path: ${DATA_PATH}`);
    console.log(`[wwebjs] Cache path: ${CACHE_PATH}`);
    console.log(`[wwebjs] Server jalan di http://localhost:${PORT}`);
    console.log(`[wwebjs] Endpoint:`);
    console.log(`         GET  http://localhost:${PORT}/api/qr`);
    console.log(`         GET  http://localhost:${PORT}/api/status`);
    console.log(`         POST http://localhost:${PORT}/api/restart`);
    console.log(`         POST http://localhost:${PORT}/api/send`);

    setTimeout(() => {
        startClient('server_start').catch((error) => {
            lastError = error?.message || String(error);
            console.error('[wwebjs] Boot error:', error);
        });
    }, 0);
});

server.on('error', (error) => {
    if (error?.code === 'EADDRINUSE') {
        console.error(`[wwebjs] Port ${PORT} sudah dipakai. Stop proses whatsapp-server lama atau gunakan WWEBJS_PORT berbeda.`);
        process.exit(1);
    }

    throw error;
});
