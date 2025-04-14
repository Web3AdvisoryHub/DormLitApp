import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { motion } from 'framer-motion';
import { FaPlus, FaTrash, FaEdit, FaSave, FaUndo } from 'react-icons/fa';
import { GameMode, RoomLayout } from '@/shared/database.types';

interface RoomLayoutProps {
  roomId: string;
}

export const RoomLayout = ({ roomId }: RoomLayoutProps) => {
  const { sendRoomInteraction } = useSocket(roomId);
  const [layouts, setLayouts] = useState<RoomLayout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<RoomLayout | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('default');

  useEffect(() => {
    // Load layouts from database
    const loadLayouts = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}/layouts`);
        const data = await response.json();
        setLayouts(data);
      } catch (error) {
        console.error('Failed to load layouts:', error);
      }
    };

    loadLayouts();
  }, [roomId]);

  const handleLayoutSelect = (layout: RoomLayout) => {
    setSelectedLayout(layout);
    setGameMode(layout.game_mode);
    setIsEditing(false);
  };

  const handleLayoutCreate = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/layouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Layout',
          game_mode: 'default',
          description: 'A new room layout',
        }),
      });

      const newLayout = await response.json();
      setLayouts([...layouts, newLayout]);
      setSelectedLayout(newLayout);
      setIsEditing(true);
    } catch (error) {
      console.error('Failed to create layout:', error);
    }
  };

  const handleLayoutUpdate = async (updates: Partial<RoomLayout>) => {
    if (!selectedLayout) return;

    try {
      const response = await fetch(`/api/rooms/${roomId}/layouts/${selectedLayout.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const updatedLayout = await response.json();
      setLayouts(layouts.map(l => l.id === updatedLayout.id ? updatedLayout : l));
      setSelectedLayout(updatedLayout);
      setIsEditing(false);

      // Record interaction
      sendRoomInteraction('layout_update', {
        layoutId: updatedLayout.id,
        updates,
      });
    } catch (error) {
      console.error('Failed to update layout:', error);
    }
  };

  const handleLayoutDelete = async (layoutId: string) => {
    try {
      await fetch(`/api/rooms/${roomId}/layouts/${layoutId}`, {
        method: 'DELETE',
      });

      setLayouts(layouts.filter(l => l.id !== layoutId));
      if (selectedLayout?.id === layoutId) {
        setSelectedLayout(null);
      }
    } catch (error) {
      console.error('Failed to delete layout:', error);
    }
  };

  return (
    <div className="room-layout">
      <div className="room-layout-header">
        <h2>Room Layout</h2>
        <button onClick={handleLayoutCreate} className="create-button">
          <FaPlus /> New Layout
        </button>
      </div>

      <div className="room-layout-content">
        <div className="layout-list">
          {layouts.map((layout) => (
            <motion.div
              key={layout.id}
              className={`layout-item ${selectedLayout?.id === layout.id ? 'selected' : ''}`}
              onClick={() => handleLayoutSelect(layout)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="layout-info">
                <h3>{layout.name}</h3>
                <p>{layout.description}</p>
                <span className="game-mode">{layout.game_mode}</span>
              </div>
              <div className="layout-actions">
                <button onClick={() => setIsEditing(true)}>
                  <FaEdit />
                </button>
                <button onClick={() => handleLayoutDelete(layout.id)}>
                  <FaTrash />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedLayout && (
          <div className="layout-editor">
            <div className="editor-header">
              <h3>Edit Layout</h3>
              <div className="editor-actions">
                {isEditing ? (
                  <>
                    <button onClick={() => handleLayoutUpdate(selectedLayout)}>
                      <FaSave /> Save
                    </button>
                    <button onClick={() => setIsEditing(false)}>
                      <FaUndo /> Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)}>
                    <FaEdit /> Edit
                  </button>
                )}
              </div>
            </div>

            <div className="editor-content">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={selectedLayout.name}
                  onChange={(e) => setSelectedLayout({ ...selectedLayout, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={selectedLayout.description}
                  onChange={(e) => setSelectedLayout({ ...selectedLayout, description: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>Game Mode</label>
                <select
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value as GameMode)}
                  disabled={!isEditing}
                >
                  <option value="default">Default</option>
                  <option value="fortnite">Fortnite</option>
                  <option value="racing">Racing</option>
                  <option value="platformer">Platformer</option>
                  <option value="amusement_park">Amusement Park</option>
                </select>
              </div>

              {/* Game mode specific settings */}
              {gameMode === 'fortnite' && (
                <div className="game-mode-settings">
                  <h4>Fortnite Settings</h4>
                  <div className="form-group">
                    <label>Map Name</label>
                    <input
                      type="text"
                      value={selectedLayout.fortnite?.map_name || ''}
                      onChange={(e) => setSelectedLayout({
                        ...selectedLayout,
                        fortnite: { ...selectedLayout.fortnite, map_name: e.target.value }
                      })}
                      disabled={!isEditing}
                    />
                  </div>
                  {/* Add more Fortnite-specific settings */}
                </div>
              )}

              {gameMode === 'racing' && (
                <div className="game-mode-settings">
                  <h4>Racing Settings</h4>
                  <div className="form-group">
                    <label>Track Name</label>
                    <input
                      type="text"
                      value={selectedLayout.racing?.track_name || ''}
                      onChange={(e) => setSelectedLayout({
                        ...selectedLayout,
                        racing: { ...selectedLayout.racing, track_name: e.target.value }
                      })}
                      disabled={!isEditing}
                    />
                  </div>
                  {/* Add more Racing-specific settings */}
                </div>
              )}

              {gameMode === 'platformer' && (
                <div className="game-mode-settings">
                  <h4>Platformer Settings</h4>
                  <div className="form-group">
                    <label>Level Name</label>
                    <input
                      type="text"
                      value={selectedLayout.platformer?.level_name || ''}
                      onChange={(e) => setSelectedLayout({
                        ...selectedLayout,
                        platformer: { ...selectedLayout.platformer, level_name: e.target.value }
                      })}
                      disabled={!isEditing}
                    />
                  </div>
                  {/* Add more Platformer-specific settings */}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .room-layout {
          padding: 1rem;
          background: var(--background-secondary);
          border-radius: 8px;
        }

        .room-layout-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .create-button {
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

        .layout-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .layout-item {
          padding: 1rem;
          background: var(--background-primary);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .layout-item.selected {
          border: 2px solid var(--primary);
        }

        .layout-info {
          margin-bottom: 0.5rem;
        }

        .game-mode {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background: var(--accent);
          color: white;
          border-radius: 4px;
          font-size: 0.8rem;
        }

        .layout-actions {
          display: flex;
          gap: 0.5rem;
        }

        .layout-actions button {
          padding: 0.25rem;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary);
        }

        .layout-editor {
          background: var(--background-primary);
          border-radius: 8px;
          padding: 1rem;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .editor-actions {
          display: flex;
          gap: 0.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--background-secondary);
          color: var(--text-primary);
        }

        .game-mode-settings {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
}; 