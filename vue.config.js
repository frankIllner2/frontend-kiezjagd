const path = require('path');

module.exports = {
  // ✅ PWA-Konfiguration
  pwa: {
    name: 'Kiezjagd',
    themeColor: '#f7f9fc',
    // Entferne manifestOptions, da manifest.json als Datei eingebunden wird
    manifestPath: 'manifest.json', // Pfad zur eigenen manifest.json
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

  css: {
    sourceMap: true,
    loaderOptions: {
      sass: {
        additionalData: `
          @use "@/assets/scss/abstracts/variables" as *;
          @use "@/assets/scss/abstracts/mixins" as *;
        `,
      },
    },
  },

  // ✅ Entwicklungsserver mit Proxy
  devServer: {
    proxy: {
      // Proxy für API-Requests
      '/api': {
        target: process.env.VUE_APP_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
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
