import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  DiscordChannel,
  DiscordServer,
  DisboxFile,
  DisboxFolder,
  DisboxSettings,
  UploadProgress,
  ActivityItem,
} from '../types/disbox';
import { INITIAL_FILES, INITIAL_FOLDERS, INITIAL_SERVERS, INITIAL_ACTIVITIES, seedSampleChunks } from '../services/mockData';
import { StorageEngine } from '../services/storageEngine';
import { ConfirmModal } from '../components/Common/ConfirmModal';

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  isDestructive?: boolean;
}

interface DisboxContextType {
  servers: DiscordServer[];
  activeServerId: string | 'all';
  setActiveServerId: (id: string | 'all') => void;
  folders: DisboxFolder[];
  files: DisboxFile[];
  currentFolderId: string | null;
  setCurrentFolderId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  selectedTagFilter: string | null;
  setSelectedTagFilter: (tag: string | null) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  sortBy: 'name' | 'date' | 'size' | 'chunks';
  setSortBy: (sort: 'name' | 'date' | 'size' | 'chunks') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  settings: DisboxSettings;
  updateSettings: (partial: Partial<DisboxSettings>) => void;
  uploadQueue: UploadProgress[];
  isUploading: boolean;

  // Modals & Sheets
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isServerModalOpen: boolean;
  setIsServerModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
  previewFile: DisboxFile | null;
  setPreviewFile: (file: DisboxFile | null) => void;
  chunkMapFile: DisboxFile | null;
  setChunkMapFile: (file: DisboxFile | null) => void;
  shareFile: DisboxFile | null;
  setShareFile: (file: DisboxFile | null) => void;
  movingFile: DisboxFile | null;
  setMovingFile: (file: DisboxFile | null) => void;
  isFolderModalOpen: boolean;
  setIsFolderModalOpen: (open: boolean) => void;
  editingFolder: DisboxFolder | null;
  setEditingFolder: (folder: DisboxFolder | null) => void;
  isDesktopModalOpen: boolean;
  setIsDesktopModalOpen: (open: boolean) => void;

  // In-app confirm modal (avoids window.confirm iframe bug)
  requestConfirm: (options: Omit<ConfirmDialogState, 'isOpen'>) => void;

  // Server & Channel Actions
  addServer: (server: Omit<DiscordServer, 'id' | 'createdAt'>) => DiscordServer;
  updateServer: (server: DiscordServer) => void;
  deleteServer: (serverId: string) => void;
  addChannel: (serverId: string, channel: Omit<DiscordChannel, 'id' | 'totalChunksStored' | 'totalBytesStored'>) => void;
  updateChannel: (serverId: string, channel: DiscordChannel) => void;
  deleteChannel: (serverId: string, channelId: string) => void;
  testChannelWebhook: (serverId: string, channelId: string) => Promise<boolean>;

  // Folder Actions
  createFolder: (name: string, color?: string, parentId?: string | null) => DisboxFolder;
  updateFolder: (folderId: string, updates: Partial<DisboxFolder>) => void;
  renameFolder: (folderId: string, newName: string) => void;
  deleteFolder: (folderId: string) => void;

  // File Actions
  uploadFileList: (files: File[], customChunkSize?: number) => Promise<void>;
  downloadFile: (file: DisboxFile) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  renameFile: (fileId: string, newName: string) => void;
  moveFile: (fileId: string, newFolderId: string | null) => void;
  addTagToFile: (fileId: string, tag: string) => void;
  removeTagFromFile: (fileId: string, tag: string) => void;
  clearAllFiles: () => Promise<void>;
  clearDemoData: () => Promise<void>;
  exportManifestJson: () => void;
  importManifestJson: (json: string) => void;

