import { z } from 'zod';
import { triageCheckin } from '../utils/clinical-guardrails.js';

const SessionCheckinArgs = z.object({
  pain: z.number().min(0).max(10).default(2),
  energy: z.number().min(0).max(10).default(7),
  rpe: z.number().min(1).max(10).default(5),
  notes: z.string().optional(),
});

export const atlasSessionCheckinTool = {
  definition: {
    name: 'atlas_session_checkin',
    description:
      'Formulario de check-in de sesión (dolor, energía, RPE, notas) para ajustar el plan',
    inputSchema: {
      type: 'object',
      properties: {
        pain: { type: 'number', description: 'Dolor 0-10' },
        energy: { type: 'number', description: 'Energía 0-10' },
        rpe: { type: 'number', description: 'RPE 1-10' },
        notes: { type: 'string', description: 'Notas opcionales' },
      },
    },
    _meta: {
      'openai/outputTemplate': 'atlas://session-checkin/widget',
      'openai/widgetAccessible': true,
      'openai/resultCanProduceWidget': true,
      'openai/toolInvocation/invoking': 'Abriendo formulario de check-in…',
      'openai/toolInvocation/invoked': 'Formulario listo.',
    },
  },
  handler: async (args: unknown) => {
    const parsed = SessionCheckinArgs.parse(args ?? {});
    const safety = triageCheckin(parsed);
    return {
      content: [
        {
          type: 'resource' as const,
          resource: {
            uri: 'atlas://session-checkin/widget',
            mimeType: 'text/html+skybridge',
            text: '',
          },
        },
      ],
      _meta: {
        'openai/outputTemplate': 'atlas://session-checkin/widget',
        'openai/widgetAccessible': true,
      },
      structuredContent: { defaults: parsed, safety },
    };
  },
};
