import { DiscordServer, DisboxFile, DisboxFolder, ActivityItem } from '../types/disbox';
import { storeChunkData } from '../utils/chunkStorage';

export const INITIAL_SERVERS: DiscordServer[] = [
  {
    id: 'srv_nexus_core',
    name: 'Nexus Core • Node Alpha',
    color: '#6366F1', // Indigo
    tier: 1,
    maxChunkSizeMb: 50,
    createdAt: Date.now() - 86400000 * 14,
    channels: [
      {
        id: 'chn_general_chunks',
        name: 'particiones-generales',
        webhookUrl: 'https://discord.com/api/webhooks/example/general-node-1',
        category: 'general',
        isSimulated: true,
        status: 'online',
        lastPingMs: 28,
        totalChunksStored: 142,
        totalBytesStored: 1024 * 1024 * 840,
      },
      {
        id: 'chn_documents_vault',
        name: 'documentos-cloud',
        webhookUrl: 'https://discord.com/api/webhooks/example/docs-node',
        category: 'documents',
        isSimulated: true,
        status: 'online',
        lastPingMs: 34,
        totalChunksStored: 64,
        totalBytesStored: 1024 * 1024 * 312,
      },
    ],
  },
  {
    id: 'srv_media_cdn',
    name: 'Media CDN • Guild Stream',
    color: '#8B5CF6', // Purple
    tier: 2,
    maxChunkSizeMb: 100,
    createdAt: Date.now() - 86400000 * 20,
    channels: [
      {
        id: 'chn_video_stream',
        name: 'streaming-chunks-4k',
        webhookUrl: 'https://discord.com/api/webhooks/example/video-node',
        category: 'media',
        isSimulated: true,
        status: 'online',
        lastPingMs: 22,
        totalChunksStored: 280,
        totalBytesStored: 1024 * 1024 * 2400,
      },
      {
        id: 'chn_raw_assets',
        name: 'assets-graficos',
        webhookUrl: 'https://discord.com/api/webhooks/example/assets-node',
        category: 'media',
        isSimulated: true,
        status: 'online',
        lastPingMs: 19,
        totalChunksStored: 110,
        totalBytesStored: 1024 * 1024 * 650,
      },
    ],
  },
  {
    id: 'srv_cold_vault',
    name: 'Cold Vault • Guild Respaldo',
    color: '#10B981', // Emerald
    tier: 3,
    maxChunkSizeMb: 500,
    createdAt: Date.now() - 86400000 * 30,
    channels: [
      {
        id: 'chn_cold_archives',
        name: 'respaldos-comprimidos',
        webhookUrl: 'https://discord.com/api/webhooks/example/backup-node',
        category: 'archives',
        isSimulated: true,
        status: 'online',
        lastPingMs: 41,
        totalChunksStored: 85,
        totalBytesStored: 1024 * 1024 * 4200,
      },
      {
        id: 'chn_cold_extras',
        name: 'respaldos-extras',
        webhookUrl: 'https://discord.com/api/webhooks/example/cipher-node',
        category: 'archives',
        isSimulated: true,
        status: 'online',
        lastPingMs: 31,
        totalChunksStored: 45,
        totalBytesStored: 1024 * 1024 * 890,
      },
    ],
  },
];

export const INITIAL_FOLDERS: DisboxFolder[] = [
  {
    id: 'fld_docs',
    name: 'Documentos & Auditoría',
    parentId: null,
    color: '#3B82F6',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'fld_media',
    name: 'Contenido Multimedia',
    parentId: null,
    color: '#8B5CF6',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'fld_backups',
    name: 'Respaldos de Base de Datos',
    parentId: null,
    color: '#10B981',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'fld_vault',
    name: 'Archivos Prioritarios',
    parentId: null,
    color: '#EC4899',
    createdAt: Date.now() - 86400000 * 2,
  },
];

