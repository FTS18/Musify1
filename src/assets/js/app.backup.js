'use strict';

import { auth } from './firebase-init.js';
// import { FirestoreService } from './firestore-service.js';
import { ContextMenu } from './context-menu.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ===== DOM Element Declarations =====
const music = document.querySelector('#audio-source');
const player = document.querySelector('#player');
const playerMiniInfo = document.querySelector('#playerMiniInfo');
const expandedClose = document.querySelector('#expandedClose');
const toggle = document.querySelector('.toggle');
const menu = document.querySelector('.menu');
const body = document.querySelector('body');

const seekBar = document.querySelector('#expandedSeekBar');
const currentTimeDisplay = document.querySelector('#currentTimeDisplay');
const durationDisplay = document.querySelector('#durationDisplay');

const miniSongName = document.querySelector('#miniSongName');
const miniArtistName = document.querySelector('#miniArtistName');
const miniCover = document.querySelector('#miniCover');
const miniPlayPause = document.querySelector('#miniPlayPause');

const expandedSongName = document.querySelector('#expandedSongName');
const expandedArtistName = document.querySelector('#expandedArtistName');
const expandedCover = document.querySelector('#expandedCover');
const playPauseBtnFull = document.querySelector('#playPauseBtn');
const fullPlayPauseBtn = document.querySelector('#fullPlayPauseBtn');
const nextBtn = document.querySelector('#nextBtn');
const prevBtn = document.querySelector('#prevBtn');
const fullNextBtn = document.querySelector('#fullNextBtn');
const fullPrevBtn = document.querySelector('#fullPrevBtn');
const fullShuffleBtn = document.querySelector('#fullShuffleBtn');
const fullRepeatBtn = document.querySelector('#fullRepeatBtn');
const fullSeekBar = document.querySelector('#fullSeekBar');
const fullCurrentTime = document.querySelector('#fullCurrentTime');
const fullDuration = document.querySelector('#fullDuration');

let currentUser = null;
let userData = { likedSongs: [], recentPlay: [], playlists: [] };

let currentMusic = 0;
const colorThief = new ColorThief();

// ===== Router Infrastructure =====
class Router {
    constructor() {
        this.routes = {
            'home': () => this.showHome(),
            'artist': (name) => this.showArtist(name),
            'profile': () => this.showProfile(),
            'explore': () => this.showSearch(),
            'search': () => this.showSearch(),
            'library': () => this.showLibrary(),
            'trending': () => this.showPlaceholder('Trending'),
            'liked-songs': () => showLikedSongs(),
            'recent': () => showRecentSongs(),
            'all-songs': () => { this.hideAllSections(); window.renderAllSongsView(1); },
            'all-artists': () => { this.hideAllSections(); window.renderAllArtistsView(1); }
        };
        // Switch to History API
        window.addEventListener('popstate', () => this.handleRoute());
        this.handleRoute();
    }

    handleRoute() {
        // Remove leading slash and index.html if present
        let pathStr = window.location.pathname.replace(/^\/|index\.html/g, '');
        // Remove trailing slash
        pathStr = pathStr.replace(/\/$/, '');

        // Default to home
        if (!pathStr) pathStr = 'home';

        const parts = pathStr.split('/');
        const path = parts[0];
        const param = parts[1] || '';

        if (this.routes[path]) {
            this.routes[path](decodeURIComponent(param));
        } else {
            // If route not found (and not home), maybe we should default to home?
            this.showHome();
        }
        this.updateSidebarUI(path);
    }

    navigate(path, param = '') {
        const url = param ? `/${path}/${encodeURIComponent(param)}` : `/${path}`;
        history.pushState({}, '', url);
        this.handleRoute();
    }

    showHome() {
        this.hideAllSections();
        const homeSections = ['.hero-banner', '.section-header', '#playlists', '#artists'];
        homeSections.forEach(sel => document.querySelectorAll(sel).forEach(el => el.style.display = ''));
        document.querySelector('.main-view').scrollTo({ top: 0 });
    }

    showArtist(name) {
        if (!name) return this.showHome();
        this.hideAllSections();
        window.openArtistProfile(name, true);
    }

    showProfile() {
        this.hideAllSections();
        const profileView = document.getElementById('profileView');
        if (profileView) {
            profileView.style.display = 'block';
            window.renderProfileView();
        }
    }

    showLibrary() {
        this.hideAllSections();
        const view = document.getElementById('libraryView');
        if (view) {
            view.style.display = 'block';
            window.renderLibraryView();
        }
    }

    showSearch() {
        this.hideAllSections();
        const view = document.getElementById('searchView');
        if (view) {
            view.style.display = 'block';
            window.renderSearchView();
        }
    }

    showPlaceholder(title) {
        this.hideAllSections();
        const randomSongs = songs.slice().sort(() => 0.5 - Math.random()).slice(0, 20);
        window.renderSongListView(title, randomSongs.map(s => s.id), 'assets/images/bg.jpg');
    }

    hideAllSections() {
        const all = ['.hero-banner', '.section-header', '#playlists', '#artists', '.search-results-container', '#artistProfile', '#profileView', '#genericListView', '#libraryView', '#searchView'];
        all.forEach(sel => document.querySelectorAll(sel).forEach(el => el.style.display = 'none'));
    }

    updateSidebarUI(path) {
        document.querySelectorAll('.nav-links > li:not(.nav-dropdown), .nav-dropdown-content li, .mobile-nav-item').forEach(el => {
            el.classList.remove('active');
            // Strict check for dropdown items to avoid parent matching
            const onclick = el.getAttribute('onclick') || '';
            if ((onclick.includes(`navigate('${path}')`) && path !== 'home') ||
                (path === 'home' && onclick.includes('navigate("home")'))) {
                el.classList.add('active');
            } else if (el.innerText.toLowerCase() === path) {
                el.classList.add('active');
            }
        });
    }
}

// Note: Router instantiation moved to bottom of file
window.navigate = (path, param) => {
    if (window.router) window.router.navigate(path, param);
    else {
        const url = param ? `/${path}/${encodeURIComponent(param)}` : `/${path}`;
        history.pushState({}, '', url);
    }
};

// Library & Search View Renderers
window.renderLibraryView = () => {
    // Update Counts
    const likedCount = document.getElementById('libraryLikedCount');
    const plCount = document.getElementById('libraryPlaylistCount');
    const recentCount = document.getElementById('libraryRecentCount');

    if (likedCount) likedCount.innerText = `${userData.likedSongs ? userData.likedSongs.length : 0} songs`;
    if (plCount) plCount.innerText = `${userData.playlists ? userData.playlists.length : 0} playlists`;
    if (recentCount) recentCount.innerText = `${userData.recentPlay ? userData.recentPlay.length : 0} played`;

    // Render Playlists
    const plContainer = document.getElementById('libraryPlaylists');
    if (plContainer) {
        plContainer.innerHTML = (userData.playlists && userData.playlists.length > 0) ? userData.playlists.map(pl => `
            <div class="card" onclick="navigate('home'); setTimeout(() => showPlaylistView('${pl.id}', null), 100);">
                <div class="img-container">
                    <img src="assets/images/cover/playlist_bg.jpg" alt="${pl.name}">
                    <div class="play-btn"><i class="material-icons">play_arrow</i></div>
                </div>
                <h4>${pl.name}</h4>
                <p>${pl.songs ? pl.songs.length : 0} songs</p>
            </div>
        `).join('') : '<p style="opacity:0.5; padding:20px;">No playlists yet.</p>';
    }

    // Render Followed Artists
    const artistsContainer = document.getElementById('libraryFollowedArtists');
    if (artistsContainer) {
        if (userData.followedArtists && userData.followedArtists.length > 0) {
            artistsContainer.innerHTML = userData.followedArtists.map(name => {
                const data = userData.followedArtistsData?.[name] || {};
                return `
                    <div class="artist-card" onclick="window.openArtistProfile('${name}')">
                        <div class="img-container" style="border-radius:50%; width:120px; height:120px; margin:0 auto 10px; border: var(--border-thick); overflow:hidden;">
                            <img src="${data.img || 'assets/images/placeholder.svg'}" alt="${name}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <h4 style="text-align:center;">${name}</h4>
                        <p style="text-align:center;">Artist</p>
                    </div>
                `;
            }).join('');
        } else {
            artistsContainer.innerHTML = '<p style="opacity:0.5; padding:20px;">No artists followed.</p>';
        }
    }

    // Render All Songs (Lazy/Limited)
    const songsContainer = document.getElementById('libraryAllSongs');
    if (songsContainer) {
        // Just show top 50 to avoid performance issues
        songsContainer.innerHTML = songs.slice(0, 50).map((s, i) => `
            <div class="song-row" onclick="playSongById('${s.id}')">
                <div class="song-number" style="opacity:0.5; font-size:14px;">${i + 1}</div>
                <div class="song-main-info" style="display:flex; align-items:center; gap:12px; flex:1;">
                    <img src="${getSongCoverPath(s.cover)}" class="song-thumb" style="width:40px; height:40px; border-radius:4px;">
                    <div>
                        <div class="song-title-text" style="font-weight:700; font-size:15px;">${s.name}</div>
                        <div class="song-artist-text" style="color:var(--text-secondary); font-size:13px;">${s.artist}</div>
                    </div>
                </div>
                <div class="song-play-action"><span class="material-icons">play_arrow</span></div>
                <button class="add-btn-inline" onclick="event.stopPropagation(); toggleLikeSong('${s.id}')" style="background:transparent; border:none; color:${userData.likedSongs.includes(s.id) ? 'var(--accent)' : '#fff'}; cursor:pointer;">
                    <i class="material-icons">${userData.likedSongs.includes(s.id) ? 'favorite' : 'favorite_border'}</i>
                </button>
            </div>
        `).join('');
    }
};

