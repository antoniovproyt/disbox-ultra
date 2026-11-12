import React, { useEffect } from 'react';
import { Edit2, Trash2, FolderPlus, ArrowRightLeft, Server, Activity } from 'lucide-react';

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  type: 'folder' | 'server';
  id: string;
  name: string;
}

export const SidebarContextMenu: React.FC<{
  menu: ContextMenuState;
  onClose: () => void;
  onRenameFolder: (folderId: string, currentName: string) => void;
  onDeleteFolder: (folderId: string, folderName: string) => void;
  onOpenServerManager: () => void;
  onTestServerWebhook?: (serverId: string) => void;
}> = ({ menu, onClose, onRenameFolder, onDeleteFolder, onOpenServerManager }) => {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('click', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!menu.isOpen) return null;

  return (
    <div
      className="fixed z-50 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-1.5 w-52 text-xs text-neutral-200 select-none animate-in fade-in zoom-in-95 duration-100"
      style={{ top: menu.y, left: menu.x }}
      onClick={e => e.stopPropagation()}
    >
      <div className="px-3 py-1.5 border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 truncate">
        {menu.type === 'folder' ? 'Carpeta: ' : 'Servidor: '}
        <span className="text-white">{menu.name}</span>
      </div>

      {menu.type === 'folder' ? (
        <div className="py-1">
          <button
            onClick={() => {
              onClose();
              onRenameFolder(menu.id, menu.name);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors text-left"
          >
            <Edit2 className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white" />
            <span>Cambiar nombre</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onDeleteFolder(menu.id, menu.name);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-red-600 hover:text-white transition-colors text-left text-red-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar carpeta</span>
          </button>
        </div>
      ) : (
        <div className="py-1">
          <button
            onClick={() => {
              onClose();
              onOpenServerManager();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-indigo-600 hover:text-white transition-colors text-left"
          >
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span>Gestionar Servidores</span>
          </button>
        </div>
      )}
    </div>
  );
};
