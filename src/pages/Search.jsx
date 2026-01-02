import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { songs } from '../services/data';
import { SongCard, ArtistCard } from '../components/Card';
import PageHeader from '../components/PageHeader';
import { usePageColor } from '../contexts/PageColorContext';
import {
    searchSongs,
    searchArtists,
    getSearchSuggestions,
    SearchHistory,
    sortResults
} from '../utils/searchUtils';

const Search = () => {
    const { setPageColor } = usePageColor();
    const location = useLocation();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [category, setCategory] = useState('all'); // all, songs, artists
    const [sortBy, setSortBy] = useState('relevance');
    const [searchHistory, setSearchHistory] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Read search query from URL parameters
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q');
        if (query) {
            setSearchQuery(query);
            setDebouncedQuery(query);
        }
    }, [location.search]);

    useEffect(() => {
        setPageColor('249, 115, 22'); // Orange
        setSearchHistory(SearchHistory.get());
    }, [setPageColor]);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
            if (searchQuery.trim().length >= 2) {
                setSuggestions(getSearchSuggestions(searchQuery, songs, 5));
            } else {
                setSuggestions([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Perform search
    const searchResults = useMemo(() => {
        if (!debouncedQuery.trim()) return { songs: [], artists: [] };

        const songResults = searchSongs(debouncedQuery, songs);
        const artistResults = searchArtists(debouncedQuery, songs);

        return {
            songs: sortResults(songResults, sortBy),
            artists: artistResults
        };
    }, [debouncedQuery, sortBy]);

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        setShowSuggestions(false);
        if (query.trim()) {
            SearchHistory.add(query);
            setSearchHistory(SearchHistory.get());
        }
    }, []);

    const handleSuggestionClick = (suggestion) => {
        handleSearch(suggestion);
    };

    const handleHistoryClick = (query) => {
        handleSearch(query);
    };

    const removeFromHistory = (query) => {
        SearchHistory.remove(query);
        setSearchHistory(SearchHistory.get());
    };

    const clearHistory = () => {
        SearchHistory.clear();
        setSearchHistory([]);
    };

    // Popular searches (hardcoded for demo)
    const popularSearches = [
        'Bollywood Hits', 'Arijit Singh', 'Punjabi Songs', 'Romantic', 
        'Party Music', 'A.R. Rahman', 'Latest Songs', 'Trending'
    ];

    const displayResults = category === 'all' 
        ? searchResults.songs 
        : category === 'songs' 
        ? searchResults.songs 
        : [];

    const displayArtists = category === 'all' || category === 'artists' 
        ? searchResults.artists 
        : [];

    const hasResults = searchResults.songs.length > 0 || searchResults.artists.length > 0;

    return (
        <div className="content-padding">
            <PageHeader 
                title="Search Music"
                subtitle="Discover songs and artists"
                gradient={['#f97316', '#ea580c']}
                icon="search"
            />

            <h1 style={{marginBottom: '24px', paddingLeft: '32px', paddingRight: '32px', fontFamily: 'Rajdhani, sans-serif', fontSize: '1.5rem', display: debouncedQuery ? 'block' : 'none', color: 'var(--color-text, #fff)'}}>
                {debouncedQuery ? `Search results for "${debouncedQuery}"` : 'Search'}
            </h1>

            {/* Filters */}
            {debouncedQuery && (
                <div className="search-filters" style={{marginBottom: '24px', paddingLeft: '32px', paddingRight: '32px'}}>
                    <div className="filter-chips">
                        <button
                            className={`filter-chip ${category === 'all' ? 'active' : ''}`}
                            onClick={() => setCategory('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-chip ${category === 'songs' ? 'active' : ''}`}
                            onClick={() => setCategory('songs')}
                        >
                            Songs ({searchResults.songs.length})
                        </button>
                        <button
                            className={`filter-chip ${category === 'artists' ? 'active' : ''}`}
                            onClick={() => setCategory('artists')}
                        >
                            Artists ({searchResults.artists.length})
                        </button>
                    </div>

                    <select
                        className="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="relevance">Relevance</option>
                        <option value="name-asc">Name (A-Z)</option>
                        <option value="name-desc">Name (Z-A)</option>
                        <option value="recent">Recently Added</option>
                        <option value="popular">Most Popular</option>
                    </select>
                </div>
            )}

            {/* Results or Empty State */}
            {!debouncedQuery ? (
                // Empty state with popular searches
                <div className="search-empty-state">
                    <i className="material-icons search-empty-icon">search</i>
                    <h2>Start searching</h2>
                    <p>Find your favorite songs, artists, and albums</p>

                    {popularSearches.length > 0 && (
                        <div className="popular-searches">
                            <h3>Popular Searches</h3>
                            <div className="popular-search-tags">
                                {popularSearches.map((search, i) => (
                                    <button 
                                        key={i}
                                        className="popular-search-tag"
                                        onClick={() => handleSearch(search)}
                                    >
                                        {search}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : !hasResults ? (
                // No results state
                <div className="search-no-results">
                    <i className="material-icons">search_off</i>
                    <h2>No results found for "{debouncedQuery}"</h2>
                    <p>Try searching for something else</p>
                </div>
            ) : (
                // Results
                <div className="search-results">
                    {/* Artists Results */}
                    {displayArtists.length > 0 && (
                        <div className="search-results-section">
                            <div className="section-header">
                                <h2 className="section-title">Artists</h2>
                                {category !== 'artists' && displayArtists.length > 5 && (
                                    <button 
                                        className="view-all-btn"
                                        onClick={() => setCategory('artists')}
                                    >
                                        View All →
                                    </button>
                                )}
                            </div>
                            <div className="scroll-row">
                                {(category === 'artists' ? displayArtists : displayArtists.slice(0, 5)).map((artist) => (
                                    <ArtistCard
                                        key={artist.name}
                                        name={artist.name}
                                        img={artist.songs[0]?.cover}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Songs Results */}
                    {displayResults.length > 0 && (
                        <div className="search-results-section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    Songs ({displayResults.length} results)
                                </h2>
                            </div>
                            <div className="grid">
                                {displayResults.map(song => (
                                    <SongCard key={song.id} song={song} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;
