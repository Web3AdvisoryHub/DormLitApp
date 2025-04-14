export const APP_CONFIG = {
  name: 'DormLit',
  version: '1.0.0',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:3000',
  defaultAvatar: '/avatars/default.png',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxBioLength: 500,
  maxUsernameLength: 30,
  minPasswordLength: 8,
  defaultPageSize: 20,
  maxUploadRetries: 3,
  notificationDuration: 5000, // 5 seconds
  callTimeout: 30000, // 30 seconds
  reconnectInterval: 5000, // 5 seconds
  maxMessageLength: 1000,
  maxCommentLength: 500,
  maxTitleLength: 100,
  maxDescriptionLength: 2000,
  maxTags: 10,
  maxTagLength: 20,
  maxLinks: 5,
  maxLinkLength: 100,
  maxCustomItems: 50,
  maxNFTs: 100,
  maxScenes: 10,
  maxSceneDuration: 300, // 5 minutes
  maxSceneSize: 50 * 1024 * 1024, // 50MB
  maxSceneAttachments: 5,
  maxSceneAttachmentSize: 10 * 1024 * 1024, // 10MB
  maxSceneAttachmentDuration: 60, // 1 minute
  maxSceneAttachmentTypes: ['image', 'video', 'audio', 'text'],
  maxSceneAttachmentFormats: {
    image: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    video: ['mp4', 'webm', 'ogg'],
    audio: ['mp3', 'wav', 'ogg'],
    text: ['txt', 'md', 'json'],
  },
  maxSceneAttachmentDimensions: {
    image: {
      width: 1920,
      height: 1080,
    },
    video: {
      width: 1920,
      height: 1080,
    },
  },
  maxSceneAttachmentDuration: 60, // 1 minute
  maxSceneAttachmentSize: 10 * 1024 * 1024, // 10MB
  maxSceneAttachmentTypes: ['image', 'video', 'audio', 'text'],
  maxSceneAttachmentFormats: {
    image: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    video: ['mp4', 'webm', 'ogg'],
    audio: ['mp3', 'wav', 'ogg'],
    text: ['txt', 'md', 'json'],
  },
  maxSceneAttachmentDimensions: {
    image: {
      width: 1920,
      height: 1080,
    },
    video: {
      width: 1920,
      height: 1080,
    },
  },
} as const;

