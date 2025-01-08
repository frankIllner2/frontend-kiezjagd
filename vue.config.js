const path = require('path');

module.exports = {
  // ✅ PWA-Konfiguration
  pwa: {
    name: 'Kiezjagd',
    themeColor: '#4DBA87',
    manifestOptions: {
      short_name: 'Spiel',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
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

  // ✅ Umgebungsvariablen sicherstellen
  env: {
    VUE_APP_API_BASE_URL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:5000',
    VUE_APP_STRIPE_PUBLIC_KEY: process.env.VUE_APP_STRIPE_PUBLIC_KEY,
    VUE_APP_FRONTEND_URL: process.env.VUE_APP_FRONTEND_URL || 'http://localhost:8080',
  },
};
