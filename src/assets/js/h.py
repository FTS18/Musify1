import json

# Read the content of playlist.js
with open('playlist.js', 'r') as file:
    playlist_js_data = file.read()

# Read the content of playlist_data.json
with open('playlist_data.json', 'r') as file:
    playlist_data_json = file.read()

# Extract the "artists" array from the original playlist.js data
start_index = playlist_js_data.find('"artists": [')
end_index = playlist_js_data.find(']', start_index) + 1
artists_data = playlist_js_data[start_index:end_index]

# Create a new dictionary with the required structure
combined_data = {
    "playlists": json.loads(playlist_data_json)["playlists"],
    "artists": json.loads('{' + artists_data + '}')["artists"]
}

# Write the combined data to new.js
with open('new.js', 'w') as file:
    file.write('let playlist = ' + json.dumps(combined_data, indent=2))
