import { z } from 'zod';

const WeeklyBoardArgsSchema = z.object({
  weekNumber: z.number().optional().describe('Número de semana a mostrar'),
});

export const atlasWeeklyBoardTool = {
  definition: {
    name: 'atlas_weekly_board',
    description: 'Muestra el plan semanal (Weekly Board) de ATLAS',
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
      'openai/outputTemplate': 'atlas://weekly-board/widget',
      'openai/widgetAccessible': true,
      'openai/resultCanProduceWidget': true,
      'openai/toolInvocation/invoking': 'Generando Weekly Board…',
      'openai/toolInvocation/invoked': 'Weekly Board listo.',
    },
  },
  handler: async (args: unknown) => {
    const parsed = WeeklyBoardArgsSchema.parse(args);
    const week = parsed.weekNumber || 4;

    return {
      content: [
        {
          type: 'resource' as const,
          resource: {
            uri: 'atlas://weekly-board/widget',
            mimeType: 'text/html+skybridge',
            text: '',
          },
        },
      ],
      _meta: {
        'openai/outputTemplate': 'atlas://weekly-board/widget',
        'openai/widgetAccessible': true,
      },
      structuredContent: { week },
    };
  },
};