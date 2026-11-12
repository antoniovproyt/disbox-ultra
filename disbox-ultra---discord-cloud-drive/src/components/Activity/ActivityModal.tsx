import React from 'react';
import { History, Trash2, Clock, Upload, Edit3, FolderPlus, Folder, ArrowRight, Tag, X } from 'lucide-react';
import { useDisbox } from '../../context/DisboxContext';
import { ActivityItem, ActivityType } from '../../types/disbox';

export const ActivityModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { activities, clearActivities, requestConfirm } = useDisbox();

  if (!isOpen) return null;

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'upload':
        return <Upload className="w-4 h-4 text-emerald-400" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-400" />;
      case 'rename':
        return <Edit3 className="w-4 h-4 text-amber-400" />;
      case 'move':
        return <ArrowRight className="w-4 h-4 text-indigo-400" />;
      case 'tag':
        return <Tag className="w-4 h-4 text-purple-400" />;
      case 'folder_create':
      case 'folder_delete':
        return <Folder className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />;
    }
  };

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleClearPrompt = () => {
    requestConfirm({
      title: '¿Vaciar Historial de Actividad?',
      message: 'Se borrarán todos los registros cronológicos almacenados localmente.',
      confirmText: 'Sí, vaciar',
      isDestructive: true,
      onConfirm: () => {
        clearActivities();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Historial de Actividades</h3>
              <p className="text-xs text-neutral-400">Trazabilidad cronológica de archivos, particiones y carpetas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activities.length > 0 && (
              <button
                onClick={handleClearPrompt}
                className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors flex items-center gap-1.5 border border-red-900/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar historial</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-500">
                <Clock className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-semibold text-neutral-300 mb-1">Sin actividades recientes</h4>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Las operaciones de subida, eliminación, cambios de nombre y gestión de carpetas aparecerán registradas aquí.
              </p>
            </div>
          ) : (
            activities.map(act => (
              <div
                key={act.id}
                className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800/80 hover:border-neutral-700 transition-colors flex items-start gap-3.5"
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                  {getActivityIcon(act.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h5 className="text-xs font-semibold text-neutral-200 truncate">{act.title}</h5>
                    <span className="text-[10px] font-mono text-neutral-500 shrink-0 tabular-nums">
                      {formatTime(act.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 break-words">{act.description}</p>
                  {act.details && (
                    <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded bg-neutral-900 font-mono text-indigo-400 border border-neutral-800">
                      {act.details}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <span>Total registros: {activities.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
