import { useEffect } from 'react';
import { usePlayer } from '../contexts/PlayerContext';

export const useKeyboardShortcuts = () => {
    const { toggle, next, prev, setVolume, seek, currentTime, duration } = usePlayer();

    useEffect(() => {
        const handleKeyPress = (e) => {
            // Don't trigger if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    toggle();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (e.shiftKey) {
                        // Shift + Right: Skip forward 10 seconds
                        seek(Math.min(currentTime + 10, duration));
                    } else {
                        // Right: Next track
                        next();
                    }
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (e.shiftKey) {
                        // Shift + Left: Skip backward 10 seconds
                        seek(Math.max(currentTime - 10, 0));
                    } else {
                        // Left: Previous track
                        prev();
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    // Volume up
                    setVolume(prev => Math.min(prev + 0.1, 1));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    // Volume down
                    setVolume(prev => Math.max(prev - 0.1, 0));
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, [toggle, next, prev, setVolume, seek, currentTime, duration]);
};