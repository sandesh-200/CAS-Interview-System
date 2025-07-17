import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './components/Welcome';
import Interview from './components/Interview';
import Results from './components/Results';
import { getApiUrl } from './config';
import './App.css';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [interviewData, setInterviewData] = useState(null);

  useEffect(() => {
    // Check if there's a saved session
    const savedSession = localStorage.getItem('interviewSession');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      console.log('Loading saved session:', session.sessionId);
      setSessionId(session.sessionId);
      setInterviewData(session.data);
    }
  }, []);

  const startNewInterview = async () => {
    try {
      console.log('Starting new interview...');
      const response = await fetch(getApiUrl('/api/start-interview'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      console.log('Interview started, session ID:', data.sessionId);
      setSessionId(data.sessionId);
      
      // Save session to localStorage
      localStorage.setItem('interviewSession', JSON.stringify({
        sessionId: data.sessionId,
        data: null
      }));
      
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please try again.');
    }
  };

  const clearSession = () => {
    console.log('Clearing session');
    setSessionId(null);
    setInterviewData(null);
    localStorage.removeItem('interviewSession');
  };

  const handleInterviewComplete = (data) => {
    setInterviewData(data);
    localStorage.setItem('interviewSession', JSON.stringify({
      sessionId,
      data
    }));
  };

  const handleInterviewCancelled = () => {
    clearSession();
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              <Welcome 
                onStartInterview={startNewInterview}
                hasActiveSession={!!sessionId}
              />
            } 
          />
          <Route 
            path="/interview" 
            element={
              sessionId ? (
                <Interview 
                  sessionId={sessionId}
                  onInterviewComplete={handleInterviewComplete}
                  onInterviewCancelled={handleInterviewCancelled}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/results" 
            element={
              interviewData ? (
                <Results 
                  data={interviewData}
                  onNewInterview={clearSession}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 