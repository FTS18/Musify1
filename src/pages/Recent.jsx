import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { songs } from '../services/data';
import SongRow from '../components/SongRow';
import PageHeader from '../components/PageHeader';
import AnimatedList from '../components/AnimatedList';
import { usePageColor } from '../contexts/PageColorContext';

const Recent = () => {
    const { userData } = useAuth();
    const { setPageColor } = usePageColor();

    useEffect(() => {
        // Set purple color for recent page
        setPageColor('147, 51, 234'); // Purple
    }, [setPageColor]);

    const sortedRecent = (userData.recentPlay || [])
        .map(id => songs.find(s => s.id === id))
        .filter(s => s);

    return (
        <div className="content-padding">
            <PageHeader 
                title="Recently Played"
                subtitle={`${sortedRecent.length} songs`}
                gradient={['#9333ea', '#a855f7']}
                image="/assets/images/cover/starboy.jpg"
            />

            <div className="song-list" style={{height:'65vh'}}>
                {sortedRecent.length > 0 ? (
                    <AnimatedList 
                        items={sortedRecent}
                        renderItem={(s, i) => <SongRow key={s.id} song={s} index={i} />}
                    />
                ) : (
                    <p style={{opacity:0.6, padding:'0 32px'}}>No recently played songs.</p>
                )}
            </div>
        </div>
    );
};

export default Recent;
