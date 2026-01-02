import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Image } from './ImageWithFallback';

const Sidebar = ({ isMobileMenuOpen, onMobileMenuClose }) => {
    const { userData, currentUser } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleNavClick = (path) => {
        navigate(path);
        if (onMobileMenuClose) {
            onMobileMenuClose();
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div className="mobile-menu-overlay" onClick={onMobileMenuClose}></div>
            )}
            
            <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="logo-container">
                    <Image src="/assets/images/Musify.svg" alt="Musify" className="logo-icon" noFallback />
                    <span className="logo-text">Musify</span>
                </div>

                <ul className="nav-links">
                    <li className={isActive('/')} onClick={() => handleNavClick('/')}>Home</li>
                    <li className={isActive('/trending')} onClick={() => handleNavClick('/trending')}>Trending</li>
                    <li className={isActive('/library')} onClick={() => handleNavClick('/library')}>Library</li>
                    <li className={isActive('/queue')} onClick={() => handleNavClick('/queue')}>Queue</li>
                    <li className={isActive('/liked')} onClick={() => handleNavClick('/liked')}>Liked Songs</li>
                    <li className={isActive('/recent')} onClick={() => handleNavClick('/recent')}>Recent</li>
                    <li className={isActive('/settings')} onClick={() => handleNavClick('/settings')}>Settings</li>
                </ul>

                <div className="library-section followed-artists-section" style={{marginTop:'20px', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'20px'}}>
                    <div className="library-header" style={{padding:'0 24px', marginBottom:'12px', fontSize:'12px', fontWeight:700, opacity:0.6, textTransform:'uppercase', letterSpacing:'1px'}}>
                        Following
                    </div>
                    <div id="followedArtistsContainer" style={{maxHeight:'200px', overflowY:'auto'}}>
                        {userData.followedArtists && userData.followedArtists.length > 0 ? (
                            userData.followedArtists.map(name => {
                                const data = userData.followedArtistsData?.[name] || {};
                                return (
                                    <div key={name} className="artist-card-mini" onClick={() => handleNavClick(`/artist/${name}`)} style={{display:'flex', alignItems:'center', gap:'10px', padding:'8px 24px', cursor:'pointer'}}>
                                        <Image src={data.img} alt={name} circle size="small" />
                                        <span style={{fontSize:'13px'}}>{name}</span>
                                    </div>
                                );
                            })
                        ) : (
                            <p style={{fontSize:'12px', opacity:0.5, padding:'8px 24px'}}>No artists followed</p>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
