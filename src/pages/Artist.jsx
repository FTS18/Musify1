import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { songs } from '../services/data';
import { getSongCoverPath } from '../utils/helpers';
import SongRow from '../components/SongRow';
import AnimatedList from '../components/AnimatedList';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { usePlayer } from '../contexts/PlayerContext';

const Artist = () => {
    const { name } = useParams();
    const { userData, toggleFollowArtist } = useAuth();
    const { playById } = usePlayer();
    const [artistSongs, setArtistSongs] = useState([]);
    const [headerImg, setHeaderImg] = useState('');

    const decodedName = decodeURIComponent(name);
    const isFollowed = userData.followedArtists && userData.followedArtists.includes(decodedName);

    useEffect(() => {
        const filtered = songs.filter(s => s.artist.toLowerCase().includes(decodedName.toLowerCase()));
        setArtistSongs(filtered);

        // Specific Artist Images
        const artistImages = {
            'Atif Aslam': '/assets/images/artists/atif.webp',
            'Honey Singh': '/assets/images/artists/yoyo.webp',
            'Yo Yo Honey Singh': '/assets/images/artists/yoyo.webp',
            'Arijit Singh': '/assets/images/artists/arjit.webp'
        };

        if (artistImages[decodedName]) {
            setHeaderImg(artistImages[decodedName]);
        } else if(filtered.length > 0) {
            setHeaderImg(getSongCoverPath(filtered[0].cover));
        }
    }, [decodedName]);

    const stringToColor = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = Math.abs(hash) % 360;
        return [`hsl(${hue}, 70%, 50%)`, `hsl(${(hue + 30) % 360}, 60%, 40%)`];
    };

    const fallbackGradient = stringToColor(decodedName);

    return (
        <div className="content-padding">
            <PageHeader 
                title={decodedName}
                subtitle={`Artist • ${artistSongs.length} Songs`}
                image={headerImg}
                gradient={fallbackGradient}
                actions={
                    <>
                        <button className="btn-primary">
                            <span className="material-icons">play_arrow</span> Play
                        </button>
                        <button className="btn-secondary" onClick={() => toggleFollowArtist(decodedName, headerImg)}>
                            {isFollowed ? 'Following' : 'Follow'}
                        </button>
                    </>
                }
            />

            <AnimatedList
                items={artistSongs}
                onItemSelect={(song) => playById(song.id)}
                showGradients={false}
                enableArrowNavigation={true}
                displayScrollbar={false}
                renderItem={(song, index, isSelected) => (
                    <SongRow key={song.id} song={song} index={index} />
                )}
            />
        </div>
    );
};

export default Artist;
