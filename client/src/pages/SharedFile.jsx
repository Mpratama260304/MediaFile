import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { HiDownload, HiDocument } from 'react-icons/hi';
import { formatSize, formatDate } from '../components/FileCard';

export default function SharedFile() {
  const { shareLink } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await api.get(`/files/shared/${shareLink}`);
        setFile(res.data.file);
      } catch {
        setError('File not found or no longer shared.');
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [shareLink]);

  const handleDownload = async () => {
    try {
      const res = await api.get(`/files/shared/${shareLink}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Download failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <HiDocument className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">{error}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-16">
      <div className="card text-center">
        <HiDocument className="w-16 h-16 text-primary-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">{file.originalName}</h1>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-6">
          <span>{formatSize(file.size)}</span>
          <span>•</span>
          <span>{formatDate(file.createdAt)}</span>
          <span>•</span>
          <span>{file.downloads} downloads</span>
        </div>
        <button onClick={handleDownload} className="btn-primary text-lg px-8 py-3 inline-flex items-center gap-2">
          <HiDownload className="w-5 h-5" />
          Download File
        </button>
      </div>
    </div>
  );
}
