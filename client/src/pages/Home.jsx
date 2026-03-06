import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiCloudUpload,
  HiShieldCheck,
  HiLightningBolt,
  HiFolder,
  HiShare,
  HiSearch,
} from 'react-icons/hi';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16 md:py-24">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Store, Share & Manage
          <br />
          <span className="text-primary-600">Your Files</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Upload files up to 10 GB, organize them in folders, and share with anyone.
          Fast, secure, and simple file storage for everyone.
        </p>
        <div className="flex items-center justify-center gap-4">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
                Go to Dashboard
              </Link>
              <Link to="/upload" className="btn-secondary text-lg px-8 py-3">
                Upload Files
              </Link>
            </>
          ) : (
            <>
              <Link to="/guest-upload" className="btn-primary text-lg px-8 py-3">
                Upload Now — No Account Needed
              </Link>
              <Link to="/register" className="btn-secondary text-lg px-8 py-3">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-16">
        <FeatureCard
          icon={<HiCloudUpload className="w-8 h-8 text-primary-600" />}
          title="Large File Uploads"
          description="Upload files up to 10 GB with chunked uploading for reliable transfers. Drag and drop or click to upload."
        />
        <FeatureCard
          icon={<HiFolder className="w-8 h-8 text-yellow-500" />}
          title="Folder Organization"
          description="Organize your files into folders and subfolders. Keep everything tidy and easy to find."
        />
        <FeatureCard
          icon={<HiShare className="w-8 h-8 text-green-500" />}
          title="Easy Sharing"
          description="Generate shareable links for your files. Control who can access your content with public/private settings."
        />
        <FeatureCard
          icon={<HiShieldCheck className="w-8 h-8 text-red-500" />}
          title="Secure Storage"
          description="Your files are protected with JWT authentication, encrypted passwords, and secure upload handling."
        />
        <FeatureCard
          icon={<HiLightningBolt className="w-8 h-8 text-purple-500" />}
          title="Fast Performance"
          description="Optimized for speed with efficient file handling, chunked uploads, and a modern React interface."
        />
        <FeatureCard
          icon={<HiSearch className="w-8 h-8 text-indigo-500" />}
          title="Search & Find"
          description="Quickly search through all your files. Find what you need in seconds with full-text search."
        />
      </div>

      {/* Stats */}
      <div className="bg-primary-600 rounded-2xl p-12 text-center text-white mb-16">
        <h2 className="text-3xl font-bold mb-8">Built for Everyone</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl font-bold">10 GB</div>
            <div className="text-primary-200 mt-2">Max File Size</div>
          </div>
          <div>
            <div className="text-4xl font-bold">40+</div>
            <div className="text-primary-200 mt-2">File Types Supported</div>
          </div>
          <div>
            <div className="text-4xl font-bold">Free</div>
            <div className="text-primary-200 mt-2">To Get Started</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="card">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
