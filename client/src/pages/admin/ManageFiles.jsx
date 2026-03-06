import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import { formatSize, formatDate } from '../../components/FileCard';
import { HiArrowLeft, HiTrash, HiDownload } from 'react-icons/hi';

export default function ManageFiles() {
  const [files, setFiles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/files', {
        params: { page, limit: 20, search: search || undefined },
      });
      setFiles(res.data.files);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async (file) => {
    if (!window.confirm(`Delete "${file.originalName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/files/${file._id}`);
      toast.success('File deleted');
      fetchFiles();
    } catch {
      toast.error('Failed to delete file');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
          <HiArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Manage Files</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pagination ? `${pagination.total} total files` : ''}
          </p>
        </div>
        <div className="w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Search files..." />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-4 font-medium text-gray-600">File</th>
                    <th className="text-left p-4 font-medium text-gray-600">Owner</th>
                    <th className="text-left p-4 font-medium text-gray-600">Size</th>
                    <th className="text-left p-4 font-medium text-gray-600">Type</th>
                    <th className="text-left p-4 font-medium text-gray-600">Downloads</th>
                    <th className="text-left p-4 font-medium text-gray-600">Uploaded</th>
                    <th className="text-right p-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-gray-900 truncate max-w-xs">
                          {file.originalName}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">
                        {file.user?.name || 'Unknown'}
                        <div className="text-xs text-gray-400">{file.user?.email}</div>
                      </td>
                      <td className="p-4 text-gray-600">{formatSize(file.size)}</td>
                      <td className="p-4">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                          {file.mimeType?.split('/')[1] || file.mimeType}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">
                        <div className="flex items-center gap-1">
                          <HiDownload className="w-4 h-4 text-gray-400" />
                          {file.downloads}
                        </div>
                      </td>
                      <td className="p-4 text-gray-500">{formatDate(file.createdAt)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(file)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                          title="Delete file"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
