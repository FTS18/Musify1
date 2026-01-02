import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Image } from './ImageWithFallback';

const MobileTopBar = ({ onMenuClick }) => {
    const navigate = useNavigate();

    const goToSearch = () => {
        navigate('/search');
    };

    return (
        <div className="mobile-top-bar">
            <div className="mobile-logo">
                <Image src="/assets/images/Musify.svg" alt="Musify" style={{width:'32px', height:'32px'}} noFallback />
            </div>

            <button className="mobile-search-btn" onClick={goToSearch}>
                <span className="material-icons">search</span>
                <span>Search songs, artists...</span>
            </button>

            <button className="hamburger-btn" onClick={onMenuClick}>
                <span className="material-icons">menu</span>
            </button>
        </div>
    );
};

export default MobileTopBar;
