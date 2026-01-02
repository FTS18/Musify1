import { songs } from '../services/data.js';
import { getSongCoverPath, updateURLWithSongID } from '../utils/helpers.js';
import { stateManager } from '../services/state.js';
import { userData, toggleLike, currentUser, toggleFollowArtist } from '../services/auth.js';
import { ContextMenu } from '../components/context-menu.js';
import { hideAllViews } from './common.js';

export const openArtistProfile = (name, fromRouter = false) => {
    if (!fromRouter) {
        window.navigate('artist', name);
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

    hideAllViews();
    profile.style.display = 'block';

    // Fill Header Info
    const title = document.getElementById('artistNameLarge');
    const header = document.getElementById('artistHeader');
    const artistPickCover = document.getElementById('artistPickCover');
    const artistPickName = document.getElementById('artistPickName');

    // Follow Button in Header (New)
    let followBtn = document.getElementById('artistFollowBtnHeader');
    if (!followBtn) {
        // Create if missing or just update existing if implementation changes
        // Assuming HTML has it or we append it? For now, standard HTML structure.
    }

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

    // Dynamic Stats
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
                window.playSongById(s.id);
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
            // Check if global ColorThief exists
            if (window.ColorThief) {
                const colorThief = new ColorThief();
                const rgb = colorThief.getColor(tempImg);
                // Assuming updateAtmosphericColor is global or we dispatch custom event
                // For now, let's try to set it directly
                const mainView = document.querySelector('.main-view');
                if (mainView) mainView.style.setProperty('--vibe-color', `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.5)`);
            }
        } catch (e) { console.warn("ColorThief failed for artist:", e); }
    };

    document.querySelector('.main-view').scrollTo({ top: 0, behavior: 'smooth' });
};

export const closeArtistProfile = () => window.navigate('home');
