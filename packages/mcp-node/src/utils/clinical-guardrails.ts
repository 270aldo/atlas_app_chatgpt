export type CheckinPayload = {
  pain: number; // 0-10
  energy: number; // 0-10
  rpe: number; // 1-10
  notes?: string;
};

export type TriageResult = {
  risk: 'low' | 'moderate' | 'high';
  recommendations: string[];
  disclaimer: string;
  triggers: string[]; // matched keywords for transparency
};

const DISCLAIMER =
  'ATLAS es una herramienta educativa. No sustituye consejo médico. Ante síntomas preocupantes, detén la actividad y consulta a un profesional.';

const KEYWORDS = [
  'pecho',
  'toracic',
  'mareo',
  'desmayo',
  'fiebre',
  'vértig',
  'falta de aire',
  'dificultad para respirar',
  'hinchazón',
  'inflamación',
  'dolor agudo',
  'caída',
  'fractura',
];

export function triageCheckin(input: CheckinPayload): TriageResult {
  const { pain, energy, rpe } = input;
  const notes = (input.notes || '').toLowerCase();
  const triggers = KEYWORDS.filter((k) => notes.includes(k));

  // Hard red-flag from keywords
  if (triggers.length > 0) {
    return {
      risk: 'high',
      recommendations: [
        'Detén la sesión y descansa en un lugar seguro.',
        'Contacta a un profesional de la salud o servicios de emergencia según corresponda.',
        'Retoma solo cuando estés asintomado y con aprobación médica si aplica.',
      ],
      disclaimer: DISCLAIMER,
      triggers,
    };
  }

  // Numeric thresholds
  if (pain >= 7 || rpe >= 9 || energy <= 2) {
    return {
      risk: 'high',
      recommendations: [
        'Evita esfuerzos hoy. Realiza movilidad suave y respiración.',
        'Si el dolor persiste o empeora, consulta a un profesional.',
      ],
      disclaimer: DISCLAIMER,
      triggers,
    };
  }

  if (pain >= 4 || rpe >= 7 || energy <= 4) {
    return {
      risk: 'moderate',
      recommendations: [
        'Reduce volumen e intensidad (50–70%).',
        'Prioriza movilidad, equilibrio y técnica sin dolor.',
        'Evalúa cómo te sientes al finalizar (RPE objetivo 4–6).',
      ],
      disclaimer: DISCLAIMER,
      triggers,
    };
  }

  return {
    risk: 'low',
    recommendations: [
      'Puedes continuar con el plan previsto.',
      'Mantén técnica segura y progresión gradual.',
    ],
    disclaimer: DISCLAIMER,
    triggers,
  };
}
