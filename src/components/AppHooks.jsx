import React from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useProgressNotifications } from '../hooks/useProgressNotifications';

const AppHooks = ({ children }) => {
    useKeyboardShortcuts();
    useProgressNotifications();
    return children;
};

export default AppHooks;