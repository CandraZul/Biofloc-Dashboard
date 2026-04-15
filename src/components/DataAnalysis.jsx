// components/DataAnalysis.js
import React, { useState } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import './DataAnalysis.css';

const DataAnalysis = ({ historicalData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedParameter, setSelectedParameter] = useState('all');

  const flattenData = (readings) => {
    if (!readings) return [];

    return Object.entries(readings).flatMap(([date, timestamps]) =>
      Object.entries(timestamps).map(([ts, values]) => ({
        timestamp: Number(ts) * 1000,
        ...values
      }))
    );
  };

  const isValidData = (d) => {
    return (
      d &&
      d.timestamp &&
      d.temperature !== -127 &&
      d.turbidity !== 1000 &&
      d.oxygen !== 0 &&
      d.ph !== 0
    );
  };

  const getFilteredData = (data) => {
    const now = Date.now();
    const daysToShow = selectedPeriod === 'month' ? 30 : 7;
    const cutoff = now - (daysToShow * 24 * 60 * 60 * 1000);

    return data.filter(d => d.timestamp > cutoff);
  };

  const rawData = flattenData(historicalData?.readings);

  const cleanedData = rawData.filter(isValidData);

  const filteredData = getFilteredData(cleanedData);

  const safeNumber = (val, def = 0) => {
    const n = parseFloat(val);
    return isNaN(n) ? def : n;
  };

  // Prepare data for radar chart (water quality index)
  const getLatestValues = () => {
    if (!filteredData.length) return [];

    const latest = filteredData[filteredData.length - 1];

    const data = [
      { parameter: 'DO', value: (safeNumber(latest.oxygen) / 8) * 100 },
      { parameter: 'pH', value: (safeNumber(latest.ph) / 9) * 100 },
      { parameter: 'Temperature', value: (safeNumber(latest.temperature) / 35) * 100 },
      { parameter: 'Turbidity', value: 100 - (safeNumber(latest.turbidity) / 1000) * 100 },
      { parameter: 'Ammonia', value: 0 } // sementara 0 karena tidak ada di data
    ];

    // 🔥 FILTER yang bikin error
    return data.filter(d => !isNaN(d.value) && d.value !== null);
  };

  // Calculate trend analysis
  const calculateTrend = () => {
    if (filteredData.length < 2) return null;
    
    const first = filteredData[0];
    const last = filteredData[filteredData.length - 1];
    
    return {
      oxygen: ((parseFloat(last.oxygen) - parseFloat(first.oxygen)) / parseFloat(first.oxygen)) * 100,
      ph: ((parseFloat(last.ph) - parseFloat(first.ph)) / parseFloat(first.ph)) * 100,
      temperature: ((parseFloat(last.temperature) - parseFloat(first.temperature)) / parseFloat(first.temperature)) * 100,
      turbidity: ((last.turbidity - first.turbidity) / first.turbidity) * 100,
      ammonia: ((parseFloat(last.ammonia) - parseFloat(first.ammonia)) / parseFloat(first.ammonia)) * 100
    };
  };

  const trend = calculateTrend();

  // Educational insights
  const getEducationalInsights = () => {
    const avgDO = filteredData.reduce((sum, d) => sum + parseFloat(d.oxygen), 0) / filteredData.length;
    const avgPH = filteredData.reduce((sum, d) => sum + parseFloat(d.ph), 0) / filteredData.length;
    
    return {
      doStatus: avgDO < 4 ? 'Kritis' : avgDO < 5 ? 'Rendah' : avgDO < 7 ? 'Optimal' : 'Tinggi',
      phStatus: avgPH < 6.5 ? 'Asam' : avgPH > 8.5 ? 'Basa' : 'Netral',
      recommendation: avgDO < 4 ? 'Perlu aerasi tambahan' : 
                      avgPH < 6.5 ? 'Tambahkan kapur pertanian' :
                      avgPH > 8.5 ? 'Tambahkan bahan organik' : 'Kondisi optimal'
    };
  };

  const insights = getEducationalInsights();

  const radarData = getLatestValues();

  console.log('filteredData:', filteredData);
console.log('radarData:', radarData);

  return (
    <div className="data-analysis">
      <h2>📚 Analisis Data & Pembelajaran Bioflok</h2>
      
      <div className="analysis-controls">
        <div className="control-group">
          <label>Periode Data:</label>
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
            <option value="week">7 Hari Terakhir</option>
            <option value="month">30 Hari Terakhir</option>
          </select>
        </div>
      </div>

      {/* Educational Section */}
      <div className="educational-section">
        <h3>🎓 Pembelajaran Bioflok</h3>
        <div className="learning-cards">
          <div className="learning-card">
            <h4>📖 Apa itu Bioflok?</h4>
            <p>Bioflok adalah teknologi budidaya ikan yang memanfaatkan gumpalan mikroorganisme (bakteri, algae, fungi) untuk mengolah limbah nitrogen menjadi protein yang dapat dimanfaatkan kembali oleh ikan.</p>
          </div>
          <div className="learning-card">
            <h4>🔬 Parameter Penting</h4>
            <ul>
              <li><strong>DO (Oksigen Terlarut):</strong> 4-6 mg/L - untuk respirasi ikan dan bakteri</li>
              <li><strong>pH:</strong> 6.8-7.5 - keseimbangan asam-basa air</li>
              <li><strong>Suhu:</strong> 26-30°C - optimal untuk pertumbuhan</li>
              <li><strong>Ammonia:</strong> {'<'}0.5 mg/L - toksik bagi ikan</li>
              <li><strong>Turbidity:</strong> {'<'}500 NTU - kekeruhan air</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Water Quality Index */}
      <div className="analysis-section">
        <h3>⭐ Indeks Kualitas Air</h3>
        <div className="radar-container">
          {radarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="parameter" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div>⚠️ Data tidak cukup untuk Radar Chart</div>
        )}
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="analysis-section">
        <h3>📈 Analisis Tren Parameter</h3>
        {trend && (
          <div className="trend-indicators">
            <div className={`trend-item ${trend.oxygen > 0 ? 'positive' : 'negative'}`}>
              <span>DO:</span> {trend.oxygen.toFixed(1)}% {trend.oxygen > 0 ? '↑' : '↓'}
            </div>
            <div className={`trend-item ${trend.ph > 0 ? 'positive' : 'negative'}`}>
              <span>pH:</span> {trend.ph.toFixed(1)}% {trend.ph > 0 ? '↑' : '↓'}
            </div>
            <div className={`trend-item ${trend.temperature > 0 ? 'positive' : 'negative'}`}>
              <span>Suhu:</span> {trend.temperature.toFixed(1)}% {trend.temperature > 0 ? '↑' : '↓'}
            </div>
            <div className="trend-item negative">
              <span>Ammonia:</span> {trend.ammonia.toFixed(1)}% ↓
            </div>
          </div>
        )}
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleDateString()} />
            <YAxis />
            <Tooltip labelFormatter={(ts) => new Date(ts).toLocaleString()} />
            <Legend />
            <Area type="monotone" dataKey="oxygen" stackId="1" stroke="#3498db" fill="#3498db" name="DO (mg/L)" />
            <Area type="monotone" dataKey="temperature" stackId="1" stroke="#e74c3c" fill="#e74c3c" name="Suhu (°C)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insights and Recommendations */}
      <div className="insights-section">
        <h3>💡 Insight & Rekomendasi</h3>
        <div className="insight-cards">
          <div className="insight-card">
            <h4>Status DO: {insights.doStatus}</h4>
            <p>Oksigen terlarut {insights.doStatus === 'Optimal' ? 'dalam kondisi baik' : 
              insights.doStatus === 'Rendah' ? 'perlu ditingkatkan' : 'kritis, segera bertindak!'}</p>
          </div>
          <div className="insight-card">
            <h4>Status pH: {insights.phStatus}</h4>
            <p>Air bersifat {insights.phStatus.toLowerCase()}</p>
          </div>
          <div className="insight-card recommendation">
            <h4>📝 Rekomendasi:</h4>
            <p>{insights.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Student Exercise Section */}
      <div className="exercise-section">
        <h3>📝 Latihan untuk Siswa</h3>
        <div className="exercise-card">
          <h4>Soal Analisis:</h4>
          <ol>
            <li>Berdasarkan data DO (Oksigen Terlarut), pada rentang waktu kapan nilai DO paling rendah? Mengapa hal ini bisa terjadi?</li>
            <li>Bagaimana hubungan antara suhu dan DO berdasarkan data yang tersedia?</li>
            <li>Jika nilai pH turun drastis, tindakan apa yang harus dilakukan untuk menstabilkannya?</li>
            <li>Buatlah kesimpulan tentang kesehatan kolam bioflok berdasarkan data yang telah dianalisis!</li>
          </ol>
          <button className="btn-exercise" onClick={() => alert('Jawaban dapat didiskusikan dengan guru!')}>
            Diskusikan Jawaban
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataAnalysis;