import React, { useRef, useState } from 'react';
import {
  Sliders,
  X,
  Palette,
  Download,
  Upload,
  RefreshCw,
  Check,
  CheckCircle,
  Database,
  Sparkles,
  Monitor,
} from 'lucide-react';
import { useDisbox } from '../../context/DisboxContext';
import { ThemePreset } from '../../types/disbox';
import { clearAllChunks } from '../../utils/chunkStorage';

export const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const {
    settings,
    updateSettings,
    exportManifestJson,
    importManifestJson,
    requestConfirm,
  } = useDisbox();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetDone, setResetDone] = useState(false);

  if (!isOpen) return null;

  const themes: {
    id: ThemePreset;
    name: string;
    description: string;
    previewColors: string[];
  }[] = [
    {
      id: 'discord',
      name: 'Discord Classic',
      description: 'Gris oscuro Discord con acentos azul blurple emblemáticos.',
      previewColors: ['#1e1f22', '#2b2d31', '#5865f2'],
    },
    {
      id: 'midnight',
      name: 'Midnight OLED',
      description: 'Negro puro obsidian con acentos índigo luminosos.',
      previewColors: ['#09090b', '#18181b', '#6366f1'],
    },
    {
      id: 'nanobanana',
      name: 'Nano Banana (Tema Especial)',
      description: 'Pizarra oscura contemporánea con reflejos oro y ámbar plátano.',
      previewColors: ['#17130e', '#292218', '#f59e0b'],
    },
    {
      id: 'emerald',
      name: 'Emerald Matrix',
      description: 'Gris grafito profundo con acentos menta y esmeralda de alta legibilidad.',
      previewColors: ['#061a14', '#0f291e', '#10b981'],
    },
  ];

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        const text = ev.target?.result as string;
        if (text) {
          importManifestJson(text);
          onClose();
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearCache = () => {
    requestConfirm({
      title: 'Limpiar Memoria Caché',
      message: '¿Deseas liberar la memoria local de particiones temporales? Los archivos seguirán guardados en tus servidores de Discord.',
      confirmText: 'Limpiar Caché',
      isDestructive: false,
      onConfirm: async () => {
        await clearAllChunks();
        setResetDone(true);
        setTimeout(() => setResetDone(false), 2500);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Personalización & Ajustes</h3>
              <p className="text-xs text-neutral-400">
                Temas visuales, copias de seguridad de la unidad y motor de almacenamiento
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Themes Section */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-400" />
              <span>Tema de Interfaz (Paleta de Colores)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themes.map(t => {
                const isSelected = settings.theme === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => updateSettings({ theme: t.id })}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-neutral-850 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white">{t.name}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-tight mb-3">
                        {t.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {t.previewColors.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-5 h-5 rounded-md border border-neutral-700/60 shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Backup & Restore Library Manifest */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <h4 className="text-xs font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Respaldo y Portabilidad del Catálogo</span>
            </h4>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Descarga una copia completa de tus archivos, nombres y hashes de particiones para sincronizarlos en otro navegador o restaurar tu biblioteca.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={exportManifestJson}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Manifiesto JSON</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 rounded-lg transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Importar Manifiesto JSON</span>
              </button>

              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
          </div>

          {/* Electron Desktop App Engine */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>Motor de Escritorio Electron (Node.js)</span>
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-cyan-300">
                electron/main.cjs listo
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Disbox Ultra incluye soporte nativo para ejecutarse como aplicación de escritorio independiente en Windows, macOS o Linux utilizando Electron y el backend Node.js Express.
            </p>
            <div className="bg-neutral-900 rounded-lg p-2.5 font-mono text-[11px] text-neutral-300 space-y-1 border border-neutral-800">
              <p className="text-neutral-400 text-[10px]"># Comando para iniciar en modo escritorio local:</p>
              <p className="text-cyan-300">npm run electron</p>
            </div>
          </div>

          {/* Maintenance & Cache */}
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-white">Memoria Caché de Particiones</h4>
                <p className="text-[11px] text-neutral-400">
                  Libera el almacenamiento local temporal en IndexedDB.
                </p>
              </div>

              <button
                onClick={handleClearCache}
                className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors"
              >
                {resetDone ? '¡Caché Limpiada!' : 'Limpiar Caché'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-750 rounded-lg transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
