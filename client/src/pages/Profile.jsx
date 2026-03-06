import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { HiUser, HiMail, HiCalendar, HiDatabase } from 'react-icons/hi';
import { formatSize } from '../components/FileCard';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.patch('/users/profile', { name });
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Profile</h1>

      {/* Profile info */}
      <div className="card mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-600">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full capitalize">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <HiMail className="w-4 h-4 text-gray-400" />
            {user?.email}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <HiCalendar className="w-4 h-4 text-gray-400" />
            Joined {new Date(user?.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <HiDatabase className="w-4 h-4 text-gray-400" />
            {formatSize(user?.storageUsed || 0)} used
          </div>
        </div>
      </div>

      {/* Update name */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Profile</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field pl-10"
                required
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
