import type { AppData } from '../types';

export type ValidationError = { field: string; message: string };

export function validateImport(data: unknown): { errors: ValidationError[]; data: AppData | null } {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== 'object') {
    return { errors: [{ field: 'root', message: 'Invalid JSON structure' }], data: null };
  }

  const d = data as Record<string, unknown>;

  if (!Array.isArray(d.pokemon)) errors.push({ field: 'pokemon', message: 'Must be an array' });
  if (!Array.isArray(d.furniture)) errors.push({ field: 'furniture', message: 'Must be an array' });
  if (!Array.isArray(d.houseGroups)) errors.push({ field: 'houseGroups', message: 'Must be an array' });
  if (!Array.isArray(d.furnitureCategories)) errors.push({ field: 'furnitureCategories', message: 'Must be an array' });

  if (errors.length) return { errors, data: null };

  const pokemonIds = new Set<string>();
  for (const p of d.pokemon as unknown[]) {
    const poke = p as Record<string, unknown>;
    if (!poke.id || typeof poke.id !== 'string') {
      errors.push({ field: 'pokemon', message: 'Each Pokemon must have a string id' });
      break;
    }
    if (pokemonIds.has(poke.id)) {
      errors.push({ field: 'pokemon', message: `Duplicate Pokemon id: ${poke.id}` });
    }
    pokemonIds.add(poke.id);
    if (!poke.idealHabitat) {
      errors.push({ field: 'pokemon', message: `Pokemon ${poke.id} is missing idealHabitat` });
    }
    if (!Array.isArray(poke.favorites)) {
      errors.push({ field: 'pokemon', message: `Pokemon ${poke.id} favorites must be an array` });
    }
  }

  const furnitureIds = new Set<string>();
  for (const f of d.furniture as unknown[]) {
    const furn = f as Record<string, unknown>;
    if (!furn.id || typeof furn.id !== 'string') {
      errors.push({ field: 'furniture', message: 'Each furniture item must have a string id' });
      break;
    }
    if (furnitureIds.has(furn.id)) {
      errors.push({ field: 'furniture', message: `Duplicate furniture id: ${furn.id}` });
    }
    furnitureIds.add(furn.id);
    if (!furn.category) {
      errors.push({ field: 'furniture', message: `Furniture ${furn.id} is missing category` });
    }
  }

  if (errors.length) return { errors, data: null };

  return { errors: [], data: d as unknown as AppData };
}
