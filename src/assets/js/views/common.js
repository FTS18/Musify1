import { songs } from '../services/data.js';
import { getSongCoverPath, updateURLWithSongID } from '../utils/helpers.js';
import { userData, currentUser, toggleLike } from '../services/auth.js';
import { ContextMenu } from '../components/context-menu.js';

export const hideAllViews = () => {
    // Hide all potential view elements
    const selectors = [
        '.hero-banner',
        '.section-header',
        '#playlists',
        '#artists',
        '.search-results-container',
        '#artistProfile',
        '#profileView',
        '#genericListView',
        '#libraryView',
        '#searchView'
    ];
    const els = document.querySelectorAll(selectors.join(', '));
    els.forEach(el => el.style.display = 'none');

    // Ensure parent is visible
    const content = document.querySelector('.content-padding');
    if (content) content.style.display = '';
};

export const renderSongListView = (titleText, songIds, headerImg = 'assets/images/bg.jpg') => {
    hideAllViews();
    const genericView = document.getElementById('genericListView');
    const title = document.getElementById('genericTitle');
    const header = document.getElementById('genericHeader');
    const list = document.getElementById('genericSongsList');

    if (!genericView) return;

    genericView.style.display = 'block';

    if (title) title.innerText = titleText;
    if (header) header.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.9)), url(${headerImg})`;

    list.innerHTML = '';
    // Filter valid songs
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
            window.playSongById(s.id);
            updateURLWithSongID(s.id);
        };
        list.appendChild(row);
    });

    document.querySelector('.main-view').scrollTo({ top: 0, behavior: 'smooth' });
};

export const showPlaylistView = (plId) => {
    const pl = userData.playlists.find(p => p.id === plId);
    if (!pl) return;
    renderSongListView(pl.name, pl.songs || [], 'assets/images/cover/playlist_bg.jpg');
};
