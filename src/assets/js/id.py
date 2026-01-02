import re
import random
import string
import ast

# Function to generate a random six-character ID with lowercase letters and numbers
def generate_id():
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))

# Read the content of the data.js file
with open('data.js', 'r') as file:
    data_js_content = file.read()

# Find the songs list within the JavaScript code using regex
matches = re.findall(r'\bsongs\s*=\s*\[([\s\S]+?)\];', data_js_content)

if matches:
    # Extract the songs list
    songs_str = matches[0]

    # Convert the songs string to a Python list
    songs_list = ast.literal_eval(songs_str)

    # Add a six-character unique custom random ID to each song
    for song in songs_list:
        song['id'] = generate_id()

    # Convert the updated songs list back to string
    updated_songs_str = repr(songs_list)

    # Replace the original songs list in the data.js content with the updated one
    updated_data_js_content = data_js_content.replace(songs_str, updated_songs_str)

    # Write the updated content back to the data.js file
    with open('data.js', 'w') as file:
        file.write(updated_data_js_content)

    print('Unique IDs added successfully.')
else:
    print('Songs list not found in data.js.')
