import React from 'react';
import { CloudUpload, HardDrive, RefreshCw } from 'lucide-react';
import { useDisbox } from '../../context/DisboxContext';

export const EmptyState: React.FC<{
  hasFilters: boolean;
  onClearFilters: () => void;
}> = ({ hasFilters, onClearFilters }) => {
  const { setIsUploadModalOpen } = useDisbox();

  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/40">
        <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
          <HardDrive className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">
          No se encontraron archivos con los filtros actuales
        </h3>
        <p className="text-xs text-neutral-400 max-w-sm mb-4">
          Prueba a limpiar la búsqueda o cambiar la categoría seleccionada.
        </p>
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restablecer Filtros</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/30">
      <div className="w-14 h-14 rounded-2xl bg-indigo-950/60 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
        <CloudUpload className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-white mb-1">
        Tu almacén en Discord está listo
      </h3>
      <p className="text-xs text-neutral-400 max-w-md mb-6 leading-relaxed">
        Sube cualquier archivo para particionarlo en chunks de hasta 25MB y distribuirlo automáticamente entre tus canales y servidores configurados.
      </p>
      <button
        onClick={() => setIsUploadModalOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md transition-all active:scale-[0.98]"
      >
        <CloudUpload className="w-4 h-4" />
        <span>Subir Archivo a Discord</span>
      </button>
    </div>
  );
};
