import { currentUser, userData } from '../services/auth.js';
import { songs } from '../services/data.js';
import { getSongCoverPath, updateURLWithSongID } from '../utils/helpers.js';
import { showPlaylistView, hideAllViews } from './common.js';

export const renderProfileView = () => {
    const profileView = document.getElementById('profileView');
    if (!profileView) return;

    // Reset others
    hideAllViews();
    profileView.style.display = 'block';

    const nameEl = document.getElementById('profileName');
    const avatarEl = document.getElementById('profileAvatar');
    const plContainer = document.getElementById('profilePlaylists');
    const recentContainer = document.getElementById('profileRecentList');

    const playlistCountEl = document.getElementById('profilePlaylistCount');
    const likesCountEl = document.getElementById('profileLikesCount');
    const songsPlayedEl = document.getElementById('profileSongsPlayed');

    if (nameEl) nameEl.innerText = currentUser ? (currentUser.displayName || currentUser.email.split('@')[0]) : 'Guest User';

    if (avatarEl && currentUser && currentUser.photoURL) {
        avatarEl.src = currentUser.photoURL;
    }

    if (playlistCountEl) playlistCountEl.innerText = userData.playlists ? userData.playlists.length : 0;
    if (likesCountEl) likesCountEl.innerText = userData.likedSongs ? userData.likedSongs.length : 0;
    if (songsPlayedEl) songsPlayedEl.innerText = userData.recentPlay ? userData.recentPlay.length : 0;

    if (plContainer) {
        plContainer.innerHTML = (userData.playlists && userData.playlists.length > 0) ? userData.playlists.map(pl => `
            <div class="card" onclick="window.navigate('home'); setTimeout(() => window.showPlaylistView('${pl.id}', null), 100);">
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
            <div class="song-row" onclick="window.playSongById('${s.id}')">
                <div class="song-number" style="opacity:0.5; font-size:14px;">${i + 1}</div>
                <div class="song-main-info" style="display:flex; align-items:center; gap:12px;">
                    <img src="${getSongCoverPath(s.cover)}" class="song-thumb" style="width:40px; height:40px; border-radius:4px;">
                    <div class="song-title-text" style="font-weight:700; font-size:15px;">${s.name}</div>
                </div>
                <div class="song-artist-text" style="color:var(--text-secondary); font-size:13px;">${s.artist}</div>
                <div class="song-play-action"><span class="material-icons">play_arrow</span></div>
            </div>
        `).join('') : '<p style="opacity:0.5; padding:20px;">No recent activity.</p>';

        recentContainer.querySelectorAll('.song-row').forEach((row, i) => {
            // Add onclick manually if template literal event handler has issues
            // But playSongById is global
        });
    }

    // Reset background vibe
    const mainView = document.querySelector('.main-view');
    if (mainView) mainView.style.setProperty('--vibe-color', 'rgba(18, 18, 18, 0)');
};
