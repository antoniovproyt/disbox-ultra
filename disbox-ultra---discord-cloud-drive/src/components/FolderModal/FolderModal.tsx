import React, { useState, useEffect } from 'react';
import { Folder, X, Check, Palette, CornerDownRight } from 'lucide-react';
import { useDisbox } from '../../context/DisboxContext';
import { DisboxFolder } from '../../types/disbox';

const PRESET_COLORS = [
  { name: 'Índigo', hex: '#6366F1' },
  { name: 'Púrpura', hex: '#8B5CF6' },
  { name: 'Azul', hex: '#3B82F6' },
  { name: 'Esmeralda', hex: '#10B981' },
  { name: 'Ámbar (Banana)', hex: '#F59E0B' },
  { name: 'Rosa Neón', hex: '#EC4899' },
  { name: 'Cian', hex: '#06B6D4' },
  { name: 'Pizarra', hex: '#64748B' },
];

export const FolderModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  folderToEdit?: DisboxFolder | null;
}> = ({ isOpen, onClose, folderToEdit }) => {
  const { createFolder, updateFolder, folders, currentFolderId } = useDisbox();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366F1');
  const [parentId, setParentId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (folderToEdit) {
        setName(folderToEdit.name);
        setSelectedColor(folderToEdit.color || '#6366F1');
        setParentId(folderToEdit.parentId || null);
      } else {
        setName('');
        setSelectedColor('#6366F1');
        setParentId(currentFolderId);
      }
    }
  }, [isOpen, folderToEdit, currentFolderId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (folderToEdit) {
      updateFolder(folderToEdit.id, {
        name: trimmed,
        color: selectedColor,
        parentId: parentId === folderToEdit.id ? null : parentId,
      });
    } else {
      createFolder(trimmed, selectedColor, parentId);
    }

    onClose();
  };

  // Filter out the folder itself from parent choices to prevent cycles
  const eligibleParentFolders = folders.filter(f => !folderToEdit || f.id !== folderToEdit.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md transition-colors"
              style={{ backgroundColor: selectedColor }}
            >
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {folderToEdit ? 'Editar Carpeta' : 'Nueva Carpeta'}
              </h3>
              <p className="text-xs text-neutral-400">
                Organiza tus archivos particionados de Discord
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Nombre de la Carpeta
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="ej: Documentación 2026, Multimedia, Respaldos..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-sm bg-neutral-950 border border-neutral-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>Color de Identificación</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PRESET_COLORS.map(c => {
                const isSelected = selectedColor.toLowerCase() === c.hex.toLowerCase();
                return (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`h-9 rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'ring-2 ring-white scale-110 shadow-lg'
                        : 'opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                    title={c.name}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parent Folder Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <CornerDownRight className="w-3.5 h-3.5 text-neutral-400" />
              <span>Ubicación / Carpeta Contenedora</span>
            </label>
            <select
              value={parentId || ''}
              onChange={e => setParentId(e.target.value ? e.target.value : null)}
              className="w-full text-xs bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">🏠 Directorio Raíz (Sin carpeta superior)</option>
              {eligibleParentFolders.map(f => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-750 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {folderToEdit ? 'Guardar Cambios' : 'Crear Carpeta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