window.renderSearchView = () => {
    const browseContainer = document.getElementById('searchBrowseCategories');
    if (browseContainer && browseContainer.innerHTML.trim() === '') {
        // Use placeholder images for categories
        const categories = [
            { name: 'Live Events', color: '#e91e63' },
            { name: 'Made For You', color: '#1e88e5' },
            { name: 'New Releases', color: '#9c27b0' },
            { name: 'Desi', color: '#e65100' },
            { name: 'Pop', color: '#43a047' },
            { name: 'Love', color: '#f44336' },
            { name: 'Instrumental', color: '#607d8b' },
            { name: 'Radio', color: '#795548' }
        ];

        browseContainer.innerHTML = categories.map(cat => `
            <div class="browse-card" onclick="searchGenre('${cat.name}')" style="background:${cat.color}; height:100px; border-radius:8px; padding:16px; position:relative; overflow:hidden; cursor:pointer;">
                <h3 style="font-size:18px; font-weight:700;">${cat.name}</h3>
                <div style="position:absolute; bottom:-10px; right:-10px; transform:rotate(25deg); width:60px; height:60px; background:rgba(0,0,0,0.2); border-radius:8px;"></div>
            </div>
        `).join('');
    }

    // Attach search listener
    const input = document.getElementById('searchInputMobile');
    if (input) {
        input.onkeyup = (e) => {
            const query = e.target.value.toLowerCase();
            const resultsDiv = document.getElementById('searchResults');
            const resultsList = document.getElementById('searchResultsList');
            const browseDiv = document.getElementById('searchBrowseCategories');

            if (query.length > 0) {
                // Show results
                if (browseDiv) browseDiv.style.display = 'none';
                if (resultsDiv) resultsDiv.style.display = 'block';

                const matched = songs.filter(s => s.name.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query));

                if (resultsList) {
                    resultsList.innerHTML = matched.length > 0 ? matched.map((s, i) => `
                        <div class="song-row" onclick="playSongById('${s.id}')">
                            <img src="${getSongCoverPath(s.cover)}" style="width:40px; height:40px; border-radius:4px;">
                            <div style="flex:1; margin-left:12px;">
                                <div style="font-weight:700;">${s.name}</div>
                                <div style="font-size:12px; opacity:0.7;">${s.artist}</div>
                            </div>
                        </div>
                    `).join('') : '<p style="opacity:0.5">No matches found</p>';
                }
            } else {
                // Show browse
                if (browseDiv) browseDiv.style.display = 'grid';
                if (resultsDiv) resultsDiv.style.display = 'none';
            }
        };
    }
};

window.searchGenre = (genre) => {
    const input = document.getElementById('searchInputMobile');
    if (input) {
        input.value = genre;
        input.dispatchEvent(new Event('keyup')); // Trigger search
        // Also scroll to top
        document.querySelector('.main-view').scrollTo({ top: 0, behavior: 'smooth' });
    }
};


// ===== Music Controller Class =====
class MusicController {
    constructor(audioElement, stateManagerInstance) {
        this.audio = audioElement;
        this.stateManager = stateManagerInstance;
        this.currentMusic = 0;
        if (this.audio) {
            this.setupEventListeners();
            this.initSeekbar();
        }
    }

    setupEventListeners() {
        this.audio.addEventListener('ended', () => this.handleEnded());
        this.audio.addEventListener('play', () => this.updateTitle());

        // Loadedmetadata for duration and max seekbar values
        this.audio.addEventListener('loadedmetadata', () => {
            const duration = this.audio.duration;
            if (durationDisplay && !isNaN(duration)) {
                durationDisplay.textContent = this.formatTime(duration);
            }
            if (fullDuration && !isNaN(duration)) {
                fullDuration.textContent = this.formatTime(duration);
            }
            if (seekBar) seekBar.max = duration; // Use seekBar for mini player
            if (fullSeekBar) fullSeekBar.max = duration;
        });

        // Time update for seekbar and time displays
        this.audio.addEventListener('timeupdate', () => {
            const currentTime = this.audio.currentTime;
            const duration = this.audio.duration;

            // Update seekbars
            if (seekBar && !isNaN(duration)) { // Use seekBar for mini player
                seekBar.value = currentTime;
            }
            if (fullSeekBar && !isNaN(duration)) {
                fullSeekBar.value = currentTime;
            }

            // Update time displays
            if (currentTimeDisplay) {
                currentTimeDisplay.textContent = this.formatTime(currentTime);
            }
            if (fullCurrentTime) {
                fullCurrentTime.textContent = this.formatTime(currentTime);
            }
        });
    }

