module.exports = {
    apps: [
        {
            name: 'wwebjs',
            script: 'whatsapp-server.cjs',
            cwd: __dirname,
            interpreter: 'node',
            watch: false,
            max_restarts: 10,
            restart_delay: 3000,
            env: {
                NODE_ENV: 'production',
                WWEBJS_HEADLESS: 'true',
                WWEBJS_PORT: process.env.WWEBJS_PORT || '3001',
                WWEBJS_CLIENT_ID: process.env.WWEBJS_CLIENT_ID || 'default',
            },
        },
    ],
};
