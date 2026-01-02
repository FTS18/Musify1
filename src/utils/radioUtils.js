/**
 * Song Radio Utility - Generates similar songs for "Song Radio" feature
 */

/**
 * Find similar songs based on multiple factors
 * @param {Object} song - The current song
 * @param {Array} allSongs - All available songs
 * @param {number} limit - Number of similar songs to return
 * @returns {Array} Similar songs
 */
export const getSimilarSongs = (song, allSongs, limit = 20) => {
    if (!song) return [];

    const calculateSimilarity = (songA, songB) => {
        let score = 0;

        // Same artist bonus
        if (songA.artist === songB.artist) score += 100;
        
        // Artist overlap
        const artistsA = songA.artist.split(',').map(a => a.trim().toLowerCase());
        const artistsB = songB.artist.split(',').map(a => a.trim().toLowerCase());
        const commonArtists = artistsA.filter(a => artistsB.includes(a)).length;
        score += commonArtists * 50;

        // Same genre bonus
        if (songA.genre && songB.genre && songA.genre === songB.genre) score += 30;

        // Partial genre match
        if (songA.genre && songB.genre) {
            const genreWords = songA.genre.toLowerCase().split(' ');
            genreWords.forEach(word => {
                if (songB.genre.toLowerCase().includes(word)) score += 10;
            });
        }

        // Similar play count (trending)
        const playDiff = Math.abs((songA.plays || 0) - (songB.plays || 0));
        if (playDiff < 100) score += 20;
        else if (playDiff < 500) score += 10;

        // Name similarity (loose matching)
        if (songA.name.toLowerCase().includes(songB.name.toLowerCase().split(' ')[0]) ||
            songB.name.toLowerCase().includes(songA.name.toLowerCase().split(' ')[0])) {
            score += 15;
        }

        return score;
    };

    const similarSongs = allSongs
        .filter(s => s.id !== song.id)
        .map(s => ({
            ...s,
            similarity: calculateSimilarity(song, s)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(({ similarity, ...s }) => s);

    return similarSongs;
};

/**
 * Create a radio station based on a song
 * @param {Object} song - The seed song
 * @param {Array} allSongs - All available songs
 * @param {number} stationSize - How many songs for the radio
 * @returns {Array} Radio station songs
 */
export const createSongRadio = (song, allSongs, stationSize = 50) => {
    const radioSongs = [];
    const usedIds = new Set([song.id]);

    // Add seed song first
    radioSongs.push(song);
    usedIds.add(song.id);

    // Get similar songs
    const similar = getSimilarSongs(song, allSongs, 100);

    // Add similar songs, varying the selection
    let similarIndex = 0;
    while (radioSongs.length < stationSize && similarIndex < similar.length) {
        const candidate = similar[similarIndex];
        if (!usedIds.has(candidate.id)) {
            radioSongs.push(candidate);
            usedIds.add(candidate.id);
        }
        similarIndex++;
    }

    // If we need more songs, add random songs
    if (radioSongs.length < stationSize) {
        const remaining = allSongs
            .filter(s => !usedIds.has(s.id))
            .sort(() => Math.random() - 0.5);

        for (let i = 0; i < remaining.length && radioSongs.length < stationSize; i++) {
            radioSongs.push(remaining[i]);
            usedIds.add(remaining[i].id);
        }
    }

    return radioSongs;
};

/**
 * Get radio station name based on seed song
 * @param {Object} song - The seed song
 * @returns {string} Station name
 */
export const getRadioStationName = (song) => {
    const adjectives = ['Stellar', 'Cosmic', 'Infinite', 'Sonic', 'Vibrant', 'Dynamic', 'Awesome'];
    const prefix = adjectives[Math.floor(Math.random() * adjectives.length)];
    
    // Try to use artist name, fallback to song name
    const baseName = song.artist.split(',')[0].trim() || song.name.split(' ')[0];
    return `${prefix} ${baseName} Radio`;
};

export default {
    getSimilarSongs,
    createSongRadio,
    getRadioStationName
};
