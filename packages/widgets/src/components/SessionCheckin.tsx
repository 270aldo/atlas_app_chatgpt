import React from 'react';
import { useWidgetProps } from '../utils/useWidgetProps';
import { SafetyNotice } from './SafetyNotice';
import { ConsentBanner } from './ConsentBanner';
import { markCheckinNow } from './DailyNudge';

interface SessionCheckinProps {
  defaults?: {
    pain?: number; // 0-10
    energy?: number; // 0-10
    rpe?: number; // 1-10
    notes?: string;
  };
  safety?: {
    risk?: 'low' | 'moderate' | 'high';
    recommendations?: string[];
    disclaimer?: string;
  };
}

const defaultProps: SessionCheckinProps = {
  defaults: {
    pain: 2,
    energy: 7,
    rpe: 5,
    notes: '',
  },
};

export const SessionCheckin: React.FC<SessionCheckinProps> = (props) => {
  const { defaults = defaultProps.defaults, safety } = useWidgetProps<SessionCheckinProps>(props);
  const [pain, setPain] = React.useState<number>(defaults?.pain ?? 2);
  const [energy, setEnergy] = React.useState<number>(defaults?.energy ?? 7);
  const [rpe, setRpe] = React.useState<number>(defaults?.rpe ?? 5);
  const [notes, setNotes] = React.useState<string>(defaults?.notes ?? '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('checkin', { pain, energy, rpe, notes });
    markCheckinNow();
    alert('¡Check-in enviado! Puedes cerrar el widget.');
  };

  return (
    <div className="widget-container">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-electric-violet">Check-in de Sesión</h1>
          <p className="text-gray-400 mt-1">Responde para ajustar tu plan de forma segura</p>
        </header>
        <ConsentBanner />
        <SafetyNotice
          risk={safety?.risk}
          recommendations={safety?.recommendations}
          disclaimer={safety?.disclaimer}
        />

        <form onSubmit={submit} className="space-y-6" aria-label="Formulario de check-in de sesión">
          <div className="card-premium">
            <label className="block text-lg mb-2" htmlFor="pain">
              Dolor actual (0-10)
            </label>
            <input
              id="pain"
              type="range"
              min={0}
              max={10}
              value={pain}
              onChange={(e) => setPain(Number(e.target.value))}
              className="w-full"
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={pain}
            />
            <div className="mt-2 text-right text-gray-300 text-xl">{pain}</div>
          </div>

          <div className="card-premium">
            <label className="block text-lg mb-2" htmlFor="energy">
              Energía (0-10)
            </label>
            <input
              id="energy"
              type="range"
              min={0}
              max={10}
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full"
              aria-valuemin={0}
              aria-valuemax={10}
              aria-valuenow={energy}
            />
            <div className="mt-2 text-right text-gray-300 text-xl">{energy}</div>
          </div>

          <div className="card-premium">
            <label className="block text-lg mb-2" htmlFor="rpe">
              RPE (esfuerzo percibido 1-10)
            </label>
            <input
              id="rpe"
              type="range"
              min={1}
              max={10}
              value={rpe}
              onChange={(e) => setRpe(Number(e.target.value))}
              className="w-full"
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={rpe}
            />
            <div className="mt-2 text-right text-gray-300 text-xl">{rpe}</div>
          </div>

          <div className="card-premium">
            <label className="block text-lg mb-2" htmlFor="notes">
              Notas
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-gray-900 border-gray-800 rounded-lg p-3 text-gray-200"
              rows={4}
              placeholder="¿Algo que reportar?"
            />
          </div>

          <div className="flex justify-center">
            <button type="submit" className="btn-primary" aria-label="Enviar check-in">
              Enviar check-in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
