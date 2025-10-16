import React from 'react';

export interface DaySession {
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
  sessions: Array<{
    title: string;
    type: 'Fuerza' | 'Balance' | 'Movilidad' | 'Descanso';
    durationMin?: number;
    notes?: string;
    done?: boolean;
  }>;
}

export interface WeeklyBoardProps {
  weekNumber: number;
  plan: DaySession[];
}

const typeColor: Record<DaySession['sessions'][number]['type'], string> = {
  Fuerza: 'bg-electric-violet/20 text-electric-violet',
  Balance: 'bg-deep-purple/20 text-deep-purple',
  Movilidad: 'bg-emerald-600/20 text-emerald-300',
  Descanso: 'bg-gray-700/40 text-gray-300',
};

export const WeeklyBoard: React.FC<WeeklyBoardProps> = ({ weekNumber, plan }) => {
  return (
    <div className="widget-container">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-electric-violet">
            Plan Semanal — Semana {weekNumber}
          </h1>
          <p className="text-gray-400 mt-1">Equilibrio entre fuerza, balance y movilidad</p>
        </header>

        <div
          className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4"
          role="table"
          aria-label={`Plan de la semana ${weekNumber}`}
        >
          {plan.map((d) => (
            <section
              key={d.day}
              role="rowgroup"
              aria-labelledby={`day-${d.day}`}
              className="card-premium"
            >
              <h2 id={`day-${d.day}`} className="text-lg font-semibold mb-3 text-gray-200">
                {d.day}
              </h2>
              <ul className="space-y-3" role="row">
                {d.sessions.map((s, i) => (
                  <li
                    key={i}
                    className="p-3 rounded-lg border border-gray-800 bg-gray-900/60"
                    role="cell"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-md font-semibold ${typeColor[s.type]}`}
                      >
                        {s.type}
                      </span>
                      {typeof s.durationMin === 'number' && (
                        <span className="text-xs text-gray-400" aria-label="duración">
                          {s.durationMin} min
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-gray-200 font-medium">{s.title}</p>
                    {s.notes && <p className="mt-1 text-sm text-gray-400">{s.notes}</p>}
                    <div className="mt-2">
                      <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="checkbox"
                          defaultChecked={Boolean(s.done)}
                          className="h-4 w-4 rounded border-gray-700 bg-gray-800"
                          aria-label={`Marcar ${s.title} como hecho`}
                        />
                        Hecho
                      </label>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-center">
          <button className="btn-primary" aria-label="Generar sesión de hoy">
            Iniciar sesión de hoy
          </button>
        </div>
      </div>
    </div>
  );
};
