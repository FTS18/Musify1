import React, { useState, useEffect } from 'react';
import { lyricsService } from '../../services/lyricsService';
import './LyricsDisplay.css';

const LyricsDisplay = ({ isVisible, onClose, currentSong }) => {
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible && currentSong) {
      setLoading(true);
      lyricsService.getLyrics(currentSong.artist, currentSong.title)
        .then(setLyrics)
        .finally(() => setLoading(false));
    }
  }, [isVisible, currentSong]);

  if (!isVisible) return null;

  return (
    <div className="lyrics-overlay" onClick={onClose}>
      <div className="lyrics-modal" onClick={e => e.stopPropagation()}>
        <div className="lyrics-header">
          <h3>{currentSong?.title}</h3>
          <button className="lyrics-close" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className="lyrics-content">
          {loading ? (
            <div className="lyrics-loading">Loading lyrics...</div>
          ) : (
            <pre className="lyrics-text">{lyrics}</pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default LyricsDisplay;