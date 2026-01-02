import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const PlaylistContext = createContext();

export const PlaylistProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const [playlists, setPlaylists] = useState([]);

    useEffect(() => {
        if (currentUser) {
            const savedPlaylists = localStorage.getItem(`playlists_${currentUser.uid}`);
            if (savedPlaylists) {
                setPlaylists(JSON.parse(savedPlaylists));
            }
        }
    }, [currentUser]);

    const savePlaylists = (newPlaylists) => {
        if (currentUser) {
            localStorage.setItem(`playlists_${currentUser.uid}`, JSON.stringify(newPlaylists));
            setPlaylists(newPlaylists);
        }
    };

    const createPlaylist = (name, description = '') => {
        const newPlaylist = {
            id: Date.now().toString(),
            name,
            description,
            songs: [],
            createdAt: new Date().toISOString(),
            cover: null
        };
        const updated = [...playlists, newPlaylist];
        savePlaylists(updated);
        return newPlaylist;
    };

    const addToPlaylist = (playlistId, songId) => {
        const updated = playlists.map(playlist => {
            if (playlist.id === playlistId && !playlist.songs.includes(songId)) {
                return { ...playlist, songs: [...playlist.songs, songId] };
            }
            return playlist;
        });
        savePlaylists(updated);
    };

    const removeFromPlaylist = (playlistId, songId) => {
        const updated = playlists.map(playlist => {
            if (playlist.id === playlistId) {
                return { ...playlist, songs: playlist.songs.filter(id => id !== songId) };
            }
            return playlist;
        });
        savePlaylists(updated);
    };

    const deletePlaylist = (playlistId) => {
        const updated = playlists.filter(p => p.id !== playlistId);
        savePlaylists(updated);
    };

    const exportPlaylist = (playlistId, format = 'json') => {
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        if (format === 'json') {
            const dataStr = JSON.stringify(playlist, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${playlist.name}.json`;
            link.click();
            URL.revokeObjectURL(url);
        } else if (format === 'm3u') {
            let m3uContent = '#EXTM3U\n';
            playlist.songs.forEach(songId => {
                // Add song info to M3U format
                m3uContent += `#EXTINF:-1,${songId}\n`;
                m3uContent += `/assets/songs/${songId}.mp3\n`;
            });
            const dataBlob = new Blob([m3uContent], { type: 'text/plain' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${playlist.name}.m3u`;
            link.click();
            URL.revokeObjectURL(url);
        }
    };

    const value = {
        playlists,
        createPlaylist,
        addToPlaylist,
        removeFromPlaylist,
        deletePlaylist,
        exportPlaylist
    };

    return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>;
};

export const usePlaylist = () => useContext(PlaylistContext);