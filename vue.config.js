module.exports = {
  // PWA-Optionen
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
          urlPattern: /^http:\/\/localhost:5000\/api\//,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 86400,
            },
          },
        },
      ],
    },
  },

  // Proxy-Setup für Entwicklungsumgebung
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // API-Backend-URL
        changeOrigin: true, // Ändert den Origin-Header, um CORS-Probleme zu vermeiden
        secure: false, // Nur wenn HTTPS deaktiviert ist
        pathRewrite: {
          '^/api': '', // Entfernt das /api-Präfix bei Weiterleitung
        },
        onProxyReq: (proxyReq, req) => {
          console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
        },
      },
    },
  },

  // Build-spezifische Optionen
  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src'),
      },
    },
  },
};
