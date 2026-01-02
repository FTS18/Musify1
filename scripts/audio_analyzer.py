"""
🎵 Spotify Audio Features & Genres Extractor
Extract detailed audio features, genres, and metadata from Spotify tracks
"""

import os
import sys
import json
from pathlib import Path
from typing import List, Dict, Optional
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

try:
    import spotipy
    from spotipy.oauth2 import SpotifyClientCredentials
except ImportError:
    print("❌ Missing Spotipy. Run: pip install spotipy")
    sys.exit(1)


class AudioAnalyzer:
    """Extract audio features and detailed metadata from Spotify tracks"""
    
    def __init__(self):
        client_id = os.getenv('SPOTIPY_CLIENT_ID')
        client_secret = os.getenv('SPOTIPY_CLIENT_SECRET')
        
        if not client_id or not client_secret:
            print("❌ Missing Spotify credentials!")
            sys.exit(1)
        
        auth = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)
        self.sp = spotipy.Spotify(auth_manager=auth)
    
    def get_audio_features(self, track_ids: List[str]) -> Dict[str, Dict]:
        """Fetch audio features for multiple tracks"""
        features_map = {}
        
        # Spotify API allows max 100 IDs per request
        for i in range(0, len(track_ids), 100):
            batch = track_ids[i:i+100]
            try:
                results = self.sp.audio_features(batch)
                for feature in results:
                    if feature and feature.get('id'):
                        features_map[feature['id']] = feature
            except Exception as e:
                print(f"⚠️  Error fetching audio features: {e}")
        
        return features_map
    
    def get_artist_genres(self, artist_ids: List[str]) -> Dict[str, List[str]]:
        """Fetch genres for multiple artists"""
        genres_map = {}
        
        for i in range(0, len(artist_ids), 50):
            batch = artist_ids[i:i+50]
            try:
                results = self.sp.artists(batch)
                for artist in results.get('artists', []):
                    if artist and artist.get('id'):
                        genres_map[artist['id']] = artist.get('genres', [])
            except Exception as e:
                print(f"⚠️  Error fetching artist genres: {e}")
        
        return genres_map
    
    def analyze_tracks(self, tracks: List[Dict], verbose: bool = True) -> List[Dict]:
        """Analyze tracks with audio features and genres"""
        if not tracks:
            return []
        
        # Extract IDs
        track_ids = [t.get('id') for t in tracks if t.get('id')]
        artist_ids = []
        for track in tracks:
            for artist in track.get('artists', []):
                if artist.get('id'):
                    artist_ids.append(artist['id'])
        
        if verbose:
            print(f"📊 Analyzing {len(track_ids)} tracks...")
        
        # Fetch audio features
        if verbose:
            print("🔊 Fetching audio features...")
        audio_features = self.get_audio_features(track_ids)
        
        # Fetch genres
        if verbose:
            print("🎵 Fetching genres...")
        genre_map = self.get_artist_genres(list(set(artist_ids)))
        
        # Merge data
        enhanced_tracks = []
        for track in tracks:
            track_id = track.get('id')
            features = audio_features.get(track_id, {})
            
            # Collect all genres from all artists
            genres = set()
            for artist in track.get('artists', []):
                artist_id = artist.get('id')
                if artist_id and artist_id in genre_map:
                    genres.update(genre_map[artist_id])
            
            enhanced_track = {
                **track,
                'genres': sorted(list(genres)),
                'audio_features': {
                    'energy': features.get('energy'),
                    'danceability': features.get('danceability'),
                    'acousticness': features.get('acousticness'),
                    'instrumentalness': features.get('instrumentalness'),
                    'liveness': features.get('liveness'),
                    'speechiness': features.get('speechiness'),
                    'valence': features.get('valence'),  # Positivity/happiness
                    'tempo': features.get('tempo'),
                    'loudness': features.get('loudness'),
                    'key': features.get('key'),
                    'mode': features.get('mode'),  # Major (1) or Minor (0)
                    'time_signature': features.get('time_signature'),
                }
            }
            enhanced_tracks.append(enhanced_track)
        
        if verbose:
            print(f"✅ Analyzed {len(enhanced_tracks)} tracks")
        
        return enhanced_tracks
    
    def save_analysis(self, tracks: List[Dict], filename: str = 'track_analysis.json'):
        """Save analysis results to JSON"""
        output_dir = Path(__file__).parent
        output_file = output_dir / filename
        
        data = {
            'analyzed_at': datetime.now().isoformat(),
            'total_tracks': len(tracks),
            'tracks': tracks
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Saved analysis to {output_file}")
    
    def print_analysis_summary(self, tracks: List[Dict]):
        """Print summary of audio analysis"""
        if not tracks:
            print("❌ No tracks to analyze")
            return
        
        print("\n" + "="*80)
        print("📊 AUDIO ANALYSIS SUMMARY")
        print("="*80)
        
        # Calculate averages
        total_energy = 0
        total_danceability = 0
        total_acousticness = 0
        total_valence = 0
        total_tempo = 0
        all_genres = set()
        count = 0
        
        for track in tracks:
            features = track.get('audio_features', {})
            if features.get('energy') is not None:
                total_energy += features['energy']
                total_danceability += features['danceability']
                total_acousticness += features['acousticness']
                total_valence += features['valence']
                total_tempo += features['tempo']
                count += 1
            
            all_genres.update(track.get('genres', []))
        
        if count > 0:
            print(f"\n📈 Average Metrics (from {count} tracks):")
            print(f"   🔊 Energy: {total_energy/count:.2f}/1.0 (intensity)")
            print(f"   💃 Danceability: {total_danceability/count:.2f}/1.0 (dance-friendly)")
            print(f"   🎸 Acousticness: {total_acousticness/count:.2f}/1.0 (acoustic vs electronic)")
            print(f"   😊 Valence: {total_valence/count:.2f}/1.0 (happiness/positivity)")
            print(f"   🎵 Tempo: {total_tempo/count:.1f} BPM (beats per minute)")
        
        print(f"\n🎹 Genres Found ({len(all_genres)} total):")
        for genre in sorted(all_genres)[:20]:
            print(f"   • {genre}")
        if len(all_genres) > 20:
            print(f"   ... and {len(all_genres)-20} more")
        
        print("\n" + "="*80 + "\n")


def analyze_playlist(playlist_id: str):
    """Analyze a Spotify playlist"""
    analyzer = AudioAnalyzer()
    sp = analyzer.sp
    
    print(f"📂 Fetching playlist: {playlist_id}")
    
    # Fetch playlist info
    playlist_info = sp.playlist(playlist_id)
    print(f"📋 Playlist: {playlist_info['name']}")
    print(f"👤 By: {playlist_info['owner']['display_name']}")
    
    # Fetch all tracks
    tracks = []
    results = sp.playlist_tracks(playlist_id)
    while results:
        for item in results['items']:
            if item['track']:
                tracks.append(item['track'])
        if results['next']:
            results = sp.next(results)
        else:
            break
    
    print(f"📥 Fetched {len(tracks)} tracks")
    
    # Analyze
    enhanced = analyzer.analyze_tracks(tracks)
    analyzer.print_analysis_summary(enhanced)
    
    # Save
    filename = f'playlist_{playlist_id}_analysis.json'
    analyzer.save_analysis(enhanced, filename)


def analyze_artist(artist_name: str):
    """Analyze an artist's top tracks"""
    analyzer = AudioAnalyzer()
    sp = analyzer.sp
    
    print(f"🎤 Searching: {artist_name}")
    
    # Find artist
    results = sp.search(q=f'artist:{artist_name}', type='artist', limit=1)
    if not results['artists']['items']:
        print(f"❌ Artist not found")
        return
    
    artist = results['artists']['items'][0]
    artist_id = artist['id']
    
    print(f"🎤 Artist: {artist['name']}")
    print(f"🔗 Genres: {', '.join(artist.get('genres', ['Unknown']))}")
    print(f"👥 Followers: {artist['followers']['total']:,}")
    
    # Get top tracks
    top_tracks = sp.artist_top_tracks(artist_id, country='US')
    tracks = top_tracks['tracks']
    
    print(f"📥 Fetched {len(tracks)} top tracks")
    
    # Analyze
    enhanced = analyzer.analyze_tracks(tracks)
    analyzer.print_analysis_summary(enhanced)
    
    # Save
    filename = f'artist_{artist_name.lower().replace(" ", "_")}_analysis.json'
    analyzer.save_analysis(enhanced, filename)


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print(__doc__)
        print("\nUsage:")
        print("  python audio_analyzer.py playlist <playlist_id>")
        print("  python audio_analyzer.py artist <artist_name>")
        print("\nExamples:")
        print("  python audio_analyzer.py playlist 37i9dQZF1DXcBWIGoYBM5M")
        print("  python audio_analyzer.py artist \"Drake\"")
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    try:
        if command == 'playlist':
            if len(sys.argv) < 3:
                print("❌ Usage: python audio_analyzer.py playlist <playlist_id>")
                sys.exit(1)
            analyze_playlist(sys.argv[2])
        
        elif command == 'artist':
            if len(sys.argv) < 3:
                print("❌ Usage: python audio_analyzer.py artist <artist_name>")
                sys.exit(1)
            artist_name = ' '.join(sys.argv[2:])
            analyze_artist(artist_name)
        
        else:
            print(f"❌ Unknown command: {command}")
            sys.exit(1)
    
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
