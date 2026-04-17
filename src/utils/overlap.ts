import type { Pokemon, HouseAnalysis, Habitat } from '../types';

export function favoritesOverlap(a: Pokemon, b: Pokemon) {
  const setB = new Set(b.favorites);
  const setA = new Set(a.favorites);
  return {
    shared: a.favorites.filter(f => setB.has(f)),
    onlyA: a.favorites.filter(f => !setB.has(f)),
    onlyB: b.favorites.filter(f => !setA.has(f)),
  };
}

export function analyzeHouse(members: Pokemon[]): HouseAnalysis {
  if (members.length === 0) {
    return { sharedFavorites: [], partialFavorites: [], outlierFavorites: [], habitatBreakdown: {} as Record<Habitat, string[]>, cohesionScore: 0 };
  }

  const favCounts = new Map<string, number>();
  for (const p of members) {
    for (const fav of p.favorites) {
      favCounts.set(fav, (favCounts.get(fav) ?? 0) + 1);
    }
  }

  const n = members.length;
  const sharedFavorites: string[] = [];
  const partialFavorites: string[] = [];
  const outlierFavorites: string[] = [];

  for (const [fav, count] of favCounts) {
    if (count === n) sharedFavorites.push(fav);
    else if (count >= Math.max(2, Math.ceil(n / 2))) partialFavorites.push(fav);
    else outlierFavorites.push(fav);
  }

  const habitatBreakdown: Partial<Record<Habitat, string[]>> = {};
  for (const p of members) {
    if (!habitatBreakdown[p.idealHabitat]) habitatBreakdown[p.idealHabitat] = [];
    habitatBreakdown[p.idealHabitat]!.push(p.id);
  }

  return {
    sharedFavorites,
    partialFavorites,
    outlierFavorites,
    habitatBreakdown: habitatBreakdown as Record<Habitat, string[]>,
    cohesionScore: 0,
  };
}
