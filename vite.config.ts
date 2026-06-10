import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'logo.png'],
        manifest: {
          name: 'Ser Melhor',
          short_name: 'Ser Melhor',
          description:
            'Guia pessoal de estilo, cuidados e presença visual. Organize marcas, lojas, barba, cabelo, produtos, postura e ternos.',
          theme_color: '#E7DAC9',
          background_color: '#E7DAC9',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: 'logo.png',
              sizes: 'any',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any',
            },
          ],
        },
        workbox: {
          // Ativa o novo SW imediatamente (evita "não atualizou" após deploy)
          skipWaiting: true,
          clientsClaim: true,
          cleanupOutdatedCaches: true,
          // Cache JS, CSS, HTML, fonts e imagens (svg/png)
          globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
          // localStorage não precisa de cache — é local por definição
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: { cacheName: 'google-fonts-cache' },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        // Atenção: o alias '@' aponta para a RAIZ do projeto (não para src/).
        // Ex.: import x from '@/src/lib/utils' (e não '@/lib/utils').
        // Padrão herdado do Google AI Studio — manter por compatibilidade
        // até decidirmos refatorar imports.
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
