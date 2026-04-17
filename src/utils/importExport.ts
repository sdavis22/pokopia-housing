import type { AppData } from '../types';
import { validateImport } from './validation';

export type ImportResult = { success: true; data: AppData } | { success: false; errors: string[] };

export function parseImport(jsonText: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    return { success: false, errors: ['Invalid JSON — could not parse file'] };
  }

  const { errors, data } = validateImport(parsed);
  if (errors.length || !data) {
    return { success: false, errors: errors.map(e => `${e.field}: ${e.message}`) };
  }
  return { success: true, data };
}

export function exportToJson(data: AppData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pokopia-data.json';
  a.click();
  URL.revokeObjectURL(url);
}
