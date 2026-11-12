import React from 'react';
import { CloudUpload, HardDrive, Server, Sliders, BarChart2, ShieldCheck, Monitor } from 'lucide-react';
import { useDisbox } from '../context/DisboxContext';
import { formatBytes } from '../utils/crypto';

export const Header: React.FC<{
  activeTab: 'explorer' | 'servers' | 'strategy' | 'analytics';
  setActiveTab: (tab: 'explorer' | 'servers' | 'strategy' | 'analytics') => void;
  onDisconnect: () => void;
}> = ({ activeTab, setActiveTab, onDisconnect }) => {
  const {
    setIsUploadModalOpen,
    setIsSettingsModalOpen,
    setIsDesktopModalOpen,
    totalBytesStored,
    totalFilesCount,
    servers,
    activeServerId,
    setActiveServerId,
  } = useDisbox();

  const currentServer = servers.find(s => s.id === activeServerId);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800/80">
      {/* Zone 1: Single text wordmark with app emblem & Server Quick Pill */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center shadow-inner">
            <img
              src="/src/assets/images/disbox_brand_logo_1794413500675.jpg"
              alt="Disbox Ultra Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
              Disbox Web
            </span>
          </div>
        </div>

        {/* Server Switcher Pill */}
        <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-neutral-800">
          <select
            value={activeServerId}
            onChange={e => setActiveServerId(e.target.value)}
            className="text-xs font-medium bg-neutral-950 border border-neutral-700/80 rounded-lg px-2.5 py-1 text-neutral-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">🌐 Todos los Servidores ({servers.length})</option>
            {servers.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.channels.length} canales)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Zone 2: 4 clean single-line navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'explorer'
              ? 'text-white border-b-2 border-indigo-500 font-semibold'
              : 'hover:text-neutral-200'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Explorador</span>
        </button>

        <button
          onClick={() => setActiveTab('servers')}
          className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'servers'
              ? 'text-white border-b-2 border-indigo-500 font-semibold'
              : 'hover:text-neutral-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Topología</span>
          <span className="text-xs text-neutral-400 tabular-nums font-mono">
            ({servers.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('strategy')}
          className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'strategy'
              ? 'text-white border-b-2 border-indigo-500 font-semibold'
              : 'hover:text-neutral-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Estrategia</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'analytics'
              ? 'text-white border-b-2 border-indigo-500 font-semibold'
              : 'hover:text-neutral-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Métricas</span>
        </button>
      </nav>

      {/* Zone 3: Storage summary & Primary action */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Subtle quick storage indicator */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-neutral-400 border-r border-neutral-800 pr-3">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span className="tabular-nums font-mono font-medium text-neutral-300">
            {formatBytes(totalBytesStored)}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums font-mono">{totalFilesCount} archivos</span>
        </div>

        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/80 rounded-lg transition-colors"
          title="Ajustes y Temas (Nano Banana, etc.)"
        >
          <Sliders className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
        >
          <CloudUpload className="w-4 h-4" />
          <span>Subir a Discord</span>
        </button>
      </div>
    </header>
  );
};