export const INITIAL_FILES: DisboxFile[] = [
  {
    id: 'file_spec_disbox_v2',
    name: 'Especificacion_Tecnica_Disbox_2026.md',
    size: 48200,
    mimeType: 'text/markdown',
    extension: 'md',
    folderId: 'fld_docs',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    isEncrypted: false,
    chunks: [
      {
        chunkIndex: 0,
        totalChunks: 1,
        byteStart: 0,
        byteEnd: 48200,
        sizeBytes: 48200,
        hashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        serverId: 'srv_nexus_core',
        serverName: 'Nexus Core • Node Alpha',
        channelId: 'chn_documents_vault',
        channelName: 'documentos-cloud',
        discordMessageId: '1218903218739182390',
        discordAttachmentUrl: 'https://cdn.discordapp.com/attachments/1218903218739182390/chunk_0.bin',
        simulatedDataKey: 'disbox_chunk_sample_md',
        status: 'stored',
      },
    ],
    tags: ['markdown', 'docs', 'arquitectura'],
    description: 'Protocolo de particionado multicanal y mitigación de rate-limits en Discord Webhooks.',
  },
  {
    id: 'file_sample_json_topology',
    name: 'Topologia_Servidores_Disbox.json',
    size: 18450,
    mimeType: 'application/json',
    extension: 'json',
    folderId: 'fld_docs',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
    isEncrypted: false,
    chunks: [
      {
        chunkIndex: 0,
        totalChunks: 1,
        byteStart: 0,
        byteEnd: 18450,
        sizeBytes: 18450,
        hashSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        serverId: 'srv_nexus_core',
        serverName: 'Nexus Core • Node Alpha',
        channelId: 'chn_documents_vault',
        channelName: 'documentos-cloud',
        discordMessageId: '1218903218739182391',
        discordAttachmentUrl: 'https://cdn.discordapp.com/attachments/1218903218739182391/chunk_0.bin',
        simulatedDataKey: 'disbox_chunk_sample_json',
        status: 'stored',
      },
    ],
    tags: ['json', 'config', 'nodos'],
    description: 'Mapeo de canales primarios y de respaldo con latencias estimadas.',
  },
  {
    id: 'file_sample_code_engine',
    name: 'DisboxParallelChunker.ts',
    size: 26800,
    mimeType: 'text/typescript',
    extension: 'ts',
    folderId: 'fld_docs',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    isEncrypted: false,
    chunks: [
      {
        chunkIndex: 0,
        totalChunks: 1,
        byteStart: 0,
        byteEnd: 26800,
        sizeBytes: 26800,
        hashSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        serverId: 'srv_nexus_core',
        serverName: 'Nexus Core • Node Alpha',
        channelId: 'chn_general_chunks',
        channelName: 'particiones-generales',
        discordMessageId: '1218903218739182392',
        discordAttachmentUrl: 'https://cdn.discordapp.com/attachments/1218903218739182392/chunk_0.bin',
        simulatedDataKey: 'disbox_chunk_sample_ts',
        status: 'stored',
      },
    ],
    tags: ['typescript', 'engine', 'codigo'],
    description: 'Motor asíncrono de streaming binario con balanceo Round-Robin.',
  },
  {
    id: 'file_sample_image_banner',
    name: 'Diagrama_Arquitectura_Nodos.svg',
    size: 15400,
    mimeType: 'image/svg+xml',
    extension: 'svg',
    folderId: 'fld_media',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
    isEncrypted: false,
    chunks: [
      {
        chunkIndex: 0,
        totalChunks: 1,
        byteStart: 0,
        byteEnd: 15400,
        sizeBytes: 15400,
        hashSha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
        serverId: 'srv_media_cdn',
        serverName: 'Media CDN • Guild Stream',
        channelId: 'chn_raw_assets',
        channelName: 'assets-graficos',
        discordMessageId: '1218903218739182393',
        discordAttachmentUrl: 'https://cdn.discordapp.com/attachments/1218903218739182393/chunk_0.bin',
        simulatedDataKey: 'disbox_chunk_sample_svg',
        status: 'stored',
      },
    ],
    tags: ['imagen', 'diagrama', 'svg'],
    description: 'Diagrama vectorial de particionado y distribución de cargas.',
  },
  {
    id: 'file_sample_archive_prod',
    name: 'Backup_Disbox_Cluster_Full.tar.gz',
    size: 48500000, // 48.5 MB, partitioned into 3 chunks across 3 servers!
    mimeType: 'application/gzip',
    extension: 'gz',
    folderId: 'fld_backups',
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 86400000 * 6,
    isEncrypted: false,
    chunks: [
      {
        chunkIndex: 0,
        totalChunks: 3,
        byteStart: 0,
        byteEnd: 20000000,
        sizeBytes: 20000000,
        hashSha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
        serverId: 'srv_cold_vault',
        serverName: 'Cold Vault • Guild Respaldo',
        channelId: 'chn_cold_archives',
        channelName: 'respaldos-comprimidos',
        discordMessageId: '1218903218739182401',
        discordAttachmentUrl: 'https://cdn.discordapp.com/attachments/1218903218739182401/part_1.bin',
        simulatedDataKey: 'disbox_chunk_sample_archive_0',
        status: 'stored',
      },
      {
        chunkIndex: 1,
        totalChunks: 3,
        byteStart: 20000000,
        byteEnd: 40000000,
        sizeBytes: 20000000,
        hashSha256: 'b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01',
        serverId: 'srv_media_cdn',
        serverName: 'Media CDN • Guild Stream',
        channelId: 'chn_video_stream',
        channelName: 'streaming-chunks-4k',
        discordMessageId: '1218903218739182402',
        discordAttachmentUrl: 'https://cdn.discordapp.com/attachments/1218903218739182402/part_2.bin',
        simulatedDataKey: 'disbox_chunk_sample_archive_1',
        status: 'stored',
      },
      {
        chunkIndex: 2,
        totalChunks: 3,
        byteStart: 40000000,
        byteEnd: 48500000,
        sizeBytes: 8500000,
        hashSha256: 'c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef012',
        serverId: 'srv_nexus_core',
        serverName: 'Nexus Core • Node Alpha',
        channelId: 'chn_general_chunks',
        channelName: 'particiones-generales',
        discordMessageId: '1218903218739182403',
        discordAttachmentUrl: 'https://cdn.discordapp.com/attachments/1218903218739182403/part_3.bin',
        simulatedDataKey: 'disbox_chunk_sample_archive_2',
        status: 'stored',
      },
    ],
    tags: ['archivo', 'respaldo', 'striping'],
    description: 'Archivo de 48.5 MB particionado en 3 servidores diferentes con balanceo striping.',
  },
];

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act_1',
    type: 'upload',
    title: 'Archivo subido',
    description: 'Subido a Discord: Especificacion_Tecnica_Disbox_2026.md',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
    fileName: 'Especificacion_Tecnica_Disbox_2026.md',
    fileSize: 48200,
    folderName: 'Documentos & Auditoría',
    details: '1 partición (48.2 KB) almacenada en #documentos-cloud',
  },
  {
    id: 'act_2',
    type: 'move',
    title: 'Archivo movido',
    description: 'Movido a carpeta "Documentos & Auditoría"',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
    fileName: 'Topologia_Servidores_Disbox.json',
    folderName: 'Documentos & Auditoría',
    details: 'Origen: Directorio Raíz ➔ Destino: Documentos & Auditoría',
  },
  {
    id: 'act_3',
    type: 'tag',
    title: 'Etiquetas actualizadas',
    description: 'Añadidas etiquetas [#typescript, #engine] a DisboxParallelChunker.ts',
    timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    fileName: 'DisboxParallelChunker.ts',
    details: 'Etiquetas activas: #typescript, #engine, #codigo',
  },
  {
    id: 'act_4',
    type: 'upload',
    title: 'Archivo particionado subido',
    description: 'Backup_Disbox_Cluster_Full.tar.gz subido y dividido en 3 nodos',
    timestamp: Date.now() - 1000 * 60 * 360, // 6 hours ago
    fileName: 'Backup_Disbox_Cluster_Full.tar.gz',
    fileSize: 48500000,
    folderName: 'Respaldos de Base de Datos',
    details: 'Distribuido entre: Cold Vault, Media CDN y Nexus Core',
  },
  {
    id: 'act_5',
    type: 'folder_create',
    title: 'Carpeta creada',
    description: 'Nueva carpeta creada: "Contenido Multimedia"',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    folderName: 'Contenido Multimedia',
    details: 'Identificador: fld_media (Color: Púrpura)',
  },
];

