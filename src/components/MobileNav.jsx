import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MobileNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="mobile-bottom-nav">
            <div className="mobile-nav-items">
                <div className={`mobile-nav-item ${isActive('/') ? 'active' : ''}`} onClick={() => navigate('/')}>
                    <span className="material-icons">home</span>
                    <span>Home</span>
                </div>
                <div className={`mobile-nav-item ${isActive('/search') ? 'active' : ''}`} onClick={() => navigate('/search')}>
                    <span className="material-icons">search</span>
                    <span>Search</span>
                </div>
                <div className={`mobile-nav-item ${isActive('/library') ? 'active' : ''}`} onClick={() => navigate('/library')}>
                    <span className="material-icons">library_music</span>
                    <span>Library</span>
                </div>
                <div className={`mobile-nav-item ${isActive('/profile') || isActive('/login') ? 'active' : ''}`} 
                     onClick={() => navigate(currentUser ? '/profile' : '/login')}>
                    <span className="material-icons">{currentUser ? 'person' : 'login'}</span>
                    <span>{currentUser ? 'Profile' : 'Login'}</span>
                </div>
            </div>
        </nav>
    );
};

export default MobileNav;
