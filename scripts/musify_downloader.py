"""
🎵 Spotify to Musify - Complete Integration
Downloads songs with proper naming and auto-generates data.js entries

Usage:
    python musify_downloader.py artist "Karan Aujla"
    python musify_downloader.py search "Dhurandhar"
"""

import os
import sys
import re
import random
import string
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

try:
    import spotipy
    from spotipy.oauth2 import SpotifyClientCredentials
    import yt_dlp
    import urllib.request
except ImportError:
    print("❌ Missing dependencies. Run: pip install spotipy yt-dlp python-dotenv")
    sys.exit(1)


class MusifyDownloader:
    def __init__(self):
        client_id = os.getenv('SPOTIPY_CLIENT_ID')
        client_secret = os.getenv('SPOTIPY_CLIENT_SECRET')
        
        if not client_id or not client_secret:
            print("❌ Missing Spotify credentials in .env!")
            sys.exit(1)
        
        auth = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)
        self.sp = spotipy.Spotify(auth_manager=auth)
        self.downloaded_songs = []
    
    def to_title_case(self, text):
        """Convert to Title Case matching Musify format"""
        # Special cases
        if text.upper() in ['DJ', 'MC', 'MR', 'MS']:
            return text.upper()
        return ' '.join(word.capitalize() for word in text.split())
    
    def to_path_format(self, text):
        """Convert to lowercase path format"""
        return text.lower()
    
    def get_artist_top_tracks(self, artist_name, limit=10): 
        """Get artist's top tracks"""
        results = self.sp.search(q=f'artist:{artist_name}', type='artist', limit=1)
        
        if not results['artists']['items']:
            print(f"❌ Artist '{artist_name}' not found!")
            return []
        
        artist = results['artists']['items'][0]
        print(f"\n🎤 Artist: {artist['name']}")
        print(f"   Genres: {', '.join(artist['genres'][:3])}")
        print(f"   Followers: {artist['followers']['total']:,}\n")
        
        top_tracks = self.sp.artist_top_tracks(artist['id'])
        
        tracks = []
        for item in top_tracks['tracks'][:limit]:
            # Get song name in Title Case
            song_name = self.to_title_case(item['name'])
            
            track_data = {
                'name': song_name,
                'path': self.to_path_format(item['name']),
                'artist': ', '.join([a['name'] for a in item['artists']]),
                'cover': song_name,  # Same as name
                'cover_url': item['album']['images'][0]['url'] if item['album']['images'] else None,
                'release_date': item['album']['release_date'],
                'search_query': f"{', '.join([a['name'] for a in item['artists']])} {item['name']} official audio"
            }
            tracks.append(track_data)
        
        return tracks
    
    def search_tracks(self, query, limit=20):
        """Search for tracks"""
        results = self.sp.search(q=query, type='track', limit=limit)
        
        tracks = []
        for item in results['tracks']['items']:
            song_name = self.to_title_case(item['name'])
            
            track_data = {
                'name': song_name,
                'path': self.to_path_format(item['name']),
                'artist': ', '.join([a['name'] for a in item['artists']]),
                'cover': song_name,
                'cover_url': item['album']['images'][0]['url'] if item['album']['images'] else None,
                'release_date': item['album']['release_date'],
                'search_query': f"{', '.join([a['name'] for a in item['artists']])} {item['name']} official audio"
            }
            tracks.append(track_data)
        
        return tracks
    
    def download_track(self, track, songs_dir, covers_dir):
        """Download single track and cover"""
        try:
            # Download MP3
            ydl_opts = {
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '320',
                }],
                'outtmpl': str(songs_dir / track['path']),
                'quiet': True,
                'no_warnings': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([f"ytsearch1:{track['search_query']}"])
            
            # Download cover image
            if track['cover_url']:
                cover_path = covers_dir / f"{track['cover']}.jpg"
                urllib.request.urlretrieve(track['cover_url'], cover_path)
            
            # Generate random ID (6 chars lowercase + digits)
            track_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
            
            # Save to data
            self.downloaded_songs.append({
                'name': track['name'],
                'path': track['path'],
                'artist': track['artist'],
                'cover': track['cover'],
                'id': track_id,
                'date': track['release_date']
            })
            
            return True
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)[:50]}")
            return False
    
    def download_all(self, tracks):
        """Download all tracks"""
        # Setup directories
        songs_dir = Path('../public/assets/songs')
        covers_dir = Path('../public/assets/cover')
        songs_dir.mkdir(parents=True, exist_ok=True)
        covers_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"📁 Songs → {songs_dir.absolute()}")
        print(f"🖼️  Covers → {covers_dir.absolute()}")
        print(f"⬇️  Downloading {len(tracks)} tracks...\n")
        
        success = 0
        for i, track in enumerate(tracks, 1):
            print(f"[{i}/{len(tracks)}] {track['artist']} - {track['name']}")
            
            if self.download_track(track, songs_dir, covers_dir):
                print(f"   ✅ Downloaded\n")
                success += 1
            else:
                print(f"   ❌ Failed\n")
        
        print(f"\n{'='*60}")
        print(f"✅ Success: {success}/{len(tracks)}")
        print(f"{'='*60}\n")
        
        return success > 0
    
    def generate_data_entries(self, output_file='new_songs.txt'):
        """Generate data.js entries"""
        if not self.downloaded_songs:
            return
        
        output = "// 📝 COPY THESE LINES TO src/services/data.js\n"
        output += "// Paste right after: export const songs = [\n\n"
        
        for song in self.downloaded_songs:
            output += "  {\n"
            output += f"    'name': '{song['name']}',\n"
            output += f"    'path': '{song['path']}',\n"
            output += f"    'artist': '{song['artist']}',\n"
            output += f"    'cover': '{song['cover']}',\n"
            output += f"    'id': '{song['id']}',\n"
            output += f"    'date': '{song['date']}'\n"
            output += "  },\n"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(output)
        
        print(f"📝 Saved: {output_file}\n")
        print("📋 TO ADD TO YOUR APP:")
        print("1. Open src/services/data.js")
        print(f"2. Open {output_file}")
        print("3. Copy all entries")
        print("4. Paste at the beginning after 'export const songs = ['")
        print("5. Refresh Musify!\n")


