"""
🎨 Spotify Artist Cover Images Downloader
Fetch and download cover images for artists with customizable naming
"""

import os
import sys
import json
import urllib.request
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


class ArtistImageDownloader:
    """Download artist cover images from Spotify"""
    
    def __init__(self):
        client_id = os.getenv('SPOTIPY_CLIENT_ID')
        client_secret = os.getenv('SPOTIPY_CLIENT_SECRET')
        
        if not client_id or not client_secret:
            print("❌ Missing Spotify credentials!")
            sys.exit(1)
        
        auth = SpotifyClientCredentials(client_id=client_id, client_secret=client_secret)
        self.sp = spotipy.Spotify(auth_manager=auth)
        
        # Create output directory
        self.output_dir = Path(__file__).parent / 'artist_covers'
        self.output_dir.mkdir(exist_ok=True)
    
    def search_artist(self, artist_name: str) -> Optional[Dict]:
        """Search for an artist on Spotify"""
        try:
            results = self.sp.search(q=f'artist:{artist_name}', type='artist', limit=1)
            if results['artists']['items']:
                return results['artists']['items'][0]
            return None
        except Exception as e:
            print(f"❌ Error searching artist: {e}")
            return None
    
    def get_artist_images(self, artist_id: str) -> List[Dict]:
        """Get all images for an artist"""
        try:
            artist = self.sp.artist(artist_id)
            images = artist.get('images', [])
            return sorted(images, key=lambda x: x.get('height', 0), reverse=True)
        except Exception as e:
            print(f"❌ Error fetching images: {e}")
            return []
    
    def sanitize_filename(self, filename: str) -> str:
        """Remove invalid characters from filename"""
        invalid_chars = '<>:"/\\|?*'
        for char in invalid_chars:
            filename = filename.replace(char, '_')
        return filename.strip()
    
    def download_image(self, url: str, filepath: Path) -> bool:
        """Download image from URL"""
        try:
            urllib.request.urlretrieve(url, filepath)
            return True
        except Exception as e:
            print(f"   ❌ Download failed: {e}")
            return False
    
    def download_artist_images(self, artist_name: str, 
                             naming_format: str = '{artist}_{size}',
                             sizes: str = 'all',
                             max_images: int = 5) -> Dict:
        """
        Download images for an artist
        
        naming_format options:
            - '{artist}_{size}' - artist_name_640x640
            - '{artist}_cover' - artist_name_cover
            - '{artist}_id' - artist_name_artistid
            - Custom: any format with {artist}, {size}, {id}
        
        sizes options:
            - 'all' - download all sizes
            - 'large' - largest image only
            - '640' - specific size (640x640)
        """
        print(f"\n🎤 Searching for: {artist_name}")
        
        artist = self.search_artist(artist_name)
        if not artist:
            print(f"❌ Artist not found")
            return {'success': False, 'artist': artist_name}
        
        artist_name_clean = artist['name']
        artist_id = artist['id']
        popularity = artist['popularity']
        genres = ', '.join(artist.get('genres', ['Unknown']))
        
        print(f"✅ Found: {artist_name_clean}")
        print(f"   ID: {artist_id}")
        print(f"   Genres: {genres}")
        print(f"   Popularity: {popularity}/100")
        print(f"   Followers: {artist['followers']['total']:,}")
        
        # Get images
        images = self.get_artist_images(artist_id)
        if not images:
            print(f"❌ No images found")
            return {'success': False, 'artist': artist_name_clean, 'reason': 'No images'}
        
        print(f"📸 Found {len(images)} image(s)")
        
        # Filter by size preference
        if sizes == 'large':
            images = images[:1]  # Only largest
        elif sizes != 'all' and sizes.isdigit():
            size_val = int(sizes)
            # Find closest size
            images = [img for img in images if img.get('height') and img['height'] <= size_val]
            if not images:
                images = [images[0]]  # Fallback to first
        
        images = images[:max_images]  # Limit number of downloads
        
        downloaded = []
        artist_dir = self.output_dir / self.sanitize_filename(artist_name_clean)
        artist_dir.mkdir(exist_ok=True)
        
        for idx, image in enumerate(images, 1):
            height = image.get('height', 0)
            width = image.get('width', 0)
            url = image.get('url')
            
            if not url:
                continue
            
            # Generate filename
            size_str = f"{width}x{height}" if width and height else 'unknown'
            
            filename = naming_format.format(
                artist=self.sanitize_filename(artist_name_clean),
                size=size_str,
                id=artist_id,
                index=idx
            )
            
            # Add extension
            filename += '.jpg'
            filepath = artist_dir / filename
            
            print(f"\n   📥 [{idx}/{len(images)}] Downloading {size_str}...")
            print(f"      → {filepath.name}")
            
            if self.download_image(url, filepath):
                print(f"      ✅ Success ({filepath.stat().st_size / 1024:.1f} KB)")
                downloaded.append({
                    'filename': filename,
                    'size': size_str,
                    'url': url,
                    'path': str(filepath)
                })
            else:
                print(f"      ❌ Failed")
        
        return {
            'success': True,
            'artist': artist_name_clean,
            'artist_id': artist_id,
            'genres': artist.get('genres', []),
            'popularity': popularity,
            'followers': artist['followers']['total'],
            'images_downloaded': len(downloaded),
            'downloaded': downloaded,
            'save_location': str(artist_dir)
        }
    
    def batch_download(self, artist_list: List[str], 
                      naming_format: str = '{artist}_{size}',
                      sizes: str = 'all') -> List[Dict]:
        """Download images for multiple artists"""
        results = []
        
        print("\n" + "="*70)
        print("📊 BATCH DOWNLOAD")
        print("="*70)
        
        for idx, artist_name in enumerate(artist_list, 1):
            print(f"\n[{idx}/{len(artist_list)}]", end="")
            result = self.download_artist_images(artist_name, naming_format, sizes)
            results.append(result)
        
        return results
    
    def save_metadata(self, results: List[Dict], filename: str = 'artist_downloads_metadata.json'):
        """Save download metadata"""
        output_file = self.output_dir / filename
        
        data = {
            'downloaded_at': datetime.now().isoformat(),
            'total_artists': len(results),
            'successful': sum(1 for r in results if r.get('success')),
            'failed': sum(1 for r in results if not r.get('success')),
            'results': results
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Metadata saved to {output_file}")
    
    def display_summary(self, results: List[Dict]):
        """Display download summary"""
        print("\n" + "="*70)
        print("📈 DOWNLOAD SUMMARY")
        print("="*70)
        
        successful = sum(1 for r in results if r.get('success'))
        total_images = sum(r.get('images_downloaded', 0) for r in results)
        
        print(f"\n✅ Successful: {successful}/{len(results)}")
        print(f"🖼️  Total images downloaded: {total_images}")
        print(f"📁 Saved to: {self.output_dir}")
        
        # Show per-artist summary
        print(f"\nPer-artist breakdown:")
        for result in results:
            if result.get('success'):
                print(f"  ✅ {result['artist']}: {result['images_downloaded']} image(s)")
            else:
                reason = result.get('reason', 'Unknown error')
                print(f"  ❌ {result['artist']}: {reason}")
        
        print("\n" + "="*70 + "\n")


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print(__doc__)
        print("\nUsage:")
        print("  # Single artist")
        print("  python artist_images_downloader.py \"Artist Name\"")
        print()
        print("  # Multiple artists from file")
        print("  python artist_images_downloader.py --file artists.txt")
        print()
        print("  # Custom options")
        print("  python artist_images_downloader.py \"Artist Name\" --format {artist}_{size} --sizes large")
        print()
        print("Options:")
        print("  --format {artist}_{size}  Naming format (default: {artist}_{size})")
        print("  --sizes all|large|640     Image sizes (default: all)")
        print("  --max N                   Max images per artist (default: 5)")
        print()
        print("Format variables:")
        print("  {artist}  Artist name")
        print("  {size}    Image dimensions (e.g., 640x640)")
        print("  {id}      Spotify artist ID")
        print()
        print("Examples:")
        print("  python artist_images_downloader.py \"Drake\"")
        print("  python artist_images_downloader.py \"The Weeknd\" --format {artist}_cover --sizes large")
        print("  python artist_images_downloader.py --file artists.txt --max 3")
        sys.exit(1)
    
    downloader = ArtistImageDownloader()
    
    # Parse arguments
    artists = []
    naming_format = '{artist}_{size}'
    sizes = 'all'
    max_images = 5
    
    i = 1
    while i < len(sys.argv):
        arg = sys.argv[i]
        
        if arg == '--file':
            # Read artists from file
            file_path = sys.argv[i + 1]
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    artists = [line.strip() for line in f if line.strip()]
                print(f"📄 Loaded {len(artists)} artists from {file_path}")
            except FileNotFoundError:
                print(f"❌ File not found: {file_path}")
                sys.exit(1)
            i += 2
        
        elif arg == '--format':
            naming_format = sys.argv[i + 1]
            i += 2
        
        elif arg == '--sizes':
            sizes = sys.argv[i + 1]
            i += 2
        
        elif arg == '--max':
            max_images = int(sys.argv[i + 1])
            i += 2
        
        elif not arg.startswith('--'):
            artists.append(arg)
            i += 1
        
        else:
            i += 1
    
    if not artists:
        print("❌ No artists specified")
        sys.exit(1)
    
    # Download
    results = downloader.batch_download(artists, naming_format, sizes)
    downloader.display_summary(results)
    downloader.save_metadata(results)


if __name__ == '__main__':
    main()
