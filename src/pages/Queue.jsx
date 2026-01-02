import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { songs } from '../services/data';
import SongRow from '../components/SongRow';
import PageHeader from '../components/PageHeader';
import AnimatedList from '../components/AnimatedList';
import { usePageColor } from '../contexts/PageColorContext';

const Queue = () => {
    const { userData } = useAuth();
    const { setPageColor } = usePageColor();
    const { queueSongs, currentSongId, removeFromQueue, reorderQueue } = usePlayer();
    const [draggedItem, setDraggedItem] = useState(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    useEffect(() => {
        setPageColor('59, 130, 246'); // Blue
    }, [setPageColor]);

    const handleDragStart = (e, index) => {
        setDraggedItem(index);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, targetIndex) => {
        e.preventDefault();
        if (draggedItem !== null && draggedItem !== targetIndex) {
            reorderQueue(draggedItem, targetIndex);
        }
        setDraggedItem(null);
    };

    const handleClearQueue = () => {
        queueSongs.forEach(song => removeFromQueue(song.id));
        setShowClearConfirm(false);
    };

    return (
        <div className="content-padding">
            <PageHeader 
                title="Queue"
                subtitle={`${queueSongs.length} songs in queue`}
                gradient={['#3b82f6', '#60a5fa']}
                image="/assets/images/cover/skyfall.jpg"
            />

            {/* Queue Controls */}
            <div style={{marginLeft: '32px', marginRight: '32px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{fontSize: '14px', color: 'var(--color-text-muted, rgba(255, 255, 255, 0.6))', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span className="material-icons" style={{fontSize: '18px'}}>info</span>
                    Drag songs to reorder | Click X to remove
                </div>
                {queueSongs.length > 0 && (
                    <button 
                        onClick={() => setShowClearConfirm(true)}
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            border: '1px solid #ef4444',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span className="material-icons" style={{fontSize: '18px'}}>delete</span>
                        Clear Queue
                    </button>
                )}
            </div>

            {/* Clear Confirmation Dialog */}
            {showClearConfirm && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000
                }}>
                    <div style={{
                        background: 'var(--modal-bg, rgba(0, 0, 0, 0.95))',
                        padding: '32px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        maxWidth: '400px'
                    }}>
                        <p style={{marginBottom: '24px', fontSize: '16px', color: 'var(--color-text)'}}>Are you sure you want to clear the entire queue?</p>
                        <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
                            <button onClick={() => setShowClearConfirm(false)} style={{padding: '10px 24px', background: 'var(--card-bg, rgba(255, 255, 255, 0.1))', color: 'var(--color-text)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600}}>
                                Cancel
                            </button>
                            <button onClick={handleClearQueue} style={{padding: '10px 24px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600}}>
                                Clear Queue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Queue List */}
            <div className="song-list" style={{height:'65vh', paddingLeft: '32px', paddingRight: '32px'}}>
                {queueSongs.length > 0 ? (
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {queueSongs.map((song, index) => (
                            <div
                                key={song.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                                className="queue-item-row"
                                style={{
                                    background: currentSongId === song.id ? 'rgba(239, 68, 68, 0.2)' : 'var(--card-bg, rgba(255, 255, 255, 0.03))',
                                    borderLeft: currentSongId === song.id ? '3px solid #ef4444' : 'none',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    cursor: 'grab',
                                    opacity: draggedItem === index ? 0.5 : 1,
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{display: 'flex', gap: '12px', alignItems: 'center', flex: 1}}>
                                    <span style={{opacity: 0.5, fontSize: '14px', minWidth: '30px', color: 'var(--color-text)'}}>{index + 1}.</span>
                                    <img src={`/assets/images/cover/${song.cover}`} alt={song.name} style={{width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover'}} />
                                    <div style={{flex: 1, overflow: 'hidden'}}>
                                        <p style={{fontSize: '14px', fontWeight: 600, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--color-text)'}}>{song.name}</p>
                                        <p style={{fontSize: '12px', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--color-text-muted, rgba(255, 255, 255, 0.6))'}}>{song.artist}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFromQueue(song.id)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--color-text-muted, rgba(255, 255, 255, 0.6))',
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                        padding: '4px 12px'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{opacity:0.6}}>No songs in queue. Start playing a song to fill the queue!</p>
                )}
            </div>
        </div>
    );
};

export default Queue;
