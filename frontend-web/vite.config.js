import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Chemins absolus : nécessaires pour les routes React Router à plusieurs
  // segments (/mes-depots/:id/modifier, /utilisateurs/:id...) une fois
  // servies avec un repli SPA sur index.html (Vercel, ou le serveur HTTP
  // local d'Electron) — en relatif, les assets se résolvent par rapport au
  // chemin de l'URL courante et cassent dès qu'on quitte la racine.
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      devOptions: { enabled: true, type: 'module' },
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'SCKOLARIS - Universite ZTF',
        short_name: 'SCKOLARIS',
        description: 'Bibliothèque numérique de SCKOLARIS - Universite ZTF.',
        start_url: '/',
        display: 'standalone',
        background_color: '#f8f9ff',
        theme_color: '#001c40',
        icons: [
          { src: '/pwa-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // L'API (autre origine) n'est jamais mise en cache par le service
        // worker : les documents téléchargés sont gérés explicitement par
        // l'application via IndexedDB (services/offlineStore.js), pas par
        // une politique de cache HTTP générique.
        navigateFallbackDenylist: [/^\/api\//],
        // Le motif par défaut ne couvre pas .mjs — le worker de pdf.js
        // (pdf.worker.min.mjs, ~1,2 Mo) n'était donc jamais mis en cache :
        // même un document déjà téléchargé (IndexedDB) refusait de
        // s'afficher une fois vraiment hors ligne, faute de pouvoir charger
        // ce worker (indispensable à pdf.js, y compris pour un PDF déjà en
        // mémoire — voir Reader.jsx).
        globPatterns: ['**/*.{js,mjs,css,html,ico,png,svg,webp,woff,woff2,json}'],
      },
    }),
  ],
})
