import React from 'react';

const KEY = 'atlas_last_checkin_at';

export const DailyNudge: React.FC = () => {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    try {
      const ts = localStorage.getItem(KEY);
      if (!ts) return setShow(true);
      const last = Number(ts);
      const hours = (Date.now() - last) / (1000 * 60 * 60);
      setShow(hours >= 24);
    } catch (_e) {
      // ignore
    }
  }, []);

  if (!show) return null;

  const copyPrompt = async () => {
    const text = 'Abrir check-in de sesión';
    try {
      await navigator.clipboard.writeText(text);
      alert('Copiado: pega en el chat para abrir el check-in');
    } catch {
      // fallback
      prompt('Copia este texto y pégalo en el chat:', text);
    }
  };

  return (
    <div className="border border-yellow-700 bg-yellow-900/30 text-yellow-200 rounded-lg p-4 mb-4" role="note">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-sm">Hace más de un día que no registras tu estado. ¿Hacemos un check‑in rápido?</p>
        <div className="flex gap-2">
          <button onClick={copyPrompt} className="btn-primary" aria-label="Abrir check-in">
            Hacer check‑in
          </button>
        </div>
      </div>
    </div>
  );
};

export function markCheckinNow() {
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch (_e) {
    // ignore
  }
}

