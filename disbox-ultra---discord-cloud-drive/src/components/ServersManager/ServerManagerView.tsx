import React, { useState } from 'react';
import {
  Server,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Activity,
  Radio,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DiscordBoostTier, DiscordChannel, DiscordServer } from '../../types/disbox';
import { useDisbox } from '../../context/DisboxContext';
import { formatBytes } from '../../utils/crypto';

export const ServerManagerView: React.FC = () => {
  const {
    servers,
    addServer,
    updateServer,
    deleteServer,
    addChannel,
    updateChannel,
    deleteChannel,
    testChannelWebhook,
    activeServerId,
    setActiveServerId,
    clearDemoData,
    clearAllFiles,
    files,
    requestConfirm,
  } = useDisbox();

  const [selectedServerId, setSelectedServerId] = useState<string>(
    activeServerId === 'all' ? (servers[0]?.id || '') : activeServerId
  );

  const [isAddingServer, setIsAddingServer] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newServerTier, setNewServerTier] = useState<DiscordBoostTier>(1);
  const [newServerColor, setNewServerColor] = useState('#6366F1');

  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelWebhook, setNewChannelWebhook] = useState('');
  const [newChannelCategory, setNewChannelCategory] = useState<DiscordChannel['category']>('general');
  const [testingChannelId, setTestingChannelId] = useState<string | null>(null);

  const activeServer = servers.find(s => s.id === selectedServerId) || servers[0];

  const handleCreateServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName.trim()) return;

    const maxSizes = { 0: 25, 1: 50, 2: 100, 3: 500 };
    const created = addServer({
      name: newServerName.trim(),
      tier: newServerTier,
      maxChunkSizeMb: maxSizes[newServerTier],
      color: newServerColor,
      channels: [
        {
          id: 'chn_' + Math.random().toString(36).substring(2, 9),
          name: 'general-storage',
          webhookUrl: 'https://discord.com/api/webhooks/simulated/' + Math.random().toString(36).substring(2, 7),
          category: 'general',
          isSimulated: true,
          status: 'online',
          lastPingMs: 22,
          totalChunksStored: 0,
          totalBytesStored: 0,
        },
      ],
    });

    setSelectedServerId(created.id);
    setNewServerName('');
    setIsAddingServer(false);
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim() || !activeServer) return;

    const isSimulated = !newChannelWebhook.trim() || !newChannelWebhook.startsWith('https://discord.com/api/webhooks/');
    const finalWebhook = newChannelWebhook.trim() || `https://discord.com/api/webhooks/simulated/${Math.random().toString(36).substring(2, 8)}`;

    addChannel(activeServer.id, {
      name: newChannelName.trim().replace(/^#/, ''),
      webhookUrl: finalWebhook,
      category: newChannelCategory,
      isSimulated,
      status: isSimulated ? 'online' : 'untested',
    });

    setNewChannelName('');
    setNewChannelWebhook('');
    setIsAddingChannel(false);
  };

  const handleTestChannel = async (channelId: string) => {
    if (!activeServer) return;
    setTestingChannelId(channelId);
    try {
      await testChannelWebhook(activeServer.id, channelId);
    } finally {
      setTestingChannelId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <span>Gestor de Topología de Servidores</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Administra tus servidores de Discord, canales asignados y Webhooks para el particionado y distribución de archivos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {servers.some(s => s.channels.some(c => c.isSimulated)) && (
            <button
              onClick={() => {
                requestConfirm({
                  title: '¿Dejar solo tu canal de Discord?',
                  message: 'Se eliminarán los servidores demo y archivos de prueba precargados para dejar únicamente tu propia infraestructura.',
                  confirmText: 'Sí, limpiar demos',
                  isDestructive: true,
                  onConfirm: () => clearDemoData(),
                });
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-700/50 rounded-lg transition-colors"
              title="Elimina los servidores demo precargados para quedarte solo con tu canal"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Dejar solo mi canal (Limpiar Demos)</span>
            </button>
          )}

          <button
            onClick={() => setIsAddingServer(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Nuevo Servidor</span>
          </button>
        </div>
      </div>

      {/* Modal / Form: Add Server */}
      {isAddingServer && (
        <div className="p-4 rounded-xl bg-neutral-900 border border-indigo-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Nuevo Servidor de Almacenamiento</h3>
            <button
              onClick={() => setIsAddingServer(false)}
              className="text-neutral-400 hover:text-white text-xs"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreateServer} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Nombre del Servidor</label>
              <input
                type="text"
                required
                placeholder="Ej: Vault Primario, Media Guild..."
                value={newServerName}
                onChange={e => setNewServerName(e.target.value)}
                className="w-full text-xs bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">
                Nivel de Boost de Discord (Límite por chunk)
              </label>
              <select
                value={newServerTier}
                onChange={e => setNewServerTier(Number(e.target.value) as DiscordBoostTier)}
                className="w-full text-xs bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={0}>Gratuito (Max 25 MB por archivo)</option>
                <option value={1}>Boost Nivel 1 (Max 50 MB por archivo)</option>
                <option value={2}>Boost Nivel 2 (Max 100 MB por archivo)</option>
                <option value={3}>Boost Nivel 3 (Max 500 MB por archivo)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">Color Identificador</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newServerColor}
                  onChange={e => setNewServerColor(e.target.value)}
                  className="w-9 h-8 bg-neutral-800 border border-neutral-700 rounded cursor-pointer"
                />
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  Guardar Servidor
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Server Selector on Left, Selected Server Channels on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Servers List Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
            <span>Servidores Configurados ({servers.length})</span>
          </div>

          <div className="space-y-2">
            {servers.map(server => {
              const isSelected = activeServer?.id === server.id;
              const totalBytes = server.channels.reduce((acc, c) => acc + (c.totalBytesStored || 0), 0);
              const totalChunks = server.channels.reduce((acc, c) => acc + (c.totalChunksStored || 0), 0);

              return (
                <div
                  key={server.id}
                  onClick={() => setSelectedServerId(server.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-neutral-850 border-indigo-500/60 shadow-md ring-1 ring-indigo-500/20'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-inner"
                      style={{ backgroundColor: server.color }}
                    >
                      {server.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white leading-tight">
                        {server.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                        <span className="font-mono tabular-nums">
                          Tier {server.tier} ({server.maxChunkSizeMb}MB)
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {server.channels.length} canales
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono tabular-nums text-neutral-300 font-medium block">
                      {formatBytes(totalBytes)}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {totalChunks} chunks
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Discord Webhook Setup Guide */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2 text-xs">
            <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span>¿Cómo crear un Webhook en Discord?</span>
            </span>
            <ol className="list-decimal list-inside text-neutral-400 space-y-1 text-[11px] leading-relaxed">
              <li>Abre Discord y entra en tu servidor privado.</li>
              <li>Haz clic derecho en un canal de texto &gt; <b>Ajustes del canal</b>.</li>
              <li>Ve a <b>Integraciones</b> &gt; <b>Webhooks</b> &gt; <b>Crear Webhook</b>.</li>
              <li>Copia la URL del Webhook y pégala aquí abajo.</li>
            </ol>
          </div>
        </div>

        {/* Selected Server Detail & Channels (2 cols wide) */}
        {activeServer && (
          <div className="lg:col-span-2 space-y-4">
            {/* Server Card Header */}
            <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shrink-0 shadow"
                  style={{ backgroundColor: activeServer.color }}
                >
                  {activeServer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{activeServer.name}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                      Tier {activeServer.tier} • Max {activeServer.maxChunkSizeMb}MB/chunk
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    ID del Nodo: <code className="font-mono text-neutral-300">{activeServer.id}</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddingChannel(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Canal</span>
                </button>

                <button
                  onClick={() => {
                    requestConfirm({
                      title: `¿Eliminar servidor "${activeServer.name}"?`,
                      message: 'Se eliminarán este servidor y sus canales de la lista de Disbox.',
                      confirmText: 'Sí, eliminar',
                      isDestructive: true,
                      onConfirm: () => deleteServer(activeServer.id),
                    });
                  }}
                  className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
                  title="Eliminar este Servidor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add Channel Inline Form */}
            {isAddingChannel && (
              <form onSubmit={handleCreateChannel} className="p-4 rounded-xl bg-neutral-850 border border-indigo-500/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-white">Nuevo Canal de Almacenamiento</h4>
                  <button
                    type="button"
                    onClick={() => setIsAddingChannel(false)}
                    className="text-neutral-400 hover:text-white text-xs"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Nombre del Canal</label>
                    <input
                      type="text"
                      required
                      placeholder="ej: particiones-4k o archivos-zip"
                      value={newChannelName}
                      onChange={e => setNewChannelName(e.target.value)}
                      className="w-full text-xs bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Categoría Asignada</label>
                    <select
                      value={newChannelCategory}
                      onChange={e => setNewChannelCategory(e.target.value as any)}
                      className="w-full text-xs bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="general">General (Cualquier archivo)</option>
                      <option value="media">Multimedia (Vídeos, Audios, Fotos)</option>
                      <option value="archives">Archivos ZIP / Comprimidos</option>
                      <option value="documents">Documentos / Código</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-neutral-400 mb-1">
                      URL del Webhook de Discord (Opcional - Si se deja vacío, usa el simulador local)
                    </label>
                    <input
                      type="url"
                      placeholder="https://discord.com/api/webhooks/..."
                      value={newChannelWebhook}
                      onChange={e => setNewChannelWebhook(e.target.value)}
                      className="w-full text-xs bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingChannel(false)}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                  >
                    Guardar Canal
                  </button>
                </div>
              </form>
            )}

            {/* Channels Table / List */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-1">
                Canales Activos ({activeServer.channels.length})
              </div>

              {activeServer.channels.map(channel => {
                const isTesting = testingChannelId === channel.id;

                return (
                  <div
                    key={channel.id}
                    className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300 font-mono text-sm">
                        #
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">
                            {channel.name}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700/60 capitalize">
                            {channel.category}
                          </span>
                          {channel.isSimulated && (
                            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded border border-indigo-800/40">
                              Simulado
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono mt-0.5 truncate max-w-xs md:max-w-md">
                          {channel.webhookUrl.replace(/discord\.com\/api\/webhooks\/(\d+)\/(.+)/, 'discord.com/api/webhooks/$1/••••••••')}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Telemetry info */}
                      <div className="text-right">
                        <span className="text-xs font-mono tabular-nums text-neutral-300 block">
                          {formatBytes(channel.totalBytesStored || 0)}
                        </span>
                        <span className="text-[11px] font-mono tabular-nums text-neutral-400">
                          {channel.totalChunksStored || 0} particiones
                        </span>
                      </div>

                      {/* Ping status badge */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            channel.status === 'online'
                              ? 'bg-emerald-500'
                              : channel.status === 'error'
                              ? 'bg-red-500'
                              : 'bg-neutral-500'
                          }`}
                        />
                        <span className="text-xs font-mono tabular-nums text-neutral-400">
                          {channel.lastPingMs ? `${channel.lastPingMs}ms` : 'Sin probar'}
                        </span>
                      </div>

                      {/* Test Webhook Ping Button */}
                      <button
                        onClick={() => handleTestChannel(channel.id)}
                        disabled={isTesting}
                        className="px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg border border-neutral-700 transition-colors"
                        title="Probar latencia y conectividad con Discord"
                      >
                        {isTesting ? 'Probando...' : 'Test Ping'}
                      </button>

                      {/* Delete Channel */}
                      <button
                        onClick={() => {
                          requestConfirm({
                            title: `¿Eliminar canal #${channel.name}?`,
                            message: 'Se eliminará la configuración de este canal de almacenamiento.',
                            confirmText: 'Sí, eliminar',
                            isDestructive: true,
                            onConfirm: () => deleteChannel(activeServer.id, channel.id),
                          });
                        }}
                        className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                        title="Eliminar canal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
