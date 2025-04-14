import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { motion } from 'framer-motion';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  FaUsers,
  FaChartLine,
  FaClock,
  FaMapMarkedAlt,
  FaDownload,
  FaFilter,
  FaCalendarAlt,
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface RoomAnalyticsProps {
  roomId: string;
  onClose?: () => void;
}

interface AnalyticsData {
  playerStats: {
    totalPlayers: number;
    activePlayers: number;
    averageSessionDuration: number;
    peakConcurrent: number;
  };
  engagement: {
    dailyActiveUsers: number[];
    averageTimeSpent: number;
    interactionRate: number;
    retentionRate: number;
  };
  performance: {
    loadTime: number;
    fps: number;
    memoryUsage: number;
    errorRate: number;
  };
  interactions: {
    type: string;
    count: number;
  }[];
  heatmap: {
    x: number;
    y: number;
    intensity: number;
  }[];
}

export const RoomAnalytics = ({ roomId, onClose }: RoomAnalyticsProps) => {
  const { sendRoomInteraction } = useSocket(roomId);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Load analytics data
    const loadAnalytics = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}/analytics?range=${timeRange}`);
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      }
    };

    loadAnalytics();
  }, [roomId, timeRange]);

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/analytics/export?range=${timeRange}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `room-analytics-${roomId}-${timeRange}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  return (
    <motion.div
      className="room-analytics"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="analytics-header">
        <h2>Room Analytics</h2>
        <div className="analytics-actions">
          <div className="time-range">
            <FaCalendarAlt />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          <button onClick={handleExport} className="export-button">
            <FaDownload /> Export
          </button>
          {onClose && (
            <button onClick={onClose} className="close-button">
              Close
            </button>
          )}
        </div>
      </div>

      <div className="analytics-content">
        <div className="analytics-tabs">
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine /> Overview
          </button>
          <button
            className={`tab ${activeTab === 'players' ? 'active' : ''}`}
            onClick={() => setActiveTab('players')}
          >
            <FaUsers /> Players
          </button>
          <button
            className={`tab ${activeTab === 'engagement' ? 'active' : ''}`}
            onClick={() => setActiveTab('engagement')}
          >
            <FaClock /> Engagement
          </button>
          <button
            className={`tab ${activeTab === 'heatmap' ? 'active' : ''}`}
            onClick={() => setActiveTab('heatmap')}
          >
            <FaMapMarkedAlt /> Heatmap
          </button>
        </div>

        <div className="analytics-panel">
          {activeTab === 'overview' && (
            <div className="overview-stats">
              <div className="stat-card">
                <h3>Total Players</h3>
                <p>{analytics?.playerStats.totalPlayers || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Active Players</h3>
                <p>{analytics?.playerStats.activePlayers || 0}</p>
              </div>
              <div className="stat-card">
                <h3>Average Session</h3>
                <p>{Math.round(analytics?.playerStats.averageSessionDuration || 0)}m</p>
              </div>
              <div className="stat-card">
                <h3>Peak Concurrent</h3>
                <p>{analytics?.playerStats.peakConcurrent || 0}</p>
              </div>
            </div>
          )}

          {activeTab === 'players' && (
            <div className="player-stats">
              <div className="chart-container">
                <Line
                  data={{
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [
                      {
                        label: 'Active Players',
                        data: analytics?.engagement.dailyActiveUsers || [],
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Daily Active Players',
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'engagement' && (
            <div className="engagement-stats">
              <div className="chart-container">
                <Bar
                  data={{
                    labels: analytics?.interactions.map((i) => i.type) || [],
                    datasets: [
                      {
                        label: 'Interactions',
                        data: analytics?.interactions.map((i) => i.count) || [],
                        backgroundColor: 'rgba(75, 192, 192, 0.5)',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Interaction Types',
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'heatmap' && (
            <div className="heatmap-container">
              <div className="heatmap">
                {analytics?.heatmap.map((point, index) => (
                  <div
                    key={index}
                    className="heatmap-point"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      opacity: point.intensity,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .room-analytics {
          padding: 1rem;
          background: var(--background-secondary);
          border-radius: 8px;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .analytics-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .time-range {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .time-range select {
          padding: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 4px;
          background: var(--background-primary);
          color: var(--text-primary);
        }

        .export-button,
        .close-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .export-button {
          background: var(--primary);
          color: white;
        }

        .close-button {
          background: var(--text-secondary);
          color: white;
        }

        .analytics-content {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 1rem;
        }

        .analytics-tabs {
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

        .analytics-panel {
          background: var(--background-primary);
          border-radius: 8px;
          padding: 1rem;
        }

        .overview-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          background: var(--background-secondary);
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
        }

        .stat-card h3 {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .stat-card p {
          margin: 0.5rem 0 0;
          font-size: 1.5rem;
          font-weight: bold;
        }

        .chart-container {
          height: 400px;
          margin: 1rem 0;
        }

        .heatmap-container {
          position: relative;
          width: 100%;
          height: 400px;
          background: var(--background-secondary);
          border-radius: 8px;
          overflow: hidden;
        }

        .heatmap {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .heatmap-point {
          position: absolute;
          width: 20px;
          height: 20px;
          background: var(--primary);
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
      `}</style>
    </motion.div>
  );
}; 