    initSeekbar() {
        // Mini player seekbar
        if (seekBar) { // Use seekBar for mini player
            seekBar.addEventListener('input', (e) => {
                const seekTime = parseFloat(e.target.value);
                this.audio.currentTime = seekTime;
            });
        }

        // Full player seekbar
        if (fullSeekBar) {
            fullSeekBar.addEventListener('input', (e) => {
                const seekTime = parseFloat(e.target.value);
                this.audio.currentTime = seekTime;
            });
        }
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    load(index) {
        if (typeof songs === 'undefined' || index < 0 || index >= songs.length) return;
        this.currentMusic = index;
        currentMusic = index;
        const song = songs[this.currentMusic];

        this.audio.src = `assets/songs/${song.path}.mp3`;
        this.stateManager.setState({ currentMusic: index });

        this.updateUI(song);
        this.updatePlayerBackground(song);

        // Record recent play if logged in
        if (currentUser) {
            FirestoreService.addRecentPlay(currentUser.uid, song.id).then(() => {
                refreshUserData();
            });
        }

        this.audio.onloadedmetadata = () => {
            if (seekBar) seekBar.max = this.audio.duration;
            if (fullSeekBar) fullSeekBar.max = this.audio.duration;
            if (durationDisplay) durationDisplay.innerText = formatTime(this.audio.duration);
            if (fullDuration) fullDuration.innerText = formatTime(this.audio.duration);
        };
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
        [miniSongName, expandedSongName].forEach(el => { if (el) el.innerText = song.name; });
        [miniArtistName, expandedArtistName].forEach(el => { if (el) el.innerText = song.artist; });
        const coverPath = getSongCoverPath(song.cover);
        [miniCover, expandedCover].forEach(el => { if (el) el.src = coverPath; });

        currentMusic = this.currentMusic; // Sync global state
        updateQueueUI();

        // Sync Full Player Like Btn (Phase 3 Button structure)
        const fullLikeBtn = document.getElementById('fullLikeBtn');
        if (fullLikeBtn) {
            const icon = fullLikeBtn.querySelector('.material-icons');
            const isLiked = userData.likedSongs.includes(song.id);
            if (icon) icon.innerText = isLiked ? 'favorite' : 'favorite_border';
            fullLikeBtn.classList.toggle('active', isLiked);
            fullLikeBtn.onclick = (e) => {
                e.stopPropagation();
                toggleLike(song.id, fullLikeBtn);
            };
        }

        if (document.body.classList.contains('listening-mode')) {
            setTimeout(updateVibrantBackground, 50);
        }
    }

    updatePlayPauseUI(isPlaying) {
        const icon = isPlaying ? 'pause' : 'play_arrow';
        if (miniPlayPause) miniPlayPause.innerText = icon;
        [playPauseBtnFull, fullPlayPauseBtn].forEach(btn => {
            if (btn) {
                const span = btn.querySelector('span') || btn;
                span.innerText = icon;
            }
        });
    }

    updatePlayerBackground(song) {
        if (!player) return;
        const mainView = document.querySelector('.main-view');

        let overlay = player.querySelector('.background-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'background-overlay';
            player.appendChild(overlay);
        }
        overlay.style.cssText = `
            position: absolute; top:0; left:0; width:100%; height:100%; z-index: -1;
            background: var(--overlay-gradient), 
                        url(${getSongCoverPath(song.cover)}) center/cover no-repeat fixed;
        `;

        // Update atmospheric background for main view
        const img = new Image();
        img.src = getSongCoverPath(song.cover);
        img.onload = () => {
            try {
                const color = colorThief.getColor(img);
                if (color && mainView) {
                    const rgb = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.25)`;
                    mainView.style.setProperty('--vibe-color', rgb);
                }
            } catch (e) { }
        };
    }

    updateTitle() {
        const currentSong = songs[this.currentMusic];
        if (currentSong) {
            document.title = `${currentSong.name} - ${currentSong.artist} | Musify`;
        }
    }

    handleTimeUpdate() {
        if (seekBar) seekBar.value = this.audio.currentTime;
        if (fullSeekBar) fullSeekBar.value = this.audio.currentTime;
        if (currentTimeDisplay) currentTimeDisplay.innerText = formatTime(this.audio.currentTime);
        if (fullCurrentTime) fullCurrentTime.innerText = formatTime(this.audio.currentTime);
    }
}

// ===== Initialize Core Logic =====
const musicController = new MusicController(music, stateManager);
stateManager.setState({
    isPlaying: false,
    repeatMode: 'repeat',
    currentMusic: 0
});

// ===== User Data Sync =====
async function refreshUserData() {
    if (currentUser) {
        userData = await FirestoreService.getUserData(currentUser.uid);
        updateQueueUI();
        initRightSidebar();
        updatePlaylistsSidebar();
        updateLikeIcons();
    }
}

async function toggleLike(songId, btn) {
    if (!currentUser) {
        alert("Please login to like songs!");
        return;
    }
    const isLiked = !userData.likedSongs.includes(songId);
    await FirestoreService.toggleLike(currentUser.uid, songId, isLiked);
    await refreshUserData();
}

// Wrapper for quick like from cards
window.toggleLikeSong = async (songId) => {
    if (!currentUser) {
        alert("Please login to like songs!");
        return;
    }
    if (!userData.likedSongs) userData.likedSongs = [];

    if (userData.likedSongs.includes(songId)) {
        userData.likedSongs = userData.likedSongs.filter(id => id !== songId);
    } else {
        userData.likedSongs.push(songId);
    }
    await FirestoreService.saveUserData(currentUser.uid, { likedSongs: userData.likedSongs });

    // Update UI
    // ... (rest of update UI logic usually here or handled by reaction)
    // But we must redraw liked view if active
    const likedView = document.getElementById('genericListView');
    if (likedView && likedView.dataset.viewType === 'likedSongs') {
        renderLikedSongs(); // Assuming this function exists to re-render the liked songs view
    }
    updateLikeIcons();
};

// Follow/Unfollow artist
window.toggleFollowArtist = async (artistName, artistImg) => {
    if (!currentUser) {
        alert("Please login to follow artists!");
        return;
    }
    if (!userData.followedArtists) userData.followedArtists = [];
    if (!userData.followedArtistsData) userData.followedArtistsData = {};

    const isFollowed = userData.followedArtists.includes(artistName);
    if (isFollowed) {
        userData.followedArtists = userData.followedArtists.filter(a => a !== artistName);
        delete userData.followedArtistsData[artistName];
    } else {
        userData.followedArtists.push(artistName);
        userData.followedArtistsData[artistName] = { name: artistName, img: artistImg };
    }

    // Save to Firestore
    // Save to Firestore
    await FirestoreService.saveUserData(currentUser.uid, { followedArtists: userData.followedArtists, followedArtistsData: userData.followedArtistsData });

    // Update sidebar
    renderFollowedArtists();
};

// Render followed artists in sidebar
function renderFollowedArtists() {
    const container = document.getElementById('followedArtistsContainer');
    if (!container) return;

    if (!userData.followedArtists || userData.followedArtists.length === 0) {
        container.innerHTML = '<p style="font-size: 12px; opacity: 0.5; padding: 8px 16px;">No artists followed yet</p>';
        return;
    }

    container.innerHTML = userData.followedArtists.map(artistName => {
        const data = userData.followedArtistsData?.[artistName] || {};
        return `
            <div class="followed-artist-item" onclick="window.openArtistProfile('${artistName}')" style="cursor:pointer;">
                <img src="${data.img || 'assets/images/placeholder.svg'}" alt="${artistName}" style="width:32px; height:32px; border-radius:4px; object-fit:cover;">
                <span style="flex:1; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${artistName}</span>
            </div>
        `;
    }).join('');
}

// Global accessor for like
window.toggleLike = toggleLike;
window.renderFollowedArtists = renderFollowedArtists;

function updateLikeIcons() {
    document.querySelectorAll('.like-btn, .recent-like').forEach(btn => {
        const songCard = btn.closest('.card, .recent-play-item, .player-full-view');
        let songId = null;

        if (songCard) {
            // Context-aware song ID detection
            if (songCard.classList.contains('player-full-view') || btn.classList.contains('like-btn')) {
                songId = songs[currentMusic].id;
            } else {
                if (songCard.dataset.index) {
                    songId = songs[parseInt(songCard.dataset.index)].id;
                }
            }
        }

        if (songId) {
            const isLiked = userData.likedSongs.includes(songId);
            btn.innerText = isLiked ? 'favorite' : 'favorite_border';
            btn.classList.toggle('active', isLiked);
            btn.onclick = (e) => {
                e.stopPropagation();
                toggleLike(songId, btn);
            };
        }
    });
}

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        refreshUserData();
    } else {
        userData = { likedSongs: [], recentPlay: [] };
        updateQueueUI();
        initRightSidebar();
    }
});

// ===== Global Accessors =====
window.setMusic = (i) => musicController.load(i);
window.playAudio = () => musicController.play();
window.pauseAudio = () => musicController.pause();
window.playSongById = (id) => musicController.playById(id);

// ===== UI Helpers =====
function formatTime(time) {
    if (isNaN(time)) return '0 : 00';
    let min = Math.floor(time / 60);
    let sec = Math.floor(time % 60);
    return `${min} : ${sec < 10 ? '0' + sec : sec}`;
}

function updateQueueUI() {
    document.querySelectorAll('.queue').forEach(item => {
        const idx = parseInt(item.dataset.index);
        item.classList.toggle('active', idx === currentMusic);
    });
}

function updateURLWithSongID(songId) {
    const url = new URL(window.location.href);
    url.searchParams.set('id', songId);
    window.history.pushState({}, '', url);
}

function lazyLoadImages(container) {
    if (!container) return;
    container.querySelectorAll('.lazyload').forEach(img => {
        const applyColors = () => {
            try {
                if (img.complete) {
                    // Get palette and find most vibrant color
                    const palette = colorThief.getPalette(img, 8);
                    if (palette && palette.length > 0) {
                        // Find most saturated color
                        let mostVibrant = palette[0];
                        let maxSaturation = 0;

                        palette.forEach(color => {
                            const [r, g, b] = color;
                            const max = Math.max(r, g, b);
                            const min = Math.min(r, g, b);
                            const saturation = max === 0 ? 0 : (max - min) / max;
                            if (saturation > maxSaturation) {
                                maxSaturation = saturation;
                                mostVibrant = color;
                            }
                        });

                        // Boost saturation heavily for vibrant colors
                        let [r, g, b] = mostVibrant;
                        r = Math.min(255, Math.round(r * 1.6));
                        g = Math.min(255, Math.round(g * 1.6));
                        b = Math.min(255, Math.round(b * 1.6));

                        const rgb = `${r}, ${g}, ${b}`;
                        const card = img.closest('.card, .artist-card, .queue');

                        if (card) {
                            card.dataset.dominantColor = `rgb(${rgb})`;
                            // Apply VERY vibrant gradient with high opacity
                            card.style.background = `linear-gradient(135deg, rgba(${rgb}, 0.75) 0%, rgba(${rgb}, 0.55) 50%, rgba(${rgb}, 0.35) 100%)`;
                            card.style.transition = 'all 0.3s ease';

                            // Adjust text contrast
                            const luminance = (r * 0.299 + g * 0.587 + b * 0.114);
                            card.style.color = luminance > 140 ? '#000' : '#fff';
                            card.querySelectorAll('h4, p, span').forEach(el => el.style.color = 'inherit');

                            // Hover scaling effect
                            card.addEventListener('mouseenter', () => {
                                card.style.transform = 'translateY(-6px) scale(1.02)';
                                card.style.boxShadow = `0 12px 24px rgba(${rgb}, 0.5)`;
                                card.style.zIndex = "5";
                            });
                            card.addEventListener('mouseleave', () => {
                                card.style.transform = '';
                                card.style.boxShadow = '';
                                card.style.zIndex = "";
                            });
                        }
                    }
                }
            } catch (e) { }
        };

        img.addEventListener('load', () => {
            img.classList.remove('lazyload');
            applyColors();
        });
        img.addEventListener('error', () => {
            img.classList.remove('lazyload');
            img.src = 'assets/images/placeholder.svg';
        });

        if (img.dataset.src) img.src = img.dataset.src;
    });
}

// ===== Main Application Initialization =====
async function initApp() {
    if (typeof songs === 'undefined' || songs.length === 0) {
        setTimeout(initApp, 500);
        return;
    }

    // URL Check
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
        const idx = songs.findIndex(s => s.id === id);
        musicController.load(idx !== -1 ? idx : 0);
    } else {
        musicController.load(0);
    }

    // Load Items for Queue
    loadItems(1);

    // Fetch Playlist Data once
    try {
        const res = await fetch('assets/js/playlist_data.json');
        const data = await res.json();
        stateManager.setState({ artists: data.artists });

        // Populate Recommended (10 random)
        const pc = document.querySelector('#playlists');
        if (pc) {
            pc.innerHTML = '';
            const random = songs.slice().sort(() => 0.5 - Math.random()).slice(0, 10);
            random.forEach(song => {
                const card = document.createElement('div');
                card.className = 'card';
                card.dataset.index = songs.findIndex(s => s.id === song.id);
                const isLiked = userData.likedSongs && userData.likedSongs.includes(song.id);
                card.innerHTML = `
                    <div class="img-container">
                        <img src="${getSongCoverPath(song.cover)}" loading="lazy" alt="${song.name}">
                        <div class="play-btn"><i class="material-icons">play_arrow</i></div>
                        <button class="add-btn ${isLiked ? 'liked' : ''}" data-song-id="${song.id}" title="${isLiked ? 'Remove from Liked' : 'Add to Liked'}">
                            <i class="material-icons">${isLiked ? 'favorite' : 'add'}</i>
                        </button>
                    </div>
                    <h4>${song.name}</h4>
                    <p>${song.artist}</p>
                `;
                card.onclick = (e) => {
                    if (!e.target.closest('.add-btn')) {
                        playSongById(song.id);
                        updateURLWithSongID(song.id);
                    }
                };
                // Add-to-liked handler
                card.querySelector('.add-btn').onclick = (e) => {
                    e.stopPropagation();
                    window.toggleLikeSong(song.id);
                    const btn = e.currentTarget;
                    const isNowLiked = userData.likedSongs && userData.likedSongs.includes(song.id);
                    btn.classList.toggle('liked', isNowLiked);
                    btn.querySelector('i').textContent = isNowLiked ? 'favorite' : 'add';
                    btn.title = isNowLiked ? 'Remove from Liked' : 'Add to Liked';
                };
                pc.appendChild(card);
            });

            // View More Card (Recommended)
            const viewMoreRec = document.createElement('div');
            viewMoreRec.className = 'card';
            viewMoreRec.style.display = 'flex';
            viewMoreRec.style.flexDirection = 'column';
            viewMoreRec.style.alignItems = 'center';
            viewMoreRec.style.justifyContent = 'center';
            viewMoreRec.style.minWidth = '160px';
            viewMoreRec.style.cursor = 'pointer';
            viewMoreRec.innerHTML = `
                <div style="width:100%; aspect-ratio:1; background:var(--bg-card-hover); border-radius:8px; display:flex; align-items:center; justify-content:center; margin-bottom:12px;">
                    <span class="material-icons" style="font-size:48px; color:var(--text-secondary);">add</span>
                </div>
                <h4>View All</h4>
            `;
            viewMoreRec.onclick = () => navigate('all-songs');
            pc.appendChild(viewMoreRec);
        }

        // Populate Artists
        const ac = document.querySelector('#artists');
        if (ac) {
            ac.innerHTML = '';
            data.artists.forEach(a => {
                const card = document.createElement('div');
                card.className = 'artist-card';
                card.style.cursor = 'pointer';
                card.dataset.name = a.title;
                const isFollowed = userData.followedArtists && userData.followedArtists.includes(a.title);
                card.innerHTML = `
                    <div class="img-container" style="border-radius:50%; width:120px; height:120px; margin:0 auto 10px; border: var(--border-thick); overflow:hidden; position:relative;">
                        <img src="${a.imageSrc}" loading="lazy" alt="${a.title}" style="width:100%; height:100%; object-fit:cover;">
                        <button class="follow-btn ${isFollowed ? 'following' : ''}" data-artist="${a.title}" data-img="${a.imageSrc}" title="${isFollowed ? 'Unfollow' : 'Follow'}">
                            <i class="material-icons">${isFollowed ? 'check' : 'add'}</i>
                        </button>
                    </div>
                    <h4 style="text-align:center;">${a.title}</h4>
                    <p style="text-align:center;">Artist</p>
                `;
                card.addEventListener('click', (e) => {
                    if (!e.target.closest('.follow-btn')) {
                        e.stopPropagation();
                        window.openArtistProfile(a.title);
                    }
                });
                // Follow handler
                card.querySelector('.follow-btn').onclick = (e) => {
                    e.stopPropagation();
                    window.toggleFollowArtist(a.title, a.imageSrc);
                    const btn = e.currentTarget;
                    const isNowFollowed = userData.followedArtists && userData.followedArtists.includes(a.title);
                    btn.classList.toggle('following', isNowFollowed);
                    btn.querySelector('i').textContent = isNowFollowed ? 'check' : 'add';
                    btn.title = isNowFollowed ? 'Unfollow' : 'Follow';
                };
                ac.appendChild(card);
            });

            // View More Card (Artists)
            const viewMoreArt = document.createElement('div');
            viewMoreArt.className = 'artist-card';
            viewMoreArt.style.display = 'flex';
            viewMoreArt.style.flexDirection = 'column';
            viewMoreArt.style.alignItems = 'center';
            viewMoreArt.style.justifyContent = 'center';
            viewMoreArt.style.cursor = 'pointer';
            viewMoreArt.innerHTML = `
                <div style="width:120px; height:120px; background:var(--bg-card-hover); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:10px; border: var(--border-thick);">
                    <span class="material-icons" style="font-size:40px; color:var(--text-secondary);">add</span>
                </div>
                <h4 style="text-align:center;">View All</h4>
            `;
            viewMoreArt.onclick = () => navigate('all-artists');
            ac.appendChild(viewMoreArt);
        }

        // Init Right Sidebar (Recent/Random)
        initRightSidebar();
        renderFollowedArtists();

    } catch (e) { console.error("Data error", e); }

    // Hero Vibrant BG
    setTimeout(() => {
        const hero = document.querySelector('.hero-bg');
        if (hero && hero.complete && colorThief) {
            try {
                const c = colorThief.getColor(hero);
                document.querySelector('.main-view').style.background = `linear-gradient(180deg, rgba(${c[0]},${c[1]},${c[2]},0.15) 0%, #121212 80%)`;
            } catch (e) { }
        }
    }, 1500);
}

// ===== Additional Global Logic =====
const itemsPerPage = 30;
function loadItems(page) {
    const container = document.querySelector('#queue');
    if (!container) return;
    const start = (page - 1) * itemsPerPage;
    const chunk = songs.slice(start, start + itemsPerPage);
    const frag = document.createDocumentFragment();
    chunk.forEach((s, i) => {
        const item = document.createElement('div');
        item.className = 'queue';
        item.dataset.index = start + i;
        item.innerHTML = `
            <div class="queue-cover">
                <img src="${getSongCoverPath(s.cover)}">
                <span class="material-icons">play_arrow</span>
            </div>
            <div class="queue-info">
                <p class="song-name">${s.name}</p>
                <p class="artist-name">${s.artist}</p>
            </div>
        `;
        item.onclick = () => { setMusic(start + i); playAudio(); };
        frag.appendChild(item);
    });
    container.appendChild(frag);
    updateQueueUI();
}

// Overrides for specific song covers where names differ significantly from title
const coverOverrides = {
    'heroes tonight animagus roy remix': 'heroes tonight',
    'abrar’s entry jamal kudu from animal': 'abrars entry  jamal kudu from animal',
    'aadat remix': 'aadat',
    'kyaa baat haii 20 remix': 'kyaa baat haii 20',
    'be intehaan feat aks dj suketu remix': 'be intehaan feat aks',
    'dil diyan gallan lofi mix': 'dil diyan gallan',
    'ramaiya vastavaiya dj chetas mashup remix': 'ramaiya vastavaiya',
    'levitating vs adore you tik tok remix': 'levitating'
};

// Helper to normalize cover paths for 404 avoidance
window.getSongCoverPath = (cover) => {
    // Return a bogus path if no cover, to trigger global 404 handler and dynamic avatar
    if (!cover) return 'assets/images/cover/__missing__.jpg';

    let name = cover.toLowerCase().trim();

    // Check manual overrides first
    if (coverOverrides[name]) {
        return `assets/images/cover/${coverOverrides[name]}.jpg`;
    }

    // Advanced cleanup for disk-matching
    let normalized = name
        .replace(/[’'"]/g, '')
        .replace(/\(remix\)/g, '')
        .replace(/\(kygo remix\)/g, '') // Specific fix
        .replace(/remix/g, '')
        .replace(/lofi mix/g, '')
        .replace(/radio edit/g, '')
        .replace(/\(feat\..*?\)/g, '') // Remove (feat. Artist)
        .replace(/version/g, '')
        .replace(/&/g, '')
        .replace(/-/g, ' ')
        // Remove common words that might not be in filename
        .replace(/\b(x|feat|ft|mix|edit|version|remix)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Secondary Check on normalized name
    if (coverOverrides[normalized]) {
        return `assets/images/cover/${coverOverrides[normalized]}.jpg`;
    }

    return `assets/images/cover/${normalized}.jpg`;
};

// Generic list view renderer
window.renderSongListView = (titleText, songIds, headerImg = 'assets/images/bg.jpg') => {
    const genericView = document.getElementById('genericListView');
    const title = document.getElementById('genericTitle');
    const header = document.getElementById('genericHeader');
    const list = document.getElementById('genericSongsList');

    if (!genericView) return;

    genericView.style.display = 'block';

    const hideSections = ['.hero-banner', '.section-header', '#playlists', '#artists', '.search-results-container', '#artistProfile', '#profileView'];
    hideSections.forEach(sel => document.querySelectorAll(sel).forEach(el => el.style.display = 'none'));

    if (title) title.innerText = titleText;
    if (header) header.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.9)), url(${headerImg})`;

    list.innerHTML = '';
    const filtered = songIds.map(id => songs.find(s => s.id === id)).filter(Boolean);

    if (filtered.length === 0) {
        list.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-secondary);">
            <span class="material-icons" style="font-size:48px; display:block; margin-bottom:10px;">library_music</span>
            No songs here yet.
        </div>`;
    }

    filtered.forEach((s, i) => {
        const row = document.createElement('div');
        row.className = 'song-row';
        row.dataset.index = songs.findIndex(song => song.id === s.id);
        row.innerHTML = `
            <div class="song-number" style="opacity:0.5; font-size:14px;">${i + 1}</div>
            <div class="song-main-info" style="display:flex; align-items:center; gap:12px;">
                <img src="${getSongCoverPath(s.cover)}" class="song-thumb" style="width:40px; height:40px; border-radius:4px;">
                <div class="song-title-text" style="font-weight:700; font-size:15px;">${s.name}</div>
            </div>
            <div class="song-artist-text" style="color:var(--text-secondary); font-size:13px;">${s.artist}</div>
            <div class="song-duration" style="text-align:right; display:flex; align-items:center; justify-content:flex-end; gap:15px;">
                <span class="material-icons more-options" style="font-size:20px; opacity:0.5; cursor:pointer;">more_vert</span>
                <span class="material-icons" style="font-size:18px; color:var(--accent);">play_arrow</span>
            </div>
        `;
        row.onclick = (e) => {
            if (e.target.classList.contains('more-options')) {
                ContextMenu.show(e.clientX, e.clientY, s.id, userData.playlists);
                return;
            }
            playSongById(s.id);
            updateURLWithSongID(s.id);
        };
        list.appendChild(row);
    });

    document.querySelector('.main-view').scrollTo({ top: 0, behavior: 'smooth' });
};

window.setActiveSidebarItem = (btn) => {
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    if (btn) btn.classList.add('active');
};

window.showLikedSongs = (btn) => {
    if (!currentUser) return alert("Please login to see Liked Songs");
    setActiveSidebarItem(btn);
    renderSongListView("Liked Songs", userData.likedSongs, 'assets/images/cover/favorite_bg.jpg');
};

window.showRecentSongs = (btn) => {
    if (!currentUser) return alert("Please login to see Recent Play");
    setActiveSidebarItem(btn);
    renderSongListView("Recent Play", userData.recentPlay, 'assets/images/cover/recent_bg.jpg');
};

window.openArtistProfile = (name, fromRouter = false) => {
    if (!fromRouter) {
        navigate('artist', name);
        return;
    }

    const normalizedName = name.toLowerCase().trim();
    const data = stateManager.getState().artists || [];
    const info = data.find(a => a.title.toLowerCase().includes(normalizedName) || normalizedName.includes(a.title.toLowerCase()));

    const artistSongs = songs.filter(s => {
        const songArtists = s.artist.toLowerCase().split(',').map(a => a.trim());
        return songArtists.some(a =>
            a === normalizedName ||
            a.includes(normalizedName) ||
            normalizedName.includes(a)
        );
    });

    const profile = document.getElementById('artistProfile');
    if (!profile) return;

    profile.style.display = 'block';

    // Fill Header Info
    const title = document.getElementById('artistNameLarge');
    const header = document.getElementById('artistHeader');
    const artistPickCover = document.getElementById('artistPickCover');
    const artistPickName = document.getElementById('artistPickName');

    if (title) title.innerText = info ? info.title : name;

    const headerImg = info ? info.imageSrc : (artistSongs.length > 0 ? getSongCoverPath(artistSongs[0].cover) : 'assets/images/bg.jpg');
    if (header) header.style.backgroundImage = `url(${headerImg})`;

    // Dynamic Artist Pick
    const pickLabel = document.getElementById('artistPickLabel');
    if (artistSongs.length > 0) {
        if (artistPickCover) artistPickCover.src = getSongCoverPath(artistSongs[0].cover);
        if (artistPickName) artistPickName.innerText = artistSongs[0].name;
        if (pickLabel) pickLabel.innerText = "Featured Track";
    }

    // Dynamic Stats (Mocked but variable)
    const statsEl = document.getElementById('artistListenersCount');
    if (statsEl) {
        const base = 500000 + (artistSongs.length * 100000);
        const randomBonus = Math.floor(Math.random() * 99999);
        statsEl.innerText = `${(base + randomBonus).toLocaleString()} monthly listeners`;
    }

    // Render Songs
    const list = document.getElementById('artistSongsList');
    list.innerHTML = '';

    if (artistSongs.length === 0) {
        list.innerHTML = `<div style="padding:40px; text-align:center; opacity:0.5;">No songs found for this artist.</div>`;
    } else {
        artistSongs.forEach((s, i) => {
            const row = document.createElement('div');
            row.className = 'song-row';
            row.innerHTML = `
                <div class="song-number" style="opacity:0.5; font-size:14px;">${i + 1}</div>
                <div class="song-main-info" style="display:flex; align-items:center; gap:12px;">
                    <img src="${getSongCoverPath(s.cover)}" class="song-thumb" style="width:40px; height:40px; border-radius:4px;">
                    <div class="song-title-text" style="font-weight:700; font-size:15px;">${s.name}</div>
                </div>
                <div class="song-artist-text" style="color:var(--text-secondary); font-size:13px;">${s.artist}</div>
                <div class="song-duration" style="text-align:right; display:flex; align-items:center; justify-content:flex-end; gap:15px;">
                    <span class="material-icons more-options" style="font-size:20px; opacity:0.5; cursor:pointer;">more_vert</span>
                    <span class="material-icons" style="font-size:18px; color:var(--accent);">play_arrow</span>
                </div>
            `;
            row.onclick = (e) => {
                if (e.target.classList.contains('more-options')) {
                    ContextMenu.show(e.clientX, e.clientY, s.id, userData.playlists);
                    return;
                }
                playSongById(s.id);
                updateURLWithSongID(s.id);
            };
            list.appendChild(row);
        });
    }

    const tempImg = new Image();
    tempImg.crossOrigin = "Anonymous";
    tempImg.src = headerImg;
    tempImg.onload = () => {
        try {
            const rgb = colorThief.getColor(tempImg);
            updateAtmosphericColor(rgb);
        } catch (e) { console.warn("ColorThief failed for artist:", e); }
    };

    document.querySelector('.main-view').scrollTo({ top: 0, behavior: 'smooth' });
};

window.closeArtistProfile = () => navigate('home');

// Profile View Renderer
window.renderProfileView = () => {
    const nameEl = document.getElementById('profileName');
    const avatarEl = document.getElementById('profileAvatar');
    const plContainer = document.getElementById('profilePlaylists');
    const recentContainer = document.getElementById('profileRecentList');

    // Profile stats elements
    const playlistCountEl = document.getElementById('profilePlaylistCount');
    const likesCountEl = document.getElementById('profileLikesCount');
    const songsPlayedEl = document.getElementById('profileSongsPlayed');

    // Update name
    if (nameEl) nameEl.innerText = currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : 'Guest User';

    // Update avatar from user photo or default
    if (avatarEl && currentUser && currentUser.photoURL) {
        avatarEl.src = currentUser.photoURL;
    }

    // Update dynamic stats
    if (playlistCountEl) playlistCountEl.innerText = userData.playlists ? userData.playlists.length : 0;
    if (likesCountEl) likesCountEl.innerText = userData.likedSongs ? userData.likedSongs.length : 0;
    if (songsPlayedEl) songsPlayedEl.innerText = userData.recentPlay ? userData.recentPlay.length : 0;

    if (plContainer) {
        plContainer.innerHTML = (userData.playlists && userData.playlists.length > 0) ? userData.playlists.map(pl => `
            <div class="card" onclick="navigate('home'); setTimeout(() => showPlaylistView('${pl.id}', null), 100);">
                <div class="img-container">
                    <img src="assets/images/cover/playlist_bg.jpg" alt="${pl.name}">
                    <div class="play-btn"><i class="material-icons">play_arrow</i></div>
                </div>
                <h4>${pl.name}</h4>
                <p>${pl.songs ? pl.songs.length : 0} songs</p>
            </div>
        `).join('') : '<p style="opacity:0.5; padding:20px;">No playlists created yet.</p>';
    }

    if (recentContainer) {
        const recentSongs = userData.recentPlay.map(id => songs.find(s => s.id === id)).filter(Boolean).slice(0, 10);
        recentContainer.innerHTML = recentSongs.length > 0 ? recentSongs.map((s, i) => `
            <div class="song-row" onclick="playSongById('${s.id}')">
                <div class="song-number" style="opacity:0.5; font-size:14px;">${i + 1}</div>
                <div class="song-main-info" style="display:flex; align-items:center; gap:12px;">
                    <img src="${getSongCoverPath(s.cover)}" class="song-thumb" style="width:40px; height:40px; border-radius:4px;">
                    <div class="song-title-text" style="font-weight:700; font-size:15px;">${s.name}</div>
                </div>
                <div class="song-artist-text" style="color:var(--text-secondary); font-size:13px;">${s.artist}</div>
                <div class="song-play-action"><span class="material-icons">play_arrow</span></div>
            </div>
        `).join('') : '<p style="opacity:0.5; padding:20px;">No recent activity.</p>';
    }

    updateAtmosphericColor([30, 30, 30]);
};
// Re-attach close event for integrated button
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('closeArtistBtn');
    if (closeBtn) closeBtn.onclick = window.closeArtistProfile;
});

