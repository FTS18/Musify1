export interface Song {
  name: string;
  path: string;
  artist: string;
  cover: string;
  id: string;
  date: string;
}

export interface AppState {
  currentMusic: number;
  isPlaying: boolean;
  volume: number;
  playbackSpeed: number;
  repeatMode: 'repeat' | 'repeat_one' | 'shuffle';
  currentTime: number;
  duration: number;
  songs: Song[];
  queue: Song[];
  searchQuery: string;
  isLoading: boolean;
}

export interface EqualizerBand {
  frequency: number;
  gain: number;
  label: string;
}