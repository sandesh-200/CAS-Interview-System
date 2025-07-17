import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrophy, FaChartBar, FaLightbulb, FaExclamationTriangle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Results = ({ data, onNewInterview }) => {
  const navigate = useNavigate();

  const handleNewInterview = () => {
    onNewInterview();
    navigate('/');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    if (score >= 40) return '#fd7e14';
    return '#dc3545';
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 40) return 'score-average';
    return 'score-poor';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
  };

  const breakdownData = data.analysis?.breakdown ? [
    { name: 'Communication', value: data.analysis.breakdown.communication?.score || 0, color: '#667eea' },
    { name: 'Knowledge', value: data.analysis.breakdown.knowledge?.score || 0, color: '#28a745' },
    { name: 'Motivation', value: data.analysis.breakdown.motivation?.score || 0, color: '#ffc107' },
    { name: 'Adaptability', value: data.analysis.breakdown.adaptability?.score || 0, color: '#fd7e14' }
  ] : [];

  const barData = breakdownData.map(item => ({
    name: item.name,
    score: item.value,
    color: item.color
  }));

  const COLORS = ['#667eea', '#28a745', '#ffc107', '#fd7e14'];

  return (
    <div className="container">
      <div className="header">
        <h1>Interview Results</h1>
        <p>Your comprehensive performance analysis</p>
      </div>

      <div className="main-content">
        <div className="card fade-in">
          {/* Overall Score */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Overall Performance</h2>
            <div className={`score-circle ${getScoreClass(data.analysis?.overallScore || 0)}`}>
              {data.analysis?.overallScore || 0}
            </div>
            <p style={{ marginTop: '15px', fontSize: '18px', color: '#666' }}>
              {getScoreLabel(data.analysis?.overallScore || 0)}
            </p>
          </div>

          {/* Recommendation */}
          <div style={{ 
            background: data.analysis?.recommendation?.decision === 'Pass' ? '#d4edda' : '#f8d7da',
            border: `2px solid ${data.analysis?.recommendation?.decision === 'Pass' ? '#28a745' : '#dc3545'}`,
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
              {data.analysis?.recommendation?.decision === 'Pass' ? (
                <FaCheckCircle size={24} color="#28a745" />
              ) : (
                <FaTimesCircle size={24} color="#dc3545" />
              )}
              <h3 style={{ 
                color: data.analysis?.recommendation?.decision === 'Pass' ? '#28a745' : '#dc3545',
                margin: 0
              }}>
                {data.analysis?.recommendation?.decision || 'Pending'}
              </h3>
            </div>
            <p style={{ color: '#666', margin: '5px 0' }}>
              Confidence: {data.analysis?.recommendation?.confidence || 'Unknown'}
            </p>
            <p style={{ color: '#333', fontSize: '14px' }}>
              {data.analysis?.recommendation?.reasoning || 'No reasoning provided'}
            </p>
          </div>

          {/* Breakdown Charts */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ color: '#333', marginBottom: '20px', textAlign: 'center' }}>
              <FaChartBar style={{ marginRight: '8px' }} />
              Performance Breakdown
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {/* Pie Chart */}
              <div className="result-card">
                <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>Score Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={breakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {breakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div className="result-card">
                <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>Category Scores</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 25]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ color: '#333', marginBottom: '20px' }}>
              <FaTrophy style={{ marginRight: '8px' }} />
              Detailed Analysis
            </h3>
            
            <div className="result-grid">
              {data.analysis?.breakdown && Object.entries(data.analysis.breakdown).map(([category, details]) => (
                <div key={category} className="result-card">
                  <h4 style={{ 
                    color: getScoreColor(details.score),
                    textTransform: 'capitalize',
                    marginBottom: '10px'
                  }}>
                    {category}
                  </h4>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: getScoreColor(details.score),
                    marginBottom: '10px'
                  }}>
                    {details.score}/25
                  </div>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    {details.feedback}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths and Improvements */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            {/* Strengths */}
            <div className="result-card">
              <h4 style={{ color: '#28a745', marginBottom: '15px' }}>
                <FaLightbulb style={{ marginRight: '8px' }} />
                Strengths
              </h4>
              {data.analysis?.strengths && data.analysis.strengths.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {data.analysis.strengths.map((strength, index) => (
                    <li key={index} className="strength-item">
                      ✓ {strength}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No specific strengths identified</p>
              )}
            </div>

            {/* Areas for Improvement */}
            <div className="result-card">
              <h4 style={{ color: '#dc3545', marginBottom: '15px' }}>
                <FaExclamationTriangle style={{ marginRight: '8px' }} />
                Areas for Improvement
              </h4>
              {data.analysis?.improvements && data.analysis.improvements.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {data.analysis.improvements.map((improvement, index) => (
                    <li key={index} className="improvement-item">
                      • {improvement}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No specific improvements needed</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button className="btn" onClick={handleNewInterview} style={{ marginRight: '15px' }}>
              Start New Interview
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => window.print()}
            >
              Print Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results; 