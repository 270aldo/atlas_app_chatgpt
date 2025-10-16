import React from 'react';

export const ReadAloudButton: React.FC<{ text: string; label?: string }> = ({ text, label }) => {
  const speak = () => {
    try {
      if (!('speechSynthesis' in window)) {
        alert('Lectura en voz no disponible en este dispositivo.');
        return;
      }
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'es-MX';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch (_e) {
      // ignore
    }
  };

  return (
    <button onClick={speak} className="btn-primary" aria-label={label || 'Leer en voz alta'}>
      {label || 'Leer en voz alta'}
    </button>
  );
};
