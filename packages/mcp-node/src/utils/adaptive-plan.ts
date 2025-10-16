import { CheckinPayload, TriageResult } from './clinical-guardrails.js';

export type PlanItem = {
  day: string; // e.g., 'Lunes'
  title: string; // e.g., 'Fuerza tren inferior'
  intensity: 'muy baja' | 'baja' | 'moderada';
  focus: string[]; // e.g., ['movilidad', 'equilibrio']
  details: string; // short instruction
};

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function generateAdaptivePlan(
  checkin: CheckinPayload,
  triage: TriageResult,
  goal?: 'equilibrio' | 'fuerza' | 'movilidad'
): PlanItem[] {
  // Base templates per risk
  const low: PlanItem[] = [
    {
      day: 'Lunes',
      title: 'Fuerza tren inferior',
      intensity: 'moderada',
      focus: ['fuerza'],
      details: 'Sentadillas asistidas, elevación de talones, 2–3 series.',
    },
    {
      day: 'Martes',
      title: 'Movilidad + Respiración',
      intensity: 'baja',
      focus: ['movilidad'],
      details: 'Cadera, hombros, respiración 10–12 min.',
    },
    {
      day: 'Miércoles',
      title: 'Equilibrio básico',
      intensity: 'baja',
      focus: ['equilibrio'],
      details: 'Apoyo unipodal cerca de apoyo seguro.',
    },
    {
      day: 'Jueves',
      title: 'Fuerza tren superior',
      intensity: 'moderada',
      focus: ['fuerza'],
      details: 'Empuje pared, remo banda, 2–3 series.',
    },
    {
      day: 'Viernes',
      title: 'Caminata cómoda',
      intensity: 'baja',
      focus: ['resistencia'],
      details: '10–20 min a ritmo conversacional.',
    },
    {
      day: 'Sábado',
      title: 'Movilidad suave',
      intensity: 'baja',
      focus: ['movilidad'],
      details: 'Columna, tobillos, cadera 10 min.',
    },
    {
      day: 'Domingo',
      title: 'Descanso activo',
      intensity: 'baja',
      focus: ['recuperación'],
      details: 'Paseo breve o estiramientos ligeros.',
    },
  ];

  const moderate: PlanItem[] = [
    {
      day: 'Lunes',
      title: 'Movilidad + Técnica',
      intensity: 'baja',
      focus: ['movilidad'],
      details: 'Revisión técnica sin dolor (50–70%).',
    },
    {
      day: 'Martes',
      title: 'Equilibrio guiado',
      intensity: 'baja',
      focus: ['equilibrio'],
      details: 'Unipodal con apoyo, 3×20–30s por lado.',
    },
    {
      day: 'Miércoles',
      title: 'Caminata suave',
      intensity: 'baja',
      focus: ['resistencia'],
      details: '8–15 min cómodos.',
    },
    {
      day: 'Jueves',
      title: 'Fuerza ligera',
      intensity: 'baja',
      focus: ['fuerza'],
      details: '1–2 series, RPE 4–6, sin dolor.',
    },
    {
      day: 'Viernes',
      title: 'Movilidad',
      intensity: 'baja',
      focus: ['movilidad'],
      details: 'Cadera/columna 10 min.',
    },
    {
      day: 'Sábado',
      title: 'Equilibrio + Core',
      intensity: 'baja',
      focus: ['equilibrio'],
      details: 'Base ancha, apoyo cercano.',
    },
    {
      day: 'Domingo',
      title: 'Descanso',
      intensity: 'baja',
      focus: ['recuperación'],
      details: 'Hidratación, sueño.',
    },
  ];

  const high: PlanItem[] = DAYS.map((d) => ({
    day: d,
    title: 'Movilidad suave y descanso',
    intensity: 'muy baja',
    focus: ['recuperación'],
    details: 'Detén esfuerzos. Movilidad suave si te sientes seguro. Consulta si persiste.',
  }));

  let plan = triage.risk === 'high' ? high : triage.risk === 'moderate' ? moderate : low;

  // Goal-based emphasis
  if (goal === 'equilibrio') {
    plan = plan.map((p, i) =>
      i % 2 === 1
        ? {
            ...p,
            title: 'Equilibrio + apoyo',
            focus: Array.from(new Set([...p.focus, 'equilibrio'])),
          }
        : p
    );
  } else if (goal === 'fuerza') {
    plan = plan.map((p, i) =>
      i % 2 === 0
        ? {
            ...p,
            title: p.title.includes('Fuerza') ? p.title : 'Fuerza técnica',
            focus: Array.from(new Set([...p.focus, 'fuerza'])),
          }
        : p
    );
  } else if (goal === 'movilidad') {
    plan = plan.map((p) => ({ ...p, focus: Array.from(new Set([...p.focus, 'movilidad'])) }));
  }

  // Personal tweak by pain/energy/rpe
  if (checkin.pain >= 4) {
    plan = plan.map((p) => ({ ...p, details: p.details + ' (evita dolor)' }));
  }
  if (checkin.energy <= 4) {
    plan = plan.map((p) => ({
      ...p,
      intensity: p.intensity === 'moderada' ? 'baja' : p.intensity,
    }));
  }

  // Keep ordering by DAYS
  const byDay = new Map(plan.map((p) => [p.day, p] as const));
  return DAYS.map((d) => byDay.get(d)!).filter(Boolean);
}
