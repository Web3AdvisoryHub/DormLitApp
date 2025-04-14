import WebSocket from 'ws';
import { RoomMessage } from '@shared/schema';

interface ChatClient {
  ws: WebSocket;
  userId: number;
}

export class ChatService {
  private rooms: Map<string, Set<ChatClient>>;

  constructor() {
    this.rooms = new Map();
  }

  addClient(roomId: string, ws: WebSocket) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId)?.add({ ws, userId: 0 }); // User ID will be set after authentication
  }

  removeClient(roomId: string, ws: WebSocket) {
    const clients = this.rooms.get(roomId);
    if (clients) {
      for (const client of clients) {
        if (client.ws === ws) {
          clients.delete(client);
          break;
        }
      }
      if (clients.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  broadcastMessage(roomId: string, message: RoomMessage) {
    const clients = this.rooms.get(roomId);
    if (clients) {
      const messageJson = JSON.stringify(message);
      for (const client of clients) {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(messageJson);
        }
      }
    }
  }

  authenticateClient(roomId: string, ws: WebSocket, userId: number) {
    const clients = this.rooms.get(roomId);
    if (clients) {
      for (const client of clients) {
        if (client.ws === ws) {
          client.userId = userId;
          break;
        }
      }
    }
  }

  getRoomClients(roomId: string): ChatClient[] {
    const clients = this.rooms.get(roomId);
    return clients ? Array.from(clients) : [];
  }

  getClientRooms(userId: number): string[] {
    const userRooms: string[] = [];
    for (const [roomId, clients] of this.rooms.entries()) {
      for (const client of clients) {
        if (client.userId === userId) {
          userRooms.push(roomId);
          break;
        }
      }
    }
    return userRooms;
  }
} 