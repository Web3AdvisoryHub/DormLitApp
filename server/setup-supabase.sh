#!/bin/bash

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm install -g supabase
fi

# Initialize Supabase project
echo "Initializing Supabase project..."
supabase init

# Start Supabase services
echo "Starting Supabase services..."
supabase start

# Apply database schema
echo "Applying database schema..."
supabase db reset --db-url postgresql://postgres:postgres@localhost:54322/postgres

# Enable real-time for all tables
echo "Enabling real-time features..."
supabase realtime enable --table profiles
supabase realtime enable --table follows
supabase realtime enable --table calls
supabase realtime enable --table texts
supabase realtime enable --table subscriptions
supabase realtime enable --table rooms
supabase realtime enable --table notifications

# Create storage buckets
echo "Creating storage buckets..."
supabase storage create-bucket avatars
supabase storage create-bucket items
supabase storage create-bucket scenes

# Set up storage policies
echo "Setting up storage policies..."
supabase storage policy create avatars "Public avatars" --bucket avatars --policy "public-read"
supabase storage policy create items "Public items" --bucket items --policy "public-read"
supabase storage policy create scenes "Public scenes" --bucket scenes --policy "public-read"

echo "Supabase setup complete!" 