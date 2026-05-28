import { create } from 'zustand';
import { Howl } from 'howler';

const usePlayerStore = create((set, get) => ({
  currentSong: null,
  playlist: [],
  shuffledPlaylist: [],
  currentIndex: -1,
  isPlaying: false,
  duration: 0,
  currentTime: 0,
  volume: 0.8,
  isMuted: false,
  isShuffled: false,
  repeatMode: 'none', // 'none', 'all', 'one'
  howl: null,
  intervalId: null,

  playSong: (song, songList = []) => {
    const state = get();
    if (!song?.audioUrl) return;

    // Stop current playback
    if (state.howl) {
      state.howl.unload();
    }
    if (state.intervalId) {
      clearInterval(state.intervalId);
    }

    const list = songList.length > 0 ? songList : [song];
    const index = list.findIndex((s) => s.id === song.id);

    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL || 'https://ragas-backend-api.onrender.com/api';
    const baseUrl = apiBaseUrl.replace('/api', '');
    const audioSrc = song.audioUrl?.startsWith('http') ? song.audioUrl : `${baseUrl}${song.audioUrl}`;

    const howl = new Howl({
      src: [audioSrc],
      html5: true,
      volume: state.volume,
      onplay: () => {
        set({ isPlaying: true });
        const id = setInterval(() => {
          const h = get().howl;
          if (h && h.playing()) {
            set({ currentTime: h.seek() || 0 });
          }
        }, 500);
        set({ intervalId: id });
      },
      onpause: () => set({ isPlaying: false }),
      onend: () => {
        const s = get();
        if (s.repeatMode === 'one') {
          get().playSong(s.currentSong, s.playlist);
        } else {
          get().playNext();
        }
      },
      onload: () => {
        set({ duration: howl.duration() });
      },
      onstop: () => set({ isPlaying: false }),
    });

    howl.play();

    set({
      currentSong: song,
      playlist: list,
      shuffledPlaylist: get().isShuffled ? (get().shuffledPlaylist.length > 0 ? get().shuffledPlaylist : list) : [],
      currentIndex: index >= 0 ? index : 0,
      howl,
      currentTime: 0,
    });
  },

  togglePlay: () => {
    const { howl, isPlaying } = get();
    if (!howl) return;
    if (isPlaying) {
      howl.pause();
    } else {
      howl.play();
    }
  },

  playNext: () => {
    const s = get();
    const activeList = s.isShuffled && s.shuffledPlaylist.length > 0 ? s.shuffledPlaylist : s.playlist;
    if (activeList.length === 0) return;

    let nextIndex = s.currentIndex + 1;
    if (nextIndex >= activeList.length) {
      if (s.repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }

    get().playSong(activeList[nextIndex], s.playlist);
  },

  playPrev: () => {
    const s = get();
    const activeList = s.isShuffled && s.shuffledPlaylist.length > 0 ? s.shuffledPlaylist : s.playlist;
    if (activeList.length === 0) return;

    if (s.currentTime > 3) {
      if (s.howl) {
        s.howl.seek(0);
        set({ currentTime: 0 });
      }
      return;
    }

    let prevIndex = s.currentIndex - 1;
    if (prevIndex < 0) prevIndex = activeList.length - 1;

    get().playSong(activeList[prevIndex], s.playlist);
  },

  seek: (time) => {
    const { howl } = get();
    if (howl) {
      howl.seek(time);
      set({ currentTime: time });
    }
  },

  setVolume: (vol) => {
    const { howl } = get();
    if (howl) howl.volume(vol);
    set({ volume: vol, isMuted: vol === 0 });
  },

  toggleMute: () => {
    const { howl, isMuted, volume } = get();
    if (howl) {
      if (isMuted) {
        howl.volume(volume || 0.8);
        set({ isMuted: false });
      } else {
        howl.volume(0);
        set({ isMuted: true });
      }
    }
  },

  toggleShuffle: () => set((s) => {
    const isShuffled = !s.isShuffled;
    let shuffledPlaylist = [];
    let currentIndex = s.currentIndex;
    
    if (isShuffled && s.playlist.length > 0) {
      shuffledPlaylist = [...s.playlist].sort(() => Math.random() - 0.5);
      if (s.currentSong) {
        const idx = shuffledPlaylist.findIndex(song => song.id === s.currentSong.id);
        if (idx > 0) {
          shuffledPlaylist.splice(idx, 1);
          shuffledPlaylist.unshift(s.currentSong);
        }
      }
      currentIndex = s.currentSong ? 0 : -1;
    } else if (!isShuffled && s.currentSong) {
      currentIndex = s.playlist.findIndex(song => song.id === s.currentSong.id);
    }
    
    return { isShuffled, shuffledPlaylist, currentIndex };
  }),

  toggleRepeat: () => {
    const modes = ['none', 'all', 'one'];
    const { repeatMode } = get();
    const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
    set({ repeatMode: modes[nextIndex] });
  },

  cleanup: () => {
    const { howl, intervalId } = get();
    if (howl) howl.unload();
    if (intervalId) clearInterval(intervalId);
    set({
      currentSong: null,
      currentIndex: -1,
      howl: null,
      intervalId: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    });
  },
}));

export default usePlayerStore;
