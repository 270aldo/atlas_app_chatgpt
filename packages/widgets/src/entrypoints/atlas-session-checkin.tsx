import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';

const SessionCheckinStub: React.FC = () => (
  <div className="widget-container">
    <h1 className="text-4xl font-bold text-electric-violet">Session Check-in</h1>
    <p className="text-gray-400 mt-4">Widget en desarrollo...</p>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SessionCheckinStub />
  </React.StrictMode>
);
