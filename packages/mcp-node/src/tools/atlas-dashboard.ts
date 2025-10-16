import { z } from 'zod';
import { triageCheckin } from '../utils/clinical-guardrails.js';

const AtlasDashboardArgsSchema = z.object({
  weekNumber: z.number().optional().describe('Número de semana a mostrar'),
  // Datos de check-in opcionales para ajustar recomendaciones en el dashboard
  pain: z.number().min(0).max(10).optional(),
  energy: z.number().min(0).max(10).optional(),
  rpe: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

export const atlasDashboardTool = {
  definition: {
    name: 'atlas_dashboard',
    description: 'Muestra el dashboard semanal de progreso ATLAS del usuario',
    inputSchema: {
      type: 'object',
      properties: {
        weekNumber: {
          type: 'number',
          description: 'Número de semana a mostrar (opcional, por defecto la actual)',
        },
      },
    },
    _meta: {
      'openai/outputTemplate': 'atlas://dashboard/widget',
      'openai/widgetAccessible': true,
      'openai/resultCanProduceWidget': true,
      'openai/toolInvocation/invoking': 'Generando dashboard de ATLAS…',
      'openai/toolInvocation/invoked': 'Dashboard actualizado.',
    },
  },
  handler: async (args: unknown) => {
    const parsed = AtlasDashboardArgsSchema.parse(args);
    const week = parsed.weekNumber || 4;
    const safety =
      parsed.pain != null && parsed.energy != null && parsed.rpe != null
        ? triageCheckin({
            pain: parsed.pain,
            energy: parsed.energy,
            rpe: parsed.rpe,
            notes: parsed.notes,
          })
        : undefined;

    // TODO: Obtener datos reales desde tu base de datos
    // Por ahora, usamos datos de ejemplo dinámicos basados en la semana
    const weekData = {
      week,
      sessionsCompleted: Math.min(week, 3),
      totalSessions: 3,
      streakDays: week * 2,
      nextSession: week % 2 === 0 ? 'Mañana 7:00 AM' : 'Hoy 4:00 PM',
    };

    return {
      content: [
        {
          type: 'resource' as const,
          resource: {
            uri: 'atlas://dashboard/widget',
            mimeType: 'text/html+skybridge',
            text: '',
          },
        },
      ],
      _meta: {
        'openai/outputTemplate': 'atlas://dashboard/widget',
        'openai/widgetAccessible': true,
      },
      structuredContent: { weekData, safety },
    };
  },
};
