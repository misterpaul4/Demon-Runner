import { VitePWA } from 'vite-plugin-pwa';

export const pwa = () =>
    VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.png', 'apple-touch-icon-180x180.png', 'pwa-64x64.png'],
        manifest: {
            name: 'Demon Runner',
            short_name: 'Demon Runner',
            description: 'Dodge the murder, outrun the dark. An endless gothic runner through a haunted night.',
            theme_color: '#05040a',
            background_color: '#05040a',
            display: 'fullscreen',
            orientation: 'landscape',
            start_url: '.',
            scope: '.',
            icons: [
                { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
                { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
                { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
            ]
        },
        workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,gif,webp,mp3,wav,ogg,woff,woff2,json}'],
            maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
            cleanupOutdatedCaches: true,
            clientsClaim: true,
            runtimeCaching: [
                {
                    urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
                    handler: 'StaleWhileRevalidate',
                    options: { cacheName: 'google-fonts-stylesheets' }
                },
                {
                    urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
                    handler: 'CacheFirst',
                    options: {
                        cacheName: 'google-fonts-webfonts',
                        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
                        cacheableResponse: { statuses: [0, 200] }
                    }
                }
            ]
        }
    });
