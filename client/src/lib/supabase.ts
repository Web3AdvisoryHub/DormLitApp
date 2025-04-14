import { createClient } from '@supabase/supabase-js';
import { Database } from '@/shared/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

export const getUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Profile helpers
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const updateProfile = async (userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Subscription helpers
export const createSubscription = async (userId: string, tier: Database['public']['Tables']['profiles']['Row']['subscription_tier']) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_status: 'active'
    })
    .eq('user_id', userId)
    .select()
    .single();
  return { data, error };
};

export const cancelSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      subscription_status: 'cancelled',
      subscription_tier: 'explorer'
    })
    .eq('user_id', userId)
    .select()
    .single();
  return { data, error };
};

// Wallet helpers
export const linkWallet = async (userId: string, address: string, provider: string) => {
  const { data, error } = await supabase
    .from('wallets')
    .upsert({
      user_id: userId,
      address,
      provider,
      verified: false
    })
    .select()
    .single();
  return { data, error };
};

export const verifyWallet = async (userId: string, signature: string) => {
  const { data, error } = await supabase
    .from('wallets')
    .update({
      verified: true,
      last_verified: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();
  return { data, error };
};

export const getWallet = async (userId: string) => {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

// Revenue helpers
export const trackRevenue = async (userId: string, amount: number, source: string) => {
  const { data, error } = await supabase
    .from('revenue')
    .insert({
      user_id: userId,
      amount,
      source,
      platform_fee: amount * 0.1
    })
    .select()
    .single();
  return { data, error };
};

export const getRevenueHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('revenue')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

// Real-time subscription management
const activeSubscriptions = new Map<string, any>();

export const subscribeToProfile = (userId: string, callback: (payload: any) => void) => {
  const channel = supabase
    .channel('profile_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  activeSubscriptions.set(`profile_${userId}`, channel);
  return channel;
};

export const unsubscribeFromProfile = (userId: string) => {
  const channel = activeSubscriptions.get(`profile_${userId}`);
  if (channel) {
    channel.unsubscribe();
    activeSubscriptions.delete(`profile_${userId}`);
  }
};

export const subscribeToNotifications = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToCalls = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('calls')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'calls',
        filter: `caller_id=eq.${userId},receiver_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToTexts = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('texts')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'texts',
        filter: `receiver_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToRoom = (roomId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('room_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      callback
    )
    .subscribe();
};

// Batch operations
export const batchUpdateNotifications = async (notificationIds: string[]) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ seen: true })
    .in('id', notificationIds)
    .select();
  
  if (error) throw error;
  return data;
};

export const batchDeleteNotifications = async (notificationIds: string[]) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .in('id', notificationIds);
  
  if (error) throw error;
};

// Cache helpers
export const cacheProfile = async (userId: string) => {
  const profile = await getProfile(userId);
  if (profile) {
    localStorage.setItem(`profile_${userId}`, JSON.stringify(profile));
  }
  return profile;
};

export const getCachedProfile = (userId: string) => {
  const cached = localStorage.getItem(`profile_${userId}`);
  return cached ? JSON.parse(cached) : null;
};

// Enhanced error handling with retries
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

// Enhanced profile management with optimistic updates
export const updateProfileWithOptimistic = async (
  userId: string,
  updates: Partial<Database['public']['Tables']['profiles']['Update']>,
  optimisticData: any
) => {
  // Update local cache immediately
  const cachedProfile = getCachedProfile(userId);
  if (cachedProfile) {
    localStorage.setItem(
      `profile_${userId}`,
      JSON.stringify({ ...cachedProfile, ...optimisticData })
    );
  }

  try {
    const result = await withRetry(() => updateProfile(userId, updates));
    return result;
  } catch (error) {
    // Revert optimistic update on error
    if (cachedProfile) {
      localStorage.setItem(`profile_${userId}`, JSON.stringify(cachedProfile));
    }
    throw error;
  }
};