function initRightSidebar() {
    const list = document.getElementById('recentPlayList');
    if (!list) return;
    list.innerHTML = '';

    // Use Firestore data if available, else fallback to random for non-logged users
    let displaySongs = [];
    if (currentUser && userData.recentPlay.length > 0) {
        displaySongs = userData.recentPlay
            .map(id => songs.find(s => s.id === id))
            .filter(Boolean)
            .slice(0, 5);
    } else {
        displaySongs = songs.slice().sort(() => 0.5 - Math.random()).slice(0, 4);
    }

    displaySongs.forEach(s => {
        const div = document.createElement('div');
        div.className = 'recent-play-item';
        div.dataset.index = songs.findIndex(song => song.id === s.id);
        div.innerHTML = `
            <img src="${getSongCoverPath(s.cover)}" class="recent-thumb">
            <div class="recent-info">
                <div class="recent-title">${s.name}</div>
                <div class="recent-artist">${s.artist}</div>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="material-icons recent-like" onclick="toggleLike('${s.id}', this)">favorite_border</i>
                <i class="material-icons more-options" style="font-size:20px; opacity:0.5;">more_vert</i>
            </div>
        `;
        div.onclick = (e) => {
            if (e.target.classList.contains('recent-like')) return;
            if (e.target.classList.contains('more-options')) {
                ContextMenu.show(e.clientX, e.clientY, s.id, userData.playlists);
                return;
            }
            playSongById(s.id);
            updateURLWithSongID(s.id);
        };
        list.appendChild(div);
    });
    updateLikeIcons();
}

