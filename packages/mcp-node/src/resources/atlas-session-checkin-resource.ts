export const atlasSessionCheckinResource = {
  definition: {
    uri: 'atlas://session-checkin/widget',
    name: 'ATLAS Session Check-in Widget',
    description: 'Formulario accesible de check-in de sesión',
    mimeType: 'text/html+skybridge',
  },
  handler: async () => {
    const widgetUrl = 'http://localhost:4444/src/entrypoints/atlas-session-checkin.tsx';

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
