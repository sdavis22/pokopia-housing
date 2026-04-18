# Utils

Pure functions — no React, no state imports.

## scoring.ts

Main analysis entry points:

- `pokemonCompatibility(a, b, config?)` → number
- `topCompatiblePokemon(target, allPokemon)` → ranked list
- `computeHouseAnalysis(members)` → `{ sharedFavorites, partialFavorites, outlierFavorites, habitatBreakdown, cohesionScore }`
- `rankFurnitureForHouse(allFurniture, members, selectedIds?)` → ranked `FurnitureScore[]`
- `rankFurnitureForPokemon(allFurniture, pokemon)` → ranked `FurnitureScore[]`
- `buildCompatibilityMatrix(pokemon)` → `number[][]`

## overlap.ts

Lower-level set operations used by scoring.ts:

- `favoritesOverlap(a, b)` → `{ shared, onlyA, onlyB }`
- `analyzeHouse(members)` → raw analysis (cohesionScore = 0; use `computeHouseAnalysis` from scoring.ts for the scored version)

## validation.ts

- `validateImport(data)` → `{ errors, data }` — checks structure and duplicate IDs

## importExport.ts

- `parseImport(jsonText)` → `ImportResult` — JSON parse + validate
- `exportToJson(data)` → triggers browser download of `pokopia-data.json`