def main():
    if len(sys.argv) < 3:
        print("""
🎵 Musify Downloader

Downloads Spotify tracks directly into your Musify app!

Usage:
  python musify_downloader.py artist "Artist Name"
  python musify_downloader.py search "Song or Album"

Examples:
  python musify_downloader.py artist "Karan Aujla"
  python musify_downloader.py search "Dhurandhar"
""")
        sys.exit(1)
    
    mode = sys.argv[1].lower()
    query = sys.argv[2]
    
    downloader = MusifyDownloader()
    
    if mode == 'artist':
        tracks = downloader.get_artist_top_tracks(query, limit=20)
    elif mode == 'search':
        print(f"\n🔍 Searching: {query}\n")
        tracks = downloader.search_tracks(query, limit=20)
    else:
        print("❌ Use: artist or search")
        sys.exit(1)
    
    if not tracks:
        print("❌ No tracks found!")
        sys.exit(1)
    
    print(f"Found {len(tracks)} tracks:\n")
    for i, t in enumerate(tracks[:5], 1):
        print(f"  {i}. {t['artist']} - {t['name']}")
    if len(tracks) > 10:
        print(f"  ... and {len(tracks) - 10} more")
    
    print(f"\n📥 Download to Musify? (y/n): ", end='')
    if input().lower() != 'y':
        print("Cancelled.")
        sys.exit(0)
    
    # Download
    if downloader.download_all(tracks):
        output_name = query.replace(' ', '_').lower()
        downloader.generate_data_entries(f'{output_name}_songs.txt')


if __name__ == "__main__":
    main()
