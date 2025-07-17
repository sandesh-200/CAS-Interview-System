import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMicrophone, FaGraduationCap, FaChartLine } from 'react-icons/fa';

const Welcome = ({ onStartInterview, hasActiveSession }) => {
  const navigate = useNavigate();

  const handleStartInterview = async () => {
    await onStartInterview();
    navigate('/interview');
  };

  const handleContinueInterview = () => {
    navigate('/interview');
  };

  const handleViewResults = () => {
    navigate('/results');
  };

  return (
    <div className="container">
      <div className="header">
        <h1>CAS UK Interview System</h1>
        <p>Practice your interview skills with AI-powered analysis</p>
      </div>

      <div className="main-content">
        <div className="card fade-in">
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <FaGraduationCap size={60} color="#667eea" />
            <h2 style={{ marginTop: '20px', color: '#333' }}>
              Welcome to Your CAS Interview Practice
            </h2>
            <p style={{ color: '#666', fontSize: '18px', marginTop: '10px' }}>
              Get ready for your UK university interview with our comprehensive practice system
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <FaMicrophone size={40} color="#667eea" />
              <h3 style={{ marginTop: '15px', color: '#333' }}>Voice Recording</h3>
              <p style={{ color: '#666' }}>Record your responses to interview questions</p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <FaChartLine size={40} color="#667eea" />
              <h3 style={{ marginTop: '15px', color: '#333' }}>AI Analysis</h3>
              <p style={{ color: '#666' }}>Get detailed feedback using Gemini AI</p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <FaGraduationCap size={40} color="#667eea" />
              <h3 style={{ marginTop: '15px', color: '#333' }}>CAS Focused</h3>
              <p style={{ color: '#666' }}>Questions tailored for CAS UK interviews</p>
            </div>
          </div>

          {hasActiveSession ? (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#667eea', marginBottom: '20px' }}>
                You have an active interview session
              </h3>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn" onClick={handleContinueInterview}>
                  Continue Interview
                </button>
                <button className="btn btn-secondary" onClick={handleViewResults}>
                  View Results
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#667eea', marginBottom: '20px' }}>
                Ready to start your practice interview?
              </h3>
              <p style={{ color: '#666', marginBottom: '30px' }}>
                The interview will take approximately 5 minutes and includes 10 questions.
                Make sure you have a quiet environment and a working microphone.
              </p>
              <button className="btn" onClick={handleStartInterview}>
                Start Interview
              </button>
            </div>
          )}

          <div style={{ marginTop: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
            <h4 style={{ color: '#333', marginBottom: '15px' }}>What to expect:</h4>
            <ul style={{ textAlign: 'left', color: '#666', lineHeight: '1.6' }}>
              <li>10 carefully selected CAS UK interview questions</li>
              <li>Voice recording for each response</li>
              <li>AI-powered analysis of your performance</li>
              <li>Detailed scoring across multiple categories</li>
              <li>Personalized feedback and improvement suggestions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 