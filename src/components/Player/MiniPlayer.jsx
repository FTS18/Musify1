import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../../contexts/PlayerContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatTime, getSongCoverPath } from '../../utils/helpers';
import ImageWithFallback from '../ImageWithFallback';
import QueuePanel from './QueuePanel';
import './MiniPlayer.css';

const MiniPlayer = ({ onExpand }) => {
    const { currentSong, isPlaying, toggle, next, prev, currentTime, duration, queueSongs } = usePlayer();
    const { toggleLike, userData } = useAuth();
    const [showQueue, setShowQueue] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);

    if (!currentSong) return null;

    const isLiked = userData?.likedSongs?.includes(currentSong?.id);
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <>
            <div 
                className="mini-player"
                style={{ 
                    background: `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.8) 100%)`
                }}
                onClick={onExpand}
            >
                {/* Progress Bar */}
                <div className="mini-progress-bar">
                    <div className="mini-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>

                {/* Content */}
                <div className="mini-content">
                    {/* Left: Image + Info */}
                    <div className="mini-left">
                        <ImageWithFallback 
                            src={getSongCoverPath(currentSong.cover)} 
                            alt={currentSong.name}
                            className="mini-artwork"
                        />
                        
                        <div className="mini-info" onClick={onExpand}>
                            <div className="mini-title">{currentSong.name}</div>
                            <div className="mini-artist">{currentSong.artist}</div>
                        </div>
                    </div>

                    {/* Right: Controls */}
                    <div className="mini-controls">
                        <button className="mini-btn" onClick={prev}>
                            <span className="material-icons">skip_previous</span>
                        </button>
                        <button className="mini-btn mini-play-btn" onClick={toggle}>
                            <span className="material-icons">{isPlaying ? 'pause' : 'play_arrow'}</span>
                        </button>
                        <button className="mini-btn" onClick={next}>
                            <span className="material-icons">skip_next</span>
                        </button>
                        <div className="mini-btn-menu">
                            <button className="mini-btn mini-add-btn" onClick={() => setShowAddMenu(!showAddMenu)}>
                                <span className="material-icons">add_circle</span>
                            </button>
                            {showAddMenu && (
                                <div className="mini-add-menu">
                                    <button className="mini-menu-item" onClick={() => {
                                        toggleLike(currentSong.id);
                                        setShowAddMenu(false);
                                    }}>
                                        <span className="material-icons">{isLiked ? 'favorite' : 'favorite_border'}</span>
                                        <span>{isLiked ? 'Remove from Liked' : 'Add to Liked'}</span>
                                    </button>
                                    <button className="mini-menu-item">
                                        <span className="material-icons">playlist_add</span>
                                        <span>Add to Playlist</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Queue Panel */}
            <QueuePanel 
                isOpen={showQueue}
                onClose={() => setShowQueue(false)}
                queue={queueSongs}
                currentSong={currentSong}
            />
        </>
    );
};

export default MiniPlayer;