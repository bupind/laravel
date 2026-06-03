const { execSync, spawn } = require('child_process');
const path = require('path');

const root   = path.resolve(__dirname, '..');
const isWin  = process.platform === 'win32';

function findPhp() {
    const candidates = isWin
        ? [
            'php',
            'C:\\laragon\\bin\\php\\php8.2.x64\\php.exe',
            'C:\\laragon\\bin\\php\\php8.1.x64\\php.exe',
            'C:\\laragon\\bin\\php\\php8.3.x64\\php.exe',
            'C:\\xampp\\php\\php.exe',
          ]
        : ['php', 'php8.2', 'php8.1'];

    for (const p of candidates) {
        try {
            execSync(`"${p}" --version`, { stdio: 'ignore' });
            return p;
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

console.log(`\n${colors.green}Starting dev servers...${colors.reset}\n`);

// 1. PHP artisan serve
const phpProc = spawnProc('PHP', colors.yellow, php, ['artisan', 'serve', '--port=8000']);

// 2. Vite
const viteProc = spawnProc('Vite', colors.cyan, isWin ? 'npx.cmd' : 'npx', ['vite']);

// Graceful shutdown
function shutdown() {
    console.log(`\n${colors.yellow}Shutting down...${colors.reset}`);
    phpProc.kill();
    viteProc.kill();
    process.exit(0);
}

process.on('SIGINT',  shutdown);
process.on('SIGTERM', shutdown);
