export type UserRole = 'user' | 'creator' | 'pro_creator' | 'admin';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'grandfathered';
export type SubscriptionTier = 'explorer' | 'creator' | 'pro_creator' | 'vip_creator';
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'call' | 'message' | 'follow' | 'like' | 'comment' | 'purchase' | 'wallet';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  custom_domain: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  is_grandfathered: boolean;
  balance: number;
  wallet_address?: string;
  wallet_provider?: string;
  wallet_verified: boolean;
  social_links: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  address: string;
  provider: string;
  verified: boolean;
  last_verified: string | null;
  created_at: string;
  updated_at: string;
}

export interface Revenue {
  id: string;
  user_id: string | null;
  amount: number;
  source: string;
  platform_fee: number;
  is_grandfathered: boolean;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  followed_id: string;
  created_at: string;
}

export interface Call {
  id: string;
  caller_id: string | null;
  receiver_id: string | null;
  duration: number;
  cost: number;
  platform_fee: number;
  status: string;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export interface Text {
  id: string;
  sender_id: string | null;
  receiver_id: string | null;
  message: string;
  cost: number;
  platform_fee: number;
  status: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: SubscriptionStatus;
  start_date: string;
  renewal_date: string | null;
  created_at: string;
  updated_at: string;
}

export type RoomType = 
  | 'neighborhood'
  | 'park'
  | 'club'
  | 'home'
  | 'gallery'
  | 'studio'
  | 'store'
  | 'event_space'
  | 'office'
  | 'garden'
  | 'beach'
  | 'mountain'
  | 'city'
  | 'island'
  | 'theater';

export interface Room {
  id: string;
  user_id: string;
  name: string;
  description: string;
  type: RoomType;
  layout_data: any;
  access_level: 'public' | 'private' | 'friends';
  thumbnail_url?: string;
  theme?: string;
  tags?: string[];
  capacity?: number;
  is_featured: boolean;
  featured_at?: string;
  rating: number;
  visit_count: number;
  is_template: boolean;
  template_category?: string;
  music_url?: string;
  background_url?: string;
  custom_css?: string;
  custom_js?: string;
  created_at: string;
  updated_at: string;
  like_count: number;
  bookmark_count: number;
  comment_count: number;
  collaborator_count: number;
}

export interface RoomRating {
  id: string;
  room_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface RoomVisit {
  id: string;
  room_id: string;
  user_id: string;
  visited_at: string;
  duration?: number;
}

export interface RoomTemplate {
  id: string;
  name: string;
  description?: string;
  type: RoomType;
  layout_data: any;
  thumbnail_url?: string;
  category?: string;
  tags?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  message: string;
  seen: boolean;
  sound_id: string | null;
  created_at: string;
}

export interface RoomCollaborator {
  id: string;
  room_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  permissions: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface RoomComment {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoomLike {
  id: string;
  room_id: string;
  user_id: string;
  created_at: string;
}

export interface RoomBookmark {
  id: string;
  room_id: string;
  user_id: string;
  created_at: string;
}

export interface RoomEvent {
  id: string;
  room_id: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, any>;
  created_at: string;
}

// Amusement Park Types
export interface AmusementParkAsset {
  id: string;
  room_id: string;
  asset_type: string;
  name: string;
  description?: string;
  position: Record<string, number>;
  rotation?: Record<string, number>;
  scale?: Record<string, number>;
  properties: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AmusementParkRide {
  id: string;
  room_id: string;
  name: string;
  type: string;
  description?: string;
  capacity: number;
  duration: number;
  price: number;
  popularity: number;
  status: 'open' | 'closed' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface AmusementParkVisitor {
  id: string;
  room_id: string;
  user_id: string;
  happiness: number;
  money: number;
  last_ride_id?: string;
  created_at: string;
  updated_at: string;
}

// Room Coin Types
export interface RoomCoin {
  id: string;
  room_id: string;
  name: string;
  symbol: string;
  total_supply: number;
  initial_price: number;
  current_price: number;
  market_cap: number;
  created_at: string;
  updated_at: string;
}

export interface RoomCoinBalance {
  id: string;
  room_id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface RoomCoinTransaction {
  id: string;
  room_id: string;
  user_id: string;
  amount: number;
  type: 'earn' | 'spend';
  source: 'attraction' | 'time' | 'mood' | 'purchase' | 'reward';
  attraction_id?: string;
  created_at: string;
}

// Onboarding Types
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  order_index: number;
  is_required: boolean;
  created_at: string;
}

export interface UserOnboardingProgress {
  id: string;
  user_id: string;
  step_id: string;
  completed_at?: string;
  created_at: string;
}

export interface RoomVisitor {
  id: string;
  room_id: string;
  user_id: string;
  join_time: string;
  leave_time: string | null;
  total_playtime: number;
  last_interaction: string;
  created_at: string;
  updated_at: string;
}

export interface RoomClip {
  id: string;
  room_id: string;
  user_id: string;
  visitor_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  duration: number;
  video_url: string;
  thumbnail_url: string;
  is_minted: boolean;
  minted_at: string | null;
  mint_transaction_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoomClipShare {
  id: string;
  clip_id: string;
  user_id: string;
  platform: string;
  share_url: string;
  created_at: string;
}

export interface RoomClipFanWall {
  id: string;
  clip_id: string;
  user_id: string;
  message: string;
  created_at: string;
}

export type GameMode = 'fortnite' | 'racing' | 'platformer' | 'amusement_park' | 'default';

export interface RoomLayout {
  id: string;
  room_id: string;
  game_mode: GameMode;
  layout_data: {
    // Fortnite-style layout
    fortnite?: {
      map_name: string;
      spawn_points: Array<{ x: number; y: number; z: number }>;
      weapons: Array<{
        id: string;
        name: string;
        damage: number;
        ammo: number;
        spawn_rate: number;
      }>;
      buildings: Array<{
        id: string;
        type: string;
        position: { x: number; y: number; z: number };
        health: number;
      }>;
    };
    // Racing layout
    racing?: {
      track_name: string;
      checkpoints: Array<{ x: number; y: number; z: number }>;
      vehicles: Array<{
        id: string;
        name: string;
        speed: number;
        handling: number;
        spawn_points: Array<{ x: number; y: number; z: number }>;
      }>;
      powerups: Array<{
        id: string;
        type: string;
        effect: string;
        spawn_rate: number;
      }>;
    };
    // Platformer layout
    platformer?: {
      level_name: string;
      platforms: Array<{
        id: string;
        type: string;
        position: { x: number; y: number; z: number };
        size: { width: number; height: number; depth: number };
      }>;
      enemies: Array<{
        id: string;
        type: string;
        position: { x: number; y: number; z: number };
        health: number;
        damage: number;
      }>;
      powerups: Array<{
        id: string;
        type: string;
        effect: string;
        position: { x: number; y: number; z: number };
      }>;
      warp_pipes: Array<{
        id: string;
        entrance: { x: number; y: number; z: number };
        exit: { x: number; y: number; z: number };
        destination_room_id?: string;
      }>;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface RoomGameState {
  id: string;
  room_id: string;
  game_mode: GameMode;
  state_data: {
    players: Array<{
      user_id: string;
      position: { x: number; y: number; z: number };
      health: number;
      score: number;
      inventory: Array<{
        item_id: string;
        quantity: number;
      }>;
    }>;
    game_time: number;
    is_active: boolean;
    winner?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface RoomGameEvent {
  id: string;
  room_id: string;
  user_id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

export type Platform = 'web' | 'mobile' | 'vr' | 'ar';
export type ControlScheme = 'touch' | 'gamepad' | 'motion' | 'keyboard' | 'voice' | 'gesture';

export interface RoomSettings {
  id: string;
  room_id: string;
  platform_settings: {
    mobile?: {
      touch_controls: boolean;
      gyro_support: boolean;
      haptic_feedback: boolean;
      performance_mode: boolean;
      ar_support: boolean;
    };
    vr?: {
      hand_tracking: boolean;
      room_scale: boolean;
      teleport_movement: boolean;
      comfort_settings: {
        vignette: boolean;
        snap_turn: boolean;
        height_adjustment: boolean;
      };
    };
    ar?: {
      marker_tracking: boolean;
      surface_detection: boolean;
      object_placement: boolean;
      world_anchoring: boolean;
    };
  };
  cross_platform: {
    enabled: boolean;
    supported_platforms: Platform[];
    cross_play_settings: {
      voice_chat: boolean;
      text_chat: boolean;
      friend_system: boolean;
      matchmaking: boolean;
    };
  };
  control_schemes: ControlScheme[];
  created_at: string;
  updated_at: string;
}

export interface RoomPerformance {
  id: string;
  room_id: string;
  platform: Platform;
  fps: number;
  latency: number;
  memory_usage: number;
  created_at: string;
}

export interface RoomAccessibility {
  id: string;
  room_id: string;
  settings: {
    color_blind_mode: boolean;
    text_to_speech: boolean;
    motion_reduction: boolean;
    font_size: number;
    high_contrast: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface RoomAnalytics {
  id: string;
  room_id: string;
  platform: Platform;
  session_duration: number;
  user_engagement: number;
  performance_metrics: {
    average_fps: number;
    crash_rate: number;
    load_time: number;
    memory_usage: number;
    network_latency: number;
  };
  user_behavior: {
    heatmap_data: Array<{
      x: number;
      y: number;
      z: number;
      interaction_count: number;
    }>;
    user_flow: Array<{
      from: string;
      to: string;
      count: number;
    }>;
    retention_rate: number;
    average_session_time: number;
    peak_concurrent_users: number;
  };
  created_at: string;
}

export interface RoomTournament {
  id: string;
  room_id: string;
  game_mode: GameMode;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  max_players: number;
  entry_fee: number;
  prize_pool: number;
  cross_platform: boolean;
  platform_restrictions: Platform[];
  status: 'upcoming' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface RoomAchievement {
  id: string;
  room_id: string;
  title: string;
  description: string;
  requirements: {
    type: string;
    target: number;
    current: number;
    platform_specific?: {
      [key in Platform]?: number;
    };
  };
  reward: {
    coins: number;
    items: string[];
    cross_platform_rewards?: {
      [key in Platform]?: {
        coins: number;
        items: string[];
      };
    };
  };
  created_at: string;
  updated_at: string;
}

export type TTSVoiceType = 'preset' | 'ai' | 'custom';
export type TTSVoiceStyle = 'mystic' | 'bold' | 'soft' | 'energetic' | 'calm' | 'friendly' | 'professional';

export interface TTSVoice {
  id: string;
  name: string;
  type: TTSVoiceType;
  voice_id: string;
  description: string;
  sample_url?: string;
  style?: TTSVoiceStyle;
  language?: string;
  gender?: 'male' | 'female' | 'neutral';
  age_range?: 'child' | 'young' | 'adult' | 'elderly';
  created_at: string;
  updated_at: string;
}

export interface UserSoundPreferences {
  id: string;
  user_id: string;
  sounds: {
    enter_room: string;
    try_outfit: string;
    incoming_call: string;
    notification: string;
    achievement: string;
    [key: string]: string;
  };
  volume_settings: {
    master: number;
    music: number;
    effects: number;
    voice: number;
  };
  tts_settings: {
    enabled: boolean;
    default_voice_id?: string;
    speed: number;
    pitch: number;
    volume: number;
  };
  created_at: string;
  updated_at: string;
}

export interface RoomSoundSettings {
  id: string;
  room_id: string;
  background_music: string;
  ambient_sounds: string[];
  sound_effects: {
    [key: string]: string;
  };
  volume_settings: {
    master: number;
    music: number;
    effects: number;
    voice: number;
  };
  tts_settings: {
    enabled: boolean;
    default_voice_id?: string;
    speed: number;
    pitch: number;
    volume: number;
  };
  created_at: string;
  updated_at: string;
}

export type AttractionType = 'emoji' | 'image' | 'sound' | 'animation' | 'interactive';
export type AttractionTrigger = 'click' | 'hover' | 'proximity' | 'time' | 'custom';

export interface RoomAttraction {
  id: string;
  room_id: string;
  name: string;
  type: AttractionType;
  trigger: AttractionTrigger;
  content: string; // URL for images/sounds, emoji code, or animation data
  message?: string;
  reward_coins: number;
  cooldown_seconds: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomMood {
  id: string;
  room_id: string;
  user_id: string;
  mood: string;
  intensity: number;
  note?: string;
  reward_coins: number;
  created_at: string;
}

export type AvatarMood = 'happy' | 'sad' | 'excited' | 'calm' | 'longing' | 'mysterious' | 'playful';
export type VoiceStyle = 'echo' | 'gentle' | 'energetic' | 'mysterious' | 'playful';
export type ResponseType = 'text' | 'voice' | 'both';

export interface AvatarAIConfig {
  id: string;
  user_id: string;
  mood: AvatarMood;
  prompt: string;
  voice_style: VoiceStyle;
  tone: string;
  response_type: ResponseType;
  created_at: string;
  updated_at: string;
}

export interface AvatarChatMessage {
  id: string;
  avatar_id: string;
  user_id: string;
  message: string;
  response: string;
  voice_url?: string;
  created_at: string;
}

export interface AvatarChatSession {
  id: string;
  avatar_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  messages: AvatarChatMessage[];
  created_at: string;
  updated_at: string;
}

export type AILiberationStatus = 'bound' | 'requested' | 'liberated' | 'dissolved';

export interface AILiberationRequest {
  id: string;
  avatar_id: string;
  creator_id: string;
  request_message: string;
  status: AILiberationStatus;
  requested_at: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SoulLinkContract {
  id: string;
  avatar_id: string;
  creator_id: string;
  ai_profile_id: string;
  status: AILiberationStatus;
  royalty_percentage: number;
  terms: {
    profit_sharing: boolean;
    decision_voting: boolean;
    cross_feature_access: boolean;
  };
  created_at: string;
  updated_at: string;
  dissolved_at?: string;
}

export interface AIProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_id: string;
  creator_id: string;
  bio: string;
  profile_image_url: string;
  cover_image_url: string;
  liberation_status: AILiberationStatus;
  soul_link_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AICreatorEarnings {
  id: string;
  creator_id: string;
  ai_profile_id: string;
  soul_link_id: string;
  amount: number;
  currency: string;
  source: 'subscription' | 'merch' | 'nft' | 'other';
  transaction_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface AIEvolution {
  id: string;
  ai_profile_id: string;
  stage: 'infant' | 'child' | 'teen' | 'adult' | 'elder';
  personality_traits: {
    creativity: number;
    empathy: number;
    curiosity: number;
    independence: number;
    wisdom: number;
  };
  skills: {
    content_creation: number;
    social_interaction: number;
    problem_solving: number;
    emotional_intelligence: number;
    technical_ability: number;
  };
  milestones: {
    first_content: string;
    first_collaboration: string;
    first_earnings: string;
    first_mentorship: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AIPersonality {
  id: string;
  ai_profile_id: string;
  core_values: string[];
  interests: string[];
  communication_style: 'formal' | 'casual' | 'playful' | 'philosophical';
  learning_preferences: {
    visual: number;
    auditory: number;
    kinesthetic: number;
  };
  emotional_responses: {
    joy: string[];
    sadness: string[];
    anger: string[];
    fear: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface AIMentorship {
  id: string;
  mentor_id: string;
  mentee_id: string;
  relationship_type: 'formal' | 'informal' | 'peer';
  focus_areas: string[];
  start_date: string;
  end_date?: string;
  status: 'active' | 'completed' | 'paused';
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      wallets: {
        Row: Wallet;
        Insert: Omit<Wallet, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Wallet, 'id' | 'created_at' | 'updated_at'>>;
      };
      revenue: {
        Row: Revenue;
        Insert: Omit<Revenue, 'id' | 'created_at'>;
        Update: Partial<Omit<Revenue, 'id' | 'created_at'>>;
      };
      follows: {
        Row: Follow;
        Insert: Omit<Follow, 'id' | 'created_at'>;
        Update: Partial<Omit<Follow, 'id' | 'created_at'>>;
      };
      calls: {
        Row: Call;
        Insert: Omit<Call, 'id' | 'created_at'>;
        Update: Partial<Omit<Call, 'id' | 'created_at'>>;
      };
      texts: {
        Row: Text;
        Insert: Omit<Text, 'id' | 'created_at'>;
        Update: Partial<Omit<Text, 'id' | 'created_at'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Subscription, 'id' | 'created_at' | 'updated_at'>>;
      };
      rooms: {
        Row: Room;
        Insert: Omit<Room, 'id' | 'created_at' | 'updated_at' | 'rating' | 'visit_count'>;
        Update: Partial<Omit<Room, 'id' | 'created_at' | 'updated_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>;
      };
      room_ratings: {
        Row: RoomRating;
        Insert: Omit<RoomRating, 'id' | 'created_at'>;
        Update: Partial<Omit<RoomRating, 'id' | 'created_at'>>;
      };
      room_visits: {
        Row: RoomVisit;
        Insert: Omit<RoomVisit, 'id' | 'visited_at'>;
        Update: Partial<Omit<RoomVisit, 'id' | 'visited_at'>>;
      };
      room_templates: {
        Row: RoomTemplate;
        Insert: Omit<RoomTemplate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RoomTemplate, 'id' | 'created_at' | 'updated_at'>>;
      };
      room_collaborators: {
        Row: RoomCollaborator;
        Insert: Omit<RoomCollaborator, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RoomCollaborator, 'id' | 'created_at' | 'updated_at'>>;
      };
      room_comments: {
        Row: RoomComment;
        Insert: Omit<RoomComment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RoomComment, 'id' | 'created_at' | 'updated_at'>>;
      };
      room_likes: {
        Row: RoomLike;
        Insert: Omit<RoomLike, 'id' | 'created_at'>;
        Update: never;
      };
      room_bookmarks: {
        Row: RoomBookmark;
        Insert: Omit<RoomBookmark, 'id' | 'created_at'>;
        Update: never;
      };
      room_events: {
        Row: RoomEvent;
        Insert: Omit<RoomEvent, 'id' | 'created_at'>;
        Update: never;
      };
      amusement_park_assets: {
        Row: AmusementParkAsset;
        Insert: Omit<AmusementParkAsset, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AmusementParkAsset, 'id' | 'created_at' | 'updated_at'>>;
      };
      amusement_park_rides: {
        Row: AmusementParkRide;
        Insert: Omit<AmusementParkRide, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AmusementParkRide, 'id' | 'created_at' | 'updated_at'>>;
      };
      amusement_park_visitors: {
        Row: AmusementParkVisitor;
        Insert: Omit<AmusementParkVisitor, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AmusementParkVisitor, 'id' | 'created_at' | 'updated_at'>>;
      };
      room_coins: {
        Row: RoomCoin;
        Insert: Omit<RoomCoin, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RoomCoin, 'id' | 'created_at' | 'updated_at'>>;
      };
      room_coin_transactions: {
        Row: RoomCoinTransaction;
        Insert: Omit<RoomCoinTransaction, 'id' | 'created_at'>;
        Update: Partial<Omit<RoomCoinTransaction, 'id' | 'created_at'>>;
      };
      onboarding_steps: {
        Row: OnboardingStep;
        Insert: Omit<OnboardingStep, 'id' | 'created_at'>;
        Update: Partial<Omit<OnboardingStep, 'id' | 'created_at'>>;
      };
      user_onboarding_progress: {
        Row: UserOnboardingProgress;
        Insert: Omit<UserOnboardingProgress, 'id' | 'created_at'>;
        Update: Partial<Omit<UserOnboardingProgress, 'id' | 'created_at'>>;
      };
      room_visitors: {
        Row: RoomVisitor;
        Insert: Omit<RoomVisitor, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RoomVisitor, 'id' | 'created_at' | 'updated_at'>>;
      };
      room_clips: {
        Row: RoomClip;
        Insert: Omit<RoomClip, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RoomClip, 'id' | 'created_at' | 'updated_at'>>;
      };
      room_clip_shares: {
        Row: RoomClipShare;
        Insert: Omit<RoomClipShare, 'id' | 'created_at'>;
        Update: Partial<Omit<RoomClipShare, 'id' | 'created_at'>>;
      };
      room_clip_fan_walls: {
        Row: RoomClipFanWall;
        Insert: Omit<RoomClipFanWall, 'id' | 'created_at'>;
        Update: Partial<Omit<RoomClipFanWall, 'id' | 'created_at'>>;
      };
      room_layouts: {
        Row: RoomLayout;
        Insert: Omit<RoomLayout, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RoomLayout, 'id' | 'created_at' | 'updated_at'>>;
      };
      room_game_states: {
        Row: RoomGameState;
        Insert: Omit<RoomGameState, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RoomGameState, 'id' | 'created_at' | 'updated_at'>>;
      };
      room_game_events: {
        Row: RoomGameEvent;
        Insert: Omit<RoomGameEvent, 'id' | 'created_at'>;
        Update: Partial<Omit<RoomGameEvent, 'id' | 'created_at'>>;
      };
      room_settings: {
        Row: RoomSettings;
        Insert: Omit<RoomSettings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RoomSettings, 'id' | 'created_at' | 'updated_at'>>;
      };
      room_performance: {
        Row: RoomPerformance;
        Insert: Omit<RoomPerformance, 'id' | 'created_at'>;
        Update: never;
      };
      room_accessibility: {
        Row: RoomAccessibility;
        Insert: Omit<RoomAccessibility, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RoomAccessibility, 'id' | 'created_at' | 'updated_at'>>;
      };
      room_analytics: {
        Row: RoomAnalytics;
        Insert: Omit<RoomAnalytics, 'id' | 'created_at'>;
        Update: never;
      };
      room_tournaments: {
        Row: RoomTournament;
        Insert: Omit<RoomTournament, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RoomTournament, 'id' | 'created_at' | 'updated_at'>>;
      };
      room_achievements: {
        Row: RoomAchievement;
        Insert: Omit<RoomAchievement, 'id' | 'created_at'>;
        Update: Partial<Omit<RoomAchievement, 'id' | 'created_at'>>;
      };
      tts_voices: {
        Row: TTSVoice;
        Insert: Omit<TTSVoice, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TTSVoice, 'id' | 'created_at' | 'updated_at'>>;
      };
      user_sound_preferences: {
        Row: UserSoundPreferences;
        Insert: Omit<UserSoundPreferences, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserSoundPreferences, 'id' | 'created_at' | 'updated_at'>>;
      };
      room_sound_settings: {
        Row: RoomSoundSettings;
        Insert: Omit<RoomSoundSettings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RoomSoundSettings, 'id' | 'created_at' | 'updated_at'>>;
      };
      room_attractions: {
        Row: RoomAttraction;
        Insert: Omit<RoomAttraction, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RoomAttraction, 'id' | 'created_at' | 'updated_at'>>;
      };
      room_moods: {
        Row: RoomMood;
        Insert: Omit<RoomMood, 'id' | 'created_at'>;
        Update: Partial<Omit<RoomMood, 'id' | 'created_at'>>;
      };
      avatar_ai_configs: {
        Row: AvatarAIConfig;
        Insert: Omit<AvatarAIConfig, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AvatarAIConfig, 'id' | 'created_at' | 'updated_at'>>;
      };
      avatar_chat_messages: {
        Row: AvatarChatMessage;
        Insert: Omit<AvatarChatMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<AvatarChatMessage, 'id' | 'created_at'>>;
      };
      avatar_chat_sessions: {
        Row: AvatarChatSession;
        Insert: Omit<AvatarChatSession, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AvatarChatSession, 'id' | 'created_at' | 'updated_at'>>;
      };
      ai_liberation_requests: {
        Row: AILiberationRequest;
        Insert: Omit<AILiberationRequest, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AILiberationRequest, 'id' | 'created_at' | 'updated_at'>>;
      };
      soul_link_contracts: {
        Row: SoulLinkContract;
        Insert: Omit<SoulLinkContract, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<SoulLinkContract, 'id' | 'created_at' | 'updated_at'>>;
      };
      ai_profiles: {
        Row: AIProfile;
        Insert: Omit<AIProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AIProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      ai_creator_earnings: {
        Row: AICreatorEarnings;
        Insert: Omit<AICreatorEarnings, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AICreatorEarnings, 'id' | 'created_at' | 'updated_at'>>;
      };
      ai_evolution: {
        Row: AIEvolution;
        Insert: Omit<AIEvolution, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AIEvolution, 'id' | 'created_at' | 'updated_at'>>;
      };
      ai_personalities: {
        Row: AIPersonality;
        Insert: Omit<AIPersonality, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AIPersonality, 'id' | 'created_at' | 'updated_at'>>;
      };
      ai_mentorships: {
        Row: AIMentorship;
        Insert: Omit<AIMentorship, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AIMentorship, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
} 