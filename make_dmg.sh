#!/bin/bash

# MDRN Corp Release Script
# Packages Side Piece for macOS

set -e

APP_NAME="Side Piece"
VERSION="1.0.0"
DIST_DIR="dist"
DMG_NAME="Side-Piece-v${VERSION}.dmg"

echo "Building project..."
npm run build

echo "Creating DMG..."
# Create a temporary directory for the DMG content
mkdir -p "release_tmp"
cp -R "$DIST_DIR"/* "release_tmp/"

# Create the DMG
hdiutil create -volname "$APP_NAME" -srcfolder "release_tmp" -ov -format UDZO "$DMG_NAME"

# Cleanup
rm -rf "release_tmp"

echo "Release ready: $DMG_NAME"
