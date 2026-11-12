import React from 'react';
import {
  Sliders,
  Layers,
  Shuffle,
  Shield,
  HardDrive,
  Cpu,
  Zap,
  Check,
} from 'lucide-react';
import { useDisbox } from '../../context/DisboxContext';
import { StorageStrategy } from '../../types/disbox';

export const StrategyView: React.FC = () => {
  const { settings, updateSettings, servers } = useDisbox();

  const strategies: {
    id: StorageStrategy;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge: string;
  }[] = [
    {
      id: 'round_robin',
      title: 'Round-Robin Striping (Recomendado)',
      description:
        'Distribuye las particiones de forma secuencial y uniforme entre todos los servidores (Servidor 1 → Servidor 2 → Servidor 3). Maximiza la velocidad en paralelo y previene bloqueos por rate-limit de Discord.',
      icon: <Shuffle className="w-5 h-5 text-indigo-400" />,
      badge: 'Mayor Velocidad',
    },
    {
      id: 'category_routing',
      title: 'Enrutamiento Inteligente por Categoría',
      description:
        'Envía automáticamente imágenes y vídeos a servidores multimedia, archivos comprimidos (.zip/.tar) a servidores de backup y documentos a bóvedas de texto.',
      icon: <Layers className="w-5 h-5 text-purple-400" />,
      badge: 'Organización Óptima',
    },
    {
      id: 'mirror_redundancy',
      title: 'Redundancia Espejo (RAID-1)',
      description:
        'Clona cada partición en dos servidores de Discord independientes. Si un servidor es eliminado, suspendido o pierde acceso, el archivo sigue 100% disponible.',
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      badge: 'Máxima Seguridad',
    },
    {
      id: 'single_server',
      title: 'Servidor Único Dedicado',
      description:
        'Concentra todas las particiones en un único servidor primario seleccionado por el usuario.',
      icon: <HardDrive className="w-5 h-5 text-amber-400" />,
      badge: 'Simplicidad',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-800">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <span>Estrategia de Particionado y Asignación de Nodos</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Configura cómo el motor de Disbox Ultra fragmenta archivos grandes y los distribuye entre tu infraestructura de Discord.
        </p>
      </div>

      {/* Strategy Cards */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
          Modo de Distribución Activo
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategies.map(s => {
            const isSelected = settings.strategy.mode === s.id;

            return (
              <div
                key={s.id}
                onClick={() =>
                  updateSettings({
                    strategy: { ...settings.strategy, mode: s.id },
                  })
                }
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-neutral-850 border-indigo-500 shadow-lg ring-1 ring-indigo-500/20'
                    : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-neutral-800">{s.icon}</div>
                      <h4 className="text-sm font-bold text-white">{s.title}</h4>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500 font-mono">Modo: {s.id}</span>
                  <span className="text-indigo-400 font-medium">{s.badge}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fine-Tuning Parameters */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>Parámetros de Rendimiento y Tamaño de Partición</span>
        </h3>

        {/* Chunk Size Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium">
              Tamaño Predeterminado de Partición (Chunk Size)
            </span>
            <span className="font-mono tabular-nums text-indigo-400 font-bold">
              {settings.defaultChunkSizeMb} MB por partición
            </span>
          </div>

          <input
            type="range"
            min={4}
            max={24}
            step={2}
            value={settings.defaultChunkSizeMb}
            onChange={e =>
              updateSettings({
                defaultChunkSizeMb: Number(e.target.value),
                strategy: {
                  ...settings.strategy,
                  defaultChunkSizeMb: Number(e.target.value),
                },
              })
            }
            className="w-full accent-indigo-500 cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
            <span>4 MB (Ultra estable)</span>
            <span>10 MB (Recomendado Discord)</span>
            <span>20 MB (Rápido)</span>
            <span>24 MB (Límite Free Discord)</span>
          </div>
        </div>

        {/* Concurrency Limit */}
        <div className="space-y-2 pt-3 border-t border-neutral-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-300 font-medium">
              Límite de Concurrencia Simultánea
            </span>
            <span className="font-mono tabular-nums text-indigo-400 font-bold">
              {settings.concurrencyLimit} hilos paralelos
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => updateSettings({ concurrencyLimit: num })}
                className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                  settings.concurrencyLimit === num
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                }`}
              >
                {num} {num === 1 ? 'hilo (Seguro)' : 'hilos'}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-neutral-500">
            Controla cuántas particiones se transmiten a la vez para evitar el error HTTP 429 de Discord.
          </p>
        </div>

        {/* Preferred Server Selection (if single_server mode) */}
        {settings.strategy.mode === 'single_server' && (
          <div className="space-y-2 pt-3 border-t border-neutral-800">
            <label className="block text-xs text-neutral-300 font-medium">
              Servidor Primario de Destino
            </label>
            <select
              value={settings.strategy.preferredServerId || servers[0]?.id}
              onChange={e =>
                updateSettings({
                  strategy: { ...settings.strategy, preferredServerId: e.target.value },
                })
              }
              className="w-full text-xs bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
            >
              {servers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.channels.length} canales disponibles)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
