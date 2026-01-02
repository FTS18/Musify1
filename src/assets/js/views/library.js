import { userData, toggleLike, currentUser } from '../services/auth.js';
import { songs } from '../services/data.js';
import { getSongCoverPath } from '../utils/helpers.js';
import { hideAllViews } from './common.js';

export const renderLibraryView = () => {
    hideAllViews();
    const libView = document.getElementById('libraryView');
    if (libView) libView.style.display = 'block';

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
            <div class="card" onclick="window.navigate('home'); setTimeout(() => showPlaylistView('${pl.id}', null), 100);">
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
            <div class="song-row" onclick="window.playSongById('${s.id}')">
                <div class="song-number" style="opacity:0.5; font-size:14px;">${i + 1}</div>
                <div class="song-main-info" style="display:flex; align-items:center; gap:12px; flex:1;">
                    <img src="${getSongCoverPath(s.cover)}" class="song-thumb" style="width:40px; height:40px; border-radius:4px;">
                    <div>
                        <div class="song-title-text" style="font-weight:700; font-size:15px;">${s.name}</div>
                        <div class="song-artist-text" style="color:var(--text-secondary); font-size:13px;">${s.artist}</div>
                    </div>
                </div>
                <div class="song-play-action"><span class="material-icons">play_arrow</span></div>
                <button class="add-btn-inline" data-id="${s.id}" style="background:transparent; border:none; color:${userData.likedSongs.includes(s.id) ? 'var(--accent)' : '#fff'}; cursor:pointer;">
                    <i class="material-icons">${userData.likedSongs.includes(s.id) ? 'favorite' : 'favorite_border'}</i>
                </button>
            </div>
        `).join('');

        // Attach event listeners for like buttons to avoid huge onclick strings
        songsContainer.querySelectorAll('.add-btn-inline').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                toggleLike(btn.dataset.id);
                // Immediate UI update
                const isLiked = !btn.querySelector('i').innerText.includes('border');
                btn.innerHTML = `<i class="material-icons">${isLiked ? 'favorite_border' : 'favorite'}</i>`;
                btn.style.color = isLiked ? '#fff' : 'var(--accent)';
            }
        });
    }
};

export const renderAllSongsView = (page = 1) => {
    hideAllViews();
    const view = document.getElementById('genericListView');
    const list = document.getElementById('genericSongsList');
    const title = document.getElementById('genericTitle');
    const header = document.getElementById('genericHeader');
    if (!view || !list) return;

    view.style.display = 'block';
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
        row.onclick = (e) => {
            if (e.target.closest('.add-btn')) {
                e.stopPropagation();
                toggleLike(song.id);
                // Simple toggle UI
                const btn = row.querySelector('.add-btn');
                const icon = btn.querySelector('span');
                const nowLiked = icon.innerText === 'favorite_border';
                icon.innerText = nowLiked ? 'favorite' : 'favorite_border';
                icon.style.color = nowLiked ? '#e91e63' : '#aaa';
                return;
            }
            window.playSongById(song.id);
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
        btn.onclick = () => renderAllSongsView(page + 1);
        list.appendChild(btn);
    }
};

export const renderAllArtistsView = (page = 1) => {
    hideAllViews();
    const view = document.getElementById('genericListView');
    const list = document.getElementById('genericSongsList');
    const title = document.getElementById('genericTitle');
    const header = document.getElementById('genericHeader');
    if (!view || !list) return;

    view.style.display = 'block';
    if (page === 1) {
        title.textContent = 'All Artists';
        list.innerHTML = '';
        header.style.background = 'linear-gradient(135deg, #FF5722 0%, #000 100%)';
        list.style.display = 'grid';
        list.style.gridTemplateColumns = 'repeat(auto-fill, minmax(160px, 1fr))';
        list.style.gap = '20px';
    }

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

    const itemsPerPage = 50;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const sliced = artistArray.slice(start, end);

    sliced.forEach(art => {
        const card = document.createElement('div');
        card.className = 'artist-card';
        card.style.background = 'var(--bg-card)';
        card.style.padding = '16px';
        card.style.borderRadius = '8px';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div style="width:100%; aspect-ratio:1; border-radius:50%; overflow:hidden; margin-bottom:12px; border:2px solid rgba(255,255,255,0.1);">
                <img src="${getSongCoverPath(art.image)}" loading="lazy" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <h4 style="text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:4px;">${art.name}</h4>
         `;
        card.onclick = () => window.openArtistProfile(art.name);
        list.appendChild(card);
    });

    const oldBtn = document.getElementById('loadMoreArtsBtn');
    if (oldBtn) oldBtn.remove();
    if (end < artistArray.length) {
        const btn = document.createElement('button');
        btn.id = 'loadMoreArtsBtn';
        btn.textContent = 'Load More';
        btn.style.cssText = 'grid-column: 1 / -1; display:block; margin:30px auto; padding:12px 30px; background:var(--accent); color:#fff; border:none; border-radius:30px; font-weight:700; cursor:pointer; width:fit-content;';
        btn.onclick = () => renderAllArtistsView(page + 1);
        list.appendChild(btn);
    }
};
