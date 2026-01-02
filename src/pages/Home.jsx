import React, { useEffect, useState } from 'react';
import { songs } from '../services/data';
import { SongCard, ArtistCard } from '../components/Card';
import { getSongCoverPath, extractDominantColor } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { usePageColor } from '../contexts/PageColorContext';

const Home = () => {
    const [recSongs, setRecSongs] = useState([]);
    const [artists, setArtists] = useState([]);
    const navigate = useNavigate();
    const { setPageColor } = usePageColor();
    const [heroColor, setHeroColor] = useState('255, 0, 0'); // Default fallback

    // Get random hero image from ANY song in the database
    const [randomHero] = useState(() => {
        const randomSong = songs[Math.floor(Math.random() * songs.length)];
        return getSongCoverPath(randomSong.cover);
    });

    useEffect(() => {
        // Extract color from hero banner
        const extractHeroColor = async () => {
            try {
                const color = await extractDominantColor(randomHero);
                setPageColor(color);
                setHeroColor(color);
            } catch (e) {
                console.error('Hero color extraction error:', e);
                setPageColor('230, 0, 0');
                setHeroColor('230, 0, 0');
            }
        };
        extractHeroColor();

        // Random 10 songs
        const shuffled = [...songs].sort(() => 0.5 - Math.random());
        setRecSongs(shuffled.slice(0, 10));

        // Get artists with 3+ songs
        const artistSongCount = {};
        const artistSongs = {};
        
        songs.forEach(s => {
            s.artist.split(',').forEach(a => {
                const name = a.trim();
                artistSongCount[name] = (artistSongCount[name] || 0) + 1;
                if (!artistSongs[name]) {
                    artistSongs[name] = [];
                }
                artistSongs[name].push(s);
            });
        });

        // Filter artists with 3+ songs and use random song cover
        const qualifiedArtists = Object.entries(artistSongCount)
            .filter(([name, count]) => count >= 3)
            .map(([name]) => {
                const artistSongList = artistSongs[name];
                const randomSong = artistSongList[Math.floor(Math.random() * artistSongList.length)];
                return { 
                    name, 
                    img: getSongCoverPath(randomSong.cover),
                    songCount: artistSongCount[name]
                };
            });

        setArtists(qualifiedArtists.sort(() => 0.5 - Math.random()).slice(0, 10));
    }, [setPageColor, randomHero]);

    return (
        <div className="content-padding">
             <div className="hero-banner" style={{
                 backgroundImage: `linear-gradient(90deg, rgba(${heroColor}, 0.95) 0%, rgba(${heroColor}, 0.8) 40%, rgba(${heroColor}, 0) 100%), url("${randomHero}")`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center'
             }}>
                <div className="hero-content">
                    <h1 className="hero-title">Recent <span>Hits</span></h1>
                    <p className="hero-subtitle">Listen to the latest trending tracks across the globe.</p>
                    <div className="hero-actions">
                        <button className="hero-play-btn" onClick={() => navigate('/trending')}><span className="material-icons">play_arrow</span> Play Now</button>
                    </div>
                </div>
             </div>

             <div className="section-header">
                <h2 className="section-title">Recommended</h2>
                <button className="view-all-btn" onClick={() => navigate('/all-songs')}>
                    View All <span className="material-icons">arrow_forward</span>
                </button>
             </div>
             <div className="scroll-row">
                 {recSongs.map(s => <SongCard key={s.id} song={s} />)}
             </div>

             <div className="section-header">
                <h2 className="section-title">Artists</h2>
                <button className="view-all-btn" onClick={() => navigate('/all-artists')}>
                    View All <span className="material-icons">arrow_forward</span>
                </button>
             </div>
             <div className="scroll-row">
                 {artists.map(a => <ArtistCard key={a.name} name={a.name} img={a.img} />)}
             </div>
        </div>
    );
};

export default Home;
