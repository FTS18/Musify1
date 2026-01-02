import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PageHeader.css';

/**
 * Unified Page Header Component
 * @param {string} title - Main heading
 * @param {string} subtitle - Secondary text
 * @param {string[]} gradient - Gradient colors [start, end]
 * @param {string} image - Background image URL (blurred)
 * @param {string} icon - Material icon name
 * @param {string} badge - Badge text (e.g., "FEATURED")
 * @param {React.ReactNode} actions - Action buttons
 * @param {string} artistName - For artist pages, enables clickable artist
 */
const PageHeader = ({ 
    title, 
    subtitle, 
    gradient = ['#333', '#111'], 
    image, 
    icon, 
    badge,
    actions,
    artistName
}) => {
    const navigate = useNavigate();

    let backgroundStyle = {};
    
    if (image && gradient) {
        // Image + Colored Gradient Overlay
        backgroundStyle = {
            backgroundImage: `linear-gradient(135deg, ${gradient[0]}aa 0%, ${gradient[1]}aa 100%), url('${image}')`,
            backgroundBlendMode: 'overlay',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        };
    } else if (image) {
        // Just Image + Dark Fade
        backgroundStyle = { 
            backgroundImage: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.95) 100%), url('${image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        };
    } else {
        // Just Gradient
        backgroundStyle = { 
            background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)` 
        };
    }

    return (
        <div className="page-header" style={backgroundStyle}>
            {/* Blur overlay for image backgrounds */}
            {image && <div className="page-header-blur" style={{ backgroundImage: `url(${image})` }} />}
            
            <div className="page-header-content">
                {badge && <div className="page-header-badge">{badge}</div>}
                
                <div className="page-header-title-row">
                    {icon && <span className="material-icons page-header-icon">{icon}</span>}
                    <h1 className="page-header-title">{title}</h1>
                </div>
                
                {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
                
                {actions && <div className="page-header-actions">{actions}</div>}
            </div>
        </div>
    );
};

export default PageHeader;
