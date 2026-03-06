import FileUpload from '../components/FileUpload';
import { useNavigate } from 'react-router-dom';

export default function Upload() {
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload Files</h1>
        <p className="text-gray-500 mt-1">Upload files up to 10 GB each. Supports images, videos, documents, and more.</p>
      </div>

      <div className="card">
        <FileUpload
          onUploadComplete={() => {
            setTimeout(() => navigate('/dashboard'), 1500);
          }}
        />
      </div>

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
