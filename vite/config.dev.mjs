import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
    clearScreen: false,
    base: './',
    plugins: [
        react(),
    ],
    envPrefix: ['VITE_', 'TAURI_ENV_*'],
    server: {
        host: host || false,
        port: 5173,
        strictPort: true,
        watch: {
            ignored: ['**/src-tauri/**'],
        },
    },
    build: {
        target: process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
        minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
        sourcemap: !!process.env.TAURI_ENV_DEBUG,
    },
});
