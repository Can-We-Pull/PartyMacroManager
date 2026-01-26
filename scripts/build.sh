#!/bin/bash

# Check if version argument is provided
if [ -z "$1" ]; then
    echo "Usage: ./build.sh <version>"
    echo "Example: ./build.sh 1.2.3"
    exit 1
fi

VERSION=$1

# Clean up any existing build artifacts
rm -rf PartyMacroManager PartyMacroManager.zip

# Update version in .toc file
sed -i.bak "s/^## Version: .*/## Version: $VERSION/" src/PartyMacroManager.toc
rm -f src/PartyMacroManager.toc.bak

echo "Updated PartyMacroManager.toc to version $VERSION"

# Create the addon directory structure
mkdir -p PartyMacroManager

# Copy all files from src/ to PartyMacroManager/
cp src/* PartyMacroManager/

# Create the zip file
zip -r PartyMacroManager.zip PartyMacroManager/

# Clean up the temporary directory
rm -rf PartyMacroManager

echo "Build complete! PartyMacroManager.zip created with version $VERSION."