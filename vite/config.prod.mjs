import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const host = process.env.TAURI_DEV_HOST;

const phasermsg = () => {
    return {
        name: 'phasermsg',
        buildStart() {
            process.stdout.write(`Building for production...\n`);
        },
        buildEnd() {
            const line = "---------------------------------------------------------";
            const msg = `❤️❤️❤️ Tell us about your game! - games@phaser.io ❤️❤️❤️`;
            process.stdout.write(`${line}\n${msg}\n${line}\n`);

            process.stdout.write(`✨ Done ✨\n`);
        }
    }
}

export default defineConfig({
    clearScreen: false,
    base: './',
    plugins: [
        react(),
        phasermsg()
    ],
    logLevel: 'warning',
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
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
        minify: process.env.TAURI_ENV_DEBUG ? false : 'terser',
        sourcemap: !!process.env.TAURI_ENV_DEBUG,
        terserOptions: {
            compress: {
                passes: 2
            },
            mangle: true,
            format: {
                comments: false
            }
        }
    }
});
