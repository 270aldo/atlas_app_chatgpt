import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';
import { WeeklyPlan } from '../components/WeeklyPlan';

const defaultProps = {};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WeeklyPlan {...defaultProps} />
  </React.StrictMode>
);
