export const atlasWeeklyBoardResource = {
  definition: {
    uri: 'atlas://weekly-board/widget',
    name: 'ATLAS Weekly Board Widget',
    description: 'Widget HTML del plan semanal',
    mimeType: 'text/html+skybridge',
  },
  handler: async () => {
    const widgetUrl = 'http://localhost:4444/src/entrypoints/atlas-weekly-board.tsx';

    const htmlContent = `
<!DOCTYPE html>
<html lang="es" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ATLAS Weekly Board</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${widgetUrl}"></script>
</body>
</html>`;

    return {
      contents: [
        {
          uri: 'atlas://weekly-board/widget',
          mimeType: 'text/html+skybridge',
          text: htmlContent,
        },
      ],
    };
  },
};