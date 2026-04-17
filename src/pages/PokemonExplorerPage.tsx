import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Pokemon } from '../types';
import { topCompatiblePokemon, rankFurnitureForPokemon } from '../utils/scoring';
import { favoritesOverlap } from '../utils/overlap';

function TagChip({ label, color = 'gray' }: { label: string; color?: 'gray' | 'indigo' | 'green' | 'amber' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${colors[color]}`}>{label}</span>
  );
}

const HABITAT_COLORS: Record<string, string> = {
  Warm: 'bg-orange-100 text-orange-700',
  Bright: 'bg-yellow-100 text-yellow-700',
  Humid: 'bg-teal-100 text-teal-700',
  Dark: 'bg-purple-100 text-purple-700',
  Dry: 'bg-red-100 text-red-700',
  Cool: 'bg-blue-100 text-blue-700',
};

function HabitatBadge({ habitat }: { habitat: string }) {
  const cls = HABITAT_COLORS[habitat] ?? 'bg-gray-100 text-gray-700';
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cls}`}>{habitat}</span>;
}

function PokemonForm({ initial, onSave, onCancel, existingIds }: {
  initial?: Partial<Pokemon>;
  onSave: (p: Pokemon) => void;
  onCancel: () => void;
  existingIds: string[];
}) {
  const { state } = useApp();
  const [id, setId] = useState(initial?.id ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [habitat, setHabitat] = useState<Pokemon['idealHabitat']>(initial?.idealHabitat ?? 'Bright');
  const [favInput, setFavInput] = useState(initial?.favorites?.join(', ') ?? '');
  const [specInput, setSpecInput] = useState(initial?.specialty?.join(', ') ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState('');

  const isEdit = !!initial?.id;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id.trim() || !name.trim()) { setError('ID and Name are required'); return; }
    if (!isEdit && existingIds.includes(id.trim())) { setError(`ID "${id}" already exists`); return; }
    onSave({
      id: id.trim(),
      name: name.trim(),
      idealHabitat: habitat as Pokemon['idealHabitat'],
      favorites: favInput.split(',').map(s => s.trim()).filter(Boolean),
      specialty: specInput.split(',').map(s => s.trim()).filter(Boolean),
      notes: notes.trim() || undefined,
    });
  }

  const categories = state.furnitureCategories;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">ID</label>
          <input className="input w-full" value={id} onChange={e => setId(e.target.value)} disabled={isEdit} placeholder="bulbasaur" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input className="input w-full" value={name} onChange={e => setName(e.target.value)} placeholder="Bulbasaur" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Ideal Habitat</label>
        <select className="input w-full" value={habitat} onChange={e => setHabitat(e.target.value as Pokemon['idealHabitat'])}>
          {['Warm', 'Bright', 'Humid', 'Dark', 'Dry', 'Cool'].map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Favorites (comma-separated)</label>
        <input className="input w-full" value={favInput} onChange={e => setFavInput(e.target.value)} placeholder="Lots of nature, Soft stuff, Cute stuff" />
        <div className="flex flex-wrap gap-1 mt-1">
          {categories.map(c => (
            <button
              type="button"
              key={c}
              onClick={() => {
                const favs = favInput.split(',').map(s => s.trim()).filter(Boolean);
                if (!favs.includes(c)) setFavInput([...favs, c].join(', '));
              }}
              className="text-xs bg-gray-100 hover:bg-indigo-100 text-gray-600 px-2 py-0.5 rounded-full transition-colors"
            >
              + {c}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Specialty (comma-separated)</label>
        <input className="input w-full" value={specInput} onChange={e => setSpecInput(e.target.value)} placeholder="Grow, Trade" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
        <textarea className="input w-full" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">{isEdit ? 'Save Changes' : 'Add Pokemon'}</button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}

function PokemonDetail({ pokemon, allPokemon, allFurniture }: {
  pokemon: Pokemon;
  allPokemon: Pokemon[];
  allFurniture: ReturnType<typeof useApp>['state']['furniture'];
}) {
  const compatible = topCompatiblePokemon(pokemon, allPokemon);
  const furniture = rankFurnitureForPokemon(allFurniture, pokemon);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-bold text-gray-900">{pokemon.name}</h3>
          {pokemon.pokedexNumber && <span className="text-sm text-gray-400">#{pokemon.pokedexNumber}</span>}
          <HabitatBadge habitat={pokemon.idealHabitat} />
        </div>
        {pokemon.specialty.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="text-xs text-gray-500 mr-1">Specialty:</span>
            {pokemon.specialty.map(s => <TagChip key={s} label={s} color="amber" />)}
          </div>
        )}
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-gray-500 mr-1">Favorites:</span>
          {pokemon.favorites.map(f => <TagChip key={f} label={f} color="indigo" />)}
        </div>
        {pokemon.notes && <p className="text-sm text-gray-500 mt-2 italic">{pokemon.notes}</p>}
      </div>

      {compatible.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Top Compatible Pokemon</h4>
          <ul className="space-y-1">
            {compatible.slice(0, 5).map(({ pokemon: p, score }) => {
              const { shared } = favoritesOverlap(pokemon, p);
              return (
                <li key={p.id} className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{p.name}</span>
                  <HabitatBadge habitat={p.idealHabitat} />
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full ml-auto">{score}pts</span>
                  <span className="text-gray-400 text-xs">{shared.join(', ')}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {furniture.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Matching Furniture</h4>
          <ul className="space-y-1">
            {furniture.slice(0, 8).map(({ furniture: f }) => (
              <li key={f.id} className="flex items-center gap-2 text-sm">
                <span className="font-medium">{f.name}</span>
                <TagChip label={f.category} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function PokemonExplorerPage() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [filterHabitat, setFilterHabitat] = useState('');
  const [filterFav, setFilterFav] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'favorites'>('name');
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const [editing, setEditing] = useState<Pokemon | null | 'new'>(null);

  const filtered = state.pokemon
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => !filterHabitat || p.idealHabitat === filterHabitat)
    .filter(p => !filterFav || p.favorites.includes(filterFav))
    .sort((a, b) =>
      sortBy === 'name'
        ? a.name.localeCompare(b.name)
        : b.favorites.length - a.favorites.length
    );

  const habitats = [...new Set(state.pokemon.map(p => p.idealHabitat))].sort();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Pokemon Explorer</h2>
        <button className="btn-primary" onClick={() => { setEditing('new'); setSelected(null); }}>+ Add Pokemon</button>
      </div>

      {editing && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3">{editing === 'new' ? 'Add Pokemon' : `Edit ${(editing as Pokemon).name}`}</h3>
          <PokemonForm
            initial={editing === 'new' ? {} : editing as Pokemon}
            existingIds={state.pokemon.map(p => p.id)}
            onSave={p => {
              dispatch({ type: editing === 'new' ? 'ADD_POKEMON' : 'EDIT_POKEMON', payload: p });
              setEditing(null);
              setSelected(p);
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          className="input flex-1 min-w-40"
          placeholder="Search Pokemon..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input" value={filterHabitat} onChange={e => setFilterHabitat(e.target.value)}>
          <option value="">All habitats</option>
          {habitats.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <select className="input" value={filterFav} onChange={e => setFilterFav(e.target.value)}>
          <option value="">All favorites</option>
          {state.furnitureCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value as 'name' | 'favorites')}>
          <option value="name">Sort: Name</option>
          <option value="favorites">Sort: Most Favorites</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <p className="text-gray-400 text-sm p-4">No Pokemon found.</p>
          )}
          {filtered.map(p => (
            <button
              key={p.id}
              onClick={() => { setSelected(p); setEditing(null); }}
              className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                selected?.id === p.id
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{p.name}</span>
                {p.pokedexNumber && <span className="text-xs text-gray-400">#{p.pokedexNumber}</span>}
                <HabitatBadge habitat={p.idealHabitat} />
                <span className="ml-auto text-xs text-gray-400">{p.favorites.length} favs</span>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          {selected ? (
            <div>
              <div className="flex justify-end gap-2 mb-3">
                <button className="btn-sm" onClick={() => setEditing(selected)}>Edit</button>
                <button className="btn-sm text-red-600 hover:bg-red-50" onClick={() => {
                  dispatch({ type: 'DELETE_POKEMON', payload: selected.id });
                  setSelected(null);
                }}>Delete</button>
              </div>
              <PokemonDetail pokemon={selected} allPokemon={state.pokemon} allFurniture={state.furniture} />
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Select a Pokemon to see details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
