import { Link } from 'react-router-dom';
import { HiFolder, HiDotsVertical, HiPencil, HiTrash } from 'react-icons/hi';
import { useState } from 'react';

export default function FolderCard({ folder, onRename, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(folder.name);

  const handleRename = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onRename(folder, name.trim());
      setEditing(false);
    }
  };

  return (
    <div className="card hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-50 rounded-lg">
          <HiFolder className="w-8 h-8 text-yellow-500" />
        </div>

        <div className="flex-1 min-w-0">
          {editing ? (
            <form onSubmit={handleRename} className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field text-sm py-1"
                autoFocus
              />
              <button type="submit" className="text-xs btn-primary py-1">
                Save
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setName(folder.name); }}
                className="text-xs btn-secondary py-1"
              >
                Cancel
              </button>
            </form>
          ) : (
            <Link
              to={`/folder/${folder._id}`}
              className="text-sm font-medium text-gray-900 hover:text-primary-600 truncate block"
            >
              {folder.name}
            </Link>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(folder.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Folder actions"
          >
            <HiDotsVertical className="w-5 h-5 text-gray-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
              <button
                onClick={() => { setEditing(true); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <HiPencil className="w-4 h-4" /> Rename
              </button>
              <button
                onClick={() => { onDelete(folder); setMenuOpen(false); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <HiTrash className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
