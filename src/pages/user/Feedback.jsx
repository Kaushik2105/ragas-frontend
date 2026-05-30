import { MessageSquare, Music2, Pin, Star } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { initials, unwrap } from '../../utils/music';

const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [songs, setSongs] = useState([]);
  const [songId, setSongId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [feedbackResponse, songsResponse] = await Promise.all([
        api.get('/feedback?limit=80'),
        api.get('/songs?limit=100'),
      ]);
      const songItems = unwrap(songsResponse).songs || unwrap(songsResponse) || [];
      setFeedback(unwrap(feedbackResponse).feedbacks || []);
      setSongs(songItems);
      setSongId((current) => current || songItems[0]?.id || '');
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

  const submit = async (event) => {
    event.preventDefault();
    if (!songId) {
      toast.error('Choose a song first');
      return;
    }
    setSaving(true);
    try {
      await api.post('/feedback', { songId, rating, comment });
      toast.success('Feedback shared');
      setComment('');
      setRating(5);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not submit feedback');
    } finally {
      setSaving(false);
    }
  };

  const react = async (feedbackId, emoji) => {
    setFeedback((items) => items.map((item) => {
      if (item.id !== feedbackId) return item;
      return {
        ...item,
        reactions: {
          ...(item.reactions || {}),
          [emoji]: (Number(item.reactions?.[emoji]) || 0) + 1,
        },
      };
    }));

    try {
      await api.post(`/feedback/${feedbackId}/react`, { emoji });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save reaction');
      load();
    }
  };

  if (loading) return <Loader label="Loading feedback" />;

  return (
    <section className="page">
      <PageHeader eyebrow="Community" title="Feedback wall" description="Share what a track made you feel, and react to what other listeners are saying." />
      <div className="split-grid">
        <aside className="panel">
          <form className="form-stack" onSubmit={submit}>
            <div className="feedback-form-icon"><MessageSquare size={26} /></div>
            <label>
              Song
              <select value={songId} onChange={(event) => setSongId(event.target.value)}>
                {songs.map((song) => (
                  <option key={song.id} value={song.id}>{song.title} · {song.artist}</option>
                ))}
              </select>
            </label>
            <label>
              Rating
              <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>{value} star{value > 1 ? 's' : ''}</option>
                ))}
              </select>
            </label>
            <label>
              Feedback
              <textarea rows="5" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Drop your listening note..." />
            </label>
            <button className="primary-button" type="submit" disabled={saving || !songs.length}>
              {saving ? 'Sharing…' : 'Share feedback'}
            </button>
          </form>
        </aside>
        <div className="feedback-list">
          {feedback.length ? feedback.map((item) => (
            <article className={`feedback-card ${item.isPinned ? 'pinned' : ''}`} key={item.id}>
              <div className="feedback-author-row">
                <span className="avatar small">{initials(item.user?.name || 'Listener')}</span>
                <div>
                  <strong>{item.user?.name || 'Listener'}</strong>
                  <div className="rating-row">
                    {Array.from({ length: item.rating }).map((_, index) => <Star key={`${item.id}-${index}`} size={15} fill="currentColor" />)}
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
            </article>
          )) : (
            <EmptyState title="No feedback yet" message="Choose a song and start the first conversation." />
          )}
        </div>
      </div>
    </section>
  );
};

export default Feedback;
