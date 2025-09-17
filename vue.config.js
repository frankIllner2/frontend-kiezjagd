/* eslint-disable */
const path = require('path');

// 👉 Prerender nur, wenn ENV aktiv ist und wir im Production-Build sind
const doPrerender =
  process.env.VUE_APP_PRERENDER === '1' && process.env.NODE_ENV === 'production';

let PrerenderSPAPlugin, Renderer, slugMap;
if (doPrerender) {
  PrerenderSPAPlugin = require('prerender-spa-plugin');
  Renderer = PrerenderSPAPlugin.PuppeteerRenderer;
  try {
    slugMap = require('./src/data/slug-map.json'); // oder .js, je nach deinem Setup
  } catch (e) {
    slugMap = [];
  }
}

module.exports = {
  // ✅ PWA-Konfiguration
  pwa: {
    name: 'Kiezjagd',
    themeColor: '#E9E2D0',
    manifestPath: 'manifest.webmanifest',

    // Manifest-Inhalt überschreiben
    manifestOptions: {
      name: 'Kiezjagd',
      short_name: 'Kiezjagd',
      description: 'Das Spiel für alle Kinder',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#E9E2D0',
      theme_color: '#E9E2D0',
      icons: [
        { src: '/icons/icon-48x48.png', sizes: '48x48', type: 'image/png' },
        { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
        { src: '/icons/icon-120x120.png', sizes: '120x120', type: 'image/png' },
        { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
        { src: '/icons/icon-167x167.png', sizes: '167x167', type: 'image/png' },
        { src: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
        { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-192x192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
        { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },

    // Statische Icons im Head angleichen
    iconPaths: {
      favicon32: 'icons/icon-32x32.png',
      favicon16: 'icons/icon-16x16.png',
      appleTouchIcon: 'icons/icon-180x180.png',
      maskIcon: null,
      msTileImage: 'icons/icon-180x180.png'
    },

    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,

      // SPA-Routing: index.html als Fallback, aber NIE für API/Assets
      navigateFallback: 'index.html',
      navigateFallbackDenylist: [
        new RegExp('^/_'),
        new RegExp('^/api'),
        /\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|map|json|woff2?|ttf|eot)$/
      ],

      exclude: [/\.map$/, /asset-manifest\.json$/],

      runtimeCaching: [
        // API
        {
          urlPattern: new RegExp(
            `^${process.env.VUE_APP_API_BASE_URL || ''}/api/`
          ),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
            cacheableResponse: { statuses: [0, 200] }
          }
        },
        // Skripte & Styles
        {
          urlPattern: ({ request }) =>
            request.destination === 'script' ||
            request.destination === 'style',
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'assets',
            cacheableResponse: { statuses: [0, 200] }
          }
        },
        // Bilder
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            cacheableResponse: { statuses: [0, 200] },
            rangeRequests: true
          }
        },
        // HTML-Navigationen
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages',
            networkTimeoutSeconds: 3,
            cacheableResponse: { statuses: [0, 200] }
          }
        }
      ]
    }
  },

  css: {
    sourceMap: true,
    loaderOptions: {
      sass: {
        additionalData: `
          @use "@/assets/scss/abstracts/variables" as *;
          @use "@/assets/scss/abstracts/mixins" as *;
        `
      }
    }
  },

  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        pathRewrite: { '^/api': '' },
        onProxyReq: (proxyReq, req) => {
          console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
        }
      }
    },
    headers: { 'Cache-Control': 'no-store' }
  },

  configureWebpack: (config) => {
    config.resolve = {
      alias: { '@': path.resolve(__dirname, 'src') }
    };

    // 👉 Prerender aktivieren
    if (doPrerender) {
      const staticRoutes = ['/', '/agb', '/impressum', '/datenschutz'];

      const gameRoutes = (slugMap || []).map((e) => `/spiel/${e.slug}`);

      config.plugins = config.plugins || [];
      config.plugins.push(
        new PrerenderSPAPlugin({
          staticDir: path.join(__dirname, 'dist'),
          routes: [...staticRoutes, ...gameRoutes],
          renderer: new Renderer({
            headless: true,
            renderAfterDocumentEvent: 'render-event',
            maxConcurrentRoutes: 4,
            timeout: 30000,
             args: ['--no-sandbox', '--disable-setuid-sandbox']
          })
        })
      );
    }
  }
};
