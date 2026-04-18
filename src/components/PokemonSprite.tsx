import type { Pokemon } from '../types';

const SIZE_CLASSES = {
  xs: 'w-5 h-5',
  sm: 'w-7 h-7',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
} as const;

type Size = keyof typeof SIZE_CLASSES;

function spriteUrl(pokemon: Pokemon): string | null {
  if (pokemon.image) return pokemon.image;
  if (pokemon.pokedexNumber) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedexNumber}.png`;
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
