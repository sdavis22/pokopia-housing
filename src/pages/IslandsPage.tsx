import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ISLANDS } from '../config/scoring';
import type { Island } from '../config/scoring';

const HABITAT_COLORS: Record<string, string> = {
  Warm: 'bg-orange-100 text-orange-700',
  Bright: 'bg-yellow-100 text-yellow-700',
  Humid: 'bg-teal-100 text-teal-700',
  Dark: 'bg-purple-100 text-purple-700',
  Dry: 'bg-red-100 text-red-700',
  Cool: 'bg-blue-100 text-blue-700',
};

const ISLAND_COLORS: Record<Island, { card: string; header: string; ring: string }> = {
  'Withering Wasteland': { card: 'border-orange-300 bg-orange-50',  header: 'text-orange-800', ring: 'ring-orange-400' },
  'Rocky Ridges':        { card: 'border-stone-300 bg-stone-50',    header: 'text-stone-700',  ring: 'ring-stone-400' },
  'Bleak Beach':         { card: 'border-sky-300 bg-sky-50',        header: 'text-sky-800',    ring: 'ring-sky-400' },
  'Sparkling Skylands':  { card: 'border-violet-300 bg-violet-50',  header: 'text-violet-800', ring: 'ring-violet-400' },
  'Pallet Town':         { card: 'border-green-300 bg-green-50',    header: 'text-green-800',  ring: 'ring-green-400' },
};

type Selection = Island | '__unassigned__';

