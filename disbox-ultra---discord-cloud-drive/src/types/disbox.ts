export type DiscordBoostTier = 0 | 1 | 2 | 3;

export interface DiscordChannel {
  id: string;
  name: string;
  webhookUrl: string; // Real Discord webhook or 'simulated://...'
  category: 'general' | 'media' | 'archives' | 'documents' | 'encrypted';
  isSimulated: boolean;
  status: 'online' | 'untested' | 'error';
  lastPingMs?: number;
  totalChunksStored: number;
  totalBytesStored: number;
}

export interface DiscordServer {
  id: string;
  name: string;
  iconUrl?: string;
  color: string;
  tier: DiscordBoostTier; // 0 = 25MB, 1 = 50MB, 2 = 100MB, 3 = 500MB
  maxChunkSizeMb: number;
  channels: DiscordChannel[];
  createdAt: number;
}

export interface FileChunk {
  chunkIndex: number;
  totalChunks: number;
  byteStart: number;
  byteEnd: number;
  sizeBytes: number;
  hashSha256: string;
  serverId: string;
  serverName: string;
  channelId: string;
  channelName: string;
  discordMessageId?: string;
  discordAttachmentUrl?: string; // Direct Discord CDN or blob link
  simulatedDataKey?: string; // Key in IndexedDB for simulated chunks
  status: 'stored' | 'missing' | 'corrupt';
}

export interface DisboxFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  extension: string;
  folderId: string | null; // null = root
  createdAt: number;
  updatedAt: number;
  isEncrypted: boolean;
  encryptionIv?: string; // Hex IV for AES-GCM
  chunks: FileChunk[];
  tags: string[];
  description?: string;
}

export interface DisboxFolder {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
  createdAt: number;
}

export type StorageStrategy = 'round_robin' | 'category_routing' | 'mirror_redundancy' | 'single_server';

export interface StorageStrategyConfig {
  mode: StorageStrategy;
  preferredServerId?: string;
  redundancyFactor: number; // e.g. 2 for RAID-1
  defaultChunkSizeMb: number; // default 10MB or 20MB
  autoEncrypt: boolean;
}

export type ThemePreset = 'discord' | 'midnight' | 'nanobanana' | 'emerald';

export interface DisboxSettings {
  theme: ThemePreset;
  strategy: StorageStrategyConfig;
  defaultChunkSizeMb: number;
  concurrencyLimit: number; // 1-4
  encryptionEnabledByDefault: boolean;
  offlineSimulatorEnabled: boolean;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  totalBytes: number;
  uploadedBytes: number;
  percent: number;
  currentChunkIndex: number;
  totalChunks: number;
  speedBps: number;
  status: 'chunking' | 'encrypting' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  targetChannelName?: string;
}

export type ActivityType =
  | 'upload'
  | 'delete'
  | 'rename'
  | 'move'
  | 'tag'
  | 'folder_create'
  | 'folder_delete';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: number;
  fileName?: string;
  fileSize?: number;
  folderName?: string;
  details?: string;
}
