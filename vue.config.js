const path = require('path');

module.exports = {
  // ✅ PWA-Konfiguration
  pwa: {
    name: 'Kiezjagd',
    themeColor: '#4DBA87',
    manifestOptions: {
      short_name: 'Kiez-Spiel',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      icons: [
        {
          src: '/img/icons/web-app-manifest-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/img/icons/web-app-manifest-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/img/icons/web-app-manifest-96x96.png',
          sizes: '96x96',
          type: 'image/png',
        },
      ],
    },
    workboxOptions: {
      runtimeCaching: [
        {
          // API-Caching für Produktionsumgebung
          urlPattern: new RegExp(`^${process.env.VUE_APP_API_BASE_URL}/api/`),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 86400, // Cache für 24 Stunden
            },
          },
        },
        {
          // Caching von statischen Ressourcen (Bilder, Fonts, CSS, JS)
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|css|js|woff2|woff|ttf|eot)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'static-resources',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 2592000, // Cache für 30 Tage
            },
          },
        },
      ],
    },
  },
  

  // ✅ Entwicklungsserver mit Proxy
  devServer: {
    proxy: {
      // Proxy für API-Requests
      '/api': {
        target: process.env.VUE_APP_API_BASE_URL || 'http://localhost:5000', // Standard-Backend-URL
        changeOrigin: true, // CORS-Probleme vermeiden
        secure: false, // HTTPS deaktivieren, wenn Backend lokal ohne SSL läuft
        pathRewrite: {
          '^/api': '', // Entfernt das `/api` Präfix
        },
        onProxyReq: (proxyReq, req) => {
          console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
        },
      },
    },
  },

  // ✅ Webpack-Konfiguration
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  },

};
