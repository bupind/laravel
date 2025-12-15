import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    base: 'http://grusefi11.test',
    plugins: [
        laravel({
            input: [
                'resources/sass/style.scss',
                'resources/js/scripts.js',
                'resources/js/plugins.js'
            ],
            refresh: true,
            publicDirectory: 'public',
            buildDirectory: 'build'
        }),
    ],
});
