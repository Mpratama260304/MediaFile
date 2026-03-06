import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { formatSize } from '../../components/FileCard';
import {
  HiUsers,
  HiDocument,
  HiDatabase,
  HiDownload,
  HiArrowRight,
} from 'react-icons/hi';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, fileTypes, recentFiles, recentUsers } = data;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Link to="/admin/users" className="btn-secondary text-sm">
            Manage Users
          </Link>
          <Link to="/admin/files" className="btn-secondary text-sm">
            Manage Files
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<HiUsers className="w-6 h-6 text-blue-500" />}
          label="Total Users"
          value={stats.totalUsers}
          sub={`${stats.activeUsers} active`}
          color="blue"
        />
        <StatCard
          icon={<HiDocument className="w-6 h-6 text-green-500" />}
          label="Total Files"
          value={stats.totalFiles}
          color="green"
        />
        <StatCard
          icon={<HiDatabase className="w-6 h-6 text-purple-500" />}
          label="Storage Used"
          value={formatSize(stats.totalStorage)}
          color="purple"
        />
        <StatCard
          icon={<HiDownload className="w-6 h-6 text-orange-500" />}
          label="Total Downloads"
          value={stats.totalDownloads}
          color="orange"
        />
      </div>

      {/* File Type Distribution */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">File Type Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {fileTypes.map((ft) => (
            <div key={ft._id} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{ft.count}</div>
              <div className="text-sm text-gray-500">{ft._id}</div>
              <div className="text-xs text-gray-400 mt-1">{formatSize(ft.totalSize)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <Link to="/admin/users" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentUsers.map((u) => (
              <div key={u._id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <div className="text-sm font-medium text-gray-900">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">{u.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Files */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Files</h2>
            <Link to="/admin/files" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentFiles.map((f) => (
              <div key={f._id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">{f.originalName}</div>
                  <div className="text-xs text-gray-500">
                    by {f.user?.name || 'Unknown'} • {formatSize(f.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  const bgColors = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    orange: 'bg-orange-50',
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg ${bgColors[color]}`}>{icon}</div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{label}</div>
          {sub && <div className="text-xs text-gray-400">{sub}</div>}
        </div>
      </div>
    </div>
  );
}
