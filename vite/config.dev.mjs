import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { pwa } from './pwa.mjs'

export default defineConfig({
    base: './',
    plugins: [
        react(),
        pwa(),
    ],
    server: {
        port: 8080,
        host: true,
        allowedHosts: true
    }
})
