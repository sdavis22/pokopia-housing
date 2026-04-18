# Pokopia Housing Preference Visualizer

React + TypeScript single-page app for planning Pokemon housing groups based on shared furniture preferences.

## Dev

```bash
npm run dev    # localhost:3000
npm run build
node scripts/scrape.mjs  # re-scrape Serebii data -> public/data/seed.json
```

## Data model

The core matching layer is: `pokemon.favorites[]` ↔ `furniture.category`.

```
Pokemon
  id, name, pokedexNumber
  idealHabitat: "Warm" | "Bright" | "Humid" | "Dark" | "Dry" | "Cool"
  favorites: string[]   ← furniture category names e.g. "Hard stuff", "Lots of fire"
  specialty: string[]   ← what they do: "Burn", "Grow", "Generate", etc.

Furniture
  id, name
  category: string      ← must match a value from furnitureCategories

HouseGroup
  pokemonIds: string[]
  selectedFurnitureIds: string[]
```

All types are in `src/types/index.ts`. Scoring weights are in `src/config/scoring.ts`.

## State

Single `AppContext` (Context + useReducer). On first load, fetches `public/data/seed.json` (308 Pokemon, 607 furniture items, 42 categories scraped from Serebii). Persists to localStorage after that.

All actions are in `src/context/appReducer.ts`: ADD/EDIT/DELETE for Pokemon, Furniture, HouseGroup; IMPORT_DATA; LOAD_SAMPLE; RESET.

## Scoring

```
Pokemon compatibility:  +2 per shared favorite category, +3 if same habitat
House cohesion:         +3 per category shared by ALL members, +1 per category shared by >= half
Furniture usefulness:   +1 per house member who has this category in favorites, +2 if first item covering that category
```

Tweak weights in `src/config/scoring.ts` without touching logic.

## Key files

| File | Purpose |
|------|---------|
| `src/types/index.ts` | All TypeScript types |
| `src/config/scoring.ts` | Scoring weights + canonical category/habitat/specialty lists |
| `src/utils/scoring.ts` | pokemonCompatibility, houseCohesion, rankFurnitureForHouse |
| `src/utils/overlap.ts` | analyzeHouse — shared/partial/outlier tag breakdown |
| `src/context/AppContext.tsx` | Provider, seed fetch, localStorage sync |
| `src/context/appReducer.ts` | All state mutations |
| `public/data/seed.json` | Scraped Serebii data — regenerate with scripts/scrape.mjs |
| `scripts/scrape.mjs` | Serebii scraper (curl-based, no deps) |

## Pages

| Route | File | Purpose |
|-------|------|---------|
| `/` | DashboardPage | Counts, top pairs, saved groups |
| `/pokemon` | PokemonExplorerPage | Browse + search + detail + add/edit |
| `/furniture` | FurnitureExplorerPage | Browse + search + detail + add/edit |
| `/groups` | GroupBuilderPage | Build houses, see compatibility matrix + coverage chart |
| `/data` | DataManagerPage | JSON import/export, category manager, reset |
