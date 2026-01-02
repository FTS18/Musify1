#  Musify Scripts - Complete Guide

Collection of utilities for Spotify data extraction and music management.

##  Quick Start

`ash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Setup Spotify credentials
python setup_spotify.py --setup

# 3. Verify setup
python setup_spotify.py --verify
`

##  Main Scripts

### 1. spotify_downloader.py - Playlist/Album/Artist Data
Download track metadata from Spotify.

**Usage:**
```bash
python spotify_downloader.py playlist 37i9dQZF1DXcBWIGoYBM5M
python spotify_downloader.py artist "Drake"
python spotify_downloader.py album "Abbey Road" "The Beatles"
```

**Output:** JSON files with track metadata (name, artists, genres, popularity)

---

### 2. audio_analyzer.py - Audio Features & Analysis
Extract detailed audio features (energy, danceability, tempo, valence).

**Usage:**
```bash
python audio_analyzer.py playlist 37i9dQZF1DXcBWIGoYBM5M
python audio_analyzer.py artist "The Weeknd"
```

**Output:** Audio features + genre summary + analysis JSON

---

### 3. artist_images_downloader.py - Download Artist Cover Images
Download artist cover images from Spotify.

**Usage:**
```bash
python artist_images_downloader.py "Drake"
python artist_images_downloader.py "Drake" "The Weeknd" "Kendrick"
python artist_images_downloader.py --file artists.txt --sizes large
```

**Output:** JPG images in artist_covers/ directory

---

### 4. setup_spotify.py - Configuration Wizard
Setup Spotify API credentials interactively.

**Usage:**
```bash
python setup_spotify.py --setup      # Interactive setup
python setup_spotify.py --verify     # Verify credentials
```

---

### 5. musify_downloader.py - Original Music Downloader
Download songs with proper naming and metadata.

**Usage:**
```bash
python musify_downloader.py artist "Karan Aujla"
python musify_downloader.py search "Song Name"
```

---

##  Windows Batch Shortcuts

`ash
spotify_downloader.bat artist "Drake"
artist_images.bat "Drake" "The Weeknd"
`

---

##  Available Data

- Track: name, artists, album, duration, genres, popularity, preview URL, ISRC
- Audio: energy, danceability, acousticness, valence, tempo, loudness, key, mode
- Artist: name, genres, followers, popularity, cover images
- Album: name, release date, total tracks

---

##  Output Structure

`
scripts/
 playlist_{id}.json                  # Playlist tracks
 artist_{name}_top.json              # Artist top tracks
 album_{name}.json                   # Album tracks
 track_analysis.json                 # Audio analysis
 artist_covers/                      # Artist images
    Drake/
       Drake_640x640.jpg
       Drake_300x300.jpg
    artist_downloads_metadata.json
`

---

##  Setup

### 1. Get Spotify Credentials
- https://developer.spotify.com/dashboard
- Create app  Copy Client ID & Secret

### 2. Configure .env
`
SPOTIPY_CLIENT_ID=your_id
SPOTIPY_CLIENT_SECRET=your_secret
`

### 3. Install Dependencies
`ash
pip install -r requirements.txt
`

---

##  Examples

`ash
# Popular playlists
python spotify_downloader.py playlist 37i9dQZF1DXcBWIGoYBM5M    # Today's Top Hits
python spotify_downloader.py playlist 37i9dQZF1DX0XUsuxWHRQd    # RapCaviar

# Artists
python audio_analyzer.py artist "Drake"

# Batch download images
python artist_images_downloader.py --file artists.txt --sizes large
`

---

##  Limitations

- Genres: Artist-level only, not per-track
- Preview URLs: Not always available
- No Lyrics: Spotify API doesn't provide lyrics
- No Audio: Use musify_downloader.py for audio downloads

---

##  File List

| File | Purpose |
|------|---------|
| spotify_downloader.py | Main playlist/album/artist downloader |
| audio_analyzer.py | Audio features and analysis |
| artist_images_downloader.py | Artist cover images downloader |
| setup_spotify.py | Configuration wizard |
| musify_downloader.py | Original music downloader |
| spotify_downloader.bat | Windows shortcut |
| artist_images.bat | Windows shortcut |
| requirements.txt | Python dependencies |
| README.md | This file |

---

For detailed help, run scripts with --help flag or check individual scripts.
