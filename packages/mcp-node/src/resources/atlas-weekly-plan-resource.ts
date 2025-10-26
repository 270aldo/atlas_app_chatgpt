import { WIDGET_BASE_URL as BASE_URL } from '../config.js';
import { resolveWidgetAssets } from '../utils/resolve-widget-assets.js';

export const atlasWeeklyPlanResource = {
  definition: {
    uri: 'atlas://weekly-plan/widget',
    name: 'ATLAS Weekly Plan Widget',
    description: 'Plan semanal adaptativo en tarjetas accesibles',
    mimeType: 'text/html+skybridge',
  },
  handler: async () => {
    const assets = resolveWidgetAssets('atlas-weekly-board');

    const htmlContent = assets
      ? `<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ATLAS Plan Semanal</title>
  ${Array.isArray(assets.css)
    ? assets.css.map((c) => `<link rel="stylesheet" href="${BASE_URL}/assets/${c}" />`).join('\n  ')
    : assets.css
    ? `<link rel="stylesheet" href="${BASE_URL}/assets/${assets.css}" />`
    : ''}
</head>
<body>
  <div id="root"></div>
  ${assets.js ? `<script type="module" src="${BASE_URL}/assets/${assets.js}"></script>` : ''}
</body>
</html>`
      : `<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ATLAS Plan Semanal</title>
  <script type="module" src="${BASE_URL}/@vite/client"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${BASE_URL}/src/entrypoints/atlas-weekly-board.tsx"></script>
</body>
</html>`;

    return {
      contents: [
        { uri: 'atlas://weekly-plan/widget', mimeType: 'text/html+skybridge', text: htmlContent },
      ],
    };
  },
};
