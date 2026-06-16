import { Star, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { initials, unwrap } from '../../utils/music';

const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

const FeedbackModal = ({ song, onClose }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const loadFeedback = useCallback(async () => {
    if (!song?.id) return;
    setLoadingFeedback(true);
    try {
      const response = await api.get(`/feedback/song/${song.id}`);
      setFeedbacks(unwrap(response).feedbacks || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load feedback');
    } finally {
      setLoadingFeedback(false);
    }
  }, [song]);

  useEffect(() => {
    const timer = setTimeout(loadFeedback, 0);
    return () => clearTimeout(timer);
  }, [loadFeedback]);

  if (!song) return null;

  const react = async (feedbackId, emoji) => {
    const currentItem = feedbacks.find((item) => item.id === feedbackId);
    const isToggledOff = currentItem?.userReaction === emoji;

    setFeedbacks((items) => items.map((item) => {
      if (item.id !== feedbackId) return item;

      const previousEmoji = item.userReaction;
      const reactions = { ...(item.reactions || {}) };
      if (previousEmoji) {
        reactions[previousEmoji] = Math.max((Number(reactions[previousEmoji]) || 0) - 1, 0);
      }
      if (!isToggledOff) {
        reactions[emoji] = (Number(reactions[emoji]) || 0) + 1;
      }

      return {
        ...item,
        reactions,
        userReaction: isToggledOff ? null : emoji,
      };
    }));

    try {
      const response = await api.post(`/feedback/${feedbackId}/react`, { emoji });
      const updated = unwrap(response);
      setFeedbacks((items) => items.map((item) => (
        item.id === feedbackId
          ? {
              ...item,
              reactions: (updated && updated.reactions) || item.reactions,
              userReaction: (updated && typeof updated.userReaction !== 'undefined') ? updated.userReaction : (isToggledOff ? null : emoji),
            }
          : item
      )));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save reaction');
      loadFeedback();
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post(`/feedback/song/${song.id}`, { rating, comment });
      toast.success('Feedback saved');
      setComment('');
      setRating(5);
      loadFeedback();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save feedback');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal-card feedback-modal">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <span className="eyebrow">Feedback</span>
        <h2>{song.title}</h2>
        <div className="feedback-thread">
          {loadingFeedback ? (
            <p className="muted-text">Loading listener notes…</p>
          ) : feedbacks.length ? feedbacks.map((item) => (
            <article className="feedback-card" key={item.id}>
              <div className="feedback-author-row">
                <span className="avatar small">{initials(item.user?.name || 'Listener')}</span>
                <div>
                  <strong>{item.user?.name || 'Listener'}</strong>
                  <div className="rating-row">
                    {Array.from({ length: item.rating }).map((_, index) => <Star key={`${item.id}-${index}`} size={14} fill="currentColor" />)}
                  </div>
                </div>
              </div>
              <p>{item.comment || 'No comment left.'}</p>
              <div className="reaction-row">
                {reactionEmojis.map((emoji) => (
                  <button
                    type="button"
                    className={`reaction-button${item.userReaction === emoji ? ' active' : ''}`}
                    key={emoji}
                    onClick={() => react(item.id, emoji)}
                  >
                    <span>{emoji}</span>
                    <small>{Number(item.reactions?.[emoji]) || 0}</small>
                  </button>
                ))}
              </div>
            </article>
          )) : (
            <p className="muted-text">No feedback yet. Be the first tiny critic with excellent taste.</p>
          )}
        </div>
        <form className="form-stack" onSubmit={submit}>
          <label>
            Rating
            <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>{value} star{value > 1 ? 's' : ''}</option>
              ))}
            </select>
          </label>
          <label>
            Comment
            <textarea rows="4" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="What did this track make you feel?" />
          </label>
          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Submit feedback'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
