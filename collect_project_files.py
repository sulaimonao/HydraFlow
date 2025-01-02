import os

def crawl_and_collect(directory, file_extensions, output_file):
    """
    Crawls through the specified directory and collects contents of files with the given extensions.

    Args:
        directory (str): The directory to crawl.
        file_extensions (list): List of file extensions to look for (e.g., ['.js', '.json']).
        output_file (str): The output file to save the collected data.

    Returns:
        None
    """
    collected_files = []

    for root, dirs, files in os.walk(directory):
        for file in files:
            if any(file.endswith(ext) for ext in file_extensions):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        collected_files.append({
                            "file_path": file_path,
                            "content": content
                        })
                except Exception as e:
                    print(f"Error reading {file_path}: {e}")

    # Write the collected data to the output file
    with open(output_file, 'w', encoding='utf-8') as out:
        for file in collected_files:
            out.write(f"File: {file['file_path']}\n")
            out.write(f"Content:\n{file['content']}\n")
            out.write("=" * 80 + "\n")

    print(f"Collected data saved to {output_file}")

# Set the directory and file types you want to collect
project_directory = "/Users/akeemsulaimon/Documents/GitHub/HydraFlow"  # Replace with the actual path to your project
file_types_to_collect = ['.js', '.json']
output_file_path = "collected_project_data.txt"

# Run the script
crawl_and_collect(project_directory, file_types_to_collect, output_file_path)