export const ROUTES = {
  HOME: '/',
  DISCOVER: '/discover',
  MANIFESTO: '/manifesto',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile/:userId',
  CREATE_PROFILE: '/create-profile',
  AVATAR_SELECTION: '/avatar-selection',
  CREATOR_ROOM: '/creator-room',
  DREAMSCAPE: '/dreamscape',
  ONBOARDING: '/onboarding',
  MOOD: '/mood',
  INVITE: '/invite',
  NOT_FOUND: '*',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  USER: {
    PROFILE: '/api/users/:userId',
    UPDATE: '/api/users/:userId',
    AVATAR: '/api/users/:userId/avatar',
    SETTINGS: '/api/users/:userId/settings',
  },
  CREATOR: {
    ROOM: '/api/creator/room',
    ITEMS: '/api/creator/items',
    NFTS: '/api/creator/nfts',
    SCENES: '/api/creator/scenes',
  },
  MARKETPLACE: {
    ITEMS: '/api/marketplace/items',
    NFTS: '/api/marketplace/nfts',
    PURCHASE: '/api/marketplace/purchase',
  },
  PHONE: {
    LINES: '/api/phone-lines',
    CALLS: '/api/phone-lines/calls',
    MESSAGES: '/api/phone-lines/messages',
    SETTINGS: '/api/phone-lines/settings',
  },
  SOCIAL: {
    FOLLOW: '/api/social/follow',
    UNFOLLOW: '/api/social/unfollow',
    FOLLOWERS: '/api/social/followers',
    FOLLOWING: '/api/social/following',
    POSTS: '/api/social/posts',
    COMMENTS: '/api/social/comments',
    LIKES: '/api/social/likes',
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_ID: 'user_id',
  USERNAME: 'username',
  AVATAR_URL: 'avatar_url',
  SETTINGS: 'settings',
  THEME: 'theme',
  LANGUAGE: 'language',
  SOUND_ENABLED: 'sound_enabled',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  LAST_VISITED: 'last_visited',
  CUSTOM_ITEMS: 'custom_items',
  NFTS: 'nfts',
  SCENES: 'scenes',
  CALL_HISTORY: 'call_history',
  MESSAGE_HISTORY: 'message_history',
  FOLLOWERS: 'followers',
  FOLLOWING: 'following',
  POSTS: 'posts',
  COMMENTS: 'comments',
  LIKES: 'likes',
} as const;

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const LANGUAGES = {
  EN: 'en',
  ES: 'es',
  FR: 'fr',
  DE: 'de',
  IT: 'it',
  PT: 'pt',
  RU: 'ru',
  ZH: 'zh',
  JA: 'ja',
  KO: 'ko',
} as const;

export const AVATAR = {
  DEFAULT: {
    SKIN_TONE: '#FFDBAC',
    HAIR_STYLE: 'short',
    HAIR_COLOR: '#000000',
    CLOTHING_STYLE: 'casual',
    CLOTHING_COLOR: '#FFFFFF',
  },
  CUSTOMIZATION: {
    SKIN_TONES: [
      '#FFDBAC',
      '#F5D5A0',
      '#E6C49A',
      '#D2B48C',
      '#C19A6B',
      '#8B4513',
      '#654321',
    ],
    HAIR_STYLES: [
      'short',
      'medium',
      'long',
      'curly',
      'wavy',
      'afro',
      'bun',
      'ponytail',
    ],
    HAIR_COLORS: [
      '#000000',
      '#2C222B',
      '#71635A',
      '#B7A69E',
      '#D6C4C2',
      '#F5E6E8',
      '#E6C49A',
      '#D2B48C',
      '#C19A6B',
      '#8B4513',
      '#654321',
    ],
    CLOTHING_STYLES: [
      'casual',
      'formal',
      'sporty',
      'punk',
      'gothic',
      'bohemian',
      'preppy',
      'street',
    ],
    CLOTHING_COLORS: [
      '#FFFFFF',
      '#000000',
      '#FF0000',
      '#00FF00',
      '#0000FF',
      '#FFFF00',
      '#FF00FF',
      '#00FFFF',
      '#FFA500',
      '#800080',
      '#008000',
      '#800000',
      '#000080',
      '#808080',
      '#C0C0C0',
    ],
  },
} as const;

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  CALL: 'call',
  MESSAGE: 'message',
  FOLLOW: 'follow',
  LIKE: 'like',
  COMMENT: 'comment',
  PURCHASE: 'purchase',
  CUSTOM: 'custom',
} as const;

export const SOUND_TYPES = {
  NOTIFICATION: 'notification',
  CALL: 'call',
  MESSAGE: 'message',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export const FILE_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  TEXT: 'text',
} as const;

export const FILE_FORMATS = {
  IMAGE: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  VIDEO: ['mp4', 'webm', 'ogg'],
  AUDIO: ['mp3', 'wav', 'ogg'],
  TEXT: ['txt', 'md', 'json'],
} as const;

export const FILE_DIMENSIONS = {
  IMAGE: {
    width: 1920,
    height: 1080,
  },
  VIDEO: {
    width: 1920,
    height: 1080,
  },
} as const;

export const FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  VIDEO: 50 * 1024 * 1024, // 50MB
  AUDIO: 10 * 1024 * 1024, // 10MB
  TEXT: 1 * 1024 * 1024, // 1MB
} as const;

export const FILE_DURATIONS = {
  VIDEO: 300, // 5 minutes
  AUDIO: 300, // 5 minutes
} as const; 