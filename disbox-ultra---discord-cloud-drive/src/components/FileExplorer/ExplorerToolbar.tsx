import React from 'react';
import {
  Search,
  LayoutGrid,
  List,
  FolderPlus,
  CloudUpload,
  ArrowUpDown,
  ChevronRight,
  Home,
  Trash2,
  Tag,
  X,
} from 'lucide-react';
import { useDisbox } from '../../context/DisboxContext';

export const ExplorerToolbar: React.FC<{
  onCreateFolderClick: () => void;
}> = ({ onCreateFolderClick }) => {
  const {
    currentFolderId,
    setCurrentFolderId,
    folders,
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
    setIsUploadModalOpen,
    activeServerId,
    servers,
    clearAllFiles,
    files,
    requestConfirm,
  } = useDisbox();

  const currentFolder = folders.find(f => f.id === currentFolderId);
  const activeServer = servers.find(s => s.id === activeServerId);

  // Compute folder hierarchy path from root to currentFolder
  const folderPath = React.useMemo(() => {
    if (!currentFolderId) return [];
    const path = [];
    let curr = folders.find(f => f.id === currentFolderId);
    while (curr) {
      path.unshift(curr);
      curr = curr.parentId ? folders.find(f => f.id === curr!.parentId) : undefined;
    }
    return path;
  }, [currentFolderId, folders]);

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'media', label: 'Multimedia' },
    { id: 'documents', label: 'Documentos' },
    { id: 'archives', label: 'Archivos ZIP' },
  ];

  const handleClearAllFilesPrompt = () => {
    requestConfirm({
      title: '¿Vaciar todos los archivos?',
      message: 'Se eliminarán todos los archivos del registro y la caché local de Disbox. Podrás volver a subir nuevos archivos a tu canal de Discord en cualquier momento.',
      confirmText: 'Sí, vaciar todo',
      isDestructive: true,
      onConfirm: () => {
        clearAllFiles();
      },
    });
  };

  return (
    <div className="space-y-3 pb-3 border-b border-neutral-800">
      {/* Top row: Breadcrumb + Search + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-1.5 text-sm flex-wrap">
          <button
            onClick={() => {
              setCurrentFolderId(null);
              setSelectedTagFilter(null);
            }}
            className={`flex items-center gap-1 transition-colors ${
              currentFolderId === null ? 'text-white font-medium' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 text-indigo-400" />
            <span>Inicio</span>
          </button>

          {activeServerId !== 'all' && activeServer && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
              <span className="text-xs font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-800/40">
                {activeServer.name}
              </span>
            </>
          )}

          {folderPath.map((folder, idx) => {
            const isLast = idx === folderPath.length - 1;
            return (
              <React.Fragment key={folder.id}>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                {isLast ? (
                  <span className="text-white font-medium flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: folder.color || '#6366F1' }}
                    />
                    <span>{folder.name}</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setCurrentFolderId(folder.id)}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    {folder.name}
                  </button>
                )}
              </React.Fragment>
            );
          })}

          {selectedTagFilter && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
              <span className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800/60">
                <Tag className="w-3 h-3" />
                <span>#{selectedTagFilter}</span>
                <button
                  onClick={() => setSelectedTagFilter(null)}
                  className="hover:text-white ml-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            </>
          )}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar por nombre o etiqueta..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-52 lg:w-64 pl-9 pr-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 focus:border-indigo-500 rounded-lg text-white placeholder-neutral-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={onCreateFolderClick}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700/80 rounded-lg border border-neutral-700/60 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Carpeta</span>
          </button>

          {files.length > 0 && (
            <button
              onClick={handleClearAllFilesPrompt}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:text-red-400 bg-neutral-900 hover:bg-neutral-800 rounded-lg border border-neutral-800 transition-colors"
              title="Eliminar todos los archivos"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar</span>
            </button>
          )}

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>Subir</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Filter Tabs + Sort + View Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Interactive Segmented Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setCategoryFilter(cat.id);
                setSelectedTagFilter(null);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                categoryFilter === cat.id && !selectedTagFilter
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* View mode & Sorting */}
        <div className="flex items-center gap-2">
          {/* Sort selector */}
          <div className="flex items-center gap-1 text-xs text-neutral-400 bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-800">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-neutral-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="date" className="bg-neutral-900 text-white">Fecha</option>
              <option value="name" className="bg-neutral-900 text-white">Nombre</option>
              <option value="size" className="bg-neutral-900 text-white">Tamaño</option>
              <option value="chunks" className="bg-neutral-900 text-white">Particiones</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="hover:text-white px-1 font-mono text-[11px]"
              title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-0.5 bg-neutral-900 p-0.5 rounded-lg border border-neutral-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Vista en cuadrícula"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
              title="Vista en tabla"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
