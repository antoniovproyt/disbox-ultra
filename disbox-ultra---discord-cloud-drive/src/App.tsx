/**
 * Disbox Ultra - Discord Cloud Storage Engine
 * Inspired by Disbox Web (https://disboxapp.github.io/web/)
 * Seamless Webhook Login, Automatic Chunking, Multi-Server Topology & Client AES-256
 */

import React, { useEffect, useMemo, useState } from 'react';
import { DisboxProvider, useDisbox } from './context/DisboxContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ExplorerToolbar } from './components/FileExplorer/ExplorerToolbar';
import { FileGrid } from './components/FileExplorer/FileGrid';
import { FileTable } from './components/FileExplorer/FileTable';
import { EmptyState } from './components/FileExplorer/EmptyState';
import { ServerManagerView } from './components/ServersManager/ServerManagerView';
import { StrategyView } from './components/Strategy/StrategyView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { UploadModal } from './components/UploadModal/UploadModal';
import { PreviewModal } from './components/PreviewModal/PreviewModal';
import { ChunkMapModal } from './components/ChunkInspector/ChunkMapModal';
import { ShareModal } from './components/ShareModal/ShareModal';
import { SettingsModal } from './components/SettingsModal/SettingsModal';
import { DisboxConnectScreen } from './components/Auth/DisboxConnectScreen';
import { FolderGrid } from './components/FileExplorer/FolderGrid';
import { FolderModal } from './components/FolderModal/FolderModal';
import { MoveFileModal } from './components/MoveFileModal/MoveFileModal';
import { ActivityModal } from './components/Activity/ActivityModal';
import { DesktopInstallerModal } from './components/Common/DesktopInstallerModal';
import { CloudUpload } from 'lucide-react';

