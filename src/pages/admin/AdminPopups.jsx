import { useEffect, useState } from 'react';
import { 
  Bell, 
  Send, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  MessageSquare, 
  Sparkles, 
  Smartphone, 
  Radio, 
  Eye, 
  ToggleLeft, 
  ToggleRight,
  Layers,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import config from '../../config';
import { unwrap } from '../../utils/music';

const FORMAT_PRESETS = {
  message: {
    title: '🚀 New App Update Available!',
    message: 'A brand new version of RAGAS is now ready. Update today to enjoy smooth playback, zero audio overlaps, and refined controls!',
    actionText: 'Download Update',
    actionUrl: config.apkDownloadUrl || 'https://github.com/Kaushik2105/Ragas-Mobile/releases',
  },
  feedback: {
    title: '💬 We Value Your Feedback!',
    message: 'Help us make RAGAS even better for you. Let us know what you love, any bugs you found, or tracks you would love to hear next.',
    actionText: 'Give Feedback',
    actionUrl: '/feedback',
  },
};

const AdminPopups = () => {
  const [formatType, setFormatType] = useState('message'); // 'message' | 'feedback'
  const [title, setTitle] = useState(FORMAT_PRESETS.message.title);
  const [message, setMessage] = useState(FORMAT_PRESETS.message.message);
  const [actionText, setActionText] = useState(FORMAT_PRESETS.message.actionText);
  const [actionUrl, setActionUrl] = useState(FORMAT_PRESETS.message.actionUrl);
  const [sendPush, setSendPush] = useState(true);

  const [broadcasting, setBroadcasting] = useState(false);
  const [popups, setPopups] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch all popups from backend
  const fetchPopups = async () => {
    try {
      const response = await api.get('/admin/popups?limit=50');
      const data = unwrap(response);
      setPopups(data?.popups || []);
      setTotalCount(data?.total || 0);
      setActiveCount(data?.activeCount || 0);
    } catch (err) {
      console.warn('Failed to load popups list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  // Update form fields when dropdown format changes
  const handleFormatChange = (newFormat) => {
    setFormatType(newFormat);
    const preset = FORMAT_PRESETS[newFormat] || FORMAT_PRESETS.message;
    setTitle(preset.title);
    setMessage(preset.message);
    setActionText(preset.actionText);
    setActionUrl(preset.actionUrl);
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required.');
      return;
    }

    setBroadcasting(true);
    try {
      const payload = {
        type: formatType,
        title: title.trim(),
        message: message.trim(),
        actionText: actionText.trim() || undefined,
        actionUrl: actionUrl.trim() || undefined,
        sendPush,
      };

      const response = await api.post('/admin/popups', payload);
      const data = unwrap(response);

      toast.success('🎉 Pop-up successfully broadcasted across Web & Mobile!');
      if (data?.pushResult) {
        toast(
          `📱 Push dispatched: ${data.pushResult.successCount} of ${data.pushResult.totalTargeted} mobile devices notified`,
          { icon: '📲' }
        );
      }

      fetchPopups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to broadcast pop-up.');
    } finally {
      setBroadcasting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/admin/popups/${id}/toggle`);
      toast.success('Pop-up status updated');
      fetchPopups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update pop-up status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this broadcast pop-up?')) {
      return;
    }
    try {
      await api.delete(`/admin/popups/${id}`);
      toast.success('Pop-up deleted');
      fetchPopups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete pop-up.');
    }
  };

  return (
    <section className="page admin-popups-page">
      <PageHeader
        eyebrow="Admin"
        title="Broadcast Pop-ups"
        description="Create real-time broadcast announcements and feedback alerts that pop up for all users on website and mobile app."
      />

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <Radio size={22} className="text-cyan" />
          <span>Active Pop-ups</span>
          <strong>{activeCount}</strong>
        </div>
        <div className="stat-card">
          <Layers size={22} className="text-purple" />
          <span>Total Broadcasted</span>
          <strong>{totalCount}</strong>
        </div>
        <div className="stat-card">
          <Sparkles size={22} className="text-pink" />
          <span>Supported Formats</span>
          <strong>2 (Extensible)</strong>
        </div>
      </div>

      <div className="admin-popups-layout">
        {/* Creation Form */}
        <div className="panel admin-popup-form-card">
          <div className="panel-header-row">
            <h2>Broadcast New Pop-up</h2>
            <span className="badge badge-primary">Real-Time Sync</span>
          </div>

          <form onSubmit={handleBroadcast} className="form-stack">
            {/* Format Dropdown Selector */}
            <div className="form-group">
              <label htmlFor="popupFormat">Pop-up Format / Type</label>
              <select
                id="popupFormat"
                value={formatType}
                onChange={(e) => handleFormatChange(e.target.value)}
                className="input select-input"
              >
                <option value="message">📢 Normal Message (App Update / Announcement)</option>
                <option value="feedback">💬 Feedback Notification (Link to Feedback Page)</option>
              </select>
              <span className="input-hint">
                {formatType === 'message'
                  ? 'Broadcasts announcements, new version downloads, or feature highlights.'
                  : 'Encourages users to give reviews or submit feedback directly.'}
              </span>
            </div>

            {/* Title */}
            <div className="form-group">
              <label htmlFor="popupTitle">Pop-up Title</label>
              <input
                id="popupTitle"
                type="text"
                className="input"
                placeholder="e.g. New Update Available!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Message Body */}
            <div className="form-group">
              <label htmlFor="popupMessage">Message Content</label>
              <textarea
                id="popupMessage"
                className="input textarea"
                rows={4}
                placeholder="Describe what is new or what you would like listeners to know..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            {/* Action Button Details */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="actionText">Action Button Text</label>
                <input
                  id="actionText"
                  type="text"
                  className="input"
                  placeholder="e.g. Download Now"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="actionUrl">Action Link / URL</label>
                <input
                  id="actionUrl"
                  type="text"
                  className="input"
                  placeholder="e.g. /feedback or https://..."
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Push Notification Toggle */}
            <div className="checkbox-row">
              <input
                type="checkbox"
                id="sendPushCheckbox"
                checked={sendPush}
                onChange={(e) => setSendPush(e.target.checked)}
              />
              <label htmlFor="sendPushCheckbox" className="checkbox-label">
                <Smartphone size={16} /> Also send push notification to all mobile devices
              </label>
            </div>

            <button
              type="submit"
              disabled={broadcasting}
              className="primary-button submit-broadcast-btn"
            >
              {broadcasting ? (
                <>
                  <span className="spinner-sm" /> Broadcasting...
                </>
              ) : (
                <>
                  <Send size={18} /> Broadcast Pop-up Now
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Interactive Preview */}
        <div className="panel admin-popup-preview-card">
          <div className="panel-header-row">
            <h2>
              <Eye size={18} /> Live Listener Preview
            </h2>
            <span className="badge badge-info">Preview Mode</span>
          </div>

          <div className="popup-mockup-wrapper">
            <div className="popup-mockup-modal">
              <div className="popup-mockup-glow" />
              <div className="popup-mockup-header">
                <div className={`popup-mockup-icon ${formatType === 'feedback' ? 'icon-feedback' : 'icon-message'}`}>
                  {formatType === 'feedback' ? <MessageSquare size={24} /> : <Sparkles size={24} />}
                </div>
                <div className="popup-mockup-badge">
                  {formatType === 'feedback' ? 'Feedback Request' : 'Announcement'}
                </div>
              </div>

              <h3 className="popup-mockup-title">{title || 'Pop-up Title'}</h3>
              <p className="popup-mockup-body">
                {message || 'Your message will appear here for listeners on web and mobile.'}
              </p>

              <div className="popup-mockup-actions">
                {actionText && (
                  <button type="button" className="mockup-action-btn">
                    <span>{actionText}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
                <button type="button" className="mockup-dismiss-btn">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pop-up Broadcast History */}
      <div className="panel popup-history-panel">
        <div className="panel-header-row">
          <h2>Pop-up Broadcast History & Controls</h2>
          <span className="badge">{popups.length} Records</span>
        </div>

        {loading ? (
          <Loader label="Loading pop-up history" />
        ) : popups.length === 0 ? (
          <div className="empty-state">
            <Bell size={40} className="empty-icon text-muted" />
            <p>No pop-ups broadcasted yet. Create your first pop-up above!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Format</th>
                  <th>Title & Content</th>
                  <th>Target Action</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {popups.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className={`badge ${p.type === 'feedback' ? 'badge-pink' : 'badge-cyan'}`}>
                        {p.type === 'feedback' ? 'Feedback' : 'Message'}
                      </span>
                    </td>
                    <td className="popup-content-cell">
                      <strong className="popup-table-title">{p.title}</strong>
                      <p className="popup-table-message">{p.message}</p>
                    </td>
                    <td>
                      {p.actionText ? (
                        <div className="popup-action-chip">
                          <span>{p.actionText}</span>
                          {p.actionUrl && (
                            <span className="popup-url-sub" title={p.actionUrl}>
                              {p.actionUrl}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">None</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggle(p.id)}
                        className={`status-toggle-btn ${p.isActive ? 'active' : 'inactive'}`}
                        title="Click to toggle active state"
                      >
                        {p.isActive ? (
                          <>
                            <CheckCircle2 size={16} className="text-success" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle size={16} className="text-muted" /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="date-cell">
                      {new Date(p.createdAt).toLocaleDateString()}{' '}
                      <span className="time-sub">
                        {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="icon-button danger"
                          onClick={() => handleDelete(p.id)}
                          title="Delete Pop-up"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminPopups;
