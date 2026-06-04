import { Trash2, Upload, Edit } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { assetUrl, formatDuration, unwrap } from '../../utils/music';
import EditSongModal from '../../components/songs/EditSongModal';

const initialForm = { title: '', artist: '', album: '', genre: '', duration: '' };

const AdminSongs = () => {
  const [songs, setSongs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingSong, setEditingSong] = useState(null);
  const [audio, setAudio] = useState(null);
  const [cover, setCover] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/songs?limit=60');
      setSongs(unwrap(response).songs || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load songs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!audio) {
      toast.error('Audio file is required');
      return;
    }
    setSaving(true);
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });
    formData.append('audio', audio);
    if (cover) formData.append('coverImage', cover);
    try {
      await api.post('/songs', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Song uploaded');
      setForm(initialForm);
      setAudio(null);
      setCover(null);
      event.target.reset();
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not upload song');
    } finally {
      setSaving(false);
    }
  };

  const removeSong = async (song) => {
    try {
      await api.delete(`/songs/${song.id}`);
      toast.success('Song deleted');
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete song');
    }
  };

  if (loading) return <Loader label="Loading song management" />;

  return (
    <section className="page">
      <PageHeader eyebrow="Admin" title="Song management" description="Upload tracks and manage the catalog served to listeners." />
      <div className="split-grid song-management-grid">
        <form className="panel form-stack" onSubmit={submit}>
          <h2>Upload song</h2>
          <label>Title<input value={form.title} onChange={(event) => updateField('title', event.target.value)} required /></label>
          <label>Artist<input value={form.artist} onChange={(event) => updateField('artist', event.target.value)} required /></label>
          <label>Album<input value={form.album} onChange={(event) => updateField('album', event.target.value)} /></label>
          <label>Genre<input value={form.genre} onChange={(event) => updateField('genre', event.target.value)} /></label>
          <label>Duration in seconds<input type="number" min="0" value={form.duration} onChange={(event) => updateField('duration', event.target.value)} /></label>
          <label>Audio file<input type="file" accept="audio/*" onChange={(event) => setAudio(event.target.files?.[0] || null)} required /></label>
          <label>Cover image<input type="file" accept="image/*" onChange={(event) => setCover(event.target.files?.[0] || null)} /></label>
          <button className="primary-button" type="submit" disabled={saving}><Upload size={17} /> {saving ? 'Uploading…' : 'Upload song'}</button>
        </form>
        <div className="panel catalog-panel">
          <h2>Catalog</h2>
          <div className="admin-song-list">
            {songs.map((song) => (
              <article className="admin-song-row" key={song.id}>
                {song.coverImage ? <img src={assetUrl(song.coverImage)} alt="" /> : <div className="cover-fallback small">{song.title?.[0]}</div>}
                <div>
                  <strong>{song.title}</strong>
                  <span>{song.artist} · {song.genre || 'No genre'} · {formatDuration(song.duration)}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="icon-button" type="button" onClick={() => setEditingSong(song)} aria-label="Edit song">
                    <Edit size={16} />
                  </button>
                  <button className="danger-button" type="button" onClick={() => removeSong(song)} aria-label="Delete song">
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
      <EditSongModal song={editingSong} onClose={() => setEditingSong(null)} onUpdate={load} />
    </section>
  );
};

export default AdminSongs;
