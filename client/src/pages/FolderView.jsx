import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import FileCard from '../components/FileCard';
import FolderCard from '../components/FolderCard';
import FileUpload from '../components/FileUpload';
import Pagination from '../components/Pagination';
import { HiArrowLeft, HiFolderAdd } from 'react-icons/hi';

export default function FolderView() {
  const { folderId } = useParams();
  const [files, setFiles] = useState([]);
  const [subFolders, setSubFolders] = useState([]);
  const [allFolders, setAllFolders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [folderName, setFolderName] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [filesRes, subFoldersRes, allFoldersRes] = await Promise.all([
        api.get('/files', { params: { folder: folderId, page, limit: 20 } }),
        api.get('/folders', { params: { parent: folderId } }),
        api.get('/folders'),
      ]);

      setFiles(filesRes.data.files);
      setPagination(filesRes.data.pagination);
      setSubFolders(subFoldersRes.data.folders);
      setAllFolders(allFoldersRes.data.folders);

      // Find current folder name
      const currentFolder = allFoldersRes.data.folders.find((f) => f._id === folderId);
      setFolderName(currentFolder?.name || 'Folder');
    } catch {
      toast.error('Failed to load folder');
    } finally {
      setLoading(false);
    }
  }, [folderId, page]);

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

  const handleMove = async (file, targetFolderId) => {
    try {
      await api.patch(`/files/${file._id}/move`, { folderId: targetFolderId });
      toast.success('File moved');
      fetchData();
    } catch {
      toast.error('Failed to move file');
    }
  };

  const handleCreateSubFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await api.post('/folders', { name: newFolderName.trim(), parent: folderId });
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
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
          <HiArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{folderName}</h1>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="btn-primary"
        >
          Upload Here
        </button>
        <button
          onClick={() => setShowNewFolder(!showNewFolder)}
          className="btn-secondary flex items-center gap-1.5"
        >
          <HiFolderAdd className="w-5 h-5" />
          Subfolder
        </button>
      </div>

      {showUpload && (
        <div className="card mb-6">
          <FileUpload folderId={folderId} onUploadComplete={fetchData} />
        </div>
      )}

      {showNewFolder && (
        <form onSubmit={handleCreateSubFolder} className="card mb-6 flex items-center gap-3">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Subfolder name"
            className="input-field flex-1"
            autoFocus
          />
          <button type="submit" className="btn-primary">Create</button>
          <button type="button" onClick={() => setShowNewFolder(false)} className="btn-secondary">Cancel</button>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {subFolders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Subfolders</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subFolders.map((folder) => (
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

          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Files</h2>
          {files.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">This folder is empty.</p>
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
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
