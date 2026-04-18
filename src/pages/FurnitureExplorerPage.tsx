import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Furniture } from '../types';
import { PokemonSprite } from '../components/PokemonSprite';

function FurnitureForm({ initial, onSave, onCancel, existingIds }: {
  initial?: Partial<Furniture>;
  onSave: (f: Furniture) => void;
  onCancel: () => void;
  existingIds: string[];
}) {
  const { state } = useApp();
  const [id, setId] = useState(initial?.id ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [categories, setCategories] = useState<string[]>(initial?.categories ?? (state.furnitureCategories[0] ? [state.furnitureCategories[0]] : []));
  const [description, setDescription] = useState(initial?.description ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [error, setError] = useState('');
  const isEdit = !!initial?.id;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id.trim() || !name.trim()) { setError('ID and Name are required'); return; }
    if (categories.length === 0) { setError('Select at least one category'); return; }
    if (!isEdit && existingIds.includes(id.trim())) { setError(`ID "${id}" already exists`); return; }
    onSave({
      id: id.trim(),
      name: name.trim(),
      categories,
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">ID</label>
          <input className="input w-full" value={id} onChange={e => setId(e.target.value)} disabled={isEdit} placeholder="mossy-bed" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input className="input w-full" value={name} onChange={e => setName(e.target.value)} placeholder="Mossy Bed" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Categories</label>
        <select
          multiple
          className="input w-full h-28"
          value={categories}
          onChange={e => setCategories([...e.target.selectedOptions].map(o => o.value))}
        >
          {state.furnitureCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <p className="text-xs text-gray-400 mt-1">Hold Cmd/Ctrl to select multiple</p>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <input className="input w-full" value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
        <textarea className="input w-full" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary">{isEdit ? 'Save Changes' : 'Add Furniture'}</button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}

function FurnitureDetail({ furniture }: { furniture: Furniture }) {
  const { state } = useApp();
  const matchingPokemon = state.pokemon.filter(p => furniture.categories.some(c => p.favorites.includes(c)));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{furniture.name}</h3>
        <div className="flex flex-wrap gap-1 mt-1">
          {furniture.categories.map(c => (
            <span key={c} className="inline-block text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{c}</span>
          ))}
        </div>
        {furniture.description && <p className="text-sm text-gray-600 mt-2">{furniture.description}</p>}
        {furniture.notes && <p className="text-sm text-gray-500 mt-1 italic">{furniture.notes}</p>}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Pokemon that love this ({matchingPokemon.length})
        </h4>
        {matchingPokemon.length === 0 ? (
          <p className="text-sm text-gray-400">No Pokemon in your dataset prefer these categories.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {matchingPokemon.map(p => (
              <span key={p.id} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                <PokemonSprite pokemon={p} size="xs" />
                {p.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">House groups that benefit</h4>
        {(() => {
          const benefited = state.houseGroups.filter(h => {
            const members = state.pokemon.filter(p => h.pokemonIds.includes(p.id));
            return members.some(p => furniture.categories.some(c => p.favorites.includes(c)));
          });
          if (benefited.length === 0) return <p className="text-sm text-gray-400">None yet.</p>;
          return (
            <ul className="space-y-1">
              {benefited.map(h => {
                const members = state.pokemon.filter(p => h.pokemonIds.includes(p.id));
                const count = members.filter(p => furniture.categories.some(c => p.favorites.includes(c))).length;
                return (
                  <li key={h.id} className="text-sm flex items-center gap-2">
                    <span className="font-medium">{h.name}</span>
                    <span className="text-gray-400 text-xs">{count}/{members.length} members</span>
                  </li>
                );
              })}
            </ul>
          );
        })()}
      </div>
    </div>
  );
}

export default function FurnitureExplorerPage() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'matches'>('name');
  const [selected, setSelected] = useState<Furniture | null>(null);
  const [editing, setEditing] = useState<Furniture | null | 'new'>(null);

  const filtered = state.furniture
    .filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    .filter(f => !filterCategory || f.categories.includes(filterCategory))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      const aMatches = state.pokemon.filter(p => a.categories.some(c => p.favorites.includes(c))).length;
      const bMatches = state.pokemon.filter(p => b.categories.some(c => p.favorites.includes(c))).length;
      return bMatches - aMatches;
    });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Furniture Explorer</h2>
        <button className="btn-primary" onClick={() => { setEditing('new'); setSelected(null); }}>+ Add Furniture</button>
      </div>

      {editing && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3">{editing === 'new' ? 'Add Furniture' : `Edit ${(editing as Furniture).name}`}</h3>
          <FurnitureForm
            initial={editing === 'new' ? {} : editing as Furniture}
            existingIds={state.furniture.map(f => f.id)}
            onSave={f => {
              dispatch({ type: editing === 'new' ? 'ADD_FURNITURE' : 'EDIT_FURNITURE', payload: f });
              setEditing(null);
              setSelected(f);
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          className="input flex-1 min-w-0"
          placeholder="Search furniture..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All categories</option>
          {state.furnitureCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value as 'name' | 'matches')}>
          <option value="name">Sort: Name</option>
          <option value="matches">Sort: Most Pokemon Matches</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <p className="text-gray-400 text-sm p-4">No furniture found.</p>
          )}
          {filtered.map(f => {
            const matches = state.pokemon.filter(p => f.categories.some(c => p.favorites.includes(c))).length;
            return (
              <button
                key={f.id}
                onClick={() => { setSelected(f); setEditing(null); }}
                className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                  selected?.id === f.id
                    ? 'border-indigo-400 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{f.name}</span>
                  {f.categories.map(c => (
                    <span key={c} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{c}</span>
                  ))}
                  <span className="ml-auto text-xs text-gray-400">{matches} Pokemon</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          {selected ? (
            <div>
              <div className="flex justify-end gap-2 mb-3">
                <button className="btn-sm" onClick={() => setEditing(selected)}>Edit</button>
                <button className="btn-sm text-red-600 hover:bg-red-50" onClick={() => {
                  dispatch({ type: 'DELETE_FURNITURE', payload: selected.id });
                  setSelected(null);
                }}>Delete</button>
              </div>
              <FurnitureDetail furniture={selected} />
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Select a furniture item to see details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
