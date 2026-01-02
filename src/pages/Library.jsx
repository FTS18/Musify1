import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { songs } from '../services/data';
import SongRow from '../components/SongRow';
import { SongCard } from '../components/Card';
import PageHeader from '../components/PageHeader';
import AnimatedList from '../components/AnimatedList';
import { usePageColor } from'../contexts/PageColorContext';
import { Image } from '../components/ImageWithFallback';

const Library = () => {
    const { userData, currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('liked');
    const { setPageColor } = usePageColor();

    useEffect(() => {
        setPageColor('29, 185, 84'); // Spotify green
    }, [setPageColor]);

    if (!currentUser) return (
        <div className="content-padding" style={{textAlign:'center', marginTop:'100px'}}>
             <h2>Please Login to view Library</h2>
        </div>
    );

    const likedSongObjects = songs.filter(s => userData.likedSongs?.includes(s.id));
    const recentSongObjects = songs.filter(s => userData.recentPlay?.includes(s.id));
    const sortedRecent = (userData.recentPlay || []).map(id => songs.find(s => s.id === id)).filter(s => s);

    return (
        <div className="content-padding">
            <PageHeader 
                title="Your Library"
                subtitle={`${likedSongObjects.length} liked songs • ${userData.playlists?.length || 0} playlists`}
                gradient={['#1db954', '#1ed760']}
                image="/assets/images/cover/tum se hi.jpg"
                icon="library_music"
            />
            
            <div className="tab-container" style={{display:'flex', gap:'20px', marginBottom:'20px', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingLeft:'32px'}}>
                <button className={activeTab === 'liked' ? 'btn-tab active' : 'btn-tab'} 
                        style={{background:'none', border:'none', color: activeTab === 'liked'?'#fff':'#aaa', padding:'10px', cursor:'pointer', borderBottom: activeTab==='liked'?'2px solid var(--accent)':'none'}}
                        onClick={() => setActiveTab('liked')}>
                    Liked Songs
                </button>
                <button className={activeTab === 'playlists' ? 'btn-tab active' : 'btn-tab'} 
                        style={{background:'none', border:'none', color: activeTab === 'playlists'?'#fff':'#aaa', padding:'10px', cursor:'pointer', borderBottom: activeTab==='playlists'?'2px solid var(--accent)':'none'}}
                        onClick={() => setActiveTab('playlists')}>
                    Playlists
                </button>
                <button className={activeTab === 'recent' ? 'btn-tab active' : 'btn-tab'} 
                        style={{background:'none', border:'none', color: activeTab === 'recent'?'#fff':'#aaa', padding:'10px', cursor:'pointer', borderBottom: activeTab==='recent'?'2px solid var(--accent)':'none'}}
                        onClick={() => setActiveTab('recent')}>
                    Recent
                </button>
            </div>

            {activeTab === 'liked' && (
                <div className="song-list" style={{height:'60vh'}}>
                    {likedSongObjects.length > 0 ? (
                        <AnimatedList 
                            items={likedSongObjects}
                            renderItem={(s, i) => <SongRow key={s.id} song={s} index={i} />}
                        />
                    ) : (
                        <p style={{opacity:0.6, padding:'0 32px'}}>No liked songs yet.</p>
                    )}
                </div>
            )}

            {activeTab === 'playlists' && (
                <div style={{paddingLeft:'32px', paddingRight:'32px'}}>
                     <h3>My Playlists</h3>
                     <div className="scroll-row">
                         {userData.playlists && userData.playlists.length > 0 ? (
                              userData.playlists.map(pl => (
                                  <div key={pl.id} className="card">
                                      <div className="img-container">
                                        <Image src="/assets/images/playlist.png" alt={pl.name} />
                                      </div>
                                      <h4>{pl.name}</h4>
                                      <p>{pl.songs.length} Songs</p>
                                  </div>
                              ))
                         ) : (
                              <p style={{opacity:0.6}}>No playlists created.</p>
                         )}
                     </div>
                </div>
            )}

            {activeTab === 'recent' && (
                <div className="song-list" style={{height:'60vh'}}>
                    <AnimatedList 
                        items={sortedRecent}
                        renderItem={(s, i) => <SongRow key={s.id} song={s} index={i} />}
                    />
                </div>
            )}
        </div>
    );
};

export default Library;
