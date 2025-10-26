import React from 'react';
import { useWidgetProps } from '../utils/useWidgetProps';
import { SafetyNotice } from './SafetyNotice';
import { ConsentBanner } from './ConsentBanner';

type PlanItem = {
  day: string;
  title: string;
  intensity: 'muy baja' | 'baja' | 'moderada';
  focus: string[];
  details: string;
};

interface WeeklyPlanProps {
  plan?: PlanItem[];
  safety?: { risk?: 'low' | 'moderate' | 'high'; recommendations?: string[]; disclaimer?: string };
  [key: string]: unknown;
}

const defaults: WeeklyPlanProps = {
  plan: [
    {
      day: 'Lunes',
      title: 'Movilidad',
      intensity: 'baja',
      focus: ['movilidad'],
      details: '5–10 min',
    },
    {
      day: 'Martes',
      title: 'Equilibrio',
      intensity: 'baja',
      focus: ['equilibrio'],
      details: 'Apoyo seguro',
    },
    {
      day: 'Miércoles',
      title: 'Fuerza técnica',
      intensity: 'baja',
      focus: ['fuerza'],
      details: '1–2 series',
    },
    {
      day: 'Jueves',
      title: 'Movilidad',
      intensity: 'baja',
      focus: ['movilidad'],
      details: 'Respiración + cadera',
    },
    {
      day: 'Viernes',
      title: 'Caminata',
      intensity: 'baja',
      focus: ['resistencia'],
      details: 'Ritmo conversacional',
    },
    {
      day: 'Sábado',
      title: 'Movilidad',
      intensity: 'baja',
      focus: ['movilidad'],
      details: 'Columna suave',
    },
    {
      day: 'Domingo',
      title: 'Descanso',
      intensity: 'baja',
      focus: ['recuperación'],
      details: 'Sueño e hidratación',
    },
  ],
};

export const WeeklyPlan: React.FC<WeeklyPlanProps> = (props) => {
  const { plan = defaults.plan!, safety } = useWidgetProps<WeeklyPlanProps>(props);

  return (
    <div className="widget-container">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-electric-violet">Plan semanal adaptativo</h1>
          <p className="text-gray-400">Acciones simples, seguras y efectivas</p>
        </header>

        <ConsentBanner />
        <SafetyNotice
          risk={safety?.risk}
          recommendations={safety?.recommendations}
          disclaimer={safety?.disclaimer}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plan?.map((item, idx) => (
            <article
              key={`${item.day}-${idx}`}
              className="card-premium"
              aria-label={`${item.day}: ${item.title}`}
            >
              <h3 className="text-xl font-semibold text-gray-100">{item.day}</h3>
              <p className="text-lg text-electric-violet mt-1">{item.title}</p>
              <p className="text-sm text-gray-400 mt-1">Intensidad: {item.intensity}</p>
              <p className="text-sm text-gray-300 mt-2">{item.details}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.focus.map((f, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-lg bg-gray-800 border border-gray-700"
                    aria-label={`Enfoque: ${f}`}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
