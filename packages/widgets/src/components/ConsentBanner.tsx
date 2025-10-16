import React from 'react';

const CONSENT_KEY = 'atlas_consent_v1';

export const ConsentBanner: React.FC = () => {
  const [accepted, setAccepted] = React.useState<boolean>(true);

  React.useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(CONSENT_KEY) : '1';
    setAccepted(!!stored);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, '1');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="border border-gray-700 bg-gray-900 rounded-lg p-4 mb-4">
      <p className="text-sm">
        ATLAS es una herramienta educativa y de bienestar. No brinda diagnóstico ni reemplaza la
        atención médica profesional. Si presentas síntomas preocupantes, detén la actividad y
        consulta a un profesional.
      </p>
      <div className="mt-3 flex justify-end">
        <button className="btn-primary" onClick={accept} aria-label="Aceptar aviso de uso">
          Entendido
        </button>
      </div>
    </div>
  );
};

