import type { AppData, Pokemon, Furniture, HouseGroup } from '../types';
import { SAMPLE_DATA } from '../data/sampleData';

export type AppAction =
  | { type: 'ADD_POKEMON'; payload: Pokemon }
  | { type: 'EDIT_POKEMON'; payload: Pokemon }
  | { type: 'DELETE_POKEMON'; payload: string }
  | { type: 'ADD_FURNITURE'; payload: Furniture }
  | { type: 'EDIT_FURNITURE'; payload: Furniture }
  | { type: 'DELETE_FURNITURE'; payload: string }
  | { type: 'ADD_HOUSE'; payload: HouseGroup }
  | { type: 'EDIT_HOUSE'; payload: HouseGroup }
  | { type: 'DELETE_HOUSE'; payload: string }
  | { type: 'ADD_FURNITURE_CATEGORY'; payload: string }
  | { type: 'DELETE_FURNITURE_CATEGORY'; payload: string }
  | { type: 'IMPORT_DATA'; payload: AppData }
  | { type: 'LOAD_SAMPLE' }
  | { type: 'RESET' };

export const EMPTY_STATE: AppData = {
  pokemon: [],
  furniture: [],
  houseGroups: [],
  furnitureCategories: [],
};

export function appReducer(state: AppData, action: AppAction): AppData {
  switch (action.type) {
    case 'ADD_POKEMON':
      return { ...state, pokemon: [...state.pokemon, action.payload] };
    case 'EDIT_POKEMON':
      return { ...state, pokemon: state.pokemon.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_POKEMON':
      return {
        ...state,
        pokemon: state.pokemon.filter(p => p.id !== action.payload),
        houseGroups: state.houseGroups.map(h => ({
          ...h,
          pokemonIds: h.pokemonIds.filter(id => id !== action.payload),
        })),
      };
    case 'ADD_FURNITURE':
      return { ...state, furniture: [...state.furniture, action.payload] };
    case 'EDIT_FURNITURE':
      return { ...state, furniture: state.furniture.map(f => f.id === action.payload.id ? action.payload : f) };
    case 'DELETE_FURNITURE':
      return {
        ...state,
        furniture: state.furniture.filter(f => f.id !== action.payload),
        houseGroups: state.houseGroups.map(h => ({
          ...h,
          selectedFurnitureIds: (h.selectedFurnitureIds ?? []).filter(id => id !== action.payload),
        })),
      };
    case 'ADD_HOUSE':
      return { ...state, houseGroups: [...state.houseGroups, action.payload] };
    case 'EDIT_HOUSE':
      return { ...state, houseGroups: state.houseGroups.map(h => h.id === action.payload.id ? action.payload : h) };
    case 'DELETE_HOUSE':
      return { ...state, houseGroups: state.houseGroups.filter(h => h.id !== action.payload) };
    case 'ADD_FURNITURE_CATEGORY':
      if (state.furnitureCategories.includes(action.payload)) return state;
      return { ...state, furnitureCategories: [...state.furnitureCategories, action.payload] };
    case 'DELETE_FURNITURE_CATEGORY':
      return { ...state, furnitureCategories: state.furnitureCategories.filter(c => c !== action.payload) };
    case 'IMPORT_DATA':
      return action.payload;
    case 'LOAD_SAMPLE':
      return SAMPLE_DATA;
    case 'RESET':
      return EMPTY_STATE;
    default:
      return state;
  }
}
