import { useState } from 'react';
import type { Furniture, Pokemon } from '../types';
import { rankFurnitureForHouse } from '../utils/scoring';

interface Props {
  furniture: Furniture[];
  members: Pokemon[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  maxHeight?: string;
}

export function SearchableFurnitureList({
  furniture,
  members,
  selectedIds,
  onToggle,
  maxHeight = 'max-h-60',
}: Props) {
  const [search, setSearch] = useState('');

  if (members.length === 0) {
    return <p className="text-sm text-gray-400">Add Pokemon to see recommendations.</p>;
  }

  const ranked = rankFurnitureForHouse(furniture, members, [])
    .filter(({ furniture: f }) => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-2">
      <input
        className="border border-gray-200 rounded px-2 py-1 text-xs w-full focus:outline-none focus:border-indigo-400"
        placeholder="Filter furniture…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className={`space-y-0.5 ${maxHeight} overflow-y-auto`}>
        {furniture.length === 0 && <p className="text-sm text-gray-400">No furniture yet.</p>}
        {furniture.length > 0 && ranked.length === 0 && (
          <p className="text-sm text-gray-400">No matching furniture.</p>
        )}
        {ranked.map(({ furniture: f, score, coveredBy }) => {
          const selected = selectedIds.includes(f.id);
          return (
            <button
              key={f.id}
              onClick={() => onToggle(f.id)}
              className={`w-full text-left text-sm px-2 py-1 rounded flex items-center gap-2 transition-colors ${
                selected ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-100'
              }`}
            >
              <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-xs ${
                selected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'
              }`}>
                {selected ? '✓' : ''}
              </span>
              <span className="flex-1">{f.name}</span>
              <span className="text-xs text-gray-400">{coveredBy.length}/{members.length}</span>
              <span className="text-xs font-semibold text-indigo-600">{score}pt</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
