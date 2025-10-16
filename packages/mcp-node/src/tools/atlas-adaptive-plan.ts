import { z } from 'zod';
import { triageCheckin } from '../utils/clinical-guardrails.js';
import { generateAdaptivePlan } from '../utils/adaptive-plan.js';

const AdaptivePlanArgs = z.object({
  pain: z.number().min(0).max(10).default(2),
  energy: z.number().min(0).max(10).default(7),
  rpe: z.number().min(1).max(10).default(5),
  notes: z.string().optional(),
  goal: z.enum(['equilibrio', 'fuerza', 'movilidad']).optional(),
});

export const atlasAdaptivePlanTool = {
  definition: {
    name: 'atlas_adaptive_plan',
    description:
      'Genera un plan semanal adaptativo (7 días) según tu check-in y objetivo (equilibrio, fuerza o movilidad).',
    inputSchema: {
      type: 'object',
      properties: {
        pain: { type: 'number', description: 'Dolor 0-10' },
        energy: { type: 'number', description: 'Energía 0-10' },
        rpe: { type: 'number', description: 'RPE 1-10' },
        notes: { type: 'string', description: 'Notas (síntomas, contexto)' },
        goal: {
          type: 'string',
          enum: ['equilibrio', 'fuerza', 'movilidad'],
          description: 'Objetivo principal opcional',
        },
      },
    },
    _meta: {
      'openai/outputTemplate': 'atlas://weekly-plan/widget',
      'openai/widgetAccessible': true,
      'openai/resultCanProduceWidget': true,
      'openai/toolInvocation/invoking': 'Calculando plan adaptativo…',
      'openai/toolInvocation/invoked': 'Plan listo.',
    },
  },
  handler: async (args: unknown) => {
    const parsed = AdaptivePlanArgs.parse(args ?? {});
    const safety = triageCheckin(parsed);
    const plan = generateAdaptivePlan(parsed, safety, parsed.goal);

    return {
      content: [
        {
          type: 'resource' as const,
          resource: {
            uri: 'atlas://weekly-plan/widget',
            mimeType: 'text/html+skybridge',
            text: '',
          },
        },
      ],
      _meta: {
        'openai/outputTemplate': 'atlas://weekly-plan/widget',
        'openai/widgetAccessible': true,
      },
      structuredContent: { plan, safety },
    };
  },
};

