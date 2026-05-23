import { Search as SearchIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import AddToPlaylistModal from '../../components/songs/AddToPlaylistModal';
import FeedbackModal from '../../components/songs/FeedbackModal';
import SongCard from '../../components/songs/SongCard';
import { getFavoritesSongs, getSongsFromPayload, unwrap } from '../../utils/music';

const Search = () => {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [feedbackSong, setFeedbackSong] = useState(null);
  const [playlistSong, setPlaylistSong] = useState(null);
  const favoriteIds = useMemo(() => new Set(getFavoritesSongs(favorites).map((song) => song.id)), [favorites]);

  useEffect(() => {
    const loadBasics = async () => {
      try {
        const [favoritesResponse, playlistsResponse] = await Promise.all([api.get('/favorites'), api.get('/playlists')]);
        setFavorites(unwrap(favoritesResponse));
        setPlaylists(unwrap(playlistsResponse));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Could not load library context');
      }
    };
    loadBasics();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const endpoint = query.trim() ? `/songs/search?q=${encodeURIComponent(query.trim())}` : '/songs?limit=24';
        const response = await api.get(endpoint);
        setSongs(getSongsFromPayload(unwrap(response)));
      } catch (error) {
        setSongs([]);
        toast.error(error.response?.data?.message || 'Search failed');
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const toggleFavorite = async (song) => {
    try {
      if (favoriteIds.has(song.id)) {
        await api.delete(`/favorites/${song.id}`);
      } else {
        await api.post(`/favorites/${song.id}`);
      }
      const response = await api.get('/favorites');
      setFavorites(unwrap(response));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Favorite update failed');
    }
  };

  return (
    <section className="page">
      <PageHeader eyebrow="Search" title="Find the next hook" description="Search by title, artist, album, or genre with a real-time API-backed catalog." />
      <div className="search-box">
        <SearchIcon size={20} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try pop, ambient, your favorite artist..." autoFocus />
      </div>
      {songs.length === 0 ? (
        <EmptyState title="No matches yet" message="Try another phrase or wait for the catalog to grow." />
      ) : (
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
      )}
      <FeedbackModal song={feedbackSong} onClose={() => setFeedbackSong(null)} />
      <AddToPlaylistModal song={playlistSong} playlists={playlists} onClose={() => setPlaylistSong(null)} />
    </section>
  );
};

export default Search;
