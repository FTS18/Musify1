import { db } from './firebase-init.js';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    arrayUnion,
    arrayRemove
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * Service to handle Firestore data operations for user-specific data.
 */
export class FirestoreService {
    /**
     * Get user data from Firestore
     * @param {string} uid 
     */
    static async getUserData(uid) {
        const userDoc = doc(db, "users", uid);
        const snap = await getDoc(userDoc);
        if (snap.exists()) {
            return snap.data();
        } else {
            // Create initial user doc if it doesn't exist
            const initialData = { likedSongs: [], recentPlay: [] };
            await setDoc(userDoc, initialData);
            return initialData;
        }
    }

    /**
     * Add or remove a song from Liked Songs
     * @param {string} uid 
     * @param {string} songId 
     * @param {boolean} isLiked 
     */
    static async toggleLike(uid, songId, isLiked) {
        const userDoc = doc(db, "users", uid);
        await updateDoc(userDoc, {
            likedSongs: isLiked ? arrayUnion(songId) : arrayRemove(songId)
        });
    }

    /**
     * Add a song to Recent Play (limit to top 10)
     * @param {string} uid 
     * @param {string} songId 
     */
    static async addRecentPlay(uid, songId) {
        const userDoc = doc(db, "users", uid);
        const data = await this.getUserData(uid);
        let recent = data.recentPlay || [];

        // Remove if already exists (to move to front)
        recent = recent.filter(id => id !== songId);
        recent.unshift(songId);

        // Keep only top 10
        if (recent.length > 10) recent = recent.slice(0, 10);

        await updateDoc(userDoc, { recentPlay: recent });
    }
    /**
     * Get all playlists for a user
     * @param {string} uid 
     */
    static async getPlaylists(uid) {
        const data = await this.getUserData(uid);
        return data.playlists || [];
    }

    /**
     * Create a new playlist
     * @param {string} uid 
     * @param {string} name 
     */
    static async createPlaylist(uid, name) {
        const userDoc = doc(db, "users", uid);
        const id = 'pl_' + Math.random().toString(36).substr(2, 9);
        const newPlaylist = { id, name, songs: [], createdAt: Date.now() };
        await updateDoc(userDoc, {
            playlists: arrayUnion(newPlaylist)
        });
        return newPlaylist;
    }

    /**
     * Add or remove a song from a playlist
     * @param {string} uid 
     * @param {string} playlistId 
     * @param {string} songId 
     * @param {boolean} add 
     */
    static async toggleSongInPlaylist(uid, playlistId, songId, add) {
        const userDoc = doc(db, "users", uid);
        const data = await this.getUserData(uid);
        const playlists = data.playlists || [];
        const plIndex = playlists.findIndex(p => p.id === playlistId);

        if (plIndex !== -1) {
            let plSongs = playlists[plIndex].songs || [];
            if (add) {
                if (!plSongs.includes(songId)) plSongs.push(songId);
            } else {
                plSongs = plSongs.filter(id => id !== songId);
            }
            playlists[plIndex].songs = plSongs;
            await updateDoc(userDoc, { playlists });
        }
    }
}
