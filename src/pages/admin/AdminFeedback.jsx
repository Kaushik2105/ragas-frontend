import { Music2, Pin, Star, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { initials, unwrap } from '../../utils/music';

const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/feedback?limit=80');
      setFeedback(unwrap(response).feedbacks || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load feedback');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const react = async (feedbackId, emoji) => {
    try {
      await api.post(`/feedback/${feedbackId}/react`, { emoji });
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save reaction');
    }
  };

  const togglePin = async (feedbackId) => {
    try {
      const response = await api.patch(`/feedback/${feedbackId}/pin`);
      toast.success(response.data?.message || 'Feedback updated');
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update pin');
    }
  };

  const removeFeedback = async (feedbackId) => {
    try {
      await api.delete(`/feedback/${feedbackId}`);
      toast.success('Feedback deleted');
      setFeedback((items) => items.filter((item) => item.id !== feedbackId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete feedback');
    }
  };

  if (loading) return <Loader label="Loading feedback" />;

  return (
    <section className="page">
      <PageHeader eyebrow="Admin" title="Feedback overview" description="React to listener notes, pin highlights, and remove feedback when needed." />
      <div className="feedback-list">
        {feedback.map((item) => (
          <article className={`feedback-card ${item.isPinned ? 'pinned' : ''}`} key={item.id}>
            <div className="feedback-author-row">
              <span className="avatar small">{initials(item.user?.name || 'Listener')}</span>
              <div>
                <strong>{item.user?.name || 'Listener'}</strong>
                <div className="rating-row">
                  {Array.from({ length: item.rating }).map((_, index) => <Star key={`${item.id}-${index}`} size={16} fill="currentColor" />)}
                </div>
              </div>
              {item.isPinned && <span className="status active"><Pin size={13} /> Pinned</span>}
            </div>
            <p>{item.comment || 'No comment left.'}</p>
            <span className="song-chip"><Music2 size={14} /> {item.song?.title || 'Unknown song'} · {item.song?.artist || 'Unknown artist'}</span>
            <div className="reaction-row">
              {reactionEmojis.map((emoji) => (
                <button type="button" className="reaction-button" key={emoji} onClick={() => react(item.id, emoji)}>
                  <span>{emoji}</span>
                  <small>{Number(item.reactions?.[emoji]) || 0}</small>
                </button>
              ))}
            </div>
            <div className="admin-actions">
              <button className="ghost-button" type="button" onClick={() => togglePin(item.id)}>
                <Pin size={15} /> {item.isPinned ? 'Unpin' : 'Pin'}
              </button>
              <button className="danger-button" type="button" onClick={() => removeFeedback(item.id)}>
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AdminFeedback;
