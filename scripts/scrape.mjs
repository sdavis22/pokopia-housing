import { writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';

const BASE = 'https://www.serebii.net/pokemonpokopia/favorites';

const CATEGORIES = [
  ['Hard stuff',        'hardstuff'],
  ['Wooden stuff',      'woodenstuff'],
  ['Lots of fire',      'lotsoffire'],
  ['Soft stuff',        'softstuff'],
  ['Cute stuff',        'cutestuff'],
  ['Electronics',       'electronics'],
  ['Glass stuff',       'glassstuff'],
  ['Round stuff',       'roundstuff'],
  ['Spooky stuff',      'spookystuff'],
  ['Strange stuff',     'strangestuff'],
  ['Garbage',           'garbage'],
  ['Rides',             'rides'],
  ['Lots of nature',    'lotsofnature'],
  ['Lots of water',     'lotsofwater'],
  ['Fabric',            'fabric'],
  ['Looks like food',   'lookslikefood'],
  ['Wobbly stuff',      'wobblystuff'],
  ['Stone stuff',       'stonestuff'],
  ['Letters and words', 'lettersandwords'],
  ['Group Activities',  'groupactivities'],
  ['Watching stuff',    'watchingstuff'],
  ['Complicated stuff', 'complicatedstuff'],
  ['Play spaces',       'playspaces'],
  ['Healing',           'healing'],
  ['Exercise',          'exercise'],
  ['Luxury',            'luxury'],
  ['Nice breezes',      'nicebreezes'],
  ['Ocean vibes',       'oceanvibes'],
  ['Construction',      'construction'],
  ['Containers',        'containers'],
  ['Shiny stuff',       'shinystuff'],
  ['Metal stuff',       'metalstuff'],
  ['Spinning stuff',    'spinningstuff'],
  ['Lots of dirt',      'lotsofdirt'],
  ['Blocky stuff',      'blockystuff'],
  ['Slender objects',   'slenderobjects'],
  ['Cleanliness',       'cleanliness'],
  ['Pretty flowers',    'prettyflowers'],
  ['Colorful stuff',    'colorfulstuff'],
  ['Gatherings',        'gatherings'],
  ['Sharp stuff',       'sharpstuff'],
  ['Symbols',           'symbols'],
];

function toId(name) {
  return name
    .toLowerCase()
    .replace(/[éèê]/g, 'e')
    .replace(/[àâ]/g, 'a')
    .replace(/[ùû]/g, 'u')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function decodeHtml(str) {
  return str
    .replace(/&eacute;/g, 'é')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .trim();
}

function parsePage(html, categoryName) {
  const furniture = [];
  const pokemon = [];

  // --- Furniture: <a href="/pokemonpokopia/items/..."><u>NAME</u></a>
  const itemRe = /href="\/pokemonpokopia\/items\/[^"]+"><u>([^<]+)<\/u>/g;
  let m;
  while ((m = itemRe.exec(html)) !== null) {
    const name = decodeHtml(m[1]);
    if (name) furniture.push({ id: toId(name), name, categories: [categoryName] });
  }

  // --- Pokemon rows: match name+habitat, then grab specialties from the block up to next </tr>
  const rowRe = /\/pokemonpokopia\/pokedex\/([a-z0-9'.-]+)\.shtml"><u>([^<]+)<\/u><\/a><\/td>[\s\S]*?\/idealhabitat\/(\w+)\.shtml[^>]*>(\w+)<\/a>([\s\S]*?)<\/tr>/g;

  while ((m = rowRe.exec(html)) !== null) {
    const name = decodeHtml(m[2]);
    const habitat = m[4].charAt(0).toUpperCase() + m[4].slice(1);
    const block = m[5];

    const specRe = /\/specialty\/[^"]+"><u>([^<]+)<\/u>/g;
    const specialty = [];
    let sm;
    while ((sm = specRe.exec(block)) !== null) {
      const s = decodeHtml(sm[1]);
      if (s && !specialty.includes(s)) specialty.push(s);
    }

    // Dex number from preceding #NNN cell or image
    const imgM = /\/pokemon\/small\/(\d+)\.png/.exec(html.substring(Math.max(0, m.index - 300), m.index));
    const dexNum = imgM ? parseInt(imgM[1], 10) : undefined;

    const validHabitats = ['Warm', 'Bright', 'Humid', 'Dark', 'Dry', 'Cool'];
    if (!name || !validHabitats.includes(habitat)) continue;

    pokemon.push({ id: toId(name), name, pokedexNumber: dexNum, idealHabitat: habitat, specialty, favorites: [categoryName] });
  }

  return { furniture, pokemon };
}

function fetchPage(url) {
  try {
    return execSync(`curl -s -A "Mozilla/5.0" "${url}"`, { maxBuffer: 10 * 1024 * 1024 }).toString();
  } catch {
    return null;
  }
}

function main() {
  const allPokemon = new Map();
  const allFurniture = new Map();
  const categoryNames = CATEGORIES.map(([name]) => name);
  const total = CATEGORIES.length;

  for (let i = 0; i < CATEGORIES.length; i++) {
    const [categoryName, slug] = CATEGORIES[i];
    process.stdout.write(`\r[${i + 1}/${total}] ${categoryName.padEnd(25)}`);
    const html = fetchPage(`${BASE}/${slug}.shtml`);
    if (!html) continue;

    const { furniture, pokemon } = parsePage(html, categoryName);

    for (const f of furniture) {
      if (allFurniture.has(f.id)) {
        const existing = allFurniture.get(f.id);
        if (!existing.categories.includes(categoryName)) existing.categories.push(categoryName);
      } else {
        allFurniture.set(f.id, f);
      }
    }
    for (const p of pokemon) {
      if (allPokemon.has(p.id)) {
        const existing = allPokemon.get(p.id);
        if (!existing.favorites.includes(categoryName)) existing.favorites.push(categoryName);
      } else {
        allPokemon.set(p.id, { ...p });
      }
    }
  }

  console.log('\nDeduplicating...');

  // Merge form variants into canonical entries, drop NPCs
  // Each entry: [variantId, canonicalId | null (drop)]
  const MERGE = [
    ['toxtricity-amped-form',   'toxtricity'],
    ['toxtricity-low-key-form', 'toxtricity'],
    ['shellos-east-sea',        'shellos'],
    ['gastrodon-east-sea',      'gastrodon'],
    ['tatsugiri-curly-form',    'tatsugiri'],
    ['tatsugiri-droopy-form',   'tatsugiri'],
    ['tatsugiri-stretchy-form', 'tatsugiri'],
    ['professor-tangrowth',     null],  // NPC, not a playable Pokemon
  ];

  for (const [variantId, canonicalId] of MERGE) {
    const variant = allPokemon.get(variantId);
    if (!variant) continue;
    if (canonicalId) {
      // Create canonical entry if it doesn't exist yet
      if (!allPokemon.has(canonicalId)) {
        allPokemon.set(canonicalId, { ...variant, id: canonicalId, name: canonicalId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) });
      }
      // Merge favorites
      const canonical = allPokemon.get(canonicalId);
      for (const fav of variant.favorites) {
        if (!canonical.favorites.includes(fav)) canonical.favorites.push(fav);
      }
    }
    allPokemon.delete(variantId);
  }

  console.log('Building JSON...');

  const pokemonArr = [...allPokemon.values()].sort((a, b) => (a.pokedexNumber ?? 9999) - (b.pokedexNumber ?? 9999));
  const furnitureArr = [...allFurniture.values()];

  mkdirSync('public/data', { recursive: true });
  writeFileSync('public/data/seed.json', JSON.stringify({
    furnitureCategories: categoryNames,
    pokemon: pokemonArr,
    furniture: furnitureArr,
    houseGroups: [],
  }, null, 2));

  console.log(`Done.`);
  console.log(`  Pokemon:    ${pokemonArr.length}`);
  console.log(`  Furniture:  ${furnitureArr.length}`);
  console.log(`  Categories: ${categoryNames.length}`);

  // Spot-check
  const bulbasaur = allPokemon.get('bulbasaur');
  if (bulbasaur) console.log(`\nBulbasaur favorites: ${bulbasaur.favorites.join(', ')}`);
  const charmander = allPokemon.get('charmander');
  if (charmander) console.log(`Charmander favorites: ${charmander.favorites.join(', ')}`);
}

main();
