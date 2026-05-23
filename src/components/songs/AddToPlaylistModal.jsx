import { X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const AddToPlaylistModal = ({ song, playlists = [], onClose }) => {
  const [playlistId, setPlaylistId] = useState(playlists[0]?.id || '');
  const [saving, setSaving] = useState(false);

  if (!song) return null;

  const submit = async (event) => {
    event.preventDefault();
    if (!playlistId) {
      toast.error('Create a playlist first');
      return;
    }
    setSaving(true);
    try {
      await api.post(`/playlists/${playlistId}/songs`, { songId: song.id });
      toast.success('Added to playlist');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not add song');
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
        <button className="primary-button" type="submit" disabled={saving || playlists.length === 0}>
          {saving ? 'Adding…' : 'Add song'}
        </button>
      </form>
    </div>
  );
};

export default AddToPlaylistModal;
