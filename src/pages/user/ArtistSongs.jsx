import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mic2, ChevronDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import SongCard from '../../components/songs/SongCard';
import AddToPlaylistModal from '../../components/songs/AddToPlaylistModal';
import FeedbackModal from '../../components/songs/FeedbackModal';
import { assetUrl, getFavoritesSongs, unwrap } from '../../utils/music';

const ArtistSongs = () => {
  const { artistName } = useParams();
  const decodedArtistName = decodeURIComponent(artistName || '');
  const [songs, setSongs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalSongs, setTotalSongs] = useState(0);
  const [artistAvatar, setArtistAvatar] = useState(null);
  const [feedbackSong, setFeedbackSong] = useState(null);
  const [playlistSong, setPlaylistSong] = useState(null);

  const fetchArtistSongs = useCallback(async (targetPage = 1, append = false) => {
    if (!decodedArtistName) return;
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const [artistRes, favRes, topArtistsRes] = await Promise.all([
        api.get(`/songs/artists/${encodeURIComponent(decodedArtistName)}?page=${targetPage}&limit=10`),
        append ? Promise.resolve(null) : api.get('/favorites'),
        append ? Promise.resolve(null) : api.get('/songs/artists/top').catch(() => null),
      ]);

      const data = unwrap(artistRes);
      const newSongs = data?.songs || [];
      const pagination = data?.pagination || {};

      setTotalSongs(pagination.total || newSongs.length);
      setHasMore(pagination.hasMore || false);
      setPage(targetPage);

      if (append) {
        setSongs((prev) => [...prev, ...newSongs]);
      } else {
        setSongs(newSongs);
        if (favRes) setFavorites(unwrap(favRes));
        if (topArtistsRes) {
          const topList = unwrap(topArtistsRes) || [];
          const matched = topList.find((a) => a.name.toLowerCase().trim() === decodedArtistName.toLowerCase().trim());
          if (matched?.imageUrl) {
            setArtistAvatar(matched.imageUrl);
          }
        }
      }
    } catch (error) {
      toast.error('Could not load artist songs');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [decodedArtistName]);

  useEffect(() => {
    fetchArtistSongs(1, false);
  }, [fetchArtistSongs]);

  const favoriteIds = useMemo(() => new Set(getFavoritesSongs(favorites).map((s) => s.id)), [favorites]);

  const toggleFavorite = async (song) => {
    try {
      if (favoriteIds.has(song.id)) {
        await api.delete(`/favorites/${song.id}`);
        setFavorites((items) => items.filter((item) => item.song?.id !== song.id));
        toast.success('Removed from favorites');
      } else {
        await api.post(`/favorites/${song.id}`);
        setFavorites(await api.get('/favorites').then(unwrap));
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error('Favorite update failed');
    }
  };

  const handleSeeMore = () => {
    if (hasMore && !loadingMore) {
      fetchArtistSongs(page + 1, true);
    }
  };

  if (loading) return <Loader label={`Loading ${decodedArtistName}...`} />;

  const displayAvatar = artistAvatar || songs[0]?.coverImage;

  return (
    <section className="page">
      {/* Back Link */}
      <Link to="/artists" className="ghost-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <ArrowLeft size={18} /> Back to Artists
      </Link>

      {/* Artist Profile Banner */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '32px 24px',
          textAlign: 'center',
          borderRadius: '24px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 27, 75, 0.5))',
          border: '1px solid rgba(168, 85, 247, 0.2)',
        }}
      >
        <div
          style={{
            width: '110px',
            height: '110px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid #06b6d4',
            background: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: '0 10px 30px rgba(6, 182, 212, 0.35)',
          }}
        >
          {displayAvatar ? (
            <img src={assetUrl(displayAvatar)} alt={decodedArtistName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Mic2 size={44} color="#06b6d4" />
          )}
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '6px' }}>{decodedArtistName}</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.925rem' }}>{totalSongs} tracks available on RAGAS</p>
      </div>

      <h2 className="section-title">Top Songs</h2>

      {!songs.length ? (
        <EmptyState title="No tracks found" message={`No songs listed for ${decodedArtistName} yet.`} />
      ) : (
        <>
          <div className="song-grid compact">
            {songs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                songs={songs}
                isFavorite={favoriteIds.has(song.id)}
                onFavorite={toggleFavorite}
                onAddToPlaylist={setPlaylistSong}
                onFeedback={setFeedbackSong}
              />
            ))}
          </div>

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                type="button"
                onClick={handleSeeMore}
                disabled={loadingMore}
                className="secondary-button"
                style={{
                  padding: '12px 28px',
                  borderRadius: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  border: '1px solid #06b6d4',
                  color: '#06b6d4',
                }}
              >
                {loadingMore ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Loading more songs...
                  </>
                ) : (
                  <>
                    See More Songs <ChevronDown size={18} />
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      <FeedbackModal song={feedbackSong} onClose={() => setFeedbackSong(null)} />
      <AddToPlaylistModal song={playlistSong} playlists={[]} onClose={() => setPlaylistSong(null)} onChange={() => {}} />
    </section>
  );
};

export default ArtistSongs;
