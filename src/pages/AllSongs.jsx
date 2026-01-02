import React, { useState, useEffect } from 'react';
import { songs } from '../services/data';
import SongRow from '../components/SongRow';
import PageHeader from '../components/PageHeader';
import { usePageColor } from '../contexts/PageColorContext';

const SONGS_PER_PAGE = 50;

const AllSongs = () => {
    const [sortBy, setSortBy] = useState('name'); // name, artist, date, plays
    const [currentPage, setCurrentPage] = useState(1);
    const [filterGenre, setFilterGenre] = useState('all');
    const { setPageColor } = usePageColor();

    useEffect(() => {
        setPageColor('102, 126, 234'); // Purple gradient
    }, [setPageColor]);

    // Get unique genres
    const genres = ['all', ...new Set(songs.map(s => s.genre).filter(Boolean))];

    // Filter and sort songs
    const filteredSongs = filterGenre === 'all' 
        ? songs 
        : songs.filter(s => s.genre === filterGenre);

    const sortedSongs = [...filteredSongs].sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
        if (sortBy === 'date') return new Date(b.date || '2020-01-01') - new Date(a.date || '2020-01-01');
        if (sortBy === 'plays') return (b.plays || 0) - (a.plays || 0);
        return 0;
    });

    const totalPages = Math.ceil(sortedSongs.length / SONGS_PER_PAGE);
    const startIndex = (currentPage - 1) * SONGS_PER_PAGE;
    const endIndex = startIndex + SONGS_PER_PAGE;
    const currentSongs = sortedSongs.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFilterChange = (genre) => {
        setFilterGenre(genre);
        setCurrentPage(1);
    };

    const handleSortChange = (sort) => {
        setSortBy(sort);
        setCurrentPage(1);
    };

    return (
        <div className="content-padding">
            <PageHeader 
                title="All Songs"
                subtitle={`${sortedSongs.length} songs${filterGenre !== 'all' ? ` • ${filterGenre}` : ''}`}
                gradient={['#667eea', '#764ba2']}
                image="/assets/images/cover/ilahi reprise.jpg"
                icon="library_music"
            />

            {/* Filters & Sort */}
            <div className="all-songs-filters" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', paddingLeft:'32px', paddingRight:'32px', gap: '16px', flexWrap: 'wrap'}}>
                {/* Genre Filter */}
                <div style={{display:'flex', gap:'8px', flexWrap: 'wrap', flex: 1}}>
                    {genres.slice(0, 6).map(genre => (
                        <button
                            key={genre}
                            onClick={() => handleFilterChange(genre)}
                            style={{
                                padding:'8px 16px',
                                borderRadius:'20px',
                                border:'none',
                                background: filterGenre === genre ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                                color:'#fff',
                                cursor:'pointer',
                                fontWeight:600,
                                fontSize:'0.85rem',
                                fontFamily: 'Rajdhani, sans-serif',
                                transition: 'all 0.2s',
                                textTransform: 'capitalize'
                            }}
                        >
                            {genre}
                        </button>
                    ))}
                </div>

                {/* Sort Controls */}
                <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    style={{
                        padding:'10px 16px',
                        borderRadius:'20px',
                        border:'1px solid rgba(255,255,255,0.1)',
                        background:'rgba(255,255,255,0.08)',
                        color:'#fff',
                        cursor:'pointer',
                        fontWeight:600,
                        fontSize:'0.85rem',
                        fontFamily: 'Rajdhani, sans-serif',
                        outline: 'none'
                    }}
                >
                    <option value="name">Name (A-Z)</option>
                    <option value="artist">Artist</option>
                    <option value="date">Latest</option>
                    <option value="plays">Most Popular</option>
                </select>
            </div>

            {/* Song List */}
            <div className="song-list" style={{paddingLeft:'32px', paddingRight:'32px'}}>
                {currentSongs.map((song, i) => (
                    <SongRow key={song.id} song={song} index={startIndex + i} />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination all-songs-pagination" style={{
                    display:'flex', justifyContent:'center', alignItems:'center', gap:'8px',
                    marginTop:'40px', marginBottom:'20px', paddingLeft:'32px', paddingRight:'32px'
                }}>
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                            padding:'10px 20px',
                            borderRadius:'24px',
                            border:'none',
                            background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                            color: currentPage === 1 ? 'rgba(255,255,255,0.3)' : '#fff',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            fontWeight:600,
                            fontSize:'0.85rem',
                            fontFamily: 'Rajdhani, sans-serif',
                            transition: 'all 0.2s'
                        }}>
                        Previous
                    </button>
                    
                    <div style={{display:'flex', gap:'6px'}}>
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
                                        padding:'10px 14px',
                                        borderRadius:'50%',
                                        border:'none',
                                        background: currentPage === pageNum ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                                        color:'#fff',
                                        cursor:'pointer',
                                        fontWeight:600,
                                        fontSize:'0.85rem',
                                        fontFamily: 'Rajdhani, sans-serif',
                                        minWidth:'40px',
                                        height: '40px',
                                        transition: 'all 0.2s'
                                    }}>
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        style={{
                            padding:'10px 20px',
                            borderRadius:'24px',
                            border:'none',
                            background: currentPage === totalPages ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                            color: currentPage === totalPages ? 'rgba(255,255,255,0.3)' : '#fff',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            fontWeight:600,
                            fontSize:'0.85rem',
                            fontFamily: 'Rajdhani, sans-serif',
                            transition: 'all 0.2s'
                        }}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AllSongs;
