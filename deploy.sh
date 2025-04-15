#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Build failed. Exiting..."
  exit 1
fi

# Install manus CLI if not already installed
if ! command -v manus &> /dev/null; then
  echo "Installing manus CLI..."
  npm install -g @manus/cli
fi

# Login to manus if not already logged in
if ! manus whoami &> /dev/null; then
  echo "Please login to manus..."
  manus login
fi

# Deploy the application
echo "Deploying to manus.im..."
manus deploy

# Check if deployment was successful
if [ $? -ne 0 ]; then
  echo "Deployment failed. Exiting..."
  exit 1
fi

echo "Deployment successful! 🎉"
echo "Your app is now live at: https://dormlit.app" 