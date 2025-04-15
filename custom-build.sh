#!/bin/bash
# Custom build script for DormLit application
# This script handles specific dependency conflicts between React, React Native, Expo, and @react-three/fiber

echo "Starting custom build process for DormLit application..."

# Create a temporary directory for the build
mkdir -p build_tmp
cd build_tmp

# Copy all files from the repository
echo "Copying repository files..."
cp -r ../client ./
cp -r ../server ./
cp -r ../attached_assets ./
cp ../*.json ./
cp ../*.md ./

# Install core dependencies first with specific versions
echo "Installing core dependencies with specific versions..."
npm install --no-save react@18.2.0 react-dom@18.2.0 --force

# Install React Native with a compatible version
echo "Installing React Native with compatible version..."
npm install --no-save react-native@0.72.6 --force

# Install Expo with a compatible version
echo "Installing Expo with compatible version..."
npm install --no-save expo@48.0.0 --force

# Install @react-three/fiber with a compatible version
echo "Installing @react-three/fiber with compatible version..."
npm install --no-save @react-three/fiber@8.13.0 --force

# Now install all other dependencies with legacy-peer-deps
echo "Installing remaining dependencies..."
npm install --legacy-peer-deps --force

# Run the build process
echo "Running build process..."
npm run build

# If build is successful, copy the build output to the dist directory
if [ $? -eq 0 ]; then
  echo "Build successful! Copying output to dist directory..."
  mkdir -p ../dist
  cp -r ./client/dist/* ../dist/
  echo "Build completed successfully!"
  exit 0
else
  echo "Build failed. Check the logs for details."
  exit 1
fi 