import { useEffect, useState } from 'react';
import { UserCheck, Image, Save, Mic2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import { unwrap } from '../../utils/music';

const AdminArtists = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/artists');
      const data = unwrap(response);
      setArtists(data || []);
    } catch (err) {
      toast.error('Failed to load artists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const handleEdit = (artist) => {
    setSelectedArtist(artist);
    setImageUrl(artist.imageUrl || '');
    setBio(artist.bio || '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedArtist) return;

    setSaving(true);
    try {
      const payload = {
        name: selectedArtist.name,
        imageUrl: imageUrl.trim(),
        bio: bio.trim(),
      };
      await api.post('/admin/artists', payload);
      toast.success(`Artist "${selectedArtist.name}" updated successfully!`);
      setSelectedArtist(null);
      fetchArtists();
    } catch (err) {
      toast.error('Failed to update artist details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="section-container">
      <PageHeader
        eyebrow="Artist Profile Management"
        title="Official Artist Pictures & Details"
        description="Set and manage official profile images for artists. These images will be displayed in the circular Top Artists section in the mobile app."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '24px' }}>
        {/* List of Artists */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mic2 size={20} color="#06b6d4" /> Artists Catalog
          </h2>

          {loading ? (
            <p style={{ color: '#94a3b8' }}>Loading artists...</p>
          ) : !artists.length ? (
            <p style={{ color: '#64748b' }}>No artists found. Upload songs to populate artists.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {artists.map((artist) => (
                <div
                  key={artist.name}
                  onClick={() => handleEdit(artist)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    background: selectedArtist?.name === artist.name ? 'rgba(168, 85, 247, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                    border: selectedArtist?.name === artist.name ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        background: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #06b6d4',
                      }}
                    >
                      {artist.imageUrl ? (
                        <img src={artist.imageUrl} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Mic2 size={18} color="#94a3b8" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{artist.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {artist.imageUrl ? '✅ Custom Image Set' : '⚠️ No Custom Image'}
                      </div>
                    </div>
                  </div>

                  <button className="secondary-button" style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
                    Edit Image
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Panel */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={20} color="#a855f7" /> Edit Artist Details
          </h2>

          {!selectedArtist ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Select an artist from the catalog on the left to set their official profile picture.
            </div>
          ) : (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                  Artist Name
                </label>
                <input
                  type="text"
                  disabled
                  value={selectedArtist.name}
                  className="input-field"
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: '#94a3b8' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                  Official Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/artist-photo.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Paste any high quality image link or Cloudinary URL.
                </span>
              </div>

              {/* Image Preview */}
              {imageUrl ? (
                <div style={{ textAlign: 'center', margin: '10px 0' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto', border: '3px solid #a855f7' }}>
                    <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px', display: 'block' }}>Circular Avatar Preview</span>
                </div>
              ) : null}

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                  Artist Bio (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Short artist bio..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedArtist(null)}
                  className="secondary-button"
                  style={{ flex: 1, padding: '12px', borderRadius: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="primary-button"
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Save size={16} /> Save Artist Image
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminArtists;