  // Activity History
  activities: ActivityItem[];
  logActivity: (item: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
  clearActivities: () => void;
  isActivityModalOpen: boolean;
  setIsActivityModalOpen: (open: boolean) => void;

  // Metrics
  totalBytesStored: number;
  totalChunksStored: number;
  totalFilesCount: number;
  allUniqueTags: string[];
}

const DisboxContext = createContext<DisboxContextType | null>(null);

const STORAGE_KEYS = {
  SERVERS: 'disbox_servers_v2',
  FOLDERS: 'disbox_folders_v2',
  FILES: 'disbox_files_v2',
  SETTINGS: 'disbox_settings_v2',
  ACTIVITIES: 'disbox_activities_v2',
};

const DEFAULT_SETTINGS: DisboxSettings = {
  theme: 'discord',
  strategy: {
    mode: 'round_robin',
    redundancyFactor: 1,
    defaultChunkSizeMb: 24,
    autoEncrypt: false,
  },
  defaultChunkSizeMb: 24,
  concurrencyLimit: 2,
  encryptionEnabledByDefault: false,
  offlineSimulatorEnabled: true,
};

export const DisboxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [servers, setServers] = useState<DiscordServer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVERS);
      return saved ? JSON.parse(saved) : INITIAL_SERVERS;
    } catch {
      return INITIAL_SERVERS;
    }
  });

  const [folders, setFolders] = useState<DisboxFolder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FOLDERS);
      return saved ? JSON.parse(saved) : INITIAL_FOLDERS;
    } catch {
      return INITIAL_FOLDERS;
    }
  });

  const [files, setFiles] = useState<DisboxFile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FILES);
      return saved ? JSON.parse(saved) : INITIAL_FILES;
    } catch {
      return INITIAL_FILES;
    }
  });

  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
    } catch {
      return INITIAL_ACTIVITIES;
    }
  });

  const [settings, setSettings] = useState<DisboxSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [activeServerId, setActiveServerId] = useState<string | 'all'>('all');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'chunks'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const isUploading = uploadQueue.some(t => t.status === 'uploading' || t.status === 'chunking');

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<DisboxFile | null>(null);
  const [chunkMapFile, setChunkMapFile] = useState<DisboxFile | null>(null);
  const [shareFile, setShareFile] = useState<DisboxFile | null>(null);
  const [movingFile, setMovingFile] = useState<DisboxFile | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<DisboxFolder | null>(null);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);

  // In-app Confirm Modal State (replaces blocked window.confirm)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  const requestConfirm = (options: Omit<ConfirmDialogState, 'isOpen'>) => {
    setConfirmDialog({
      isOpen: true,
      ...options,
    });
  };

  const closeConfirm = () => {
    setConfirmDialog(null);
  };

  const logActivity = (item: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      ...item,
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 99)]);
  };

  const clearActivities = () => {
    setActivities([]);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
  };

  // Seed sample chunks
  useEffect(() => {
    seedSampleChunks().catch(console.error);
  }, []);

  // Save changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVERS, JSON.stringify(servers));
  }, [servers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings]);

  const updateSettings = (partial: Partial<DisboxSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...partial,
      strategy: partial.strategy ? { ...prev.strategy, ...partial.strategy } : prev.strategy,
    }));
  };

  // Metrics
  const totalBytesStored = files.reduce((acc, f) => acc + f.size, 0);
  const totalChunksStored = files.reduce((acc, f) => acc + f.chunks.length, 0);
  const totalFilesCount = files.length;

  const allUniqueTags = Array.from(
    new Set(files.flatMap(f => f.tags || []))
  ).filter(Boolean);

  // Server management
  const addServer = (serverData: Omit<DiscordServer, 'id' | 'createdAt'>): DiscordServer => {
    const newServer: DiscordServer = {
      ...serverData,
      id: 'srv_' + Math.random().toString(36).substring(2, 9),
      createdAt: Date.now(),
    };
    setServers(prev => [...prev, newServer]);
    return newServer;
  };

  const updateServer = (updatedServer: DiscordServer) => {
    setServers(prev => prev.map(s => (s.id === updatedServer.id ? updatedServer : s)));
  };

  const deleteServer = (serverId: string) => {
    setServers(prev => prev.filter(s => s.id !== serverId));
    if (activeServerId === serverId) {
      setActiveServerId('all');
    }
  };

  const addChannel = (
    serverId: string,
    channelData: Omit<DiscordChannel, 'id' | 'totalChunksStored' | 'totalBytesStored'>
  ) => {
    const newChannel: DiscordChannel = {
      ...channelData,
      id: 'chn_' + Math.random().toString(36).substring(2, 9),
      totalChunksStored: 0,
      totalBytesStored: 0,
      status: channelData.isSimulated ? 'online' : 'untested',
    };

    setServers(prev =>
      prev.map(s => {
        if (s.id === serverId) {
          return {
            ...s,
            channels: [...s.channels, newChannel],
          };
        }
        return s;
      })
    );
  };

  const updateChannel = (serverId: string, updatedChannel: DiscordChannel) => {
    setServers(prev =>
      prev.map(s => {
        if (s.id === serverId) {
          return {
            ...s,
            channels: s.channels.map(c => (c.id === updatedChannel.id ? updatedChannel : c)),
          };
        }
        return s;
      })
    );
  };

  const deleteChannel = (serverId: string, channelId: string) => {
    setServers(prev =>
      prev.map(s => {
        if (s.id === serverId) {
          return {
            ...s,
            channels: s.channels.filter(c => c.id !== channelId),
          };
        }
        return s;
      })
    );
  };

  const testChannelWebhook = async (serverId: string, channelId: string): Promise<boolean> => {
    const server = servers.find(s => s.id === serverId);
    const channel = server?.channels.find(c => c.id === channelId);
    if (!channel) return false;

    const res = await StorageEngine.testWebhook(channel.webhookUrl);
    updateChannel(serverId, {
      ...channel,
      status: res.ok ? 'online' : 'error',
      lastPingMs: res.latencyMs,
    });
    return res.ok;
  };

  // Folder management
  const createFolder = (name: string, color = '#6366F1', parentId: string | null = currentFolderId): DisboxFolder => {
    const newFolder: DisboxFolder = {
      id: 'fld_' + Math.random().toString(36).substring(2, 9),
      name: name.trim() || 'Nueva Carpeta',
      parentId,
      color,
      createdAt: Date.now(),
    };
    setFolders(prev => [...prev, newFolder]);
    logActivity({
      type: 'folder_create',
      title: 'Carpeta creada',
      description: `Se creó la carpeta "${newFolder.name}"`,
      folderName: newFolder.name,
    });
    return newFolder;
  };

  const updateFolder = (folderId: string, updates: Partial<DisboxFolder>) => {
    setFolders(prev => prev.map(f => (f.id === folderId ? { ...f, ...updates } : f)));
  };

  const renameFolder = (folderId: string, newName: string) => {
    if (!newName.trim()) return;
    updateFolder(folderId, { name: newName.trim() });
  };

  const deleteFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    setFolders(prev => prev.filter(f => f.id !== folderId));
    setFiles(prev =>
      prev.map(f => (f.folderId === folderId ? { ...f, folderId: null } : f))
    );
    if (currentFolderId === folderId) {
      setCurrentFolderId(null);
    }
    if (folder) {
      logActivity({
        type: 'folder_delete',
        title: 'Carpeta eliminada',
        description: `Se eliminó la carpeta "${folder.name}"`,
        folderName: folder.name,
      });
    }
  };

  // File upload engine (direct & clean)
  const uploadFileList = async (fileList: File[], customChunkSize?: number) => {
    const chunkSizeMb = customChunkSize || settings.defaultChunkSizeMb || 24;

    for (const file of fileList) {
      const task: UploadProgress = {
        fileId: 'pending_' + Date.now(),
        fileName: file.name,
        totalBytes: file.size,
        uploadedBytes: 0,
        percent: 0,
        currentChunkIndex: 0,
        totalChunks: Math.ceil(file.size / (chunkSizeMb * 1024 * 1024)),
        speedBps: 0,
        status: 'chunking',
      };

      setUploadQueue(prev => [task, ...prev]);

      try {
        const disboxFile = await StorageEngine.uploadFile(
          file,
          currentFolderId,
          servers,
          settings.strategy,
          {
            chunkSizeMb,
            onProgress: (p) => {
              setUploadQueue(prev =>
                prev.map(item => (item.fileName === file.name ? p : item))
              );
            },
          }
        );

        setFiles(prev => [disboxFile, ...prev]);
        setServers([...servers]);

        logActivity({
          type: 'upload',
          title: 'Archivo subido',
          description: `Se subió "${disboxFile.name}" dividido en ${disboxFile.chunks.length} particiones`,
          fileName: disboxFile.name,
          fileSize: disboxFile.size,
          details: `${disboxFile.chunks.length} partes en Discord`,
        });
      } catch (err: unknown) {
        setUploadQueue(prev =>
          prev.map(item =>
            item.fileName === file.name
              ? {
                  ...item,
                  status: 'error',
                  errorMessage: err instanceof Error ? err.message : 'Error al subir a Discord',
                }
              : item
          )
        );
      }
    }
  };

  // Download & Reassemble file
  const downloadFile = async (file: DisboxFile) => {
    try {
      const blob = await StorageEngine.reassembleAndDownload(file);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      requestConfirm({
        title: 'Error de Descarga',
        message: `No se pudo descargar o reensamblar el archivo desde Discord: ${err instanceof Error ? err.message : 'Error desconocido'}`,
        confirmText: 'Entendido',
        isDestructive: false,
        onConfirm: () => {},
      });
    }
  };

  const deleteFile = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      await StorageEngine.deleteFile(file);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      logActivity({
        type: 'delete',
        title: 'Archivo eliminado',
        description: `Se eliminó el archivo "${file.name}"`,
        fileName: file.name,
      });
    }
  };

  const clearAllFiles = async () => {
    for (const f of files) {
      await StorageEngine.deleteFile(f);
    }
    setFiles([]);
    localStorage.removeItem(STORAGE_KEYS.FILES);
  };

  const clearDemoData = async () => {
    for (const f of files) {
      await StorageEngine.deleteFile(f);
    }
    setFiles([]);
    setFolders([]);
    localStorage.removeItem(STORAGE_KEYS.FILES);
    localStorage.removeItem(STORAGE_KEYS.FOLDERS);

    // Keep only the real user server, or the selected server
    const realServer = servers.find(s => s.channels.some(c => !c.isSimulated && c.webhookUrl.includes('discord.com/api/webhooks/')));
    const targetServer = realServer || servers[servers.length - 1] || servers[0];

    if (targetServer) {
      setServers([targetServer]);
      setActiveServerId(targetServer.id);
      localStorage.setItem(STORAGE_KEYS.SERVERS, JSON.stringify([targetServer]));
    }
  };

  const renameFile = (fileId: string, newName: string) => {
    const file = files.find(f => f.id === fileId);
    setFiles(prev =>
      prev.map(f => (f.id === fileId ? { ...f, name: newName, updatedAt: Date.now() } : f))
    );
    if (file) {
      logActivity({
        type: 'rename',
        title: 'Archivo renombrado',
        description: `Se renombró "${file.name}" a "${newName}"`,
        fileName: newName,
      });
    }
  };

  const moveFile = (fileId: string, newFolderId: string | null) => {
    const file = files.find(f => f.id === fileId);
    const targetFolder = newFolderId ? folders.find(f => f.id === newFolderId) : null;
    setFiles(prev =>
      prev.map(f => (f.id === fileId ? { ...f, folderId: newFolderId, updatedAt: Date.now() } : f))
    );
    if (file) {
      logActivity({
        type: 'move',
        title: 'Archivo movido',
        description: `Se movió "${file.name}" a ${targetFolder ? `"${targetFolder.name}"` : 'Directorio Raíz'}`,
        fileName: file.name,
        folderName: targetFolder ? targetFolder.name : 'Raíz',
      });
    }
  };

  // Tag Management
  const addTagToFile = (fileId: string, tag: string) => {
    const cleanTag = tag.trim().toLowerCase().replace(/^#/, '');
    if (!cleanTag) return;

    setFiles(prev =>
      prev.map(f => {
        if (f.id === fileId) {
          const currentTags = f.tags || [];
          if (!currentTags.includes(cleanTag)) {
            return { ...f, tags: [...currentTags, cleanTag] };
          }
        }
        return f;
      })
    );
  };

  const removeTagFromFile = (fileId: string, tagToRemove: string) => {
    setFiles(prev =>
      prev.map(f => {
        if (f.id === fileId) {
          return {
            ...f,
            tags: (f.tags || []).filter(t => t !== tagToRemove),
          };
        }
        return f;
      })
    );
  };

  // Export / Import drive manifest
  const exportManifestJson = () => {
    const manifest = {
      app: 'Disbox Web',
      version: '3.0',
      exportedAt: new Date().toISOString(),
      servers,
      folders,
      files,
      settings,
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disbox_manifest_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importManifestJson = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.servers)) setServers(data.servers);
      if (Array.isArray(data.folders)) setFolders(data.folders);
      if (Array.isArray(data.files)) setFiles(data.files);
      if (data.settings) setSettings(data.settings);
    } catch {
      // Parse error
    }
  };

  return (
    <DisboxContext.Provider
      value={{
        servers,
        activeServerId,
        setActiveServerId,
        folders,
        files,
        currentFolderId,
        setCurrentFolderId,
        searchQuery,
        setSearchQuery,
        categoryFilter,
        setCategoryFilter,
        selectedTagFilter,
        setSelectedTagFilter,
        viewMode,
        setViewMode,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        settings,
        updateSettings,
        uploadQueue,
        isUploading,

        isUploadModalOpen,
        setIsUploadModalOpen,
        isServerModalOpen,
        setIsServerModalOpen,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        previewFile,
        setPreviewFile,
        chunkMapFile,
        setChunkMapFile,
        shareFile,
        setShareFile,
        movingFile,
        setMovingFile,
        isFolderModalOpen,
        setIsFolderModalOpen,
        editingFolder,
        setEditingFolder,
        isDesktopModalOpen,
        setIsDesktopModalOpen,

        requestConfirm,

        addServer,
        updateServer,
        deleteServer,
        addChannel,
        updateChannel,
        deleteChannel,
        testChannelWebhook,

        createFolder,
        updateFolder,
        renameFolder,
        deleteFolder,

        uploadFileList,
        downloadFile,
        deleteFile,
        renameFile,
        moveFile,
        addTagToFile,
        removeTagFromFile,
        clearAllFiles,
        clearDemoData,
        exportManifestJson,
        importManifestJson,

        totalBytesStored,
        totalChunksStored,
        totalFilesCount,
        allUniqueTags,

        activities,
        logActivity,
        clearActivities,
        isActivityModalOpen,
        setIsActivityModalOpen,
      }}
    >
      {children}

      {/* Render in-app confirm dialog globally */}
      {confirmDialog && (
        <ConfirmModal
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
          isDestructive={confirmDialog.isDestructive}
          onConfirm={() => {
            confirmDialog.onConfirm();
            closeConfirm();
          }}
          onCancel={closeConfirm}
        />
      )}
    </DisboxContext.Provider>
  );
};

export const useDisbox = () => {
  const context = useContext(DisboxContext);
  if (!context) throw new Error('useDisbox must be used within a DisboxProvider');
  return context;
};
