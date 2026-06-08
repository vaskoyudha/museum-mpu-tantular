import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

// Plugin proxy TTS: mem-forward request ke Google Translate TTS dengan
// User-Agent browser sehingga respons tidak kosong (bypass CORS).
function ttsProxyPlugin(): Plugin {
  return {
    name: 'tts-proxy',
    configureServer(server) {
      server.middlewares.use(
        '/api/tts',
        async (req: IncomingMessage, res: ServerResponse) => {
          const rawUrl = req.url ?? '';
          const params = new URLSearchParams(rawUrl.startsWith('?') ? rawUrl.slice(1) : rawUrl.split('?')[1] ?? '');
          const q = params.get('q') ?? '';

          if (!q) {
            res.statusCode = 400;
            res.end('Missing q param');
            return;
          }

          const ttsUrl =
            `https://translate.google.com/translate_tts` +
            `?ie=UTF-8&tl=id&client=tw-ob&q=${encodeURIComponent(q)}`;

          try {
            const upstream = await fetch(ttsUrl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
                  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                Referer: 'https://translate.google.com/',
                Accept: 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,*/*;q=0.5',
              },
            });

            if (!upstream.ok) {
              res.statusCode = upstream.status;
              res.end('Upstream error');
              return;
            }

            const buffer = await upstream.arrayBuffer();
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = 200;
            res.end(Buffer.from(buffer));
          } catch (err) {
            console.error('[tts-proxy] error:', err);
            res.statusCode = 502;
            res.end('Proxy error');
          }
        },
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), ttsProxyPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
