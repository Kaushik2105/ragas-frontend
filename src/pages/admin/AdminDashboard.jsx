import { MessageSquare, Music2, PlayCircle, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { unwrap } from '../../utils/music';

const colors = ['#a855f7', '#22d3ee', '#fb7185', '#facc15', '#34d399'];

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboardResponse, growthResponse, topSongsResponse, genreResponse] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/stats/users-growth'),
        api.get('/admin/stats/top-songs'),
        api.get('/admin/stats/genres'),
      ]);
      setDashboard(unwrap(dashboardResponse));
      setGrowth(unwrap(growthResponse));
      setTopSongs(unwrap(topSongsResponse));
      setGenres(unwrap(genreResponse));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load admin dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  if (loading) return <Loader label="Loading admin dashboard" />;

  const stats = dashboard?.stats || {};
  const cards = [
    { label: 'Users', value: stats.totalUsers || 0, icon: Users },
    { label: 'Songs', value: stats.totalSongs || 0, icon: Music2 },
    { label: 'Playlists', value: stats.totalPlaylists || 0, icon: PlayCircle },
    { label: 'Feedback', value: stats.totalFeedback || 0, icon: MessageSquare },
  ];

  return (
    <section className="page">
      <PageHeader eyebrow="Admin" title="Command center" description="A single view for growth, listening, genres, and recent activity." />
      <div className="stats-grid">
        {cards.map(({ label, value, icon: Icon }) => (
          <div className="stat-card" key={label}>
            <Icon size={22} />
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="chart-grid">
        <div className="panel chart-panel">
          <h2>User growth</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={growth}>
              <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #312e81' }} />
              <Line type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="panel chart-panel">
          <h2>Top songs</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topSongs}>
              <XAxis dataKey="title" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #312e81' }} />
              <Bar dataKey="play_count" fill="#22d3ee" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="panel chart-panel">
          <h2>Genres</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={genres} dataKey="count" nameKey="genre" innerRadius={55} outerRadius={90} paddingAngle={4}>
                {genres.map((item, index) => <Cell key={item.genre} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #312e81' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="panel">
          <h2>Recent activity</h2>
          <div className="activity-list">
            {(dashboard?.recentActivity?.users || []).map((item) => <span key={item.id}>New user: {item.name}</span>)}
            {(dashboard?.recentActivity?.songs || []).map((item) => <span key={item.id}>Song uploaded: {item.title}</span>)}
            {(dashboard?.recentActivity?.feedback || []).map((item) => <span key={item.id}>Feedback on {item.song?.title}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
