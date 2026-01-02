import React, { useState } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';

const SocialShare = ({ onClose }) => {
    const { currentSong } = usePlayer();
    const { currentUser } = useAuth();
    const [shareText, setShareText] = useState('');

    if (!currentSong) return null;

    const defaultText = `🎵 Currently listening to "${currentSong.name}" by ${currentSong.artist} on Musify! 🎶`;

    const shareToTwitter = () => {
        const text = shareText || defaultText;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const shareToFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`;
        window.open(url, '_blank');
    };

    const copyToClipboard = () => {
        const text = shareText || defaultText;
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const shareToWhatsApp = () => {
        const text = shareText || defaultText;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="social-share-modal">
            <div className="social-share-content">
                <div className="share-header">
                    <h3>Share Now Playing</h3>
                    <button onClick={onClose} className="close-btn">
                        <span className="material-icons">close</span>
                    </button>
                </div>

                <div className="current-song-preview">
                    <img src={`/assets/images/cover/${currentSong.cover}`} alt={currentSong.name} />
                    <div>
                        <div className="song-name">{currentSong.name}</div>
                        <div className="artist-name">{currentSong.artist}</div>
                    </div>
                </div>

                <textarea 
                    value={shareText}
                    onChange={(e) => setShareText(e.target.value)}
                    placeholder={defaultText}
                    className="share-text-input"
                />

                <div className="share-buttons">
                    <button onClick={shareToTwitter} className="share-btn twitter">
                        <span className="material-icons">share</span>
                        Twitter
                    </button>
                    <button onClick={shareToFacebook} className="share-btn facebook">
                        <span className="material-icons">share</span>
                        Facebook
                    </button>
                    <button onClick={shareToWhatsApp} className="share-btn whatsapp">
                        <span className="material-icons">share</span>
                        WhatsApp
                    </button>
                    <button onClick={copyToClipboard} className="share-btn copy">
                        <span className="material-icons">content_copy</span>
                        Copy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SocialShare;