// Add event listener for the full player's more options button
document.addEventListener('DOMContentLoaded', () => {
    const fullMoreBtn = document.getElementById('full-player-more');
    if (fullMoreBtn) {
        fullMoreBtn.onclick = (e) => {
            const songId = songs[currentMusic].id;
            ContextMenu.show(e.clientX, e.clientY, songId, userData.playlists);
        };
    }
});

// Playlist UI Helpers
window.promptCreatePlaylist = () => {
    if (!currentUser) return alert("Please login to create playlists");
    const overlay = document.createElement('div');
    overlay.className = 'prompt-overlay';
    overlay.innerHTML = `
        <div class="prompt-card">
            <h3>New Playlist</h3>
            <input type="text" id="pl-name-input" placeholder="Playlist Name" autofocus>
            <div class="prompt-actions">
                <button class="prompt-btn cancel">Cancel</button>
                <button class="prompt-btn confirm">Create</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('input');
    const confirm = async () => {
        const name = input.value.trim();
        if (name) {
            await FirestoreService.createPlaylist(currentUser.uid, name);
            await refreshUserData();
        }
        overlay.remove();
    };

    overlay.querySelector('.confirm').onclick = confirm;
    overlay.querySelector('.cancel').onclick = () => overlay.remove();
    input.onkeydown = (e) => { if (e.key === 'Enter') confirm(); };
};

window.showPlaylistView = (plId, btn) => {
    const pl = userData.playlists.find(p => p.id === plId);
    if (!pl) return;
    setActiveSidebarItem(btn);
    renderSongListView(pl.name, pl.songs || [], 'assets/images/cover/playlist_bg.jpg');
};

function updatePlaylistsSidebar() {
    const section = document.querySelector('.library-section');
    if (!section) return;

    let plContainer = document.getElementById('sidebar-playlists');
    if (!plContainer) {
        plContainer = document.createElement('div');
        plContainer.id = 'sidebar-playlists';
        plContainer.style.marginTop = '20px';
        plContainer.innerHTML = `
            <div class="library-header" style="display:flex; justify-content:space-between; align-items:center;">
                Playlists
                <span class="material-icons" onclick="promptCreatePlaylist()" style="cursor:pointer; font-size:20px;">add</span>
            </div>
            <ul class="nav-links" id="playlists-nav"></ul>
        `;
        section.appendChild(plContainer);
    }

    const list = document.getElementById('playlists-nav');
    list.innerHTML = userData.playlists.map(pl => `
        <li onclick="showPlaylistView('${pl.id}', this)"><span class="material-icons-sharp">playlist_play</span> ${pl.name}</li>
    `).join('');
}

// Handle Context Menu Actions
document.addEventListener('context-menu-action', async (e) => {
    const { action, songId, plId } = e.detail;
    if (!currentUser && action !== 'share') return alert("Please login for this action");

    switch (action) {
        case 'play-next':
            // Logic to play next (insert into queue right after current)
            const nextIdx = currentMusic + 1;
            const songToMove = songs.find(s => s.id === songId);
            if (songToMove) {
                // In this simplified app, we'd need a dynamic queue manager
                alert("Playing next: " + songToMove.name);
            }
            break;
        case 'add-queue':
            alert("Added to queue: " + songs.find(s => s.id === songId)?.name);
            break;
        case 'add-to-pl':
            await FirestoreService.toggleSongInPlaylist(currentUser.uid, plId, songId, true);
            await refreshUserData();
            break;
        case 'new-playlist':
            promptCreatePlaylist();
            break;
        case 'go-to-artist':
            const targetSong = songs.find(s => s.id === songId);
            if (targetSong) {
                const firstArtist = targetSong.artist.split(',')[0].trim();
                navigate('artist', firstArtist);
            }
            break;
        case 'share':
            alert("Share Link: " + window.location.origin + "/?song=" + songId);
            break;
        case 'like':
            toggleLike(songId);
            break;
    }
});

// ===== Event Listeners & Boot =====
document.addEventListener('DOMContentLoaded', () => {
    initApp();

    // Full Screen Player Toggle
    const miniInfo = document.getElementById('playerMiniInfo');
    const expandedClose = document.getElementById('expandedClose');
    const playerEl = document.getElementById('player');

    if (miniInfo) miniInfo.onclick = () => playerEl.classList.add('maximized');
    if (expandedClose) expandedClose.onclick = () => playerEl.classList.remove('maximized');

    // Desktop Context Menu (Right Click)
    document.addEventListener('contextmenu', (e) => {
        const songCard = e.target.closest('.card, .song-row, .recent-play-item, .queue');
        if (songCard) {
            e.preventDefault();
            let songId = null;
            if (songCard.dataset.index !== undefined) {
                songId = songs[parseInt(songCard.dataset.index)].id;
            } else if (songCard.dataset.id) {
                songId = songCard.dataset.id;
            } else {
                // Fallback for list items that don't have explicit index but have song-title-text
                const title = songCard.querySelector('.song-title-text')?.innerText;
                if (title) {
                    const found = songs.find(s => s.name === title);
                    if (found) songId = found.id;
                }
            }

            if (songId) {
                ContextMenu.show(e.clientX, e.clientY, songId, userData.playlists);
            }
        }
    });
});

// Theme Toggle
window.addEventListener('load', () => {
    const btn = document.getElementById('themeToggle');
    if (btn) {
        if (localStorage.getItem('theme') === 'light') body.classList.add('light-theme');
        btn.onclick = () => {
            body.classList.toggle('light-theme');
            localStorage.setItem('theme', body.classList.contains('light-theme') ? 'light' : 'dark');
            const icon = btn.querySelector('.material-icons');
            if (icon) icon.innerText = body.classList.contains('light-theme') ? 'dark_mode' : 'brightness_6';
        };
    }
});


// Controls
[nextBtn, fullNextBtn].forEach(b => b?.addEventListener('click', () => musicController.next()));
[prevBtn, fullPrevBtn].forEach(b => b?.addEventListener('click', () => musicController.prev()));
[playPauseBtnFull, fullPlayPauseBtn, miniPlayPause].forEach(b => b?.addEventListener('click', () => musicController.toggle()));

// Shortcuts
document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') { e.preventDefault(); musicController.toggle(); }
});

// Hero Banner
const initHeroBanner = () => {
    const banner = document.getElementById('hero-banner');
    const heroBg = document.getElementById('hero-bg');
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const heroBtn = document.getElementById('hero-play-btn');

    if (!banner || !heroBg || typeof songs === 'undefined') return;

    // Pick a random song for "Recent Hits" from the entire library
    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    if (!randomSong) return;

    heroTitle.innerHTML = `${randomSong.name} <span>Hits</span>`;
    heroSubtitle.innerText = `Featuring ${randomSong.artist}. Listen to the latest trending tracks across the globe.`;
    heroBg.src = getSongCoverPath(randomSong.cover);
    heroBg.dataset.src = getSongCoverPath(randomSong.cover);

    heroBtn.onclick = () => {
        playSongById(randomSong.id);
        updateURLWithSongID(randomSong.id);
    };

    // Sync Background Color with ColorThief
    heroBg.onload = () => {
        try {
            const rgb = colorThief.getColor(heroBg);
            const rgbStr = `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`;
            const mainColor = `rgb(${rgbStr})`;

            // Update Banner
            banner.style.backgroundColor = mainColor;
            banner.style.boxShadow = `0 20px 60px rgba(${rgbStr}, 0.6)`;
            updateAtmosphericColor(rgb);

        } catch (e) {
            console.warn("ColorThief failed for hero:", e);
        }
    };

    // Fallback if cached
    if (heroBg.complete) heroBg.onload();
};

// Standardized search logic
window.search = () => {
    const input = document.querySelector('.search-input-container input');
    const query = input.value.toLowerCase().trim();
    const container = document.getElementById('scrollDiv2');

    if (!container) return;

    // Auto-navigate to home if we are searching from elsewhere
    if (query && window.location.hash !== '#home' && window.location.hash !== '') {
        navigate('home');
    }

    if (!query) {
        container.style.display = 'none';
        ['playlists', 'artists', 'hero-banner'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = '';
        });
        return;
    }

    // Hide standard sections when searching
    ['playlists', 'artists', 'hero-banner'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    container.style.display = 'grid';
    container.innerHTML = '';

    // Restore or Create Search Header
    let header = document.getElementById('searchHeader');
    if (header) {
        header.style.display = 'block';
        container.appendChild(header);
    }

    const results = songs.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.artist.toLowerCase().includes(query)
    ).slice(0, 20);

    if (results.length === 0) {
        container.innerHTML = '<p style="padding: 20px; opacity: 0.5;">No results found.</p>';
        return;
    }

    results.forEach(song => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = songs.findIndex(s => s.id === song.id);
        card.innerHTML = `
            <div class="img-container">
                <img src="${getSongCoverPath(song.cover)}" loading="lazy" alt="${song.name}">
                <div class="play-btn"><i class="material-icons">play_arrow</i></div>
            </div>
            <h4>${song.name}</h4>
            <p>${song.artist}</p>
        `;
        card.onclick = () => { playSongById(song.id); updateURLWithSongID(song.id); };
        container.appendChild(card);
    });
    lazyLoadImages(container);
};

// Shared helper for updating sidebar/navbar colors
window.updateAtmosphericColor = (rgb) => {
    const rgbStr = `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`;
    const mainColor = `rgb(${rgbStr})`;

    document.documentElement.style.setProperty('--vibe-color', mainColor);
    document.documentElement.style.setProperty('--vibe-color-rgb', rgbStr);

    // Standardized Vibrant Radial Spotlight (SIDEBARS) - CRANKED UP
    const sidebarGradient = `radial-gradient(circle at 12% 15%, rgba(${rgbStr}, 0.6) 0%, rgba(${rgbStr}, 0.2) 45%, var(--bg-sidebar) 85%)`;

    // Seamless Navbar Flow - CRANKED UP
    const navbarGradient = `linear-gradient(to right, rgba(${rgbStr}, 0.45), transparent 20%, transparent 80%, rgba(${rgbStr}, 0.45))`;

    document.querySelectorAll('.sidebar, .right-sidebar').forEach(sb => {
        sb.style.background = sidebarGradient;
    });

    const topBar = document.querySelector('.top-bar');
    if (topBar) topBar.style.background = navbarGradient;
};

// Scroll-based color sync - detects visible cards and syncs UI colors
let lastScrollColorUpdate = 0;
function syncColorsOnScroll() {
    const now = Date.now();
    if (now - lastScrollColorUpdate < 300) return; // Throttle to every 300ms
    lastScrollColorUpdate = now;

    const mainView = document.querySelector('.main-view');
    if (!mainView) return;

    const viewportTop = mainView.scrollTop;
    const viewportBottom = viewportTop + mainView.clientHeight;

    // Find all images in visible cards
    const allCards = mainView.querySelectorAll('.card img, .artist-card img, .hero-banner img, .artist-header-img img');
    let visibleImages = [];

    allCards.forEach(img => {
        if (!img.complete || !img.naturalHeight) return;
        const rect = img.getBoundingClientRect();
        const mainRect = mainView.getBoundingClientRect();

        // Check if image is in viewport
        if (rect.top < mainRect.bottom && rect.bottom > mainRect.top) {
            visibleImages.push({
                img,
                visibility: Math.min(rect.bottom, mainRect.bottom) - Math.max(rect.top, mainRect.top)
            });
        }
    });

    // Sort by visibility (most visible first)
    visibleImages.sort((a, b) => b.visibility - a.visibility);

    // Get color from most visible image
    if (visibleImages.length > 0 && typeof ColorThief !== 'undefined') {
        try {
            const img = visibleImages[0].img;
            const palette = colorThief.getPalette(img, 5);
            if (palette && palette.length > 0) {
                // Find most saturated color
                let best = palette[0];
                let maxSat = 0;
                palette.forEach(c => {
                    const sat = (Math.max(...c) - Math.min(...c)) / Math.max(...c);
                    if (sat > maxSat) { maxSat = sat; best = c; }
                });
                // Boost color
                const boosted = best.map(c => Math.min(255, Math.round(c * 1.3)));
                updateAtmosphericColor(boosted);
            }
        } catch (e) { /* ignore color extraction errors */ }
    }
}

// Attach scroll listener to main-view
document.addEventListener('DOMContentLoaded', () => {
    const mainView = document.querySelector('.main-view');
    if (mainView) {
        mainView.addEventListener('scroll', syncColorsOnScroll, { passive: true });
        // Initial sync
        setTimeout(syncColorsOnScroll, 500);
    }
});

// Re-sync colors when navigating to new views
const originalNavigate = window.navigate;
if (typeof originalNavigate === 'function') {
    window.navigate = function (...args) {
        const result = originalNavigate.apply(this, args);
        setTimeout(syncColorsOnScroll, 300);
        return result;
    };
}


// Toggles the cinematic listening mode
window.togglePlayerMaximized = (forceClose = false) => {
    const body = document.body;
    const isCurrentlyMaximized = body.classList.contains('listening-mode');

    if (forceClose || isCurrentlyMaximized) {
        body.classList.remove('listening-mode');
        // If we have a router, we might want to stay on current view or return to home
    } else {
        body.classList.add('listening-mode');
        updateVibrantBackground();
    }
};

// Logic to extract "vibe" color from current song cover
async function updateVibrantBackground() {
    const coverImg = document.getElementById('expandedCover');
    if (!coverImg || !coverImg.src) return;

    // Use a temporary canvas to get dominant color
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = coverImg.src;

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Sampling a few pixels for a "vibe" color (Simplified dominant color)
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0, count = 0;

        for (let i = 0; i < data.length; i += 4000) { // Sparse sampling
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
        }

        const avgR = Math.floor(r / count);
        const avgG = Math.floor(g / count);
        const avgB = Math.floor(b / count);

        // Boost vibrancy for the "vibe" (Crank up colors)
        const boost = (c, factor = 1.5) => Math.min(255, Math.floor(c * factor));
        const vibeColor = `rgb(${boost(avgR)}, ${boost(avgG)}, ${boost(avgB)})`;
        const darkVibe = `rgb(${boost(avgR, 0.4)}, ${boost(avgG, 0.4)}, ${boost(avgB, 0.4)})`;

        document.documentElement.style.setProperty('--vibe-color', vibeColor);
        document.documentElement.style.setProperty('--vibe-color-dark', darkVibe);
    };
}

// Bind events for maximizing
document.querySelector('.player-mini-info')?.addEventListener('click', () => togglePlayerMaximized());
document.getElementById('expandedClose')?.addEventListener('click', () => togglePlayerMaximized(true));

// Download button functionality
const downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        if (songs && songs[currentMusic]) {
            const song = songs[currentMusic];
            const link = document.createElement('a');
            link.href = `assets/songs/${song.path}.mp3`;
            link.download = `${song.name} - ${song.artist}.mp3`;
            link.click();
        }
    });
}

// Playback Mode Cycling Button
let playbackModeState = 'normal'; // normal, shuffle, repeat-one, repeat-all
const playbackModeIcons = {
    'normal': 'playlist_play',
    'shuffle': 'shuffle',
    'repeat-one': 'repeat_one',
    'repeat-all': 'repeat'
};

// Initialize shuffle and repeat button cycling
if (fullShuffleBtn) {
    fullShuffleBtn.addEventListener('click', () => {
        playbackModeState = playbackModeState === 'normal' ? 'shuffle' : 'normal';
        updatePlaybackModeUI();
    });
}

if (fullRepeatBtn) {
    fullRepeatBtn.addEventListener('click', () => {
        if (playbackModeState === 'normal' || playbackModeState === 'shuffle') {
            playbackModeState = 'repeat-all';
        } else if (playbackModeState === 'repeat-all') {
            playbackModeState = 'repeat-one';
        } else {
            playbackModeState = 'normal';
        }
        updatePlaybackModeUI();
    });
}

function updatePlaybackModeUI() {
    const shuffleIcon = fullShuffleBtn?.querySelector('.material-icons');
    const repeatIcon = fullRepeatBtn?.querySelector('.material-icons');

    // Update shuffle button
    if (shuffleIcon) {
        fullShuffleBtn.classList.toggle('active', playbackModeState === 'shuffle');
        fullShuffleBtn.style.opacity = playbackModeState === 'shuffle' ? '1' : '0.5';
    }

    // Update repeat button
    if (repeatIcon) {
        const isRepeat = playbackModeState === 'repeat-one' || playbackModeState === 'repeat-all';
        repeatIcon.textContent = playbackModeState === 'repeat-one' ? 'repeat_one' : 'repeat';
        fullRepeatBtn.classList.toggle('active', isRepeat);
        fullRepeatBtn.style.opacity = isRepeat ? '1' : '0.5';
    }

    // Update state manager
    if (playbackModeState === 'shuffle') {
        window.musicController?.stateManager.setState({ repeatMode: 'shuffle' });
    } else if (playbackModeState === 'repeat-one') {
        window.musicController?.stateManager.setState({ repeatMode: 'one' });
    } else if (playbackModeState === 'repeat-all') {
        window.musicController?.stateManager.setState({ repeatMode: 'all' });
    } else {
        window.musicController?.stateManager.setState({ repeatMode: 'off' });
    }
}

// Initialize
window.router = new Router();

document.addEventListener('DOMContentLoaded', () => {
    initHeroBanner();
});

// Equalizer (Simple stub for interaction)
const eqToggle = document.getElementById('equalizer-toggle');
if (eqToggle) eqToggle.onclick = () => document.querySelector('.equalizer-panel')?.classList.toggle('active');
document.querySelector('.eq-close')?.addEventListener('click', () => document.querySelector('.equalizer-panel')?.classList.remove('active'));

// Wire up full player controls
if (fullPrevBtn) fullPrevBtn.addEventListener('click', () => window.musicController?.prev());
if (fullNextBtn) fullNextBtn.addEventListener('click', () => window.musicController?.next());
if (fullPlayPauseBtn) {
    fullPlayPauseBtn.addEventListener('click', () => window.musicController?.toggle());
}
const queueBtnFull = document.getElementById('queueBtnFull');
const shareBtnFull = document.getElementById('shareBtnFull');
if (queueBtnFull) {
    queueBtnFull.addEventListener('click', () => document.querySelector('.playlists').classList.add('active'));
}
if (shareBtnFull) {
    shareBtnFull.addEventListener('click', () => {
        if (songs && songs[currentMusic]) {
            const song = songs[currentMusic];
            alert(`Share: ${song.name} by ${song.artist}`);
        }
    });
}

// Handle text overflow with marquee animation
function setupTextMarquee() {
    // Comprehensive selector list for all potentially overflowing text
    const selectors = [
        '.card h4:not(.wrapped)',
        '.card p:not(.wrapped)',
        '.player-mini-view .song-name',
        '.player-mini-view .artist-name',
        '#miniSongName',
        '#miniArtistName',
        '.mini-song-text',
        '.mini-artist-text',
        '.info-block h2',
        '.info-block p',
        '.song-item .song-name:not(.wrapped)',
        '.artist-song-item .song-name:not(.wrapped)',
        '.queue-info p:not(.wrapped)',
        '.song-title-text:not(.wrapped)',
        '.song-artist-text:not(.wrapped)',
        '.recent-title:not(.wrapped)',
        '.recent-artist:not(.wrapped)',
        '.browse-card h3:not(.wrapped)',
        '.library-card h3:not(.wrapped)'
    ];

    document.querySelectorAll(selectors.join(', ')).forEach(el => {
        // Force unwrap if needed to re-measure? No, just check overflow
        // But we rely on 'wrapped' class to avoid double wrapping.

        const text = el.textContent.trim();
        if (text) {
            // Check if it overflows parent
            const isOverflowing = el.scrollWidth > el.clientWidth;

            if (isOverflowing) {
                if (!el.classList.contains('wrapped')) {
                    el.innerHTML = `<span>${text}</span>`;
                    el.classList.add('wrapped');
                }
                el.classList.add('overflow');
            } else {
                el.classList.remove('overflow');
                // Optional: remove wrapping if it no longer overflows?
                // Keeping it is fine, just remove .overflow class calls off animation
            }
        }
    });
}

// Setup on load and navigation
setTimeout(setupTextMarquee, 500);
setTimeout(setupTextMarquee, 1500); // Second pass for late-loading content

// Function to update atmospheric color
window.updateAtmosphericColor = (rgb) => {
    if (!rgb) return;
    const rgbStr = `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`;
    const mainColor = `rgb(${rgbStr})`;

    document.documentElement.style.setProperty('--vibe-color', mainColor);
    document.documentElement.style.setProperty('--vibe-color-rgb', rgbStr);

    const sidebarGradient = `radial-gradient(circle at 12% 15%, rgba(${rgbStr}, 0.6) 0%, rgba(${rgbStr}, 0.2) 45%, var(--bg-sidebar) 85%)`;
    const navbarGradient = `linear-gradient(to right, rgba(${rgbStr}, 0.45), transparent 20%, transparent 80%, rgba(${rgbStr}, 0.45))`;

    document.querySelectorAll('.sidebar, .right-sidebar').forEach(sb => {
        sb.style.background = sidebarGradient;
    });

    const topBar = document.querySelector('.top-bar');
    if (topBar) topBar.style.background = navbarGradient;
};

// Scroll Sync Logic
let lastSyncTime = 0;
window.syncColorsOnScroll = function () {
    const now = Date.now();
    if (now - lastSyncTime < 100) return; // Throttle
    lastSyncTime = now;

    const mainView = document.querySelector('.main-view');
    if (!mainView) return;

    const viewRect = mainView.getBoundingClientRect();
    const allCards = mainView.querySelectorAll('.card img, .artist-card img, .hero-banner img, .artist-header-img img');

    let visibleImages = [];
    allCards.forEach(img => {
        const rect = img.getBoundingClientRect();
        if (rect.top >= viewRect.top && rect.bottom <= viewRect.bottom && rect.width > 0) {
            visibleImages.push(img);
        }
    });

    if (visibleImages.length > 0) {
        // Pick the first one
        const target = visibleImages[0];
        // Ensure image is loaded
        if (target.complete && target.naturalWidth > 0 && typeof ColorThief !== 'undefined') {
            try {
                const colorThief = new ColorThief();
                const color = colorThief.getColor(target);
                updateAtmosphericColor(color);
            } catch (e) { }
        }
    }
}

const mainViewEl = document.querySelector('.main-view');
if (mainViewEl) {
    // Run marquee setup and color sync when mutations occur
    const marqueeObserver = new MutationObserver(() => {
        setTimeout(setupTextMarquee, 100);
        setTimeout(syncColorsOnScroll, 150);
    });
    marqueeObserver.observe(mainViewEl, { childList: true, subtree: true });

    // Attach Scroll Listener for Vibrancy
    mainViewEl.addEventListener('scroll', syncColorsOnScroll);
}

// Global Image Error Handling
window.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        if (!e.target.dataset.errorHandled) {
            e.target.dataset.errorHandled = true;

            // Generate Dynamic Initials Avatar
            const alt = e.target.getAttribute('alt') || 'M';
            const initial = alt.charAt(0).toUpperCase();
            const colors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#009688', '#FF5722', '#795548', '#607D8B'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <rect width="100" height="100" fill="${color}"/>
                <text x="50" y="55" font-family="sans-serif" font-weight="bold" font-size="50" fill="rgba(255,255,255,0.9)" text-anchor="middle" dominant-baseline="middle">${initial}</text>
            </svg>`;

            e.target.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
            e.target.style.objectFit = 'cover';
        }
    }
}, true);

