const path = require('path');

const isVercel = process.env.VERCEL === '1';
const isProd = process.env.NODE_ENV === 'production';

let PrerenderSPAPlugin, Renderer, slugMap;
if (!isVercel && isProd) {
  PrerenderSPAPlugin = require('prerender-spa-plugin');
  Renderer = PrerenderSPAPlugin.PuppeteerRenderer;
  slugMap = require('./src/data/slug-map.json');
}

module.exports = {
  // ✅ PWA-Konfiguration
  pwa: {
    name: 'Kiezjagd',
    themeColor: '#f7f9fc',
    manifestPath: 'manifest.json',
    workboxOptions: {
      // Wichtig für reibungslose Updates (in Kombi mit deinem registerServiceWorker-Change)
      skipWaiting: true,
      clientsClaim: true,

      // SPA-Routing: index.html als Fallback, aber NIE für API/Assets
      navigateFallback: 'index.html',
      navigateFallbackDenylist: [
        new RegExp('^/_'),                    // interne Pfade
        new RegExp('^/api'),                  // API
        /\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js|map|json|woff2?|ttf|eot)$/ // Assets
      ],

      // SourceMaps & Sonstiges vom Precache ausschließen
      exclude: [/\.map$/, /asset-manifest\.json$/],

      // ⚠️ KEINE expiration-Objekte → kein ExpirationPlugin → kein IndexedDB
      runtimeCaching: [
        // API: bevorzugt Netzwerk, fällt auf Cache zurück (ohne ExpirationPlugin)
        {
          urlPattern: new RegExp(`^${process.env.VUE_APP_API_BASE_URL}/api/`),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            networkTimeoutSeconds: 10,
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        // Skripte & Styles: klassisch SWR
        {
          urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'assets',
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        // Bilder: CacheFirst, aber OHNE Expiration; optional Range-Requests
        {
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: {
            cacheName: 'images',
            cacheableResponse: { statuses: [0, 200] },
            rangeRequests: true,
          },
        },
        // HTML-Navigationen (App-Shell): NetworkFirst
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages',
            networkTimeoutSeconds: 3,
            cacheableResponse: { statuses: [0, 200] },
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

  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        pathRewrite: { '^/api': '' },
        onProxyReq: (proxyReq, req) => {
          console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
        },
      },
    },
    // Damit SW im Dev nicht „sticky“ wird
    headers: { 'Cache-Control': 'no-store' },
  },

  configureWebpack: config => {
    config.resolve = {
      alias: { '@': path.resolve(__dirname, 'src') },
    };

    // 👉 Nur lokal & production: Prerender aktivieren
    if (!isVercel && isProd) {
      config.plugins = config.plugins || [];
      config.plugins.push(
        new PrerenderSPAPlugin({
          staticDir: path.join(__dirname, 'dist'),
          routes: slugMap.map(entry => `/spiel/${entry.slug}`),
          renderer: new Renderer({
            renderAfterDocumentEvent: 'render-event',
            headless: true,
            timeout: 20000
          })
        })
      );
    }
  }
};
