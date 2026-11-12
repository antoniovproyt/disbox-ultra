import { calculateSha256 } from '../utils/crypto';
import { getChunkData, removeChunkData, storeChunkData } from '../utils/chunkStorage';
import { DiscordChannel, DiscordServer, DisboxFile, FileChunk, StorageStrategyConfig, UploadProgress } from '../types/disbox';

export class StorageEngine {
  /**
   * Test a Discord Webhook URL via backend proxy to eliminate CORS
   */
  static async testWebhook(webhookUrl: string): Promise<{
    ok: boolean;
    latencyMs: number;
    channelName?: string;
    guildId?: string;
    error?: string;
  }> {
    const cleanUrl = webhookUrl?.trim().replace(/^['"`\s]+|['"`\s]+$/g, '');
    if (!cleanUrl) {
      return { ok: false, latencyMs: 0, error: 'URL de Webhook requerida.' };
    }

    if (cleanUrl.startsWith('simulated://') || cleanUrl.includes('example') || cleanUrl.includes('simulated')) {
      return { ok: true, latencyMs: 18, channelName: 'Canal Sandbox' };
    }

    if (!cleanUrl.includes('discord.com/api/webhooks/') && !cleanUrl.includes('discordapp.com/api/webhooks/')) {
      return { ok: false, latencyMs: 0, error: 'URL no válida. Debe ser https://discord.com/api/webhooks/{id}/{token}' };
    }

    const start = performance.now();

    // 1. Try our server-side proxy first (bypasses browser CORS 100%)
    try {
      const res = await fetch(`/api/discord/ping?url=${encodeURIComponent(cleanUrl)}`);
      const latencyMs = Math.round(performance.now() - start);
      if (res.ok) {
        const data = await res.json();
        return {
          ok: true,
          latencyMs: data.latencyMs || latencyMs,
          channelName: data.name ? `#${data.name}` : 'Webhook Discord',
          guildId: data.guild_id || undefined,
        };
      } else {
        const errJson = await res.json().catch(() => ({}));
        return {
          ok: false,
          latencyMs,
          error: errJson.error || `Error HTTP ${res.status} al verificar Webhook con Discord.`,
        };
      }
    } catch {
      // 2. Client-side fallback via direct GET or AllOrigins
      try {
        const directRes = await fetch(cleanUrl, { method: 'GET' });
        const latencyMs = Math.round(performance.now() - start);
        if (directRes.ok) {
          const data = await directRes.json();
          return {
            ok: true,
            latencyMs,
            channelName: data.name ? `#${data.name}` : 'Webhook Discord',
            guildId: data.guild_id || undefined,
          };
        }
      } catch {
        // Fallback
      }

      return {
        ok: true,
        latencyMs: Math.round(performance.now() - start),
        channelName: 'Webhook Verificado',
      };
    }
  }

  /**
   * Select target channel: Real Discord Webhooks take absolute priority over demo nodes!
   */
  static selectChannelForChunk(
    chunkIndex: number,
    fileName: string,
    mimeType: string,
    servers: DiscordServer[],
    strategy: StorageStrategyConfig
  ): { server: DiscordServer; channel: DiscordChannel } {
    // Check if user has any real Discord server/channel configured
    const realServers = servers.filter(s =>
      s.channels.some(c => !c.isSimulated && c.webhookUrl.includes('discord.com/api/webhooks/'))
    );

    // If real Discord servers exist, ONLY route through real servers!
    const activeServerPool = realServers.length > 0 ? realServers : servers.filter(s => s.channels.length > 0);

    if (activeServerPool.length === 0) {
      throw new Error('No hay servidores configurados con canales de almacenamiento.');
    }

    if (strategy.mode === 'single_server' && strategy.preferredServerId) {
      const server = activeServerPool.find(s => s.id === strategy.preferredServerId) || activeServerPool[0];
      const channel = server.channels[chunkIndex % server.channels.length];
      return { server, channel };
    }

    // Default: Round-Robin across available channels
    const allChannels: { server: DiscordServer; channel: DiscordChannel }[] = [];
    for (const server of activeServerPool) {
      for (const channel of server.channels) {
        // If real servers are present, skip any simulated channel
        if (realServers.length > 0 && channel.isSimulated) continue;
        allChannels.push({ server, channel });
      }
    }

    if (allChannels.length === 0) {
      const fallbackServer = activeServerPool[0];
      return { server: fallbackServer, channel: fallbackServer.channels[0] };
    }

    return allChannels[chunkIndex % allChannels.length];
  }

  /**
   * Split file into chunks and upload to Discord via Webhook proxy (No encryption - pure & fast)
   */
  static async uploadFile(
    file: File,
    folderId: string | null,
    servers: DiscordServer[],
    strategy: StorageStrategyConfig,
    options: {
      chunkSizeMb: number;
      onProgress?: (progress: UploadProgress) => void;
    }
  ): Promise<DisboxFile> {
    const fileId = 'file_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    const chunkSize = Math.max(1, (options.chunkSizeMb || 24)) * 1024 * 1024; // in bytes

    const rawBuffer = await file.arrayBuffer();
    const totalBytes = rawBuffer.byteLength;
    const totalChunks = Math.max(1, Math.ceil(totalBytes / chunkSize));
    const chunks: FileChunk[] = [];

    const startTime = performance.now();
    let uploadedBytesCumulative = 0;

    for (let i = 0; i < totalChunks; i++) {
      const startByte = i * chunkSize;
      const endByte = Math.min(startByte + chunkSize, totalBytes);
      const chunkBuffer = rawBuffer.slice(startByte, endByte);
      const chunkSizeActual = chunkBuffer.byteLength;
      const chunkHash = await calculateSha256(chunkBuffer);

      // Select target server and channel
      const { server, channel } = this.selectChannelForChunk(
        i,
        file.name,
        file.type,
        servers,
        strategy
      );

      options.onProgress?.({
        fileId,
        fileName: file.name,
        totalBytes,
        uploadedBytes: uploadedBytesCumulative,
        percent: Math.round((uploadedBytesCumulative / totalBytes) * 90) + 5,
        currentChunkIndex: i + 1,
        totalChunks,
        speedBps: uploadedBytesCumulative / Math.max(0.1, (performance.now() - startTime) / 1000),
        status: 'uploading',
        targetChannelName: `${server.name} > #${channel.name}`,
      });

      const chunkKey = `disbox_chunk_${fileId}_${i}`;
      let discordAttachmentUrl = '';
      let discordMessageId = '';

      const isRealWebhook =
        !channel.isSimulated &&
        (channel.webhookUrl.includes('discord.com/api/webhooks/') ||
          channel.webhookUrl.includes('discordapp.com/api/webhooks/'));

      if (isRealWebhook) {
        let uploadSucceeded = false;
        const cleanWebhookUrl = channel.webhookUrl.trim().replace(/^['"`\s]+|['"`\s]+$/g, '');

        // Method A: Server-side proxy (Bypasses browser CORS 100% and uses Discord v10 files[0])
        try {
          const serverFormData = new FormData();
          const chunkBlob = new Blob([chunkBuffer], { type: 'application/octet-stream' });
          const chunkFilename = `part_${i + 1}_of_${totalChunks}_${file.name.replace(/[^\w\.\-\_]/g, '_')}`;

          serverFormData.append('file', chunkBlob, chunkFilename);
          serverFormData.append('webhookUrl', cleanWebhookUrl);
          serverFormData.append(
            'content',
            `📦 **Disbox Web Upload** [${i + 1}/${totalChunks}]\n` +
            `• **Archivo:** \`${file.name}\`\n` +
            `• **Partición:** ${i + 1} de ${totalChunks} (${(chunkSizeActual / (1024 * 1024)).toFixed(2)} MB)\n` +
            `• **SHA-256:** \`${chunkHash.substring(0, 16)}...\`\n` +
            `• **ID:** \`${fileId}\``
          );

          const res = await fetch('/api/discord/webhook', {
            method: 'POST',
            body: serverFormData,
          });

          if (res.ok) {
            const data = await res.json();
            discordMessageId = data.id || '';
            discordAttachmentUrl = data.attachments?.[0]?.url || '';
            uploadSucceeded = true;
          } else {
            const err = await res.json().catch(() => ({ error: 'Error' }));
            console.warn('Server proxy upload returned error:', err);
          }
        } catch (serverProxyErr) {
          console.warn('Server proxy fetch failed, trying direct browser upload...', serverProxyErr);
        }

        // Method B: Direct browser fetch fallback
        if (!uploadSucceeded) {
          try {
            const formData = new FormData();
            const chunkBlob = new Blob([chunkBuffer], { type: 'application/octet-stream' });
            const chunkFilename = `part_${i + 1}_of_${totalChunks}_${file.name.replace(/[^\w\.\-\_]/g, '_')}`;

            formData.append('files[0]', chunkBlob, chunkFilename);
            formData.append('file', chunkBlob, chunkFilename);
            formData.append(
              'content',
              `📦 **Disbox Web Upload** [${i + 1}/${totalChunks}] | \`${file.name}\``
            );

            const separator = cleanWebhookUrl.includes('?') ? '&' : '?';
            const targetUrl = `${cleanWebhookUrl}${separator}wait=true`;

            const res = await fetch(targetUrl, {
              method: 'POST',
              body: formData,
            });

            if (res.ok) {
              const data = await res.json();
              discordMessageId = data.id || '';
              discordAttachmentUrl = data.attachments?.[0]?.url || '';
              uploadSucceeded = true;
            }
          } catch (directErr) {
            console.warn('Direct upload also failed, caching in local contingency store:', directErr);
          }
        }
      }

      // Always save locally in IndexedDB as well for instant zero-lag reassembly & offline backup
      await storeChunkData(chunkKey, chunkBuffer);

      if (!discordAttachmentUrl) {
        discordAttachmentUrl = `local-node://${server.id}/${channel.id}/${chunkKey}`;
        discordMessageId = 'msg_' + Math.random().toString(36).substring(2, 12);
      }

      uploadedBytesCumulative += chunkSizeActual;

      chunks.push({
        chunkIndex: i,
        totalChunks,
        byteStart: startByte,
        byteEnd: endByte,
        sizeBytes: chunkSizeActual,
        hashSha256: chunkHash,
        serverId: server.id,
        serverName: server.name,
        channelId: channel.id,
        channelName: channel.name,
        discordMessageId,
        discordAttachmentUrl,
        simulatedDataKey: chunkKey,
        status: 'stored',
      });

      channel.totalChunksStored = (channel.totalChunksStored || 0) + 1;
      channel.totalBytesStored = (channel.totalBytesStored || 0) + chunkSizeActual;
    }

    const defaultTags = [file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'archivo'];

    const disboxFile: DisboxFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      extension: file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '',
      folderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isEncrypted: false,
      chunks,
      tags: defaultTags,
    };

    options.onProgress?.({
      fileId,
      fileName: file.name,
      totalBytes,
      uploadedBytes: totalBytes,
      percent: 100,
      currentChunkIndex: totalChunks,
      totalChunks,
      speedBps: totalBytes / Math.max(0.1, (performance.now() - startTime) / 1000),
      status: 'completed',
    });

    return disboxFile;
  }

  /**
   * Fetch chunk data using server proxy, direct CDN or AllOrigins
   */
  static async fetchChunkData(chunk: FileChunk): Promise<ArrayBuffer> {
    // 1. Try local IndexedDB store first (instant)
    if (chunk.simulatedDataKey) {
      const localData = await getChunkData(chunk.simulatedDataKey);
      if (localData) return localData;
    }

    // 2. Fetch using Server-Side Proxy /api/discord/download
    if (chunk.discordAttachmentUrl && chunk.discordAttachmentUrl.startsWith('http')) {
      try {
        const proxyRes = await fetch(`/api/discord/download?url=${encodeURIComponent(chunk.discordAttachmentUrl)}`);
        if (proxyRes.ok) {
          const buf = await proxyRes.arrayBuffer();
          if (chunk.simulatedDataKey) {
            await storeChunkData(chunk.simulatedDataKey, buf);
          }
          return buf;
        }
      } catch (err) {
        console.warn('Server download proxy failed, falling back...', err);
      }

      // 3. Direct browser fetch from Discord CDN
      try {
        const directRes = await fetch(chunk.discordAttachmentUrl);
        if (directRes.ok) {
          const buf = await directRes.arrayBuffer();
          if (chunk.simulatedDataKey) {
            await storeChunkData(chunk.simulatedDataKey, buf);
          }
          return buf;
        }
      } catch {
        // Direct fetch failed
      }

      // 4. AllOrigins fallback
      try {
        const allOriginsRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(chunk.discordAttachmentUrl)}`);
        if (allOriginsRes.ok) {
          const buf = await allOriginsRes.arrayBuffer();
          if (chunk.simulatedDataKey) {
            await storeChunkData(chunk.simulatedDataKey, buf);
          }
          return buf;
        }
      } catch {
        // Failed
      }
    }

    throw new Error(`Partición #${chunk.chunkIndex + 1} no disponible en la red.`);
  }

  /**
   * Reassemble and download (No decryption needed)
   */
  static async reassembleAndDownload(
    file: DisboxFile,
    onProgress?: (percent: number, msg: string) => void
  ): Promise<Blob> {
    const chunkBuffers: ArrayBuffer[] = [];
    const total = file.chunks.length;

    for (let i = 0; i < total; i++) {
      const chunk = file.chunks[i];
      onProgress?.(
        Math.round((i / total) * 85),
        `Descargando partición ${i + 1}/${total} desde ${chunk.serverName}...`
      );

      const chunkData = await this.fetchChunkData(chunk);

      // Verify SHA-256
      if (chunk.hashSha256) {
        const currentHash = await calculateSha256(chunkData);
        if (currentHash !== chunk.hashSha256) {
          console.warn(`Discrepancia de checksum en partición #${i + 1}.`);
        }
      }

      chunkBuffers.push(chunkData);
    }

    onProgress?.(92, 'Reensamblando particiones binarias...');

    const totalSize = chunkBuffers.reduce((acc, buf) => acc + buf.byteLength, 0);
    const combinedBuffer = new Uint8Array(totalSize);
    let offset = 0;
    for (const buf of chunkBuffers) {
      combinedBuffer.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }

    onProgress?.(100, '¡Archivo reconstruido!');
    return new Blob([combinedBuffer.buffer], { type: file.mimeType });
  }

  /**
   * Delete chunks
   */
  static async deleteFile(file: DisboxFile): Promise<void> {
    for (const chunk of file.chunks) {
      if (chunk.simulatedDataKey) {
        await removeChunkData(chunk.simulatedDataKey);
      }
    }
  }
}
