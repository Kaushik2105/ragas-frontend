import { Lock, Plus, Trash2, Unlock, Pin, Globe, ListMusic, ArrowLeft, Search, X, Music2 } from 'lucide-react';
import { useCallback, useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import SongCard from '../../components/songs/SongCard';
import useAuthStore from '../../store/authStore';
import { assetUrl, formatPlayCount, playlistPlayCount, unwrap } from '../../utils/music';

const Playlists = () => {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const playlistIdParam = searchParams.get('playlistId');
  const tabParam = searchParams.get('tab');

  const [view, setView] = useState('landing'); // 'landing' | 'mine' | 'public' | 'songs'
  const [activeTab, setActiveTab] = useState('mine'); // 'mine' | 'public'
  const [playlists, setPlaylists] = useState([]);
  const [publicPlaylists, setPublicPlaylists] = useState([]);
  const [pinnedPlaylistIds, setPinnedPlaylistIds] = useState([]);
  const [activePlaylist, setActivePlaylist] = useState(null);
  
  // Search & Modal States
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
      const response = await api.get('/playlists');
      const publicResponse = await api.get('/playlists/public');
      const data = unwrap(response);
      const publicData = unwrap(publicResponse);
      setPlaylists(data);
      setPublicPlaylists(publicData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load playlists');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Deep-link handling / Param sync
  useEffect(() => {
    if (playlistIdParam) {
      const fetchAndOpenPlaylist = async () => {
        setLoading(true);
        try {
          const res = await api.get(`/playlists/${playlistIdParam}`);
          const p = unwrap(res);
          setActivePlaylist(p);
          setView('songs');
          if (p.userId === user?.id) {
            setActiveTab('mine');
          } else {
            setActiveTab('public');
          }
        } catch (e) {
          toast.error("Could not load selected playlist");
          setView('landing');
          setSearchParams({});
        } finally {
          setLoading(false);
        }
      };
      fetchAndOpenPlaylist();
    } else if (tabParam === 'public') {
      setView('public');
      setActiveTab('public');
    } else if (tabParam === 'mine') {
      setView('mine');
      setActiveTab('mine');
    } else {
      setView('landing');
    }
  }, [playlistIdParam, tabParam, user?.id, setSearchParams]);

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

  const createPlaylist = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setActionLoading(true);
    try {
      const response = await api.post('/playlists', { name: name.trim(), isPublic });
      const newPlaylist = unwrap(response);
      setPlaylists([newPlaylist, ...playlists]);
      setActivePlaylist(newPlaylist);
      setActiveTab('mine');
      setView('songs');
      setName('');
      setIsPublic(false);
      setIsCreateOpen(false);
      toast.success('Playlist created');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create playlist');
    } finally {
      setActionLoading(false);
    }
  };

  const selectPlaylist = async (playlist) => {
    if (activeTab === 'public') {
      setActivePlaylist(playlist);
      setView('songs');
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/playlists/${playlist.id}`);
      setActivePlaylist(unwrap(response));
      setView('songs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not open playlist');
    } finally {
      setLoading(false);
    }
  };

  const removePlaylist = async (playlist) => {
    setActionLoading(true);
    try {
      await api.delete(`/playlists/${playlist.id}`);
      toast.success('Playlist deleted');
      setActivePlaylist(null);
      setView('mine');
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete playlist');
    } finally {
      setActionLoading(false);
    }
  };

  const removeSong = async (song) => {
    if (activeTab !== 'mine') return;
    try {
      await api.delete(`/playlists/${activePlaylist.id}/songs/${song.id}`);
      const response = await api.get(`/playlists/${activePlaylist.id}`);
      setActivePlaylist(unwrap(response));
      toast.success('Song removed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not remove song');
    }
  };

  const handleBack = () => {
    if (view === 'songs') {
      setView(activeTab);
      if (playlistIdParam) {
        setSearchParams({});
      }
    } else if (view === 'mine' || view === 'public') {
      setView('landing');
      if (tabParam) {
        setSearchParams({});
      }
    }
  };

  const list = activeTab === 'mine' ? playlists : publicPlaylists;
  const filteredList = list.filter((playlist) =>
    playlist.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <Loader label="Loading playlists" />;

  return (
    <section className="page">
      {/* Control Navigation Header */}
      <div className="playlists-header-bar">
        {view !== 'landing' && (
          <button type="button" className="ghost-button back-hub-btn" onClick={handleBack}>
            <ArrowLeft size={16} /> Back
          </button>
        )}
        <div style={{ flex: 1 }} />
        {view !== 'songs' && (
          <button type="button" className="primary-button create-header-btn" onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} /> Create Playlist
          </button>
        )}
      </div>

      {/* VIEW 1: LANDING */}
      {view === 'landing' && (
        <div className="playlists-landing">
          <PageHeader
            eyebrow="Playlists"
            title="Build your listening rooms"
            description="Create personal playlists, browse public compilations, and pin your favorites to the dashboard."
          />

          <div className="playlists-landing-options">
            <button type="button" className="landing-option-card create-trigger" onClick={() => setIsCreateOpen(true)}>
              <div className="option-icon bg-cyan-soft">
                <Plus size={28} />
              </div>
              <div className="option-text">
                <h3>Create Playlist</h3>
                <p>Start a new collection of tracks from scratch</p>
              </div>
            </button>

            <button type="button" className="landing-option-card" onClick={() => { setActiveTab('mine'); setView('mine'); setSearchQuery(''); }}>
              <div className="option-icon bg-accent-soft">
                <ListMusic size={28} />
              </div>
              <div className="option-text">
                <h3>My Playlists</h3>
                <p>Access your private and public compilations · {playlists.length}</p>
              </div>
            </button>

            <button type="button" className="landing-option-card" onClick={() => { setActiveTab('public'); setView('public'); setSearchQuery(''); }}>
              <div className="option-icon bg-pink-soft">
                <Globe size={28} />
              </div>
              <div className="option-text">
                <h3>Public Playlists</h3>
                <p>Browse music lists shared by other listeners · {publicPlaylists.length}</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: LISTINGS (MY OR PUBLIC) */}
      {(view === 'mine' || view === 'public') && (
        <div className="playlists-listing">
          <PageHeader
            eyebrow={view === 'mine' ? 'Personal Rooms' : 'Shared Catalog'}
            title={view === 'mine' ? 'My Playlists' : 'Public Playlists'}
            description={view === 'mine' ? 'Playlists owned by you. Pin up to 3 to display them on your Home rail.' : 'Top public playlists. Click to explore and listen.'}
          />

          {/* Search bar */}
          <div className="playlist-search-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="search-clear-btn" onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* List display */}
          {filteredList.length > 0 ? (
            <div className="playlist-card-grid">
              {filteredList.map((playlist) => {
                const coverSong = playlist.songs?.find((song) => song.coverImage) || playlist.songs?.[0];
                const isPinned = pinnedPlaylistIds.includes(playlist.id);
                return (
                  <div
                    key={playlist.id}
                    className={`playlist-box-card ${isPinned ? 'pinned' : ''}`}
                    onClick={() => selectPlaylist(playlist)}
                  >
                    <div className="box-cover-wrapper">
                      {coverSong?.coverImage ? (
                        <img src={assetUrl(coverSong.coverImage)} alt="" />
                      ) : (
                        <div className="fallback-cover">
                          <Music2 size={32} />
                        </div>
                      )}
                      
                      {/* Pin button */}
                      <button
                        type="button"
                        className={`box-pin-btn ${isPinned ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinPlaylist(playlist.id);
                        }}
                        title={isPinned ? "Unpin playlist" : "Pin playlist"}
                      >
                        <Pin size={14} fill={isPinned ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <div className="box-info">
                      <div className="box-header-row">
                        <h3>{playlist.name}</h3>
                        {playlist.isPublic ? <Unlock size={14} className="lock-icon text-cyan" /> : <Lock size={14} className="lock-icon text-muted" />}
                      </div>
                      <p className="box-meta-text">
                        {view === 'public' && playlist.owner?.name ? `by ${playlist.owner.name} · ` : ''}
                        {playlist.songs?.length || 0} songs · {formatPlayCount(playlistPlayCount(playlist))} plays
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No playlists found"
              message={searchQuery ? "Try searching with another name." : view === 'mine' ? "You haven't created any playlists yet." : "There are no public playlists available."}
            />
          )}
        </div>
      )}

      {/* VIEW 3: SONGS LIST DETAILS */}
      {view === 'songs' && activePlaylist && (
        <div className="playlists-songs-details">
          <div className="panel playlist-songs-hero">
            <div className="hero-art-box">
              {activePlaylist.songs?.find((s) => s.coverImage) ? (
                <img
                  src={assetUrl(activePlaylist.songs.find((s) => s.coverImage).coverImage)}
                  alt=""
                />
              ) : (
                <ListMusic size={40} />
              )}
            </div>

            <div className="hero-info-box">
              <span className="eyebrow-badge">
                {activePlaylist.isPublic ? 'Public Playlist' : 'Private Playlist'}
              </span>
              <h2>{activePlaylist.name}</h2>
              <p className="hero-subtext">
                {activePlaylist.owner?.name ? `Curated by ${activePlaylist.owner.name} | ` : ''}
                {activePlaylist.songs?.length || 0} tracks · {formatPlayCount(playlistPlayCount(activePlaylist))} total plays
              </p>
              
              <div className="hero-actions-row">
                {activePlaylist.userId === user?.id && (
                  <button
                    className="danger-button"
                    type="button"
                    onClick={() => removePlaylist(activePlaylist)}
                    disabled={actionLoading}
                  >
                    <Trash2 size={17} /> Delete Playlist
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="panel songs-list-panel">
            <div className="panel-header-row">
              <h3>Playlist Tracks</h3>
            </div>

            {activePlaylist.songs?.length ? (
              <div className="song-grid compact">
                {activePlaylist.songs.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    songs={activePlaylist.songs}
                    isFavorite={false}
                    onRemoveFromPlaylist={activePlaylist.userId === user?.id ? removeSong : undefined}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="This playlist is empty"
                message="Go to Home or Search and tap the '+' button on song cards to build this playlist."
              />
            )}
          </div>
        </div>
      )}

      {/* CREATE PLAYLIST MODAL */}
      {isCreateOpen && (
        <div className="custom-modal-backdrop" onClick={() => setIsCreateOpen(false)}>
          <div className="custom-modal-content panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Create Playlist</h3>
              <button type="button" className="close-modal-btn" onClick={() => setIsCreateOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createPlaylist} className="modal-form-wrap">
              <div className="form-field">
                <label htmlFor="playlist-name">Playlist Name</label>
                <input
                  id="playlist-name"
                  type="text"
                  placeholder="e.g. Synthwave Highway, Focus Beats..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-field checkbox-row">
                <input
                  id="playlist-public"
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                <label htmlFor="playlist-public">
                  Make Public
                  <span>Others can see and stream this playlist</span>
                </label>
              </div>

              <div className="modal-actions-row">
                <button type="submit" className="primary-button submit-btn" disabled={actionLoading}>
                  {actionLoading ? 'Creating...' : 'Create Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Playlists;
