export type Habitat = 'Warm' | 'Bright' | 'Humid' | 'Dark' | 'Dry' | 'Cool';

export type Pokemon = {
  id: string;
  name: string;
  pokedexNumber?: number;
  idealHabitat: Habitat;
  favorites: string[];   // furniture category names, e.g. "Wooden stuff", "Lots of fire"
  specialty: string[];   // what they do in Pokopia: "Burn", "Grow", "Generate", etc.
  notes?: string;
  image?: string;
};

export type Furniture = {
  id: string;
  name: string;
  category: string;      // matches a Pokemon favorites value, e.g. "Hard stuff"
  description?: string;
  notes?: string;
  image?: string;
};

export type HouseGroup = {
  id: string;
  name: string;
  pokemonIds: string[];
  selectedFurnitureIds?: string[];
};

export type AppData = {
  pokemon: Pokemon[];
  furniture: Furniture[];
  houseGroups: HouseGroup[];
  furnitureCategories: string[];
};

export type ScoringConfig = {
  sharedFavoritePoints: number;
  sameHabitatBonus: number;
  houseSharedByAllPoints: number;
  houseSharedByHalfPoints: number;
  furnitureCoveragePoints: number;
  furnitureNewCategoryBonus: number;
};

export type HouseAnalysis = {
  sharedFavorites: string[];
  partialFavorites: string[];
  outlierFavorites: string[];
  habitatBreakdown: Record<Habitat, string[]>; // habitat -> pokemonIds
  cohesionScore: number;
};

export type FurnitureScore = {
  furniture: Furniture;
  score: number;
  coveredBy: string[]; // pokemonIds that have this category in favorites
};
