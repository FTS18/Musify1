import React, { useState, useEffect } from 'react';
import { songs } from '../services/data';
import { getSongCoverPath } from '../utils/helpers';
import PageHeader from '../components/PageHeader';
import { ArtistCard } from '../components/Card';
import { usePageColor } from '../contexts/PageColorContext';
import { useAuth } from '../contexts/AuthContext';

const AllArtists = () => {
    const [artists, setArtists] = useState([]);
    const [filteredArtists, setFilteredArtists] = useState([]);
    const [sortBy, setSortBy] = useState('songs'); // songs, name
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showOnlyFollowing, setShowOnlyFollowing] = useState(false);
    const { setPageColor } = usePageColor();
    const { userData } = useAuth();

    const ARTISTS_PER_PAGE = 24;

    useEffect(() => {
        setPageColor('245, 85, 108'); // Pink/red gradient
    }, [setPageColor]);

    useEffect(() => {
        const artistSongCount = {};
        const artistSongsList = {};
        
        songs.forEach(s => {
            s.artist.split(',').forEach(a => {
                const name = a.trim();
                artistSongCount[name] = (artistSongCount[name] || 0) + 1;
                if (!artistSongsList[name]) {
                    artistSongsList[name] = [];
                }
                artistSongsList[name].push(s);
            });
        });

        let artistList = Object.entries(artistSongCount)
            .map(([name, count]) => {
                const artistSongs = artistSongsList[name];
                const randomSong = artistSongs[Math.floor(Math.random() * artistSongs.length)];
                return {
                    name,
                    songCount: count,
                    img: getSongCoverPath(randomSong.cover),
                    isFollowed: userData.followedArtists?.includes(name) || false
                };
            });

        // Sort based on selection
        if (sortBy === 'songs') {
            artistList = artistList.sort((a, b) => b.songCount - a.songCount);
        } else {
            artistList = artistList.sort((a, b) => a.name.localeCompare(b.name));
        }

        setArtists(artistList);
        setCurrentPage(1);
    }, [sortBy, userData.followedArtists]);

    // Filter artists based on search
    useEffect(() => {
        let filtered = artists;

        // Filter by following status if enabled
        if (showOnlyFollowing) {
            filtered = filtered.filter(artist => artist.isFollowed);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            filtered = filtered.filter(artist =>
                artist.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredArtists(filtered);
        setCurrentPage(1);
    }, [searchQuery, artists, showOnlyFollowing]);

    const totalPages = Math.ceil(filteredArtists.length / ARTISTS_PER_PAGE);
    const startIndex = (currentPage - 1) * ARTISTS_PER_PAGE;
    const endIndex = startIndex + ARTISTS_PER_PAGE;
    const displayArtists = filteredArtists.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="content-padding">
            <PageHeader 
                title="All Artists"
                subtitle={`${filteredArtists.length} artists`}
                gradient={['#f093fb', '#f5576c']}
                image="/assets/images/cover/waka waka.jpg"
                icon="people"
            />

            {/* Search & Sort Controls */}
            <div style={{marginBottom: '24px', paddingLeft: '32px', paddingRight: '32px'}}>
                {/* Filter Tabs */}
                <div style={{display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap'}}>
                    <button
                        onClick={() => setShowOnlyFollowing(false)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '24px',
                            border: !showOnlyFollowing ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                            background: !showOnlyFollowing ? 'var(--accent)' : 'transparent',
                            color: !showOnlyFollowing ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                            fontFamily: 'Rajdhani, sans-serif',
                            transition: 'all 0.2s'
                        }}
                    >
                        All Artists
                    </button>
                    <button
                        onClick={() => setShowOnlyFollowing(true)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '24px',
                            border: showOnlyFollowing ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                            background: showOnlyFollowing ? 'var(--accent)' : 'transparent',
                            color: showOnlyFollowing ? '#fff' : 'rgba(255, 255, 255, 0.8)',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                            fontFamily: 'Rajdhani, sans-serif',
                            transition: 'all 0.2s'
                        }}
                    >
                        My Following ({userData.followedArtists?.length || 0})
                    </button>
                </div>

                {/* Search Bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '50px',
                    padding: '12px 20px',
                    marginBottom: '16px',
                    transition: 'all 0.2s ease'
                }}>
                    <i className="material-icons" style={{color: 'rgba(255, 255, 255, 0.6)', marginRight: '12px'}}>search</i>
                    <input
                        type="text"
                        placeholder="Search artists..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: 500,
                            outline: 'none',
                            fontFamily: 'Rajdhani, sans-serif'
                        }}
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255, 255, 255, 0.6)',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <i className="material-icons">close</i>
                        </button>
                    )}
                </div>

                {/* Sort Controls */}
                <div style={{display:'flex', gap:'12px', flexWrap: 'wrap'}}>
                    <button 
                        onClick={() => setSortBy('songs')}
                        style={{
                            padding:'10px 20px',
                            borderRadius:'24px',
                            border:'none',
                            background: sortBy === 'songs' ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                            color:'#fff',
                            cursor:'pointer',
                            fontWeight:600,
                            fontSize:'0.9rem',
                            fontFamily: 'Rajdhani, sans-serif',
                            transition: 'all 0.2s'
                        }}
                    >
                        Most Songs
                    </button>
                    <button 
                        onClick={() => setSortBy('name')}
                        style={{
                            padding:'10px 20px',
                            borderRadius:'24px',
                            border:'none',
                            background: sortBy === 'name' ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                            color:'#fff',
                            cursor:'pointer',
                            fontWeight:600,
                            fontSize:'0.9rem',
                            fontFamily: 'Rajdhani, sans-serif',
                            transition: 'all 0.2s'
                        }}
                    >
                        A-Z
                    </button>
                </div>
            </div>
            {/* Artist Grid */}
            <div className="grid" style={{paddingLeft:'32px', paddingRight:'32px', gap: '16px', marginBottom: '40px'}}>
                {displayArtists.map(artist => (
                    <ArtistCard 
                        key={artist.name}
                        name={artist.name}
                        img={artist.img}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '40px',
                    marginBottom: '20px',
                    paddingLeft: '32px',
                    paddingRight: '32px'
                }}>
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '24px',
                            border: 'none',
                            background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                            color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : '#fff',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            fontFamily: 'Rajdhani, sans-serif',
                            transition: 'all 0.2s'
                        }}
                    >
                        Previous
                    </button>
                    
                    <div style={{display: 'flex', gap: '6px'}}>
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    style={{
                                        padding: '10px 14px',
                                        borderRadius: '50%',
                                        border: 'none',
                                        background: currentPage === pageNum ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '0.85rem',
                                        fontFamily: 'Rajdhani, sans-serif',
                                        minWidth: '40px',
                                        height: '40px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '24px',
                            border: 'none',
                            background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                            color: currentPage === totalPages ? 'rgba(255,255,255,0.3)' : '#fff',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            fontFamily: 'Rajdhani, sans-serif',
                            transition: 'all 0.2s'
                        }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AllArtists;