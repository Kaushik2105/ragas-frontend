import { Heart, ListMusic, ListPlus, Play, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { assetUrl, formatDuration } from '../../utils/music';
import usePlayerStore from '../../store/playerStore';

const SongCard = ({ song, songs = [], isFavorite = false, onFavorite, onAddToPlaylist, onFeedback }) => {
  const { currentSong, isPlaying, playSong, addToQueue } = usePlayerStore();
  const active = currentSong?.id === song.id;

  const queueSong = () => {
    addToQueue(song);
    toast.success('Added to queue');
  };

  return (
    <motion.article
      className={`song-card ${active ? 'is-active' : ''}`}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      <button className="cover-button" type="button" onClick={() => playSong(song, songs)} aria-label={`Play ${song.title}`}>
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
        <button type="button" className="icon-button" onClick={queueSong} aria-label="Add to queue">
          <ListMusic size={18} />
        </button>
        {onFeedback && (
          <button type="button" className="icon-button" onClick={() => onFeedback(song)} aria-label="Add feedback">
            <Star size={18} />
          </button>
        )}
        {onAddToPlaylist && (
          <button type="button" className="icon-button" onClick={() => onAddToPlaylist(song)} aria-label="Add to playlist">
            <ListPlus size={18} />
          </button>
        )}
        {onFavorite && (
          <button
            type="button"
            className={`icon-button ${isFavorite ? 'is-favorite' : ''}`}
            onClick={() => onFavorite(song)}
            aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
    </motion.article>
  );
};

export default SongCard;
