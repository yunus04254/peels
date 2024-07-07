import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import '../../styles/components/StatisticsSection.css';
import { Link } from 'react-router-dom';
import { FaFire, FaRocket } from 'react-icons/fa';
import LoginBonus from './LoginBonus';
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useAuth } from 'src/context/AuthContext';

ChartJS.register(
  Tooltip,
  Legend,
  ArcElement
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      align: 'start',
      labels: {
        boxWidth: 10,
        padding: 20,
      }
    }
  },
};

const calculateXpProgress = (xp) => {
  let level = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 20;

  while (xp >= xpForNextLevel) {
    xp -= xpForNextLevel;
    level++;
    xpForCurrentLevel = xpForNextLevel;
    xpForNextLevel += 5;
  }

  return {
    currentLevelXp: xp,
    xpNeededForNextLevel: xpForNextLevel,
    percentage: (xp / xpForNextLevel) * 100,
  };
};

const StatisticsSection = ({ moodData }) => {
  const { user } = useAuth();

  const [userStats, setUserStats] = useState({
    currentStreak: 0,
    xp: 0,
    // Add other stats you need
  });

  useEffect(() => {
    setUserStats({
      currentStreak: user.daysInARow,
      xp: user.xp,
    });
  }, [user]);

  const displayedMoodData = moodData || {
    labels: [],
    datasets: [{ data: [] }],
  };

  const xpProgress = calculateXpProgress(userStats.xp);

  return (
    <aside className="statistics-section">
      <div className="statistics-bubble">
        <div className="chart-header">
          <h2 className="chart-title">Profile</h2>
          <Link to="/profile" className="see-all-btn">See All</Link>
        </div>
        <ul className="statistics-list">
          <li className="stat-item">
            <span className="current-streak-info">
              <FaFire className="flame-icon" /><span className="stat-value">{userStats.currentStreak}</span>
            </span>
          </li>
          <li className="stat-item level-item level-flex-container">
            <FaRocket className="level-icon" />
            <div className="xp-bar">
              <div className="xp-bar-filled" style={{ width: '${xpProgress.percentage}%' }}>{xpProgress.currentLevelXp} / {xpProgress.xpNeededForNextLevel} XP</div>
            </div>
          </li>
        </ul>
      </div>
      {/* Mood chart */}
      <div className="statistics-chart">
        <div className="chart-header">
          <h2 className="chart-title">Mood</h2>
          <Link to="/statistics" className="see-all-btn">See All</Link>
        </div>
        <div className="chart-container">
          {displayedMoodData && displayedMoodData.datasets[0].data.length > 0 ? (
            <Pie data={displayedMoodData} options={chartOptions} />
          ) : (
            <div className="no-stats-text">Create an entry first!</div>
          )}
        </div>
      </div>
      <LoginBonus />
    </aside>
  );
};

export default StatisticsSection;