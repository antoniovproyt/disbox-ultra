import React, { useState } from 'react';
import {
  Download,
  Eye,
  Network,
  Share2,
  Trash2,
  MoreVertical,
  Tag,
  Plus,
  X,
  FolderInput,
} from 'lucide-react';
import { DisboxFile } from '../../types/disbox';
import { formatBytes } from '../../utils/crypto';
import { getFileCategoryIcon } from '../../utils/fileIcons';
import { useDisbox } from '../../context/DisboxContext';

export const FileGrid: React.FC<{
  files: DisboxFile[];
}> = ({ files }) => {
  const {
    downloadFile,
    deleteFile,
    setPreviewFile,
    setChunkMapFile,
    setShareFile,
    setMovingFile,
    requestConfirm,
    addTagToFile,
    removeTagFromFile,
    selectedTagFilter,
    setSelectedTagFilter,
  } = useDisbox();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [addingTagFileId, setAddingTagFileId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

  const handleDownload = async (file: DisboxFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(file.id);
    try {
      await downloadFile(file);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeletePrompt = (file: DisboxFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveMenuId(null);
    requestConfirm({
      title: `¿Eliminar "${file.name}"?`,
      message: `Esta acción eliminará el archivo del registro de Disbox y sus ${file.chunks.length} particiones.`,
      confirmText: 'Sí, eliminar',
      isDestructive: true,
      onConfirm: () => {
        deleteFile(file.id);
      },
    });
  };

  const handleAddTagSubmit = (fileId: string, e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (newTagInput.trim()) {
      addTagToFile(fileId, newTagInput.trim());
      setNewTagInput('');
      setAddingTagFileId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map(file => {
        const isMenuOpen = activeMenuId === file.id;
        const serverNames = Array.from(new Set(file.chunks.map(c => c.serverName))).join(', ');
        const dateStr = new Date(file.createdAt).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
        });

        return (
          <div
            key={file.id}
            onClick={() => setPreviewFile(file)}
            className="group relative bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 rounded-xl p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between"
          >
            {/* Top row: Icon + Format tag + Quick options */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-800/90 border border-neutral-700/50 flex items-center justify-center shrink-0">
                  {getFileCategoryIcon(file.mimeType, file.extension)}
                </div>

                <div className="flex items-center gap-1">
                  <div className="relative">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setActiveMenuId(isMenuOpen ? null : file.id);
                      }}
                      className="p-1 text-neutral-400 hover:text-white rounded-md transition-colors"
                      title="Opciones"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div
                        onClick={e => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1 w-48 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl z-30 py-1 text-xs"
                      >
                        <button
                          onClick={() => {
                            setPreviewFile(file);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-left text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center gap-2"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Previsualizar</span>
                        </button>
                        <button
                          onClick={() => {
                            setChunkMapFile(file);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-left text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center gap-2"
                        >
                          <Network className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Particiones en Discord</span>
                        </button>
                        <button
                          onClick={() => {
                            setShareFile(file);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-left text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center gap-2"
                        >
                          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Compartir</span>
                        </button>
                        <button
                          onClick={() => {
                            setMovingFile(file);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-left text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center gap-2"
                        >
                          <FolderInput className="w-3.5 h-3.5 text-amber-400" />
                          <span>Mover a carpeta...</span>
                        </button>
                        <div className="my-1 border-t border-neutral-800" />
                        <button
                          onClick={e => handleDeletePrompt(file, e)}
                          className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar archivo</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* File Title */}
              <h4
                className="text-sm font-semibold text-neutral-200 group-hover:text-white truncate mb-1"
                title={file.name}
              >
                {file.name}
              </h4>

              {/* Clean Metadata */}
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-2.5">
                <span className="tabular-nums font-mono text-neutral-300 font-medium">
                  {formatBytes(file.size)}
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-mono">
                  {file.chunks.length} {file.chunks.length === 1 ? 'parte' : 'partes'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{dateStr}</span>
              </div>

              {/* Tags Section */}
              <div
                className="flex flex-wrap items-center gap-1 mb-3 text-[11px]"
                onClick={e => e.stopPropagation()}
              >
                {(file.tags || []).map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60 transition-colors"
                  >
                    <span
                      onClick={() => setSelectedTagFilter(selectedTagFilter === t ? null : t)}
                      className="cursor-pointer"
                    >
                      #{t}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTagFromFile(file.id, t)}
                      className="text-neutral-500 hover:text-red-400"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}

                {addingTagFileId === file.id ? (
                  <form onSubmit={e => handleAddTagSubmit(file.id, e)} className="inline-flex">
                    <input
                      type="text"
                      autoFocus
                      placeholder="etiqueta..."
                      value={newTagInput}
                      onChange={e => setNewTagInput(e.target.value)}
                      onBlur={() => {
                        if (!newTagInput.trim()) setAddingTagFileId(null);
                      }}
                      className="w-20 text-[10px] bg-neutral-950 border border-indigo-500 rounded px-1.5 py-0.5 text-white focus:outline-none"
                    />
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAddingTagFileId(file.id);
                      setNewTagInput('');
                    }}
                    className="inline-flex items-center gap-0.5 text-[10px] text-neutral-500 hover:text-indigo-400 px-1 py-0.5 rounded border border-dashed border-neutral-700 transition-colors"
                    title="Añadir etiqueta"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Tag</span>
                  </button>
                )}
              </div>
            </div>

            {/* Server Destination & Quick Actions */}
            <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
              <span className="text-neutral-400 truncate max-w-[130px]" title={serverNames}>
                {serverNames}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setChunkMapFile(file);
                  }}
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
                  title="Ver particiones en Discord"
                >
                  <Network className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={e => handleDownload(file, e)}
                  disabled={downloadingId === file.id}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-neutral-800 hover:bg-indigo-600 rounded-md transition-colors"
                  title="Descargar"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadingId === file.id ? '...' : 'Bajar'}</span>
                </button>

                <button
                  onClick={e => handleDeletePrompt(file, e)}
                  className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-md transition-colors"
                  title="Eliminar archivo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
