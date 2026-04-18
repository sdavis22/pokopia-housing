import type { Pokemon } from '../types';

const SIZE_CLASSES = {
  xs: 'w-5 h-5',
  sm: 'w-7 h-7',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
} as const;

type Size = keyof typeof SIZE_CLASSES;

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

// Exceptions for pokemon that have no dex number, wrong numbered sprite,
// or are regional forms whose form-sprite lives at a different path.
const SPRITE_EXCEPTIONS: Record<string, string> = {
  'Smeargle':       `${SPRITE_BASE}/235.png`,
  'Greedent':       `${SPRITE_BASE}/820.png`,
  'Tinkaton':       `${SPRITE_BASE}/959.png`,
  'Toxtricity':     `${SPRITE_BASE}/849.png`,
  'Tatsugiri':      `${SPRITE_BASE}/952.png`,
  'Paldean Wooper': `${SPRITE_BASE}/10254.png`,
  'Stereo Rotom':   `${SPRITE_BASE}/479.png`,
};

function spriteUrl(pokemon: Pokemon): string | null {
  if (pokemon.image) return pokemon.image;
  if (SPRITE_EXCEPTIONS[pokemon.name]) return SPRITE_EXCEPTIONS[pokemon.name];
  if (pokemon.pokedexNumber) {
    return `${SPRITE_BASE}/${pokemon.pokedexNumber}.png`;
  }
  return null;
}

export function PokemonSprite({
  pokemon,
  size = 'sm',
  className = '',
}: {
  pokemon: Pokemon;
  size?: Size;
  className?: string;
}) {
  const src = spriteUrl(pokemon);
  if (!src) return null;

  return (
    <img
      src={src}
      alt={pokemon.name}
      className={`${SIZE_CLASSES[size]} object-contain shrink-0 ${className}`}
      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}
