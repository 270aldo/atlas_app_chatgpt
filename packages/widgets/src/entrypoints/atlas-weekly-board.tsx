import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/globals.css';
import { WeeklyBoard, DaySession } from '../components/WeeklyBoard';
import { useWidgetProps } from '../utils/useWidgetProps';

const samplePlan: DaySession[] = [
  {
    day: 'Lunes',
    sessions: [
      { title: 'Sentadilla asistida', type: 'Fuerza', durationMin: 20 },
      { title: 'Respiración diafragmática', type: 'Movilidad', durationMin: 10 },
    ],
  },
  {
    day: 'Martes',
    sessions: [
      {
        title: 'Balance unipodal asistido',
        type: 'Balance',
        durationMin: 15,
        notes: 'Apoyo en pared',
      },
      { title: 'Movilidad de cadera', type: 'Movilidad', durationMin: 10 },
    ],
  },
  {
    day: 'Miércoles',
    sessions: [{ title: 'Descanso activo (caminar)', type: 'Descanso', durationMin: 20 }],
  },
  {
    day: 'Jueves',
    sessions: [
      { title: 'Press pared', type: 'Fuerza', durationMin: 20 },
      { title: 'Balance tandem', type: 'Balance', durationMin: 10 },
    ],
  },
  {
    day: 'Viernes',
    sessions: [{ title: 'Movilidad torácica', type: 'Movilidad', durationMin: 15 }],
  },
  {
    day: 'Sábado',
    sessions: [{ title: 'Subir y bajar escalón', type: 'Fuerza', durationMin: 15 }],
  },
  { day: 'Domingo', sessions: [{ title: 'Descanso', type: 'Descanso' }] },
];

const App = () => {
  const props = useWidgetProps<{ weekNumber: number; plan: DaySession[] }>({
    weekNumber: 4,
    plan: samplePlan,
  });
  return <WeeklyBoard weekNumber={props.weekNumber} plan={props.plan} />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
