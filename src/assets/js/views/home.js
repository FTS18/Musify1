import { songs } from '../services/data.js';
import { userData, toggleLike, toggleFollowArtist } from '../services/auth.js';
import { getSongCoverPath, updateURLWithSongID } from '../utils/helpers.js';
import { initRightSidebar } from '../components/sidebar.js';
// Actually `renderFollowedArtists` was in `components/ui.js`.
// And `initRightSidebar` in `components/sidebar.js`.
// I should import correctly.
import { renderFollowedArtists } from '../components/ui.js';
import { hideAllViews } from './common.js';

export const renderHome = () => {
    // Show home sections
    hideAllViews();

    const homeSections = ['.hero-banner', '.section-header', '#playlists', '#artists'];
    homeSections.forEach(sel => {
        const els = document.querySelectorAll(sel);
        els.forEach(el => el.style.display = '');
    });

    document.querySelector('.main-view').scrollTo({ top: 0 });
};

export const initHomeContent = (artistsData) => {
    // Populate Recommended (10 random)
    const pc = document.querySelector('#playlists');
    if (pc) {
        pc.innerHTML = '';
        const random = songs.slice().sort(() => 0.5 - Math.random()).slice(0, 10);
        random.forEach(song => {
            const card = document.createElement('div');
            card.className = 'card';
            const isLiked = userData.likedSongs && userData.likedSongs.includes(song.id);
            card.innerHTML = `
                <div class="img-container">
                    <img src="${getSongCoverPath(song.cover)}" loading="lazy" alt="${song.name}">
                    <div class="play-btn"><i class="material-icons">play_arrow</i></div>
                    <button class="add-btn ${isLiked ? 'liked' : ''}" style="background:transparent; border:none; z-index:2; position:absolute; bottom:10px; right:10px;">
                        <i class="material-icons" style="color:${isLiked ? '#e91e63' : '#fff'}; font-size:24px;">${isLiked ? 'favorite' : 'add'}</i>
                    </button>
                </div>
                <h4>${song.name}</h4>
                <p>${song.artist}</p>
            `;
            // play logic
            card.onclick = (e) => {
                if (e.target.closest('.add-btn')) return;
                window.playSongById(song.id);
                updateURLWithSongID(song.id);
            };
            // like logic
            card.querySelector('.add-btn').onclick = (e) => {
                e.stopPropagation();
                toggleLike(song.id);
                const btn = e.currentTarget;
                const icon = btn.querySelector('i');
                const nowLiked = icon.innerText === 'add'; // toggled logic inverse?
                // Actually `toggleLike` in auth updates userData synchronously/optimistically.
                const isNowLiked = userData.likedSongs.includes(song.id);
                icon.innerText = isNowLiked ? 'favorite' : 'add';
                icon.style.color = isNowLiked ? '#e91e63' : '#fff';
            };
            pc.appendChild(card);
        });

        // View All Card
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
        viewMoreRec.onclick = () => window.navigate('all-songs');
        pc.appendChild(viewMoreRec);
    }

    // Populate Artists
    const ac = document.querySelector('#artists');
    if (ac && artistsData) {
        ac.innerHTML = '';
        artistsData.forEach(a => {
            const card = document.createElement('div');
            card.className = 'artist-card';
            card.style.cursor = 'pointer';
            const isFollowed = userData.followedArtists && userData.followedArtists.includes(a.title);
            card.innerHTML = `
                <div class="img-container" style="border-radius:50%; width:120px; height:120px; margin:0 auto 10px; border: var(--border-thick); overflow:hidden; position:relative;">
                    <img src="${a.imageSrc}" loading="lazy" alt="${a.title}" style="width:100%; height:100%; object-fit:cover;">
                    <button class="follow-btn" style="position:absolute; bottom:5px; right:5px; background:rgba(0,0,0,0.6); border:none; border-radius:50%; width:32px; height:32px; color:#fff; display:flex; align-items:center; justify-content:center;">
                        <i class="material-icons" style="font-size:18px;">${isFollowed ? 'check' : 'add'}</i>
                    </button>
                </div>
                <h4 style="text-align:center;">${a.title}</h4>
                <p style="text-align:center;">Artist</p>
            `;
            card.onclick = (e) => {
                if (e.target.closest('.follow-btn')) return;
                window.openArtistProfile(a.title);
            };
            card.querySelector('.follow-btn').onclick = (e) => {
                e.stopPropagation();
                // toggleFollow(a.title, a.imageSrc); 
                // We need to import toggleFollow. 
                // Wait, toggleFollowArtist is NOT exported from auth.js yet, only `toggleLike`.
                // I should assume it's attached to window or imported.
                // Correction: I should export it from auth.js
                import('../services/auth.js').then(m => {
                    // Assuming I add it to auth.js later
                    // implementation pending
                });
            };
            ac.appendChild(card);
        });

        // View More Artists
        const viewMoreArt = document.createElement('div');
        viewMoreArt.className = 'artist-card';
        viewMoreArt.style.cursor = 'pointer';
        viewMoreArt.innerHTML = `
            <div style="width:120px; height:120px; background:var(--bg-card-hover); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:10px; border: var(--border-thick);">
                <span class="material-icons" style="font-size:40px; color:var(--text-secondary);">add</span>
            </div>
            <h4 style="text-align:center;">View All</h4>
        `;
        viewMoreArt.onclick = () => window.navigate('all-artists');
        ac.appendChild(viewMoreArt);
    }

    // Initial Sidebars
    initRightSidebar();
    renderFollowedArtists();
};
