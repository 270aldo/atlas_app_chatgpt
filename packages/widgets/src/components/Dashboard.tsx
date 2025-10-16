import React from 'react';

interface DashboardProps {
  weekData: {
    week: number;
    sessionsCompleted: number;
    totalSessions: number;
    streakDays: number;
    nextSession: string;
  };
}

export const Dashboard: React.FC<DashboardProps> = ({ weekData }) => {
  const progressPercent = (weekData.sessionsCompleted / weekData.totalSessions) * 100;

  return (
    <div className="widget-container">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-electric-violet mb-2">ATLAS Dashboard</h1>
          <p className="text-xl text-gray-400">Semana {weekData.week} - Tu progreso semanal</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-premium">
            <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-2">
              Sesiones Completadas
            </h2>
            <p className="text-5xl font-bold text-electric-violet">
              {weekData.sessionsCompleted}
              <span className="text-2xl text-gray-500">/{weekData.totalSessions}</span>
            </p>
          </div>
          <div className="card-premium">
            <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Racha Actual</h2>
            <p className="text-5xl font-bold text-deep-purple">
              {weekData.streakDays}
              <span className="text-2xl text-gray-500"> días</span>
            </p>
          </div>
          <div className="card-premium">
            <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Próxima Sesión</h2>
            <p className="text-2xl font-semibold text-gray-300 mt-4">{weekData.nextSession}</p>
          </div>
        </div>

        <div className="card-premium mb-8">
          <h2 className="text-xl font-semibold mb-4">Progreso Semanal</h2>
          <div className="relative w-full h-8 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-electric-violet to-deep-purple transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-right text-gray-400 mt-2 text-lg">
            {progressPercent.toFixed(0)}% completado
          </p>
        </div>

        <div className="flex justify-center">
          <button className="btn-primary" aria-label="Ir a sesión de hoy">
            Continuar con mi sesión
          </button>
        </div>
      </div>
    </div>
  );
};
