import { z } from 'zod';
import { triageCheckin } from '../utils/clinical-guardrails.js';

const SafetyReviewArgs = z.object({
  pain: z.number().min(0).max(10).default(2),
  energy: z.number().min(0).max(10).default(7),
  rpe: z.number().min(1).max(10).default(5),
  notes: z.string().optional(),
  targetToolName: z.string().optional(),
});

export const atlasSafetyReviewTool = {
  definition: {
    name: 'atlas_safety_review',
    description:
      'Revisión de seguridad clínica antes de ejecutar otras acciones. Recomienda bloquear, posponer o continuar.',
    inputSchema: {
      type: 'object',
      properties: {
        pain: { type: 'number', description: 'Dolor 0-10' },
        energy: { type: 'number', description: 'Energía 0-10' },
        rpe: { type: 'number', description: 'RPE 1-10' },
        notes: { type: 'string', description: 'Notas (síntomas, contexto)' },
        targetToolName: { type: 'string', description: 'Tool objetivo opcional' },
      },
    },
    _meta: {
      'openai/toolInvocation/invoking': 'Revisando seguridad…',
      'openai/toolInvocation/invoked': 'Revisión completada.',
    },
  },
  handler: async (args: unknown) => {
    const parsed = SafetyReviewArgs.parse(args ?? {});
    const safety = triageCheckin(parsed);

    const block = safety.risk === 'high' && safety.triggers.length > 0;
    const gate = block ? 'block' : safety.risk === 'moderate' ? 'defer' : 'allow';

    const guidance = [
      gate === 'block'
        ? 'Se recomienda bloquear herramientas intensas y priorizar descanso/movilidad. Usa el check‑in o plan adaptativo.'
        : gate === 'defer'
          ? 'Se recomienda posponer acciones intensas y reducir volumen (50–70%).'
          : 'Puedes continuar con precaución y técnica segura.',
      ...safety.recommendations,
      safety.disclaimer,
    ]
      .filter(Boolean)
      .join('\n- ');

    return {
      content: [{ type: 'text' as const, text: `- ${guidance}` }],
      structuredContent: { safety, gate, targetToolName: parsed.targetToolName },
    };
  },
};
