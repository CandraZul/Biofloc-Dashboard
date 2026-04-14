// components/RealtimeMonitor.js
import React from 'react';
import './RealtimeMonitor.css';
import { FaTint, FaTemperatureHigh, FaWater, FaExclamationTriangle } from "react-icons/fa";
import { GiChemicalDrop } from "react-icons/gi";

const RealtimeMonitor = ({ sensorData }) => {
  const {
    oxygen = 0,
    ph = 0,
    temperature = 0,
    turbidity = 0,
    ammonia = 0
  } = sensorData || {};
  const parameters = [
    {
      name: 'Dissolved Oxygen (DO)',
      value:  oxygen,
      unit: 'mg/L',
      icon: <FaTint size={32} color="#3498db" />,
      color: '#3498db',
      min: 3,
      max: 8,
      status:  oxygen >= 4 &&  oxygen <= 6 ? 'good' :  oxygen < 4 ? 'low' : 'high'
    },
    {
      name: 'pH',
      value:  ph,
      unit: '',
      icon: <GiChemicalDrop size={32} color="#2ecc71"/>,
      color: '#2ecc71',
      min: 6.5,
      max: 8.5,
      status:  ph >= 6.8 &&  ph <= 7.5 ? 'good' : 'warning'
    },
    {
      name: 'Temperature',
      value:  temperature,
      unit: '°C',
      icon: <FaTemperatureHigh size={32} color="#e74c3c"/>,
      color: '#e74c3c',
      min: 25,
      max: 32,
      status:  temperature >= 26 &&  temperature <= 30 ? 'good' : 'warning'
    },
    {
      name: 'Turbidity',
      value:  turbidity,
      unit: 'NTU',
      icon: <FaWater size={32} color="#f39c12"/>,
      color: '#f39c12',
      min: 0,
      max: 1000,
      status:  turbidity < 500 ? 'good' : 'high'
    },
    {
      name: 'Ammonia',
      value:  ammonia,
      unit: 'mg/L',
      icon: <FaExclamationTriangle size={32} color="#9b59b6"/>,
      color: '#9b59b6',
      min: 0,
      max: 1,
      status:  ammonia < 0.5 ? 'good' : 'high'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'good': return '#27ae60';
      case 'warning': return '#f39c12';
      case 'low': return '#e74c3c';
      case 'high': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="realtime-monitor">
      <div className="monitor-header">
        <h2>📡 Real-time Monitoring</h2>
        <div className="live-badge">
          <span className="pulse"></span>
          LIVE
        </div>
      </div>
      
      <div className="sensors-grid">
        {parameters.map((param, index) => (
          <div key={index} className="sensor-card" style={{ borderTopColor: param.color }}>
            <div className="sensor-icon">{param.icon}</div>
            <div className="sensor-info">
              <h3>{param.name}</h3>
              <div className="sensor-value">
                {param.value}
                <span className="sensor-unit">{param.unit}</span>
              </div>
              <div className="sensor-range">
                Range: {param.min} - {param.max} {param.unit}
              </div>
              <div 
                className="sensor-status"
                style={{ backgroundColor: getStatusColor(param.status) }}
              >
                {param.status === 'good' ? '✓ Optimal' : 
                 param.status === 'warning' ? '⚠ Perhatian' :
                 param.status === 'low' ? '↓ Rendah' : '↑ Tinggi'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="monitor-footer">
        <div className="health-summary">
          <h3>Status Kesehatan Kolam</h3>
          <div className="health-indicators">
            {parameters.map((param, idx) => (
              <div key={idx} className="health-indicator">
                <div className="indicator-label">{param.icon} {param.name.split(' ')[0]}</div>
                <div className="indicator-bar">
                  <div 
                    className="indicator-fill"
                    style={{
                      width: `${(param.value / param.max) * 100}%`,
                      backgroundColor: getStatusColor(param.status)
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeMonitor;