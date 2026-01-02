from pydub import AudioSegment
from pydub.utils import mediainfo
import os

# Function to reduce the size of audio files in a folder
def reduce_audio_size(input_folder_path, output_folder_path, reduction_factor=0.4):
    # Create the output folder if it doesn't exist
    if not os.path.exists(output_folder_path):
        os.makedirs(output_folder_path)
    
    # Loop through each file in the input folder
    for filename in os.listdir(input_folder_path):
        if filename.endswith('.mp3') or filename.endswith('.wav'):
            # Load the audio file
            audio = AudioSegment.from_file(os.path.join(input_folder_path, filename))
            
            # Store existing metadata
            metadata = mediainfo(os.path.join(input_folder_path, filename))
            
            # Reduce the bitrate to reduce file size
            reduced_audio = audio.set_frame_rate(int(audio.frame_rate * (1 - reduction_factor)))
            
            # Construct the output path
            output_filename = os.path.splitext(filename)[0] + '.mp3'
            output_path = os.path.join(output_folder_path, output_filename)
            
            # Export the reduced audio file with preserved metadata
            reduced_audio.export(output_path, format='mp3', tags=metadata)
            
            print(f"Reduced size of {filename} to {output_filename}")

# Specify the input folder containing the audio files
input_folder_path = 'songs'

# Specify the output folder for the reduced audio files
output_folder_path = 'output'

# Reduce the size of audio files in the input folder by 40%
reduce_audio_size(input_folder_path, output_folder_path, reduction_factor=0.3)
