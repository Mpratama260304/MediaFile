import { useState } from 'react';
import {
  HiDocument,
  HiPhotograph,
  HiFilm,
  HiMusicNote,
  HiArchive,
  HiDownload,
  HiTrash,
  HiShare,
  HiDotsVertical,
  HiFolder,
} from 'react-icons/hi';

const iconByType = (mimeType) => {
  if (mimeType?.startsWith('image/')) return <HiPhotograph className="w-8 h-8 text-green-500" />;
  if (mimeType?.startsWith('video/')) return <HiFilm className="w-8 h-8 text-purple-500" />;
  if (mimeType?.startsWith('audio/')) return <HiMusicNote className="w-8 h-8 text-pink-500" />;
  if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('tar'))
    return <HiArchive className="w-8 h-8 text-yellow-500" />;
  return <HiDocument className="w-8 h-8 text-blue-500" />;
};

const formatSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function FileCard({ file, onDownload, onDelete, onShare, onMove, folders }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  return (
    <div className="card hover:shadow-md transition-shadow group relative">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
          {iconByType(file.mimeType)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">{file.originalName}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>{formatSize(file.size)}</span>
            <span>•</span>
            <span>{formatDate(file.createdAt)}</span>
            {file.isPublic && (
              <>
                <span>•</span>
                <span className="text-green-600 font-medium">Shared</span>
              </>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {file.downloads} download{file.downloads !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Action buttons */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="File actions"
          >
            <HiDotsVertical className="w-5 h-5 text-gray-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
              <button
                onClick={() => { onDownload(file); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <HiDownload className="w-4 h-4" /> Download
              </button>
              <button
                onClick={() => { onShare(file); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <HiShare className="w-4 h-4" /> {file.isPublic ? 'Unshare' : 'Share'}
              </button>
              <button
                onClick={() => { setMoveOpen(true); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <HiFolder className="w-4 h-4" /> Move to Folder
              </button>
              <hr className="my-1" />
              <button
                onClick={() => { onDelete(file); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <HiTrash className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Move dialog */}
      {moveOpen && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Move to folder:</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { onMove(file, null); setMoveOpen(false); }}
              className="text-xs px-3 py-1.5 bg-white border rounded-lg hover:bg-gray-100"
            >
              Root
            </button>
            {folders?.map((folder) => (
              <button
                key={folder._id}
                onClick={() => { onMove(file, folder._id); setMoveOpen(false); }}
                className="text-xs px-3 py-1.5 bg-white border rounded-lg hover:bg-gray-100"
              >
                {folder.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setMoveOpen(false)}
            className="text-xs text-gray-500 mt-2 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Share link */}
      {file.isPublic && file.shareLink && (
        <div className="mt-3 p-2 bg-green-50 rounded-lg">
          <p className="text-xs text-green-700 font-medium mb-1">Share Link:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/shared/${file.shareLink}`}
              className="text-xs flex-1 p-1.5 bg-white border rounded text-gray-600"
              onClick={(e) => e.target.select()}
            />
            <button
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/shared/${file.shareLink}`)}
              className="text-xs px-2 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { formatSize, formatDate };
