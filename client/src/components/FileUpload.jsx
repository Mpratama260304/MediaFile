import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiCloudUpload, HiX } from 'react-icons/hi';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB chunks

export default function FileUpload({ folderId, onUploadComplete }) {
  const [uploads, setUploads] = useState([]);

  const uploadFile = async (file) => {
    const uploadId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const uploadEntry = {
      id: uploadId,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
    };

    setUploads((prev) => [...prev, uploadEntry]);

    try {
      if (file.size <= CHUNK_SIZE) {
        // Regular upload for small files
        const formData = new FormData();
        formData.append('file', file);
        if (folderId) formData.append('folder', folderId);

        await api.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploads((prev) =>
              prev.map((u) => (u.id === uploadId ? { ...u, progress } : u))
            );
          },
        });
      } else {
        // Chunked upload for large files
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          const formData = new FormData();
          formData.append('chunk', chunk);
          formData.append('uploadId', uploadId);
          formData.append('chunkIndex', i.toString());
          formData.append('totalChunks', totalChunks.toString());
          formData.append('originalName', file.name);
          formData.append('mimeType', file.type);
          formData.append('totalSize', file.size.toString());
          if (folderId) formData.append('folder', folderId);

          await api.post('/files/upload/chunk', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          const progress = Math.round(((i + 1) / totalChunks) * 100);
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, progress } : u))
          );
        }
      }

      setUploads((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, status: 'complete', progress: 100 } : u))
      );
      toast.success(`${file.name} uploaded successfully`);
      onUploadComplete?.();
    } catch (error) {
      setUploads((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, status: 'error' } : u))
      );
      toast.error(`Failed to upload ${file.name}: ${error.response?.data?.message || error.message}`);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach(uploadFile);
    },
    [folderId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024 * 1024, // 10 GB
  });

  const removeUpload = (id) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <HiCloudUpload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-lg text-primary-600 font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-lg text-gray-600 font-medium">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Supports files up to 10 GB. Images, videos, documents, and archives.
            </p>
          </>
        )}
      </div>

      {/* Upload progress list */}
      {uploads.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Uploads</h3>
          {uploads.map((upload) => (
            <div key={upload.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700 truncate flex-1">{upload.name}</span>
                <div className="flex items-center gap-2 ml-3">
                  <span
                    className={`text-xs font-medium ${
                      upload.status === 'complete'
                        ? 'text-green-600'
                        : upload.status === 'error'
                        ? 'text-red-600'
                        : 'text-primary-600'
                    }`}
                  >
                    {upload.status === 'complete'
                      ? 'Complete'
                      : upload.status === 'error'
                      ? 'Failed'
                      : `${upload.progress}%`}
                  </span>
                  {(upload.status === 'complete' || upload.status === 'error') && (
                    <button
                      onClick={() => removeUpload(upload.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                      aria-label="Remove upload"
                    >
                      <HiX className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    upload.status === 'error'
                      ? 'bg-red-500'
                      : upload.status === 'complete'
                      ? 'bg-green-500'
                      : 'bg-primary-500'
                  }`}
                  style={{ width: `${upload.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