function IslandEditor({ selected, onClose }: { selected: Selection; onClose: () => void }) {
  const { state, dispatch } = useApp();
  const { pokemon, houseGroups } = state;
  const [pokemonSearch, setPokemonSearch] = useState('');
  const [groupSearch, setGroupSearch] = useState('');

  const isOnSelected = (island?: Island) =>
    selected === '__unassigned__' ? !island : island === selected;

  function setPokemonIsland(pokemonId: string, checked: boolean) {
    const p = pokemon.find(pk => pk.id === pokemonId);
    if (!p) return;
    const island = checked && selected !== '__unassigned__' ? selected as Island : undefined;
    dispatch({ type: 'EDIT_POKEMON', payload: { ...p, island } });
  }

  function setGroupIsland(groupId: string, checked: boolean) {
    const g = houseGroups.find(h => h.id === groupId);
    if (!g) return;
    const island = checked && selected !== '__unassigned__' ? selected as Island : undefined;
    dispatch({ type: 'EDIT_HOUSE', payload: { ...g, island } });
  }

  const filteredPokemon = pokemon
    .filter(p => p.name.toLowerCase().includes(pokemonSearch.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const filteredGroups = houseGroups
    .filter(h => h.name.toLowerCase().includes(groupSearch.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const label = selected === '__unassigned__' ? 'Unassigned' : selected;

  return (
    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">{label}</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {selected === '__unassigned__'
              ? 'Uncheck to move to an island.'
              : 'Check to add residents; uncheck to remove.'}
          </p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {/* Pokemon */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase">Pokemon</p>
            <input
              className="border border-gray-200 rounded px-2 py-0.5 text-xs w-32 focus:outline-none focus:border-indigo-400"
              placeholder="Filter…"
              value={pokemonSearch}
              onChange={e => setPokemonSearch(e.target.value)}
            />
          </div>
          <div className="space-y-0.5 max-h-64 overflow-y-auto">
            {filteredPokemon.map(p => {
              const onThis = isOnSelected(p.island);
              const onOther = !onThis && !!p.island;
              return (
                <label key={p.id} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onThis}
                    onChange={e => setPokemonIsland(p.id, e.target.checked)}
                    className="accent-indigo-600 shrink-0"
                  />
                  <span className="text-sm text-gray-800 flex-1 truncate">{p.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0 ${HABITAT_COLORS[p.idealHabitat] ?? 'bg-gray-100 text-gray-600'}`}>
                    {p.idealHabitat}
                  </span>
                  {onOther && <span className="text-xs text-gray-400 italic truncate max-w-20">{p.island}</span>}
                </label>
              );
            })}
            {filteredPokemon.length === 0 && <p className="text-xs text-gray-400 py-2">No Pokemon match.</p>}
          </div>
        </div>

        {/* Houses */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase">Houses</p>
            <input
              className="border border-gray-200 rounded px-2 py-0.5 text-xs w-32 focus:outline-none focus:border-indigo-400"
              placeholder="Filter…"
              value={groupSearch}
              onChange={e => setGroupSearch(e.target.value)}
            />
          </div>
          {houseGroups.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">No house groups yet.</p>
          ) : (
            <div className="space-y-0.5 max-h-64 overflow-y-auto">
              {filteredGroups.map(h => {
                const onThis = isOnSelected(h.island);
                const onOther = !onThis && !!h.island;
                return (
                  <label key={h.id} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onThis}
                      onChange={e => setGroupIsland(h.id, e.target.checked)}
                      className="accent-indigo-600 shrink-0"
                    />
                    <span className="text-sm text-gray-800 flex-1 truncate">{h.name}</span>
                    <span className="text-xs text-gray-400 shrink-0">{h.pokemonIds.length} mon</span>
                    {onOther && <span className="text-xs text-gray-400 italic truncate max-w-20">{h.island}</span>}
                  </label>
                );
              })}
              {filteredGroups.length === 0 && <p className="text-xs text-gray-400 py-2">No houses match.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IslandsPage() {
  const { state } = useApp();
  const { pokemon, houseGroups } = state;
  const [selected, setSelected] = useState<Selection | null>(null);
  const [unassignedOpen, setUnassignedOpen] = useState(false);

  const islandPokemon = (island: Island) => pokemon.filter(p => p.island === island);
  const islandGroups = (island: Island) => houseGroups.filter(h => h.island === island);
  const unassignedPokemon = pokemon.filter(p => !p.island);
  const unassignedGroups = houseGroups.filter(h => !h.island);

  function toggle(s: Selection) {
    setSelected(prev => (prev === s ? null : s));
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Islands</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ISLANDS.map(island => {
          const colors = ISLAND_COLORS[island];
          const poke = islandPokemon(island);
          const groups = islandGroups(island);
          const isSelected = selected === island;
          return (
            <button
              key={island}
              onClick={() => toggle(island)}
              className={`text-left rounded-lg border-2 p-4 space-y-3 transition-all hover:brightness-95 ${colors.card} ${
                isSelected ? `ring-2 ${colors.ring} ring-offset-2` : ''
              }`}
            >
              <h3 className={`font-bold text-lg ${colors.header}`}>{island}</h3>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Pokemon ({poke.length})</p>
                {poke.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">None assigned</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {poke.map(p => (
                      <span key={p.id} className={`text-xs px-2 py-0.5 rounded-full font-medium ${HABITAT_COLORS[p.idealHabitat] ?? 'bg-gray-100 text-gray-700'}`} title={p.idealHabitat}>
                        {p.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Houses ({groups.length})</p>
                {groups.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">None assigned</p>
                ) : (
                  <ul className="space-y-1">
                    {groups.map(h => (
                      <li key={h.id} className="text-xs flex items-center gap-1.5">
                        <span className="font-medium text-gray-800">{h.name}</span>
                        <span className="text-gray-400">{h.pokemonIds.length} Pokemon</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {(unassignedPokemon.length > 0 || unassignedGroups.length > 0) && (
        <div className={`rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 ${
          selected === '__unassigned__' ? 'ring-2 ring-gray-400 ring-offset-2' : ''
        }`}>
          {/* Header — toggles collapse only */}
          <button
            onClick={() => setUnassignedOpen(o => !o)}
            className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="font-semibold text-gray-500">
              Unassigned
              <span className="ml-2 text-xs font-normal text-gray-400">
                {unassignedPokemon.length} Pokemon · {unassignedGroups.length} houses
              </span>
            </span>
            <span className="text-gray-400 text-xs">{unassignedOpen ? '▲' : '▼'}</span>
          </button>

          {/* Body — clicking opens editor, like island cards */}
          {unassignedOpen && (
            <button
              onClick={() => toggle('__unassigned__')}
              className="w-full text-left px-4 pb-4 hover:brightness-95 transition-all"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Pokemon ({unassignedPokemon.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {unassignedPokemon.map(p => (
                      <span key={p.id} className={`text-xs px-2 py-0.5 rounded-full font-medium ${HABITAT_COLORS[p.idealHabitat] ?? 'bg-gray-100 text-gray-700'}`}>
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Houses ({unassignedGroups.length})</p>
                  <ul className="space-y-1">
                    {unassignedGroups.map(h => (
                      <li key={h.id} className="text-xs text-gray-600">{h.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      {selected && (
        <IslandEditor selected={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
