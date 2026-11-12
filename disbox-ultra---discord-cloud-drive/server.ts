import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Memory storage for file chunks (up to 60MB per chunk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 60 * 1024 * 1024 },
});

app.use(express.json());

// API: Proxy Discord Webhook uploads to bypass any browser CORS restrictions
app.post('/api/discord/webhook', upload.single('file'), async (req, res) => {
  try {
    const rawUrl = (req.body.webhookUrl || req.query.url) as string;
    const content = (req.body.content || '') as string;
    const file = req.file;

    const webhookUrl = rawUrl?.trim().replace(/^['"`\s]+|['"`\s]+$/g, '');

    if (!webhookUrl || (!webhookUrl.includes('discord.com/api/webhooks/') && !webhookUrl.includes('discordapp.com/api/webhooks/'))) {
      return res.status(400).json({ error: 'URL de Webhook de Discord inválida. Debe ser https://discord.com/api/webhooks/{id}/{token}' });
    }

    if (!file) {
      return res.status(400).json({ error: 'No se recibió ninguna partición binaria para subir.' });
    }

    const safeName = (file.originalname || 'part.disbox').replace(/[^\w\.\-\_]/g, '_');

    // Build native FormData conforming to Discord API v10
    const discordFormData = new FormData();
    const uint8 = new Uint8Array(file.buffer);
    const blob = new Blob([uint8], { type: 'application/octet-stream' });

    // Discord v10 expects files[0], older versions accept file
    discordFormData.append('files[0]', blob, safeName);
    discordFormData.append('file', blob, safeName);
    
    // Provide both content and payload_json for maximum Discord compatibility
    const messageContent = content || `📦 **Disbox Web Node** | \`${safeName}\``;
    discordFormData.append('content', messageContent);
    discordFormData.append('payload_json', JSON.stringify({ content: messageContent }));

    // Always include ?wait=true so Discord returns message JSON with attachment details
    const separator = webhookUrl.includes('?') ? '&' : '?';
    const targetUrl = `${webhookUrl}${separator}wait=true`;

    const discordResponse = await fetch(targetUrl, {
      method: 'POST',
      body: discordFormData,
    });

    const responseText = await discordResponse.text();

    if (!discordResponse.ok) {
      console.error(`Discord Webhook error ${discordResponse.status}:`, responseText);
      return res.status(discordResponse.status).json({
        error: `Discord error (${discordResponse.status}): ${responseText}`,
      });
    }

    try {
      const json = JSON.parse(responseText);
      return res.json(json);
    } catch {
      return res.send(responseText);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error desconocido al subir a Discord';
    console.error('Webhook proxy upload error:', err);
    return res.status(500).json({ error: msg });
  }
});

// API: Ping and test a Discord Webhook
app.all('/api/discord/ping', async (req, res) => {
  try {
    const webhookUrl = (req.query.url || req.body?.webhookUrl || req.body?.url) as string;
    if (!webhookUrl || (!webhookUrl.includes('discord.com/api/webhooks/') && !webhookUrl.includes('discordapp.com/api/webhooks/'))) {
      return res.status(400).json({ ok: false, error: 'URL de Webhook inválida.' });
    }

    const start = performance.now();
    const discordResponse = await fetch(webhookUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    const latencyMs = Math.round(performance.now() - start);

    if (discordResponse.ok) {
      const data = await discordResponse.json();
      return res.json({
        ok: true,
        latencyMs,
        name: data.name,
        channel_id: data.channel_id,
        guild_id: data.guild_id,
      });
    } else {
      const errText = await discordResponse.text();
      return res.status(discordResponse.status).json({
        ok: false,
        latencyMs,
        error: `Discord respondió con error HTTP ${discordResponse.status}: ${errText}`,
      });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al conectar con Discord';
    return res.status(500).json({ ok: false, error: msg });
  }
});

// API: Stream chunk download from Discord CDN to bypass browser CORS
app.get('/api/discord/download', async (req, res) => {
  try {
    const cdnUrl = req.query.url as string;
    if (!cdnUrl || (!cdnUrl.startsWith('http://') && !cdnUrl.startsWith('https://'))) {
      return res.status(400).send('URL de descarga inválida.');
    }

    const response = await fetch(cdnUrl);
    if (!response.ok) {
      return res.status(response.status).send(`Error de Discord CDN: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');

    const buffer = await response.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al descargar de Discord CDN';
    return res.status(500).send(msg);
  }
});

// Vite Middleware for SPA development
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Disbox Ultra server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
