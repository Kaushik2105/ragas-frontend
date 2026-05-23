import { Star } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { unwrap } from '../../utils/music';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/feedback?limit=80');
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

  if (loading) return <Loader label="Loading feedback" />;

  return (
    <section className="page">
      <PageHeader eyebrow="Admin" title="Feedback overview" description="See what listeners are saying across the catalog." />
      <div className="feedback-list">
        {feedback.map((item) => (
          <article className="feedback-card" key={item.id}>
            <div className="rating-row">
              {Array.from({ length: item.rating }).map((_, index) => <Star key={`${item.id}-${index}`} size={16} fill="currentColor" />)}
            </div>
            <p>{item.comment || 'No comment left.'}</p>
            <span>{item.user?.name || 'Listener'} on {item.song?.title || 'a song'}</span>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AdminFeedback;
