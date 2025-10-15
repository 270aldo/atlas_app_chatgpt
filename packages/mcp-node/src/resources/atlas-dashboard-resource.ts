export const atlasDashboardResource = {
  definition: {
    uri: 'atlas://dashboard/widget',
    name: 'ATLAS Dashboard Widget',
    description: 'Widget HTML del dashboard semanal',
    mimeType: 'text/html+skybridge',
  },
  handler: async () => {
    const widgetUrl = 'http://localhost:4444/src/entrypoints/atlas-dashboard.tsx';

    const htmlContent = `
<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ATLAS Dashboard</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${widgetUrl}"></script>
</body>
</html>`;

    return {
      contents: [
        {
          uri: 'atlas://dashboard/widget',
          mimeType: 'text/html+skybridge',
          text: htmlContent,
        },
      ],
    };
  },
};
