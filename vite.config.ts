import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import http from 'node:http';
import path from 'path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';

function utmifyLocalDevPlugin(): Plugin {
  let mockServer: http.Server | null = null;
  return {
    name: 'utmify-local-dev-responder',
    configureServer(server) {
      if (mockServer) return;
      mockServer = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', () => {
          const rawBody = Buffer.concat(chunks).toString('utf-8');
          let parsed: Record<string, unknown> = {};
          try {
            if (rawBody) {
              parsed = JSON.parse(rawBody) as Record<string, unknown>;
            }
          } catch {
            // Ignore malformed JSON
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });

          if (req.method === 'PUT' && req.url?.includes('/lead')) {
            res.end(JSON.stringify(true));
            return;
          }

          const eventId =
            typeof parsed.eventId === 'string' && parsed.eventId
              ? parsed.eventId
              : '69ba9a88c07c92a49bf37eb3';
          const eventType =
            typeof parsed.type === 'string' && parsed.type ? parsed.type : 'PageView';
          const pixelId =
            typeof parsed.pixelId === 'string' && parsed.pixelId
              ? parsed.pixelId
              : '6afc2b5608a5363c6845f95f';

          res.end(
            JSON.stringify({
              ok: true,
              lead: {
                _id: '6afc2b5608a5363c6845f95f',
                pixelId,
                metaPixelIds: ['2206669040218715'],
                tikTokPixelIds: [],
                geolocation: {
                  country: 'BR',
                  city: 'Sao Paulo',
                  state: 'SP',
                },
              },
              event: {
                _id: eventId,
                clientEventId: eventId,
                pixelId,
                leadId: '6afc2b5608a5363c6845f95f',
                type: eventType,
                pixelType: 'Meta',
              },
              icURLMatch: 'https://pay.cakto.com.br/',
              icRules: {
                text: [],
                css: ['utmify-ic-btn'],
                url: ['pay.cakto.com.br/'],
                autoDetect: false,
              },
              sendWebEvents: true,
              sendIc: true,
              conversionMinIntervalInMinutes: 120,
            })
          );
        });
      });
      mockServer.on('error', () => {
        // Ignore if port 3001 is already in use
      });
      mockServer.listen(3001, '127.0.0.1');
      server.httpServer?.once('close', () => {
        mockServer?.close();
        mockServer = null;
      });
    },
  };
}

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';
  if (isBuild) {
    process.env.NODE_ENV = 'production';
  }

  return {
    plugins: [react(), tailwindcss(), ...(!isBuild ? [utmifyLocalDevPlugin()] : [])],
    define: isBuild
      ? {
          'process.env.NODE_ENV': JSON.stringify('production'),
        }
      : undefined,
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      chunkSizeWarningLimit: 500,
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
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
