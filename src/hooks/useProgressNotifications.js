import { useEffect } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { getSongCoverPath } from '../utils/helpers';

export const useProgressNotifications = () => {
    const { currentSong, isPlaying } = usePlayer();

    useEffect(() => {
        if (!currentSong || !('Notification' in window)) return;

        // Request permission on first use
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        if (Notification.permission === 'granted' && isPlaying) {
            const notification = new Notification(`Now Playing`, {
                body: `${currentSong.name} - ${currentSong.artist}`,
                icon: getSongCoverPath(currentSong.cover),
                tag: 'musify-now-playing',
                silent: true,
                requireInteraction: false
            });

            // Auto close after 3 seconds
            setTimeout(() => notification.close(), 3000);

            return () => notification.close();
        }
    }, [currentSong?.id, isPlaying]);
};