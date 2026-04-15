// components/CalibrationPanel.js
import React, { useState } from 'react';
import './CalibrationPanel.css';



const CalibrationPanel = ({ calibration, setCalibration }) => {
  const defaultCalibration = {
    oxygen_calibration: 875,
    ph4: 2.6,
    ph7: 2.1
  };

  const [newCalibration, setNewCalibration] = useState(
    calibration || defaultCalibration
  );
  const [message, setMessage] = useState('');

  const handleCalibrationChange = (param, value) => {
    setNewCalibration({
      ...newCalibration,
      [param]: parseFloat(value)
    });
  };

  const saveCalibration = () => {
    setCalibration(newCalibration);
    setMessage('✅ Kalibrasi berhasil disimpan!');
    setTimeout(() => setMessage(''), 3000);
  };

  const resetCalibration = () => {
    setNewCalibration({
      oxygen_calibration: 875,
      ph4: 2.6,
      ph7: 2.1
    });
    setMessage('🔄 Kalibrasi direset ke default');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="calibration-panel">
      <h2>🔧 Kalibrasi Sensor</h2>
      <p className="calibration-desc">
        Lakukan kalibrasi sensor secara berkala untuk memastikan akurasi data
      </p>
      
      {message && <div className="calibration-message">{message}</div>}
      
      <div className="calibration-grid">
        <div className="calibration-card">
          <div className="calibration-icon">💧</div>
          <h3>Sensor Dissolved Oxygen</h3>
          <div className="calibration-field">
            <label>Nilai Kalibrasi (mV):</label>
            <input
              type="number"
              value={newCalibration.oxygen_calibration}
              onChange={(e) => handleCalibrationChange('oxygen_calibration', e.target.value)}
              step="1"
            />
            <p className="field-note">Nilai referensi untuk kalibrasi oksigen terlarut</p>
          </div>
        </div>
        
        <div className="calibration-card">
          <div className="calibration-icon">⚗️</div>
          <h3>Sensor pH</h3>
          <div className="calibration-field">
            <label>Kalibrasi pH 4:</label>
            <input
              type="number"
              value={newCalibration.ph4}
              onChange={(e) => handleCalibrationChange('ph4', e.target.value)}
              step="0.1"
            />
            <p className="field-note">Nilai tegangan untuk larutan buffer pH 4</p>
          </div>
          <div className="calibration-field">
            <label>Kalibrasi pH 7:</label>
            <input
              type="number"
              value={newCalibration.ph7}
              onChange={(e) => handleCalibrationChange('ph7', e.target.value)}
              step="0.1"
            />
            <p className="field-note">Nilai tegangan untuk larutan buffer pH 7</p>
          </div>
        </div>
        
        <div className="calibration-card">
          <div className="calibration-icon">🌊</div>
          <h3>Sensor Turbidity & Ammonia</h3>
          <div className="calibration-info">
            <p>⚠️ Untuk sensor turbidity dan ammonia, kalibrasi dilakukan secara manual dengan larutan standar.</p>
            <p>📝 Gunakan larutan standar 100 NTU untuk turbidity</p>
            <p>📝 Gunakan larutan standar 1 mg/L untuk ammonia</p>
          </div>
        </div>
      </div>
      
      <div className="calibration-actions">
        <button className="btn-save" onClick={saveCalibration}>
          💾 Simpan Kalibrasi
        </button>
        <button className="btn-reset" onClick={resetCalibration}>
          🔄 Reset ke Default
        </button>
      </div>
      
      <div className="calibration-guide">
        <h3>📖 Panduan Kalibrasi</h3>
        <ol>
          <li>Bersihkan sensor dengan aquades sebelum kalibrasi</li>
          <li>Celupkan sensor ke dalam larutan standar</li>
          <li>Tunggu hingga nilai stabil (sekitar 2-3 menit)</li>
          <li>Masukkan nilai yang terukur ke dalam field di atas</li>
          <li>Klik "Simpan Kalibrasi" untuk menyimpan pengaturan</li>
          <li>Lakukan kalibrasi ulang setiap 2 minggu sekali</li>
        </ol>
      </div>
    </div>
  );
};

export default CalibrationPanel;