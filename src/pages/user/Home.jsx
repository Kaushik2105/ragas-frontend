import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import WelcomeAnimation from '../../components/layout/WelcomeAnimation';
import AddToPlaylistModal from '../../components/songs/AddToPlaylistModal';
import FeedbackModal from '../../components/songs/FeedbackModal';
import SongCard from '../../components/songs/SongCard';
import { getFavoritesSongs, getSongsFromPayload, unwrap } from '../../utils/music';

const Home = () => {
  const [songs, setSongs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackSong, setFeedbackSong] = useState(null);
  const [playlistSong, setPlaylistSong] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [songsResponse, favoritesResponse, playlistsResponse] = await Promise.all([
        api.get('/songs?limit=30'),
        api.get('/favorites'),
        api.get('/playlists'),
      ]);
      setSongs(getSongsFromPayload(unwrap(songsResponse)));
      setFavorites(unwrap(favoritesResponse));
      setPlaylists(unwrap(playlistsResponse));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load your music');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const favoriteIds = useMemo(() => new Set(getFavoritesSongs(favorites).map((s) => s.id)), [favorites]);

  const featured = useMemo(
    () => [...songs].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 6),
    [songs]
  );

  const recentSongs = useMemo(() => [...songs].slice(0, 12), [songs]);

  const toggleFavorite = async (song) => {
    try {
      if (favoriteIds.has(song.id)) {
        await api.delete(`/favorites/${song.id}`);
        setFavorites((items) => items.filter((item) => item.song?.id !== song.id));
        toast.success('Removed from favorites');
      } else {
        await api.post(`/favorites/${song.id}`);
        setFavorites(getFavoritesSongs(await api.get('/favorites').then(unwrap)));
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Favorite update failed');
    }
  };

  if (loading) return <Loader label="Loading the catalog" />;

  return (
    <section className="page">
      <WelcomeAnimation />
      <PageHeader
        eyebrow="RAGAS"
        title="Your neon listening room"
        description="Featured tracks, fresh uploads, favorites, and feedback stitched into one smooth dashboard."
      />
      {songs.length === 0 ? (
        <EmptyState title="No songs yet" message="Ask an admin to upload tracks and this page will light up." />
      ) : (
        <>
          <div className="hero-panel">
            <div>
              <span className="eyebrow">Featured mix</span>
              <h2>{featured[0]?.title || 'Discover the stream'}</h2>
              <p>{featured[0] ? `${featured[0].artist} | ${featured[0].genre || 'Genre bending'}` : 'Your top played songs appear here.'}</p>
            </div>
            <div className="stat-strip">
              <span><strong>{songs.length}</strong> tracks</span>
              <span><strong>{favorites.length}</strong> favorites</span>
              <span><strong>{playlists.length}</strong> playlists</span>
            </div>
          </div>

          <h2 className="section-title">Featured</h2>
          <div className="song-grid">
            {featured.map((song) => (
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

          <h2 className="section-title">Recently added</h2>
          <div className="song-grid compact">
            {recentSongs.map((song) => (
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
        </>
      )}
      <FeedbackModal song={feedbackSong} onClose={() => setFeedbackSong(null)} />
      <AddToPlaylistModal song={playlistSong} playlists={playlists} onClose={() => setPlaylistSong(null)} />
    </section>
  );
};

export default Home;
