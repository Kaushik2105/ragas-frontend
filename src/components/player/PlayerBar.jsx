import { Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { assetUrl, formatDuration } from '../../utils/music';
import usePlayerStore from '../../store/playerStore';

const PlayerBar = () => {
  const {
    currentSong,
    isPlaying,
    duration,
    currentTime,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    togglePlay,
    playNext,
    playPrev,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    cleanup,
  } = usePlayerStore();

  if (!currentSong) {
    return (
      <footer className="player-bar idle">
        <div className="mini-orb" />
        <span>Pick a track and let the app breathe.</span>
      </footer>
    );
  }

  return (
    <footer className="player-bar">
      <div className="now-playing">
        {currentSong.coverImage ? <img src={assetUrl(currentSong.coverImage)} alt="" /> : <div className="cover-fallback small">{currentSong.title?.[0] || 'M'}</div>}
        <div>
          <strong>{currentSong.title}</strong>
          <span>{currentSong.artist}</span>
        </div>
      </div>
      <div className="transport">
        <div className="transport-buttons">
          <button type="button" className={isShuffled ? 'active-control' : ''} onClick={toggleShuffle} aria-label="Shuffle">
            <Shuffle size={17} />
          </button>
          <button type="button" onClick={playPrev} aria-label="Previous">
            <SkipBack size={20} />
          </button>
          <button type="button" className="primary-play" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button type="button" onClick={playNext} aria-label="Next">
            <SkipForward size={20} />
          </button>
          <button type="button" className={repeatMode !== 'none' ? 'active-control' : ''} onClick={toggleRepeat} aria-label="Repeat">
            {repeatMode === 'one' ? <Repeat1 size={17} /> : <Repeat size={17} />}
          </button>
        </div>
        <div className="seek-row">
          <span>{formatDuration(currentTime)}</span>
          <input type="range" min="0" max={duration || 0} value={Math.min(currentTime, duration || 0)} onChange={(event) => seek(Number(event.target.value))} />
          <span>{formatDuration(duration)}</span>
        </div>
      </div>
      <div className="volume-row">
        <button type="button" onClick={toggleMute} aria-label="Mute">
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={(event) => setVolume(Number(event.target.value))} />
        <button type="button" onClick={cleanup} aria-label="Close player">
          <X size={18} />
        </button>
      </div>
    </footer>
  );
};

export default PlayerBar;
