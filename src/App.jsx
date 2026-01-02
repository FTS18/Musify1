import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import TopBar from './components/TopBar';
import MobileTopBar from './components/MobileTopBar';
import Player from './components/Player/index';
import Loader from './components/Loader';
import Home from './pages/Home';
import Library from './pages/Library';
import Search from './pages/Search';
import Artist from './pages/Artist';
import Profile from './pages/Profile';
import Queue from './pages/Queue';
import Recent from './pages/Recent';
import Liked from './pages/Liked';
import Login from './pages/Login';
import Trending from './pages/Trending';
import AllSongs from './pages/AllSongs';
import AllArtists from './pages/AllArtists';
import SongRadio from './pages/SongRadio';
import Settings from './pages/Settings';
import { AuthProvider } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';
import { PageColorProvider } from './contexts/PageColorContext';
import { PlaylistProvider } from './contexts/PlaylistContext';
import AppHooks from './components/AppHooks';
import AnimatedGradientOverlay from './components/AnimatedGradientOverlay/AnimatedGradientOverlay';

// Consolidated CSS - 4 files instead of 12
import './assets/css/base.css';       // Reset, typography, responsive
import './assets/css/components.css'; // Grid, cards, hero, navigation
import './assets/css/search-trending.css'; // Search & Trending pages
import './assets/css/player.css';     // Desktop player styles
import './assets/css/right-sidebar-fixes.css'; // Right sidebar desktop fixes
import './assets/css/loader.css';     // Loader styles
import './assets/css/enhanced-effects.css'; // Enhanced blur effects
import './assets/css/mobile.css';     // Mobile overrides (MUST BE LAST)
import './assets/css/mobile-topbar.css'; // Mobile top navigation

function AppContent() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="app-layout">
      <AnimatedGradientOverlay />
      <Sidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        onMobileMenuClose={() => setIsMobileMenuOpen(false)} 
      />
      <main className="main-view">
        <TopBar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/search" element={<Search />} />
          <Route path="/explore" element={<Search />} />
          <Route path="/artist/:name" element={<Artist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/liked" element={<Liked />} />
          <Route path="/recent" element={<Recent />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/login" element={<Login />} />
          <Route path="/all-songs" element={<AllSongs />} />
          <Route path="/all-artists" element={<AllArtists />} />
          <Route path="/radio/:songId" element={<SongRadio />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <RightSidebar />
      <Player />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <PlaylistProvider>
          <AppHooks>
            <PageColorProvider>
              <Router>
                <AppContent />
              </Router>
            </PageColorProvider>
          </AppHooks>
        </PlaylistProvider>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
