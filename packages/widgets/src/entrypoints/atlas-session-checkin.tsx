import React from 'react';
import ReactDOM from 'react-dom/client';
import { SessionCheckin } from '../components/SessionCheckin';
import '../styles/globals.css';

// Default props - will be overridden by window.openai.toolOutput if available
const defaultProps = {
  defaults: {
    pain: 2,
    energy: 7,
    rpe: 5,
    notes: '',
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SessionCheckin {...defaultProps} />
  </React.StrictMode>
);
