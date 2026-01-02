import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../contexts/PlayerContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatTime, getSongCoverPath } from '../../utils/helpers';
import ImageWithFallback from '../ImageWithFallback';
import ElasticSlider from '../ElasticSlider';
import LyricsDisplay from '../LyricsDisplay';
import './ExpandedPlayer.css';

const ExpandedPlayer = ({ isFull }) => {
    const navigate = useNavigate();
    const { 
        currentSong, isPlaying, toggle, next, prev, 
        currentTime, duration, seek, isShuffle, 
        setIsShuffle, isRepeat, setIsRepeat, setVolume, dominantColor 
    } = usePlayer();
    const { toggleLike, userData } = useAuth();
    const [volumeState, setVolumeState] = useState(1);
    const [showVolume, setShowVolume] = useState(false);
    const [showLyrics, setShowLyrics] = useState(false);

    if (!currentSong) return null;

    const isLiked = userData?.likedSongs?.includes(currentSong?.id);
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleVolumeChange = (e) => {
        const val = parseFloat(e.target.value);
        setVolumeState(val);
        setVolume(val);
    };

    const handleSeek = (e) => {
        const value = parseFloat(e.target.value);
        seek(value);
    };

    if (isFull) {
        return (
            <div className="full-sidebar-player" style={{
                background: `linear-gradient(180deg, rgba(${dominantColor}, 0.1) 0%, #0a0a0a 100%)`
            }}>
                {/* Header with back and queue buttons */}
                <div className="full-player-header">
                    <button className="full-back-btn" onClick={() => window.dispatchEvent(new CustomEvent('expandSidebarPlayer', { detail: false }))}>
                        <span className="material-icons">keyboard_arrow_down</span>
                    </button>
                    <button className="full-queue-btn-top" onClick={() => navigate('/queue')} title="Open Queue">
                        <span className="material-icons">queue_music</span>
                    </button>
                </div>
                {/* Artwork with volume overlay */}
                <div className="full-art-wrapper">
                    <img 
                        src={getSongCoverPath(currentSong.cover)} 
                        alt={currentSong.title} 
                        className="full-art-large" 
                    />
                    {showVolume && (
                        <div className="full-volume-overlay">
                            <ElasticSlider
                                value={volumeState}
                                min={0}
                                max={1}
                                onChange={(val) => { setVolumeState(val); setVolume(val); }}
                                leftIcon={<span className="material-icons slider-icon">volume_down</span>}
                                rightIcon={<span className="material-icons slider-icon">volume_up</span>}
                                accentColor="#fff"
                            />
                        </div>
                    )}
                </div>

                {/* Song Info with Heart Button */}
                <div className="full-song-info">
                    <div className="full-song-header">
                        <div className="full-song-text">
                            <h2 className="full-song-title">{currentSong.title}</h2>
                            <p className="full-song-artist" style={{cursor:'default'}}>
                                {currentSong.artist.split(',').map((a, i, arr) => (
                                    <span 
                                        key={i}
                                        onClick={(e) => { e.stopPropagation(); navigate(`/artist/${encodeURIComponent(a.trim())}`); }}
                                        className="full-artist-link"
                                    >
                                        {a.trim()}{i < arr.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                            </p>
                        </div>
                        <button className="full-heart-btn" onClick={() => toggleLike(currentSong.id)} title="Add to Liked">
                            <span className="material-icons" style={{ color: isLiked ? '#ff2d55' : 'rgba(255,255,255,0.7)' }}>
                                {isLiked ? 'favorite' : 'favorite_border'}
                            </span>
                        </button>
                        <button className="full-radio-btn" onClick={() => navigate(`/radio/${currentSong.id}`)} title="Go to Radio">
                            <span className="material-icons">radio</span>
                        </button>
                        <button className="full-lyrics-btn" onClick={() => setShowLyrics(true)} title="Show Lyrics">
                            <span className="material-icons">lyrics</span>
                        </button>
                    </div>
                </div>

                {/* Progress Seekbar */}
                <div className="full-progress-section">
                    <input 
                        type="range" min="0" max={duration || 0} 
                        value={currentTime} step="0.1"
                        onChange={handleSeek}
                        className="full-progress-bar"
                    />
                    <div className="full-time-display">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Main Play Controls */}
                <div className="full-controls-row">
                    <button className="full-control-btn" onClick={() => setIsShuffle(!isShuffle)} style={{ color: isShuffle ? `rgb(${dominantColor})` : 'rgba(255,255,255,0.7)' }} title="Shuffle">
                        <span className="material-icons">shuffle</span>
                    </button>
                    <button className="full-control-btn" onClick={prev} title="Previous">
                        <span className="material-icons">skip_previous</span>
                    </button>
                    <button className="full-play-btn-large" onClick={toggle} style={{ 
                        background: `rgb(${dominantColor})`,
                        boxShadow: `0 16px 40px rgba(${dominantColor}, 0.6)`
                    }} title={isPlaying ? 'Pause' : 'Play'}>
                        <span className="material-icons">{isPlaying ? 'pause' : 'play_arrow'}</span>
                    </button>
                    <button className="full-control-btn" onClick={next} title="Next">
                        <span className="material-icons">skip_next</span>
                    </button>
                    <button className="full-control-btn" onClick={() => setIsRepeat(!isRepeat)} style={{ color: isRepeat ? `rgb(${dominantColor})` : 'rgba(255,255,255,0.7)' }} title="Repeat">
                        <span className="material-icons">{isRepeat ? 'repeat_one' : 'repeat'}</span>
                    </button>
                </div>

                {/* Only Radio Button */}
                <div className="full-quick-actions">
                    <button className="full-action-btn" onClick={() => navigate(`/radio/${currentSong.id}`)} title="Go to Radio">
                        <span className="material-icons">radio</span>
                    </button>
                </div>

                {/* Lyrics Display */}
                <LyricsDisplay 
                    isVisible={showLyrics} 
                    onClose={() => setShowLyrics(false)} 
                    currentSong={currentSong}
                />


            </div>
        );
    }

    return (
        <div className="ios-widget" style={{ 
            background: `linear-gradient(145deg, rgba(${dominantColor}, 0.4) 0%, rgba(${dominantColor}, 0.1) 100%)`,
            boxShadow: `0 12px 40px rgba(${dominantColor}, 0.4)`,
            borderColor: `rgba(${dominantColor}, 0.4)`,
            backdropFilter: 'blur(40px)'
        }}>
            {/* Left: Control Grid */}
            <div className="widget-controls">
                <div className="control-grid">
                    <button className="widget-btn" onClick={() => setShowVolume(!showVolume)} style={{ background: `rgba(${dominantColor}, 0.2)` }}>
                        <span className="material-icons">{volumeState === 0 ? 'volume_off' : 'volume_up'}</span>
                    </button>
                    <button className="widget-play-btn" onClick={toggle} style={{ background: `rgb(${dominantColor})`, color: '#fff', boxShadow: `0 4px 15px rgba(${dominantColor}, 0.5)` }}>
                        <span className="material-icons">
                            {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                    </button>
                    <button className="widget-btn" onClick={prev} style={{ background: `rgba(${dominantColor}, 0.2)` }}>
                        <span className="material-icons">skip_previous</span>
                    </button>
                    <button className="widget-btn" onClick={next} style={{ background: `rgba(${dominantColor}, 0.2)` }}>
                        <span className="material-icons">skip_next</span>
                    </button>
                </div>
            </div>

            {/* Right: Artwork & Info */}
            <div className="widget-display">
                <div className="widget-artwork-box" style={{ boxShadow: `0 8px 20px rgba(0,0,0,0.3)` }}>
                    <ImageWithFallback 
                        src={getSongCoverPath(currentSong.cover)} 
                        alt={currentSong.title}
                        className="widget-artwork"
                    />

                    {/* Like button in bottom right of cover */}
                    <button 
                        className="widget-art-like-btn" 
                        onClick={(e) => { e.stopPropagation(); toggleLike(currentSong.id); }}
                    >
                        <span className="material-icons" style={{ color: isLiked ? '#ff2d55' : '#fff' }}>
                            {isLiked ? 'favorite' : 'favorite_border'}
                        </span>
                    </button>
                    
                    {showVolume ? (
                        <div className="widget-volume-overlay" style={{ background: `rgba(${dominantColor}, 0.8)` }}>
                            <input 
                                type="range" min="0" max="1" step="0.01" 
                                value={volumeState} 
                                onChange={handleVolumeChange} 
                            />
                        </div>
                    ) : (
                        <>
                            <div className="widget-time-overlay" style={{ background: `rgba(${dominantColor}, 0.6)` }}>
                                {formatTime(currentTime)}
                            </div>
                            <div className="widget-info-overlay">
                                <div className="widget-title" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>{currentSong.title}</div>
                                <div className="widget-artist" style={{cursor:'default'}}>
                                    {currentSong.artist.split(',').map((a, i, arr) => (
                                        <span 
                                            key={i}
                                            onClick={(e) => { e.stopPropagation(); navigate(`/artist/${encodeURIComponent(a.trim())}`); }}
                                            className="hover-underline"
                                            style={{cursor:'pointer', display:'inline'}}
                                        >
                                            {a.trim()}{i < arr.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="widget-bottom-actions">
                <button 
                    className={`widget-action-btn ${isShuffle ? 'active' : ''}`}
                    onClick={() => setIsShuffle(!isShuffle)}
                    style={{ color: isShuffle ? `rgb(${dominantColor})` : 'rgba(255,255,255,0.4)' }}
                >
                    <span className="material-icons">shuffle</span>
                </button>
                <button 
                    className={`widget-action-btn ${isRepeat ? 'active' : ''}`}
                    onClick={() => setIsRepeat(!isRepeat)}
                    style={{ color: isRepeat ? `rgb(${dominantColor})` : 'rgba(255,255,255,0.4)' }}
                >
                    <span className="material-icons">{isRepeat ? 'repeat_one' : 'repeat'}</span>
                </button>
            </div>

            {/* Premium Seekbar Strip (Internal) */}
            <div className="widget-premium-seekbar" style={{ background: `rgba(${dominantColor}, 0.1)` }}>
                <input 
                    type="range" min="0" max={duration || 0} 
                    value={currentTime} step="0.1"
                    onChange={handleSeek}
                />
                <div className="progress-bg"></div>
                <div className="progress-fill" style={{width: `${progress}%`, background: `rgb(${dominantColor})`, boxShadow: `0 0 10px rgb(${dominantColor})` }}></div>
            </div>
        </div>
    );
};

export default ExpandedPlayer;
