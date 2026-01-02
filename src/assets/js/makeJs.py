import os
import random
import string
from mutagen.easyid3 import EasyID3

# Directory containing audio files
audio_dir = '../songs/'

# Directory containing cover images
cover_dir = '../images/cover/'

# Output file path
output_file = 'data.js'

# Initialize the JavaScript code
js_code = 'let songs = [\n'

# Counter to keep track of printed song info
song_info_counter = 0

# Check if the directories exist
if not os.path.exists(audio_dir):
    print(f"Error: Directory '{audio_dir}' not found.")
    exit()
if not os.path.exists(cover_dir):
    print(f"Error: Directory '{cover_dir}' not found.")
    exit()

# Dictionary to store existing song IDs
existing_ids = set()

# Function to generate a random ID for the song
def generate_song_id():
    return ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(6))

# Function to lowercase cover names
def lowercase_cover_name(cover_name):
    return cover_name.lower()

# Scan the audio directory for audio files
for audio_file in os.listdir(audio_dir):
    if audio_file.endswith('.mp3'):
        # Increment the song_info_counter
        song_info_counter += 1
        
        # Extract song name and artist name from the file name
        song_name = os.path.splitext(audio_file)[0]
        
        # Construct the cover file path
        cover_file = os.path.join(cover_dir, f'{song_name}.jpg')
        
        # Extracting date from metadata
        audio_path = os.path.join(audio_dir, audio_file)
        audio_metadata = EasyID3(audio_path)
        artists = audio_metadata.get('artist', [])
        date = audio_metadata.get('date', [''])[0]
        
        # Check if ID exists for this song
        song_id = audio_metadata.get('id', [''])[0]
        if not song_id:
            # Generate a new ID if it doesn't exist
            while True:
                song_id = generate_song_id()
                if song_id not in existing_ids:
                    existing_ids.add(song_id)
                    break
        
        # Add the song data to the JavaScript code
        js_code += f"  {{\n"
        js_code += f"    'name': '{song_name}',\n"
        js_code += f"    'path': '{os.path.splitext(audio_file)[0]}',\n"
        js_code += f"    'artist': '{', '.join(artists)}',\n"  # Modified artist field to join multiple artists
        js_code += f"    'cover': '{lowercase_cover_name(os.path.splitext(os.path.basename(cover_file))[0])}',\n"
        js_code += f"    'id': '{song_id}',\n"
        js_code += f"    'date': '{date}'\n"  # Added date field
        js_code += f"  }},\n"

# Complete the JavaScript code
js_code += '];\n'

# Write the JavaScript code to the output file with UTF-8 encoding
with open(output_file, 'w', encoding='utf-8') as file:
    file.write(js_code)

print("JavaScript data generated successfully!")
print("Number of song info printed:", song_info_counter)
