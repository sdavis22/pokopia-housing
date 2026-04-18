import type { ScoringConfig } from '../types';

export const FURNITURE_CATEGORIES = [
  'Hard stuff',
  'Wooden stuff',
  'Lots of fire',
  'Soft stuff',
  'Cute stuff',
  'Electronics',
  'Glass stuff',
  'Round stuff',
  'Spooky stuff',
  'Strange stuff',
  'Garbage',
  'Rides',
  'Lots of nature',
  'Lots of water',
] as const;

export type FurnitureCategory = (typeof FURNITURE_CATEGORIES)[number];

export const HABITATS = ['Warm', 'Bright', 'Humid', 'Dark', 'Dry', 'Cool'] as const;

export const ISLANDS = [
  'Withering Wasteland',
  'Rocky Ridges',
  'Bleak Beach',
  'Sparkling Skylands',
  'Pallet Town',
] as const;
export type Island = (typeof ISLANDS)[number];

export const SPECIALTIES = [
  'Burn', 'Water', 'Generate', 'Crush', 'Build', 'Chop', 'Fly',
  'Bulldoze', 'Gather', 'Recycle', 'Trade', 'Litter', 'Search',
  'Grow', 'Hype', 'Collect',
] as const;

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  sharedFavoritePoints: 2,
  sameHabitatBonus: 3,
  houseSharedByAllPoints: 3,
  houseSharedByHalfPoints: 1,
  furnitureCoveragePoints: 1,
  furnitureNewCategoryBonus: 2,
};
