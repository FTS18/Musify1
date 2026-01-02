/**
 * Trending Utilities - Calculate trending scores and rankings
 */

/**
 * Calculate trending score based on multiple factors
 */
export const calculateTrendingScore = (song, timeFrame = 'week') => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    // Time decay weights
    const timeWeights = {
        today: 1 * DAY,
        week: 7 * DAY,
        month: 30 * DAY,
        year: 365 * DAY,
        alltime: Infinity
    };

    const timeLimit = timeWeights[timeFrame] || timeWeights.week;
    const songDate = new Date(song.date || '2020-01-01').getTime();
    const age = now - songDate;

    // If song is older than time frame, reduce score significantly
    const recencyMultiplier = age > timeLimit ? 0.1 : 1 - (age / timeLimit) * 0.5;

    // Score components (weighted)
    const playScore = (song.plays || 0) * 0.4;
    const likeScore = (song.likes || song.plays * 0.1) * 0.3; // Estimate likes if not available
    const recentScore = recencyMultiplier * 1000 * 0.2;
    const growthScore = calculateGrowthRate(song) * 0.1;

    return Math.floor(playScore + likeScore + recentScore + growthScore);
};

/**
 * Calculate growth rate (velocity)
 */
const calculateGrowthRate = (song) => {
    // Simulate growth based on recency and plays
    // In production, this would use actual historical data
    const songAge = Date.now() - new Date(song.date || '2020-01-01').getTime();
    const daysOld = songAge / (24 * 60 * 60 * 1000);

    if (daysOld < 7) return 500; // New songs get boost
    if (daysOld < 30) return 300;
    if (daysOld < 90) return 100;

    return 0;
};

/**
 * Get trending songs with rankings
 */
export const getTrendingSongs = (songs, timeFrame = 'week', limit = 50) => {
    const scoredSongs = songs.map(song => ({
        ...song,
        trendingScore: calculateTrendingScore(song, timeFrame),
        previousRank: Math.floor(Math.random() * 100) // Simulate previous rank
    }));

    // Sort by trending score
    const ranked = scoredSongs
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, limit)
        .map((song, index) => ({
            ...song,
            rank: index + 1,
            movement: calculateMovement(index + 1, song.previousRank)
        }));

    return ranked;
};

/**
 * Calculate rank movement
 */
const calculateMovement = (currentRank, previousRank) => {
    if (!previousRank || previousRank > 100) return 'new';

    const diff = previousRank - currentRank;

    if (diff > 10) return 'rising-fast';
    if (diff > 0) return 'rising';
    if (diff < -10) return 'falling-fast';
    if (diff < 0) return 'falling';

    return 'same';
};

/**
 * Get trending artists
 */
export const getTrendingArtists = (songs, timeFrame = 'week', limit = 20) => {
    const artistMap = new Map();

    songs.forEach(song => {
        const artists = song.artist.split(',').map(a => a.trim());
        const trendingScore = calculateTrendingScore(song, timeFrame);

        artists.forEach(artist => {
            if (!artistMap.has(artist)) {
                artistMap.set(artist, {
                    name: artist,
                    totalScore: 0,
                    songCount: 0,
                    topSong: song
                });
            }

            const data = artistMap.get(artist);
            data.totalScore += trendingScore;
            data.songCount += 1;

            if (song.plays > (data.topSong.plays || 0)) {
                data.topSong = song;
            }
        });
    });

    return Array.from(artistMap.values())
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, limit)
        .map((artist, index) => ({
            ...artist,
            rank: index + 1,
            movement: index < 5 ? 'rising-fast' : index < 10 ? 'rising' : 'same'
        }));
};

/**
 * Get trending stats
 */
export const getTrendingStats = (trendingSongs) => {
    const newEntries = trendingSongs.filter(s => s.movement === 'new').length;
    const totalPlays = trendingSongs.reduce((sum, s) => sum + (s.plays || 0), 0);
    const risingCount = trendingSongs.filter(s =>
        s.movement === 'rising' || s.movement === 'rising-fast'
    ).length;

    return {
        newEntries,
        totalPlays,
        risingCount,
        totalSongs: trendingSongs.length
    };
};

/**
 * Get movement icon and color
 */
export const getMovementDisplay = (movement) => {
    const displays = {
        'new': { icon: '✨', text: 'NEW', color: '#10b981' },
        'rising-fast': { icon: '↑↑', text: 'Rising Fast', color: '#3b82f6' },
        'rising': { icon: '↑', text: 'Rising', color: '#60a5fa' },
        'same': { icon: '•', text: 'Same', color: '#9ca3af' },
        'falling': { icon: '↓', text: 'Falling', color: '#f59e0b' },
        'falling-fast': { icon: '↓↓', text: 'Falling Fast', color: '#ef4444' }
    };

    return displays[movement] || displays.same;
};
