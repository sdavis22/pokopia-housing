import { DEFAULT_SCORING_CONFIG } from '../config/scoring';
import type { Pokemon, Furniture, HouseAnalysis, FurnitureScore, ScoringConfig } from '../types';
import { analyzeHouse, favoritesOverlap } from './overlap';

export function pokemonCompatibility(
  a: Pokemon,
  b: Pokemon,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): number {
  const { shared } = favoritesOverlap(a, b);
  const favoriteScore = shared.length * config.sharedFavoritePoints;
  const habitatBonus = a.idealHabitat === b.idealHabitat ? config.sameHabitatBonus : 0;
  return favoriteScore + habitatBonus;
}

export function houseCohesionScore(
  analysis: HouseAnalysis,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): number {
  return (
    analysis.sharedFavorites.length * config.houseSharedByAllPoints +
    analysis.partialFavorites.length * config.houseSharedByHalfPoints
  );
}

export function furnitureUsefulnessForHouse(
  furniture: Furniture,
  members: Pokemon[],
  coveredCategoriesSoFar: Set<string>,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): FurnitureScore {
  const coveredBy = members
    .filter(p => furniture.categories.some(c => p.favorites.includes(c)))
    .map(p => p.id);
  const coversNewCategory = coveredBy.length > 0 &&
    furniture.categories.some(c => !coveredCategoriesSoFar.has(c));
  const score =
    coveredBy.length * config.furnitureCoveragePoints +
    (coversNewCategory ? config.furnitureNewCategoryBonus : 0);
  return { furniture, score, coveredBy };
}

export function rankFurnitureForHouse(
  allFurniture: Furniture[],
  members: Pokemon[],
  selectedIds: string[] = [],
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): FurnitureScore[] {
  const coveredCategoriesSoFar = new Set(
    allFurniture.filter(f => selectedIds.includes(f.id)).flatMap(f => f.categories),
  );
  return allFurniture
    .map(f => furnitureUsefulnessForHouse(f, members, coveredCategoriesSoFar, config))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function rankFurnitureForPokemon(
  allFurniture: Furniture[],
  pokemon: Pokemon,
): FurnitureScore[] {
  return allFurniture
    .map(f => ({
      furniture: f,
      coveredBy: f.categories.some(c => pokemon.favorites.includes(c)) ? [pokemon.id] : [],
      score: f.categories.some(c => pokemon.favorites.includes(c)) ? 1 : 0,
    }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function buildCompatibilityMatrix(
  pokemon: Pokemon[],
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): number[][] {
  return pokemon.map(a => pokemon.map(b => (a.id === b.id ? 0 : pokemonCompatibility(a, b, config))));
}

export function topCompatiblePokemon(
  target: Pokemon,
  allPokemon: Pokemon[],
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): Array<{ pokemon: Pokemon; score: number }> {
  return allPokemon
    .filter(p => p.id !== target.id)
    .map(p => ({ pokemon: p, score: pokemonCompatibility(target, p, config) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function computeHouseAnalysis(
  members: Pokemon[],
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
) {
  const analysis = analyzeHouse(members);
  const score = houseCohesionScore(analysis, config);
  return { ...analysis, cohesionScore: score };
}

export type CompatibilityGroup = { members: Pokemon[]; score: number };

export function allCompatiblePairs(
  allPokemon: Pokemon[],
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): CompatibilityGroup[] {
  const pairs: CompatibilityGroup[] = [];
  for (let i = 0; i < allPokemon.length; i++) {
    for (let j = i + 1; j < allPokemon.length; j++) {
      const score = pokemonCompatibility(allPokemon[i], allPokemon[j], config);
      if (score > 0) pairs.push({ members: [allPokemon[i], allPokemon[j]], score });
    }
  }
  return pairs.sort((a, b) => b.score - a.score);
}

function candidatePool(pairs: CompatibilityGroup[], n: number): Pokemon[] {
  const seen = new Set<string>();
  const pool: Pokemon[] = [];
  for (const { members } of pairs.slice(0, n)) {
    for (const p of members) {
      if (!seen.has(p.id)) { seen.add(p.id); pool.push(p); }
    }
  }
  return pool;
}

export function allCompatibleGroups(
  allPokemon: Pokemon[],
  size: 3 | 4,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): CompatibilityGroup[] {
  const pairs = allCompatiblePairs(allPokemon, config);
  const pool = candidatePool(pairs, 100);

  // Trios: exhaustive C(k,3) over candidate pool (~90 pokemon → ~118K combos, fast)
  const trios: CompatibilityGroup[] = [];
  for (let i = 0; i < pool.length; i++)
    for (let j = i + 1; j < pool.length; j++)
      for (let k = j + 1; k < pool.length; k++) {
        const members = [pool[i], pool[j], pool[k]];
        const score = computeHouseAnalysis(members, config).cohesionScore;
        if (score > 0) trios.push({ members, score });
      }
  trios.sort((a, b) => b.score - a.score);

  if (size === 3) return trios;

  // Quartets: greedy extension of top-200 trios — each gets the best available 4th member.
  // ~200 trios × ~90 candidates = ~18K scorings instead of 3M.
  const seen = new Set<string>();
  const quartets: CompatibilityGroup[] = [];
  for (const trio of trios.slice(0, 200)) {
    const trioIds = new Set(trio.members.map(p => p.id));
    let bestScore = 0;
    let bestMember: Pokemon | null = null;
    for (const p of pool) {
      if (trioIds.has(p.id)) continue;
      const score = computeHouseAnalysis([...trio.members, p], config).cohesionScore;
      if (score > bestScore) { bestScore = score; bestMember = p; }
    }
    if (!bestMember) continue;
    const key = [...trio.members.map(p => p.id), bestMember.id].sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    quartets.push({ members: [...trio.members, bestMember], score: bestScore });
  }

  return quartets.sort((a, b) => b.score - a.score);
}

export function groupsContainingSeed(
  seed: Pokemon,
  allPokemon: Pokemon[],
  size: 3 | 4,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): CompatibilityGroup[] {
  const rest = allPokemon.filter(p => p.id !== seed.id);
  const groups: CompatibilityGroup[] = [];
  const seen = new Set<string>();

  if (size === 3) {
    for (let i = 0; i < rest.length; i++)
      for (let j = i + 1; j < rest.length; j++) {
        const members = [seed, rest[i], rest[j]];
        const score = computeHouseAnalysis(members, config).cohesionScore;
        if (score > 0) groups.push({ members, score });
      }
  } else {
    // Build seed trios first, then extend the top 50
    const trios = groupsContainingSeed(seed, allPokemon, 3, config).slice(0, 50);
    for (const trio of trios) {
      const trioIds = new Set(trio.members.map(p => p.id));
      for (const p of rest) {
        if (trioIds.has(p.id)) continue;
        const key = [...trioIds, p.id].toSorted().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        const members = [...trio.members, p];
        const score = computeHouseAnalysis(members, config).cohesionScore;
        if (score > 0) groups.push({ members, score });
      }
    }
  }

  return groups.sort((a, b) => b.score - a.score);
}
