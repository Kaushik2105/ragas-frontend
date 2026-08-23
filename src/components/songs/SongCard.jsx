import { Heart, ListMusic, ListPlus, Play, Star, Trash2, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { assetUrl, formatDuration } from '../../utils/music';
import usePlayerStore from '../../store/playerStore';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';

const SongCard = ({ song, songs = [], isFavorite = false, onFavorite, onAddToPlaylist, onFeedback, onRemoveFromPlaylist }) => {
  const { currentSong, isPlaying, playSong, addToQueue } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal } = useUIStore();
  const active = currentSong?.id === song.id;

  const handlePlay = () => {
    if (!isAuthenticated) {
      toast('Sign in to play songs on RAGAS', { icon: '🎵' });
      openAuthModal('login');
      return;
    }
    playSong(song, songs);
  };

  const queueSong = () => {
    addToQueue(song);
    toast.success('Added to queue');
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?song=${song.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: song.title,
          text: `Listen to "${song.title}" by ${song.artist} on RAGAS`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Song link copied to clipboard!');
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <motion.article
      className={`song-card ${active ? 'is-active' : ''}`}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      <button className="cover-button" type="button" onClick={handlePlay} aria-label={`Play ${song.title}`}>
        {song.coverImage ? <img src={assetUrl(song.coverImage)} alt="" /> : <div className="cover-fallback">{song.title?.[0] || 'M'}</div>}
        <span className="play-pill">
          <Play size={18} fill="currentColor" />
        </span>
      </button>
      <div className="song-meta">
        <h3>{song.title}</h3>
        <p>{song.artist}</p>
        <div className="song-details">
          <span>{song.genre || 'Unknown genre'}</span>
          <span>{formatDuration(song.duration)}</span>
        </div>
      </div>
      <div className="song-actions">
        {active && isPlaying && <span className="equalizer" aria-label="Now playing"><i /><i /><i /></span>}
        
        {/* Share is visible to all users */}
        <button type="button" className="icon-button" onClick={handleShare} aria-label="Share song" title="Share track">
          <Share2 size={17} />
        </button>

        {/* Buttons visible only to authenticated users */}
        {isAuthenticated && (
          <>
            <button type="button" className="icon-button" onClick={queueSong} aria-label="Add to queue" title="Add to queue">
              <ListMusic size={18} />
            </button>
            {onFeedback && (
              <button type="button" className="icon-button" onClick={() => onFeedback(song)} aria-label="Add feedback" title="Feedback">
                <Star size={18} />
              </button>
            )}
            {onAddToPlaylist && (
              <button type="button" className="icon-button" onClick={() => onAddToPlaylist(song)} aria-label="Add to playlist" title="Add to playlist">
                <ListPlus size={18} />
              </button>
            )}
            {onRemoveFromPlaylist && (
              <button type="button" className="icon-button danger-icon" onClick={() => onRemoveFromPlaylist(song)} aria-label="Remove from playlist" title="Remove">
                <Trash2 size={18} />
              </button>
            )}
            {onFavorite && (
              <button
                type="button"
                className={`icon-button ${isFavorite ? 'is-favorite' : ''}`}
                onClick={() => onFavorite(song)}
                aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'}
                title={isFavorite ? 'In favorites' : 'Add to favorites'}
              >
                <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
          </>
        )}
      </div>
    </motion.article>
  );
};

export default SongCard;
