const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const root   = path.resolve(__dirname, '..');
const isWin  = process.platform === 'win32';

function findPhp() {
    const laragonRoots = isWin
        ? [path.join(path.parse(root).root, 'laragon'), 'C:\\laragon', 'D:\\laragon']
        : [];
    const laragonCandidates = laragonRoots.flatMap((laragonRoot) => {
        const phpDir = path.join(laragonRoot, 'bin', 'php');
        if (!fs.existsSync(phpDir)) {
            return [];
        }

        return fs.readdirSync(phpDir)
            .filter((name) => name.startsWith('php-'))
            .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
            .map((name) => path.join(phpDir, name, 'php.exe'));
    });

    const candidates = isWin
        ? [
            ...laragonCandidates,
            'C:\\xampp\\php\\php.exe',
            'php',
          ]
        : ['php', 'php8.2', 'php8.1'];

    for (const p of candidates) {
        try {
            const version = execSync(`"${p}" -r "echo PHP_VERSION;"`, { encoding: 'utf8' }).trim();
            const [major, minor] = version.split('.').map(Number);
            if (major > 8 || (major === 8 && minor >= 2)) {
                return p;
            }
        } catch {}
    }
    return 'php'; // fallback
}

const php     = findPhp();
const artisan = path.join(root, 'artisan');

const colors = {
    reset:  '\x1b[0m',
    cyan:   '\x1b[36m',
    green:  '\x1b[32m',
    yellow: '\x1b[33m',
    red:    '\x1b[31m',
};

function tag(name, color) {
    return `${color}[${name}]${colors.reset}`;
}

function spawnProc(label, color, cmd, args, opts = {}) {
    const proc = spawn(cmd, args, {
        cwd:   root,
        shell: isWin,
        stdio: 'pipe',
        ...opts,
    });

    proc.stdout.on('data', (d) => {
        d.toString().split('\n').filter(Boolean).forEach((line) => {
            process.stdout.write(`${tag(label, color)} ${line}\n`);
        });
    });

    proc.stderr.on('data', (d) => {
        d.toString().split('\n').filter(Boolean).forEach((line) => {
            process.stderr.write(`${tag(label, color)} ${line}\n`);
        });
    });

    proc.on('close', (code) => {
        if (code !== 0 && code !== null) {
            console.error(`${tag(label, colors.red)} exited with code ${code}`);
        }
    });

    return proc;
}

function isPortListening(port) {
    try {
        const output = execSync(
            isWin
                ? `netstat -ano | findstr ":${port}"`
                : `lsof -iTCP:${port} -sTCP:LISTEN -P -n`,
            { encoding: 'utf8' },
        );

        return output.split(/\r?\n/).some((line) => (
            isWin
                ? line.includes('LISTENING') && line.includes(`:${port}`)
                : line.includes(`:${port}`)
        ));
    } catch {
        return false;
    }
}

console.log(`\n${colors.green}Starting dev servers...${colors.reset}\n`);
const phpProc = spawnProc('PHP', colors.yellow, php, ['artisan', 'serve', '--port=8000']);
const viteProc = spawnProc('Vite', colors.cyan, isWin ? 'npx.cmd' : 'npx', ['vite']);
const whatsappPort = Number(process.env.WWEBJS_PORT || 3001);
const whatsappProc = isPortListening(whatsappPort)
    ? null
    : spawnProc('WhatsApp', colors.green, 'node', ['whatsapp-server.cjs']);

if (!whatsappProc) {
    console.warn(`${tag('WhatsApp', colors.yellow)} port ${whatsappPort} sudah aktif; skip spawn whatsapp-server.cjs.`);
}

function shutdown() {
    console.log(`\n${colors.yellow}Shutting down...${colors.reset}`);
    phpProc.kill();
    viteProc.kill();
    whatsappProc?.kill();
    process.exit(0);
}

process.on('SIGINT',  shutdown);
process.on('SIGTERM', shutdown);
