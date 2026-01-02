"""
🎵 Spotify Playlist, Artist & Album Downloader
Downloads songs from Spotify playlists, artists, and albums
Supports both YouTube downloading and Musify integration

Usage:
    # Download from playlist
    python spotify_downloader.py playlist "https://open.spotify.com/playlist/..."
    python spotify_downloader.py playlist "playlist_id"
    
    # Download from artist (top tracks)
    python spotify_downloader.py artist "Artist Name"
    
    # Download entire album
    python spotify_downloader.py album "Album Name" "Artist Name"
    python spotify_downloader.py album "album_id"
    
    # Download artist's albums
    python spotify_downloader.py artist-albums "Artist Name"
"""

import os
import sys
import re
import json
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

try:
    import spotipy
    from spotipy.oauth2 import SpotifyClientCredentials
except ImportError:
    print("❌ Missing Spotipy. Run: pip install spotipy")
    sys.exit(1)


class SpotifyDownloader:
    """Handle Spotify API interactions for playlists, artists, and albums"""
    
    def __init__(self):
        client_id = os.getenv('SPOTIPY_CLIENT_ID')
        client_secret = os.getenv('SPOTIPY_CLIENT_SECRET')
        
        if not client_id or not client_secret:
            print("❌ Missing Spotify credentials!")
            print("   Add these to .env file:")
            print("   SPOTIPY_CLIENT_ID=your_client_id")
            print("   SPOTIPY_CLIENT_SECRET=your_client_secret")
            sys.exit(1)
        
        auth = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)
        self.sp = spotipy.Spotify(auth_manager=auth)
        self.songs_data = []
    
    def extract_id_from_url(self, url: str) -> Optional[str]:
        """Extract Spotify ID from URL"""
        match = re.search(r'(?:playlist|album|artist)/([a-zA-Z0-9]+)', url)
        return match.group(1) if match else None
    
    def get_playlist_tracks(self, playlist_id: str) -> List[Dict]:
        """Fetch all tracks from a Spotify playlist"""
        print(f"📂 Fetching playlist: {playlist_id}")
        tracks = []
        results = self.sp.playlist_tracks(playlist_id)
        
        while results:
            for item in results['items']:
                if item['track']:
                    tracks.append(item['track'])
            
            if results['next']:
                results = self.sp.next(results)
            else:
                break
        
        print(f"✅ Found {len(tracks)} tracks")
        return tracks
    
    def get_artist_top_tracks(self, artist_name: str, country: str = 'US', limit: int = 10) -> List[Dict]:
        """Get top tracks from an artist"""
        print(f"🎤 Searching artist: {artist_name}")
        
        # Search for artist
        results = self.sp.search(q=f'artist:{artist_name}', type='artist', limit=1)
        
        if not results['artists']['items']:
            print(f"❌ Artist '{artist_name}' not found!")
            return []
        
        artist_id = results['artists']['items'][0]['id']
        artist_name = results['artists']['items'][0]['name']
        
        # Get top tracks
        top_tracks = self.sp.artist_top_tracks(artist_id, country=country)
        tracks = top_tracks['tracks'][:limit]
        
        print(f"✅ Found {len(tracks)} top tracks by {artist_name}")
        return tracks
    
    def get_artist_albums(self, artist_name: str, limit: int = 20) -> List[Dict]:
        """Get all albums from an artist"""
        print(f"🎤 Fetching albums for: {artist_name}")
        
        # Search for artist
        results = self.sp.search(q=f'artist:{artist_name}', type='artist', limit=1)
        
        if not results['artists']['items']:
            print(f"❌ Artist '{artist_name}' not found!")
            return []
        
        artist_id = results['artists']['items'][0]['id']
        
        # Get albums
        albums = self.sp.artist_albums(artist_id, limit=limit)
        album_list = albums['items']
        
        print(f"✅ Found {len(album_list)} albums")
        return album_list
    
    def get_album_tracks(self, album_id: str) -> Tuple[List[Dict], Dict]:
        """Fetch all tracks from an album"""
        print(f"💿 Fetching album: {album_id}")
        
        try:
            album_info = self.sp.album(album_id)
            tracks = []
            results = self.sp.album_tracks(album_id)
            
            while results:
                tracks.extend(results['items'])
                if results['next']:
                    results = self.sp.next(results)
                else:
                    break
            
            print(f"✅ Found {len(tracks)} tracks in album '{album_info['name']}'")
            return tracks, album_info
        except spotipy.exceptions.SpotifyException as e:
            print(f"❌ Error fetching album: {e}")
            return [], {}
    
    def get_artist_genres(self, artist_ids: List[str]) -> List[str]:
        """Fetch genres for given artist IDs"""
        if not artist_ids:
            return []
        try:
            artists = self.sp.artists(artist_ids[:50])  # API limit
            genres = set()
            for artist in artists.get('artists', []):
                genres.update(artist.get('genres', []))
            return sorted(list(genres))
        except:
            return []
    
    def format_track_info(self, track: Dict, include_genres: bool = True) -> Dict:
        """Format track information with genres and additional metadata"""
        artists = track.get('artists', [])
        artist_ids = [artist['id'] for artist in artists if artist.get('id')]
        
        # Get genres
        genres = []
        if include_genres and artist_ids:
            genres = self.get_artist_genres(artist_ids)
        
        return {
            'id': track.get('id'),
            'name': track.get('name'),
            'artists': [artist['name'] for artist in artists],
            'artist_ids': artist_ids,
            'genres': genres,
            'album': track.get('album', {}).get('name'),
            'album_id': track.get('album', {}).get('id'),
            'duration_ms': track.get('duration_ms'),
            'popularity': track.get('popularity'),
            'explicit': track.get('explicit'),
            'preview_url': track.get('preview_url'),
            'external_url': track.get('external_urls', {}).get('spotify'),
            'release_date': track.get('album', {}).get('release_date'),
            'isrc': track.get('external_ids', {}).get('isrc'),
        }
    
    def export_to_json(self, tracks: List[Dict], filename: str = 'spotify_tracks.json'):
        """Export track data to JSON"""
        output_dir = Path(__file__).parent
        output_file = output_dir / filename
        
        data = {
            'exported_at': datetime.now().isoformat(),
            'total_tracks': len(tracks),
            'tracks': [self.format_track_info(track) for track in tracks]
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Exported to {output_file}")
    
    def display_tracks(self, tracks: List[Dict], limit: int = 10):
        """Display track information in a readable format"""
        print("\n" + "="*80)
        print("📋 TRACKS")
        print("="*80)
        
        for i, track in enumerate(tracks[:limit], 1):
            artists = ', '.join([artist['name'] for artist in track.get('artists', [])])
            genres = track.get('genres', [])
            genres_str = ', '.join(genres) if genres else 'N/A'
            popularity = track.get('popularity', 'N/A')
            
            print(f"{i}. {track['name']}")
            print(f"   Artists: {artists}")
            print(f"   Album: {track.get('album', {}).get('name', 'Unknown')}")
            print(f"   Genres: {genres_str}")
            print(f"   Popularity: {popularity}/100" if popularity != 'N/A' else f"   Popularity: {popularity}")
            if track.get('explicit'):
                print(f"   🔞 Explicit")
            print()
        
        if len(tracks) > limit:
            print(f"... and {len(tracks) - limit} more tracks")
        print("="*80 + "\n")


def parse_spotify_link(link: str) -> Tuple[Optional[str], Optional[str]]:
    """Parse Spotify link to extract type and ID"""
    patterns = {
        'playlist': r'spotify\.com/playlist/([a-zA-Z0-9]+)',
        'album': r'spotify\.com/album/([a-zA-Z0-9]+)',
        'artist': r'spotify\.com/artist/([a-zA-Z0-9]+)',
    }
    
    for content_type, pattern in patterns.items():
        match = re.search(pattern, link)
        if match:
            return content_type, match.group(1)
    
    return None, None


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print(__doc__)
        print("\n❌ Missing arguments!")
        sys.exit(1)
    
    downloader = SpotifyDownloader()
    command = sys.argv[1].lower()
    
    try:
        if command == 'playlist':
            if len(sys.argv) < 3:
                print("❌ Usage: python spotify_downloader.py playlist <url_or_id>")
                sys.exit(1)
            
            playlist_input = sys.argv[2]
            
            # Try to extract ID from URL
            if 'spotify.com' in playlist_input:
                playlist_id = downloader.extract_id_from_url(playlist_input)
            else:
                playlist_id = playlist_input
            
            if not playlist_id:
                print("❌ Invalid playlist URL or ID")
                sys.exit(1)
            
            tracks = downloader.get_playlist_tracks(playlist_id)
            downloader.display_tracks(tracks)
            downloader.export_to_json(tracks, f'playlist_{playlist_id}.json')
        
        elif command == 'artist':
            if len(sys.argv) < 3:
                print("❌ Usage: python spotify_downloader.py artist <artist_name>")
                sys.exit(1)
            
            artist_name = ' '.join(sys.argv[2:])
            tracks = downloader.get_artist_top_tracks(artist_name)
            downloader.display_tracks(tracks)
            downloader.export_to_json(tracks, f'artist_{artist_name.lower().replace(" ", "_")}_top.json')
        
        elif command == 'artist-albums':
            if len(sys.argv) < 3:
                print("❌ Usage: python spotify_downloader.py artist-albums <artist_name>")
                sys.exit(1)
            
            artist_name = ' '.join(sys.argv[2:])
            albums = downloader.get_artist_albums(artist_name)
            
            if albums:
                print("\n" + "="*80)
                print("💿 ALBUMS")
                print("="*80)
                for i, album in enumerate(albums, 1):
                    artists = ', '.join([artist['name'] for artist in album.get('artists', [])])
                    print(f"{i}. {album['name']}")
                    print(f"   Artists: {artists}")
                    print(f"   Release: {album.get('release_date', 'Unknown')}")
                    print(f"   ID: {album['id']}")
                    print()
                print("="*80 + "\n")
                
                downloader.export_to_json(albums, f'artist_{artist_name.lower().replace(" ", "_")}_albums.json')
        
        elif command == 'album':
            if len(sys.argv) < 3:
                print("❌ Usage: python spotify_downloader.py album <album_name> [artist_name]")
                print("       or python spotify_downloader.py album <album_id>")
                sys.exit(1)
            
            album_input = sys.argv[2]
            
            # Try to extract ID from URL or use as direct ID
            if 'spotify.com' in album_input:
                album_id = downloader.extract_id_from_url(album_input)
            else:
                # Try as direct ID first
                album_id = album_input if len(album_input) == 22 else None
                
                if not album_id:
                    # Search for album by name
                    if len(sys.argv) > 3:
                        artist_name = ' '.join(sys.argv[3:])
                        query = f'album:{album_input} artist:{artist_name}'
                    else:
                        query = f'album:{album_input}'
                    
                    results = downloader.sp.search(q=query, type='album', limit=1)
                    if results['albums']['items']:
                        album_id = results['albums']['items'][0]['id']
                    else:
                        print(f"❌ Album not found")
                        sys.exit(1)
            
            tracks, album_info = downloader.get_album_tracks(album_id)
            if tracks:
                downloader.display_tracks(tracks)
                album_name = album_info.get('name', 'album').lower().replace(" ", "_")
                downloader.export_to_json(tracks, f'album_{album_name}.json')
        
        else:
            print(__doc__)
            print(f"❌ Unknown command: {command}")
            sys.exit(1)
    
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
