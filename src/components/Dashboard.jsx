// components/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import './Dashboard.css';

const Dashboard = ({ historicalData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const VALID_RANGE = {
    oxygen: { min: 3, max: 8 },
    ph: { min: 6, max: 9 },
    temperature: { min: 20, max: 35 },
    turbidity: { min: 0, max: 1000 },
    ammonia: { min: 0, max: 1 }
  };

  const isValid = (key, value) => {
    if (value === null || value === undefined) return false;
    if (isNaN(value)) return false;

    const range = VALID_RANGE[key];
    if (!range) return true;

    return value >= range.min && value <= range.max;
  };

  const getFilteredData = (data) => {
    const now = Date.now();
    const daysToShow = selectedPeriod === 'month' ? 30 : 7;
    const cutoff = now - (daysToShow * 24 * 60 * 60 * 1000);

    return data.filter(d => d.timestamp > cutoff);
  };

  // Process data for charts
 const processChartData = () => {
    if (!historicalData) return [];

    const now = Date.now();
    const daysToShow = selectedPeriod === 'month' ? 30 : 7;
    const cutoff = now - (daysToShow * 24 * 60 * 60 * 1000);

    const flatData = Object.entries(historicalData).flatMap(([date, day]) =>
      Object.entries(day).map(([timestamp, value]) => ({
        timestamp: Number(timestamp) * 1000, // 🔥 FIX UTAMA
        ...value
      }))
    );

    // 🔥 filter waktu
    const filtered = flatData.filter(d => d.timestamp > cutoff);

    // 🔥 urutkan biar chart rapi
    filtered.sort((a, b) => a.timestamp - b.timestamp);

    return filtered.map((data) => {
      const oxygen = parseFloat(data.oxygen);
      const ph = parseFloat(data.ph);
      const temperature = parseFloat(data.temperature);
      const turbidity = parseFloat(data.turbidity);
      const ammonia = parseFloat(data.ammonia);

      return {
        time: new Date(data.timestamp).toLocaleString(),

        oxygen: isValid('oxygen', oxygen) ? oxygen : null,
        ph: isValid('ph', ph) ? ph : null,
        temperature: isValid('temperature', temperature) ? temperature : null,
        turbidity: isValid('turbidity', turbidity) ? turbidity : null,
        ammonia: isValid('ammonia', ammonia) ? ammonia : null
      };
    })
    .filter(d =>
      d.oxygen !== null ||
      d.ph !== null ||
      d.temperature !== null ||
      d.turbidity !== null ||
      d.ammonia !== null
    );
  };

  const chartData = processChartData();

  // Calculate statistics
  const calculateStats = () => {
    if (!historicalData) {
      return {
        oxygen: { avg: '-', min: '-', max: '-' },
        ph: { avg: '-', min: '-', max: '-' },
        temperature: { avg: '-', min: '-', max: '-' },
        turbidity: { avg: '-', min: '-', max: '-' },
        amonia: { avg: '-', min: '-', max: '-' }
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

    const turbidValues = arr
      .map(d => parseFloat(d.turbidity))
      .filter(v => !isNaN(v) && v !== -127);

    const amoniaValues = arr
      .map(d => parseFloat(d.amonia))
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
      temperature: calc(tempValues, 1),
      turbidity: calc(turbidValues, 1),
      amonia: calc(amoniaValues, 1)
    };
  };

  const normalize = (value, min, max) => {
    if (max === min) return 0;
    return (value - min) / (max - min);
  };

  const normalizedData = chartData.map(d => ({
    time: d.time,
    oxygen: normalize(d.oxygen, 3, 8),
    ph: normalize(d.ph, 6.5, 8.5),
    temperature: normalize(d.temperature, 25, 32),
    turbidity: normalize(d.turbidity, 0, 1000),
    ammonia: normalize(d.ammonia, 0, 1)
  }));

  const stats = calculateStats();
  const COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'];

  return (
    <div className="dashboard">
      <h2>Dashboard Monitoring</h2>
      
      {stats && (
        <div>
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
              <div className="stat-icon">⚠️</div>
              <div className="stat-info">
                <h3>Amonia</h3>
                <div className="stat-values">
                  <div>Rata-rata: <strong>{stats.amonia.avg} ppm</strong></div>
                  <div>Min: {stats.amonia.min} | Max: {stats.amonia.max}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon">🌊</div>
              <div className="stat-info">
                <h3>Turbidity</h3>
                <div className="stat-values">
                  <div>Rata-rata: <strong>{stats.turbidity.avg} mg/L</strong></div>
                  <div>Min: {stats.turbidity.min} | Max: {stats.turbidity.max}</div>
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
        </div>
      )}

      <div style={{ marginBottom: '10px' }}>
          <label>Range Data: </label>
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">30 Hari Terakhir</option>
          </select>
    </div>
      
      <div className="charts-container">
        <div className="chart-card">
          <h3>Dissolved Oxygen</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="oxygen" stroke="#3498db" name="DO (mg/L)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>pH</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="right" type="monotone" dataKey="ph" stroke="#2ecc71" name="pH" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-card">
          <h3>Amonia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amonia" stroke="#e74c3c" name="Amonia (ppm)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Temperature</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="temperature" stroke="#e74c3c" name="Temperature (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-card">
          <h3>Turbidity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="turbidity" stroke="#f39c12" name="Turbidity (NTU)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      
        <div className='chart-card'>
          <h3>Parameter Normalized</h3>
          <ResponsiveContainer width="100%" height={300}>
          <LineChart data={normalizedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis domain={[0, 1]} />
            <Tooltip />
            <Legend />

            <Line dataKey="oxygen" stroke="#3498db" name="DO" />
            <Line dataKey="ph" stroke="#2ecc71" name="pH" />
            <Line dataKey="temperature" stroke="#e74c3c" name="Temp" />
            <Line dataKey="turbidity" stroke="#f39c12" name="Turbidity" />
            <Line dataKey="ammonia" stroke="#9b59b6" name="Ammonia" />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;