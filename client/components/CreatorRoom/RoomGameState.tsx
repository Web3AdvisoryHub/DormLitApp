import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaStop, FaUndo, FaSave } from 'react-icons/fa';
import { RoomGameState, RoomGameEvent } from '@/shared/database.types';

interface RoomGameStateProps {
  roomId: string;
}

export const RoomGameState = ({ roomId }: RoomGameStateProps) => {
  const { sendRoomInteraction } = useSocket(roomId);
  const [gameState, setGameState] = useState<RoomGameState | null>(null);
  const [gameEvents, setGameEvents] = useState<RoomGameEvent[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load game state from database
    const loadGameState = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}/game-state`);
        const data = await response.json();
        setGameState(data);
      } catch (error) {
        console.error('Failed to load game state:', error);
      }
    };

    loadGameState();
  }, [roomId]);

  useEffect(() => {
    // Load game events from database
    const loadGameEvents = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}/game-events`);
        const data = await response.json();
        setGameEvents(data);
      } catch (error) {
        console.error('Failed to load game events:', error);
      }
    };

    loadGameEvents();
  }, [roomId]);

  const handleStartGame = async () => {
    if (!gameState) return;

    try {
      const response = await fetch(`/api/rooms/${roomId}/game-state`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'playing',
          start_time: new Date(),
        }),
      });

      const updatedState = await response.json();
      setGameState(updatedState);
      setIsPlaying(true);

      // Start timer
      const newTimer = setInterval(() => {
        setGameTime((prev) => prev + 1);
      }, 1000);
      setTimer(newTimer);

      // Record event
      sendRoomInteraction('game_start', {
        gameState: updatedState,
      });
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const handlePauseGame = async () => {
    if (!gameState) return;

    try {
      const response = await fetch(`/api/rooms/${roomId}/game-state`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'paused',
          pause_time: new Date(),
        }),
      });

      const updatedState = await response.json();
      setGameState(updatedState);
      setIsPlaying(false);

      // Pause timer
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }

      // Record event
      sendRoomInteraction('game_pause', {
        gameState: updatedState,
      });
    } catch (error) {
      console.error('Failed to pause game:', error);
    }
  };

  const handleStopGame = async () => {
    if (!gameState) return;

    try {
      const response = await fetch(`/api/rooms/${roomId}/game-state`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ended',
          end_time: new Date(),
        }),
      });

      const updatedState = await response.json();
      setGameState(updatedState);
      setIsPlaying(false);

      // Stop timer
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
      setGameTime(0);

      // Record event
      sendRoomInteraction('game_end', {
        gameState: updatedState,
      });
    } catch (error) {
      console.error('Failed to stop game:', error);
    }
  };

  const handleResetGame = async () => {
    if (!gameState) return;

    try {
      const response = await fetch(`/api/rooms/${roomId}/game-state`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ready',
          start_time: null,
          end_time: null,
          pause_time: null,
          winner: null,
        }),
      });

      const updatedState = await response.json();
      setGameState(updatedState);
      setIsPlaying(false);

      // Reset timer
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
      setGameTime(0);

      // Record event
      sendRoomInteraction('game_reset', {
        gameState: updatedState,
      });
    } catch (error) {
      console.error('Failed to reset game:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="room-game-state">
      <div className="game-state-header">
        <h2>Game State</h2>
        <div className="game-controls">
          {!isPlaying ? (
            <button onClick={handleStartGame} className="control-button">
              <FaPlay /> Start
            </button>
          ) : (
            <button onClick={handlePauseGame} className="control-button">
              <FaPause /> Pause
            </button>
          )}
          <button onClick={handleStopGame} className="control-button">
            <FaStop /> Stop
          </button>
          <button onClick={handleResetGame} className="control-button">
            <FaUndo /> Reset
          </button>
        </div>
      </div>

      <div className="game-state-content">
        <div className="game-info">
          <div className="info-item">
            <span className="label">Status:</span>
            <span className="value">{gameState?.status || 'Not Started'}</span>
          </div>
          <div className="info-item">
            <span className="label">Time:</span>
            <span className="value">{formatTime(gameTime)}</span>
          </div>
          <div className="info-item">
            <span className="label">Players:</span>
            <span className="value">{gameState?.players.length || 0}</span>
          </div>
          {gameState?.winner && (
            <div className="info-item">
              <span className="label">Winner:</span>
              <span className="value">{gameState.winner}</span>
            </div>
          )}
        </div>

        <div className="game-events">
          <h3>Recent Events</h3>
          <div className="events-list">
            {gameEvents.map((event) => (
              <motion.div
                key={event.id}
                className="event-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className="event-time">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
                <span className="event-type">{event.type}</span>
                <span className="event-details">{event.details}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .room-game-state {
          padding: 1rem;
          background: var(--background-secondary);
          border-radius: 8px;
        }

        .game-state-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .game-controls {
          display: flex;
          gap: 0.5rem;
        }

        .control-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .game-state-content {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1rem;
        }

        .game-info {
          background: var(--background-primary);
          border-radius: 8px;
          padding: 1rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }

        .label {
          color: var(--text-secondary);
        }

        .value {
          font-weight: bold;
        }

        .game-events {
          background: var(--background-primary);
          border-radius: 8px;
          padding: 1rem;
        }

        .events-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .event-item {
          display: flex;
          gap: 1rem;
          padding: 0.5rem;
          border-bottom: 1px solid var(--border);
        }

        .event-time {
          color: var(--text-secondary);
          font-size: 0.8rem;
        }

        .event-type {
          font-weight: bold;
        }

        .event-details {
          flex: 1;
        }
      `}</style>
    </div>
  );
}; 