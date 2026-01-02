import React, { useEffect, useState } from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import './AnimatedGradientOverlay.css';

const AnimatedGradientOverlay = () => {
    const { dominantColor } = usePlayer();
    const [colors, setColors] = useState({
        primary: '147, 51, 234',
        secondary: '59, 130, 246',
        tertiary: '239, 68, 68'
    });

    useEffect(() => {
        if (!dominantColor) return;
        
        try {
            // Parse the dominantColor RGB string
            const rgb = dominantColor.split(',').map(n => parseInt(n.trim()));
            
            // Primary: original color
            const primary = dominantColor;
            
            // Secondary: lighter/shifted version
            const secondary = `${Math.min(255, rgb[0] + 40)}, ${Math.min(255, rgb[1] + 30)}, ${Math.min(255, rgb[2] + 50)}`;
            
            // Tertiary: complementary/darker version
            const tertiary = `${Math.max(0, rgb[0] - 20)}, ${Math.max(0, rgb[1] - 10)}, ${Math.min(255, rgb[2] + 20)}`;
            
            setColors({ primary, secondary, tertiary });
            
            // Update CSS variables globally
            document.documentElement.style.setProperty('--color-primary', primary);
            document.documentElement.style.setProperty('--color-secondary', secondary);
            document.documentElement.style.setProperty('--color-tertiary', tertiary);
            
        } catch (error) {
            console.error('Error processing dominant color:', error);
        }
    }, [dominantColor]);

    return (
        <>
            <div className="gradient-overlay gradient-overlay-1" 
                style={{
                    background: `radial-gradient(circle at 20% 30%, rgba(${colors.primary}, 0.25) 0%, transparent 50%)`
                }}
            />
            <div className="gradient-overlay gradient-overlay-2" 
                style={{
                    background: `radial-gradient(circle at 80% 70%, rgba(${colors.secondary}, 0.22) 0%, transparent 50%)`
                }}
            />
            <div className="gradient-overlay gradient-overlay-3" 
                style={{
                    background: `radial-gradient(circle at 50% 50%, rgba(${colors.tertiary}, 0.18) 0%, transparent 60%)`
                }}
            />
        </>
    );
};

export default AnimatedGradientOverlay;