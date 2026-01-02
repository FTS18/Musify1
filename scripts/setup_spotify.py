#!/usr/bin/env python3
"""
🎵 Spotify Downloader Setup Helper
Interactive setup for Spotify credentials and configuration
"""

import os
import sys
from pathlib import Path


def create_env_file(client_id: str, client_secret: str):
    """Create .env file with Spotify credentials"""
    env_path = Path(__file__).parent.parent / '.env'
    
    content = f"""# Spotify API Credentials
SPOTIPY_CLIENT_ID={client_id}
SPOTIPY_CLIENT_SECRET={client_secret}

# Optional: Set redirect URI if needed
# SPOTIPY_REDIRECT_URI=http://localhost:8888/callback
"""
    
    # Check if .env already exists
    if env_path.exists():
        print(f"\n⚠️  .env file already exists at {env_path}")
        overwrite = input("Overwrite? (y/n): ").strip().lower()
        if overwrite != 'y':
            print("❌ Cancelled")
            return False
    
    try:
        with open(env_path, 'w') as f:
            f.write(content)
        print(f"✅ Created .env file at {env_path}")
        return True
    except Exception as e:
        print(f"❌ Error creating .env: {e}")
        return False


def setup_interactive():
    """Interactive setup wizard"""
    print("\n" + "="*70)
    print("🎵 SPOTIFY DOWNLOADER - SETUP WIZARD")
    print("="*70)
    
    print("\n📝 To use this downloader, you need Spotify API credentials:")
    print("\n1. Go to https://developer.spotify.com/dashboard")
    print("2. Log in or create a Spotify account")
    print("3. Create a new app")
    print("4. Accept terms and create")
    print("5. Copy your Client ID and Client Secret")
    
    print("\n" + "-"*70)
    
    client_id = input("\n🔑 Enter your Spotify Client ID: ").strip()
    if not client_id:
        print("❌ Client ID is required")
        return False
    
    client_secret = input("🔐 Enter your Spotify Client Secret: ").strip()
    if not client_secret:
        print("❌ Client Secret is required")
        return False
    
    # Verify credentials format
    if len(client_id) < 10:
        print("❌ Client ID seems too short")
        return False
    
    if len(client_secret) < 10:
        print("❌ Client Secret seems too short")
        return False
    
    # Create .env file
    if create_env_file(client_id, client_secret):
        print("\n✅ Setup complete!")
        print("\n📚 Usage examples:")
        print("   python spotify_downloader.py playlist <url_or_id>")
        print("   python spotify_downloader.py artist \"Artist Name\"")
        print("   python spotify_downloader.py album \"Album Name\"")
        print("   python spotify_downloader.py artist-albums \"Artist Name\"")
        print("\n📖 For more info, see SPOTIFY_DOWNLOADER_README.md")
        return True
    
    return False


def verify_credentials():
    """Verify if credentials are properly configured"""
    env_path = Path(__file__).parent.parent / '.env'
    
    print("\n" + "="*70)
    print("🔍 CHECKING CREDENTIALS")
    print("="*70)
    
    if env_path.exists():
        print(f"✅ Found .env file at {env_path}")
        
        # Try to load credentials
        try:
            from dotenv import load_dotenv
            load_dotenv()
            
            client_id = os.getenv('SPOTIPY_CLIENT_ID')
            client_secret = os.getenv('SPOTIPY_CLIENT_SECRET')
            
            if client_id and client_secret:
                print(f"✅ SPOTIPY_CLIENT_ID: {client_id[:10]}...")
                print(f"✅ SPOTIPY_CLIENT_SECRET: {client_secret[:10]}...")
                
                # Try to connect to Spotify
                try:
                    import spotipy
                    from spotipy.oauth2 import SpotifyClientCredentials
                    
                    auth = SpotifyClientCredentials(
                        client_id=client_id,
                        client_secret=client_secret
                    )
                    sp = spotipy.Spotify(auth_manager=auth)
                    
                    # Test connection
                    sp.search(q='test', type='track', limit=1)
                    print("\n✅ Successfully connected to Spotify API!")
                    return True
                
                except Exception as e:
                    print(f"\n❌ Failed to connect to Spotify: {e}")
                    return False
            else:
                print("❌ Credentials not found in .env")
                return False
        except Exception as e:
            print(f"❌ Error reading .env: {e}")
            return False
    else:
        print(f"❌ .env file not found at {env_path}")
        print("   Run setup first: python setup_spotify.py --setup")
        return False


def main():
    """Main entry point"""
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command in ['--setup', 'setup']:
            setup_interactive()
        elif command in ['--verify', 'verify', '--check', 'check']:
            verify_credentials()
        elif command in ['--help', 'help', '-h']:
            print(__doc__)
            print("\nCommands:")
            print("  python setup_spotify.py --setup      Interactive setup wizard")
            print("  python setup_spotify.py --verify     Verify credentials")
            print("  python setup_spotify.py --help       Show this help")
        else:
            print(f"❌ Unknown command: {command}")
            print("   Use --help for available commands")
    else:
        setup_interactive()


if __name__ == '__main__':
    main()