// Re-run on song change for mini player
setInterval(setupTextMarquee, 3000); // Check every 3 seconds for new content

// ===== NEW View Logic =====
window.renderAllSongsView = (page = 1) => {
    document.querySelectorAll('.main-view > div').forEach(d => d.style.display = 'none');
    const view = document.getElementById('genericListView');
    const list = document.getElementById('genericSongsList');
    const title = document.getElementById('genericTitle');
    const header = document.getElementById('genericHeader');
    if (!view || !list) return;

    view.style.display = 'block';

    // Force block display for song list (resetting grid if used by artists)
    list.style.display = 'block';

    if (page === 1) {
        title.innerHTML = 'All Songs <span style="font-size:16px; opacity:0.6; font-weight:400;">(Top 50)</span>';
        list.innerHTML = '';
        header.style.background = 'linear-gradient(135deg, var(--accent) 0%, #000 100%)';
    }

    const itemsPerPage = 50;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const sliced = songs.slice(start, end);

    sliced.forEach((song, i) => {
        const row = document.createElement('div');
        const isLiked = userData.likedSongs && userData.likedSongs.includes(song.id);
        row.innerHTML = `
           <div class="song-list-item" style="display:flex; align-items:center; gap:16px; padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); cursor:pointer; transition:background 0.2s;">
                <div style="color:#aaa; width:30px; text-align:center;">${start + i + 1}</div>
                <img src="${getSongCoverPath(song.cover)}" loading="lazy" style="width:48px; height:48px; border-radius:4px; object-fit:cover;">
                <div style="flex:1; overflow:hidden;">
                    <div style="font-weight:600; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#fff;">${song.name}</div>
                    <div style="font-size:13px; color:#aaa; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">${song.artist}</div>
                </div>
                <button class="add-btn ${isLiked ? 'liked' : ''}" style="background:transparent; border:none; transition:transform 0.2s;">
                     <span class="material-icons" style="color:${isLiked ? '#e91e63' : '#aaa'}; font-size:20px;">${isLiked ? 'favorite' : 'favorite_border'}</span>
                </button>
           </div>
        `;
        row.onmouseover = () => row.children[0].style.background = 'rgba(255,255,255,0.05)';
        row.onmouseout = () => row.children[0].style.background = 'transparent';

        row.onclick = (e) => {
            if (e.target.closest('.add-btn')) {
                e.stopPropagation();
                window.toggleLikeSong(song.id);
                const btn = row.querySelector('.add-btn');
                const nowLiked = userData.likedSongs.includes(song.id);
                const icon = btn.querySelector('span');
                icon.textContent = nowLiked ? 'favorite' : 'favorite_border';
                icon.style.color = nowLiked ? '#e91e63' : '#aaa';
                return;
            }
            playSongById(song.id);
        };
        list.appendChild(row);
    });

    const oldBtn = document.getElementById('loadMoreSongsBtn');
    if (oldBtn) oldBtn.remove();
    if (end < songs.length) {
        const btn = document.createElement('button');
        btn.id = 'loadMoreSongsBtn';
        btn.textContent = 'Load More';
        btn.style.cssText = 'display:block; margin:30px auto; padding:12px 30px; background:var(--accent); color:#fff; border:none; border-radius:30px; font-weight:700; cursor:pointer; transition:transform 0.2s;';
        btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
        btn.onmouseout = () => btn.style.transform = 'scale(1)';
        btn.onclick = () => window.renderAllSongsView(page + 1);
        list.appendChild(btn);
    }
};

