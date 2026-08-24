import config from '../config';

const apiBaseUrl = config.apiBaseUrl;
const staticBaseUrl = apiBaseUrl.replace('/api', '');

export const unwrap = (response) => response.data?.data ?? response.data;

export const assetUrl = (path) => {
  if (!path) return '';
  return path.startsWith('http') ? path : `${staticBaseUrl}${path}`;
};

export const formatDuration = (seconds = 0) => {
  const safeSeconds = Number.isFinite(Number(seconds)) ? Number(seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = Math.floor(safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
};

export const formatPlayCount = (count = 0) => {
  const safeCount = Number.isFinite(Number(count)) ? Number(count) : 0;
  if (safeCount >= 1000) {
    const formatted = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(safeCount);
    return `${formatted.toLowerCase()}+`;
  }
  return String(safeCount);
};

const numericValue = (...values) => {
  const value = values.find((item) => item !== undefined && item !== null);
  return Number.isFinite(Number(value)) ? Number(value) : 0;
};

export const playlistPlayCount = (playlist = {}) => {
  if (playlist.totalPlayCount !== undefined || playlist.total_play_count !== undefined) {
    return numericValue(playlist.totalPlayCount, playlist.total_play_count);
  }
  return (playlist.songs || []).reduce((total, song) => total + numericValue(song.playCount, song.play_count), 0);
};

export const initials = (name = 'MS') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'MS';

export const getSongsFromPayload = (payload) => payload?.songs ?? payload ?? [];

export const getTotalSongsFromPayload = (payload) => payload?.pagination?.total ?? 0

export const getFavoritesSongs = (favorites = []) =>
  favorites.map((favorite) => favorite.song).filter(Boolean);
