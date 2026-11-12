import React, { useState } from 'react';
import {
  Download,
  Eye,
  Network,
  Share2,
  Trash2,
  Tag,
  Plus,
  X,
  FolderInput,
} from 'lucide-react';
import { DisboxFile } from '../../types/disbox';
import { formatBytes } from '../../utils/crypto';
import { getFileCategoryIcon } from '../../utils/fileIcons';
import { useDisbox } from '../../context/DisboxContext';

export const FileTable: React.FC<{
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

  const handleDelete = (file: DisboxFile, e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900">
      <table className="w-full text-left text-xs">
        <thead className="bg-neutral-950/60 text-neutral-400 font-semibold border-b border-neutral-800 select-none">
          <tr>
            <th className="py-3 px-4">Nombre del Archivo</th>
            <th className="py-3 px-3 text-right">Tamaño</th>
            <th className="py-3 px-3 text-center">Particiones</th>
            <th className="py-3 px-3">Servidor / Canal</th>
            <th className="py-3 px-3">Etiquetas (Tags)</th>
            <th className="py-3 px-3 text-right">Fecha</th>
            <th className="py-3 px-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800/60">
          {files.map(file => {
            const uniqueServers = Array.from(new Set(file.chunks.map(c => c.serverName))).join(', ');
            const dateStr = new Date(file.createdAt).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });

            return (
              <tr
                key={file.id}
                onClick={() => setPreviewFile(file)}
                className="hover:bg-neutral-850 transition-colors cursor-pointer group"
              >
                {/* Name & Icon */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5 max-w-xs md:max-w-sm truncate">
                    <div className="shrink-0">
                      {getFileCategoryIcon(file.mimeType, file.extension)}
                    </div>
                    <span className="font-medium text-neutral-200 group-hover:text-white truncate">
                      {file.name}
                    </span>
                  </div>
                </td>

                {/* Size */}
                <td className="py-3 px-3 text-right tabular-nums font-mono text-neutral-300 font-medium">
                  {formatBytes(file.size)}
                </td>

                {/* Chunks */}
                <td className="py-3 px-3 text-center tabular-nums font-mono text-neutral-400">
                  {file.chunks.length} {file.chunks.length === 1 ? 'parte' : 'partes'}
                </td>

                {/* Discord Servers */}
                <td className="py-3 px-3 text-neutral-400 truncate max-w-[180px]" title={uniqueServers}>
                  {uniqueServers}
                </td>

                {/* Tags Column */}
                <td className="py-3 px-3" onClick={e => e.stopPropagation()}>
                  <div className="flex flex-wrap items-center gap-1">
                    {(file.tags || []).map((t, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] text-neutral-300 border border-neutral-700/60"
                      >
                        <span
                          onClick={() => setSelectedTagFilter(selectedTagFilter === t ? null : t)}
                          className="cursor-pointer hover:text-white"
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
                          placeholder="tag..."
                          value={newTagInput}
                          onChange={e => setNewTagInput(e.target.value)}
                          onBlur={() => {
                            if (!newTagInput.trim()) setAddingTagFileId(null);
                          }}
                          className="w-16 text-[10px] bg-neutral-950 border border-indigo-500 rounded px-1 text-white focus:outline-none"
                        />
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAddingTagFileId(file.id);
                          setNewTagInput('');
                        }}
                        className="text-[10px] text-neutral-500 hover:text-indigo-400 px-1 py-0.5 rounded border border-dashed border-neutral-700"
                        title="Añadir etiqueta"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                </td>

                {/* Date */}
                <td className="py-3 px-3 text-right tabular-nums font-mono text-neutral-400">
                  {dateStr}
                </td>

                {/* Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                      title="Previsualizar"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setChunkMapFile(file)}
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                      title="Ver particiones en Discord"
                    >
                      <Network className="w-3.5 h-3.5 text-emerald-400" />
                    </button>

                    <button
                      onClick={() => setShareFile(file)}
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                      title="Compartir"
                    >
                      <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                    </button>

                    <button
                      onClick={() => setMovingFile(file)}
                      className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded transition-colors"
                      title="Mover a carpeta..."
                    >
                      <FolderInput className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={e => handleDownload(file, e)}
                      disabled={downloadingId === file.id}
                      className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                      title="Descargar"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                    </button>

                    <button
                      onClick={e => handleDelete(file, e)}
                      className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