/**
 * Pre-populate IndexedDB with sample data so downloads and previews work out of the box
 */
export async function seedSampleChunks(): Promise<void> {
  const enc = new TextEncoder();

  // Sample Markdown
  const mdContent = `# Especificación Técnica de Disbox Ultra

Disbox Ultra es un sistema de almacenamiento en la nube que utiliza servidores y canales de Discord como almacén de datos (Object Storage) con particionado automático (chunking) y balanceo multicanal.

## Características Principales
1. **Particionado Inteligente (Chunking)**:
   - Los archivos de cualquier tamaño se dividen en partes respetando los límites de Discord (25MB free, 50MB Tier 1, etc.).
2. **Topología Multiseridor**:
   - Asignación configurable mediante Round-Robin Striping o selección de canal directo.
3. **Gestión de Etiquetas**:
   - Clasificación por tags dinámicos (#docs, #imagen, #respaldo).
4. **Reensamblado en Streaming**:
   - Reconstrucción de blobs binarios con comprobación de checksums SHA-256.
`;

  await storeChunkData('disbox_chunk_sample_md', enc.encode(mdContent).buffer);

  // Sample JSON
  const jsonContent = JSON.stringify(
    {
      cluster: 'Disbox Ultra Cluster Alpha',
      version: '3.0.0',
      active_nodes: 3,
      distribution_strategy: 'round_robin_striping',
      tags_enabled: true,
      status: 'healthy',
      metrics: {
        total_chunks_stored: 489,
        total_data_gb: 9.3,
        rate_limit_backoff_ms: 250,
      },
    },
    null,
    2
  );
  await storeChunkData('disbox_chunk_sample_json', enc.encode(jsonContent).buffer);

  // Sample TypeScript
  const tsContent = `// DisboxParallelChunker.ts
export class DisboxParallelChunker {
  private chunkSize: number;
  constructor(chunkSizeMb: number = 20) {
    this.chunkSize = chunkSizeMb * 1024 * 1024;
  }

  async splitFile(file: File): Promise<Blob[]> {
    const chunks: Blob[] = [];
    let start = 0;
    while (start < file.size) {
      const end = Math.min(start + this.chunkSize, file.size);
      chunks.push(file.slice(start, end));
      start = end;
    }
    return chunks;
  }
}
`;
  await storeChunkData('disbox_chunk_sample_ts', enc.encode(tsContent).buffer);

  // Sample SVG
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" width="100%" height="100%">
  <rect width="600" height="350" fill="#0B0F19" rx="12"/>
  <defs>
    <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1"/>
      <stop offset="100%" stop-color="#A855F7"/>
    </linearGradient>
  </defs>
  <text x="300" y="50" fill="#F8FAFC" font-size="20" font-weight="bold" text-anchor="middle" font-family="system-ui">Disbox Cloud Architecture</text>
  <circle cx="150" cy="180" r="45" fill="#1E293B" stroke="#6366F1" stroke-width="2"/>
  <text x="150" y="185" fill="#E2E8F0" font-size="12" text-anchor="middle" font-family="system-ui">Servidor 1</text>
  <circle cx="300" cy="180" r="45" fill="#1E293B" stroke="#8B5CF6" stroke-width="2"/>
  <text x="300" y="185" fill="#E2E8F0" font-size="12" text-anchor="middle" font-family="system-ui">Servidor 2</text>
  <circle cx="450" cy="180" r="45" fill="#1E293B" stroke="#10B981" stroke-width="2"/>
  <text x="450" y="185" fill="#E2E8F0" font-size="12" text-anchor="middle" font-family="system-ui">Servidor 3</text>
  <line x1="195" y1="180" x2="255" y2="180" stroke="#475569" stroke-dasharray="4" stroke-width="2"/>
  <line x1="345" y1="180" x2="405" y2="180" stroke="#475569" stroke-dasharray="4" stroke-width="2"/>
  <text x="300" y="270" fill="#94A3B8" font-size="13" text-anchor="middle" font-family="system-ui">Particiones distribuidas y redundantes entre canales de Discord</text>
</svg>`;
  await storeChunkData('disbox_chunk_sample_svg', enc.encode(svgContent).buffer);

  // Sample archive chunks (small simulated binary buffers)
  const dummyChunk1 = new Uint8Array(1024 * 10).fill(1).buffer;
  const dummyChunk2 = new Uint8Array(1024 * 10).fill(2).buffer;
  const dummyChunk3 = new Uint8Array(1024 * 10).fill(3).buffer;
  await storeChunkData('disbox_chunk_sample_archive_0', dummyChunk1);
  await storeChunkData('disbox_chunk_sample_archive_1', dummyChunk2);
  await storeChunkData('disbox_chunk_sample_archive_2', dummyChunk3);
}
