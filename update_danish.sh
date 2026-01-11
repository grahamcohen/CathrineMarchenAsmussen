#!/bin/bash

# This script adds Danish translations to all video files

# Function to add Danish fields after a specific line
add_after_line() {
    local file=$1
    local search=$2
    local content=$3

    # Use sed to insert content after the matching line
    sed -i "/$search/a\\
$content" "$file"
}

echo "Adding Danish translations to video files..."
echo "Script created but manual edits preferred for accuracy"
