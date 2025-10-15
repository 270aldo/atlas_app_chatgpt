import { z } from 'zod';

const AtlasDashboardArgsSchema = z.object({
  weekNumber: z.number().optional().describe('Número de semana a mostrar'),
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
      structuredContent: { week },
    };
  },
};