// Enhanced notification management
export const markNotificationsAsSeenWithOptimistic = async (notificationIds: string[]) => {
  // Update local cache immediately
  const cachedNotifications = JSON.parse(
    localStorage.getItem('notifications') || '[]'
  );
  
  const updatedNotifications = cachedNotifications.map((n: any) =>
    notificationIds.includes(n.id) ? { ...n, seen: true } : n
  );
  
  localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

  try {
    const result = await withRetry(() => batchUpdateNotifications(notificationIds));
    return result;
  } catch (error) {
    // Revert optimistic update on error
    localStorage.setItem('notifications', JSON.stringify(cachedNotifications));
    throw error;
  }
};

// Enhanced call management with retries
export const createCallWithRetry = async (
  record: Database['public']['Tables']['calls']['Insert']
) => {
  return withRetry(() => createCall(record), 3, 1000);
};

// Enhanced text management with retries
export const sendTextWithRetry = async (
  record: Database['public']['Tables']['texts']['Insert']
) => {
  return withRetry(() => sendText(record), 3, 1000);
};

// Enhanced subscription management
export const subscribeToAll = (userId: string, callbacks: {
  profile?: (payload: any) => void;
  notifications?: (payload: any) => void;
  calls?: (payload: any) => void;
  texts?: (payload: any) => void;
}) => {
  const channels = [];

  if (callbacks.profile) {
    channels.push(subscribeToProfile(userId, callbacks.profile));
  }
  if (callbacks.notifications) {
    channels.push(subscribeToNotifications(userId, callbacks.notifications));
  }
  if (callbacks.calls) {
    channels.push(subscribeToCalls(userId, callbacks.calls));
  }
  if (callbacks.texts) {
    channels.push(subscribeToTexts(userId, callbacks.texts));
  }

  return () => {
    channels.forEach(channel => channel.unsubscribe());
  };
};

// Enhanced error handling middleware
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    console.error(`Error in ${context}:`, error);
    
    if (error.code === 'PGRST116') {
      throw new Error(`Resource not found in ${context}`);
    }
    if (error.code === '23505') {
      throw new Error(`Duplicate entry in ${context}`);
    }
    if (error.code === '23503') {
      throw new Error(`Foreign key constraint violation in ${context}`);
    }
    if (error.code === '42P01') {
      throw new Error(`Table does not exist: ${context}`);
    }
    if (error.code === 'PGRST301') {
      throw new Error(`Rate limit exceeded in ${context}`);
    }
    
    throw error;
  }
};

// Enhanced storage helpers with progress tracking
export const uploadFileWithProgress = async (
  bucket: string,
  path: string,
  file: File,
  onProgress?: (progress: number) => void
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      onUploadProgress: (progress) => {
        if (onProgress) {
          onProgress((progress.loaded / progress.total) * 100);
        }
      }
    });

  if (error) throw error;
  return data;
};

// Enhanced profile management with avatar handling
export const updateProfileWithAvatar = async (
  userId: string,
  updates: Partial<Database['public']['Tables']['profiles']['Update']>,
  avatarFile?: File
) => {
  if (avatarFile) {
    const avatarPath = `avatars/${userId}/${Date.now()}_${avatarFile.name}`;
    await uploadFileWithProgress('avatars', avatarPath, avatarFile);
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(avatarPath);

    updates.avatar_url = publicUrl;
  }

  return updateProfile(userId, updates);
};

