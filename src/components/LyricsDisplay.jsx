import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import LyricsService from '../services/lyricsService';

const LyricsDisplay = ({ isVisible, onClose }) => {
    const { currentSong, currentTime } = usePlayer();
    const [lyrics, setLyrics] = useState('');
    const [timedLyrics, setTimedLyrics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentLineIndex, setCurrentLineIndex] = useState(-1);
    const lyricsRef = useRef(null);

    useEffect(() => {
        if (isVisible && currentSong) {
            loadLyrics();
        }
    }, [isVisible, currentSong]);

    useEffect(() => {
        if (timedLyrics.length > 0) {
            updateCurrentLine();
        }
    }, [currentTime, timedLyrics]);

    const loadLyrics = async () => {
        setLoading(true);
        try {
            const lyricsText = await LyricsService.getLyrics(currentSong);
            
            // Check if it's LRC format (timed lyrics)
            if (lyricsText.includes('[') && lyricsText.includes(']')) {
                const parsed = LyricsService.parseLRC(lyricsText);
                setTimedLyrics(parsed);
                setLyrics('');
            } else {
                setLyrics(lyricsText);
                setTimedLyrics([]);
            }
        } catch (error) {
            setLyrics('Failed to load lyrics');
            setTimedLyrics([]);
        }
        setLoading(false);
    };

    const updateCurrentLine = () => {
        const currentIndex = timedLyrics.findIndex((line, index) => {
            const nextLine = timedLyrics[index + 1];
            return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
        });
        
        if (currentIndex !== currentLineIndex) {
            setCurrentLineIndex(currentIndex);
            
            // Auto-scroll to current line
            if (currentIndex >= 0 && lyricsRef.current) {
                const lineElement = lyricsRef.current.children[currentIndex];
                if (lineElement) {
                    lineElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }
        }
    };

    if (!isVisible) return null;

    return (
        <div className="lyrics-overlay">
            <div className="lyrics-container">
                <div className="lyrics-header">
                    <div>
                        <h3>{currentSong?.name}</h3>
                        <p>{currentSong?.artist}</p>
                    </div>
                    <button onClick={onClose} className="lyrics-close-btn">
                        <span className="material-icons">close</span>
                    </button>
                </div>

                <div className="lyrics-content" ref={lyricsRef}>
                    {loading ? (
                        <div className="lyrics-loading">
                            <span className="material-icons rotating">refresh</span>
                            Loading lyrics...
                        </div>
                    ) : timedLyrics.length > 0 ? (
                        // Timed lyrics (LRC format)
                        timedLyrics.map((line, index) => (
                            <div 
                                key={index}
                                className={`lyrics-line ${index === currentLineIndex ? 'active' : ''} ${index < currentLineIndex ? 'passed' : ''}`}
                            >
                                {line.text}
                            </div>
                        ))
                    ) : (
                        // Static lyrics
                        <div className="lyrics-static">
                            {lyrics.split('\n').map((line, index) => (
                                <div key={index} className="lyrics-line">
                                    {line}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LyricsDisplay;