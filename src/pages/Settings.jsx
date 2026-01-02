import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePageColor } from '../contexts/PageColorContext';
import { usePlayer } from '../contexts/PlayerContext';
import PageHeader from '../components/PageHeader';
import SleepTimer from '../components/SleepTimer';

const Settings = () => {
    const { currentUser, userData } = useAuth();
    const { crossfadeEnabled, setCrossfadeEnabled, crossfadeDuration, setCrossfadeDuration } = usePlayer();
    const navigate = useNavigate();
    const { setPageColor } = usePageColor();
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [showSleepTimer, setShowSleepTimer] = useState(false);

    useEffect(() => {
        setPageColor('168, 85, 247'); // Purple
    }, [setPageColor]);

    if (!currentUser) {
        return (
            <div className="content-padding" style={{textAlign:'center', marginTop:'100px'}}>
                <h2>Login Required</h2>
                <button onClick={() => navigate('/login')} style={{marginTop:'20px', padding:'10px 30px', borderRadius:'20px', background:'var(--accent)', color:'white', border:'none', cursor:'pointer'}}>
                    Login
                </button>
            </div>
        );
    }

    const toggleTheme = () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        setIsDarkMode(!isDarkMode);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const exportSettings = () => {
        const settings = {
            theme: isDarkMode ? 'dark' : 'light',
            likedSongs: userData.likedSongs || [],
            followedArtists: userData.followedArtists || [],
            playlists: userData.playlists || [],
            exportedAt: new Date().toISOString()
        };
        const dataStr = JSON.stringify(settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `musify-settings-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const importSettings = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const settings = JSON.parse(event.target.result);
                localStorage.setItem('importedSettings', JSON.stringify(settings));
                alert('Settings imported successfully! Please refresh the page.');
            } catch (error) {
                alert('Error importing settings: Invalid file format');
            }
        };
        reader.readAsText(file);
    };

    const shareProfile = () => {
        const link = `${window.location.origin}/profile`;
        setShareLink(link);
        setShareModalOpen(true);
        navigator.clipboard.writeText(link);
    };

    return (
        <div className="content-padding">
            <PageHeader 
                title="Settings"
                subtitle="Manage your preferences"
                gradient={['#a855f7', '#9333ea']}
                icon="settings"
            />

            {/* Audio Settings */}
            <div className="settings-card" style={{background: 'var(--card-bg, rgba(255, 255, 255, 0.05))', borderRadius: '16px', padding: '24px', marginBottom: '24px', marginLeft: '32px', marginRight: '32px'}}>
                <h3 style={{marginBottom: '20px', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)'}}>
                    <span className="material-icons">audiotrack</span>
                    Audio Settings
                </h3>
                
                {/* Crossfade Toggle */}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))'}}>
                    <div>
                        <p style={{fontWeight: 600, marginBottom: '4px', color: 'var(--color-text)'}}>Crossfade</p>
                        <p style={{fontSize: '14px', color: 'var(--color-text-muted, rgba(255, 255, 255, 0.6))'}}>Smooth transitions between songs</p>
                    </div>
                    <button
                        onClick={() => setCrossfadeEnabled(!crossfadeEnabled)}
                        style={{
                            width: '60px',
                            height: '32px',
                            borderRadius: '16px',
                            border: 'none',
                            background: crossfadeEnabled ? 'var(--accent)' : 'rgba(255, 255, 255, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            position: 'relative'
                        }}
                    >
                        <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '14px',
                            background: 'white',
                            position: 'absolute',
                            top: '2px',
                            left: crossfadeEnabled ? '30px' : '2px',
                            transition: 'all 0.3s'
                        }}></div>
                    </button>
                </div>

                {/* Crossfade Duration */}
                {crossfadeEnabled && (
                    <div style={{paddingTop: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))'}}>
                        <p style={{fontWeight: 600, marginBottom: '12px', color: 'var(--color-text)'}}>Crossfade Duration: {crossfadeDuration}s</p>
                        <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={crossfadeDuration} 
                            onChange={(e) => setCrossfadeDuration(parseInt(e.target.value))}
                            style={{
                                width: '100%',
                                height: '4px',
                                borderRadius: '2px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        />
                        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px'}}>
                            <span>1s</span>
                            <span>10s</span>
                        </div>
                    </div>
                )}

                {/* Sleep Timer */}
                <div style={{paddingTop: '20px'}}>
                    <button 
                        onClick={() => setShowSleepTimer(true)}
                        style={{padding: '12px 24px', background: 'var(--card-bg, rgba(255, 255, 255, 0.1))', color: 'var(--color-text)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}
                    >
                        <span className="material-icons">bedtime</span>
                        Sleep Timer
                    </button>
                    <p style={{marginTop: '8px', fontSize: '14px', color: 'var(--color-text-muted, rgba(255, 255, 255, 0.6))'}}>
                        Set a timer to automatically stop music playback
                    </p>
                </div>
            </div>
            <div className="settings-card" style={{background: 'var(--card-bg, rgba(255, 255, 255, 0.05))', borderRadius: '16px', padding: '24px', marginBottom: '24px', marginLeft: '32px', marginRight: '32px'}}>
                <h3 style={{marginBottom: '20px', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)'}}>
                    <span className="material-icons">palette</span>
                    Appearance
                </h3>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))'}}>
                    <div>
                        <p style={{fontWeight: 600, marginBottom: '4px', color: 'var(--color-text)'}}>Dark Mode</p>
                        <p style={{fontSize: '14px', color: 'var(--color-text-muted, rgba(255, 255, 255, 0.6))'}}>Toggle between light and dark themes</p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        style={{
                            width: '60px',
                            height: '32px',
                            borderRadius: '16px',
                            border: 'none',
                            background: isDarkMode ? 'var(--accent)' : 'rgba(255, 255, 255, 0.2)',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            position: 'relative'
                        }}
                    >
                        <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '14px',
                            background: 'white',
                            position: 'absolute',
                            top: '2px',
                            left: isDarkMode ? '30px' : '2px',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span className="material-icons" style={{fontSize: '16px', color: '#000'}}>
                                {isDarkMode ? 'dark_mode' : 'light_mode'}
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Data Management */}
            <div className="settings-card" style={{background: 'var(--card-bg, rgba(255, 255, 255, 0.05))', borderRadius: '16px', padding: '24px', marginBottom: '24px', marginLeft: '32px', marginRight: '32px'}}>
                <h3 style={{marginBottom: '20px', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)'}}>
                    <span className="material-icons">backup</span>
                    Backup & Restore
                </h3>
                
                <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
                    <button onClick={exportSettings} style={{padding: '12px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <span className="material-icons">download</span>
                        Export Settings
                    </button>
                    <label style={{cursor: 'pointer'}}>
                        <input type="file" accept=".json" onChange={importSettings} style={{display: 'none'}} />
                        <span style={{padding: '12px 24px', background: 'var(--card-bg, rgba(255, 255, 255, 0.1))', color: 'var(--color-text)', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600}}>
                            <span className="material-icons">upload</span>
                            Import Settings
                        </span>
                    </label>
                </div>
                <p style={{marginTop: '12px', fontSize: '14px', color: 'var(--color-text-muted, rgba(255, 255, 255, 0.6))'}}>
                    Export your settings, liked songs, and followed artists. Import to restore from backup.
                </p>
            </div>

            {/* Social Sharing */}
            <div className="settings-card" style={{background: 'var(--card-bg, rgba(255, 255, 255, 0.05))', borderRadius: '16px', padding: '24px', marginBottom: '24px', marginLeft: '32px', marginRight: '32px'}}>
                <h3 style={{marginBottom: '20px', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)'}}>
                    <span className="material-icons">share</span>
                    Social
                </h3>
                
                <button onClick={shareProfile} style={{padding: '12px 24px', background: 'var(--card-bg, rgba(255, 255, 255, 0.1))', color: 'var(--color-text)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span className="material-icons">person</span>
                    Share Profile
                </button>
                <p style={{marginTop: '12px', fontSize: '14px', color: 'var(--color-text-muted, rgba(255, 255, 255, 0.6))'}}>
                    Share your profile with friends and let them see what you're listening to.
                </p>
            </div>

            {/* Account */}
            <div className="settings-card" style={{background: 'var(--card-bg, rgba(255, 255, 255, 0.05))', borderRadius: '16px', padding: '24px', marginBottom: '24px', marginLeft: '32px', marginRight: '32px'}}>
                <h3 style={{marginBottom: '20px', fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)'}}>
                    <span className="material-icons">account_circle</span>
                    Account
                </h3>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    <button onClick={() => navigate('/profile')} style={{padding: '12px 24px', background: 'var(--card-bg, rgba(255, 255, 255, 0.1))', color: 'var(--color-text)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <span className="material-icons">person</span>
                        View Profile
                    </button>
                    <button style={{padding: '12px 24px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <span className="material-icons">delete</span>
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Sleep Timer Modal */}
            {showSleepTimer && (
                <SleepTimer onClose={() => setShowSleepTimer(false)} />
            )}

            {/* Share Modal */}
            {shareModalOpen && (
                <div onClick={() => setShareModalOpen(false)} style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000
                }}>
                    <div onClick={(e) => e.stopPropagation()} style={{
                        background: 'var(--modal-bg, #1a1a1a)',
                        padding: '32px',
                        borderRadius: '16px',
                        maxWidth: '500px',
                        width: '90%'
                    }}>
                        <h3 style={{marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)'}}>
                            <span className="material-icons">check_circle</span>
                            Link Copied!
                        </h3>
                        <p style={{marginBottom: '16px', color: 'var(--color-text-muted, rgba(255, 255, 255, 0.8))'}}>
                            Your profile link has been copied to clipboard.
                        </p>
                        <div style={{background: 'var(--card-bg, rgba(255, 255, 255, 0.1))', padding: '12px', borderRadius: '8px', marginBottom: '20px', wordBreak: 'break-all', fontSize: '14px', color: 'var(--color-text)'}}>
                            {shareLink}
                        </div>
                        <button onClick={() => setShareModalOpen(false)} style={{padding: '10px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, width: '100%'}}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
