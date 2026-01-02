import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePageColor } from '../contexts/PageColorContext';
import { Image } from '../components/ImageWithFallback';
import PageHeader from '../components/PageHeader';

const Profile = () => {
    const { currentUser, logout, userData } = useAuth();
    const navigate = useNavigate();
    const { setPageColor } = usePageColor();
    const [listeningStats, setListeningStats] = useState({
        totalSongs: userData.likedSongs?.length || 0,
        followedArtists: userData.followedArtists?.length || 0,
        playlists: userData.playlists?.length || 0,
        totalListens: Math.floor(Math.random() * 10000) + 1000
    });

    useEffect(() => {
        setPageColor('236, 72, 153'); // Pink gradient
    }, [setPageColor]);

    if (!currentUser) return (
        <div className="content-padding" style={{textAlign:'center', marginTop:'100px'}}>
            <h2>Login Required</h2>
            <button onClick={() => navigate('/login')} className="btn-primary" style={{marginTop:'20px', padding:'10px 30px', borderRadius:'20px', background:'var(--accent)', color:'white', border:'none', cursor:'pointer'}}>
                Login
            </button>
        </div>
    );

    return (
        <div className="content-padding">
            <PageHeader 
                title="My Profile"
                subtitle={`@${currentUser.displayName || 'User'}`}
                gradient={['#ec4899', '#db2777']}
                icon="person"
            />

            {/* Profile Card */}
            <div className="profile-card" style={{background: 'var(--card-bg, rgba(255, 255, 255, 0.05))', borderRadius: '16px', padding: '32px', marginBottom: '32px', marginLeft: '32px', marginRight: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap'}}>
                <div style={{display: 'flex', gap: '30px', alignItems: 'center'}}>
                    <Image 
                        src={currentUser.photoURL} 
                        alt={currentUser.displayName || 'User'}
                        circle 
                        size="large"
                        style={{border:'4px solid var(--accent)'}}
                    />
                    <div>
                        <h2 style={{fontSize: '28px', marginBottom: '8px', color: 'var(--color-text)'}}>{currentUser.displayName || 'User'}</h2>
                        <p style={{color: 'var(--color-text-muted, rgba(255, 255, 255, 0.6))', marginBottom: '12px'}}>{currentUser.email}</p>
                        <p style={{fontSize: '14px', color: 'var(--color-text-muted, rgba(255, 255, 255, 0.5))'}}>Member since {new Date(currentUser.metadata?.creationTime || Date.now()).toLocaleDateString()}</p>
                    </div>
                </div>
                <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
                    <button onClick={() => navigate('/settings')} style={{padding:'10px 24px', background:'var(--accent)', color:'white', border:'none', borderRadius:'24px', cursor:'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <span className="material-icons" style={{fontSize: '18px'}}>settings</span>
                        Settings
                    </button>
                    <button onClick={logout} style={{padding:'10px 24px', background:'transparent', border:'1px solid var(--accent)', color:'var(--accent)', borderRadius:'24px', cursor:'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <span className="material-icons" style={{fontSize: '18px'}}>logout</span>
                        Logout
                    </button>
                </div>
            </div>

            {/* Stats Section */}
            <div style={{marginLeft: '32px', marginRight: '32px', marginBottom: '32px'}}>
                <h3 style={{marginBottom: '20px', fontSize: '20px', fontWeight: 600, color: 'var(--color-text)'}}>Your Stats</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px'}}>
                    <div className="stat-card" style={{background: 'var(--card-bg, rgba(255, 255, 255, 0.05))', borderRadius: '12px', padding: '24px', textAlign: 'center'}}>
                        <div style={{fontSize: '32px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px'}}>{listeningStats.totalSongs}</div>
                        <p style={{color: 'var(--color-text-muted, rgba(255, 255, 255, 0.6))', fontSize: '14px'}}>Liked Songs</p>
                    </div>
                    <div className="stat-card" style={{background: 'var(--card-bg, rgba(255, 255, 255, 0.05))', borderRadius: '12px', padding: '24px', textAlign: 'center'}}>
                        <div style={{fontSize: '32px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px'}}>{listeningStats.followedArtists}</div>
                        <p style={{color: 'var(--color-text-muted, rgba(255, 255, 255, 0.6))', fontSize: '14px'}}>Followed Artists</p>
                    </div>
                    <div className="stat-card" style={{background: 'var(--card-bg, rgba(255, 255, 255, 0.05))', borderRadius: '12px', padding: '24px', textAlign: 'center'}}>
                        <div style={{fontSize: '32px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px'}}>{listeningStats.playlists}</div>
                        <p style={{color: 'var(--color-text-muted, rgba(255, 255, 255, 0.6))', fontSize: '14px'}}>Playlists</p>
                    </div>
                    <div className="stat-card" style={{background: 'var(--card-bg, rgba(255, 255, 255, 0.05))', borderRadius: '12px', padding: '24px', textAlign: 'center'}}>
                        <div style={{fontSize: '32px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px'}}>{listeningStats.totalListens.toLocaleString()}</div>
                        <p style={{color: 'var(--color-text-muted, rgba(255, 255, 255, 0.6))', fontSize: '14px'}}>Total Listens</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{marginLeft: '32px', marginRight: '32px', marginBottom: '32px'}}>
                <h3 style={{marginBottom: '20px', fontSize: '20px', fontWeight: 600, color: 'var(--color-text)'}}>Quick Actions</h3>
                <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
                    <button onClick={() => navigate('/liked')} style={{padding: '12px 24px', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent)', border: '2px solid var(--accent)', borderRadius: '24px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'}} onMouseEnter={e => {e.target.style.background = 'var(--accent)'; e.target.style.color = '#fff';}} onMouseLeave={e => {e.target.style.background = 'rgba(239, 68, 68, 0.2)'; e.target.style.color = 'var(--accent)'}} className="hover-btn">
                        <span className="material-icons" style={{fontSize: '20px'}}>favorite</span>
                        View Liked Songs
                    </button>
                    <button onClick={() => navigate('/all-artists')} style={{padding: '12px 24px', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent)', border: '2px solid var(--accent)', borderRadius: '24px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'}} onMouseEnter={e => {e.target.style.background = 'var(--accent)'; e.target.style.color = '#fff';}} onMouseLeave={e => {e.target.style.background = 'rgba(239, 68, 68, 0.2)'; e.target.style.color = 'var(--accent)'}} className="hover-btn">
                        <span className="material-icons" style={{fontSize: '20px'}}>groups</span>
                        Manage Following
                    </button>
                    <button onClick={() => navigate('/library')} style={{padding: '12px 24px', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent)', border: '2px solid var(--accent)', borderRadius: '24px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s'}} onMouseEnter={e => {e.target.style.background = 'var(--accent)'; e.target.style.color = '#fff';}} onMouseLeave={e => {e.target.style.background = 'rgba(239, 68, 68, 0.2)'; e.target.style.color = 'var(--accent)'}} className="hover-btn">
                        <span className="material-icons" style={{fontSize: '20px'}}>library_music</span>
                        My Library
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
