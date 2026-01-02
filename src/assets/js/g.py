import json
import os

# Read the songs data from data.js
with open('data.js', 'r') as file:
    js_content = file.read()

# Extract the playlists array from data.js
start_index = js_content.find('[{')
end_index = js_content.find('}]') + 2
playlists_data = js_content[start_index:end_index]

# Convert the playlists data to a Python list
playlists = eval(playlists_data)

# Create a dictionary to store songs for each artist
artist_playlists = {}

# Populate the dictionary with songs for each artist
for playlist in playlists:
    artists = playlist['artist'].split(', ')
    for artist in artists:
        if artist not in artist_playlists:
            artist_playlists[artist] = []
        # Check for duplicate entries before adding the song
        if playlist not in artist_playlists[artist]:
            artist_playlists[artist].append(playlist)

# Sort the dictionary based on the number of songs each artist has
sorted_artists = sorted(artist_playlists.items(), key=lambda x: len(x[1]), reverse=True)

# Generate the main playlist data
main_playlist_data = {'artists': []}

# Generate sub-playlists for each artist
for artist, artist_songs in sorted_artists:
    # Define the image source path based on the artist's name
    image_src = f'assets/images/artists/{artist.lower()}.webp'
    # Check if the image file exists
    if not os.path.isfile(image_src):
        # If the image file doesn't exist, use a default image
        image_src = 'default_image.webp'
    artist_playlist_data = {'name': artist, 'imageSrc': image_src, 'songs': artist_songs}
    main_playlist_data['artists'].append(artist_playlist_data)

# Write the main playlist data to the playlist.js file
with open('playlist.js', 'w') as file:
    file.write(f'let playlist = {json.dumps(main_playlist_data, indent=2)};')

print('Playlist file generated: playlist.js')
