import { Lock, Plus, Trash2, Unlock } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import SongCard from '../../components/songs/SongCard';
import { unwrap } from '../../utils/music';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [activePlaylist, setActivePlaylist] = useState(null);
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/playlists');
      const data = unwrap(response);
      setPlaylists(data);
      if (data[0]) {
        const detail = await api.get(`/playlists/${data[0].id}`);
        setActivePlaylist(unwrap(detail));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load playlists');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const createPlaylist = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      const response = await api.post('/playlists', { name: name.trim(), isPublic });
      const newPlaylist = unwrap(response);
      setPlaylists([newPlaylist, ...playlists]);
      setActivePlaylist(newPlaylist);
      setName('');
      setIsPublic(false);
      toast.success('Playlist created');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create playlist');
    }
  };

  const selectPlaylist = async (playlist) => {
    try {
      const response = await api.get(`/playlists/${playlist.id}`);
      setActivePlaylist(unwrap(response));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not open playlist');
    }
  };

  const removePlaylist = async (playlist) => {
    try {
      await api.delete(`/playlists/${playlist.id}`);
      toast.success('Playlist deleted');
      setActivePlaylist(null);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete playlist');
    }
  };

  const removeSong = async (song) => {
    try {
      await api.delete(`/playlists/${activePlaylist.id}/songs/${song.id}`);
      const response = await api.get(`/playlists/${activePlaylist.id}`);
      setActivePlaylist(unwrap(response));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not remove song');
    }
  };

  if (loading) return <Loader label="Loading playlists" />;

  return (
    <section className="page">
      <PageHeader eyebrow="Playlists" title="Build little worlds" description="Create personal or public playlists and arrange songs from the catalog." />
      <div className="split-grid">
        <aside className="panel">
          <form className="mini-form" onSubmit={createPlaylist}>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="New playlist name" />
            <label className="check-row">
              <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} />
              Public
            </label>
            <button className="primary-button" type="submit"><Plus size={17} /> Create</button>
          </form>
          <div className="playlist-list">
            {playlists.map((playlist) => (
              <button key={playlist.id} type="button" className={activePlaylist?.id === playlist.id ? 'playlist-chip active' : 'playlist-chip'} onClick={() => selectPlaylist(playlist)}>
                <span>{playlist.name}</span>
                {playlist.isPublic ? <Unlock size={15} /> : <Lock size={15} />}
              </button>
            ))}
          </div>
        </aside>
        <div className="panel">
          {activePlaylist ? (
            <>
              <div className="panel-heading">
                <div>
                  <span className="eyebrow">{activePlaylist.isPublic ? 'Public' : 'Private'} playlist</span>
                  <h2>{activePlaylist.name}</h2>
                </div>
                <button className="danger-button" type="button" onClick={() => removePlaylist(activePlaylist)}>
                  <Trash2 size={17} /> Delete
                </button>
              </div>
              {activePlaylist.songs?.length ? (
                <div className="song-grid compact">
                  {activePlaylist.songs.map((song) => (
                    <SongCard key={song.id} song={song} songs={activePlaylist.songs} isFavorite={false} onFavorite={removeSong} />
                  ))}
                </div>
              ) : (
                <EmptyState title="Playlist is empty" message="Use the + button on song cards from Home or Search to add tracks." />
              )}
            </>
          ) : (
            <EmptyState title="No playlist selected" message="Create or select a playlist to begin." />
          )}
        </div>
      </div>
    </section>
  );
};

export default Playlists;