// User profile functions
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId: string, updates: any) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Follow functions
export const followUser = async (followerId: string, followedId: string) => {
  const { data, error } = await supabase
    .from('follows')
    .insert([{ follower_id: followerId, followed_id: followedId }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const unfollowUser = async (followerId: string, followedId: string) => {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('followed_id', followedId);
  if (error) throw error;
};

// Call functions
export const createCall = async (callData: {
  caller_id: string;
  receiver_id: string;
  duration: number;
  cost: number;
}) => {
  const { data, error } = await supabase
    .from('calls')
    .insert([callData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getCallHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('calls')
    .select('*')
    .or(`caller_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Text functions
export const sendText = async (textData: {
  sender_id: string;
  receiver_id: string;
  message: string;
}) => {
  const { data, error } = await supabase
    .from('texts')
    .insert([textData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getTextHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('texts')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Subscription functions
export const getSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
};

// Room functions
export const createRoom = async (roomData: {
  user_id: string;
  layout_data: any;
  access_level: string;
}) => {
  const { data, error } = await supabase
    .from('rooms')
    .insert([roomData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getRoom = async (roomId: string) => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();
  if (error) throw error;
  return data;
};

// Notification functions
export const createNotification = async (notificationData: {
  user_id: string;
  type: string;
  message: string;
  sound_id?: string;
}) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notificationData])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const markNotificationAsSeen = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ seen: true })
    .eq('id', notificationId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Helper function to handle errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  throw new Error(error.message || 'An error occurred with the database');
};

// Helper function to get user's calls
export const getCalls = async (userId: string) => {
  const { data, error } = await supabase
    .from('calls')
    .select('*')
    .or(`caller_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Helper function to get user's texts
export const getTexts = async (userId: string) => {
  const { data, error } = await supabase
    .from('texts')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Helper function to get user's subscriptions
export const getSubscriptions = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// Helper function to get user's rooms
export const getRooms = async (userId: string) => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

// NFT Storage Management
export const storeNFT = async (
  userId: string,
  nftData: {
    tokenId: string;
    contractAddress: string;
    metadata: any;
    imageUrl: string;
    name: string;
    description?: string;
  }
) => {
  const { data, error } = await supabase
    .from('nfts')
    .insert({
      user_id: userId,
      token_id: nftData.tokenId,
      contract_address: nftData.contractAddress,
      metadata: nftData.metadata,
      image_url: nftData.imageUrl,
      name: nftData.name,
      description: nftData.description,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getUserNFTs = async (userId: string) => {
  const { data, error } = await supabase
    .from('nfts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getNFT = async (tokenId: string, contractAddress: string) => {
  const { data, error } = await supabase
    .from('nfts')
    .select('*')
    .eq('token_id', tokenId)
    .eq('contract_address', contractAddress)
    .single();

  if (error) throw error;
  return data;
};

export const updateNFTMetadata = async (
  tokenId: string,
  contractAddress: string,
  metadata: any
) => {
  const { data, error } = await supabase
    .from('nfts')
    .update({ metadata })
    .eq('token_id', tokenId)
    .eq('contract_address', contractAddress)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteNFT = async (tokenId: string, contractAddress: string) => {
  const { error } = await supabase
    .from('nfts')
    .delete()
    .eq('token_id', tokenId)
    .eq('contract_address', contractAddress);

  if (error) throw error;
};

// Enhanced wallet management with NFT support
export const getWalletWithNFTs = async (userId: string) => {
  const wallet = await getWallet(userId);
  const nfts = await getUserNFTs(userId);
  
  return {
    ...wallet,
    nfts
  };
};

// NFT Storage with optimistic updates
export const storeNFTWithOptimistic = async (
  userId: string,
  nftData: {
    tokenId: string;
    contractAddress: string;
    metadata: any;
    imageUrl: string;
    name: string;
    description?: string;
  }
) => {
  // Update local cache immediately
  const cachedWallet = JSON.parse(localStorage.getItem(`wallet_${userId}`) || '{}');
  const optimisticNFT = {
    ...nftData,
    created_at: new Date().toISOString()
  };
  
  const updatedWallet = {
    ...cachedWallet,
    nfts: [...(cachedWallet.nfts || []), optimisticNFT]
  };
  
  localStorage.setItem(`wallet_${userId}`, JSON.stringify(updatedWallet));

  try {
    const result = await withRetry(() => storeNFT(userId, nftData));
    return result;
  } catch (error) {
    // Revert optimistic update on error
    localStorage.setItem(`wallet_${userId}`, JSON.stringify(cachedWallet));
    throw error;
  }
};

// NFT subscription for real-time updates
export const subscribeToNFTs = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel('nft_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'nfts',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

// Enhanced profile management
export const updateProfileWithUsername = async (
  userId: string,
  updates: {
    username: string;
    displayName: string;
    socialLinks?: Record<string, string>;
  }
) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      username: updates.username,
      display_name: updates.displayName,
      custom_domain: `${updates.username.toLowerCase()}.dormlit`,
      social_links: updates.socialLinks || {}
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getProfileByUsername = async (username: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (error) throw error;
  return data;
};

export const getProfileByCustomDomain = async (domain: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('custom_domain', domain)
    .single();

  if (error) throw error;
  return data;
};

export const updateSocialLinks = async (
  userId: string,
  socialLinks: Record<string, string>
) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ social_links: socialLinks })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Enhanced room management for creator spaces
export const createCreatorRoom = async (
  userId: string,
  roomData: {
    name: string;
    description: string;
    type: 'neighborhood' | 'park' | 'club' | 'home';
    layout_data: any;
    access_level: 'public' | 'private' | 'friends';
    thumbnail_url?: string;
  }
) => {
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      user_id: userId,
      name: roomData.name,
      description: roomData.description,
      type: roomData.type,
      layout_data: roomData.layout_data,
      access_level: roomData.access_level,
      thumbnail_url: roomData.thumbnail_url
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateRoomLayout = async (
  roomId: string,
  layoutData: any,
  thumbnailUrl?: string
) => {
  const { data, error } = await supabase
    .from('rooms')
    .update({
      layout_data: layoutData,
      thumbnail_url: thumbnailUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', roomId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getCreatorRooms = async (userId: string) => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

// Enhanced room management
export const createRoomFromTemplate = async (
  userId: string,
  templateId: string,
  customizations?: {
    name?: string;
    description?: string;
    theme?: string;
    tags?: string[];
    custom_css?: string;
    custom_js?: string;
  }
) => {
  // Get template
  const { data: template, error: templateError } = await supabase
    .from('room_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (templateError) throw templateError;

  // Create room from template
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      user_id: userId,
      name: customizations?.name || template.name,
      description: customizations?.description || template.description,
      type: template.type,
      layout_data: template.layout_data,
      access_level: 'public',
      theme: customizations?.theme,
      tags: customizations?.tags || template.tags,
      is_template: false,
      custom_css: customizations?.custom_css,
      custom_js: customizations?.custom_js
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const rateRoom = async (
  userId: string,
  roomId: string,
  rating: number,
  comment?: string
) => {
  const { data, error } = await supabase
    .from('room_ratings')
    .upsert({
      room_id: roomId,
      user_id: userId,
      rating,
      comment
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const trackRoomVisit = async (
  userId: string,
  roomId: string,
  duration?: number
) => {
  const { data, error } = await supabase
    .from('room_visits')
    .insert({
      room_id: roomId,
      user_id: userId,
      duration
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getRoomTemplates = async (
  type?: RoomType,
  category?: string,
  tags?: string[]
) => {
  let query = supabase
    .from('room_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }
  if (category) {
    query = query.eq('category', category);
  }
  if (tags && tags.length > 0) {
    query = query.contains('tags', tags);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getFeaturedRooms = async () => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('is_featured', true)
    .order('featured_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getPopularRooms = async (limit = 10) => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('visit_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const getTopRatedRooms = async (limit = 10) => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const searchRooms = async (
  query: string,
  filters?: {
    type?: RoomType;
    tags?: string[];
    minRating?: number;
    minVisits?: number;
  }
) => {
  let searchQuery = supabase
    .from('rooms')
    .select('*')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

  if (filters?.type) {
    searchQuery = searchQuery.eq('type', filters.type);
  }
  if (filters?.tags && filters.tags.length > 0) {
    searchQuery = searchQuery.contains('tags', filters.tags);
  }
  if (filters?.minRating) {
    searchQuery = searchQuery.gte('rating', filters.minRating);
  }
  if (filters?.minVisits) {
    searchQuery = searchQuery.gte('visit_count', filters.minVisits);
  }

  const { data, error } = await searchQuery;
  if (error) throw error;
  return data;
};

// Room Collaboration Methods
export const addRoomCollaborator = async (roomId: string, userId: string, role: 'owner' | 'editor' | 'viewer', permissions: Record<string, boolean>) => {
  const { data, error } = await supabase
    .from('room_collaborators')
    .insert({ room_id: roomId, user_id: userId, role, permissions })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const removeRoomCollaborator = async (roomId: string, userId: string) => {
  const { error } = await supabase
    .from('room_collaborators')
    .delete()
    .match({ room_id: roomId, user_id: userId });
  if (error) throw error;
};

export const getRoomCollaborators = async (roomId: string) => {
  const { data, error } = await supabase
    .from('room_collaborators')
    .select('*, profiles(*)')
    .eq('room_id', roomId);
  if (error) throw error;
  return data;
};

// Room Comments Methods
export const addRoomComment = async (roomId: string, content: string, parentId?: string) => {
  const { data, error } = await supabase
    .from('room_comments')
    .insert({ room_id: roomId, content, parent_id: parentId })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getRoomComments = async (roomId: string) => {
  const { data, error } = await supabase
    .from('room_comments')
    .select('*, profiles(*)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

// Room Likes Methods
export const likeRoom = async (roomId: string) => {
  const { data, error } = await supabase
    .from('room_likes')
    .insert({ room_id: roomId })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const unlikeRoom = async (roomId: string) => {
  const { error } = await supabase
    .from('room_likes')
    .delete()
    .match({ room_id: roomId });
  if (error) throw error;
};

export const getRoomLikes = async (roomId: string) => {
  const { data, error } = await supabase
    .from('room_likes')
    .select('*, profiles(*)')
    .eq('room_id', roomId);
  if (error) throw error;
  return data;
};

// Room Bookmarks Methods
export const bookmarkRoom = async (roomId: string) => {
  const { data, error } = await supabase
    .from('room_bookmarks')
    .insert({ room_id: roomId })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const unbookmarkRoom = async (roomId: string) => {
  const { error } = await supabase
    .from('room_bookmarks')
    .delete()
    .match({ room_id: roomId });
  if (error) throw error;
};

export const getRoomBookmarks = async (userId: string) => {
  const { data, error } = await supabase
    .from('room_bookmarks')
    .select('*, rooms(*)')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
};

// Room Events Methods
export const logRoomEvent = async (roomId: string, eventType: string, eventData: Record<string, any>) => {
  const { data, error } = await supabase
    .from('room_events')
    .insert({ room_id: roomId, event_type: eventType, event_data: eventData })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getRoomEvents = async (roomId: string) => {
  const { data, error } = await supabase
    .from('room_events')
    .select('*, profiles(*)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

// Real-time Subscriptions
export const subscribeToRoomCollaborators = (roomId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`room_collaborators:${roomId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'room_collaborators', filter: `room_id=eq.${roomId}` }, callback)
    .subscribe();
};

export const subscribeToRoomComments = (roomId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`room_comments:${roomId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'room_comments', filter: `room_id=eq.${roomId}` }, callback)
    .subscribe();
};

export const subscribeToRoomLikes = (roomId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`room_likes:${roomId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'room_likes', filter: `room_id=eq.${roomId}` }, callback)
    .subscribe();
};

export const subscribeToRoomEvents = (roomId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`room_events:${roomId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'room_events', filter: `room_id=eq.${roomId}` }, callback)
    .subscribe();
};

// Amusement Park Methods
export const createAmusementParkAsset = async (roomId: string, asset: Omit<AmusementParkAsset, 'id' | 'room_id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('amusement_park_assets')
    .insert({ ...asset, room_id: roomId })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateAmusementParkAsset = async (assetId: string, updates: Partial<AmusementParkAsset>) => {
  const { data, error } = await supabase
    .from('amusement_park_assets')
    .update(updates)
    .eq('id', assetId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getAmusementParkAssets = async (roomId: string) => {
  const { data, error } = await supabase
    .from('amusement_park_assets')
    .select('*')
    .eq('room_id', roomId);
  if (error) throw error;
  return data;
};

export const createAmusementParkRide = async (roomId: string, ride: Omit<AmusementParkRide, 'id' | 'room_id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('amusement_park_rides')
    .insert({ ...ride, room_id: roomId })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateAmusementParkRide = async (rideId: string, updates: Partial<AmusementParkRide>) => {
  const { data, error } = await supabase
    .from('amusement_park_rides')
    .update(updates)
    .eq('id', rideId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getAmusementParkRides = async (roomId: string) => {
  const { data, error } = await supabase
    .from('amusement_park_rides')
    .select('*')
    .eq('room_id', roomId);
  if (error) throw error;
  return data;
};

export const createAmusementParkVisitor = async (roomId: string, userId: string) => {
  const { data, error } = await supabase
    .from('amusement_park_visitors')
    .insert({ room_id: roomId, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateAmusementParkVisitor = async (visitorId: string, updates: Partial<AmusementParkVisitor>) => {
  const { data, error } = await supabase
    .from('amusement_park_visitors')
    .update(updates)
    .eq('id', visitorId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Room Coin Methods
export const createRoomCoin = async (roomId: string, coin: Omit<RoomCoin, 'id' | 'room_id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('room_coins')
    .insert({ ...coin, room_id: roomId })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getRoomCoin = async (roomId: string) => {
  const { data, error } = await supabase
    .from('room_coins')
    .select('*')
    .eq('room_id', roomId)
    .single();
  if (error) throw error;
  return data;
};

export const getRoomCoinBalance = async (roomId: string, userId: string) => {
  const { data, error } = await supabase
    .from('room_coin_balances')
    .select('*')
    .eq('room_id', roomId)
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
};

export const transferRoomCoin = async (roomId: string, fromUserId: string, toUserId: string, amount: number) => {
  const { data, error } = await supabase.rpc('transfer_room_coin', {
    p_room_id: roomId,
    p_from_user_id: fromUserId,
    p_to_user_id: toUserId,
    p_amount: amount
  });
  if (error) throw error;
  return data;
};

// Onboarding Methods
export const getOnboardingSteps = async () => {
  const { data, error } = await supabase
    .from('onboarding_steps')
    .select('*')
    .order('order_index', { ascending: true });
  if (error) throw error;
  return data;
};

export const getUserOnboardingProgress = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_onboarding_progress')
    .select('*, onboarding_steps(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const completeOnboardingStep = async (userId: string, stepId: string) => {
  const { data, error } = await supabase
    .from('user_onboarding_progress')
    .upsert({
      user_id: userId,
      step_id: stepId,
      completed_at: new Date().toISOString()
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Real-time Subscriptions
export const subscribeToAmusementParkAssets = (roomId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`amusement_park_assets:${roomId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'amusement_park_assets', filter: `room_id=eq.${roomId}` }, callback)
    .subscribe();
};

export const subscribeToAmusementParkRides = (roomId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`amusement_park_rides:${roomId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'amusement_park_rides', filter: `room_id=eq.${roomId}` }, callback)
    .subscribe();
};

export const subscribeToRoomCoinTransactions = (roomId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`room_coin_transactions:${roomId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'room_coin_transactions', filter: `room_id=eq.${roomId}` }, callback)
    .subscribe();
}; 