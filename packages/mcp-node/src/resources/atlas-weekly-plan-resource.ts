import { WIDGET_BASE_URL as BASE_URL } from '../config.js';

export const atlasWeeklyPlanResource = {
  definition: {
    uri: 'atlas://weekly-plan/widget',
    name: 'ATLAS Weekly Plan Widget',
    description: 'Plan semanal adaptativo en tarjetas accesibles',
    mimeType: 'text/html+skybridge',
  },
  handler: async () => {
    const widgetUrl = `${BASE_URL}/src/entrypoints/atlas-weekly-board.tsx`;
    const htmlContent = `
<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ATLAS Plan Semanal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${widgetUrl}"></script>
  </body>
  </html>`;

    return {
      contents: [
        { uri: 'atlas://weekly-plan/widget', mimeType: 'text/html+skybridge', text: htmlContent },
      ],
    };
  },
};

