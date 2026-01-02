import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { getSongCoverPath } from '../utils/helpers';
import ImageWithFallback from './ImageWithFallback';

const SongRow = ({ song, index, showCover = true }) => {
    const navigate = useNavigate();
    const { playById, currentSong, isPlaying, addToQueue, queueSongs, playNext } = usePlayer();
    const { userData, toggleLike } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
    const isLiked = userData.likedSongs && userData.likedSongs.includes(song.id);
    const isCurrent = currentSong?.id === song.id;
    const isInQueue = queueSongs.some(s => s.id === song.id);

    // Split artist names
    const artists = song.artist.split(',').map(a => a.trim());

    const handleArtistClick = (e, artistName) => {
        e.stopPropagation();
        navigate(`/artist/${encodeURIComponent(artistName)}`);
    };

    const handlePlayNext = (e) => {
        e.stopPropagation();
        if (playNext) {
            playNext(song.id);
        }
        setShowMenu(false);
    };

    const handleAddToQueue = (e) => {
        e.stopPropagation();
        addToQueue(song.id);
        setShowMenu(false);
    };

    return (
        <div className={`song-row ${isCurrent ? 'playing' : ''}`} onClick={() => playById(song.id)} style={{display:'flex', alignItems:'center', padding:'6px 8px', borderBottom:'1px solid rgba(255,255,255,0.05)', cursor:'pointer', position:'relative'}}>
            <div className="song-number" style={{width:'25px', textAlign:'center', opacity:0.5, fontSize:'12px', flexShrink:0}}>{index + 1}</div>
            <div className="song-main-info" style={{flex:1, display:'flex', alignItems:'center', gap:'10px', minWidth:0}}>
                {showCover && (
                    <ImageWithFallback 
                        src={getSongCoverPath(song.cover)} 
                        alt={song.name}
                        className="song-thumb"
                        style={{width:'36px', height:'36px', borderRadius:'3px', objectFit:'cover', flexShrink:0}}
                    />
                )}
                <div style={{flex:1, minWidth:0}}>
                    <div className="song-title-text truncate-1" style={{fontWeight:700, fontSize:'13px', color: isCurrent ? 'var(--accent)' : '#fff'}}>{song.name}</div>
                    <div className="song-artists-row truncate-2" style={{fontSize:'11px', color:'rgba(255, 255, 255, 0.8)', fontWeight:500}}>
                        {artists.map((artist, i) => (
                            <React.Fragment key={artist}>
                                <span 
                                    className="song-artist-text" 
                                    onClick={(e) => handleArtistClick(e, artist)}
                                    style={{cursor:'pointer'}}
                                >
                                    {artist}
                                </span>
                                {i < artists.length - 1 && <span style={{opacity:0.5}}>, </span>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
            <div className="song-actions" style={{display:'flex', gap:'8px', alignItems:'center'}}>
                 <button 
                    className="like-btn-inline" 
                    onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }} 
                    style={{background:'transparent', border:'none', cursor:'pointer'}}
                    aria-label={isLiked ? 'Unlike song' : 'Like song'}
                 >
                    <span className="material-icons" style={{color: isLiked ? '#e91e63' : '#aaa', fontSize:'20px'}}>
                        {isLiked ? 'favorite' : 'favorite_border'}
                    </span>
                 </button>
                 <button 
                    className="song-menu-btn" 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    style={{background:'transparent', border:'none', cursor:'pointer'}}
                    aria-label="Song options"
                 >
                    <span className="material-icons" style={{color:'#aaa', fontSize:'20px'}}>more_vert</span>
                 </button>
            </div>
            
            {showMenu && (
                <>
                    <div 
                        style={{position:'fixed', inset:0, zIndex:999}} 
                        onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
                    />
                    <div 
                        style={{
                            position:'absolute',
                            right:'10px',
                            top:'50px',
                            background:'var(--dropdown-bg, rgba(20, 20, 20, 0.98))',
                            borderRadius:'8px',
                            padding:'8px',
                            minWidth:'180px',
                            boxShadow:'0 4px 12px rgba(0,0,0,0.3)',
                            zIndex:1000,
                            border:'1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <button 
                            onClick={handlePlayNext}
                            style={{
                                width:'100%',
                                padding:'10px 12px',
                                background:'transparent',
                                border:'none',
                                color:'var(--color-text)',
                                cursor:'pointer',
                                textAlign:'left',
                                borderRadius:'4px',
                                display:'flex',
                                alignItems:'center',
                                gap:'12px',
                                fontSize:'14px'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg, rgba(255,255,255,0.08))'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                            <span className="material-icons" style={{fontSize:'18px'}}>playlist_play</span>
                            Play Next
                        </button>
                        <button 
                            onClick={handleAddToQueue}
                            style={{
                                width:'100%',
                                padding:'10px 12px',
                                background:'transparent',
                                border:'none',
                                color: isInQueue ? 'var(--accent)' : 'var(--color-text)',
                                cursor:'pointer',
                                textAlign:'left',
                                borderRadius:'4px',
                                display:'flex',
                                alignItems:'center',
                                gap:'12px',
                                fontSize:'14px'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg, rgba(255,255,255,0.08))'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'
                        }
                        >
                            <span className="material-icons" style={{fontSize:'18px'}}>{isInQueue ? 'check' : 'add_to_queue'}</span>
                            {isInQueue ? 'In Queue' : 'Add to Queue'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SongRow;
