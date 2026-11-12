import React from 'react';
import {
  FileText,
  FileCode,
  FileArchive,
  Image as ImageIcon,
  Video,
  Music,
  File,
} from 'lucide-react';

export function getFileCategoryIcon(mimeType: string, extension: string) {
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
    return <ImageIcon className="w-5 h-5 text-emerald-400" />;
  }
  if (mimeType.startsWith('video/') || ['mp4', 'mkv', 'webm', 'mov', 'avi'].includes(extension)) {
    return <Video className="w-5 h-5 text-indigo-400" />;
  }
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac'].includes(extension)) {
    return <Music className="w-5 h-5 text-amber-400" />;
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension)) {
    return <FileArchive className="w-5 h-5 text-yellow-400" />;
  }
  if (['json', 'js', 'ts', 'tsx', 'jsx', 'py', 'html', 'css', 'go', 'rs', 'c', 'cpp'].includes(extension)) {
    return <FileCode className="w-5 h-5 text-cyan-400" />;
  }
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf'].includes(extension)) {
    return <FileText className="w-5 h-5 text-blue-400" />;
  }
  return <File className="w-5 h-5 text-neutral-400" />;
}
