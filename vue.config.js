const path = require('path');
const PrerenderSPAPlugin = require('prerender-spa-plugin');
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer;
const slugMap = require('./src/data/slug-map.json');

module.exports = {
  // ✅ PWA-Konfiguration
  pwa: {
    name: 'Kiezjagd',
    themeColor: '#f7f9fc',
    manifestPath: 'manifest.json',
    workboxOptions: {
      runtimeCaching: [
        {
          urlPattern: new RegExp(`^${process.env.VUE_APP_API_BASE_URL}/api/`),
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
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg|gif|css|js|woff2|woff|ttf|eot)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'static-resources',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 2592000,
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
      '/api': {
        target: process.env.VUE_APP_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api': '',
        },
        onProxyReq: (proxyReq, req) => {
          console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
        },
      },
    },
  },

  // ✅ Webpack-Konfiguration mit Prerendering
  configureWebpack: config => {
    config.resolve = {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    };

    if (process.env.NODE_ENV === 'production') {
      config.plugins = config.plugins || [];
      config.plugins.push(
        new PrerenderSPAPlugin({
          staticDir: path.join(__dirname, 'dist'),
          routes: slugMap.map(entry => `/spiel/${entry.slug}`),
          renderer: new Renderer({
            inject: {}, // optional
            renderAfterDocumentEvent: 'render-event',
            headless: true,
            timeout: 20000
          })
        })
      );
    }
  }
};
