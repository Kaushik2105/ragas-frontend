import { useCallback, useEffect, useState } from 'react';
import { Search, UserCheck, Mic2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { assetUrl, unwrap } from '../../utils/music';

const Artists = () => {
  const [artists, setArtists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchArtists = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/songs/artists/top');
      const data = unwrap(response);
      setArtists(data || []);
    } catch (error) {
      toast.error('Could not load artists catalog');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  const filteredArtists = artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  if (loading) return <Loader label="Loading all artists..." />;

  return (
    <section className="page">
      <PageHeader
        eyebrow="RAGAS ARTISTS"
        title="Explore All Artists"
        description="Discover featured musicians, vocalists, and creators on RAGAS."
      />

      {/* Artist Search Bar */}
      <div className="search-bar-container" style={{ margin: '20px 0', maxWidth: '500px' }}>
        <div className="input-with-icon" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', color: '#06b6d4' }} />
          <input
            type="text"
            placeholder="Search artists by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ width: '100%', paddingLeft: '42px', paddingRight: searchQuery ? '36px' : '14px', height: '46px', borderRadius: '14px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {!filteredArtists.length ? (
        <EmptyState title="No artists found" message={searchQuery ? `No artists matching "${searchQuery}".` : 'No artists available yet.'} />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '24px',
            marginTop: '24px',
          }}
        >
          {filteredArtists.map((artist) => (
            <Link
              key={artist.name}
              to={`/artists/${encodeURIComponent(artist.name)}`}
              className="artist-card-web"
              style={{
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px',
                borderRadius: '20px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                transition: 'all 0.25s ease',
              }}
            >
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid #06b6d4',
                  background: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                  boxShadow: '0 8px 24px rgba(6, 182, 212, 0.25)',
                }}
              >
                {artist.imageUrl ? (
                  <img src={assetUrl(artist.imageUrl)} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Mic2 size={32} color="#06b6d4" />
                )}
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '0.925rem',
                  color: '#f8fafc',
                  textAlign: 'center',
                  maxWidth: '120px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {artist.name}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '4px' }}>
                {artist.songCount} {artist.songCount === 1 ? 'song' : 'songs'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default Artists;
