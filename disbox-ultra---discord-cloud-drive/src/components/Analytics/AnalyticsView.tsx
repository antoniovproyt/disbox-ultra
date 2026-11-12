import React from 'react';
import {
  BarChart2,
  HardDrive,
  Layers,
  Server,
  Zap,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useDisbox } from '../../context/DisboxContext';
import { formatBytes } from '../../utils/crypto';

export const AnalyticsView: React.FC = () => {
  const { files, servers, totalBytesStored, totalChunksStored, totalFilesCount, allUniqueTags } = useDisbox();

  // Calculate file categories
  const mediaBytes = files
    .filter(f => f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/') || f.mimeType.startsWith('audio/'))
    .reduce((acc, f) => acc + f.size, 0);

  const archiveBytes = files
    .filter(f => ['zip', 'rar', '7z', 'tar', 'gz'].includes(f.extension))
    .reduce((acc, f) => acc + f.size, 0);

  const docBytes = files
    .filter(f => ['pdf', 'doc', 'docx', 'txt', 'md', 'json', 'ts', 'js'].includes(f.extension))
    .reduce((acc, f) => acc + f.size, 0);

  const otherBytes = Math.max(0, totalBytesStored - mediaBytes - archiveBytes - docBytes);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-neutral-800">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-400" />
          <span>Métricas de Almacenamiento & Distribución</span>
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Estadísticas en tiempo real de particiones, ancho de banda y cuotas alojadas en la red de Discord.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Volumen Total</span>
            <HardDrive className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {formatBytes(totalBytesStored)}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">
            {totalFilesCount} archivos indexados
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Particiones (Chunks)</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {totalChunksStored}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">
            Subidas a canales Discord
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Servidores Enlazados</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {servers.length}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 font-mono">
            {servers.reduce((a, s) => a + s.channels.length, 0)} canales activos
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium">Costo de Hosting</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
            $0.00
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Almacén ilimitado en Discord
          </div>
        </div>
      </div>

      {/* Distribution by Server */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" />
          <span>Distribución de Carga por Servidor</span>
        </h3>

        <div className="space-y-3">
          {servers.map(server => {
            const serverBytes = server.channels.reduce((acc, c) => acc + (c.totalBytesStored || 0), 0);
            const serverChunks = server.channels.reduce((acc, c) => acc + (c.totalChunksStored || 0), 0);
            const pct = totalBytesStored > 0 ? Math.min(100, Math.round((serverBytes / totalBytesStored) * 100)) : 33;

            return (
              <div key={server.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-200 font-medium flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: server.color }}
                    />
                    <span>{server.name}</span>
                  </span>
                  <span className="text-neutral-400 font-mono tabular-nums">
                    {formatBytes(serverBytes)} ({pct}%) · {serverChunks} chunks
                  </span>
                </div>

                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: server.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribution by File Category */}
      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          <span>Composición de Archivos</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-neutral-850 rounded-lg border border-neutral-800">
            <span className="text-[11px] text-neutral-400 block mb-1">Multimedia</span>
            <span className="text-sm font-bold text-white font-mono tabular-nums">
              {formatBytes(mediaBytes)}
            </span>
          </div>

          <div className="p-3 bg-neutral-850 rounded-lg border border-neutral-800">
            <span className="text-[11px] text-neutral-400 block mb-1">Comprimidos</span>
            <span className="text-sm font-bold text-white font-mono tabular-nums">
              {formatBytes(archiveBytes)}
            </span>
          </div>

          <div className="p-3 bg-neutral-850 rounded-lg border border-neutral-800">
            <span className="text-[11px] text-neutral-400 block mb-1">Documentos & Código</span>
            <span className="text-sm font-bold text-white font-mono tabular-nums">
              {formatBytes(docBytes)}
            </span>
          </div>

          <div className="p-3 bg-neutral-850 rounded-lg border border-neutral-800">
            <span className="text-[11px] text-neutral-400 block mb-1">Etiquetas Activas</span>
            <span className="text-sm font-bold text-indigo-400 font-mono tabular-nums">
              {allUniqueTags.length} tags
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
