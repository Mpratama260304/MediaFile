import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import FileCard from '../components/FileCard';
import FolderCard from '../components/FolderCard';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import { HiFolderAdd } from 'react-icons/hi';
import { formatSize } from '../components/FileCard';

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [allFolders, setAllFolders] = useState([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [storage, setStorage] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;

      const [filesRes, foldersRes, storageRes, allFoldersRes] = await Promise.all([
        api.get('/files', { params }),
        api.get('/folders'),
        api.get('/users/storage'),
        api.get('/folders'),
      ]);

      setFiles(filesRes.data.files);
      setPagination(filesRes.data.pagination);
      setFolders(foldersRes.data.folders);
      setAllFolders(allFoldersRes.data.folders);
      setStorage(storageRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownload = async (file) => {
    try {
      const res = await api.get(`/files/${file._id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Download failed');
    }
  };

  const handleDelete = async (file) => {
    if (!window.confirm(`Delete "${file.originalName}"?`)) return;
    try {
      await api.delete(`/files/${file._id}`);
      toast.success('File deleted');
      fetchData();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleShare = async (file) => {
    try {
      const res = await api.patch(`/files/${file._id}/share`);
      toast.success(res.data.message);
      fetchData();
    } catch {
      toast.error('Failed to update sharing');
    }
  };

  const handleMove = async (file, folderId) => {
    try {
      await api.patch(`/files/${file._id}/move`, { folderId });
      toast.success('File moved');
      fetchData();
    } catch {
      toast.error('Failed to move file');
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await api.post('/folders', { name: newFolderName.trim() });
      toast.success('Folder created');
      setNewFolderName('');
      setShowNewFolder(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create folder');
    }
  };

  const handleRenameFolder = async (folder, name) => {
    try {
      await api.patch(`/folders/${folder._id}`, { name });
      toast.success('Folder renamed');
      fetchData();
    } catch {
      toast.error('Failed to rename folder');
    }
  };

  const handleDeleteFolder = async (folder) => {
    if (!window.confirm(`Delete folder "${folder.name}" and all its contents?`)) return;
    try {
      await api.delete(`/folders/${folder._id}`);
      toast.success('Folder deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete folder');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Files</h1>
          {storage && (
            <div className="mt-2">
              <div className="text-sm text-gray-500">
                {formatSize(storage.storageUsed)} of {formatSize(storage.storageLimit)} used ({storage.percentUsed}%)
              </div>
              <div className="w-64 bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(parseFloat(storage.percentUsed), 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <SearchBar value={search} onChange={setSearch} />
          <button
            onClick={() => setShowNewFolder(!showNewFolder)}
            className="btn-secondary flex items-center gap-1.5 whitespace-nowrap"
          >
            <HiFolderAdd className="w-5 h-5" />
            New Folder
          </button>
        </div>
      </div>

      {/* New folder form */}
      {showNewFolder && (
        <form onSubmit={handleCreateFolder} className="card mb-6 flex items-center gap-3">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="input-field flex-1"
            autoFocus
          />
          <button type="submit" className="btn-primary">Create</button>
          <button type="button" onClick={() => setShowNewFolder(false)} className="btn-secondary">
            Cancel
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {/* Folders */}
          {folders.length > 0 && !search && (
            <div className="mb-8">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Folders</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {folders.map((folder) => (
                  <FolderCard
                    key={folder._id}
                    folder={folder}
                    onRename={handleRenameFolder}
                    onDelete={handleDeleteFolder}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              {search ? `Search Results` : 'Files'}
            </h2>
            {files.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">
                  {search ? 'No files match your search.' : 'No files yet. Start uploading!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {files.map((file) => (
                  <FileCard
                    key={file._id}
                    file={file}
                    folders={allFolders}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                    onShare={handleShare}
                    onMove={handleMove}
                  />
                ))}
              </div>
            )}
          </div>

          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
