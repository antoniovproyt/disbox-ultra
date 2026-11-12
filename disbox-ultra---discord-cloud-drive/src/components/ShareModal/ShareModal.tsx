import React, { useState } from 'react';
import { Share2, X, Copy, Check } from 'lucide-react';
import { DisboxFile } from '../../types/disbox';
import { formatBytes } from '../../utils/crypto';

export const ShareModal: React.FC<{
  file: DisboxFile | null;
  onClose: () => void;
}> = ({ file, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!file) return null;

  // Generate lightweight manifest export
  const exportPayload = {
    disboxVersion: '3.0',
    fileId: file.id,
    name: file.name,
    size: file.size,
    mimeType: file.mimeType,
    tags: file.tags || [],
    chunks: file.chunks.map(c => ({
      index: c.chunkIndex,
      size: c.sizeBytes,
      hash: c.hashSha256,
      url: c.discordAttachmentUrl,
    })),
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Compartir Manifiesto de Archivo</h3>
              <p className="text-xs text-neutral-400">
                {file.name} ({formatBytes(file.size)})
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
        <div className="p-6 space-y-4">
          <p className="text-xs text-neutral-300 leading-relaxed">
            Cualquier persona con este manifiesto de Disbox podrá reensamblar y descargar este archivo directamente desde los servidores de Discord sin intermediarios.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-400">
              Manifiesto JSON de Particiones
            </label>
            <div className="relative">
              <textarea
                readOnly
                rows={6}
                value={JSON.stringify(exportPayload, null, 2)}
                className="w-full text-[11px] font-mono bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-neutral-300 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded shadow transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? '¡Copiado!' : 'Copiar JSON'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-800 hover:bg-neutral-750 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
