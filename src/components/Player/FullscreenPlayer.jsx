import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../contexts/PlayerContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatTime, getSongCoverPath, linearToLogarithmic, logarithmicToLinear } from '../../utils/helpers';
import ImageWithFallback from '../ImageWithFallback';
import { Image } from '../ImageWithFallback';
import ElasticSlider from '../ElasticSlider';
import LyricsDisplay from '../LyricsDisplay/LyricsDisplay';
import QueuePanel from './QueuePanel';
import './FullscreenPlayer.css';

const FullscreenPlayer = React.memo(({ isOpen, onClose }) => {
    const { 
        currentSong, isPlaying, toggle, next, prev, 
        currentTime, duration, seek, isShuffle, 
        setIsShuffle, isRepeat, setIsRepeat, setVolume, dominantColor 
    } = usePlayer();
    const { toggleLike, userData } = useAuth();
    const navigate = useNavigate();
    const { queueSongs } = usePlayer();
    const [volumeState, setVolumeState] = useState(1);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [waveformBars, setWaveformBars] = useState([]);
    const [showQueue, setShowQueue] = useState(false);
    const [showLyrics, setShowLyrics] = useState(false);

    // All memoized values first
    const isLiked = useMemo(() => userData?.likedSongs?.includes(currentSong?.id), [userData?.likedSongs, currentSong?.id]);
    const progress = useMemo(() => duration > 0 ? (currentTime / duration) * 100 : 0, [currentTime, duration]);
    const artistLinks = useMemo(() => {
        if (!currentSong?.artist) return [];
        return currentSong.artist.split(',').map(a => a.trim());
    }, [currentSong?.artist]);
    const volumePercentage = useMemo(() => Math.round(logarithmicToLinear(volumeState)), [volumeState]);

    useEffect(() => {
        // Generate waveform bars only when song changes
        if (isOpen) {
            const bars = Array.from({ length: 40 }, () => 20 + Math.random() * 60);
            setWaveformBars(bars);
        }
    }, [currentSong?.id, isOpen]);

    // All callbacks after effects
    const handleVolumeChange = useCallback((e) => {
        const linearVal = parseFloat(e.target.value);
        const logVal = linearToLogarithmic(linearVal);
        setVolumeState(logVal);
        setVolume(logVal);
    }, [setVolume]);

    const handleSeek = useCallback((val) => {
        seek(val);
    }, [seek]);

    const handleToggleLike = useCallback(() => {
        toggleLike(currentSong.id);
    }, [toggleLike, currentSong?.id]);

    const handleToggleShuffle = useCallback(() => {
        setIsShuffle(!isShuffle);
    }, [isShuffle, setIsShuffle]);

    const handleToggleRepeat = useCallback(() => {
        setIsRepeat(!isRepeat);
    }, [isRepeat, setIsRepeat]);

    const handleToggleQueue = useCallback(() => {
        setShowQueue(prev => !prev);
    }, []);

    const handleClose = useCallback((e) => {
        e?.stopPropagation?.();
        onClose();
    }, [onClose]);

    const handleNavigateToArtist = useCallback((artist) => {
        onClose();
        navigate(`/artist/${encodeURIComponent(artist)}`);
    }, [onClose, navigate]);

    const handleNavigateToRadio = useCallback(() => {
        onClose();
        navigate(`/radio/${currentSong.id}`);
    }, [onClose, currentSong?.id, navigate]);

    if (!currentSong) return null;

    return (
        <div 
            className={`fullscreen-player transition-smooth ${isOpen ? 'active' : ''}`}
            style={{ 
                background: `rgb(${dominantColor})`
            }}
        >
            {/* Background Image with Overlay */}
            <div className="fullscreen-bg-image" style={{ 
                backgroundImage: `url(${getSongCoverPath(currentSong.cover)})`,
                opacity: 0.15
            }}></div>
            <div className="fullscreen-color-overlay" style={{ 
                background: `linear-gradient(180deg, rgba(${dominantColor}, 0.85) 0%, rgba(${dominantColor}, 0.95) 100%)`
            }}></div>
            
            {/* Header */}
            <div className="fullscreen-header transition-smooth" onClick={(e) => e.stopPropagation()}>
                <button 
                    className="fullscreen-close-btn player-btn-transition" 
                    onClick={handleClose}
                    aria-label="Close"
                >
                    <span className="material-icons">expand_more</span>
                </button>
                <div className="fullscreen-header-title">
                    <span>NOW PLAYING</span>
                    <strong style={{cursor:'default'}}>{currentSong.name}</strong>
                </div>
                <button className="fullscreen-menu-btn player-btn-transition" onClick={handleToggleQueue}>
                    <span className="material-icons">queue_music</span>
                </button>
            </div>

            {/* Immersive Artwork Area */}
            <div className="fullscreen-artwork-area transition-smooth">
                <div className="artwork-main-container">
                    <Image 
                        src={getSongCoverPath(currentSong.cover)} 
                        alt={currentSong.title}
                        className="fullscreen-main-artwork"
                        loading="lazy"
                    />
                </div>
            </div>

            {/* Song Details */}
            <div className="fullscreen-song-details player-text-transition">
                <div className="details-left">
                    <h2 className="song-name-big transition-smooth">{currentSong.name}</h2>
                    <div className="artist-name-big transition-smooth" style={{cursor:'default'}}>
                        {artistLinks.map((artist, i, arr) => (
                            <span 
                                key={i}
                                onClick={(e) => { e.stopPropagation(); handleNavigateToArtist(artist); }}
                                className="hover-underline"
                                style={{cursor:'pointer', display:'inline'}}
                            >
                                {artist}{i < arr.length - 1 ? ', ' : ''}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="fullscreen-actions">
                    <button className="like-btn-big player-btn-transition" onClick={handleToggleLike}>
                        <span className="material-icons" style={{ color: isLiked ? '#ff2d55' : 'rgba(255,255,255,0.5)' }}>
                            {isLiked ? 'favorite' : 'favorite_border'}
                        </span>
                    </button>
                    <button className="like-btn-big player-btn-transition" onClick={handleNavigateToRadio}>
                        <span className="material-icons">radio</span>
                    </button>
                    <button className="like-btn-big player-btn-transition" onClick={() => setShowLyrics(true)}>
                        <span className="material-icons">lyrics</span>
                    </button>
                </div>
            </div>


            {/* Seekbar Section - Elastic */}
            <div className="fullscreen-seekbar-section transition-smooth">
                <ElasticSlider
                    value={currentTime}
                    min={0}
                    max={duration}
                    onChange={handleSeek}
                    accentColor="#fff"
                    leftIcon={null}
                    rightIcon={null}
                />
                <div className="fullscreen-time-labels">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Main Controls Section */}
            <div className="fullscreen-main-controls transition-smooth">
                <button className={`control-btn-small player-btn-transition ${isShuffle ? 'active' : ''}`} onClick={handleToggleShuffle}>
                    <span className="material-icons">shuffle</span>
                </button>
                
                <div className="playback-group">
                    <button className="playback-btn player-btn-transition" onClick={prev}>
                        <span className="material-icons">skip_previous</span>
                    </button>
                    <button 
                        className="play-pause-btn-big player-btn-transition" 
                        onClick={toggle}
                        style={{
                            background: '#fff',
                            color: `rgb(${dominantColor})`,
                            boxShadow: `0 8px 24px rgba(0, 0, 0, 0.3)`
                        }}
                    >
                        <span className="material-icons">{isPlaying ? 'pause' : 'play_arrow'}</span>
                    </button>
                    <button className="playback-btn player-btn-transition" onClick={next}>
                        <span className="material-icons">skip_next</span>
                    </button>
                </div>

                {/* Speaker Button with Volume Overlay */}
                <div className="volume-control-wrapper" style={{ position: 'relative' }}>
                    <button 
                        className="control-btn-small player-btn-transition"
                        onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                        title="Click to adjust volume"
                    >
                        <span className="material-icons">
                            {volumeState === 0 ? 'volume_off' : volumeState < 0.5 ? 'volume_down' : 'volume_up'}
                        </span>
                    </button>

                    {/* Volume Slider Overlay on Image */}
                    {showVolumeSlider && (
                        <div className="volume-slider-overlay transition-smooth">
                            <div className="volume-overlay-content">
                                <img 
                                    src={getSongCoverPath(currentSong.cover)} 
                                    alt={currentSong.name}
                                    className="volume-overlay-image"
                                    loading="lazy"
                                />
                                <div className="volume-slider-container">
                                    <span className="material-icons">volume_down</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={logarithmicToLinear(volumeState)}
                                        onChange={handleVolumeChange}
                                        className="volume-slider-input transition-smooth"
                                        style={{
                                            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${logarithmicToLinear(volumeState)}%, rgba(255,255,255,0.2) ${logarithmicToLinear(volumeState)}%, rgba(255,255,255,0.2) 100%)`
                                        }}
                                    />
                                    <span className="material-icons">volume_up</span>
                                </div>
                                <p className="volume-percentage">{volumePercentage}%</p>
                            </div>
                        </div>
                    )}
                </div>

                <button className={`control-btn-small player-btn-transition ${isRepeat ? 'active' : ''}`} onClick={handleToggleRepeat}>
                    <span className="material-icons">{isRepeat ? 'repeat_one' : 'repeat'}</span>
                </button>
            </div>


            {/* Queue Panel */}
            <QueuePanel 
                isOpen={showQueue}
                onClose={() => setShowQueue(false)}
                queue={queueSongs}
                currentSong={currentSong}
            />

            {/* Lyrics Display */}
            {showLyrics && (
                <LyricsDisplay 
                    isVisible={showLyrics} 
                    onClose={() => setShowLyrics(false)} 
                    currentSong={currentSong}
                />
            )}
        </div>
    );
});

FullscreenPlayer.displayName = 'FullscreenPlayer';

export default FullscreenPlayer;