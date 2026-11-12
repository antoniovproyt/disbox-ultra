import React, { useEffect, useState } from 'react';
import {
  X,
  Download,
  Network,
  Share2,
  FileText,
  Copy,
  Check,
  Server,
  Tag,
} from 'lucide-react';
import { DisboxFile } from '../../types/disbox';
import { formatBytes } from '../../utils/crypto';
import { StorageEngine } from '../../services/storageEngine';
import { useDisbox } from '../../context/DisboxContext';

export const PreviewModal: React.FC<{
  file: DisboxFile | null;
  onClose: () => void;
}> = ({ file, onClose }) => {
  const { downloadFile, setChunkMapFile, setShareFile } = useDisbox();

  const [textContent, setTextContent] = useState<string | null>(null);
  const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!file) {
      setTextContent(null);
      setMediaBlobUrl(null);
      setLoadError(null);
      return;
    }

    loadFileContent(file);
  }, [file]);

  const loadFileContent = async (targetFile: DisboxFile) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const blob = await StorageEngine.reassembleAndDownload(targetFile);

      if (
        targetFile.mimeType.startsWith('text/') ||
        targetFile.mimeType.includes('json') ||
        ['md', 'ts', 'js', 'json', 'txt', 'html', 'css', 'py', 'svg', 'csv'].includes(targetFile.extension)
      ) {
        const text = await blob.text();
        setTextContent(text);
      }

      if (
        targetFile.mimeType.startsWith('image/') ||
        targetFile.mimeType.startsWith('video/') ||
        targetFile.mimeType.startsWith('audio/')
      ) {
        const url = URL.createObjectURL(blob);
        setMediaBlobUrl(url);
      }
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : 'Error al cargar vista previa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (textContent) {
      navigator.clipboard.writeText(textContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!file) return;
    setDownloading(true);
    try {
      await downloadFile(file);
    } finally {
      setDownloading(false);
    }
  };

  if (!file) return null;

  const isImage = file.mimeType.startsWith('image/') || file.extension === 'svg';
  const isVideo = file.mimeType.startsWith('video/');
  const isAudio = file.mimeType.startsWith('audio/');
  const isTextLike = textContent !== null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-neutral-800 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white truncate max-w-md">
                {file.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                <span className="font-mono tabular-nums text-neutral-300">
                  {formatBytes(file.size)}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {file.chunks.length} {file.chunks.length === 1 ? 'partición' : 'particiones'}
                </span>
                {(file.tags || []).length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-indigo-400 font-mono text-[11px]">
                      {file.tags.map(t => `#${t}`).join(' ')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setChunkMapFile(file);
                onClose();
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-750 rounded-lg border border-neutral-700 transition-colors"
            >
              <Network className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ver en Discord</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Descargando...' : 'Descargar'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-center items-center min-h-[300px]">
          {isLoading && (
            <div className="text-center py-12 space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-mono text-neutral-400">
                Reensamblando archivo desde Discord...
              </p>
            </div>
          )}

          {loadError && !isLoading && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs text-center max-w-md">
              {loadError}
            </div>
          )}

          {/* Image Preview */}
          {!isLoading && mediaBlobUrl && isImage && (
            <div className="max-h-[60vh] flex items-center justify-center">
              <img
                src={mediaBlobUrl}
                alt={file.name}
                className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-lg"
              />
            </div>
          )}

          {/* Video Preview */}
          {!isLoading && mediaBlobUrl && isVideo && (
            <div className="w-full max-w-2xl">
              <video
                src={mediaBlobUrl}
                controls
                className="w-full rounded-xl bg-black shadow-lg"
              />
            </div>
          )}

          {/* Audio Preview */}
          {!isLoading && mediaBlobUrl && isAudio && (
            <div className="w-full max-w-md p-6 rounded-2xl bg-neutral-950 border border-neutral-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">{file.name}</h4>
              <audio src={mediaBlobUrl} controls className="w-full" />
            </div>
          )}

          {/* Code / Text Preview */}
          {!isLoading && isTextLike && (
            <div className="w-full h-full flex flex-col">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-xs text-neutral-400">
                <span className="font-mono text-[11px]">{file.extension.toUpperCase()}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-750 rounded transition-colors"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Copiado' : 'Copiar contenido'}</span>
                </button>
              </div>

              <pre className="w-full flex-1 max-h-[55vh] overflow-auto p-4 bg-neutral-950 rounded-xl border border-neutral-800 font-mono text-xs text-neutral-300 leading-relaxed">
                <code>{textContent}</code>
              </pre>
            </div>
          )}

          {/* Binary Preview */}
          {!isLoading && !isImage && !isVideo && !isAudio && !isTextLike && !loadError && (
            <div className="text-center py-12 max-w-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-400 mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">Archivo ({file.extension.toUpperCase()})</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Archivo segmentado en {file.chunks.length} partes en Discord. Puedes descargarlo directamente en tu equipo.
              </p>
              <button
                onClick={handleDownload}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Archivo Completo</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <Server className="w-3.5 h-3.5 text-neutral-500" />
            <span>Nodos: {Array.from(new Set(file.chunks.map(c => c.serverName))).join(', ')}</span>
          </div>

          <div className="font-mono tabular-nums text-[11px]">
            Subido: {new Date(file.createdAt).toLocaleString('es-ES')}
          </div>
        </div>
      </div>
    </div>
  );
};
