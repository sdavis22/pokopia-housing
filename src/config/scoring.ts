import type { ScoringConfig } from '../types';

export const FURNITURE_CATEGORIES = [
  'Blocky stuff',
  'Cleanliness',
  'Colorful stuff',
  'Complicated stuff',
  'Construction',
  'Containers',
  'Cute stuff',
  'Electronics',
  'Exercise',
  'Fabric',
  'Garbage',
  'Gatherings',
  'Glass stuff',
  'Group Activities',
  'Hard stuff',
  'Healing',
  'Letters and words',
  'Looks like food',
  'Lots of dirt',
  'Lots of fire',
  'Lots of nature',
  'Lots of water',
  'Luxury',
  'Metal stuff',
  'Nice breezes',
  'Noisy stuff',
  'Ocean vibes',
  'Play spaces',
  'Pretty flowers',
  'Rides',
  'Round stuff',
  'Sharp stuff',
  'Shiny stuff',
  'Slender objects',
  'Soft stuff',
  'Spinning stuff',
  'Spooky stuff',
  'Stone stuff',
  'Strange stuff',
  'Symbols',
  'Watching stuff',
  'Wobbly stuff',
  'Wooden stuff',
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
