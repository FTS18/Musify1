import React from 'react';
import { getSongCoverPath } from '../../utils/helpers';
import './QueuePanel.css';

const QueuePanel = ({ isOpen, onClose, queue, currentSong, onPlaySong }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="queue-backdrop" onClick={onClose}></div>

            {/* Queue Slide-in Panel */}
            <div className={`queue-panel ${isOpen ? 'active' : ''}`}>
                {/* Header */}
                <div className="queue-header">
                    <button className="queue-back-btn" onClick={onClose}>
                        <span className="material-icons">close</span>
                    </button>
                    <h2 className="queue-title">Queue</h2>
                    <div className="queue-count">
                        {queue.length} {queue.length === 1 ? 'song' : 'songs'}
                    </div>
                </div>

                {/* Current Song */}
                {currentSong && (
                    <div className="queue-current-section">
                        <div className="queue-label">Now Playing</div>
                        <div className="queue-song current-song">
                            <img 
                                src={getSongCoverPath(currentSong.cover)} 
                                alt={currentSong.name}
                                className="queue-song-cover"
                            />
                            <div className="queue-song-info">
                                <div className="queue-song-name">{currentSong.name}</div>
                                <div className="queue-song-artist">{currentSong.artist}</div>
                            </div>
                            <div className="queue-now-playing">
                                <span className="material-icons">volume_up</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Queue List */}
                <div className="queue-list-section">
                    <div className="queue-label">Next Up</div>
                    {queue.length === 0 ? (
                        <div className="queue-empty">
                            <p>No songs in queue</p>
                            <p className="queue-empty-hint">Add songs to continue playing</p>
                        </div>
                    ) : (
                        <div className="queue-list">
                            {queue.map((song, index) => (
                                <div 
                                    key={`${song.id}-${index}`} 
                                    className="queue-song"
                                    onClick={() => {
                                        onPlaySong(index);
                                        onClose();
                                    }}
                                >
                                    <div className="queue-song-index">{index + 1}</div>
                                    <img 
                                        src={getSongCoverPath(song.cover)} 
                                        alt={song.name}
                                        className="queue-song-cover"
                                    />
                                    <div className="queue-song-info">
                                        <div className="queue-song-name">{song.name}</div>
                                        <div className="queue-song-artist">{song.artist}</div>
                                    </div>
                                    <button 
                                        className="queue-remove-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Implement remove functionality
                                        }}
                                    >
                                        <span className="material-icons">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default QueuePanel;
