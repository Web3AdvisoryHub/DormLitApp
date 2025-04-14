import { v4 as uuidv4 } from 'uuid';

// Mock data types
interface Mood {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  prompts: string[];
}

interface Post {
  id: string;
  userId: string;
  moodId: string;
  content: string;
  createdAt: Date;
}

interface Reaction {
  id: string;
  postId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

interface Affiliate {
  id: string;
  userId: string;
  inviteLink: string;
  totalInvites: number;
  activeUsers: number;
}

// Mock data
const moods: Mood[] = [
  {
    id: uuidv4(),
    name: 'Clarity',
    description: 'Moments of clear vision and understanding',
    color: 'from-blue-400 to-cyan-300',
    icon: '✨',
    prompts: [
      'What insight came to you today?',
      'Describe a moment of sudden understanding',
      'What truth became clear to you?'
    ]
  },
  {
    id: uuidv4(),
    name: 'Euphoria',
    description: 'Pure joy and elevated energy',
    color: 'from-pink-400 to-purple-300',
    icon: '🌟',
    prompts: [
      'What made your heart sing today?',
      'Describe a moment of pure joy',
      'What lifted your spirits?'
    ]
  },
  {
    id: uuidv4(),
    name: 'Longing',
    description: 'Deep desire and wistful reflection',
    color: 'from-indigo-400 to-violet-300',
    icon: '🌙',
    prompts: [
      'What do you yearn for?',
      'Describe a moment of deep desire',
      'What calls to your heart?'
    ]
  }
];

const posts: Post[] = [];
const reactions: Reaction[] = [];
const comments: Comment[] = [];
const affiliates: Affiliate[] = [];

// Mock API functions
export const mockApi = {
  moods: {
    getAll: async (): Promise<Mood[]> => moods,
    getById: async (id: string): Promise<Mood | undefined> => 
      moods.find(mood => mood.id === id),
  },
  posts: {
    create: async (post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> => {
      const newPost = {
        ...post,
        id: uuidv4(),
        createdAt: new Date(),
      };
      posts.push(newPost);
      return newPost;
    },
    getByUserId: async (userId: string): Promise<Post[]> =>
      posts.filter(post => post.userId === userId),
  },
  reactions: {
    toggle: async (postId: string, userId: string, emoji: string): Promise<{ action: 'added' | 'removed' }> => {
      const existingIndex = reactions.findIndex(
        r => r.postId === postId && r.userId === userId && r.emoji === emoji
      );
      
      if (existingIndex >= 0) {
        reactions.splice(existingIndex, 1);
        return { action: 'removed' };
      } else {
        reactions.push({
          id: uuidv4(),
          postId,
          userId,
          emoji,
          createdAt: new Date(),
        });
        return { action: 'added' };
      }
    },
  },
  comments: {
    create: async (comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
      const newComment = {
        ...comment,
        id: uuidv4(),
        createdAt: new Date(),
      };
      comments.push(newComment);
      return newComment;
    },
    getByPostId: async (postId: string): Promise<Comment[]> =>
      comments.filter(comment => comment.postId === postId),
  },
  affiliates: {
    getByUserId: async (userId: string): Promise<Affiliate | null> =>
      affiliates.find(affiliate => affiliate.userId === userId) || null,
    create: async (userId: string): Promise<Affiliate> => {
      const newAffiliate = {
        id: uuidv4(),
        userId,
        inviteLink: `dormlit.com/invite/${uuidv4()}`,
        totalInvites: 0,
        activeUsers: 0,
      };
      affiliates.push(newAffiliate);
      return newAffiliate;
    },
  },
}; 