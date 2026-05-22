import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],

    esbuild: {
        jsx: 'automatic',
        // Strip console.* and debugger in production
        drop: command === 'build' ? ['console', 'debugger'] : [],
    },

    build: {
        // Raise warning threshold slightly to avoid noise from vendor chunks
        chunkSizeWarningLimit: 600,

        rollupOptions: {
            output: {
                // Split vendor dependencies for better long-term caching
                manualChunks: (id) => {
                    if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                        return 'vendor-react';
                    }
                    if (id.includes('node_modules/@inertiajs')) {
                        return 'vendor-inertia';
                    }
                    if (id.includes('node_modules/@radix-ui') || id.includes('node_modules/lucide-react')) {
                        return 'vendor-ui';
                    }
                },
            },
        },

        // Enable source maps only in development
        sourcemap: command === 'serve',
    },

    server: {
        // Prevent Vite from binding on 0.0.0.0 in dev (local only)
        host: '127.0.0.1',
    },
}));
