import { userData, currentUser, toggleLike, refreshUserData } from '../services/auth.js';
import { songs } from '../services/data.js';
import { FirestoreService } from '../services/db.js';
import { getSongCoverPath, updateURLWithSongID } from '../utils/helpers.js';
import { ContextMenu } from './context-menu.js';
import { showPlaylistView } from '../views/common.js';

export const initRightSidebar = () => {
    const list = document.getElementById('recentPlayList');
    if (!list) return;
    list.innerHTML = '';

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
                <i class="material-icons recent-like" style="cursor:pointer;">favorite_border</i>
                <i class="material-icons more-options" style="font-size:20px; opacity:0.5; cursor:pointer;">more_vert</i>
            </div>
        `;

        // Check like status
        const likeBtn = div.querySelector('.recent-like');
        if (userData.likedSongs && userData.likedSongs.includes(s.id)) {
            likeBtn.innerText = 'favorite';
            likeBtn.classList.add('liked');
        }

        likeBtn.onclick = (e) => {
            e.stopPropagation();
            toggleLike(s.id);
            // Optimistic Update
            const isLiked = likeBtn.innerText === 'favorite';
            likeBtn.innerText = isLiked ? 'favorite_border' : 'favorite';
            likeBtn.classList.toggle('liked', !isLiked);
        };

        div.querySelector('.more-options').onclick = (e) => {
            e.stopPropagation();
            ContextMenu.show(e.clientX, e.clientY, s.id, userData.playlists);
        };

        div.onclick = (e) => {
            if (e.target.closest('.recent-like') || e.target.closest('.more-options')) return;
            window.playSongById(s.id);
            updateURLWithSongID(s.id);
        };
        list.appendChild(div);
    });
};

export const updatePlaylistsSidebar = () => {
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
                <span class="material-icons" id="createPlaylistBtn" style="cursor:pointer; font-size:20px;">add</span>
            </div>
            <ul class="nav-links" id="playlists-nav"></ul>
        `;
        section.appendChild(plContainer);
        section.querySelector('#createPlaylistBtn').onclick = promptCreatePlaylist;
    }

    const list = document.getElementById('playlists-nav');
    if (userData.playlists) {
        list.innerHTML = userData.playlists.map(pl => `
            <li class="playlist-nav-item" data-id="${pl.id}"><span class="material-icons-sharp">playlist_play</span> ${pl.name}</li>
        `).join('');

        list.querySelectorAll('.playlist-nav-item').forEach(li => {
            li.onclick = () => {
                showPlaylistView(li.dataset.id);
            };
        });
    }
};

export const promptCreatePlaylist = () => {
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
