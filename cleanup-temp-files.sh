#!/bin/bash

# Cleanup Temporary Files Script
# This script cleans up temporary uploaded files older than 24 hours
# Usage: ./cleanup-temp-files.sh [hours]
# Example: ./cleanup-temp-files.sh 24

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to Laravel project directory
cd "$SCRIPT_DIR"

# Default hours if not provided
HOURS=${1:-24}

# Check if artisan exists
if [ ! -f "artisan" ]; then
    echo "Error: artisan file not found. Make sure you're in the Laravel project root."
    exit 1
fi

# Run the cleanup command
echo "Starting cleanup of temporary files older than $HOURS hours..."
php artisan cleanup:temp-files --hours="$HOURS"

# Check if command was successful
if [ $? -eq 0 ]; then
    echo "Cleanup completed successfully."
else
    echo "Cleanup failed with error code $?"
    exit 1
fi

# Optional: Log the cleanup
echo "$(date): Cleanup completed for files older than $HOURS hours" >> storage/logs/cleanup.log