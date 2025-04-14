-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('user', 'creator', 'pro_creator', 'admin');
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'grandfathered');
CREATE TYPE subscription_tier AS ENUM ('explorer', 'creator', 'pro_creator', 'vip_creator');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error', 'call', 'message', 'follow', 'like', 'comment', 'purchase', 'wallet');
CREATE TYPE room_type AS ENUM (
  'neighborhood',
  'park',
  'club',
  'home',
  'gallery',
  'studio',
  'store',
  'event_space',
  'office',
  'garden',
  'beach',
  'mountain',
  'city',
  'island',
  'theater'
);

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'user',
  subscription_tier subscription_tier DEFAULT 'explorer',
  subscription_status subscription_status DEFAULT 'inactive',
  is_grandfathered BOOLEAN DEFAULT FALSE,
  balance DECIMAL(10,2) DEFAULT 0,
  wallet_address TEXT,
  wallet_provider TEXT,
  wallet_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  display_name TEXT,
  custom_domain TEXT UNIQUE,
  social_links JSONB DEFAULT '{}'::jsonb
);

-- Create wallets table
CREATE TABLE wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  provider TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  last_verified TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, provider)
);

-- Create revenue table
CREATE TABLE revenue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  source TEXT NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  is_grandfathered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create follows table
CREATE TABLE follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  followed_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(follower_id, followed_id)
);

-- Create calls table
CREATE TABLE calls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  caller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  duration INTEGER NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create texts table
CREATE TABLE texts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  cost DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL,
  status subscription_status NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  renewal_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create rooms table
CREATE TABLE rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  layout_data JSONB NOT NULL,
  access_level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  theme TEXT,
  tags TEXT[],
  capacity INTEGER,
  is_featured BOOLEAN DEFAULT FALSE,
  featured_at TIMESTAMPTZ,
  rating DECIMAL(2,1) DEFAULT 0,
  visit_count INTEGER DEFAULT 0,
  is_template BOOLEAN DEFAULT FALSE,
  template_category TEXT,
  music_url TEXT,
  background_url TEXT,
  custom_css TEXT,
  custom_js TEXT
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  message TEXT NOT NULL,
  seen BOOLEAN DEFAULT FALSE,
  sound_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- NFTs table
CREATE TABLE IF NOT EXISTS public.nfts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token_id TEXT NOT NULL,
    contract_address TEXT NOT NULL,
    metadata JSONB NOT NULL,
    image_url TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(token_id, contract_address)
);

-- Indexes for NFTs
CREATE INDEX IF NOT EXISTS idx_nfts_user_id ON public.nfts(user_id);
CREATE INDEX IF NOT EXISTS idx_nfts_token_contract ON public.nfts(token_id, contract_address);

-- RLS policies for NFTs
ALTER TABLE public.nfts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own NFTs"
    ON public.nfts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own NFTs"
    ON public.nfts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own NFTs"
    ON public.nfts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own NFTs"
    ON public.nfts FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update NFT metadata
CREATE OR REPLACE FUNCTION update_nft_metadata(
    p_token_id TEXT,
    p_contract_address TEXT,
    p_metadata JSONB
) RETURNS public.nfts AS $$
DECLARE
    updated_nft public.nfts;
BEGIN
    UPDATE public.nfts
    SET metadata = p_metadata,
        updated_at = NOW()
    WHERE token_id = p_token_id
    AND contract_address = p_contract_address
    AND user_id = auth.uid()
    RETURNING * INTO updated_nft;
    
    RETURN updated_nft;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes
CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_followed_id ON follows(followed_id);
CREATE INDEX idx_calls_caller_id ON calls(caller_id);
CREATE INDEX idx_calls_receiver_id ON calls(receiver_id);
CREATE INDEX idx_texts_sender_id ON texts(sender_id);
CREATE INDEX idx_texts_receiver_id ON texts(receiver_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_rooms_user_id ON rooms(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_revenue_user_id ON revenue(user_id);
CREATE INDEX idx_revenue_created_at ON revenue(created_at);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(theme);
CREATE INDEX IF NOT EXISTS idx_rooms_tags ON rooms USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_rooms_rating ON rooms(rating);
CREATE INDEX IF NOT EXISTS idx_rooms_visit_count ON rooms(visit_count);
CREATE INDEX IF NOT EXISTS idx_rooms_is_featured ON rooms(is_featured);
CREATE INDEX IF NOT EXISTS idx_room_ratings_room_id ON room_ratings(room_id);
CREATE INDEX IF NOT EXISTS idx_room_visits_room_id ON room_visits(room_id);
CREATE INDEX IF NOT EXISTS idx_room_templates_type ON room_templates(type);
CREATE INDEX IF NOT EXISTS idx_room_templates_tags ON room_templates USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Follows policies
CREATE POLICY "Users can view their follows"
  ON follows FOR SELECT
  USING (auth.uid() = follower_id OR auth.uid() = followed_id);

CREATE POLICY "Users can create follows"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Calls policies
CREATE POLICY "Users can view their calls"
  ON calls FOR SELECT
  USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create calls"
  ON calls FOR INSERT
  WITH CHECK (auth.uid() = caller_id);

-- Texts policies
CREATE POLICY "Users can view their texts"
  ON texts FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create texts"
  ON texts FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Rooms policies
CREATE POLICY "Users can view their own rooms"
  ON rooms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rooms"
  ON rooms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rooms"
  ON rooms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rooms"
  ON rooms FOR DELETE
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Wallets policies
CREATE POLICY "Users can view their own wallets"
  ON wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallets"
  ON wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets"
  ON wallets FOR UPDATE
  USING (auth.uid() = user_id);

-- Revenue policies
CREATE POLICY "Users can view their own revenue"
  ON revenue FOR SELECT
  USING (auth.uid() = user_id);

-- Create functions
-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Calculate platform fee based on grandfathered status
CREATE OR REPLACE FUNCTION calculate_platform_fee(user_id UUID, amount DECIMAL)
RETURNS DECIMAL AS $$
DECLARE
  is_grandfathered BOOLEAN;
BEGIN
  SELECT is_grandfathered INTO is_grandfathered
  FROM profiles
  WHERE id = user_id;
  
  IF is_grandfathered THEN
    RETURN 0;
  ELSE
    RETURN amount * 0.1; -- 10% platform fee
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to generate custom domain
CREATE OR REPLACE FUNCTION generate_custom_domain(username TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(username) || '.dormlit';
END;
$$ LANGUAGE plpgsql;

-- Create room ratings table
CREATE TABLE IF NOT EXISTS room_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Create room visits table
CREATE TABLE IF NOT EXISTS room_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration INTEGER,
  UNIQUE(room_id, user_id, visited_at::date)
);

-- Create room templates table
CREATE TABLE IF NOT EXISTS room_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type room_type NOT NULL,
  layout_data JSONB NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  tags TEXT[],
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE room_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view room ratings"
  ON room_ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own ratings"
  ON room_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view room visits"
  ON room_visits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own visits"
  ON room_visits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public templates are viewable by everyone"
  ON room_templates FOR SELECT
  USING (true);

CREATE POLICY "Users can create templates"
  ON room_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Function to update room rating
CREATE OR REPLACE FUNCTION update_room_rating(room_id UUID)
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rooms
  SET rating = (
    SELECT AVG(rating)::DECIMAL(2,1)
    FROM room_ratings
    WHERE room_ratings.room_id = room_id
  )
  WHERE id = room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for room rating updates
CREATE TRIGGER update_room_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON room_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_room_rating(room_id);

-- Function to update visit count
CREATE OR REPLACE FUNCTION update_room_visit_count(room_id UUID)
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rooms
  SET visit_count = visit_count + 1
  WHERE id = room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for visit count updates
CREATE TRIGGER update_room_visit_count_trigger
  AFTER INSERT ON room_visits
  FOR EACH ROW
  EXECUTE FUNCTION update_room_visit_count(room_id);

-- Add collaboration features
CREATE TABLE IF NOT EXISTS room_collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS room_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES room_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS room_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS room_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS room_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_room_collaborators_room_id ON room_collaborators(room_id);
CREATE INDEX IF NOT EXISTS idx_room_collaborators_user_id ON room_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_room_comments_room_id ON room_comments(room_id);
CREATE INDEX IF NOT EXISTS idx_room_comments_user_id ON room_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_room_likes_room_id ON room_likes(room_id);
CREATE INDEX IF NOT EXISTS idx_room_likes_user_id ON room_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_room_bookmarks_room_id ON room_bookmarks(room_id);
CREATE INDEX IF NOT EXISTS idx_room_bookmarks_user_id ON room_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_room_events_room_id ON room_events(room_id);
CREATE INDEX IF NOT EXISTS idx_room_events_user_id ON room_events(user_id);

-- Add RLS policies
ALTER TABLE room_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_events ENABLE ROW LEVEL SECURITY;

-- Collaboration policies
CREATE POLICY "Users can view room collaborators"
  ON room_collaborators FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own collaborations"
  ON room_collaborators FOR ALL
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can view room comments"
  ON room_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON room_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON room_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON room_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Likes and bookmarks policies
CREATE POLICY "Users can view likes and bookmarks"
  ON room_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own likes and bookmarks"
  ON room_likes FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view bookmarks"
  ON room_bookmarks FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own bookmarks"
  ON room_bookmarks FOR ALL
  USING (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Users can view room events"
  ON room_events FOR SELECT
  USING (true);

CREATE POLICY "Users can create events"
  ON room_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION update_room_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE rooms
    SET like_count = COALESCE(like_count, 0) + 1
    WHERE id = NEW.room_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE rooms
    SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0)
    WHERE id = OLD.room_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_room_like_count_trigger
  AFTER INSERT OR DELETE ON room_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_room_like_count();

-- Create amusement park features
CREATE TABLE IF NOT EXISTS amusement_park_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  position JSONB NOT NULL,
  rotation JSONB,
  scale JSONB,
  properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS amusement_park_rides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  popularity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'closed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS amusement_park_visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  happiness INTEGER DEFAULT 100,
  money DECIMAL(10,2) DEFAULT 0,
  last_ride_id UUID REFERENCES amusement_park_rides(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create native coin system
CREATE TABLE IF NOT EXISTS room_coins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  total_supply DECIMAL(20,8) NOT NULL,
  initial_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  market_cap DECIMAL(20,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id)
);

CREATE TABLE IF NOT EXISTS room_coin_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  balance DECIMAL(20,8) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS room_coin_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount DECIMAL(20,8) NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create onboarding system
CREATE TABLE IF NOT EXISTS onboarding_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_onboarding_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  step_id UUID REFERENCES onboarding_steps(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, step_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_amusement_park_assets_room_id ON amusement_park_assets(room_id);
CREATE INDEX IF NOT EXISTS idx_amusement_park_rides_room_id ON amusement_park_rides(room_id);
CREATE INDEX IF NOT EXISTS idx_amusement_park_visitors_room_id ON amusement_park_visitors(room_id);
CREATE INDEX IF NOT EXISTS idx_amusement_park_visitors_user_id ON amusement_park_visitors(user_id);
CREATE INDEX IF NOT EXISTS idx_room_coins_room_id ON room_coins(room_id);
CREATE INDEX IF NOT EXISTS idx_room_coin_balances_room_id ON room_coin_balances(room_id);
CREATE INDEX IF NOT EXISTS idx_room_coin_balances_user_id ON room_coin_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_room_coin_transactions_room_id ON room_coin_transactions(room_id);
CREATE INDEX IF NOT EXISTS idx_room_coin_transactions_from_user_id ON room_coin_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_room_coin_transactions_to_user_id ON room_coin_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_progress_user_id ON user_onboarding_progress(user_id);

-- Add RLS policies
ALTER TABLE amusement_park_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE amusement_park_rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE amusement_park_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_coin_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Amusement park policies
CREATE POLICY "Users can view amusement park assets"
  ON amusement_park_assets FOR SELECT
  USING (true);

CREATE POLICY "Room owners can manage amusement park assets"
  ON amusement_park_assets FOR ALL
  USING (EXISTS (
    SELECT 1 FROM rooms
    WHERE rooms.id = amusement_park_assets.room_id
    AND rooms.user_id = auth.uid()
  ));

-- Room coin policies
CREATE POLICY "Users can view room coins"
  ON room_coins FOR SELECT
  USING (true);

CREATE POLICY "Room owners can manage room coins"
  ON room_coins FOR ALL
  USING (EXISTS (
    SELECT 1 FROM rooms
    WHERE rooms.id = room_coins.room_id
    AND rooms.user_id = auth.uid()
  ));

-- Onboarding policies
CREATE POLICY "Users can view onboarding steps"
  ON onboarding_steps FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own onboarding progress"
  ON user_onboarding_progress FOR ALL
  USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION create_room_coin(
  p_room_id UUID,
  p_name TEXT,
  p_symbol TEXT,
  p_total_supply DECIMAL,
  p_initial_price DECIMAL
) RETURNS room_coins AS $$
DECLARE
  v_coin room_coins;
BEGIN
  INSERT INTO room_coins (
    room_id,
    name,
    symbol,
    total_supply,
    initial_price,
    current_price,
    market_cap
  ) VALUES (
    p_room_id,
    p_name,
    p_symbol,
    p_total_supply,
    p_initial_price,
    p_initial_price,
    p_total_supply * p_initial_price
  ) RETURNING * INTO v_coin;
  
  RETURN v_coin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION transfer_room_coin(
  p_room_id UUID,
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_amount DECIMAL
) RETURNS room_coin_transactions AS $$
DECLARE
  v_transaction room_coin_transactions;
BEGIN
  -- Check if sender has enough balance
  IF NOT EXISTS (
    SELECT 1 FROM room_coin_balances
    WHERE room_id = p_room_id
    AND user_id = p_from_user_id
    AND balance >= p_amount
  ) THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Update balances
  UPDATE room_coin_balances
  SET balance = balance - p_amount
  WHERE room_id = p_room_id AND user_id = p_from_user_id;

  UPDATE room_coin_balances
  SET balance = balance + p_amount
  WHERE room_id = p_room_id AND user_id = p_to_user_id;

  -- Record transaction
  INSERT INTO room_coin_transactions (
    room_id,
    from_user_id,
    to_user_id,
    amount,
    type
  ) VALUES (
    p_room_id,
    p_from_user_id,
    p_to_user_id,
    p_amount,
    'transfer'
  ) RETURNING * INTO v_transaction;

  RETURN v_transaction;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default onboarding steps
INSERT INTO onboarding_steps (title, description, order_index, is_required) VALUES
  ('Welcome to DormLit', 'Get started with your creative journey', 1, true),
  ('Create Your Profile', 'Set up your profile and customize your space', 2, true),
  ('Explore Rooms', 'Discover and visit other creators'' spaces', 3, true),
  ('Create Your First Room', 'Learn how to build your own space', 4, true),
  ('Add Features', 'Add interactive elements to your room', 5, true),
  ('Monetization', 'Learn about monetization options', 6, false),
  ('Advanced Features', 'Explore advanced room features', 7, false); 