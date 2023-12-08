import re
import ast

def remove_from_within_parentheses(entries):
    for entry in entries:
        # Remove content inside parentheses if it contains "(From ...)" from 'name'
        entry['name'] = re.sub(r'\(From [^)]*\)', '', entry['name']).strip()

        # Remove content inside parentheses if it contains "(From ...)" from 'path'
        entry['path'] = re.sub(r'\(From [^)]*\)', '', entry['path']).strip()

    return entries

if __name__ == "__main__":
    try:
        # Read data from current data.js
        with open('data.js', 'r') as data_file:
            data_content = data_file.read().strip()

            if not data_content:
                current_data = []  # Set empty list for an empty file
                print("File is empty.")
            else:
                # Extract the array content using regex
                match = re.search(r'\[.*\]', data_content, re.DOTALL)
                if match:
                    # Convert the matched content to a Python list
                    current_data = ast.literal_eval(match.group())
                    print("Read successfully.")
                    print(current_data)
                else:
                    print("No array found in the file.")

    except FileNotFoundError:
        print("File not found.")
        current_data = []  # Set a default value if the file is not found

    # Call the function to remove content inside parentheses with "(From ...)"
    updated_data = remove_from_within_parentheses(current_data)

    # Save the updated entries to new.js file
    with open('new.js', 'w') as new_file:
        new_file.write('let songs = ' + repr(updated_data) + ';')
