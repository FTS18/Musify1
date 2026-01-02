class AudioEqualizer {
  constructor(audioElement) {
    this.audio = audioElement;
    this.audioContext = null;
    this.source = null;
    this.analyser = null;
    this.filters = [];
    this.isInitialized = false;
    
    this.bands = [
      { frequency: 60, gain: 0, label: '60Hz' },
      { frequency: 170, gain: 0, label: '170Hz' },
      { frequency: 350, gain: 0, label: '350Hz' },
      { frequency: 1000, gain: 0, label: '1kHz' },
      { frequency: 3500, gain: 0, label: '3.5kHz' },
      { frequency: 10000, gain: 0, label: '10kHz' }
    ];
  }

  async init() {
    if (this.isInitialized) return;
    
    try {
      // Resume audio context if suspended
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.source = this.audioContext.createMediaElementSource(this.audio);
      this.analyser = this.audioContext.createAnalyser();
      
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      this.createFilters();
      this.connectNodes();
      this.isInitialized = true;
      
      console.log('AudioEqualizer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize equalizer:', error);
      throw error;
    }
  }

  createFilters() {
    this.filters = this.bands.map((band, index) => {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = index === 0 ? 'lowshelf' : index === this.bands.length - 1 ? 'highshelf' : 'peaking';
      filter.frequency.value = band.frequency;
      filter.Q.value = 1;
      filter.gain.value = band.gain;
      return filter;
    });
  }

  connectNodes() {
    let previousNode = this.source;
    
    this.filters.forEach(filter => {
      previousNode.connect(filter);
      previousNode = filter;
    });
    
    previousNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  setGain(bandIndex, gain) {
    if (this.filters[bandIndex]) {
      this.filters[bandIndex].gain.value = gain;
      this.bands[bandIndex].gain = gain;
    }
  }

  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  reset() {
    this.bands.forEach((band, index) => {
      this.setGain(index, 0);
    });
  }
}

class AudioVisualizer {
  constructor(canvasElement, equalizer) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.equalizer = equalizer;
    this.animationId = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  animate() {
    if (!this.isRunning) return;
    
    const frequencyData = this.equalizer.getFrequencyData();
    this.draw(frequencyData);
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  draw(frequencyData) {
    const { width, height } = this.canvas;
    
    // Set canvas size if not set
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    
    const barWidth = width / frequencyData.length;
    
    this.ctx.clearRect(0, 0, width, height);
    
    // Create gradient
    const gradient = this.ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, '#00ff80');
    gradient.addColorStop(0.5, '#ffff00');
    gradient.addColorStop(1, '#ff0040');
    
    this.ctx.fillStyle = gradient;
    
    // Draw bars
    for (let i = 0; i < frequencyData.length; i++) {
      const barHeight = (frequencyData[i] / 255) * height * 0.8;
      const x = i * barWidth;
      const y = height - barHeight;
      
      this.ctx.fillRect(x, y, barWidth - 1, barHeight);
    }
  }
}