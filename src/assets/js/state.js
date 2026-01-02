class StateManager {
  constructor() {
    this.state = {
      currentMusic: 0,
      isPlaying: false,
      volume: 1,
      playbackSpeed: 1,
      repeatMode: 'repeat',
      currentTime: 0,
      duration: 0,
      songs: [],
      queue: [],
      searchQuery: '',
      isLoading: false
    };
    this.listeners = new Map();
  }

  getState() {
    return { ...this.state };
  }

  setState(updates) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };
    this.notifyListeners(prevState, this.state);
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);
    
    return () => {
      const callbacks = this.listeners.get(key);
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  }

  notifyListeners(prevState, newState) {
    for (const [key, callbacks] of this.listeners) {
      if (prevState[key] !== newState[key]) {
        callbacks.forEach(callback => callback(newState[key], prevState[key]));
      }
    }
  }
}

const stateManager = new StateManager();