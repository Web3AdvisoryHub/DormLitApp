import { io, Socket } from 'socket.io-client';
import { create } from 'zustand';
import { CoinTransaction, MoodUpdate, RoomInteraction, UserPresence } from '@/shared/database.types';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  currentRoom: string | null;
  roomUsers: string[];
  roomInteractions: RoomInteraction[];
  coinTransactions: CoinTransaction[];
  moodUpdates: MoodUpdate[];
  connect: () => void;
  disconnect: () => void;
  joinRoom: (roomId: string, userId: string) => void;
  leaveRoom: (roomId: string, userId: string) => void;
  sendRoomInteraction: (data: Omit<RoomInteraction, 'id' | 'timestamp'>) => void;
  sendCoinTransaction: (data: Omit<CoinTransaction, 'id' | 'timestamp'>) => void;
  sendMoodUpdate: (data: Omit<MoodUpdate, 'id' | 'timestamp'>) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  currentRoom: null,
  roomUsers: [],
  roomInteractions: [],
  coinTransactions: [],
  moodUpdates: [],

  connect: () => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      set({ socket, isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('user_joined', (data: UserPresence) => {
      set((state) => ({
        roomUsers: [...state.roomUsers, data.userId],
      }));
    });

    socket.on('user_left', (data: UserPresence) => {
      set((state) => ({
        roomUsers: state.roomUsers.filter((id) => id !== data.userId),
      }));
    });

    socket.on('room_interaction', (data: RoomInteraction) => {
      set((state) => ({
        roomInteractions: [...state.roomInteractions, data],
      }));
    });

    socket.on('coin_transaction', (data: CoinTransaction) => {
      set((state) => ({
        coinTransactions: [...state.coinTransactions, data],
      }));
    });

    socket.on('mood_update', (data: MoodUpdate) => {
      set((state) => ({
        moodUpdates: [...state.moodUpdates, data],
      }));
    });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, currentRoom: null });
    }
  },

  joinRoom: (roomId: string, userId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('join_room', { roomId, userId });
      set({ currentRoom: roomId });
    }
  },

  leaveRoom: (roomId: string, userId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('leave_room', { roomId, userId });
      set({ currentRoom: null, roomUsers: [], roomInteractions: [], coinTransactions: [], moodUpdates: [] });
    }
  },

  sendRoomInteraction: (data) => {
    const { socket, currentRoom } = get();
    if (socket && currentRoom) {
      socket.emit('room_interaction', { ...data, roomId: currentRoom });
    }
  },

  sendCoinTransaction: (data) => {
    const { socket, currentRoom } = get();
    if (socket && currentRoom) {
      socket.emit('coin_transaction', { ...data, roomId: currentRoom });
    }
  },

  sendMoodUpdate: (data) => {
    const { socket, currentRoom } = get();
    if (socket && currentRoom) {
      socket.emit('mood_update', { ...data, roomId: currentRoom });
    }
  },
})); 