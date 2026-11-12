import React, { useState } from 'react';
import {
  Folder,
  MoreVertical,
  Edit2,
  Trash2,
  FolderOpen,
  FolderPlus,
} from 'lucide-react';
import { useDisbox } from '../../context/DisboxContext';
import { DisboxFolder } from '../../types/disbox';

export const FolderGrid: React.FC<{
  foldersToShow: DisboxFolder[];
  onFolderClick: (folderId: string) => void;
}> = ({ foldersToShow, onFolderClick }) => {
  const {
    files,
    setEditingFolder,
    setIsFolderModalOpen,
    deleteFolder,
    requestConfirm,
  } = useDisbox();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  if (foldersToShow.length === 0) {
    return null;
  }

  const handleDeleteFolder = (folder: DisboxFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);

    const childFilesCount = files.filter(f => f.folderId === folder.id).length;

    requestConfirm({
      title: `¿Eliminar carpeta "${folder.name}"?`,
      message: childFilesCount > 0
        ? `La carpeta contiene ${childFilesCount} archivo(s). Los archivos no se perderán; se moverán automáticamente al directorio raíz.`
        : 'La carpeta está vacía y se eliminará de forma segura.',
      confirmText: 'Sí, eliminar carpeta',
      isDestructive: true,
      onConfirm: () => {
        deleteFolder(folder.id);
      },
    });
  };

  const handleEditFolder = (folder: DisboxFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setEditingFolder(folder);
    setIsFolderModalOpen(true);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Carpetas ({foldersToShow.length})
        </h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {foldersToShow.map(folder => {
          const isMenuOpen = activeMenuId === folder.id;
          const count = files.filter(f => f.folderId === folder.id).length;

          return (
            <div
              key={folder.id}
              onClick={() => onFolderClick(folder.id)}
              className="group relative bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 hover:border-neutral-700 rounded-xl p-3.5 transition-all duration-150 cursor-pointer flex flex-col justify-between select-none shadow-sm"
            >
              <div className="flex items-start justify-between gap-1 mb-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                  style={{ backgroundColor: folder.color || '#6366F1' }}
                >
                  <Folder className="w-5 h-5 fill-white/20" />
                </div>

                <div className="relative">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setActiveMenuId(isMenuOpen ? null : folder.id);
                    }}
                    className="p-1 text-neutral-400 hover:text-white rounded-md transition-colors opacity-80 group-hover:opacity-100"
                    title="Opciones de carpeta"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {isMenuOpen && (
                    <div
                      onClick={e => e.stopPropagation()}
                      className="absolute right-0 top-full mt-1 w-40 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl z-30 py-1 text-xs animate-in fade-in duration-100"
                    >
                      <button
                        onClick={() => {
                          setActiveMenuId(null);
                          onFolderClick(folder.id);
                        }}
                        className="w-full px-3 py-1.5 text-left text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center gap-2"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Abrir</span>
                      </button>

                      <button
                        onClick={e => handleEditFolder(folder, e)}
                        className="w-full px-3 py-1.5 text-left text-neutral-300 hover:text-white hover:bg-neutral-800 flex items-center gap-2"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Editar / Color</span>
                      </button>

                      <div className="my-1 border-t border-neutral-800" />

                      <button
                        onClick={e => handleDeleteFolder(folder, e)}
                        className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h5
                  className="text-xs font-bold text-neutral-200 group-hover:text-white truncate"
                  title={folder.name}
                >
                  {folder.name}
                </h5>
                <p className="text-[11px] text-neutral-400 font-mono">
                  {count} {count === 1 ? 'archivo' : 'archivos'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
