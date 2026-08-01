import { useCallback, useEffect, useMemo, useState } from 'react';
import { ListMusic, Music2, Play, Smartphone, Pin } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import WelcomeAnimation from '../../components/layout/WelcomeAnimation';
import AddToPlaylistModal from '../../components/songs/AddToPlaylistModal';
import FeedbackModal from '../../components/songs/FeedbackModal';
import SongCard from '../../components/songs/SongCard';
import usePlayerStore from '../../store/playerStore';
import useAuthStore from '../../store/authStore';
import { assetUrl, formatPlayCount, getFavoritesSongs, getSongsFromPayload, getTotalSongsFromPayload, playlistPlayCount, unwrap } from '../../utils/music';

const Home = () => {
  const { playSong } = usePlayerStore();
  const { user } = useAuthStore();
  const [songs, setSongs] = useState([]);
  const [totalSongs, setTotalSongs] = useState(0);
  const [totalPlays, setTotalPlays] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [pinnedPlaylistIds, setPinnedPlaylistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackSong, setFeedbackSong] = useState(null);
  const [playlistSong, setPlaylistSong] = useState(null);

  // Sync pinned playlists from localStorage
  useEffect(() => {
    if (user?.id) {
      const storedPins = localStorage.getItem(`pinnedPlaylists_${user.id}`);
      if (storedPins) {
        setPinnedPlaylistIds(JSON.parse(storedPins));
      } else {
        setPinnedPlaylistIds([]);
      }
    }
  }, [user?.id]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [songsResponse, favoritesResponse, playlistsResponse, publicPlaylistsResponse] = await Promise.all([
        api.get('/songs?limit=30'),
        api.get('/favorites'),
        api.get('/playlists'),
        api.get('/playlists/public'),
      ]);
      const songsData = unwrap(songsResponse);
      setSongs(getSongsFromPayload(songsData));
      setTotalSongs(getTotalSongsFromPayload(songsData));
      setTotalPlays(songsData?.totalPlayCount || 0);
      setFavorites(unwrap(favoritesResponse));
      setPlaylists(unwrap(playlistsResponse));
      setPublicPlaylists(unwrap(publicPlaylistsResponse));
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
  const featuredPlaylists = useMemo(() => {
    const pinnedList = [];
    pinnedPlaylistIds.forEach((id) => {
      const pl = playlists.find((p) => p.id === id) || publicPlaylists.find((p) => p.id === id);
      if (pl) {
        pinnedList.push({ ...pl, isPinned: true });
      }
    });

    const pinnedSet = new Set(pinnedPlaylistIds);
    const remainingSlots = 10 - pinnedList.length;
    const restPublic = publicPlaylists
      .filter((p) => !pinnedSet.has(p.id))
      .slice(0, Math.max(0, remainingSlots))
      .map((p) => ({ ...p, isPinned: false }));

    return [...pinnedList, ...restPublic];
  }, [playlists, publicPlaylists, pinnedPlaylistIds]);

  const togglePinPlaylist = (playlistId) => {
    if (!user?.id) return;
    let nextPins = [...pinnedPlaylistIds];
    if (pinnedPlaylistIds.includes(playlistId)) {
      nextPins = nextPins.filter((id) => id !== playlistId);
      toast.success('Playlist unpinned');
    } else {
      if (nextPins.length >= 3) {
        toast.error('You can only pin up to 3 playlists.');
        return;
      }
      nextPins.push(playlistId);
      toast.success('Playlist pinned');
    }
    setPinnedPlaylistIds(nextPins);
    localStorage.setItem(`pinnedPlaylists_${user.id}`, JSON.stringify(nextPins));
  };

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
      toast.error(error.response?.data?.message || 'Favorite update failed');
    }
  };

  const handlePlayPlaylist = (e, playlist) => {
    e.preventDefault();
    e.stopPropagation();
    if (playlist.songs && playlist.songs.length > 0) {
      playSong(playlist.songs[0], playlist.songs);
      toast.success(`Playing playlist: ${playlist.name}`);
    } else {
      toast.error('This playlist has no songs to play');
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
      <div className="mobile-promo-banner">
        <div className="promo-banner-content">
          <span className="eyebrow-accent">Ragas on the Go</span>
          <h3>Take your listening room offline</h3>
          <p>Get the official mobile app for offline downloads, zero-latency playback, and a smooth native listening experience.</p>
        </div>
        <a
          href="https://github.com/Kaushik2105/Ragas-Mobile/releases/download/v1.0.4/ragas-v1.0.4.apk"
          target="_blank"
          rel="noopener noreferrer"
          className="primary-button promo-banner-btn"
        >
          <Smartphone size={18} /> Download for Android
        </a>
      </div>
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
              <span><strong>{totalSongs}</strong> tracks</span>
              <span><strong>{favorites.length}</strong> favorites</span>
              <span><strong>{playlists.length}</strong> playlists</span>
              <span><strong>{formatPlayCount(totalPlays)}</strong> plays</span>
            </div>
          </div>

          {featuredPlaylists.length > 0 && (
            <section className="featured-playlists-section" aria-labelledby="featured-playlists-title">
              <div className="section-heading-row">
                <h2 id="featured-playlists-title" className="section-title">Featured Playlists</h2>
                <Link to="/playlists?tab=public" className="ghost-button see-all-link">See all</Link>
              </div>
              <div className="playlist-rail">
                {featuredPlaylists.map((playlist) => {
                  const totalPlays = playlistPlayCount(playlist);
                  const coverSong = playlist.songs?.find((song) => song.coverImage) || playlist.songs?.[0];
                  return (
                    <Link key={playlist.id} to={`/playlists?playlistId=${playlist.id}`} className="featured-playlist-card">
                      <div className="playlist-cover">
                        {coverSong?.coverImage ? <img src={assetUrl(coverSong.coverImage)} alt="" /> : <Music2 size={28} />}
                        <button
                          type="button"
                          className={`playlist-pin-button ${playlist.isPinned ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            togglePinPlaylist(playlist.id);
                          }}
                          title={playlist.isPinned ? "Unpin playlist" : "Pin playlist"}
                        >
                          <Pin size={13} fill={playlist.isPinned ? "currentColor" : "none"} />
                        </button>
                        <button
                          type="button"
                          className="playlist-play-button"
                          onClick={(e) => handlePlayPlaylist(e, playlist)}
                          aria-label={`Play ${playlist.name}`}
                        >
                          <Play size={18} fill="currentColor" />
                        </button>
                      </div>
                      <div>
                        <h3>{playlist.name}</h3>
                        <p>{playlist.owner?.name ? `by ${playlist.owner.name}` : 'Public playlist'}</p>
                      </div>
                      <div className="playlist-card-meta">
                        <span><ListMusic size={14} /> {playlist.songs?.length || 0}</span>
                        <span>{formatPlayCount(totalPlays)} plays</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <h2 className="section-title">Featured</h2>
          <div className="song-grid featured-song-grid">
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
      <AddToPlaylistModal song={playlistSong} playlists={playlists} onClose={() => setPlaylistSong(null)} onChange={load} />
    </section>
  );
};

export default Home;
