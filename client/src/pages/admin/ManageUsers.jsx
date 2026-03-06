import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import { formatSize } from '../../components/FileCard';
import { HiArrowLeft, HiBan, HiCheckCircle, HiTrash } from 'react-icons/hi';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: { page, limit: 20, search: search || undefined },
      });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    try {
      await api.patch(`/admin/users/${user._id}/toggle`);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete user "${user.name}" and all their data? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${user._id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-lg">
          <HiArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pagination ? `${pagination.total} total users` : ''}
          </p>
        </div>
        <div className="w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
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
                    <th className="text-left p-4 font-medium text-gray-600">User</th>
                    <th className="text-left p-4 font-medium text-gray-600">Role</th>
                    <th className="text-left p-4 font-medium text-gray-600">Storage</th>
                    <th className="text-left p-4 font-medium text-gray-600">Status</th>
                    <th className="text-left p-4 font-medium text-gray-600">Joined</th>
                    <th className="text-right p-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full capitalize ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600">{formatSize(user.storageUsed)}</td>
                      <td className="p-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            user.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg ${
                              user.isActive
                                ? 'hover:bg-red-50 text-red-500'
                                : 'hover:bg-green-50 text-green-500'
                            }`}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? (
                              <HiBan className="w-5 h-5" />
                            ) : (
                              <HiCheckCircle className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                            title="Delete user"
                          >
                            <HiTrash className="w-5 h-5" />
                          </button>
                        </div>
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
