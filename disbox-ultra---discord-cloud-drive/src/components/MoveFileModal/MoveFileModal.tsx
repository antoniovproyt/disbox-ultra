import React, { useState } from 'react';
import {
  FolderInput,
  X,
  Folder,
  Home,
  Check,
  Search,
  Plus,
  ArrowRight,
  FolderPlus,
} from 'lucide-react';
import { useDisbox } from '../../context/DisboxContext';
import { DisboxFile } from '../../types/disbox';
import { getFileCategoryIcon } from '../../utils/fileIcons';
import { formatBytes } from '../../utils/crypto';

export const MoveFileModal: React.FC<{
  file: DisboxFile | null;
  onClose: () => void;
}> = ({ file, onClose }) => {
  const { folders, moveFile, createFolder } = useDisbox();
  const [filterQuery, setFilterQuery] = useState('');
  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#6366F1');

  if (!file) return null;

  const currentFolder = folders.find(f => f.id === file.folderId);

  const filteredFolders = folders.filter(f =>
    f.name.toLowerCase().includes(filterQuery.toLowerCase().trim())
  );

  const handleMoveTo = (targetFolderId: string | null) => {
    moveFile(file.id, targetFolderId);
    onClose();
  };

  const handleCreateAndMove = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFolderName.trim();
    if (!trimmed) return;

    const newF = createFolder(trimmed, newFolderColor, null);
    moveFile(file.id, newF.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-800/40 flex items-center justify-center text-indigo-400 shadow-md">
              <FolderInput className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Mover Archivo</h3>
              <p className="text-xs text-neutral-400">
                Selecciona la carpeta de destino para este archivo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected File Overview Card */}
        <div className="px-6 py-3.5 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-neutral-850 flex items-center justify-center shrink-0">
              {getFileCategoryIcon(file.mimeType, file.extension)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{file.name}</p>
              <p className="text-[11px] text-neutral-400 font-mono">
                {formatBytes(file.size)} · {file.chunks.length} {file.chunks.length === 1 ? 'parte' : 'partes'}
              </p>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <span className="text-[10px] text-neutral-400 block uppercase tracking-wider">
              Ubicación actual
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
              {currentFolder ? currentFolder.name : '🏠 Inicio / Raíz'}
            </span>
          </div>
        </div>

        {/* Search & Quick Actions Bar */}
        <div className="p-4 pb-2 border-b border-neutral-800/60 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar carpeta..."
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
              className="w-full text-xs bg-neutral-950 border border-neutral-700 focus:border-indigo-500 rounded-xl pl-8 pr-3 py-2 text-white placeholder-neutral-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsCreatingInline(!isCreatingInline)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 rounded-xl transition-colors shrink-0"
          >
            <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Nueva</span>
          </button>
        </div>

        {/* Inline Create Folder Form */}
        {isCreatingInline && (
          <form
            onSubmit={handleCreateAndMove}
            className="p-4 bg-indigo-950/20 border-b border-indigo-900/30 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Crear carpeta y mover aquí</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingInline(false)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Nombre de la nueva carpeta..."
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                className="flex-1 text-xs bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!newFolderName.trim()}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg disabled:opacity-50"
              >
                Crear y Mover
              </button>
            </div>
          </form>
        )}

        {/* Folder List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {/* Root Destination */}
          <div
            onClick={() => handleMoveTo(null)}
            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
              file.folderId === null
                ? 'bg-indigo-950/20 border-indigo-500/40 text-neutral-300 ring-1 ring-indigo-500/30'
                : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-850 border border-neutral-700/60 flex items-center justify-center text-indigo-400">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Directorio Raíz / Sin Carpeta</span>
                  {file.folderId === null && (
                    <span className="text-[10px] font-mono font-normal text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
                      Ubicación actual
                    </span>
                  )}
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Ubicación principal de almacenamiento
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                handleMoveTo(null);
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>{file.folderId === null ? 'Ya está aquí' : 'Mover a Raíz'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Folder Items */}
          {filteredFolders.map(folder => {
            const isCurrent = file.folderId === folder.id;
            const parent = folders.find(p => p.id === folder.parentId);

            return (
              <div
                key={folder.id}
                onClick={() => handleMoveTo(folder.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'bg-indigo-950/20 border-indigo-500/40 text-neutral-300 ring-1 ring-indigo-500/30'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                    style={{ backgroundColor: folder.color || '#6366F1' }}
                  >
                    <Folder className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{folder.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-mono font-normal text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
                          Ubicación actual
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      {parent ? `En: ${parent.name}` : 'En: Raíz'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleMoveTo(folder.id);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-neutral-800 text-neutral-400 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow'
                  }`}
                >
                  <span>{isCurrent ? 'Ya está aquí' : 'Mover aquí'}</span>
                  {!isCurrent && <ArrowRight className="w-3 h-3" />}
                </button>
              </div>
            );
          })}

          {filteredFolders.length === 0 && folders.length > 0 && (
            <div className="text-center py-6 text-neutral-500 text-xs">
              No se encontraron carpetas con el nombre "{filterQuery}".
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-750 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
