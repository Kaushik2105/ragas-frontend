import { X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const FeedbackModal = ({ song, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  if (!song) return null;

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post(`/feedback/song/${song.id}`, { rating, comment });
      toast.success('Feedback saved');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save feedback');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal-card" onSubmit={submit}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <span className="eyebrow">Feedback</span>
        <h2>{song.title}</h2>
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
  );
};

export default FeedbackModal;
