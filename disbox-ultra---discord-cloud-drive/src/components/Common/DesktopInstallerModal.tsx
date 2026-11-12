import React from 'react';
import { Monitor, Download, Terminal, CheckCircle2, Package, Sparkles, X } from 'lucide-react';

export const DesktopInstallerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Instalador de Escritorio (.EXE)</h3>
              <p className="text-xs text-neutral-400">Disbox Ultra Desktop para Windows, macOS y Linux</p>
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
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Visual Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-neutral-900 border border-indigo-500/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-600/30">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-0.5">Asistente de Instalación Visual</h4>
              <p className="text-xs text-indigo-200">
                Ejecuta el archivo <code className="px-1.5 py-0.5 bg-neutral-900 rounded text-indigo-300 font-mono">start-electron.bat</code> en tu ordenador para abrir el menú interactivo con opciones de instalación y compilación de tu propio ejecutable <code className="px-1.5 py-0.5 bg-neutral-900 rounded text-indigo-300 font-mono">.exe</code>.
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Opciones del Menú Batch Interactivo
            </h5>

            <div className="grid gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-white">Iniciar Aplicación de Escritorio</h6>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Lanza el servidor local en segundo plano y abre la ventana nativa de Electron al instante.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-white">Compilar e Instalar (.EXE)</h6>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Empaqueta la aplicación con <code className="text-indigo-300">electron-builder</code> para generar el instalador ejecutable en la carpeta <code className="text-indigo-300">\release</code>.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h6 className="text-xs font-semibold text-white">Instalar Dependencias y Limpiar</h6>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Instala automáticamente los paquetes necesarios y limpia cachés temporales de compilación.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick command reminder */}
          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 flex items-center justify-between">
            <span>Doble clic en: <strong className="text-indigo-400">start-electron.bat</strong></span>
            <span className="text-[10px] bg-neutral-900 px-2 py-1 rounded text-neutral-400 border border-neutral-800">Windows / Mac / Linux</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Motor Electron 33 + Node.js</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