window.renderAllArtistsView = (page = 1) => {
    document.querySelectorAll('.main-view > div').forEach(d => d.style.display = 'none');
    const view = document.getElementById('genericListView');
    const list = document.getElementById('genericSongsList'); // reusing container
    const title = document.getElementById('genericTitle');
    const header = document.getElementById('genericHeader');
    if (!view || !list) return;

    view.style.display = 'block';
    if (page === 1) {
        title.textContent = 'All Artists';
        list.innerHTML = '';
        header.style.background = 'linear-gradient(135deg, #FF5722 0%, #000 100%)';
        // Grid layout for artists
        list.style.display = 'grid';
        list.style.gridTemplateColumns = 'repeat(auto-fill, minmax(160px, 1fr))';
        list.style.gap = '20px';
        list.style.padding = '20px 0';
    } else {
        list.style.display = 'grid'; // Ensure grid persists
    }

    // Extract Artists Dynamic
    const allArtists = new Map();
    songs.forEach(s => {
        const parts = s.artist.split(',').map(a => a.trim());
        parts.forEach(a => {
            if (!allArtists.has(a)) {
                allArtists.set(a, { name: a, image: s.cover });
            }
        });
    });
    const artistArray = Array.from(allArtists.values());

    const itemsPerPage = 50; // Updated to 50
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const sliced = artistArray.slice(start, end);

    sliced.forEach(art => {
        const card = document.createElement('div');
        card.className = 'artist-card'; // Reuse style
        card.style.background = 'var(--bg-card)';
        card.style.padding = '16px';
        card.style.borderRadius = '8px';
        card.style.cursor = 'pointer';
        card.style.transition = 'background 0.2s';
        card.onmouseover = () => card.style.background = 'var(--bg-card-hover)';
        card.onmouseout = () => card.style.background = 'var(--bg-card)';

        // Fix Followed State Logic if needed
        const isFollowed = userData.followedArtists && userData.followedArtists.includes(art.name);

        card.innerHTML = `
            <div style="width:100%; aspect-ratio:1; border-radius:50%; overflow:hidden; margin-bottom:12px; border:2px solid rgba(255,255,255,0.1);">
                <img src="${getSongCoverPath(art.image)}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <h4 style="text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:4px;">${art.name}</h4>
            <p style="text-align:center; font-size:12px; opacity:0.7;">Artist</p>
         `;
        card.onclick = () => window.openArtistProfile(art.name);
        list.appendChild(card);
    });

    const oldBtn = document.getElementById('loadMoreArtsBtn');
    if (oldBtn) oldBtn.remove();
    if (end < artistArray.length) {
        const btn = document.createElement('button');
        btn.id = 'loadMoreArtsBtn';
        btn.textContent = 'Load More Artists';
        btn.style.cssText = 'grid-column: 1 / -1; display:block; margin:30px auto; padding:12px 30px; background:var(--accent); color:#fff; border:none; border-radius:30px; font-weight:700; cursor:pointer; width:fit-content;';
        btn.onclick = () => window.renderAllArtistsView(page + 1);
        list.appendChild(btn);
    }
};

