import { WIDGET_BASE_URL as BASE_URL } from '../config.js';
import { resolveWidgetAssets } from '../utils/resolve-widget-assets.js';

export const atlasSessionCheckinResource = {
  definition: {
    uri: 'atlas://session-checkin/widget',
    name: 'ATLAS Session Check-in Widget',
    description: 'Formulario accesible de check-in de sesión',
    mimeType: 'text/html+skybridge',
  },
  handler: async () => {
    const assets = resolveWidgetAssets('atlas-session-checkin');

    const htmlContent = assets
      ? `<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ATLAS Session Check-in</title>
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
  <title>ATLAS Session Check-in</title>
  <script type="module" src="${BASE_URL}/@vite/client"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${BASE_URL}/src/entrypoints/atlas-session-checkin.tsx"></script>
</body>
</html>`;

    return {
      contents: [
        {
          uri: 'atlas://session-checkin/widget',
          mimeType: 'text/html+skybridge',
          text: htmlContent,
        },
      ],
    };
  },
};
