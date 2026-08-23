import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Play, Smartphone, X, Music, Disc3, Mic2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';
import usePlayerStore from '../../store/playerStore';
import useUIStore from '../../store/uiStore';
import { assetUrl, formatDuration, formatPlayCount, unwrap } from '../../utils/music';

const SharedSongModal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const songId = searchParams.get('song');
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { playSong } = usePlayerStore();
  const { openAuthModal } = useUIStore();

  useEffect(() => {
    if (!songId) {
      setSong(null);
      return;
    }

    let isMounted = true;
    const fetchSong = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/songs/${songId}`);
        const data = unwrap(response);
        if (isMounted) {
          setSong(data);
        }
      } catch (err) {
        if (isMounted) {
          toast.error('Could not load the shared song');
          handleClose();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSong();

    return () => {
      isMounted = false;
    };
  }, [songId]);

  const getAppDeepLink = (id) => {
    const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
    if (isAndroid) {
      return `intent://song/${id}#Intent;scheme=ragas;package=com.kaushik_2105.ragasmobile;end`;
    }
    return `ragas://song/${id}`;
  };

  // Auto-attempt to open the app on mobile devices
  useEffect(() => {
    if (song && typeof navigator !== 'undefined' && /android|iphone|ipad|ipod/i.test(navigator.userAgent)) {
      const timer = setTimeout(() => {
        try {
          window.location.href = getAppDeepLink(song.id);
        } catch {
          // ignore
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [song]);

  if (!songId || (!song && !loading)) return null;

  const handleClose = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('song');
    setSearchParams(nextParams, { replace: true });
    setSong(null);
  };

  const handlePlay = () => {
    if (!song) return;
    if (!isAuthenticated) {
      toast('Sign in to stream this song on RAGAS', { icon: '🎵' });
      openAuthModal('login');
      return;
    }
    playSong(song, [song]);
    toast.success(`Playing: ${song.title}`);
    handleClose();
  };

  const handleOpenApp = () => {
    if (!song) return;
    const deepLink = getAppDeepLink(song.id);
    window.location.href = deepLink;
    setTimeout(() => {
      toast('If the app did not open, you can download the APK below.', { icon: '📱' });
    }, 2500);
  };

  return (
    <div className="shared-song-backdrop" onClick={handleClose}>
      <div className="shared-song-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="shared-song-close"
          onClick={handleClose}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <span className="shared-song-badge">Shared with you</span>

        {loading ? (
          <div className="shared-song-loader">
            <Disc3 size={36} className="spin text-cyan" />
            <p>Loading track preview...</p>
          </div>
        ) : song ? (
          <>
            <div className="shared-song-cover-box">
              {song.coverImage ? (
                <img src={assetUrl(song.coverImage)} alt={song.title} className="shared-song-cover" />
              ) : (
                <div className="shared-song-fallback-cover">
                  <Music size={48} />
                </div>
              )}
            </div>

            <div className="shared-song-info">
              <h2 className="shared-song-title">{song.title}</h2>
              <p className="shared-song-artist">
                <Mic2 size={15} /> {song.artist}
              </p>
              {song.album && <p className="shared-song-album">Album: {song.album}</p>}

              <div className="shared-song-tags">
                <span>{song.genre || 'Music'}</span>
                <span>{formatDuration(song.duration)}</span>
                <span>{formatPlayCount(song.playCount || 0)} plays</span>
              </div>
            </div>

            <div className="shared-song-actions">
              <button
                type="button"
                className="primary-button shared-play-btn"
                onClick={handlePlay}
              >
                <Play size={18} fill="currentColor" /> Play on RAGAS
              </button>

              <button
                type="button"
                className="ghost-button shared-app-btn"
                onClick={handleOpenApp}
              >
                <Smartphone size={16} /> Open in Mobile App
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default SharedSongModal;
