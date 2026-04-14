// components/Dashboard.js
import React from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import './Dashboard.css';

const Dashboard = ({ historicalData }) => {
  // Process data for charts
  const processChartData = () => {
    if (!historicalData) return [];
    const flatData = Object.entries(historicalData).flatMap(([date, day]) =>
      Object.entries(day).map(([timestamp, value]) => ({
        date,
        timestamp,
        ...value
      }))
    );
    const last24Hours = flatData.slice(-24);
    return last24Hours.map((data, index) => ({
      time: `${index}:00`,
      oxygen: parseFloat(data.oxygen) || 0,
      ph: parseFloat(data.ph) || 0,
      temperature: parseFloat(data.temperature) || 0,
      turbidity: data.turbidity || 0,
      ammonia: parseFloat(data.ammonia) || 0
    }));
  };

  const chartData = processChartData();

  // Calculate statistics
  const calculateStats = () => {
    if (!historicalData) {
      return {
        oxygen: { avg: '-', min: '-', max: '-' },
        ph: { avg: '-', min: '-', max: '-' },
        temperature: { avg: '-', min: '-', max: '-' }
      };
    }

    // 🔥 flatten: tanggal → timestamp → data
    const arr = Object.values(historicalData).flatMap(day =>
      Object.values(day)
    );

    const oxygenValues = arr
      .map(d => parseFloat(d.oxygen))
      .filter(v => !isNaN(v) && v > 0);

    const phValues = arr
      .map(d => parseFloat(d.ph))
      .filter(v => !isNaN(v) && v > 0);

    const tempValues = arr
      .map(d => parseFloat(d.temperature))
      .filter(v => !isNaN(v) && v !== -127);

    const calc = (values, fixed = 2) => {
      if (values.length === 0) {
        return { avg: '-', min: '-', max: '-' };
      }

      const sum = values.reduce((a, b) => a + b, 0);

      return {
        avg: (sum / values.length).toFixed(fixed),
        min: Math.min(...values).toFixed(fixed),
        max: Math.max(...values).toFixed(fixed)
      };
    };

    return {
      oxygen: calc(oxygenValues, 2),
      ph: calc(phValues, 1),
      temperature: calc(tempValues, 1)
    };
  };

  const stats = calculateStats();
  const COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];

  return (
    <div className="dashboard">
      <h2>📊 Dashboard Monitoring</h2>
      
      {stats && (
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon">💧</div>
            <div className="stat-info">
              <h3>Dissolved Oxygen</h3>
              <div className="stat-values">
                <div>Rata-rata: <strong>{stats.oxygen.avg} mg/L</strong></div>
                <div>Min: {stats.oxygen.min} | Max: {stats.oxygen.max}</div>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⚗️</div>
            <div className="stat-info">
              <h3>pH</h3>
              <div className="stat-values">
                <div>Rata-rata: <strong>{stats.ph.avg}</strong></div>
                <div>Min: {stats.ph.min} | Max: {stats.ph.max}</div>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🌡️</div>
            <div className="stat-info">
              <h3>Temperature</h3>
              <div className="stat-values">
                <div>Rata-rata: <strong>{stats.temperature.avg}°C</strong></div>
                <div>Min: {stats.temperature.min} | Max: {stats.temperature.max}</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="charts-container">
        <div className="chart-card">
          <h3>Tren Dissolved Oxygen & pH</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="oxygen" stroke="#3498db" name="DO (mg/L)" />
              <Line yAxisId="right" type="monotone" dataKey="ph" stroke="#2ecc71" name="pH" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-card">
          <h3>Temperature & Turbidity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke="#e74c3c" name="Temperature (°C)" />
              <Line type="monotone" dataKey="turbidity" stroke="#f39c12" name="Turbidity (NTU)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-card">
          <h3>Parameter Terkini</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[chartData[chartData.length - 1] || {}]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="oxygen" fill="#3498db" name="DO (mg/L)" />
              <Bar dataKey="ph" fill="#2ecc71" name="pH" />
              <Bar dataKey="temperature" fill="#e74c3c" name="Temp (°C)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;