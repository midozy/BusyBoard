#!/bin/bash

# BusyBoard - Push to GitHub Script
# This script initializes git and pushes your code to GitHub

echo "🚀 Pushing BusyBoard to GitHub..."
echo ""

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: BusyBoard v1.0

Features:
- 9 status types with custom colors and icons
- Custom status messages with emoji support
- Auto-reset timer (5min-2hrs)
- Dark mode support
- Keyboard shortcuts (1-9, F, D, P)
- Real-time sync across devices
- Responsive design
- Fullscreen mode
- Persistent state

Generated with Devin (https://devin.ai)"

# Add remote
git branch -M main
git remote add origin https://github.com/midozy/BusyBoard.git

# Push to GitHub
git push -u origin main

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "🔗 Repository: https://github.com/midozy/BusyBoard"
