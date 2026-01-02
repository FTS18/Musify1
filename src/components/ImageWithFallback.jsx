import React, { useState, useEffect } from 'react';
import { stringToColor } from '../utils/colorUtils';

const ImageWithFallback = ({ 
    src, 
    alt, 
    className = '', 
    style = {}, 
    initials,
    circle = false,
    size,
    noFallback = false 
}) => {
    const [error, setError] = useState(!src);
    const [loaded, setLoaded] = useState(false);

    // Reset error and loaded states when src changes
    useEffect(() => {
        setError(!src);
        setLoaded(false);
    }, [src]);

    const getInitials = (str) => {
        if (initials) return initials;
        if (!str) return '?';
        
        // Get first letter of first two words
        const words = str.split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[1][0]).toUpperCase();
        }
        return str.charAt(0).toUpperCase();
    };

    // Size presets
    const sizeStyles = {
        small: { width: '32px', height: '32px', fontSize: '0.75rem' },
        medium: { width: '48px', height: '48px', fontSize: '1rem' },
        large: { width: '80px', height: '80px', fontSize: '1.5rem' },
        xlarge: { width: '150px', height: '150px', fontSize: '2.5rem' }
    };

    const appliedSize = size ? sizeStyles[size] : {};
    const borderRadius = circle ? '50%' : (style.borderRadius || '0');

    // Generate responsive srcset if the image URL supports it
    const generateSrcSet = (imageSrc) => {
        if (!imageSrc || imageSrc.startsWith('data:')) return '';
        return '';
    };

    if ((error || !src) && !noFallback) {
        const bgColor = stringToColor(alt);
        
        // Parse RGB and brighten it
        const getRgbValues = (colorStr) => {
            const match = colorStr.match(/\d+/g);
            return match ? match.map(Number) : [147, 51, 234];
        };
        
        const rgb = getRgbValues(bgColor);
        const brightRgb = rgb.map(val => Math.min(255, val + 60)).join(', ');
        
        // Determine fixed dimensions
        const width = style?.width || appliedSize.width || '100%';
        const height = style?.height || appliedSize.height || 'auto';
        
        return (
            <div 
                className={className} 
                style={{
                    ...appliedSize,
                    ...style,
                    borderRadius,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: '800',
                    fontSize: appliedSize.fontSize || '1.2em',
                    fontFamily: 'Rajdhani, sans-serif',
                    textTransform: 'uppercase',
                    flexShrink: 0,
                    width: width,
                    height: height,
                    aspectRatio: style?.aspectRatio || '1',
                    minWidth: width,
                    minHeight: height,
                    objectFit: 'cover',
                    background: `linear-gradient(135deg, rgb(${brightRgb}), rgb(${bgColor}))`,
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: `inset 0 0 20px rgba(0, 0, 0, 0.2)`
                }}
                role="img"
                aria-label={`Album cover for ${alt}`}
            >
                {/* Shine overlay */}
                <div 
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)'
                    }}
                />
                {/* Music note icon */}
                <span 
                    className="material-icons" 
                    style={{
                        fontSize: appliedSize.fontSize ? `calc(${appliedSize.fontSize} * 2)` : '3em',
                        opacity: 0.95,
                        position: 'relative',
                        zIndex: 1,
                        textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                >
                    music_note
                </span>
            </div>
        );
    }

    return (
        <div 
            className={className} 
            style={{
                ...appliedSize,
                ...style,
                position: 'relative',
                overflow: 'hidden',
                borderRadius,
                backgroundColor: noFallback ? 'transparent' : stringToColor(alt),
                flexShrink: 0
            }}
        >
            {/* Blur-up placeholder - shown until image loads */}
            {!loaded && !noFallback && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(135deg, ${stringToColor(alt)}, ${stringToColor(alt + '2')})`,
                        filter: 'blur(20px)',
                        transform: 'scale(1.1)',
                        animation: 'pulse 2s ease-in-out infinite'
                    }}
                    aria-hidden="true"
                />
            )}
            
            {/* Actual image */}
            <img 
                src={src}
                srcSet={generateSrcSet(src)}
                alt={alt}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out'
                }}
                onLoad={() => setLoaded(true)}
                onError={() => {
                    if (!noFallback) setError(true);
                }}
                loading="lazy"
                decoding="async"
            />
        </div>
    );
};

// Export both default and named for flexibility
export default ImageWithFallback;
export { ImageWithFallback as Image };
