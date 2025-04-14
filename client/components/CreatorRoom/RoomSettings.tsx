import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { motion } from 'framer-motion';
import { FaSave, FaCog, FaLock, FaUnlock, FaUsers, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { RoomSettings as RoomSettingsType } from '@/shared/database.types';

interface RoomSettingsProps {
  roomId: string;
  onClose?: () => void;
}

export const RoomSettings = ({ roomId, onClose }: RoomSettingsProps) => {
  const { sendRoomInteraction } = useSocket(roomId);
  const [settings, setSettings] = useState<RoomSettingsType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    // Load settings from database
    const loadSettings = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}/settings`);
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, [roomId]);

  const handleSettingsUpdate = async (updates: Partial<RoomSettingsType>) => {
    if (!settings) return;

    try {
      const response = await fetch(`/api/rooms/${roomId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
      setIsEditing(false);

      // Record interaction
      sendRoomInteraction('settings_update', {
        settings: updatedSettings,
      });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  return (
    <motion.div
      className="room-settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="settings-header">
        <h2>Room Settings</h2>
        <div className="settings-actions">
          {isEditing ? (
            <>
              <button
                onClick={() => handleSettingsUpdate(settings)}
                className="save-button"
              >
                <FaSave /> Save
              </button>
              <button onClick={() => setIsEditing(false)} className="cancel-button">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="edit-button">
              Edit
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="close-button">
              Close
            </button>
          )}
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-tabs">
          <button
            className={`tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            <FaCog /> General
          </button>
          <button
            className={`tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <FaLock /> Privacy
          </button>
          <button
            className={`tab ${activeTab === 'access' ? 'active' : ''}`}
            onClick={() => setActiveTab('access')}
          >
            <FaUsers /> Access
          </button>
          <button
            className={`tab ${activeTab === 'sound' ? 'active' : ''}`}
            onClick={() => setActiveTab('sound')}
          >
            <FaVolumeUp /> Sound
          </button>
        </div>

        <div className="settings-panel">
          {activeTab === 'general' && (
            <div className="general-settings">
              <div className="form-group">
                <label>Room Name</label>
                <input
                  type="text"
                  value={settings?.name || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, name: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={settings?.description || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, description: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>Theme</label>
                <select
                  value={settings?.theme || 'default'}
                  onChange={(e) =>
                    setSettings({ ...settings, theme: e.target.value })
                  }
                  disabled={!isEditing}
                >
                  <option value="default">Default</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="privacy-settings">
              <div className="form-group">
                <label>Room Visibility</label>
                <select
                  value={settings?.visibility || 'public'}
                  onChange={(e) =>
                    setSettings({ ...settings, visibility: e.target.value })
                  }
                  disabled={!isEditing}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                </select>
              </div>

              <div className="form-group">
                <label>Allow Guest Access</label>
                <input
                  type="checkbox"
                  checked={settings?.allow_guests || false}
                  onChange={(e) =>
                    setSettings({ ...settings, allow_guests: e.target.checked })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>Require Password</label>
                <input
                  type="checkbox"
                  checked={settings?.require_password || false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      require_password: e.target.checked,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>

              {settings?.require_password && (
                <div className="form-group">
                  <label>Room Password</label>
                  <input
                    type="password"
                    value={settings?.password || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, password: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'access' && (
            <div className="access-settings">
              <div className="form-group">
                <label>Maximum Players</label>
                <input
                  type="number"
                  value={settings?.max_players || 10}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      max_players: parseInt(e.target.value),
                    })
                  }
                  disabled={!isEditing}
                  min={1}
                  max={100}
                />
              </div>

              <div className="form-group">
                <label>Allow Voice Chat</label>
                <input
                  type="checkbox"
                  checked={settings?.allow_voice_chat || false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      allow_voice_chat: e.target.checked,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label>Allow Text Chat</label>
                <input
                  type="checkbox"
                  checked={settings?.allow_text_chat || false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      allow_text_chat: e.target.checked,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          )}

          {activeTab === 'sound' && (
            <div className="sound-settings">
              <div className="form-group">
                <label>Master Volume</label>
                <input
                  type="range"
                  value={settings?.master_volume || 100}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      master_volume: parseInt(e.target.value),
                    })
                  }
                  disabled={!isEditing}
                  min={0}
                  max={100}
                />
              </div>

              <div className="form-group">
                <label>Music Volume</label>
                <input
                  type="range"
                  value={settings?.music_volume || 80}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      music_volume: parseInt(e.target.value),
                    })
                  }
                  disabled={!isEditing}
                  min={0}
                  max={100}
                />
              </div>

              <div className="form-group">
                <label>Sound Effects Volume</label>
                <input
                  type="range"
                  value={settings?.sfx_volume || 100}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      sfx_volume: parseInt(e.target.value),
                    })
                  }
                  disabled={!isEditing}
                  min={0}
                  max={100}
                />
              </div>

              <div className="form-group">
                <label>Voice Chat Volume</label>
                <input
                  type="range"
                  value={settings?.voice_volume || 100}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      voice_volume: parseInt(e.target.value),
                    })
                  }
                  disabled={!isEditing}
                  min={0}
                  max={100}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .room-settings {
          padding: 1rem;
          background: var(--background-secondary);
          border-radius: 8px;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .settings-actions {
          display: flex;
          gap: 0.5rem;
        }

        .settings-actions button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .save-button {
          background: var(--primary);
          color: white;
        }

        .cancel-button {
          background: var(--danger);
          color: white;
        }

        .edit-button {
          background: var(--accent);
          color: white;
        }

        .close-button {
          background: var(--text-secondary);
          color: white;
        }

        .settings-content {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 1rem;
        }

        .settings-tabs {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: var(--background-primary);
          border: none;
          border-radius: 4px;
          cursor: pointer;
          color: var(--text-secondary);
        }

        .tab.active {
          background: var(--primary);
          color: white;
        }

        .settings-panel {
          background: var(--background-primary);
          border-radius: 8px;
          padding: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-secondary);
        }

        .form-group input[type='text'],
        .form-group input[type='password'],
        .form-group input[type='number'],
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--background-secondary);
          color: var(--text-primary);
        }

        .form-group input[type='range'] {
          width: 100%;
        }

        .form-group input[type='checkbox'] {
          margin-right: 0.5rem;
        }
      `}</style>
    </motion.div>
  );
}; 