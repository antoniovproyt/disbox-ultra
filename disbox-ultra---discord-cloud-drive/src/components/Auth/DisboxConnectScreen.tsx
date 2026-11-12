import React, { useState } from 'react';
import {
  Server,
  CloudUpload,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Zap,
  HelpCircle,
  HardDrive,
} from 'lucide-react';
import { useDisbox } from '../../context/DisboxContext';
import { StorageEngine } from '../../services/storageEngine';
import { DiscordBoostTier } from '../../types/disbox';

export const DisboxConnectScreen: React.FC<{
  onConnected: () => void;
}> = ({ onConnected }) => {
  const { addServer, setActiveServerId, servers } = useDisbox();

  const [webhookUrl, setWebhookUrl] = useState('');
  const [serverName, setServerName] = useState('');
  const [boostTier, setBoostTier] = useState<DiscordBoostTier>(0);
  const [isTesting, setIsTesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleConnectRealWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUrl = webhookUrl.trim();
    if (!cleanUrl) {
      setErrorMsg('Por favor introduce la URL del Webhook de Discord.');
      return;
    }

    if (!cleanUrl.includes('discord.com/api/webhooks/') && !cleanUrl.includes('discordapp.com/api/webhooks/')) {
      setErrorMsg('La URL debe tener el formato: https://discord.com/api/webhooks/{id}/{token}');
      return;
    }

    setIsTesting(true);
    try {
      const test = await StorageEngine.testWebhook(cleanUrl);
      if (!test.ok && test.error) {
        setErrorMsg(test.error);
        setIsTesting(false);
        return;
      }

      const derivedName = serverName.trim() || test.channelName?.replace('#', '') || 'Servidor Discord Principal';
      const maxSizes = { 0: 25, 1: 50, 2: 100, 3: 500 };

      const newSrv = addServer({
        name: derivedName,
        color: '#5865F2', // Discord Blurple
        tier: boostTier,
        maxChunkSizeMb: maxSizes[boostTier],
        channels: [
          {
            id: 'chn_' + Math.random().toString(36).substring(2, 9),
            name: test.channelName?.replace('#', '') || 'almacen-disbox',
            webhookUrl: cleanUrl,
            category: 'general',
            isSimulated: false,
            status: 'online',
            lastPingMs: test.latencyMs || 25,
            totalChunksStored: 0,
            totalBytesStored: 0,
          },
        ],
      });

      setActiveServerId(newSrv.id);
      onConnected();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al conectar con Discord');
    } finally {
      setIsTesting(false);
    }
  };

  const handleUseDemoServer = () => {
    if (servers.length > 0) {
      setActiveServerId(servers[0].id);
    }
    onConnected();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl z-10 space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-neutral-900 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-xl">
            <img
              src="/src/assets/images/disbox_brand_logo_1794413500675.jpg"
              alt="Disbox Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>Disbox Web</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">
              v3.0 Ultra
            </span>
          </h1>
          <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
            Almacenamiento en la nube gratuito e ilimitado mediante servidores y canales de Discord con particionado automático de archivos.
          </p>
        </div>

        {/* Main Connection Box */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <span className="text-xs font-semibold text-neutral-300 flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>Conectar Servidor de Discord</span>
            </span>
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sin contraseñas</span>
            </span>
          </div>

          <form onSubmit={handleConnectRealWebhook} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                URL del Webhook de Discord
              </label>
              <input
                type="url"
                required
                placeholder="https://discord.com/api/webhooks/1234567890/token..."
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                className="w-full text-xs font-mono bg-neutral-950 border border-neutral-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-500 focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                La URL del webhook actúa como tu identificador de canal de almacenamiento.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Nombre del Servidor / Alias (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Mi Servidor Privado"
                  value={serverName}
                  onChange={e => setServerName(e.target.value)}
                  className="w-full text-xs bg-neutral-950 border border-neutral-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-white placeholder-neutral-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Nivel de Boost de Discord
                </label>
                <select
                  value={boostTier}
                  onChange={e => setBoostTier(Number(e.target.value) as DiscordBoostTier)}
                  className="w-full text-xs bg-neutral-950 border border-neutral-700 focus:border-indigo-500 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option value={0}>Gratuito (Max 25 MB/chunk)</option>
                  <option value={1}>Boost Nivel 1 (50 MB/chunk)</option>
                  <option value={2}>Boost Nivel 2 (100 MB/chunk)</option>
                  <option value={3}>Boost Nivel 3 (500 MB/chunk)</option>
                </select>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isTesting}
              className="w-full py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isTesting ? 'Verificando Webhook en Discord...' : 'Conectar e Iniciar Unidad'}</span>
            </button>
          </form>

          {/* Quick Sandbox / Demo Button */}
          <div className="pt-3 border-t border-neutral-800 text-center">
            <button
              type="button"
              onClick={handleUseDemoServer}
              className="w-full py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-750 border border-neutral-700/80 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
              <span>Entrar directamente con Nodos Demo / Sandbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <p className="text-[11px] text-neutral-500 mt-1.5">
              Puedes añadir o cambiar tus Webhooks reales de Discord en cualquier momento desde la barra superior.
            </p>
          </div>
        </div>

        {/* Step-by-step Guide Accordion */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden text-xs">
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="w-full p-3.5 text-left font-medium text-neutral-300 hover:text-white flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>¿Cómo crear un Webhook en Discord? (Paso a paso)</span>
            </span>
            <span className="font-mono text-neutral-500">{showGuide ? '▲' : '▼'}</span>
          </button>

          {showGuide && (
            <div className="p-4 pt-1 border-t border-neutral-800/60 text-neutral-400 space-y-2 text-[11px] leading-relaxed">
              <ol className="list-decimal list-inside space-y-1.5">
                <li>Crea un servidor de Discord privado o entra en uno donde seas administrador.</li>
                <li>Haz clic derecho en un canal de texto (ej: <code>#archivos-vault</code>) y selecciona <b>Ajustes del canal</b>.</li>
                <li>Ve a la pestaña <b>Integraciones</b> y haz clic en <b>Webhooks</b>.</li>
                <li>Pulsa <b>Crear Webhook</b>, ponle el nombre que quieras y haz clic en <b>Copiar URL del Webhook</b>.</li>
                <li>Pega la URL en el formulario de arriba y pulsa <b>Conectar</b>.</li>
              </ol>
              <p className="text-neutral-500 pt-1">
                Tus archivos serán divididos en partes y transmitidos directamente a ese canal mediante HTTPS.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
