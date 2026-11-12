import React, { useRef, useState } from 'react';
import {
  CloudUpload,
  X,
  Cpu,
  Server,
} from 'lucide-react';
import { useDisbox } from '../../context/DisboxContext';
import { formatBytes } from '../../utils/crypto';

export const UploadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { uploadFileList, settings, updateSettings, servers, isUploading, uploadQueue } = useDisbox();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [chunkSizeMb, setChunkSizeMb] = useState(settings.defaultChunkSizeMb || 24);
  const [selectedServerId, setSelectedServerId] = useState<string>(
    settings.strategy.preferredServerId || servers[0]?.id || ''
  );

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) return;

    if (selectedServerId) {
      updateSettings({
        strategy: {
          ...settings.strategy,
          preferredServerId: selectedServerId,
        },
      });
    }

    const filesToUpload = [...selectedFiles];
    setSelectedFiles([]);
    await uploadFileList(filesToUpload, chunkSizeMb);
  };

  const totalBytesSelected = selectedFiles.reduce((acc, f) => acc + f.size, 0);
  const targetServer = servers.find(s => s.id === selectedServerId) || servers[0];
  const isRealDiscordWebhook = targetServer?.channels.some(
    c => !c.isSimulated && c.webhookUrl.includes('discord.com/api/webhooks/')
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400">
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Subir a Discord</h3>
              <p className="text-xs text-neutral-400">
                Particionado automático de hasta {chunkSizeMb} MB por mensaje en tu servidor
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

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Target Discord Server Selector */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-indigo-400" />
                <span>Canal / Servidor de Discord de Destino:</span>
              </span>
              {isRealDiscordWebhook ? (
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Webhook Real Activo</span>
                </span>
              ) : (
                <span className="text-[11px] font-mono text-neutral-400">
                  Nodo Local
                </span>
              )}
            </div>

            <select
              value={selectedServerId}
              onChange={e => setSelectedServerId(e.target.value)}
              className="w-full text-xs font-medium bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {servers.map(s => {
                const hasReal = s.channels.some(c => !c.isSimulated && c.webhookUrl.includes('discord.com/api/webhooks/'));
                return (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.channels.length} canales) {hasReal ? '• [Webhook Real Discord]' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-neutral-700 hover:border-neutral-500 bg-neutral-950/50'
            }`}
          >
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 mx-auto mb-2.5">
              <CloudUpload className="w-6 h-6 text-indigo-400" />
            </div>
            <p className="text-sm font-semibold text-white mb-0.5">
              Arrastra archivos aquí o haz clic para explorar
            </p>
            <p className="text-xs text-neutral-400">
              Vídeos, zip, imágenes, código, ejecutables, documentos sin límite de tamaño
            </p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Archivos seleccionados ({selectedFiles.length})</span>
                <span className="font-mono tabular-nums">{formatBytes(totalBytesSelected)}</span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-neutral-950 rounded-lg border border-neutral-800">
                {selectedFiles.map((f, i) => {
                  const estChunks = Math.max(1, Math.ceil(f.size / (chunkSizeMb * 1024 * 1024)));
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs py-1 px-2 rounded bg-neutral-900 border border-neutral-800"
                    >
                      <span className="truncate text-neutral-200 max-w-xs">{f.name}</span>
                      <div className="flex items-center gap-2 text-neutral-400 font-mono tabular-nums text-[11px]">
                        <span>{formatBytes(f.size)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-indigo-400">{estChunks} {estChunks === 1 ? 'parte' : 'partes'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chunking Size Settings */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-neutral-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Tamaño de Partición por Mensaje de Discord</span>
              </span>
              <span className="font-mono text-indigo-400 font-bold">{chunkSizeMb} MB</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[8, 10, 20, 24].map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setChunkSizeMb(size)}
                  className={`py-1.5 text-xs font-mono font-medium rounded-lg border transition-all ${
                    chunkSizeMb === size
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {size} MB {size === 24 ? '(Max Free)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Active Upload Tasks Monitor in Modal */}
          {isUploading && (
            <div className="space-y-2 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
              <span className="text-xs font-semibold text-indigo-300">
                Transmitiendo a tu servidor de Discord...
              </span>
              {uploadQueue
                .filter(t => t.status === 'uploading' || t.status === 'chunking' || t.status === 'error')
                .map((task, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-neutral-300">
                      <span className="truncate max-w-[240px] font-medium">{task.fileName}</span>
                      <span className={`font-mono tabular-nums ${task.status === 'error' ? 'text-red-400' : 'text-indigo-400'}`}>
                        {task.status === 'error' ? 'Error' : `${task.percent}%`}
                      </span>
                    </div>
                    {task.status !== 'error' && (
                      <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-150"
                          style={{ width: `${task.percent}%` }}
                        />
                      </div>
                    )}
                    <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                      <span className="truncate max-w-xs">{task.errorMessage || task.targetChannelName || 'Enviando adjuntos...'}</span>
                      <span>Partición {task.currentChunkIndex} de {task.totalChunks}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-950">
          <div className="text-xs text-neutral-400">
            Destino: <span className="text-white font-mono">{targetServer?.name || 'Servidor'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              disabled={selectedFiles.length === 0 || isUploading}
              onClick={handleStartUpload}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
            >
              <CloudUpload className="w-4 h-4" />
              <span>{isUploading ? 'Subiendo a Discord...' : 'Subir Archivos'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
