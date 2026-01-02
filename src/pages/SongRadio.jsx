import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { songs } from '../services/data';
import { SongCard } from '../components/Card';
import PageHeader from '../components/PageHeader';
import { Image } from '../components/ImageWithFallback';
import { usePageColor } from '../contexts/PageColorContext';
import { usePlayer } from '../contexts/PlayerContext';
import { getSimilarSongs, createSongRadio, getRadioStationName } from '../utils/radioUtils';

const SongRadio = () => {
    const { songId } = useParams();
    const navigate = useNavigate();
    const { setPageColor } = usePageColor();
    const { playById } = usePlayer();
    const [seedSong, setSeedSong] = useState(null);
    const [radioSongs, setRadioSongs] = useState([]);
    const [stationName, setStationName] = useState('');
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        setPageColor('168, 85, 247'); // Purple
    }, [setPageColor]);

    useEffect(() => {
        const seed = songs.find(s => s.id === songId);
        if (seed) {
            setSeedSong(seed);
            const station = createSongRadio(seed, songs, 50);
            setRadioSongs(station);
            setStationName(getRadioStationName(seed));
        }
    }, [songId]);

    const handlePlayRadio = () => {
        if (radioSongs.length > 0) {
            playById(radioSongs[0].id);
            setIsPlaying(true);
        }
    };

    if (!seedSong) {
        return (
            <div className="content-padding" style={{ textAlign: 'center', marginTop: '100px' }}>
                <h2>Song not found</h2>
                <button onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '10px 30px', borderRadius: '20px', background: 'var(--accent)', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Go Home
                </button>
            </div>
        );
    }

    return (
        <div className="content-padding">
            <PageHeader
                title={stationName}
                subtitle={`Based on "${seedSong.name}" by ${seedSong.artist}`}
                gradient={['#a855f7', '#9333ea']}
                image={seedSong.cover}
                icon="radio"
            />

            {/* Seed Song Info */}
            <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '24px', marginLeft: '32px', marginRight: '32px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <Image 
                        src={seedSong.cover} 
                        alt={seedSong.name} 
                        style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }} 
                    />
                    <div>
                        <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '4px' }}>Now Playing</p>
                        <h3 style={{ margin: 0, marginBottom: '4px' }}>{seedSong.name}</h3>
                        <p style={{ fontSize: '14px', opacity: 0.6, margin: 0 }}>{seedSong.artist}</p>
                    </div>
                </div>
                <button
                    onClick={handlePlayRadio}
                    style={{
                        padding: '12px 32px',
                        background: 'var(--accent)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '24px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <span className="material-icons">{isPlaying ? 'pause' : 'play_arrow'}</span>
                    {isPlaying ? 'Playing' : 'Play Station'}
                </button>
            </div>

            {/* Radio Songs */}
            <div style={{ marginLeft: '32px', marginRight: '32px', marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 600 }}>Up Next ({radioSongs.length - 1} songs)</h3>
                <div className="grid" style={{ gap: '16px' }}>
                    {radioSongs.slice(1).map(song => (
                        <SongCard key={song.id} song={song} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SongRadio;
