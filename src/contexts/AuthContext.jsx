import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, FirestoreService } from '../services/db';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState({ likedSongs: [], recentPlay: [], playlists: [], followedArtists: [], followedArtistsData: {} });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                const data = await FirestoreService.getUserData(user.uid);
                if (data) setUserData(prev => ({ ...prev, ...data }));
            } else {
                setUserData({ likedSongs: [], recentPlay: [], playlists: [], followedArtists: [], followedArtistsData: {} });
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    const toggleLike = async (songId) => {
        if (!currentUser) return alert("Please login to like songs!");
        
        let newLikes = [...(userData.likedSongs || [])];
        if (newLikes.includes(songId)) {
            newLikes = newLikes.filter(id => id !== songId);
        } else {
            newLikes.push(songId);
        }
        
        // Optimistic update
        setUserData(prev => ({ ...prev, likedSongs: newLikes }));
        
        await FirestoreService.saveUserData(currentUser.uid, { likedSongs: newLikes });
    };

    const toggleFollowArtist = async (artistName, artistImg) => {
        if (!currentUser) return alert("Please login to follow artists!");

        let newFollows = [...(userData.followedArtists || [])];
        let newFollowsData = { ...(userData.followedArtistsData || {}) };

        if (newFollows.includes(artistName)) {
            newFollows = newFollows.filter(a => a !== artistName);
            delete newFollowsData[artistName];
        } else {
            newFollows.push(artistName);
            newFollowsData[artistName] = { name: artistName, img: artistImg };
        }

        setUserData(prev => ({ ...prev, followedArtists: newFollows, followedArtistsData: newFollowsData }));
        
        await FirestoreService.saveUserData(currentUser.uid, { 
            followedArtists: newFollows, 
            followedArtistsData: newFollowsData 
        });
    };

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login failed", error);
            alert(error.message);
        }
    };

    const value = {
        currentUser,
        userData,
        loading,
        logout,
        toggleLike,
        toggleFollowArtist,
        loginWithGoogle
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
