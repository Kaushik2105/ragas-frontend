import { Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { unwrap } from '../../utils/music';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(unwrap(response).users || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load users');
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  const toggleActive = async (user) => {
    try {
      await api.patch(`/admin/users/${user.id}/toggle-active`);
      toast.success('User status updated');
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update user');
    }
  };

  if (loading) return <Loader label="Loading users" />;

  return (
    <section className="page">
      <PageHeader eyebrow="Admin" title="User management" description="Search listeners and toggle account access." />
      <div className="toolbar">
        <div className="search-box inline">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" />
        </div>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="table-card">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className={user.isActive ? 'status active' : 'status'}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td><button className="ghost-button" type="button" onClick={() => toggleActive(user)}>{user.isActive ? 'Deactivate' : 'Activate'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AdminUsers;
