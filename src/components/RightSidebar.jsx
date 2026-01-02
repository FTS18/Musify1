import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';
import { songs } from '../services/data';
import { getSongCoverPath } from '../utils/helpers';
import ImageWithFallback from './ImageWithFallback';
import ExpandedPlayer from './Player/ExpandedPlayer';

const RightSidebar = () => {
    const { userData } = useAuth();
    const { currentSong, playById, dominantColor } = usePlayer();
    const navigate = useNavigate();

    // Get recent songs from userData
    const recentSongObjects = (userData.recentPlay || [])
        .slice(0, 5)
        .map(id => songs.find(s => s.id === id))
        .filter(Boolean);

    const [isFullView, setIsFullView] = React.useState(false);

    // Listen for expansion event
    React.useEffect(() => {
        const handleExpand = (e) => setIsFullView(e.detail);
        window.addEventListener('expandSidebarPlayer', handleExpand);
        return () => window.removeEventListener('expandSidebarPlayer', handleExpand);
    }, []);

    if (isFullView && currentSong) {
        return (
            <aside 
                className="right-sidebar full-player-view"
                style={{
                    background: `linear-gradient(180deg, rgba(${dominantColor}, 1) 0%, rgba(${dominantColor}, 0.3) 100%)`,
                    borderLeft: 'none'
                }}
            >
                <div className="rs-full-header" style={{ 
                    background: 'transparent', 
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '0px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    </div>
                <div className="rs-full-content" style={{ background: 'transparent' }}>
                    {/* Reuse ExpandedPlayer but with a 'full' prop or style */}
                    <ExpandedPlayer isFull={true} />
                </div>
            </aside>
        );
    }

    return (
        <aside className="right-sidebar">
            <div className="rs-section">
                <div className="rs-head">
                    <h3>Recent Play</h3>
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/recent'); }}>View all</a>
                </div>
                <div className="recent-play-list">
                    {recentSongObjects.length > 0 ? (
                        recentSongObjects.map(song => (
                            <div key={song.id} className="recent-play-item" onClick={() => playById(song.id)}
                                style={{display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', cursor:'pointer', borderBottom:'1px solid var(--border-color, rgba(255,255,255,0.05))', transition: 'background 0.2s'}}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg, rgba(255,255,255,0.05))'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <ImageWithFallback src={getSongCoverPath(song.cover)} alt={song.name} style={{width:'40px', height:'40px', borderRadius:'6px'}} />
                                <div style={{flex:1, overflow:'hidden'}}>
                                    <div className="recent-song-title" style={{fontWeight:600, color: 'var(--color-text-muted, rgba(255,255,255,0.6))',fontSize:'13px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', color: currentSong?.id === song.id ? 'var(--accent)' : 'var(--color-text, #fff)'}}>{song.name}</div>
                                    <div className="recent-song-artist" style={{fontSize:'11px', color: 'var(--color-text-muted, rgba(255,255,255,0.6))', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{song.artist}</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{fontSize:'13px', opacity:0.5}}>No recent plays</p>
                    )}
                </div>
            </div>

            {/* Gadget Section snapped to bottom */}
            {currentSong && (
                <div className="rs-now-playing-gadget" onClick={(e) => {
                    // Prevent expansion if clicking a button
                    if (e.target.closest('button') || e.target.closest('input')) return;
                    setIsFullView(true);
                }}>
                    <ExpandedPlayer />
                </div>
            )}
        </aside>
    );
};

export default RightSidebar;
