import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { promisify } from 'node:util';
import { brotliCompress, constants, gzip } from 'node:zlib';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const gzipAsync = promisify(gzip);
const brotliAsync = promisify(brotliCompress);

function compressBuildAssets() {
    const compressible = /\.(css|html|js|json|svg|txt|xml)$/i;

    return {
        name: 'compress-build-assets',
        apply: 'build',
        async generateBundle(_options, bundle) {
            await Promise.all(
                Object.entries(bundle).map(async ([fileName, output]) => {
                    if (!compressible.test(fileName)) {
                        return;
                    }

                    const raw =
                        output.type === 'chunk'
                            ? output.code
                            : output.source instanceof Uint8Array
                              ? output.source
                              : String(output.source);
                    const source = raw instanceof Uint8Array ? raw : Buffer.from(raw);

                    if (source.byteLength < 1024) {
                        return;
                    }

                    const [gzipped, brotlied] = await Promise.all([
                        gzipAsync(source, { level: 9 }),
                        brotliAsync(source, {
                            params: {
                                [constants.BROTLI_PARAM_QUALITY]: 11,
                            },
                        }),
                    ]);

                    this.emitFile({
                        type: 'asset',
                        fileName: `${fileName}.gz`,
                        source: gzipped,
                    });
                    this.emitFile({
                        type: 'asset',
                        fileName: `${fileName}.br`,
                        source: brotlied,
                    });
                }),
            );
        },
    };
}

export default defineConfig(({ command }) => ({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        compressBuildAssets(),
    ],

    esbuild: {
        jsx: 'automatic',
        drop: command === 'build' ? ['console', 'debugger'] : [],
    },

    build: {
        chunkSizeWarningLimit: 600,
        minify: 'esbuild',
        reportCompressedSize: true,
        sourcemap: false,

        rollupOptions: {
            output: {
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
    },

    server: {
        host: '127.0.0.1',
        watch: {
            ignored: [
                '**/.wwebjs_auth/**',
                '**/.wwebjs_cache/**',
                '**/storage/app/wwebjs/**',
                '**/storage/framework/**',
                '**/storage/logs/**',
                '**/vendor/**',
            ],
        },
    },
}));
