import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiCloudUpload, HiX, HiClipboardCopy, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';
import api from '../api/axios';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10 GB
const CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
}

export default function GuestUpload() {
  const [uploads, setUploads] = useState([]);

  const uploadFile = async (file) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} exceeds the 10 GB limit.`);
      return;
    }

    const uploadId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const entry = {
      id: uploadId,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'uploading',
      shareLink: null,
    };

    setUploads((prev) => [...prev, entry]);

    try {
      let responseData;

      if (file.size <= CHUNK_SIZE) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploads((prev) =>
              prev.map((u) => (u.id === uploadId ? { ...u, progress } : u))
            );
          },
        });
        responseData = res.data;
      } else {
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

          const res = await api.post('/files/upload/chunk', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          const progress = Math.round(((i + 1) / totalChunks) * 100);
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, progress } : u))
          );

          if (i === totalChunks - 1) {
            responseData = res.data;
          }
        }
      }

      const shareLink = responseData?.file?.shareLink;

      setUploads((prev) =>
        prev.map((u) =>
          u.id === uploadId ? { ...u, status: 'complete', progress: 100, shareLink } : u
        )
      );
      toast.success(`${file.name} uploaded successfully!`);
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      setUploads((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, status: 'error', errorMsg: msg } : u))
      );
      toast.error(`Upload failed: ${msg}`);
    }
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    rejectedFiles.forEach((r) => {
      const reason = r.errors.map((e) => e.message).join(', ');
      toast.error(`${r.file.name}: ${reason}`);
    });
    acceptedFiles.forEach(uploadFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
  });

  const removeUpload = (id) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const copyShareLink = (shareLink) => {
    const url = `${window.location.origin}/shared/${shareLink}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied!');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Upload Your Files</h1>
        <p className="text-gray-500 mt-2">
          No account required. Upload files up to 10 GB and get a share link instantly.
        </p>
      </div>

      {/* Drop zone */}
      <div className="card mb-6">
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
                Supports files up to 10 GB &mdash; images, videos, documents, archives, and more.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Upload list */}
      {uploads.length > 0 && (
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Uploads</h2>
          {uploads.map((u) => (
            <div
              key={u.id}
              className="border border-gray-100 rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400">{formatSize(u.size)}</p>
                </div>

                {u.status === 'complete' && (
                  <HiCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
                {u.status === 'error' && (
                  <HiExclamationCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}

                <button
                  onClick={() => removeUpload(u.id)}
                  className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <HiX className="w-4 h-4" />
                </button>
              </div>

              {/* Progress bar */}
              {u.status === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              )}

              {/* Error message */}
              {u.status === 'error' && u.errorMsg && (
                <p className="text-xs text-red-500 mt-1">{u.errorMsg}</p>
              )}

              {/* Share link */}
              {u.status === 'complete' && u.shareLink && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    readOnly
                    value={`${window.location.origin}/shared/${u.shareLink}`}
                    className="input-field text-xs py-1.5 flex-1"
                  />
                  <button
                    onClick={() => copyShareLink(u.shareLink)}
                    className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    <HiClipboardCopy className="w-4 h-4" /> Copy
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Supported file types */}
      <div className="mt-6 card">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Supported File Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-500">
          <div>
            <span className="font-medium text-gray-700">Images:</span>
            <br />JPG, PNG, GIF, WebP, SVG
          </div>
          <div>
            <span className="font-medium text-gray-700">Videos:</span>
            <br />MP4, WebM, MOV, AVI, MKV
          </div>
          <div>
            <span className="font-medium text-gray-700">Audio:</span>
            <br />MP3, WAV, OGG, FLAC, AAC
          </div>
          <div>
            <span className="font-medium text-gray-700">Documents:</span>
            <br />PDF, DOC, XLS, PPT, TXT
          </div>
        </div>
      </div>
    </div>
  );
}
