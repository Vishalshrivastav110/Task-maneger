import React, { useState, useEffect } from 'react';

const PomodoroTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState('work'); // 'work' or 'break'
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  const workTime = 25 * 60; // 25 minutes
  const breakTime = 5 * 60; // 5 minutes

  useEffect(() => {
    let interval = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Timer completed
      playNotificationSound();
      if (sessionType === 'work') {
        setSessionsCompleted(prev => prev + 1);
        setSessionType('break');
        setTimeLeft(breakTime);
      } else {
        setSessionType('work');
        setTimeLeft(workTime);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, sessionType]);

  const playNotificationSound = () => {
    // Create a simple notification sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(sessionType === 'work' ? workTime : breakTime);
  };

  const switchSession = (type) => {
    setIsRunning(false);
    setSessionType(type);
    setTimeLeft(type === 'work' ? workTime : breakTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = sessionType === 'work' ? workTime : breakTime;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <span className="text-2xl mr-2">⏰</span>
          Pomodoro Timer
        </h3>
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => switchSession('work')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
              sessionType === 'work' 
                ? 'bg-orange-500 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Work
          </button>
          <button
            onClick={() => switchSession('break')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
              sessionType === 'break' 
                ? 'bg-green-500 text-white shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Break
          </button>
        </div>
      </div>

      {/* Timer Circle */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={sessionType === 'work' ? '#f97316' : '#10b981'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-gray-900">
              {formatTime(timeLeft)}
            </div>
            <div className={`text-sm font-medium mt-2 ${
              sessionType === 'work' ? 'text-orange-600' : 'text-green-600'
            }`}>
              {sessionType === 'work' ? 'Work Session' : 'Break Time'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4 mb-4">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Start</span>
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Pause</span>
          </button>
        )}
        <button
          onClick={resetTimer}
          className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Reset</span>
        </button>
      </div>

      {/* Session Info */}
      <div className="text-center">
        <div className="text-sm text-gray-600">
          Sessions Completed: <span className="font-semibold text-gray-900">{sessionsCompleted}</span>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {sessionType === 'work' 
            ? 'Focus on your task for 25 minutes' 
            : 'Take a 5-minute break'
          }
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;