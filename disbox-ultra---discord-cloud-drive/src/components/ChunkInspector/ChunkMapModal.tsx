import React, { useState } from 'react';
import {
  Network,
  X,
  Server,
  Hash,
  CheckCircle,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { DisboxFile } from '../../types/disbox';
import { formatBytes } from '../../utils/crypto';
import { StorageEngine } from '../../services/storageEngine';

export const ChunkMapModal: React.FC<{
  file: DisboxFile | null;
  onClose: () => void;
}> = ({ file, onClose }) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  if (!file) return null;

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      // Reassemble and check
      await StorageEngine.reassembleAndDownload(file);
      setVerificationResult('Todas las particiones coinciden al 100% con sus sumas de verificación SHA-256.');
    } catch (err: unknown) {
      setVerificationResult(err instanceof Error ? err.message : 'Error durante la verificación.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Topología de Particiones</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  {file.chunks.length} {file.chunks.length === 1 ? 'nodo' : 'nodos'}
                </span>
              </h3>
              <p className="text-xs text-neutral-400 truncate max-w-md">
                Archivo: <span className="text-neutral-200 font-medium">{file.name}</span> ({formatBytes(file.size)})
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
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs">
            <div className="space-y-0.5">
              <span className="text-neutral-400">Estrategia de dispersión:</span>
              <div className="text-white font-medium">
                Distribuido en {new Set(file.chunks.map(c => c.serverId)).size} servidores de Discord
              </div>
            </div>

            <button
              onClick={handleVerifyIntegrity}
              disabled={isVerifying}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-lg transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{isVerifying ? 'Calculando SHA-256...' : 'Verificar Integridad'}</span>
            </button>
          </div>

          {verificationResult && (
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{verificationResult}</span>
            </div>
          )}

          {/* Chunks List */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block px-1">
              Mapa de Bloques Binarios
            </span>

            {file.chunks.map((chunk, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/80 hover:border-neutral-700 transition-colors space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-indigo-950 text-indigo-400 font-mono text-xs font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <span className="text-sm font-semibold text-white">
                        Partición {idx + 1} de {chunk.totalChunks}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono tabular-nums ml-2">
                        ({formatBytes(chunk.sizeBytes)})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {chunk.discordAttachmentUrl && chunk.discordAttachmentUrl.startsWith('http') && (
                      <a
                        href={chunk.discordAttachmentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 hover:underline"
                        title="Ver payload en Discord CDN"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Abrir en Discord</span>
                      </a>
                    )}

                    <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px] pl-2 border-l border-neutral-800">
                      <CheckCircle className="w-3 h-3" />
                      <span>Almacenado</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-neutral-900">
                  <div className="text-neutral-400">
                    <span className="text-neutral-500">Servidor & Canal: </span>
                    <span className="text-neutral-300 font-medium">
                      {chunk.serverName} &gt; #{chunk.channelName}
                    </span>
                  </div>

                  <div className="text-neutral-400 font-mono text-[11px]">
                    <span className="text-neutral-500 font-sans">Bytes: </span>
                    <span>
                      {formatBytes(chunk.byteStart)} - {formatBytes(chunk.byteEnd)}
                    </span>
                  </div>
                </div>

                {/* Hash row */}
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono bg-neutral-900/60 p-2 rounded-lg border border-neutral-800/50">
                  <div className="flex items-center gap-1.5 truncate text-neutral-400">
                    <Hash className="w-3 h-3 text-neutral-500 shrink-0" />
                    <span className="truncate">{chunk.hashSha256 || 'Sin calcular'}</span>
                  </div>

                  <button
                    onClick={() => handleCopyHash(chunk.hashSha256)}
                    className="p-1 text-neutral-400 hover:text-white rounded transition-colors shrink-0"
                    title="Copiar Checksum SHA-256"
                  >
                    {copiedHash === chunk.hashSha256 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
