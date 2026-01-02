import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { songs } from '../services/data';
import {
    getSearchSuggestions,
    SearchHistory
} from '../utils/searchUtils';

const TopBar = ({ onMenuClick }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const suggestionRef = useRef(null);
    
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, logout } = useAuth();

    useEffect(() => {
        setSearchHistory(SearchHistory.get());
    }, []);

    // Update suggestions when query changes
    useEffect(() => {
        if (searchQuery.trim().length >= 2) {
            setSuggestions(getSearchSuggestions(searchQuery, songs, 6));
            setSelectedIndex(-1);
        } else {
            setSuggestions([]);
            setSelectedIndex(-1);
        }
    }, [searchQuery]);

    const executeSearch = useCallback((query) => {
        if (query.trim()) {
            SearchHistory.add(query);
            setSearchHistory(SearchHistory.get());
            setSearchQuery(query);
            setShowSuggestions(false);
            setSelectedIndex(-1);
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    }, [navigate]);

    const handleSearchInput = (e) => {
        setSearchQuery(e.target.value);
    };

    const getAllSuggestionItems = () => {
        if (searchQuery.length >= 2) {
            return suggestions;
        } else {
            return searchHistory.slice(0, 6);
        }
    };

    const handleKeyDown = (e) => {
        const items = getAllSuggestionItems();
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && items[selectedIndex]) {
                executeSearch(items[selectedIndex]);
            } else {
                executeSearch(searchQuery);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setSelectedIndex(-1);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        executeSearch(suggestion);
    };

    const removeFromHistory = (query, e) => {
        e.stopPropagation();
        SearchHistory.remove(query);
        setSearchHistory(SearchHistory.get());
    };

    const clearHistory = () => {
        SearchHistory.clear();
        setSearchHistory([]);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="top-bar">
            {/* Back Button (Mobile Only - Left) */}
            <button 
                className="mobile-back-btn"
                onClick={() => navigate(-1)}
                aria-label="Go back"
            >
                <span className="material-icons">arrow_back</span>
            </button>

            {/* Circular Navigation Arrows (Desktop Only) */}
            <div className="nav-arrows">
                <button 
                    className="nav-arrow-btn nav-arrow-circle" 
                    onClick={() => navigate(-1)}
                    title="Go back"
                    aria-label="Go back"
                >
                    <span className="material-icons">chevron_left</span>
                </button>
                <button 
                    className="nav-arrow-btn nav-arrow-circle" 
                    onClick={() => navigate(1)}
                    title="Go forward"
                    aria-label="Go forward"
                >
                    <span className="material-icons">chevron_right</span>
                </button>
            </div>

            {/* Redesigned Search Bar - Always visible on all pages */}
            <div className="search-input-container">
                    <span className="material-icons search-icon">search</span>
                    <input 
                        className="search-input" 
                        type="text" 
                        placeholder="Search for artists, songs..." 
                        value={searchQuery}
                        onChange={handleSearchInput}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
                        aria-label="Search songs and artists"
                        role="searchbox"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="search-clear-btn"
                            aria-label="Clear search"
                        >
                            <span className="material-icons">close</span>
                        </button>
                    )}

                    {/* Suggestions Dropdown */}
                    {showSuggestions && (searchQuery.length >= 2 || searchHistory.length > 0) && (
                        <div className="navbar-search-dropdown" ref={suggestionRef}>
                            {/* Suggestions */}
                            {searchQuery.length >= 2 && suggestions.length > 0 && (
                                <div className="suggestion-group">
                                    <div className="suggestion-group-header">Suggestions</div>
                                    {suggestions.map((suggestion, i) => (
                                        <div 
                                            key={i}
                                            className={`suggestion-dropdown-item ${selectedIndex === i ? 'selected' : ''}`}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleSuggestionClick(suggestion);
                                            }}
                                            onMouseEnter={() => setSelectedIndex(i)}
                                            role="option"
                                            aria-selected={selectedIndex === i}
                                            tabIndex={0}
                                        >
                                            <span className="material-icons">search</span>
                                            <span>{suggestion}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Recent Searches */}
                            {searchQuery.length < 2 && searchHistory.length > 0 && (
                                <div className="suggestion-group">
                                    <div className="suggestion-group-header">
                                        <span>Recent Searches</span>
                                        <button onMouseDown={(e) => { e.preventDefault(); clearHistory(); }} className="clear-btn-nav">
                                            Clear All
                                        </button>
                                    </div>
                                    {searchHistory.slice(0, 6).map((query, i) => (
                                        <div 
                                            key={i} 
                                            className={`suggestion-dropdown-item ${selectedIndex === i ? 'selected' : ''}`}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleSuggestionClick(query);
                                            }}
                                            onMouseEnter={() => setSelectedIndex(i)}
                                            role="option"
                                            aria-selected={selectedIndex === i}
                                            tabIndex={0}
                                        >
                                            <span className="material-icons">history</span>
                                            <span style={{flex: 1}}>{query}</span>
                                            <button 
                                                onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    removeFromHistory(query, e);
                                                }}
                                                className="remove-btn-nav"
                                            >
                                                <span className="material-icons">close</span>
                                            </button>
                                        </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

            {/* Hamburger Menu (Mobile Only - Right side) */}
            <button 
                className="hamburger-btn"
                onClick={onMenuClick}
                aria-label="Open menu"
            >
                <span className="material-icons">menu</span>
            </button>

            {/* Profile Section */}
            {currentUser && (
                <div className="profile-menu-container">
                    <div 
                        className="profile-icon" 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'var(--accent)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '14px',
                            color: '#fff'
                        }}
                    >
                        {currentUser.email?.[0].toUpperCase() || 'U'}
                    </div>

                    {showProfileMenu && (
                        <div className="profile-dropdown">
                            <div 
                                className="dropdown-item"
                                onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}
                            >
                                <span className="material-icons" style={{fontSize: '20px'}}>person</span>
                                <span>Profile</span>
                            </div>
                            <div 
                                className="dropdown-item"
                                onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
                            >
                                <span className="material-icons" style={{fontSize: '20px'}}>settings</span>
                                <span>Settings</span>
                            </div>
                            <div className="dropdown-divider"></div>
                            <div 
                                className="dropdown-item logout"
                                onClick={handleLogout}
                            >
                                <span className="material-icons" style={{fontSize: '20px'}}>logout</span>
                                <span>Logout</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TopBar;
