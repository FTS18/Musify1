import React, { createContext, useContext, useState, useEffect } from 'react';
import { getButtonTextColor, parseColor } from '../utils/colorUtils';

const PageColorContext = createContext();

export const usePageColor = () => {
    const context = useContext(PageColorContext);
    if (!context) {
        throw new Error('usePageColor must be used within PageColorProvider');
    }
    return context;
};

export const PageColorProvider = ({ children }) => {
    const [pageColor, setPageColor] = useState('230, 0, 0'); // Default red

    useEffect(() => {
        // Update CSS variable whenever page color changes
        document.documentElement.style.setProperty('--page-color', pageColor);
        document.documentElement.style.setProperty('--vibe-color-rgb', pageColor); // Legacy support
        
        // Calculate and set button text color for contrast
        try {
            const buttonTextColor = getButtonTextColor(pageColor);
            document.documentElement.style.setProperty('--btn-text-color', buttonTextColor);
        } catch (e) {
            // Fallback to white if calculation fails
            document.documentElement.style.setProperty('--btn-text-color', '#ffffff');
        }
    }, [pageColor]);

    return (
        <PageColorContext.Provider value={{ pageColor, setPageColor }}>
            {children}
        </PageColorContext.Provider>
    );
};
