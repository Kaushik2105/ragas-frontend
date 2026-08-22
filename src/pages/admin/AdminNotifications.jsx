import { useEffect, useMemo, useState } from 'react';
import { Bell, Send, Users, User, CheckCircle2, AlertCircle, Search, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import { unwrap } from '../../utils/music';

const AdminNotifications = () => {
  const [targetType, setTargetType] = useState('all'); // 'all' | 'user'
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Load users for single user selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users?limit=200');
        const data = unwrap(response);
        setUsers(data?.users || []);
      } catch (err) {
        console.warn('Failed to load users list:', err);
      }
    };
    fetchUsers();
  }, []);

  // Load notification history
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await api.get('/admin/notifications');
      const data = unwrap(response);
      setLogs(data?.notifications || []);
    } catch (err) {
      console.warn('Failed to load notification logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const pushReadyUsers = useMemo(() => {
    return users.filter((u) => !!u.pushToken);
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Title and message body are required.');
      return;
    }
    if (targetType === 'user' && !selectedUserId) {
      toast.error('Please select a recipient user.');
      return;
    }

    setSending(true);
    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        targetType,
        targetUserId: targetType === 'user' ? selectedUserId : null,
      };

      const response = await api.post('/admin/notifications/send', payload);
      const data = unwrap(response);

      if (data.totalTargeted === 0) {
        toast.error(
          'Target user(s) do not have a push token registered yet in the database.'
        );
      } else if (data.successCount === 0 && data.failureCount > 0) {
        toast.error(
          `Delivery failed for ${data.failureCount} device(s). Check token validity.`
        );
      } else {
        toast.success(
          `🚀 Notification dispatched! (${data.successCount} of ${data.totalTargeted} delivered)`
        );
      }

      setTitle('');
      setBody('');
      setSelectedUserId('');
      fetchLogs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="section-container">
      <PageHeader
        eyebrow="Push Notifications"
        title="Broadcast & Personal Notifications"
        description="Send real-time FCM push notification messages to all users or specific users directly to their Android devices."
      />

      {/* Push Token Status Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 18px',
          borderRadius: '16px',
          background: pushReadyUsers.length > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
          border: `1px solid ${pushReadyUsers.length > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          margin: '20px 0',
        }}
      >
        <Smartphone size={20} color={pushReadyUsers.length > 0 ? '#10b981' : '#f59e0b'} />
        <div style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>
          <strong>Push Status: </strong>
          {pushReadyUsers.length} of {users.length} users have registered active device push tokens.
          {pushReadyUsers.length === 0 ? ' (Users will register their tokens automatically upon logging into the mobile app).' : ''}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Form Panel */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Send size={20} color="#a855f7" /> Compose Notification
          </h2>

          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                Recipient Target
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setTargetType('all')}
                  className={targetType === 'all' ? 'primary-button' : 'secondary-button'}
                  style={{ flex: 1, padding: '10px', fontSize: '0.875rem' }}
                >
                  <Users size={16} /> Broadcast to All ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('user')}
                  className={targetType === 'user' ? 'primary-button' : 'secondary-button'}
                  style={{ flex: 1, padding: '10px', fontSize: '0.875rem' }}
                >
                  <User size={16} /> Specific User
                </button>
              </div>
            </div>

            {targetType === 'user' && (
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                  Select Recipient User
                </label>

                {/* User Search Box */}
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#06b6d4' }} />
                  <input
                    type="text"
                    placeholder="Filter user by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{
                      width: '100%',
                      paddingLeft: '32px',
                      paddingRight: '10px',
                      height: '34px',
                      borderRadius: '8px',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      color: '#fff',
                      fontSize: '0.8rem',
                    }}
                  />
                </div>

                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#1e1b4b', border: '1px solid #3730a3', color: '#fff' }}
                >
                  <option value="">-- Choose Recipient ({filteredUsers.length} available) --</option>
                  {filteredUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) {u.pushToken ? '📱 [Push Active]' : '⚠️ [No Token]'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                Notification Title
              </label>
              <input
                type="text"
                placeholder="e.g. New Track Alert! 🎵"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                Message Body
              </label>
              <textarea
                rows={4}
                placeholder="Type notification message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="input-field"
                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="primary-button"
              style={{ width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 600, marginTop: '8px' }}
            >
              {sending ? 'Dispatching via Firebase FCM...' : '🚀 Send Push Notification'}
            </button>
          </form>
        </div>

        {/* Live Preview Panel */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={20} color="#06b6d4" /> Live Android Preview
          </h2>

          <div style={{ background: '#090d16', borderRadius: '24px', padding: '20px', border: '2px solid #1e293b', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.85)', borderRadius: '16px', padding: '16px', border: '1px solid rgba(168, 85, 247, 0.3)', width: '100%', maxWidth: '300px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: 'linear-gradient(135deg, #a855f7, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>R</div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a855f7', letterSpacing: '1px' }}>RAGAS</span>
                <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: 'auto' }}>now</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc', marginBottom: '4px' }}>
                {title || 'Notification Title'}
              </div>
              <div style={{ fontSize: '0.825rem', color: '#94a3b8', lineHeight: 1.4 }}>
                {body || 'Your notification body preview will appear here in real time.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card" style={{ padding: '24px', marginTop: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', color: '#f8fafc' }}>
          Notification History Log
        </h2>

        {loadingLogs ? (
          <p style={{ color: '#94a3b8' }}>Loading notification history...</p>
        ) : !logs.length ? (
          <p style={{ color: '#64748b' }}>No notifications sent yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                  <th style={{ padding: '12px' }}>Title</th>
                  <th style={{ padding: '12px' }}>Message</th>
                  <th style={{ padding: '12px' }}>Target</th>
                  <th style={{ padding: '12px' }}>Delivered</th>
                  <th style={{ padding: '12px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #1e293b', color: '#e2e8f0' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{log.title}</td>
                    <td style={{ padding: '12px', color: '#94a3b8', maxWidth: '300px' }}>{log.body}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: log.targetType === 'all' ? '#3b82f620' : '#a855f720', color: log.targetType === 'all' ? '#60a5fa' : '#c084fc', padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {log.targetType === 'all' ? 'Broadcast (All)' : 'Single User'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 600, color: log.deliveredCount > 0 ? '#10b981' : '#f59e0b' }}>
                      {log.deliveredCount} devices
                    </td>
                    <td style={{ padding: '12px', color: '#64748b', fontSize: '0.75rem' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
