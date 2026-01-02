# 🎵 Musify - Modern Music Streaming App

A premium, feature-rich music streaming application built with React and Vite, featuring a sleek dark interface, dynamic theming, and smooth user experience.

![Musify](https://img.shields.io/badge/Version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🎨 **Premium UI/UX**
- **Dynamic Background Gradients** - Each page has its own color scheme
- **MiniPlayer with Smart Colors** - Background adapts to the current song's artwork
- **Glassmorphism & Blur Effects** - Modern, premium design aesthetics
- **Smooth Animations** - Micro-interactions throughout the app
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

### 🎧 **Music Player**
- **Full-featured Audio Player** - Play, pause, skip, shuffle, repeat
- **Queue Management** - Drag-and-drop reordering, clear queue
- **Progress Bar** - Seek to any position in the track
- **Volume Control** - Adjustable volume with mute toggle
- **MiniPlayer** - Compact player that stays visible while browsing

### 📚 **Library Management**
- **Like Songs** - Build your personal collection
- **Follow Artists** - Keep track of your favorite artists
- **Create Playlists** - Organize your music (coming soon)
- **Priority Artists** - Featured artists displayed first

### 🔍 **Discovery & Navigation**
- **Smart Search** - Global search in navbar
- **Genre Filtering** - Filter songs by genre
- **Sort Options** - Sort by name, artist, date, popularity
- **Artist Search** - Find your favorite artists quickly
- **Pagination** - Smooth navigation through large collections

### 🎯 **Advanced Features**
- **Priority Artists System** - Curated artists (Karan Aujla, Yo Yo Honey Singh, Arijit Singh, etc.) always shown first
- **Dominant Color Extraction** - MiniPlayer background adapts to album artwork
- **Persistent State** - Likes, follows, and preferences saved to localStorage
- **Keyboard Shortcuts** - Space to play/pause, arrow keys to seek
- **Dynamic Page Colors** - Each page has unique gradient backgrounds

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite 5
- **Routing**: React Router DOM v6
- **State Management**: React Context API
- **Styling**: Vanilla CSS with CSS Variables
- **Icons**: Material Icons
- **Fonts**: Rajdhani (Google Fonts)
- **Audio**: HTML5 Audio API
- **Storage**: LocalStorage for persistence

## 📁 Project Structure

```
Musify1/
├── public/
│   └── assets/
│       └── images/        # Album covers and artwork
├── src/
│   ├── assets/
│   │   ├── css/          # Global styles
│   │   └── music/        # Audio files (MP3, WAV) - tracked via Git LFS
│   ├── components/       # Reusable UI components
│   │   ├── Card.jsx
│   │   ├── SongRow.jsx
│   │   ├── PageHeader.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   └── Player/       # Player components
│   ├── contexts/         # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── PlayerContext.jsx
│   │   └── PageColorContext.jsx
│   ├── pages/            # Route pages
│   │   ├── Home.jsx
│   │   ├── AllSongs.jsx
│   │   ├── AllArtists.jsx
│   │   ├── Liked.jsx
│   │   ├── Queue.jsx
│   │   └── Artist.jsx
│   ├── services/         # Data services
│   │   └── data.js       # Song & artist data
│   ├── utils/            # Helper functions
│   │   └── helpers.js
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── .gitignore
├── .gitattributes        # Git LFS configuration
├── package.json
└── vite.config.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git with Git LFS installed

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/musify.git
   cd musify
   ```

2. **Install Git LFS** (if not already installed)

   ```bash
   git lfs install
   ```

3. **Pull LFS files** (audio files)

   ```bash
   git lfs pull
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to `http://localhost:5173`

## 📦 Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` folder.

## 🎯 Usage

### Playing Music
1. Browse songs on the **Home** page or navigate to **All Songs**
2. Click any song card or row to play
3. Use the player controls at the bottom to manage playback

### Managing Your Library
- **Like songs**: Click the heart icon on any song
- **Follow artists**: Click the follow button on artist cards
- **View liked songs**: Navigate to the **Liked** page from the sidebar

### Creating Queues
- Songs automatically add to the queue when played
- Drag and drop to reorder songs in the **Queue** page
- Click the shuffle or repeat buttons for different playback modes

## 🎨 Features in Detail

### Priority Artists
The app showcases these priority artists first in all listings:
- Karan Aujla
- Yo Yo Honey Singh
- Arijit Singh
- Atif Aslam
- Guru Randhawa
- Alan Walker
- Imran Khan
- Pritam

### Dynamic Theming
Each page has its own color scheme:
- **Home**: Purple gradient
- **All Songs**: Blue-Purple gradient
- **All Artists**: Pink-Red gradient
- **Liked**: Pink gradient
- **Queue**: Orange gradient
- **Artist**: Blue gradient

### MiniPlayer
The compact player at the bottom features:
- Album artwork with fixed dimensions (no stretching)
- Dynamic background color extracted from artwork
- Song title and artist
- Play/pause, previous, next controls
- Real-time progress display

## 📊 Data Storage

### Audio Files (Git LFS)
Large audio files (≈2.5 GB) are stored using Git LFS to keep the repository lightweight.

Tracked extensions:
- `*.mp3`
- `*.wav`
- `*.flac`

### User Data (localStorage)
The following data is persisted locally:
- Liked songs
- Followed artists
- Player state (volume, shuffle, repeat)
- Current queue

## 🐛 Known Issues & Limitations

- Virtualization not implemented (pagination used instead for performance)
- Queue drag-and-drop may have occasional glitches
- Some older browsers may not support all features

## 🔜 Roadmap

- [ ] User authentication
- [ ] Playlist creation and management
- [ ] Social features (share songs, follow friends)
- [ ] Lyrics display
- [ ] Equalizer
- [ ] Cross-fade between tracks
- [ ] Download songs for offline playback
- [ ] PWA support

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)

## 🙏 Acknowledgments

- Album artwork from various artists
- Material Icons by Google
- Rajdhani font by Indian Type Foundry
- Inspiration from Spotify, Apple Music, and YouTube Music

---

**⭐ If you like this project, please give it a star on GitHub!**