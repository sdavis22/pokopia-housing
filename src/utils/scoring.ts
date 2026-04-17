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
  const coveredBy = members.filter(p => p.favorites.includes(furniture.category)).map(p => p.id);
  const score =
    coveredBy.length * config.furnitureCoveragePoints +
    (coveredBy.length > 0 && !coveredCategoriesSoFar.has(furniture.category)
      ? config.furnitureNewCategoryBonus
      : 0);
  return { furniture, score, coveredBy };
}

export function rankFurnitureForHouse(
  allFurniture: Furniture[],
  members: Pokemon[],
  selectedIds: string[] = [],
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): FurnitureScore[] {
  const coveredCategoriesSoFar = new Set(
    allFurniture.filter(f => selectedIds.includes(f.id)).map(f => f.category),
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
      coveredBy: pokemon.favorites.includes(f.category) ? [pokemon.id] : [],
      score: pokemon.favorites.includes(f.category) ? 1 : 0,
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
