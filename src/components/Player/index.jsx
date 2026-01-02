import React, { useState, useCallback, useMemo } from 'react';
import MiniPlayer from './MiniPlayer';
import ExpandedPlayer from './ExpandedPlayer';
import FullscreenPlayer from './FullscreenPlayer';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import './Player.css';

const Player = React.memo(() => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isMobile = useMediaQuery('(max-width: 768px)');

    const handleExpand = useCallback(() => {
        if (isMobile) {
            setIsExpanded(true);
        } else {
            // Dispatch event to toggle sidebar mode
            window.dispatchEvent(new CustomEvent('expandSidebarPlayer', { detail: true }));
        }
    }, [isMobile]);

    const handleCollapse = useCallback(() => {
        setIsExpanded(false);
    }, []);

    // Memoize the player components to prevent unnecessary re-renders
    const miniPlayer = useMemo(
        () => isMobile && !isExpanded && <MiniPlayer onExpand={handleExpand} />,
        [isMobile, isExpanded, handleExpand]
    );

    const fullscreenPlayer = useMemo(
        () => isMobile && (
            <FullscreenPlayer 
                isOpen={isExpanded} 
                onClose={handleCollapse} 
            />
        ),
        [isMobile, isExpanded, handleCollapse]
    );

    return (
        <>
            {miniPlayer}
            {fullscreenPlayer}
        </>
    );
});

Player.displayName = 'Player';

export default Player;
