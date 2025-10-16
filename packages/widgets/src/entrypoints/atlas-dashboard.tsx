import React from 'react';
import ReactDOM from 'react-dom/client';
import { Dashboard } from '../components/Dashboard';
import '../styles/globals.css';

// Default props - will be overridden by window.openai.toolOutput if available
const defaultProps = {
  weekData: {
    week: 1,
    sessionsCompleted: 0,
    totalSessions: 3,
    streakDays: 0,
    nextSession: 'Hoy',
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Dashboard {...defaultProps} />
  </React.StrictMode>
);