function DisboxMain() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'servers' | 'strategy' | 'analytics'>('explorer');
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    // If user already has connected before or has servers
    return localStorage.getItem('disbox_has_connected_v2') === 'true';
  });

  const [isWindowDragging, setIsWindowDragging] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState<File[]>([]);

  const {
    files,
    folders,
    activeServerId,
    currentFolderId,
    setCurrentFolderId,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    selectedTagFilter,
    setSelectedTagFilter,
    viewMode,
    sortBy,
    sortOrder,
    createFolder,
    isUploadModalOpen,
    setIsUploadModalOpen,
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
    uploadFileList,
    isActivityModalOpen,
    setIsActivityModalOpen,
    isDesktopModalOpen,
    setIsDesktopModalOpen,
  } = useDisbox();

  // Handle global window drag and drop
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.types.includes('Files')) {
        setIsWindowDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setIsWindowDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsWindowDragging(false);
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const fileList = Array.from(e.dataTransfer.files);
        uploadFileList(fileList).catch(console.error);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [uploadFileList]);

  const handleFinishConnection = () => {
    localStorage.setItem('disbox_has_connected_v2', 'true');
    setIsConnected(true);
  };

  const handleDisconnect = () => {
    localStorage.removeItem('disbox_has_connected_v2');
    setIsConnected(false);
  };

  // Filter and sort files
  const filteredFiles = useMemo(() => {
    return files
      .filter(file => {
        // Filter by server
        if (activeServerId !== 'all') {
          const hasChunkInServer = file.chunks.some(c => c.serverId === activeServerId);
          if (!hasChunkInServer) return false;
        }

        // Filter by folder
        const isGlobalSearch = Boolean(searchQuery.trim() || selectedTagFilter);
        if (!isGlobalSearch) {
          if (currentFolderId === null) {
            if (file.folderId !== null && file.folderId !== undefined) return false;
          } else {
            if (file.folderId !== currentFolderId) return false;
          }
        }

        // Filter by search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = file.name.toLowerCase().includes(q);
          const matchTag = file.tags.some(t => t.toLowerCase().includes(q));
          if (!matchName && !matchTag) return false;
        }

        // Filter by tag
        if (selectedTagFilter && (!file.tags || !file.tags.includes(selectedTagFilter))) {
          return false;
        }

        // Filter by category
        if (categoryFilter === 'media') {
          return file.mimeType.startsWith('image/') || file.mimeType.startsWith('video/') || file.mimeType.startsWith('audio/');
        }
        if (categoryFilter === 'documents') {
          return ['pdf', 'doc', 'docx', 'txt', 'md', 'json', 'ts', 'js', 'html', 'css'].includes(file.extension);
        }
        if (categoryFilter === 'archives') {
          return ['zip', 'rar', '7z', 'tar', 'gz'].includes(file.extension);
        }

        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === 'name') {
          diff = a.name.localeCompare(b.name);
        } else if (sortBy === 'size') {
          diff = a.size - b.size;
        } else if (sortBy === 'chunks') {
          diff = a.chunks.length - b.chunks.length;
        } else {
          diff = a.createdAt - b.createdAt;
        }
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [files, activeServerId, currentFolderId, searchQuery, categoryFilter, selectedTagFilter, sortBy, sortOrder]);

  const currentSubfolders = useMemo(() => {
    if (searchQuery.trim() || selectedTagFilter) return [];
    return folders.filter(f => f.parentId === currentFolderId);
  }, [folders, currentFolderId, searchQuery, selectedTagFilter]);

  const hasActiveFilters = Boolean(searchQuery.trim() || categoryFilter !== 'all' || activeServerId !== 'all' || selectedTagFilter);

  // If user has not connected yet, show authentic Disbox Web setup gate
  if (!isConnected) {
    return <DisboxConnectScreen onConnected={handleFinishConnection} />;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans select-none">
      {/* Universal Top Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDisconnect={handleDisconnect}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {activeTab === 'explorer' && (
          <Sidebar onOpenServerManager={() => setActiveTab('servers')} />
        )}

        {/* Center Main Viewport */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'explorer' && (
              <div className="space-y-6">
                <ExplorerToolbar
                  onCreateFolderClick={() => {
                    setEditingFolder(null);
                    setIsFolderModalOpen(true);
                  }}
                />

                {/* Subfolder Grid inside Current Location */}
                <FolderGrid
                  foldersToShow={currentSubfolders}
                  onFolderClick={id => setCurrentFolderId(id)}
                />

                {/* Files Section */}
                {filteredFiles.length > 0 ? (
                  <div className="space-y-2.5">
                    {currentSubfolders.length > 0 && (
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        Archivos ({filteredFiles.length})
                      </h4>
                    )}
                    {viewMode === 'grid' ? (
                      <FileGrid files={filteredFiles} />
                    ) : (
                      <FileTable files={filteredFiles} />
                    )}
                  </div>
                ) : (
                  currentSubfolders.length === 0 && (
                    <EmptyState
                      hasFilters={hasActiveFilters}
                      onClearFilters={() => {
                        setSearchQuery('');
                        setCategoryFilter('all');
                        setSelectedTagFilter(null);
                      }}
                    />
                  )
                )}
              </div>
            )}

            {activeTab === 'servers' && <ServerManagerView />}

            {activeTab === 'strategy' && <StrategyView />}

            {activeTab === 'analytics' && <AnalyticsView />}
          </div>
        </main>
      </div>

      {/* Global Drag and Drop Visual Overlay */}
      {isWindowDragging && (
        <div className="fixed inset-0 z-50 bg-indigo-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 border-4 border-dashed border-indigo-400">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600/30 flex items-center justify-center text-indigo-300 mb-4 animate-bounce">
            <CloudUpload className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Suelta tus archivos aquí
          </h2>
          <p className="text-sm text-indigo-200">
            Se particionarán y subirán automáticamente a tus canales de Discord.
          </p>
        </div>
      )}

      {/* Interactive Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <PreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />

      <ChunkMapModal
        file={chunkMapFile}
        onClose={() => setChunkMapFile(null)}
      />

      <ShareModal
        file={shareFile}
        onClose={() => setShareFile(null)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false);
          setEditingFolder(null);
        }}
        folderToEdit={editingFolder}
      />

      <MoveFileModal
        file={movingFile}
        onClose={() => setMovingFile(null)}
      />

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
      />

      <DesktopInstallerModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <DisboxProvider>
      <DisboxMain />
    </DisboxProvider>
  );
}
