import { stateManager } from '../services/state.js';
import { songs } from '../services/data.js';
import { FirestoreService } from '../services/db.js';
import { currentUser, refreshUserData } from '../services/auth.js';
import { formatTime } from '../utils/format.js';
import { getSongCoverPath } from '../utils/helpers.js';

export default class MusicController {
    constructor(audioElement) {
        this.audio = audioElement;
        this.stateManager = stateManager;
        this.currentMusic = 0;

        // UI Elements (Lazy selection)
        this.elements = {
            seekBar: document.querySelector('#expandedSeekBar'),
            fullSeekBar: document.querySelector('#fullSeekBar'),
            currentTimeDisplay: document.querySelector('#currentTimeDisplay'),
            fullCurrentTime: document.querySelector('#fullCurrentTime'),
            durationDisplay: document.querySelector('#durationDisplay'),
            fullDuration: document.querySelector('#fullDuration'),
            miniSongName: document.querySelector('#miniSongName'),
            miniArtistName: document.querySelector('#miniArtistName'),
            miniCover: document.querySelector('#miniCover'),
            expandedSongName: document.querySelector('#expandedSongName'),
            expandedArtistName: document.querySelector('#expandedArtistName'),
            expandedCover: document.querySelector('#expandedCover'),
            playPauseBtnFull: document.querySelector('#playPauseBtn'),
            fullPlayPauseBtn: document.querySelector('#fullPlayPauseBtn'),
            miniPlayPause: document.querySelector('#miniPlayPause'),
            fullLikeBtn: document.getElementById('fullLikeBtn'),
            player: document.querySelector('#player')
        };

        if (this.audio) {
            this.setupEventListeners();
            this.initSeekbar();
        }
    }

    setupEventListeners() {
        this.audio.addEventListener('ended', () => this.handleEnded());
        this.audio.addEventListener('play', () => this.updateTitle());

        this.audio.addEventListener('loadedmetadata', () => {
            const duration = this.audio.duration;
            if (this.elements.durationDisplay && !isNaN(duration)) this.elements.durationDisplay.textContent = formatTime(duration);
            if (this.elements.fullDuration && !isNaN(duration)) this.elements.fullDuration.textContent = formatTime(duration);
            if (this.elements.seekBar) this.elements.seekBar.max = duration;
            if (this.elements.fullSeekBar) this.elements.fullSeekBar.max = duration;
        });

        this.audio.addEventListener('timeupdate', () => this.handleTimeUpdate());
    }

    initSeekbar() {
        [this.elements.seekBar, this.elements.fullSeekBar].forEach(sb => {
            if (sb) {
                sb.addEventListener('input', (e) => {
                    this.audio.currentTime = parseFloat(e.target.value);
                });
            }
        });
    }

    load(index) {
        if (!songs || index < 0 || index >= songs.length) return;
        this.currentMusic = index;
        const song = songs[this.currentMusic];

        this.audio.src = `assets/songs/${song.path}.mp3`;
        this.stateManager.setState({ currentMusic: index });

        this.updateUI(song);
        this.updatePlayerBackground(song);

        if (currentUser) {
            FirestoreService.addRecentPlay(currentUser.uid, song.id).then(() => {
                refreshUserData();
            });
        }
    }

    play() {
        if (this.audio && this.audio.paused) {
            this.audio.play().then(() => {
                this.stateManager.setState({ isPlaying: true });
                this.updatePlayPauseUI(true);
            }).catch(e => console.error('Playback error:', e));
        }
    }

    pause() {
        if (this.audio && !this.audio.paused) {
            this.audio.pause();
            this.stateManager.setState({ isPlaying: false });
            this.updatePlayPauseUI(false);
        }
    }

    toggle() {
        this.audio.paused ? this.play() : this.pause();
    }

    next() {
        this.currentMusic = (this.currentMusic + 1) % songs.length;
        this.load(this.currentMusic);
        this.play();
    }

    prev() {
        this.currentMusic = (this.currentMusic - 1 + songs.length) % songs.length;
        this.load(this.currentMusic);
        this.play();
    }

    playById(id) {
        const index = songs.findIndex(s => s.id === id);
        if (index !== -1) {
            this.load(index);
            this.play();
        }
    }

    handleEnded() {
        const mode = this.stateManager.getState().repeatMode;
        if (mode === 'one') {
            this.load(this.currentMusic);
            this.play();
        } else if (mode === 'shuffle') {
            const nextIdx = Math.floor(Math.random() * songs.length);
            this.load(nextIdx);
            this.play();
        } else {
            this.next();
        }
    }

    updateUI(song) {
        const els = this.elements;
        [els.miniSongName, els.expandedSongName].forEach(el => { if (el) el.innerText = song.name; });
        [els.miniArtistName, els.expandedArtistName].forEach(el => { if (el) el.innerText = song.artist; });
        const coverPath = getSongCoverPath(song.cover);
        [els.miniCover, els.expandedCover].forEach(el => { if (el) el.src = coverPath; });

        // Queue UI update call - handled by listener or main?
        // window.updateQueueUI(); // Removed direct call, rely on state change?
        // Actually, Player stores current index, but not queue array.
        // We'll dispatch a custom event or callback?
        document.dispatchEvent(new CustomEvent('music-changed', { detail: { index: this.currentMusic } }));

        if (document.body.classList.contains('listening-mode')) {
            // setTimeout(updateVibrantBackground, 50); // Need to import this or move to UI listener
        }
    }

    updatePlayPauseUI(isPlaying) {
        const icon = isPlaying ? 'pause' : 'play_arrow';
        if (this.elements.miniPlayPause) this.elements.miniPlayPause.innerText = icon;
        [this.elements.playPauseBtnFull, this.elements.fullPlayPauseBtn].forEach(btn => {
            if (btn) {
                const span = btn.querySelector('span') || btn;
                span.innerText = icon;
            }
        });
    }

    updatePlayerBackground(song) {
        // ... (Background logic, maybe extract to UI component later)
        if (!this.elements.player) return;

        let overlay = this.elements.player.querySelector('.background-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'background-overlay';
            this.elements.player.appendChild(overlay);
        }
        overlay.style.cssText = `
            position: absolute; top:0; left:0; width:100%; height:100%; z-index: -1;
            background: var(--overlay-gradient), 
                        url(${getSongCoverPath(song.cover)}) center/cover no-repeat fixed;
        `;

        // Main view vibe color
        // Need `colorThief` or `ColorThief` global
        // Assuming ColorThief is available globally or imported
    }

    updateTitle() {
        const currentSong = songs[this.currentMusic];
        if (currentSong) {
            document.title = `${currentSong.name} - ${currentSong.artist} | Musify`;
        }
    }

    handleTimeUpdate() {
        const t = this.audio.currentTime;
        if (this.elements.seekBar) this.elements.seekBar.value = t;
        if (this.elements.fullSeekBar) this.elements.fullSeekBar.value = t;
        if (this.elements.currentTimeDisplay) this.elements.currentTimeDisplay.innerText = formatTime(t);
        if (this.elements.fullCurrentTime) this.elements.fullCurrentTime.innerText = formatTime(t);
    }
}
