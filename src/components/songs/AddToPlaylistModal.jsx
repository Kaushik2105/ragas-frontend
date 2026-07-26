import { ListPlus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const AddToPlaylistModal = ({ song, playlists = [], onClose, onChange }) => {
  const [playlistId, setPlaylistId] = useState(playlists[0]?.id || '');
  const [saving, setSaving] = useState(false);

  if (!song) return null;

  const selectedPlaylist = playlists.find((playlist) => playlist.id === playlistId);
  const isInSelectedPlaylist = !!selectedPlaylist?.songs?.some((item) => item.id === song.id);

  const changeMembership = async (event) => {
    event.preventDefault();
    if (!playlistId) {
      toast.error('Create a playlist first');
      return;
    }

    setSaving(true);
    try {
      if (isInSelectedPlaylist) {
        await api.delete(`/playlists/${playlistId}/songs/${song.id}`);
        toast.success('Removed from playlist');
      } else {
        await api.post(`/playlists/${playlistId}/songs`, { songId: song.id });
        toast.success('Added to playlist');
      }
      await onChange?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update playlist');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal-card" onSubmit={changeMembership}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <span className="eyebrow">Add to playlist</span>
        <h2>{song.title}</h2>
        <label>
          Playlist
          <select value={playlistId} onChange={(event) => setPlaylistId(event.target.value)}>
            {playlists.map((playlist) => (
              <option key={playlist.id} value={playlist.id}>{playlist.name}</option>
            ))}
          </select>
        </label>
        <button className={isInSelectedPlaylist ? 'danger-button' : 'primary-button'} type="submit" disabled={saving || playlists.length === 0}>
          {saving ? 'Updating...' : isInSelectedPlaylist ? <><Trash2 size={17} /> Remove song</> : <><ListPlus size={17} /> Add song</>}
        </button>
      </form>
    </div>
  );
};

export default AddToPlaylistModal;
