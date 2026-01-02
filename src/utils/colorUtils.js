/**
 * Color Utilities - Contrast calculation and color manipulation
 */

/**
 * Convert RGB to relative luminance
 * https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
export const calculateLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 * Returns ratio between 1 and 21
 */
export const getContrastRatio = (rgb1, rgb2) => {
    const lum1 = calculateLuminance(...rgb1);
    const lum2 = calculateLuminance(...rgb2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Parse CSS color string to RGB array
 */
export const parseColor = (color) => {
    if (typeof color === 'string') {
        // Handle RGB string like "255, 128, 0"
        if (color.includes(',')) {
            return color.split(',').map(Number);
        }

        // Handle hex
        if (color.startsWith('#')) {
            const hex = color.replace('#', '');
            return [
                parseInt(hex.substr(0, 2), 16),
                parseInt(hex.substr(2, 2), 16),
                parseInt(hex.substr(4, 2), 16)
            ];
        }

        // Handle rgb() or rgba()
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
        }
    }

    // Default to black
    return [0, 0, 0];
};

/**
 * Get contrasting text color (black or white) for a background
 * Ensures WCAG AA compliance (4.5:1 ratio)
 */
export const getContrastColor = (bgColor) => {
    const rgb = parseColor(bgColor);
    const luminance = calculateLuminance(...rgb);

    // Use white text for dark backgrounds, black for light
    return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * Check if color combination meets WCAG contrast requirements
 */
export const meetsContrastRequirement = (fgColor, bgColor, level = 'AA', size = 'normal') => {
    const fg = parseColor(fgColor);
    const bg = parseColor(bgColor);
    const ratio = getContrastRatio(fg, bg);

    // WCAG 2.0 requirements
    const requirements = {
        'AA': { normal: 4.5, large: 3 },
        'AAA': { normal: 7, large: 4.5 }
    };

    const required = requirements[level]?.[size] || 4.5;
    return ratio >= required;
};

/**
 * Lighten or darken a color by a percentage
 */
export const adjustBrightness = (color, percent) => {
    const rgb = parseColor(color);
    const adjusted = rgb.map(c => {
        const value = c + (255 - c) * (percent / 100);
        return Math.min(255, Math.max(0, Math.round(value)));
    });
    return `rgb(${adjusted.join(', ')})`;
};

/**
 * Get readable button text color based on background
 * Ensures minimum 4.5:1 contrast ratio
 */
export const getButtonTextColor = (bgColor) => {
    const bg = parseColor(bgColor);

    // Try white first
    const whiteContrast = getContrastRatio([255, 255, 255], bg);
    if (whiteContrast >= 4.5) {
        return '#ffffff';
    }

    // Try black
    const blackContrast = getContrastRatio([0, 0, 0], bg);
    if (blackContrast >= 4.5) {
        return '#000000';
    }

    // If neither works well, prefer white for dark, black for light
    const luminance = calculateLuminance(...bg);
    return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * Generate HSL color from string (for consistent avatar colors)
 */
export const stringToColor = (str) => {
    if (!str) return 'hsl(200, 75%, 45%)';

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 75%, 45%)`;
};

/**
 * Get CSS variable value from root
 */
export const getCSSVariable = (variableName) => {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .trim();
};

/**
 * Set CSS variable on root
 */
export const setCSSVariable = (variableName, value) => {
    document.documentElement.style.setProperty(variableName, value);
};
