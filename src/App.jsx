// App.js
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import RealtimeMonitor from './components/RealtimeMonitor';
import CalibrationPanel from './components/CalibrationPanel';
import DataAnalysis from './components/DataAnalysis';
import { db } from "./firebase";
import { ref, onValue, get, off } from "firebase/database";
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('realtime');
  const [sensorData, setSensorData] = useState({
    oxygen: 0,
    ph: 0,
    temperature: 0,
    turbidity: 0,
    ammonia: 0 // Added ammonia parameter
  });
  const [historicalData, setHistoricalData] = useState([]);
  // const [calibration, setCalibration] = useState({
  //   oxygen_calibration: 875,
  //   ph4: 2.6,
  //   ph7: 2.1
  // });

  const [latest, setLatest] = useState(null);
  const [calibration, setCalibration] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [dashboard, setDashboard] = useState(null);

  // Load data from JSON file (simulasi)
  useEffect(() => {
    let dbRef;
    let unsubscribe;

    // 🔴 REALTIME
    if (activeTab === 'realtime') {
      dbRef = ref(db, 'BioflocData/latest');

      unsubscribe = onValue(dbRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setLatest(data);
        }
      });
    }

    // 🟡 CALIBRATION
    if (activeTab === 'calibration') {
      const fetchCalibration = async () => {
        const snapshot = await get(ref(db, "BioflocData/calibration"));
        setCalibration(snapshot.val());
      };

      fetchCalibration();
    }

    // 🔵 ANALYSIS
    if (activeTab === 'analysis') {
      const fetchAnalysis = async () => {
        const snapshot = await get(ref(db, "BioflocData/daily_data"));
        setAnalysis(snapshot.val());
      };

      fetchAnalysis();
    }

    // 🟢 DASHBOARD
    if (activeTab === 'dashboard') {
      const fetchDashboard = async () => {
        const snapshot = await get(ref(db, "BioflocData/readings"));
        setDashboard(snapshot.val());
      };

      fetchDashboard();
    }

    // cleanup
    return () => {
      if (unsubscribe) unsubscribe();
      if (dbRef) off(dbRef);
    };

  }, [activeTab]);

  return (
    <div className="app">
      <header className="header">
        <h1>🐟 Bioflok Monitoring System</h1>
        <p>Sistem Monitoring Kolam Bioflok Digital</p>
      </header>
      
      <nav className="nav-tabs">
        <button 
          className={activeTab === 'realtime' ? 'active' : ''} 
          onClick={() => setActiveTab('realtime')}
        >
          📊 Realtime Monitor
        </button>
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''} 
          onClick={() => setActiveTab('dashboard')}
        >
          📈 Dashboard
        </button>
        <button 
          className={activeTab === 'calibration' ? 'active' : ''} 
          onClick={() => setActiveTab('calibration')}
        >
          🔧 Kalibrasi
        </button>
        <button 
          className={activeTab === 'analysis' ? 'active' : ''} 
          onClick={() => setActiveTab('analysis')}
        >
          📚 Analisis Data
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'realtime' && (
          <RealtimeMonitor sensorData={latest} />
        )}
        {activeTab === 'dashboard' && (
          <Dashboard historicalData={dashboard} />
        )}
        {activeTab === 'calibration' && (
          <CalibrationPanel calibration={calibration} setCalibration={setCalibration} />
        )}
        {activeTab === 'analysis' && (
          <DataAnalysis historicalData={analysis} />
        )}
      </main>
    </div>
  );
}

export default App;