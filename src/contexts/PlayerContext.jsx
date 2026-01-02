import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { songs } from '../services/data';
import { FirestoreService } from '../services/db';
import { useAuth } from './AuthContext';
import { formatTime, getSongCoverPath, extractDominantColor } from '../utils/helpers';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const audioRef = useRef(new Audio());
    const nextAudioRef = useRef(new Audio()); // For crossfade
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSong, setCurrentSong] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);
    const [dominantColor, setDominantColor] = useState('40, 40, 40'); // Neutral grey instead of red
    const [queueSongs, setQueueSongs] = useState([]);
    const [crossfadeEnabled, setCrossfadeEnabled] = useState(true);
    const [crossfadeDuration, setCrossfadeDuration] = useState(3);
    const [gaplessEnabled, setGaplessEnabled] = useState(true);
    
    useEffect(() => {
        const audio = audioRef.current;
        
        const handleEnded = () => {
            if (isRepeat) {
                audio.currentTime = 0;
                audio.play();
            } else if (isShuffle) {
                const nextIdx = Math.floor(Math.random() * songs.length);
                load(nextIdx);
            } else {
                next();
            }
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            
            // Crossfade logic
            if (crossfadeEnabled && duration > 0) {
                const timeLeft = duration - audio.currentTime;
                if (timeLeft <= crossfadeDuration && timeLeft > 0) {
                    const fadeVolume = timeLeft / crossfadeDuration;
                    audio.volume = Math.max(0.1, fadeVolume);
                }
            }
        };
        const handleMetadata = () => setDuration(audio.duration);

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleMetadata);
        
        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleMetadata);
        };
    }, [currentIndex, isShuffle, isRepeat]); 

    // Extract dominant color from album art
    useEffect(() => {
        if (!currentSong) return;
        
        const extractColor = async () => {
            try {
                const coverPath = getSongCoverPath(currentSong.cover);
                const color = await extractDominantColor(coverPath);
                setDominantColor(color);
            } catch (e) {
                console.error('Color extraction error:', e);
                setDominantColor('230, 0, 0');
            }
        };
        
        extractColor();
    }, [currentSong]);

    const load = (index) => {
        if (index < 0 || index >= songs.length) return;
        const song = songs[index];
        
        if (!audioRef.current.paused) audioRef.current.pause();

        audioRef.current.src = `/assets/songs/${song.path}.mp3`;
        audioRef.current.load();
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Play error", e));
        
        setCurrentIndex(index);
        setCurrentSong(song);
        
        // Auto-add to queue when playing a song
        if (!queueSongs.find(s => s.id === song.id)) {
            setQueueSongs([...queueSongs, song]);
        }
        
        if (currentUser) FirestoreService.addRecentPlay(currentUser.uid, song.id);
        
        document.title = `${song.name} - ${song.artist} | Musify`;
    };

    const play = () => {
        if (audioRef.current.src) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const pause = () => {
        audioRef.current.pause();
        setIsPlaying(false);
    };

    const toggle = () => isPlaying ? pause() : play();
    const next = () => load((currentIndex + 1) % songs.length);
    const prev = () => load((currentIndex - 1 + songs.length) % songs.length);
    const seek = (time) => { audioRef.current.currentTime = time; };
    
    const playById = (id) => {
        const idx = songs.findIndex(s => s.id === id);
        if (idx !== -1) load(idx);
    };

    const setVolume = (vol) => {
        audioRef.current.volume = vol;
    };

    const addToQueue = (songId) => {
        const song = songs.find(s => s.id === songId);
        if (song && !queueSongs.find(s => s.id === songId)) {
            setQueueSongs([...queueSongs, song]);
        }
    };

    const playNext = (songId) => {
        const song = songs.find(s => s.id === songId);
        if (song && !queueSongs.find(s => s.id === songId)) {
            setQueueSongs([song, ...queueSongs]);
        }
    };

    const removeFromQueue = (songId) => {
        setQueueSongs(queueSongs.filter(s => s.id !== songId));
    };

    const clearQueue = () => {
        setQueueSongs([]);
    };

    const reorderQueue = (fromIndex, toIndex) => {
        const newQueue = [...queueSongs];
        const [removed] = newQueue.splice(fromIndex, 1);
        newQueue.splice(toIndex, 0, removed);
        setQueueSongs(newQueue);
    };

    const value = {
        isPlaying,
        currentSong,
        currentSongId: currentSong?.id,
        currentIndex,
        currentTime,
        duration,
        load,
        play,
        pause,
        toggle,
        next,
        prev,
        seek,
        playById,
        isShuffle,
        setIsShuffle,
        isRepeat,
        setIsRepeat,
        setVolume,
        dominantColor,
        queueSongs,
        addToQueue,
        playNext,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        crossfadeEnabled,
        setCrossfadeEnabled,
        crossfadeDuration,
        setCrossfadeDuration,
        gaplessEnabled,
        setGaplessEnabled
    };

    return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayer = () => useContext(PlayerContext);
