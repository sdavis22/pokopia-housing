import { useState } from 'react';
import type { Pokemon } from '../types';
import { ISLANDS } from '../config/scoring';
import { PokemonSprite } from './PokemonSprite';

interface Props {
  pokemon: Pokemon[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  /** Optional extra content rendered at the far right of each row (e.g. habitat badge, island label). */
  renderMeta?: (p: Pokemon) => React.ReactNode;
  maxHeight?: string;
}

export function SearchablePokemonPicker({
  pokemon,
  selectedIds,
  onToggle,
  renderMeta,
  maxHeight = 'max-h-60',
}: Props) {
  const [search, setSearch] = useState('');
  const [filterIsland, setFilterIsland] = useState('');

  const filtered = pokemon
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => !filterIsland || p.island === filterIsland)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        <input
          className="border border-gray-200 rounded px-2 py-1 text-xs flex-1 focus:outline-none focus:border-indigo-400"
          placeholder="Filter Pokemon…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-400"
          value={filterIsland}
          onChange={e => setFilterIsland(e.target.value)}
        >
          <option value="">All islands</option>
          {ISLANDS.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      <div className={`space-y-0.5 ${maxHeight} overflow-y-auto`}>
        {pokemon.length === 0 && (
          <p className="text-sm text-gray-400 py-2">No Pokemon yet.</p>
        )}
        {pokemon.length > 0 && filtered.length === 0 && (
          <p className="text-xs text-gray-400 py-2">No Pokemon match.</p>
        )}
        {filtered.map(p => {
          const selected = selectedIds.includes(p.id);
          return (
            <label
              key={p.id}
              className="flex items-center gap-2 px-1 py-1 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggle(p.id)}
                className="accent-indigo-600 shrink-0"
              />
              <PokemonSprite pokemon={p} size="xs" />
              <span className="text-sm text-gray-800 flex-1 truncate">{p.name}</span>
              {renderMeta?.(p)}
            </label>
          );
        })}
      </div>
    </div>
  );
}
