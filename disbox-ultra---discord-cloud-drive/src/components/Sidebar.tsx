import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  Server,
  Layers,
  Plus,
  Trash2,
  HardDrive,
  CheckCircle,
  Tag,
  X,
  Edit2,
  History,
} from 'lucide-react';
import { useDisbox } from '../context/DisboxContext';
import { formatBytes } from '../utils/crypto';
import { SidebarContextMenu, ContextMenuState } from './Common/SidebarContextMenu';

export const Sidebar: React.FC<{
  onOpenServerManager: () => void;
}> = ({ onOpenServerManager }) => {
  const {
    servers,
    activeServerId,
    setActiveServerId,
    folders,
    currentFolderId,
    setCurrentFolderId,
    createFolder,
    deleteFolder,
    renameFolder,
    files,
    categoryFilter,
    setCategoryFilter,
    totalBytesStored,
    totalChunksStored,
    uploadQueue,
    isUploading,
    requestConfirm,
    allUniqueTags,
    selectedTagFilter,
    setSelectedTagFilter,
    setIsFolderModalOpen,
    setEditingFolder,
    setIsActivityModalOpen,
    activities,
  } = useDisbox();

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    type: 'folder',
    id: '',
    name: '',
  });

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const handleDeleteFolderPrompt = (folderId: string, folderName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    requestConfirm({
      title: `¿Eliminar carpeta "${folderName}"?`,
      message: 'Los archivos que contiene se moverán al directorio raíz.',
      confirmText: 'Sí, eliminar',
      isDestructive: true,
      onConfirm: () => {
        deleteFolder(folderId);
      },
    });
  };

  const activeUpload = uploadQueue.find(t => t.status === 'uploading' || t.status === 'chunking');

  return (
    <aside className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0 select-none">
      {/* Discord Server Node Switcher Rail */}
      <div className="p-3 border-b border-neutral-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Nodos Discord
          </span>
          <button
            onClick={onOpenServerManager}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Gestionar</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {/* All Servers Node */}
          <button
            onClick={() => setActiveServerId('all')}
            className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
              activeServerId === 'all'
                ? 'bg-indigo-600 text-white rounded-2xl shadow-sm'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
            }`}
            title="Todos los servidores"
          >
            <Layers className="w-5 h-5" />
          </button>

          {/* Each Discord Server */}
          {servers.map(server => {
            const isActive = activeServerId === server.id;
            const initials = server.name
              .split(' ')
              .map(w => w[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();

            const isReal = server.channels.some(c => !c.isSimulated && c.webhookUrl.includes('discord.com/api/webhooks/'));

            return (
              <button
                key={server.id}
                onClick={() => setActiveServerId(server.id)}
                onContextMenu={e => {
                  e.preventDefault();
                  setContextMenu({
                    isOpen: true,
                    x: e.clientX,
                    y: e.clientY,
                    type: 'server',
                    id: server.id,
                    name: server.name,
                  });
                }}
                className={`relative flex items-center justify-center w-10 h-10 rounded-xl font-bold text-xs transition-all ${
                  isActive
                    ? 'text-white rounded-2xl ring-2 ring-indigo-500 shadow-md'
                    : 'text-neutral-300 hover:rounded-2xl hover:bg-neutral-800'
                }`}
                style={{
                  backgroundColor: isActive ? server.color : '#262626',
                }}
                title={`${server.name} (${server.channels.length} canales) ${isReal ? '• Webhook Real' : ''} (Click derecho para opciones)`}
              >
                {initials}
                <span className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 border-2 border-neutral-900 rounded-full ${isReal ? 'bg-emerald-500' : 'bg-neutral-500'}`} />
              </button>
            );
          })}

          <button
            onClick={onOpenServerManager}
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-dashed border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
            title="Añadir Servidor de Discord"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Folders & Navigation Section */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Main Drive navigation */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 px-2 block mb-1">
            Biblioteca
          </span>

          <div className="space-y-0.5">
            <button
              onClick={() => {
                setCurrentFolderId(null);
                setCategoryFilter('all');
                setSelectedTagFilter(null);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                currentFolderId === null && categoryFilter === 'all' && selectedTagFilter === null
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-4 h-4 text-indigo-400" />
                <span>Todos los archivos</span>
              </div>
              <span className="tabular-nums font-mono text-neutral-400 text-xs">
                {files.length}
              </span>
            </button>

            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-indigo-400" />
                <span>Historial de Actividad</span>
              </div>
              <span className="tabular-nums font-mono text-neutral-500 text-[11px] bg-neutral-900 px-1.5 py-0.5 rounded">
                {activities.length}
              </span>
            </button>
          </div>
        </div>

        {/* Custom User Folders */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Carpetas
            </span>
            <button
              onClick={() => {
                setEditingFolder(null);
                setIsFolderModalOpen(true);
              }}
              className="text-neutral-400 hover:text-white transition-colors"
              title="Nueva Carpeta"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            {folders.map(folder => {
              const count = files.filter(f => f.folderId === folder.id).length;
              const isSelected = currentFolderId === folder.id;

              return (
                <div
                  key={folder.id}
                  onContextMenu={e => {
                    e.preventDefault();
                    setContextMenu({
                      isOpen: true,
                      x: e.clientX,
                      y: e.clientY,
                      type: 'folder',
                      id: folder.id,
                      name: folder.name,
                    });
                  }}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                  title="Click derecho para opciones"
                >
                  <button
                    onClick={() => {
                      setCurrentFolderId(folder.id);
                      setCategoryFilter('all');
                    }}
                    className="flex items-center gap-2.5 truncate text-left flex-1"
                  >
                    <Folder
                      className="w-4 h-4 shrink-0"
                      style={{ color: folder.color || '#6366F1' }}
                    />
                    <span className="truncate">{folder.name}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <span className="tabular-nums font-mono text-neutral-400 text-xs">
                      {count}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setEditingFolder(folder);
                        setIsFolderModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-indigo-400 transition-opacity"
                      title="Editar carpeta"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={e => handleDeleteFolderPrompt(folder.id, folder.name, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-400 transition-opacity"
                      title="Eliminar carpeta"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tags Section */}
        {allUniqueTags.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Etiquetas</span>
              </span>
              {selectedTagFilter && (
                <button
                  onClick={() => setSelectedTagFilter(null)}
                  className="text-[10px] text-indigo-400 hover:underline"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1 px-1">
              {allUniqueTags.map(tag => {
                const isSelected = selectedTagFilter === tag;
                const count = files.filter(f => (f.tags || []).includes(tag)).length;

                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTagFilter(isSelected ? null : tag)}
                    className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-750'
                    }`}
                  >
                    #{tag} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Active Upload Live Tracker */}
      {isUploading && activeUpload && (
        <div className="p-3 bg-neutral-950/80 border-t border-neutral-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-medium text-neutral-200 truncate pr-2">
              {activeUpload.fileName}
            </span>
            <span className="tabular-nums font-mono text-indigo-400">
              {activeUpload.percent}%
            </span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mb-1.5">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-200"
              style={{ width: `${activeUpload.percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>
              Partición {activeUpload.currentChunkIndex}/{activeUpload.totalChunks}
            </span>
            <span className="font-mono tabular-nums">
              {(activeUpload.speedBps / (1024 * 1024)).toFixed(1)} MB/s
            </span>
          </div>
        </div>
      )}

      {/* Footer Storage Telemetry / Node Summary */}
      <div className="p-3 bg-neutral-950 border-t border-neutral-800">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span>Almacén Discord</span>
          </span>
          <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
            <CheckCircle className="w-3 h-3" />
            <span>Ilimitado</span>
          </span>
        </div>

        <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 w-full rounded-full" />
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-400 tabular-nums font-mono">
          <span>{formatBytes(totalBytesStored)}</span>
          <span>{totalChunksStored} particiones</span>
        </div>
      </div>

      <SidebarContextMenu
        menu={contextMenu}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
        onRenameFolder={(id) => {
          const f = folders.find(x => x.id === id);
          if (f) {
            setEditingFolder(f);
            setIsFolderModalOpen(true);
          }
        }}
        onDeleteFolder={(id, name) => {
          requestConfirm({
            title: `¿Eliminar carpeta "${name}"?`,
            message: 'Los archivos que contiene se moverán al directorio raíz.',
            confirmText: 'Sí, eliminar',
            isDestructive: true,
            onConfirm: () => {
              deleteFolder(id);
            },
          });
        }}
        onOpenServerManager={onOpenServerManager}
      />
    </aside>
  );
};
