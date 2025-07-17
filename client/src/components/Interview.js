import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMicrophone, FaMicrophoneSlash, FaPlay, FaPause, FaStop, FaTimes, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { getApiUrl } from '../config';

const Interview = ({ sessionId, onInterviewComplete, onInterviewCancelled }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const speechRef = useRef(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechRef.current = window.speechSynthesis;
      // Set default voice to English
      const voices = speechRef.current.getVoices();
      if (voices.length > 0) {
        const englishVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        if (englishVoice) {
          speechRef.current.defaultVoice = englishVoice;
        }
      }
    }

    // Cleanup function to stop speech when component unmounts
    return () => {
      if (speechRef.current) {
        speechRef.current.cancel();
      }
    };
  }, []);

  const speakQuestion = useCallback((text) => {
    if (!speechRef.current || !speechEnabled) return;

    // Stop any current speech
    speechRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Use English voice if available
    const voices = speechRef.current.getVoices();
    const englishVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechRef.current.speak(utterance);
  }, [speechEnabled]);

  const stopSpeaking = () => {
    if (speechRef.current) {
      speechRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleSpeech = () => {
    if (speechEnabled) {
      stopSpeaking();
    }
    setSpeechEnabled(!speechEnabled);
  };

  // Auto-speak question when it changes
  useEffect(() => {
    if (questions.length > 0 && speechEnabled && speechRef.current) {
      speakQuestion(questions[currentQuestionIndex]);
    }
  }, [currentQuestionIndex, questions, speechEnabled, speakQuestion]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(getApiUrl('/api/questions'));
      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Failed to load interview questions');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError(null);
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleCancelInterview = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelInterview = () => {
    // Stop recording if active
    if (isRecording) {
      stopRecording();
    }
    
    // Stop speech if active
    stopSpeaking();
    
    // Clear any active timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Clean up audio stream
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    // Call the cancellation callback
    if (onInterviewCancelled) {
      onInterviewCancelled();
    }
    
    // Navigate back to welcome page
    navigate('/');
  };

  const cancelCancelInterview = () => {
    setShowCancelConfirm(false);
  };

  const uploadAudio = async () => {
    if (!audioBlob) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('sessionId', sessionId);
      formData.append('questionIndex', currentQuestionIndex.toString());

      console.log('Uploading audio with sessionId:', sessionId, 'questionIndex:', currentQuestionIndex);
      console.log('Audio blob size:', audioBlob.size);

      // Add timeout to the fetch request (45 seconds for speech recognition)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(getApiUrl('/api/upload-audio'), {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        if (data.isComplete) {
          // Interview is complete, start analysis
          setIsAnalyzing(true);
          await waitForAnalysis();
        } else {
          // Move to next question
          setCurrentQuestionIndex(data.nextQuestionIndex);
          setAudioBlob(null);
          setRecordingTime(0);
        }
      } else {
        setError('Failed to upload audio. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      if (error.name === 'AbortError') {
        setError('Speech recognition is taking too long. Please try again with a shorter recording.');
      } else {
        setError(`Failed to upload audio: ${error.message}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const waitForAnalysis = async () => {
    // Poll for results
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(getApiUrl(`/api/interview-result/${sessionId}`));
        if (response.ok) {
          const data = await response.json();
          clearInterval(pollInterval);
          setIsAnalyzing(false);
          onInterviewComplete(data);
          navigate('/results');
        }
      } catch (error) {
        console.error('Error polling for results:', error);
      }
    }, 2000);

    // Timeout after 30 seconds
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsAnalyzing(false);
      setError('Analysis is taking longer than expected. Please check results page.');
    }, 30000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  if (questions.length === 0) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading interview questions...</p>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <h3>Analyzing your interview...</h3>
          <p>This may take a few moments. Please don't close this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>CAS Interview in Progress</h1>
        <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
        <button 
          className="btn btn-danger" 
          onClick={handleCancelInterview}
          style={{ 
            position: 'absolute', 
            top: '20px', 
            right: '20px',
            padding: '8px 16px',
            fontSize: '14px'
          }}
        >
          <FaTimes style={{ marginRight: '5px' }} />
          Cancel Interview
        </button>
      </div>

      <div className="main-content">
        <div className="card">
          {/* Progress Bar */}
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Progress</span>
              <span>{currentQuestionIndex + 1} / {questions.length}</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>

          {/* Current Question */}
          <div className="question-card">
            <div className="question-number">{currentQuestionIndex + 1}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ color: '#333', margin: 0, flex: 1 }}>
                {questions[currentQuestionIndex]}
              </h3>
              <div style={{ display: 'flex', gap: '10px', marginLeft: '15px' }}>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => speakQuestion(questions[currentQuestionIndex])}
                  disabled={isSpeaking}
                  style={{ 
                    padding: '8px 12px', 
                    fontSize: '14px',
                    minWidth: 'auto'
                  }}
                  title={isSpeaking ? "Speaking..." : "Hear question"}
                >
                  {isSpeaking ? (
                    <div className="spinner" style={{ 
                      width: '14px', 
                      height: '14px', 
                      border: '2px solid #6c757d', 
                      borderTop: '2px solid transparent', 
                      borderRadius: '50%', 
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  ) : (
                    <FaVolumeUp />
                  )}
                </button>
                <button
                  className={`btn ${speechEnabled ? 'btn-outline-success' : 'btn-outline-secondary'}`}
                  onClick={toggleSpeech}
                  style={{ 
                    padding: '8px 12px', 
                    fontSize: '14px',
                    minWidth: 'auto'
                  }}
                  title={speechEnabled ? "Auto-speak enabled" : "Auto-speak disabled"}
                >
                  {speechEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
                </button>
              </div>
            </div>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Take your time to think before answering. You can record multiple times if needed.
              {speechEnabled && (
                <span style={{ display: 'block', marginTop: '8px', color: '#28a745', fontSize: '12px' }}>
                  🔊 Questions will be read aloud automatically
                </span>
              )}
            </p>
          </div>

          {/* Recording Controls */}
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            {!audioBlob ? (
              <div>
                <button 
                  className={`btn ${isRecording ? 'btn-danger' : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isUploading}
                >
                  {isRecording ? (
                    <>
                      <FaStop style={{ marginRight: '8px' }} />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <FaMicrophone style={{ marginRight: '8px' }} />
                      Start Recording
                    </>
                  )}
                </button>
                
                {isRecording && (
                  <div className="recording-indicator">
                    <div className="recording-dot"></div>
                    <span>Recording... {formatTime(recordingTime)}</span>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={isPlaying ? pauseRecording : playRecording}
                    style={{ marginRight: '10px' }}
                  >
                    {isPlaying ? <FaPause /> : <FaPlay />}
                    {isPlaying ? ' Pause' : ' Play'} Recording
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      setAudioBlob(null);
                      setRecordingTime(0);
                    }}
                  >
                    <FaMicrophoneSlash style={{ marginRight: '8px' }} />
                    Re-record
                  </button>
                </div>
                
                <button 
                  className="btn btn-success"
                  onClick={uploadAudio}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="spinner" style={{ 
                        display: 'inline-block', 
                        width: '16px', 
                        height: '16px', 
                        border: '2px solid #fff', 
                        borderTop: '2px solid transparent', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite',
                        marginRight: '8px'
                      }}></div>
                      Processing Speech...
                    </>
                  ) : (
                    'Submit Answer'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Audio Element */}
          <audio 
            ref={audioRef}
            onEnded={() => setIsPlaying(false)}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            maxWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ color: '#dc3545', marginBottom: '20px' }}>
              Cancel Interview?
            </h3>
            <p style={{ color: '#666', marginBottom: '30px' }}>
              Are you sure you want to cancel this interview? All progress will be lost.
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                className="btn btn-secondary"
                onClick={cancelCancelInterview}
              >
                Continue Interview
              </button>
              <button 
                className="btn btn-danger"
                onClick={confirmCancelInterview}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interview; 