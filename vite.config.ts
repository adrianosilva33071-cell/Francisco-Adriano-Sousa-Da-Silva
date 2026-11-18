import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * Sem servidor falso da UTMify em desenvolvimento: no localhost o pixel da UTMify
 * não recebe configuração e o Pixel da Meta não é carregado, então testes locais
 * nunca geram eventos no Pixel de produção.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor-react';
          }
        },
      },
    },
  },
  server: {
    // HMR é desligado no AI Studio via DISABLE_HMR; mantido para compatibilidade.
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
});
