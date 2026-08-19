import { useEffect, useState } from 'react';
import { Bell, Send, Users, User, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import { unwrap } from '../../utils/music';

const AdminNotifications = () => {
  const [targetType, setTargetType] = useState('all'); // 'all' | 'user'
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Load users for single user selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users?limit=100');
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

      toast.success(`Notification sent! (${data.successCount} delivered)`);
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
        description="Send push notification messages to all users or specific users directly to their Android/iOS devices."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '24px' }}>
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
                  <Users size={16} /> All Users
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
                  Select User
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#1e1b4b', border: '1px solid #3730a3', color: '#fff' }}
                >
                  <option value="">-- Choose User --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) {u.pushToken ? '📱 [Push Ready]' : ''}
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
                placeholder="e.g. New Album Released! 🎵"
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
                placeholder="Type your message content here..."
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
              {sending ? 'Sending Notification...' : '🚀 Send Push Notification'}
            </button>
          </form>
        </div>

        {/* Live Preview Panel */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={20} color="#06b6d4" /> Phone Preview Mockup
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
                    <td style={{ padding: '12px', fontWeight: 600, color: '#10b981' }}>
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