// Sidebar Dropdown Toggle
window.toggleDropdown = (el) => {
    const list = el.nextElementSibling;
    if (list) {
        if (list.style.display === 'none') {
            list.style.display = 'block';
            const arrow = el.querySelector('.dropdown-arrow');
            if (arrow) arrow.innerText = 'expand_less';
        } else {
            list.style.display = 'none';
            const arrow = el.querySelector('.dropdown-arrow');
            if (arrow) arrow.innerText = 'expand_more';
        }
    }
}

// Render Followed Artists in Sidebar
window.renderFollowedArtists = () => {
    const list = document.getElementById('followedArtistsContainer');
    if (!list) return;

    const followed = userData.followedArtists || [];
    if (followed.length === 0) {
        list.innerHTML = '<p style="font-size: 12px; opacity: 0.5; padding: 8px 16px;">No artists followed yet</p>';
        return;
    }

    const allArtists = stateManager.getState().artists || [];

    list.innerHTML = '';
    followed.forEach(name => {
        const found = allArtists.find(a => a.title === name);
        const img = found ? found.imageSrc : '';

        const div = document.createElement('div');
        div.className = 'followed-artist-item';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.style.gap = '10px';
        div.style.padding = '8px 16px';
        div.style.cursor = 'pointer';
        div.style.transition = 'background 0.2s';
        div.style.borderRadius = '4px';
        div.onmouseover = () => div.style.background = 'var(--bg-card-hover)';
        div.onmouseout = () => div.style.background = 'transparent';

        div.innerHTML = `
            <img src="${getSongCoverPath(img)}" style="width:32px; height:32px; border-radius:50%; object-fit:cover;">
            <span style="font-size:13px; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--text-primary);">${name}</span>
        `;
        div.onclick = () => window.openArtistProfile(name);
        list.appendChild(div);
    });
};

// Global View Functions for Library
window.showLikedSongs = () => {
    if (window.router) window.router.hideAllSections();
    const view = document.getElementById('genericListView');
    const list = document.getElementById('genericSongsList');
    const title = document.getElementById('genericTitle');
    const header = document.getElementById('genericHeader');
    if (!view || !list) return;

    view.style.display = 'block';

    // Force block display
    list.style.display = 'block';
    list.style.gridTemplateColumns = 'none'; // reset grid if set
    list.style.padding = '0'; // reset padding

    title.innerText = 'Liked Songs';
    list.innerHTML = '';
    header.style.background = 'linear-gradient(135deg, #e91e63 0%, #000 100%)';

    const likedIds = userData.likedSongs || [];
    if (likedIds.length === 0) {
        list.innerHTML = '<p style="opacity:0.5; padding:20px;">No liked songs yet.</p>';
        return;
    }

    // Render songs
    likedIds.forEach((id, i) => {
        const song = songs.find(s => s.id === id);
        if (!song) return;

        const row = document.createElement('div');
        row.innerHTML = `
           <div class="song-list-item" style="display:flex; align-items:center; gap:16px; padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); cursor:pointer; transition:background 0.2s;">
                <div style="color:#aaa; width:30px; text-align:center;">${i + 1}</div>
                <img src="${getSongCoverPath(song.cover)}" loading="lazy" style="width:48px; height:48px; border-radius:4px; object-fit:cover;">
                <div style="flex:1; overflow:hidden;">
                    <div style="font-weight:600; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#fff;">${song.name}</div>
                    <div style="font-size:13px; color:#aaa; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">${song.artist}</div>
                </div>
                <button class="add-btn liked" style="background:transparent; border:none; cursor:pointer;">
                     <span class="material-icons" style="color:#e91e63; font-size:20px;">favorite</span>
                </button>
           </div>
        `;
        row.onclick = (e) => {
            if (e.target.closest('.add-btn')) {
                e.stopPropagation();
                window.toggleLikeSong(song.id);
                row.remove(); // Remove immediately
                return;
            }
            playSongById(song.id);
        }
        list.appendChild(row);
    });
};

window.showRecentSongs = () => {
    if (window.router) window.router.hideAllSections();
    const view = document.getElementById('genericListView');
    const list = document.getElementById('genericSongsList');
    const title = document.getElementById('genericTitle');
    const header = document.getElementById('genericHeader');
    if (!view || !list) return;

    view.style.display = 'block';

    // Force block display
    list.style.display = 'block';
    list.style.gridTemplateColumns = 'none';

    title.innerText = 'Recently Played';
    list.innerHTML = '';
    header.style.background = 'linear-gradient(135deg, #ff6b35 0%, #000 100%)';

    const recentIds = userData.recentPlay || [];
    if (recentIds.length === 0) {
        list.innerHTML = '<p style="opacity:0.5; padding:20px;">No recent history.</p>';
        return;
    }

    recentIds.forEach((id, i) => {
        const song = songs.find(s => s.id === id);
        if (!song) return;

        const isLiked = userData.likedSongs && userData.likedSongs.includes(song.id);
        const row = document.createElement('div');
        row.innerHTML = `
           <div class="song-list-item" style="display:flex; align-items:center; gap:16px; padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); cursor:pointer; transition:background 0.2s;">
                <div style="color:#aaa; width:30px; text-align:center;">${i + 1}</div>
                <img src="${getSongCoverPath(song.cover)}" loading="lazy" style="width:48px; height:48px; border-radius:4px; object-fit:cover;">
                <div style="flex:1; overflow:hidden;">
                    <div style="font-weight:600; font-size:15px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#fff;">${song.name}</div>
                    <div style="font-size:13px; color:#aaa; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">${song.artist}</div>
                </div>
                <button class="add-btn ${isLiked ? 'liked' : ''}" style="background:transparent; border:none; cursor:pointer;">
                     <span class="material-icons" style="color:${isLiked ? '#e91e63' : '#aaa'}; font-size:20px;">${isLiked ? 'favorite' : 'favorite_border'}</span>
                </button>
           </div>
        `;
        row.onclick = (e) => {
            if (e.target.closest('.add-btn')) {
                e.stopPropagation();
                window.toggleLikeSong(song.id);
                const btn = row.querySelector('.add-btn');
                const nowLiked = userData.likedSongs.includes(song.id);
                const icon = btn.querySelector('span');
                icon.textContent = nowLiked ? 'favorite' : 'favorite_border';
                icon.style.color = nowLiked ? '#e91e63' : '#aaa';
                return;
            }
            playSongById(song.id);
        }
        list.appendChild(row);
    });
};
