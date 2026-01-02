
import { initAuth, setUICallbacks, refreshUserData, userData, toggleLike, toggleFollowArtist, currentUser } from './services/auth.js';
import { FirestoreService } from './services/db.js';
import { stateManager } from './services/state.js';
import { songs } from './services/data.js';
import MusicController from './core/player.js';
import Router from './core/router.js';

// Views
import { renderHome, initHomeContent } from './views/home.js';
import { renderLibraryView, renderAllSongsView, renderAllArtistsView } from './views/library.js';
import { renderSearchView, searchGenre } from './views/search.js';
import { openArtistProfile, closeArtistProfile } from './views/artist.js';
import { renderProfileView } from './views/profile.js';
import { renderSongListView, showPlaylistView } from './views/common.js';
import { toggleDropdown, renderFollowedArtists } from './components/ui.js';
import { initRightSidebar, updatePlaylistsSidebar, promptCreatePlaylist } from './components/sidebar.js';
import { ContextMenu } from './components/context-menu.js';

// Global Helpers (Legacy Compatibility)
import { getSongCoverPath, updateURLWithSongID } from './utils/helpers.js';

// Global Assignments for HTML Event Handlers
window.navigate = (path, param) => window.router.navigate(path, param);
window.playSongById = (id) => window.musicController.playById(id);
window.setMusic = (i) => window.musicController.load(i);
window.playAudio = () => window.musicController.play();
window.pauseAudio = () => window.musicController.pause();
window.toggleLikeSong = (id) => toggleLike(id);
window.toggleFollowArtist = toggleFollowArtist;
window.promptCreatePlaylist = promptCreatePlaylist;
window.showPlaylistView = showPlaylistView;
window.openArtistProfile = openArtistProfile;
window.closeArtistProfile = closeArtistProfile;
window.toggleDropdown = toggleDropdown;
window.renderFollowedArtists = renderFollowedArtists;
window.searchGenre = searchGenre;
window.renderAllSongsView = renderAllSongsView;
window.renderAllArtistsView = renderAllArtistsView;
window.renderLibraryView = renderLibraryView;
window.renderSearchView = renderSearchView;
window.renderProfileView = renderProfileView;
window.getSongCoverPath = getSongCoverPath;
window.updateURLWithSongID = updateURLWithSongID;
window.ContextMenu = ContextMenu;

window.setActiveSidebarItem = (btn) => {
    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    if (btn) btn.classList.add('active');
};

window.showLikedSongs = (btn) => {
    if (!currentUser) return alert("Login required");
    window.setActiveSidebarItem(btn);
    renderSongListView("Liked Songs", userData.likedSongs, 'assets/images/cover/favorite_bg.jpg');
};

window.showRecentSongs = (btn) => {
    if (!currentUser) return alert("Login required");
    window.setActiveSidebarItem(btn);
    renderSongListView("Recent Play", userData.recentPlay, 'assets/images/cover/recent_bg.jpg');
};


// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Init Music Player
    const music = document.querySelector('#audio-source');
    window.musicController = new MusicController(music);

    // 2. Init Router
    window.router = new Router({
        'home': renderHome,
        'library': renderLibraryView,
        'search': renderSearchView,
        'profile': renderProfileView,
        'artist': (name) => openArtistProfile(name, true),
        'all-songs': () => renderAllSongsView(1),
        'all-artists': () => renderAllArtistsView(1)
    });

    // 3. Init Auth & UI Callbacks
    setUICallbacks({
        updateQueue: () => { /* Queue UI handled by player or separate component? */ },
        updateSidebar: () => initRightSidebar(),
        updatePlaylists: () => updatePlaylistsSidebar(),
        updateFollowed: () => window.renderFollowedArtists(),
        updateLikes: () => {
            // Update icons on current view
            const btns = document.querySelectorAll('.add-btn, .add-btn-inline, .like-btn');
            btns.forEach(btn => {
                // Simplistic update if id is available
                // Real reactivity would use mutation observer or react
            });
        }
    });
    initAuth();

    // 4. Fetch Initial Data (Artists)
    try {
        const res = await fetch('assets/js/playlist_data.json');
        const data = await res.json();
        stateManager.setState({ artists: data.artists });

        // 5. Init Home Content
        initHomeContent(data.artists);

        // 6. Handle URL Params (Deep Linking)
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) window.playSongById(id);

    } catch (e) {
        console.error("Initialization error:", e);
    }
});
