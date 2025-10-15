import React from 'react';
import ReactDOM from 'react-dom/client';
import { Dashboard } from '../components/Dashboard';
import '../styles/globals.css';
import { useWidgetProps } from '../utils/useWidgetProps';

const App = () => {
  const props = useWidgetProps({
    weekData: { week: 4, sessionsCompleted: 3, totalSessions: 5, streakDays: 12, nextSession: 'Mañana 7:00 AM' },
  });
  return <Dashboard weekData={props.weekData} />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
