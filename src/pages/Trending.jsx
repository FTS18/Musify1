import React, { useState, useEffect, useMemo } from 'react';
import { songs } from '../services/data';
import { SongCard, ArtistCard } from '../components/Card';
import PageHeader from '../components/PageHeader';
import { usePageColor } from '../contexts/PageColorContext';
import { usePlayer } from '../contexts/PlayerContext';
import {
    getTrendingSongs,
    getTrendingArtists,
    getTrendingStats,
    getMovementDisplay
} from '../utils/trendingUtils';

const Trending = () => {
    const { setPageColor } = usePageColor();
    const { playById } = usePlayer();
    
    const [timeFrame, setTimeFrame] = useState('week'); // today, week, month, year, alltime
    const [category, setCategory] = useState('songs'); // songs, artists
    const [viewMode, setViewMode] = useState('grid'); // grid, list

    useEffect(() => {
        setPageColor('220, 38, 38'); // Red for trending
    }, [setPageColor]);

    // Calculate trending data
    const trendingData = useMemo(() => {
        const trendingSongs = getTrendingSongs(songs, timeFrame, 50);
        const trendingArtists = getTrendingArtists(songs, timeFrame, 20);
        const stats = getTrendingStats(trendingSongs);

        return {
            songs: trendingSongs,
            artists: trendingArtists,
            stats
        };
    }, [timeFrame]);

    const handlePlayAll = () => {
        if (trendingData.songs.length > 0) {
            playById(trendingData.songs[0].id);
        }
    };

    const displayData = category === 'songs' ? trendingData.songs : [];
    const displayArtists = category === 'artists' ? trendingData.artists : [];

    const timeFrameOptions = [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'year', label: 'This Year' },
        { value: 'alltime', label: 'All Time' }
    ];

    return (
        <div className="content-padding">
            <PageHeader 
                title="Trending Now"
                subtitle={`${trendingData.stats.newEntries} new • ${trendingData.stats.risingCount} rising`}
                gradient={['#dc2626', '#991b1b']}
                icon="trending_up"
            />

            {/* Time Frame Selector */}
            <div className="trending-controls" style={{marginTop: '24px'}}>
                <div className="time-frame-selector">
                    {timeFrameOptions.map(option => (
                        <button
                            key={option.value}
                            className={`time-frame-btn ${timeFrame === option.value ? 'active' : ''}`}
                            onClick={() => setTimeFrame(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                <div className="trending-view-controls">
                    {/* Category Tabs */}
                    <div className="category-tabs">
                        <button
                            className={`category-tab ${category === 'songs' ? 'active' : ''}`}
                            onClick={() => setCategory('songs')}
                        >
                            Songs
                        </button>
                        <button
                            className={`category-tab ${category === 'artists' ? 'active' : ''}`}
                            onClick={() => setCategory('artists')}
                        >
                            Artists
                        </button>
                    </div>

                    {/* View Mode Toggle */}
                    {category === 'songs' && (
                        <div className="view-mode-toggle">
                            <button
                                className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                aria-label="Grid view"
                            >
                                <i className="material-icons">grid_view</i>
                            </button>
                            <button
                                className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                aria-label="List view"
                            >
                                <i className="material-icons">view_list</i>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Trending Results */}
            <div className="trending-results">
                {/* Songs Chart */}
                {category === 'songs' && viewMode === 'list' && (
                    <div className="trending-chart">
                        <div className="chart-header">
                            <span className="chart-col rank">#</span>
                            <span className="chart-col song">Song</span>
                            <span className="chart-col artist">Artist</span>
                            <span className="chart-col movement">Trend</span>
                            <span className="chart-col plays">Plays</span>
                        </div>

                        {displayData.map((song) => {
                            const movement = getMovementDisplay(song.movement);
                            return (
                                <div
                                    key={song.id}
                                    className="chart-row"
                                    onClick={() => playById(song.id)}
                                >
                                    <span className="chart-col rank">
                                        <span className="rank-number">{song.rank}</span>
                                    </span>
                                    
                                    <span className="chart-col song">
                                        <img 
                                            src={song.cover} 
                                            alt={song.name}
                                            className="chart-song-cover"
                                        />
                                        <span className="chart-song-name">{song.name}</span>
                                    </span>
                                    
                                    <span className="chart-col artist">
                                        {song.artist}
                                    </span>
                                    
                                    <span className="chart-col movement">
                                        <span 
                                            className="movement-badge"
                                            style={{ color: movement.color }}
                                        >
                                            {movement.icon} {movement.text}
                                        </span>
                                    </span>
                                    
                                    <span className="chart-col plays">
                                        {(song.plays || 0).toLocaleString()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Songs Grid */}
                {category === 'songs' && viewMode === 'grid' && (
                    <div className="grid">
                        {displayData.map((song) => {
                            const movement = getMovementDisplay(song.movement);
                            return (
                                <div key={song.id} className="trending-song-card">
                                    <div className="trending-rank-badge">
                                        #{song.rank}
                                    </div>
                                    <div 
                                        className="trending-movement-badge"
                                        style={{ color: movement.color }}
                                    >
                                        {movement.icon}
                                    </div>
                                    <SongCard song={song} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Artists Grid */}
                {category === 'artists' && (
                    <div className="trending-artists-section">
                        <div className="trending-artists-grid">
                            {displayArtists.map((artist) => {
                                const movement = getMovementDisplay(artist.movement);
                                return (
                                    <div key={artist.name} className="trending-artist-card">
                                        <div className="trending-rank-badge">
                                            #{artist.rank}
                                        </div>
                                        <div 
                                            className="trending-movement-badge"
                                            style={{ color: movement.color }}
                                        >
                                            {movement.icon}
                                        </div>
                                        <ArtistCard
                                            name={artist.name}
                                            img={artist.topSong.cover}
                                        />
                                        <div className="artist-stats">
                                            <span>{artist.songCount} songs</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Trending Stats Footer */}
            <div className="trending-stats-footer">
                <div className="stat-item">
                    <i className="material-icons">audiotrack</i>
                    <span>{trendingData.stats.totalSongs} Songs</span>
                </div>
                <div className="stat-item">
                    <i className="material-icons">play_circle</i>
                    <span>{trendingData.stats.totalPlays.toLocaleString()} Total Plays</span>
                </div>
                <div className="stat-item">
                    <i className="material-icons">new_releases</i>
                    <span>{trendingData.stats.newEntries} New Entries</span>
                </div>
                <div className="stat-item">
                    <i className="material-icons">trending_up</i>
                    <span>{trendingData.stats.risingCount} Rising</span>
                </div>
            </div>
        </div>
    );
};

export default Trending;
