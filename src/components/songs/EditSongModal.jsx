import { X, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { assetUrl } from '../../utils/music';

const EditSongModal = ({ song, onClose, onUpdate }) => {
  const [form, setForm] = useState({ title: '', artist: '', album: '', genre: '', duration: '' });
  const [audio, setAudio] = useState(null);
  const [cover, setCover] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (song) {
      const timer = setTimeout(() => {
        setForm({
          title: song.title || '',
          artist: song.artist || '',
          album: song.album || '',
          genre: song.genre || '',
          duration: song.duration || '',
        });
        setAudio(null);
        setCover(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [song]);

  if (!song) return null;

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, value);
    });
    if (audio) formData.append('audio', audio);
    if (cover) formData.append('coverImage', cover);

    try {
      await api.put(`/songs/${song.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Song updated');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update song');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card" style={{ width: 'min(600px, 100%)' }}>
        <button className="icon-button modal-close" onClick={onClose}>
          <X size={18} />
        </button>
        <h2>Edit "{song.title}"</h2>
        <form className="form-stack" onSubmit={submit} style={{ marginTop: '10px' }}>
          <div className="split-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <label>Title<input value={form.title} onChange={(event) => updateField('title', event.target.value)} required /></label>
            <label>Artist<input value={form.artist} onChange={(event) => updateField('artist', event.target.value)} required /></label>
          </div>
          <div className="split-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <label>Album<input value={form.album} onChange={(event) => updateField('album', event.target.value)} /></label>
            <label>Genre<input value={form.genre} onChange={(event) => updateField('genre', event.target.value)} /></label>
          </div>
          <label>Duration in seconds<input type="number" min="0" value={form.duration} onChange={(event) => updateField('duration', event.target.value)} /></label>
          
          <div className="split-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '10px' }}>
            <label>
              New Audio File (Optional)
              <input type="file" accept="audio/*" onChange={(event) => setAudio(event.target.files?.[0] || null)} />
            </label>
            <label>
              New Cover Image (Optional)
              <input type="file" accept="image/*" onChange={(event) => setCover(event.target.files?.[0] || null)} />
              {song.coverImage && !cover && (
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Current:</span>
                  <img src={assetUrl(song.coverImage)} alt="" style={{ width: 40, height: 40, borderRadius: 8, marginTop: 4, objectFit: 'cover' }} />
                </div>
              )}
            </label>
          </div>

          <button className="primary-button" type="submit" disabled={saving} style={{ marginTop: '14px' }}>
            <Upload size={17} /> {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditSongModal;
