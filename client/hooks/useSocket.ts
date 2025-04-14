import { useEffect } from 'react';
import { useSocketStore } from '@/services/socket';
import { useAuth } from './useAuth';

export const useSocket = (roomId?: string) => {
  const { user } = useAuth();
  const {
    socket,
    isConnected,
    currentRoom,
    roomUsers,
    roomInteractions,
    coinTransactions,
    moodUpdates,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendRoomInteraction,
    sendCoinTransaction,
    sendMoodUpdate,
  } = useSocketStore();

  useEffect(() => {
    if (!isConnected) {
      connect();
    }

    return () => {
      if (isConnected) {
        disconnect();
      }
    };
  }, [isConnected, connect, disconnect]);

  useEffect(() => {
    if (isConnected && roomId && user?.id && currentRoom !== roomId) {
      joinRoom(roomId, user.id);
    }

    return () => {
      if (isConnected && roomId && user?.id) {
        leaveRoom(roomId, user.id);
      }
    };
  }, [isConnected, roomId, user?.id, currentRoom, joinRoom, leaveRoom]);

  return {
    isConnected,
    currentRoom,
    roomUsers,
    roomInteractions,
    coinTransactions,
    moodUpdates,
    sendRoomInteraction,
    sendCoinTransaction,
    sendMoodUpdate,
  };
}; 