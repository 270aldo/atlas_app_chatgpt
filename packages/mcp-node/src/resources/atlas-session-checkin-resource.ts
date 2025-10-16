import { WIDGET_BASE_URL as BASE_URL } from '../config.js';

export const atlasSessionCheckinResource = {
  definition: {
    uri: 'atlas://session-checkin/widget',
    name: 'ATLAS Session Check-in Widget',
    description: 'Formulario accesible de check-in de sesión',
    mimeType: 'text/html+skybridge',
  },
  handler: async () => {
    // En desarrollo: usa Vite dev server (sirve .tsx directamente con HMR)
    // En producción: apuntaría a /dist/assets/atlas-session-checkin.[hash].js
    const widgetUrl = `${BASE_URL}/src/entrypoints/atlas-session-checkin.tsx`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ATLAS Session Check-in</title>
</head>
<body>
  <div id=\"root\"></div>
  <script type=\"module\" src=\"${widgetUrl}\"></script>
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
