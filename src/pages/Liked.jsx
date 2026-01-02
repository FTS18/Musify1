import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { songs } from '../services/data';
import SongRow from '../components/SongRow';
import PageHeader from '../components/PageHeader';
import AnimatedList from '../components/AnimatedList';
import { usePageColor } from '../contexts/PageColorContext';

const Liked = () => {
    const { userData } = useAuth();
    const { setPageColor } = usePageColor();

    useEffect(() => {
        setPageColor('236, 72, 153'); // Pink
    }, [setPageColor]);

    const likedSongObjects = songs.filter(s => userData.likedSongs?.includes(s.id));

    return (
        <div className="content-padding">
            <PageHeader 
                title="Liked Songs"
                subtitle={`${likedSongObjects.length} songs`}
                gradient={['#ec4899', '#f472b6']}
                image="/assets/images/cover/love you zindagi.jpg"
                icon="favorite"
            />

            <div className="song-list" style={{height:'65vh'}}>
                {likedSongObjects.length > 0 ? (
                    <AnimatedList 
                        items={likedSongObjects}
                        renderItem={(s, i) => <SongRow key={s.id} song={s} index={i} />}
                    />
                ) : (
                    <p style={{opacity:0.6, padding:'0 32px'}}>No liked songs yet.</p>
                )}
            </div>
        </div>
    );
};

export default Liked;
