import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to widgets dist assets directory
const assetsDir = path.resolve(__dirname, '../../widgets/dist/assets');

export type WidgetAssets = { js?: string; css?: string | string[] };

export function resolveWidgetAssets(entryName: string): WidgetAssets | null {
  try {
    if (!fs.existsSync(assetsDir)) return null;
    const files = fs.readdirSync(assetsDir);

    const js = files.find((f) => f.startsWith(`${entryName}.`) && f.endsWith('.js'));
    const cssCandidates = files.filter((f) => f.startsWith(`${entryName}.`) && f.endsWith('.css'));

    if (!js && cssCandidates.length === 0) return null;

    return {
      js: js || undefined,
      css:
        cssCandidates.length === 0
          ? undefined
          : cssCandidates.length === 1
            ? cssCandidates[0]
            : cssCandidates,
    };
  } catch {
    return null;
  }
}
