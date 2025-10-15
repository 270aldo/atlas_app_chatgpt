import React from 'react';
import ReactDOM from 'react-dom/client';
import { Dashboard } from '../components/Dashboard';
import '../styles/globals.css';

const stubData = { week: 4, sessionsCompleted: 3, totalSessions: 5, streakDays: 12, nextSession: 'Mañana 7:00 AM' };

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Dashboard weekData={stubData} />
  </React.StrictMode>
);
