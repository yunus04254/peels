import React, { useState, useEffect } from 'react';
import { Pie, Line } from 'react-chartjs-2';
import '../styles/pages/Statistics.css';
import { Get } from "src/lib/api";
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const scrollToChart = (chartId) => {
  const chartElement = document.getElementById(chartId);
  if (chartElement) {
    chartElement.scrollIntoView({ behavior: 'smooth' });
  }
};

const numberToEmoji = {
  1: '😢',
  2: '😡',
  3: '😐',
  4: '🤔',
  5: '😯',
  6: '🙂',
  7: '😄'
};

const StatisticsPage = () => {
  const [stats, setStats] = useState({
    totalEntries: 'Loading...',
    totalJournals: 'Loading...',
    longestStreak: 'Loading...',
    moodData: { labels: [], datasets: [{ data: [] }] },
    entriesData: { labels: [], datasets: [{ data: [] }] },
    moodOverTimeData: { labels: [], datasets: [{ data: [] }] },
    wordsPerEntryData: { labels: [], datasets: [{ data: [] }] }})
  const [customRange, setCustomRange] = useState({startDate: '', endDate: ''});
  const [selectedRange, setSelectedRange] = useState('Last 7 Days');
  const { user } = useAuth();

  useEffect(() => {
    fetchStats();
    fetchGraphData('Last 7 Days');
  }, []);

  const fetchStats = async () => {
    const response = await Get('statistics', null, {user: user});
    if (response.ok) {
      const data = await response.json();
      setStats(prevStats => ({
        ...prevStats,
        totalEntries: data.totalEntries.toString(),
        totalJournals: data.totalJournals.toString(),
        longestStreak: data.longestStreak.toString(),
      }));
    } else {
      console.error("Error fetching statistics");
    }
  };

  const fetchGraphData = async (range, customDates = null) => {
    const queryParams = getDateRangeParams(range, customDates);

    let queryString = '';
    for (const [key, value] of Object.entries(queryParams)) {
        if (queryString !== '') {
            queryString += '&';
        }
        queryString += `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }

    const response = await Get(`statistics/graphs?${queryString}`, null, {user: user});
    if (response.ok) {
      const graphData = await response.json();
      setStats(prevStats => ({
        ...prevStats,
        moodData: graphData.moodData,
        entriesData: graphData.entriesData,
        moodOverTimeData: graphData.moodOverTimeData,
        wordsPerEntryData: graphData.wordsPerEntryData
      }));
    } else {
      console.error("Error fetching graph data");
    }
  };

  const getDateRangeParams = (range, customDates = null) => {
    let endDate = new Date();
    let startDate = new Date();
    if (range === 'Custom' && customDates) {
      startDate = new Date(customDates.startDate);
      endDate = new Date(customDates.endDate);
    } else {
    switch (range) {
      case 'Last 7 Days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'Last 30 Days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case 'Last 90 Days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case 'Last 1 Year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        return {};
    }}
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const handleCustomDateRangeChange = () => {
    if (customRange.startDate && customRange.endDate && customRange.endDate >= customRange.startDate) {
        fetchGraphData('Custom', customRange);
        setSelectedRange('Custom Range');
    }
};

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  const moodOverTimeChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        ticks: {
          callback: function(value, index, values) {
            return numberToEmoji[value];
          }
        }
      }
    }
  };

  const handleDateRangeChange = (range, customDates = null) => {
    fetchGraphData(range, customDates);
    setSelectedRange(range);
};;

  return (
    <div className="content">
      <div className="page-header" style = {{fontSize: '30px', fontWeight:'Bold'}}>
        <h1>Insights</h1>
      </div>
      <div className="statistics-layout">
        <div className="statistics-container">
          <div className="statistics-scrollable">
            <div className="quick-facts">
              <div className="quick-fact">
                <div className="quick-fact-number">{stats.totalEntries}</div>
                <div className="quick-fact-label">Total Entries</div>
              </div>
              <div className="quick-fact">
                <div className="quick-fact-number">{stats.totalJournals}</div>
                <div className="quick-fact-label">Total Journals</div>
              </div>
              <div className="quick-fact">
                <div className="quick-fact-number">{stats.longestStreak}</div>
                <div className="quick-fact-label">Longest Streak</div>
              </div>
            </div>
            <div className="chart-card" id="moodPieChart">
              <h2>Mood Pie Chart</h2>
              <div className="chart-wrapper">
                {stats.moodData.datasets[0].data.length > 0 ? (
                  <Pie data={stats.moodData} options={chartOptions} />
                ) : (
                  <div className="no-data-message">No data to display</div>
                )}
              </div>
            </div>
            <div className="chart-card" id="entriesOverTime">
              <h2>Entries Over Time</h2>
              <div className="chart-wrapper">
                {stats.entriesData.datasets[0].data.length > 0 ? (
                  <Line data={stats.entriesData} options={chartOptions} />
                ) : (
                  <div className="no-data-message">No data to display</div>
                )}
              </div>
            </div>
            <div className="chart-card" id="moodOverTimeChart">
              <h2>Mood Over Time</h2>
              <div className="chart-wrapper">
                {stats.moodOverTimeData.datasets[0].data.length > 0 ? (
                  <Line data={stats.moodOverTimeData} options={moodOverTimeChartOptions} />
                ) : (
                  <div className="no-data-message">No data to display</div>
                )}
              </div>
            </div>
            <div className="chart-card" id="wordsPerEntryChart">
              <h2>Words Per Entry</h2>
              <div className="chart-wrapper">
                {stats.wordsPerEntryData.datasets[0].data.length > 0 ? (
                  <Line data={stats.wordsPerEntryData} options={chartOptions} />
                ) : (
                  <div className="no-data-message">No data to display</div>
                )}
              </div>
            </div>
          </div>
          <div className="statistics-controls">
          <h2 className="controls-title">Filter & Navigate Data</h2>
          <div className="dropdown">
            <button className="control-btn dropbtn">Date Range</button>
            <div className="dropdown-content">
              <a href="#" className={selectedRange === 'Last 7 Days' ? 'selected-range' : ''} onClick={() => handleDateRangeChange('Last 7 Days')}>Last 7 Days</a>
              <a href="#" className={selectedRange === 'Last 30 Days' ? 'selected-range' : ''} onClick={() => handleDateRangeChange('Last 30 Days')}>Last 30 Days</a>
              <a href="#" className={selectedRange === 'Last 90 Days' ? 'selected-range' : ''} onClick={() => handleDateRangeChange('Last 90 Days')}>Last 90 Days</a>
              <a href="#" className={selectedRange === 'Last 1 Year' ? 'selected-range' : ''} onClick={() => handleDateRangeChange('Last 1 Year')}>Last 1 Year</a>
              <a href="#" className={selectedRange === 'All Time' ? 'selected-range' : ''} onClick={() => handleDateRangeChange('All Time')}>All Time</a>
              <div className={selectedRange === 'Custom Range' ? 'custom-range ' : 'custom-range'}>
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                type="date"
                value={customRange.startDate}
                onChange={e => {
                  setCustomRange({...customRange, startDate: e.target.value});
                  if (customRange.endDate && customRange.endDate < e.target.value) {
                    setCustomRange({...customRange, endDate: ''});
                  }
                }}
              />

              <label htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                type="date"
                value={customRange.endDate}
                onChange={e => setCustomRange({...customRange, endDate: e.target.value})}
                min={customRange.startDate}
              />

                <button onClick={() => handleCustomDateRangeChange()}>Apply Custom</button>
              </div>
            </div>
          </div>
          <button className="control-btn scroll-btn" onClick={() => scrollToChart('moodPieChart')}>Mood Pie Chart</button>
          <button className="control-btn scroll-btn" onClick={() => scrollToChart('entriesOverTime')}>Entries Over Time</button>
          <button className="control-btn scroll-btn" onClick={() => scrollToChart('moodOverTimeChart')}>Mood Over Time</button>
          <button className="control-btn scroll-btn" onClick={() => scrollToChart('wordsPerEntryChart')}>Words Per Entry</button>
        </div>
      </div>
    </div>
  </div>
);
}
export default StatisticsPage;