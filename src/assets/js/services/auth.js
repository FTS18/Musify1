import { auth, FirestoreService } from './db.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { stateManager } from './state.js';

export let currentUser = null;
export let userData = { likedSongs: [], recentPlay: [], playlists: [], followedArtists: [] };

// Functions to update UI (assignments injected from main or observers)
let uiCallbacks = {
    updateQueue: () => { },
    updateSidebar: () => { },
    updatePlaylists: () => { },
    updateLikes: () => { },
    updateFollowed: () => { }
};

export const setUICallbacks = (callbacks) => {
    uiCallbacks = { ...uiCallbacks, ...callbacks };
};

export const initAuth = () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await refreshUserData();
            // Show Profile in sidebar
            const profileAction = document.getElementById('profileAction');
            if (profileAction) profileAction.innerHTML = `<div style="display:flex; align-items:center; gap:10px;"><img src="${user.photoURL || 'assets/images/user.svg'}" style="width:24px; height:24px; border-radius:50%;"> <span>${user.displayName || 'User'}</span></div>`;
            const authAction = document.getElementById('authAction');
            if (authAction) authAction.innerHTML = `<span class="auth-text" style="cursor:pointer;" onclick="import('./services/auth.js').then(m => m.logout())">Logout</span>`;
        } else {
            currentUser = null;
            userData = { likedSongs: [], recentPlay: [], playlists: [] };
            const authAction = document.getElementById('authAction');
            if (authAction) authAction.innerHTML = `<a href="assets/pages/login.html" style="color:inherit; text-decoration:none;"><span class="auth-text">Login</span></a>`;
        }
        stateManager.setState({ currentUser, userData });
    });
};

export const refreshUserData = async () => {
    if (currentUser) {
        const data = await FirestoreService.getUserData(currentUser.uid);
        if (data) userData = { ...userData, ...data };
        stateManager.setState({ userData });

        uiCallbacks.updateQueue();
        uiCallbacks.updateSidebar();
        uiCallbacks.updatePlaylists();
        uiCallbacks.updateLikes();
        uiCallbacks.updateFollowed();
    }
};

export const logout = async () => {
    await auth.signOut();
    window.location.reload();
};

export const toggleLike = async (songId) => {
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

    // Optimistic update
    stateManager.setState({ userData });
    uiCallbacks.updateLikes();

    await FirestoreService.saveUserData(currentUser.uid, { likedSongs: userData.likedSongs });
    // refreshUserData(); // Optional if we trust optimistic
};

export const toggleFollowArtist = async (artistName, artistImg) => {
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

    // Optimistic update
    stateManager.setState({ userData });

    // UI Updates
    uiCallbacks.updateSidebar();
    if (uiCallbacks.updateFollowed) uiCallbacks.updateFollowed();

    await FirestoreService.saveUserData(currentUser.uid, {
        followedArtists: userData.followedArtists,
        followedArtistsData: userData.followedArtistsData
    });
};
