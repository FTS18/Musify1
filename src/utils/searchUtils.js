/**
 * Search Utilities - Advanced search algorithms for Musify
 */

/**
 * Fuzzy search algorithm with weighted scoring
 */
export const fuzzySearch = (query, text) => {
    if (!query || !text) return 0;

    query = query.toLowerCase();
    text = text.toLowerCase();

    // Exact match - highest score
    if (text === query) return 100;

    // Starts with - very high score
    if (text.startsWith(query)) return 90;

    // Contains - high score
    if (text.includes(query)) return 80;

    // Fuzzy match - calculate similarity
    let score = 0;
    let queryIndex = 0;

    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
        if (text[i] === query[queryIndex]) {
            score += 1;
            queryIndex++;
        }
    }

    return queryIndex === query.length ? (score / query.length) * 70 : 0;
};

/**
 * Search songs with advanced filtering
 */
export const searchSongs = (query, songs, filters = {}) => {
    if (!query.trim()) return [];

    const results = songs.map(song => {
        // Calculate relevance scores
        const nameScore = fuzzySearch(query, song.name) * 2; // Name is most important
        const artistScore = fuzzySearch(query, song.artist) * 1.5;
        const albumScore = fuzzySearch(query, song.album || '') * 1;
        const genreScore = fuzzySearch(query, song.genre || '') * 0.5;

        const totalScore = nameScore + artistScore + albumScore + genreScore;

        return {
            ...song,
            relevanceScore: totalScore
        };
    })
        .filter(song => song.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Apply filters
    let filtered = results;

    if (filters.genre && filters.genre !== 'all') {
        filtered = filtered.filter(s => s.genre?.toLowerCase() === filters.genre.toLowerCase());
    }

    if (filters.year) {
        filtered = filtered.filter(s => s.year === filters.year);
    }

    if (filters.language && filters.language !== 'all') {
        filtered = filtered.filter(s => s.language?.toLowerCase() === filters.language.toLowerCase());
    }

    return filtered;
};

/**
 * Search artists with fuzzy matching
 */
export const searchArtists = (query, songs) => {
    if (!query.trim()) return [];

    // Extract unique artists with their songs
    const artistMap = new Map();

    songs.forEach(song => {
        const artists = song.artist.split(',').map(a => a.trim());

        artists.forEach(artist => {
            if (!artistMap.has(artist)) {
                artistMap.set(artist, {
                    name: artist,
                    songs: [],
                    totalPlays: 0
                });
            }

            const artistData = artistMap.get(artist);
            artistData.songs.push(song);
            artistData.totalPlays += song.plays || 0;
        });
    });

    // Search and score artists
    const results = Array.from(artistMap.values())
        .map(artist => ({
            ...artist,
            relevanceScore: fuzzySearch(query, artist.name) + (artist.totalPlays / 10000)
        }))
        .filter(artist => artist.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return results;
};

/**
 * Get search suggestions based on query
 */
export const getSearchSuggestions = (query, songs, limit = 5) => {
    if (!query.trim() || query.length < 2) return [];

    const suggestions = new Set();

    songs.forEach(song => {
        if (song.name.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(song.name);
        }

        const artists = song.artist.split(',').map(a => a.trim());
        artists.forEach(artist => {
            if (artist.toLowerCase().includes(query.toLowerCase())) {
                suggestions.add(artist);
            }
        });
    });

    return Array.from(suggestions).slice(0, limit);
};

/**
 * Manage search history in localStorage
 */
export const SearchHistory = {
    get: () => {
        try {
            return JSON.parse(localStorage.getItem('musifySearchHistory') || '[]');
        } catch {
            return [];
        }
    },

    add: (query) => {
        if (!query.trim()) return;

        let history = SearchHistory.get();
        history = [query, ...history.filter(q => q !== query)].slice(0, 10);

        localStorage.setItem('musifySearchHistory', JSON.stringify(history));
    },

    remove: (query) => {
        let history = SearchHistory.get();
        history = history.filter(q => q !== query);
        localStorage.setItem('musifySearchHistory', JSON.stringify(history));
    },

    clear: () => {
        localStorage.removeItem('musifySearchHistory');
    }
};

/**
 * Sort search results
 */
export const sortResults = (results, sortBy) => {
    switch (sortBy) {
        case 'name-asc':
            return [...results].sort((a, b) => a.name.localeCompare(b.name));

        case 'name-desc':
            return [...results].sort((a, b) => b.name.localeCompare(a.name));

        case 'recent':
            return [...results].sort((a, b) =>
                new Date(b.date || '2020-01-01') - new Date(a.date || '2020-01-01')
            );

        case 'popular':
            return [...results].sort((a, b) => (b.plays || 0) - (a.plays || 0));

        case 'relevance':
        default:
            return results; // Already sorted by relevance
    }
};
