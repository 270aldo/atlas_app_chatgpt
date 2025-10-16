import React from 'react';
import { ReadAloudButton } from './ReadAloudButton';

type Risk = 'low' | 'moderate' | 'high';

export interface SafetyNoticeProps {
  risk?: Risk;
  recommendations?: string[];
  disclaimer?: string;
}

export const SafetyNotice: React.FC<SafetyNoticeProps> = ({
  risk = 'low',
  recommendations = [],
  disclaimer,
}) => {
  const tone =
    risk === 'high'
      ? 'border-red-700 bg-red-900/30 text-red-200'
      : risk === 'moderate'
        ? 'border-yellow-700 bg-yellow-900/30 text-yellow-200'
        : 'border-gray-700 bg-gray-900 text-gray-200';

  const title = risk === 'high' ? 'Atención' : risk === 'moderate' ? 'Precaución' : 'Información';

  return (
    <div className={`border rounded-lg p-4 mb-4 ${tone}`} role={risk === 'high' ? 'alert' : 'note'}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg font-semibold">{title}</span>
        <span className="text-xs uppercase tracking-wide opacity-75">Seguridad</span>
      </div>
      {recommendations.length > 0 && (
        <ul className="list-disc pl-5 space-y-1">
          {recommendations.map((r, i) => (
            <li key={i} className="text-sm">
              {r}
            </li>
          ))}
        </ul>
      )}
      {disclaimer && <p className="text-xs mt-3 opacity-80">{disclaimer}</p>}
      <div className="mt-3">
        <ReadAloudButton
          text={[...recommendations, disclaimer].filter(Boolean).join('. ')}
          label="Leérmelo"
        />
      </div>
    </div>
  );
};
