/**
 * Disbox Ultra - Electron Desktop Main Process
 * Embedded Express backend server + Native HTML/JS BrowserWindow (100% self-contained)
 */

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const express = require('express');
const multer = require('multer');

let mainWindow = null;
const PORT = 3000;

function startEmbeddedServer() {
  const server = express();
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 60 * 1024 * 1024 } });

  server.use(express.json());

  // API: Discord Webhook proxy
  server.post('/api/discord/webhook', upload.single('file'), async (req, res) => {
    try {
      const rawUrl = (req.body.webhookUrl || req.query.url);
      const content = (req.body.content || '');
      const file = req.file;

      const webhookUrl = rawUrl?.trim().replace(/^['"`\s]+|['"`\s]+$/g, '');
      if (!webhookUrl || (!webhookUrl.includes('discord.com/api/webhooks/') && !webhookUrl.includes('discordapp.com/api/webhooks/'))) {
        return res.status(400).json({ error: 'URL de Webhook de Discord inválida. Debe ser https://discord.com/api/webhooks/{id}/{token}' });
      }

      if (!file) {
        return res.status(400).json({ error: 'No se recibió ninguna partición binaria para subir.' });
      }

      const safeName = (file.originalname || 'part.disbox').replace(/[^\w\.\-\_]/g, '_');
      const discordFormData = new FormData();
      const blob = new Blob([new Uint8Array(file.buffer)], { type: 'application/octet-stream' });

      discordFormData.append('files[0]', blob, safeName);
      discordFormData.append('file', blob, safeName);
      const msgContent = content || `📦 **Disbox Desktop** | \`${safeName}\``;
      discordFormData.append('content', msgContent);
      discordFormData.append('payload_json', JSON.stringify({ content: msgContent }));

      const targetUrl = `${webhookUrl}${webhookUrl.includes('?') ? '&' : '?'}wait=true`;
      const response = await fetch(targetUrl, { method: 'POST', body: discordFormData });
      const responseText = await response.text();

      if (!response.ok) {
        console.error(`Discord Webhook error ${response.status}:`, responseText);
        return res.status(response.status).json({ error: `Discord error (${response.status}): ${responseText}` });
      }

      try {
        return res.json(JSON.parse(responseText));
      } catch {
        return res.send(responseText);
      }
    } catch (err) {
      console.error('Webhook proxy error:', err);
      return res.status(500).json({ error: err.message || 'Error desconocido' });
    }
  });

  // API: Ping and test webhook
  server.all('/api/discord/ping', async (req, res) => {
    try {
      const webhookUrl = (req.query.url || req.body?.webhookUrl);
      if (!webhookUrl || (!webhookUrl.includes('discord.com/api/webhooks/') && !webhookUrl.includes('discordapp.com/api/webhooks/'))) {
        return res.status(400).json({ ok: false, error: 'URL de Webhook inválida.' });
      }

      const start = performance.now();
      const r = await fetch(webhookUrl, { method: 'GET', headers: { 'Accept': 'application/json' } });
      const latencyMs = Math.round(performance.now() - start);

      if (r.ok) {
        const data = await r.json();
        return res.json({ ok: true, latencyMs, name: data.name, channel_id: data.channel_id, guild_id: data.guild_id });
      } else {
        const errText = await r.text();
        return res.status(r.status).json({ ok: false, latencyMs, error: `Discord HTTP ${r.status}: ${errText}` });
      }
    } catch (err) {
      return res.status(500).json({ ok: false, error: err.message });
    }
  });

  // API: Stream chunk download from Discord CDN
  server.get('/api/discord/download', async (req, res) => {
    try {
      const cdnUrl = req.query.url;
      if (!cdnUrl || (!cdnUrl.startsWith('http://') && !cdnUrl.startsWith('https://'))) {
        return res.status(400).send('URL de descarga inválida.');
      }
      const r = await fetch(cdnUrl);
      if (!r.ok) return res.status(r.status).send(`Error CDN: ${r.statusText}`);
      const buf = await r.arrayBuffer();
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.send(Buffer.from(buf));
    } catch (err) {
      return res.status(500).send(err.message);
    }
  });

  // Static Frontend (dist/)
  const distPath = path.join(__dirname, '../dist');
  server.use(express.static(distPath));
  server.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`[Electron] Self-contained Express + HTML engine running on http://127.0.0.1:${PORT}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 860,
    minWidth: 980,
    minHeight: 650,
    title: 'Disbox Ultra — Discord Cloud Drive',
    backgroundColor: '#09090b',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
  });

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://discord.com') || url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startEmbeddedServer();
  // Small delay to ensure embedded server is ready
  setTimeout(createWindow, 400);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
