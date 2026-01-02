import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import { getSongCoverPath, extractDominantColor, saturateColor, getTextColorForBg } from '../utils/helpers';

import ImageWithFallback from './ImageWithFallback';

export const SongCard = ({ song }) => {
    const { playById } = usePlayer();
    const navigate = useNavigate();
    const { userData, toggleLike } = useAuth();
    const isLiked = userData.likedSongs && userData.likedSongs.includes(song.id);
    const [cardBgColor, setCardBgColor] = useState('40, 40, 40');
    const [textColor, setTextColor] = useState('#ffffff');
    
    useEffect(() => {
        const loadColor = async () => {
            try {
                const dominantColor = await extractDominantColor(getSongCoverPath(song.cover));
                const saturated = saturateColor(dominantColor);
                setCardBgColor(saturated);
                setTextColor(getTextColorForBg(saturated));
            } catch (e) {
                setCardBgColor('40, 40, 40');
                setTextColor('#ffffff');
            }
        };
        loadColor();
    }, [song]);

    const handleClick = () => playById(song.id);
    
    const handleLikeClick = (e) => {
        e.stopPropagation();
        toggleLike(song.id);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            playById(song.id);
        }
    };

    return (
        <article 
            className="card" 
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Play ${song.name} by ${song.artist}`}
            style={{
                background: `rgb(${cardBgColor})`,
                color: textColor,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <ImageWithFallback 
                src={getSongCoverPath(song.cover)} 
                alt={`${song.name} cover art`}
                className="card-image"
            />

            {/* Compact action buttons */}
            <div className="card-info-wrapper">
                <div className="card-text-content">
                    <h3 className="card-title" style={{
                        color: textColor,
                        textShadow: textColor === '#ffffff' ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 2px rgba(255,255,255,0.2)'
                    }}>{song.name}</h3>
                    <div className="card-subtitle" style={{
                        color: textColor, 
                        opacity: 0.85,
                        textShadow: textColor === '#ffffff' ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 1px rgba(255,255,255,0.1)'
                    }}>
                        {song.artist.split(',').map((a, i, arr) => (
                            <span 
                                key={i}
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    navigate(`/artist/${encodeURIComponent(a.trim())}`); 
                                }}
                                className="artist-link"
                                style={{
                                    cursor:'pointer', 
                                    color: textColor,
                                    textShadow: textColor === '#ffffff' ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 1px rgba(255,255,255,0.1)',
                                    transition: 'all 0.2s ease'
                                }}
                                role="link"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.stopPropagation();
                                        navigate(`/artist/${encodeURIComponent(a.trim())}`);
                                    }
                                }}
                            >
                                {a.trim()}{i < arr.length - 1 ? ', ' : ''}
                            </span>
                        ))}
                    </div>
                </div>
                
                {/* Compact buttons on hover */}
                <div className="card-action-buttons">
                    <button 
                        className={`card-mini-btn ${isLiked ? 'active' : ''}`}
                        onClick={handleLikeClick}
                        aria-label={isLiked ? 'Unlike song' : 'Like song'}
                        title={isLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
                    >
                        <span className="material-icons">{isLiked ? 'favorite' : 'add'}</span>
                    </button>
                </div>
            </div>
        </article>
    );
};

export const ArtistCard = ({ name, img }) => {
    const navigate = useNavigate();
    const { userData, toggleFollowArtist } = useAuth();
    const isFollowed = userData.followedArtists && userData.followedArtists.includes(name);

    const handleClick = () => navigate(`/artist/${encodeURIComponent(name)}`);
    
    const handleFollowClick = (e) => {
        e.stopPropagation();
        toggleFollowArtist(name);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate(`/artist/${encodeURIComponent(name)}`);
        }
    };

    return (
        <article 
            className="card" 
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`View ${name} artist page`}
        >
            <ImageWithFallback 
               src={img} 
               alt={name}
               className="card-image"
            />

            {/* Hover overlay with follow button */}
            <div className="card-hover-overlay">
                <button 
                    className={`card-action-btn follow-btn ${isFollowed ? 'active' : ''}`}
                    onClick={handleFollowClick}
                    aria-label={isFollowed ? 'Unfollow artist' : 'Follow artist'}
                    title={isFollowed ? `Unfollow ${name}` : `Follow ${name}`}
                >
                    {isFollowed ? 'Following' : '+ Follow'}
                </button>
            </div>
            
            <h3 className="card-title">{name}</h3>
            <p className="card-subtitle">Artist</p>
        </article>
    );
};
