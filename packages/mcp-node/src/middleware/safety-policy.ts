import { triageCheckin, CheckinPayload, TriageResult } from '../utils/clinical-guardrails.js';

const ALWAYS_ALLOW = new Set(['atlas_session_checkin', 'atlas_safety_review']);
const CORE_SAFE = new Set(['atlas_session_checkin', 'atlas_dashboard', 'atlas_adaptive_plan', 'atlas_safety_review']);

function requiresCheckin(name: string) {
  return !ALWAYS_ALLOW.has(name) && name !== 'atlas_dashboard';
}

function extractCheckinFromArgs(args: unknown): CheckinPayload | undefined {
  if (!args || typeof args !== 'object') return undefined;
  const a = args as Record<string, unknown>;
  const pain = typeof a.pain === 'number' ? a.pain : undefined;
  const energy = typeof a.energy === 'number' ? a.energy : undefined;
  const rpe = typeof a.rpe === 'number' ? a.rpe : undefined;
  const notes = typeof a.notes === 'string' ? a.notes : undefined;
  if (pain == null || energy == null || rpe == null) return undefined;
  return { pain, energy, rpe, notes };
}

function blockResponse(name: string, triage: TriageResult) {
  const text = [
    'Por seguridad, este comando fue bloqueado.',
    `Riesgo detectado: ${triage.risk}`,
    triage.triggers.length ? `Palabras clave: ${triage.triggers.join(', ')}` : '',
    ...triage.recommendations,
    triage.disclaimer,
    'Siguiente paso sugerido: Realiza un check-in o genera un plan de descanso/movilidad.',
  ]
    .filter(Boolean)
    .join('\n- ');
  return {
    content: [{ type: 'text' as const, text: `- ${text}` }],
    structuredContent: { safety: triage, blockedTool: name },
  };
}

function requestCheckin(name: string) {
  const text = [
    'Antes de ejecutar este comando necesitamos un check-in actualizado (dolor, energía, RPE).',
    'Utiliza el tool `atlas_session_checkin` o proporciona esos valores como argumentos.',
    'Una vez registrado, vuelve a intentar para continuar de forma segura.',
  ].join('\n- ');

  return {
    content: [{ type: 'text' as const, text: `- ${text}` }],
    structuredContent: { requiresCheckin: true, requestedTool: name },
  };
}

export async function applySafetyPolicy(
  toolName: string,
  args: unknown,
  proceed: () => Promise<any>
) {
  const checkin = extractCheckinFromArgs(args);

  if (!checkin && requiresCheckin(toolName)) {
    return requestCheckin(toolName);
  }

  const triage = checkin ? triageCheckin(checkin) : undefined;

  // Always allow session check-in
  if (toolName === 'atlas_session_checkin') {
    const res = await proceed();
    if (triage && !res?.structuredContent?.safety) {
      res.structuredContent = { ...(res.structuredContent || {}), safety: triage };
    }
    return res;
  }

  // Block tools if high risk with red flags (except core safe)
  if (triage && triage.risk === 'high' && triage.triggers.length > 0 && !CORE_SAFE.has(toolName)) {
    return blockResponse(toolName, triage);
  }

  // Otherwise proceed and attach safety if available
  const res = await proceed();
  if (triage && !res?.structuredContent?.safety) {
    res.structuredContent = { ...(res.structuredContent || {}), safety: triage };
  }
  return res;
}
