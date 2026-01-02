import React, { useState, useEffect } from 'react';
import { usePlayer } from '../contexts/PlayerContext';

const SleepTimer = ({ onClose }) => {
    const { pause } = usePlayer();
    const [timeLeft, setTimeLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);

    const presets = [
        { label: '15 min', minutes: 15 },
        { label: '30 min', minutes: 30 },
        { label: '45 min', minutes: 45 },
        { label: '1 hour', minutes: 60 },
        { label: '2 hours', minutes: 120 }
    ];

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => {
                    if (time <= 1) {
                        pause();
                        setIsActive(false);
                        onClose();
                        return 0;
                    }
                    return time - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, pause, onClose]);

    const startTimer = (minutes) => {
        setTimeLeft(minutes * 60);
        setIsActive(true);
    };

    const stopTimer = () => {
        setIsActive(false);
        setTimeLeft(0);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="sleep-timer-modal">
            <div className="sleep-timer-content">
                <h3>Sleep Timer</h3>
                
                {isActive ? (
                    <div className="timer-active">
                        <div className="timer-display">{formatTime(timeLeft)}</div>
                        <p>Music will stop in</p>
                        <button className="timer-cancel-btn" onClick={stopTimer}>
                            Cancel Timer
                        </button>
                    </div>
                ) : (
                    <div className="timer-presets">
                        {presets.map(preset => (
                            <button 
                                key={preset.minutes}
                                className="timer-preset-btn"
                                onClick={() => startTimer(preset.minutes)}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                )}
                
                <button className="timer-close-btn" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default SleepTimer;