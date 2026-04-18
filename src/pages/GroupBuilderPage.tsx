import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { HouseGroup, Pokemon } from '../types';
import { ISLANDS } from '../config/scoring';
import { computeHouseAnalysis, rankFurnitureForHouse } from '../utils/scoring';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function TagChip({ label, color = 'gray' }: { label: string; color?: 'gray' | 'green' | 'yellow' | 'red' | 'indigo' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  };
  return <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${colors[color]}`}>{label}</span>;
}

function HouseSummary({ members, selectedFurnitureIds }: { members: Pokemon[]; selectedFurnitureIds: string[] }) {
  const { state } = useApp();
  if (members.length === 0) return <p className="text-sm text-gray-400">Add Pokemon to see analysis.</p>;

  const analysis = computeHouseAnalysis(members);
  const rankedFurniture = rankFurnitureForHouse(state.furniture, members, selectedFurnitureIds).slice(0, 8);

  const chartData = rankedFurniture.map(({ furniture, coveredBy }) => ({
    name: furniture.name.length > 16 ? furniture.name.slice(0, 14) + '…' : furniture.name,
    members: coveredBy.length,
  }));

  const habitatGroups = Object.entries(analysis.habitatBreakdown);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Cohesion Score:</span>
        <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-0.5 rounded-full">{analysis.cohesionScore}</span>
      </div>

      {habitatGroups.length > 1 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Habitat Mix</p>
          <div className="flex flex-wrap gap-2">
            {habitatGroups.map(([h, ids]) => (
              <span key={h} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                {h}: {ids.length}
              </span>
            ))}
          </div>
        </div>
      )}

      {analysis.sharedFavorites.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-green-600 uppercase mb-1">Shared by All</p>
          <div className="flex flex-wrap gap-1">
            {analysis.sharedFavorites.map(f => <TagChip key={f} label={f} color="green" />)}
          </div>
        </div>
      )}

      {analysis.partialFavorites.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-yellow-600 uppercase mb-1">Shared by Some</p>
          <div className="flex flex-wrap gap-1">
            {analysis.partialFavorites.map(f => <TagChip key={f} label={f} color="yellow" />)}
          </div>
        </div>
      )}

      {analysis.outlierFavorites.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase mb-1">Outlier Favorites</p>
          <div className="flex flex-wrap gap-1">
            {analysis.outlierFavorites.map(f => <TagChip key={f} label={f} color="red" />)}
          </div>
        </div>
      )}

      {rankedFurniture.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Top Furniture Suggestions</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
              <Tooltip formatter={(v) => [`${v} members`, 'Covered by']} />
              <Bar dataKey="members" fill="#6366f1" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function CompatibilityMatrix({ members }: { members: Pokemon[] }) {
  if (members.length < 2) return null;
  const { state } = useApp();
  const allPokemon = state.pokemon;

  const maxScore = 10;

  return (
    <div className="overflow-x-auto">
      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Compatibility Matrix</p>
      <table className="text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-1" />
            {members.map(p => (
              <th key={p.id} className="p-1 text-center font-medium text-gray-600 max-w-16 truncate">{p.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map(a => (
            <tr key={a.id}>
              <td className="p-1 font-medium text-gray-600 pr-2 whitespace-nowrap">{a.name}</td>
              {members.map(b => {
                if (a.id === b.id) return <td key={b.id} className="p-1 w-10 h-8 bg-gray-100" />;
                const score = allPokemon ? (() => {
                  const sharedFavs = a.favorites.filter(f => b.favorites.includes(f)).length;
                  const habitatBonus = a.idealHabitat === b.idealHabitat ? 3 : 0;
                  return sharedFavs * 2 + habitatBonus;
                })() : 0;
                const intensity = Math.min(score / maxScore, 1);
                const bg = `rgba(99, 102, 241, ${0.1 + intensity * 0.7})`;
                return (
                  <td
                    key={b.id}
                    className="p-1 w-10 h-8 text-center font-semibold rounded"
                    style={{ backgroundColor: bg, color: intensity > 0.5 ? 'white' : '#374151' }}
                    title={`${a.name} + ${b.name}: ${score}pts`}
                  >
                    {score}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GroupBuilderPage() {
  const { state, dispatch } = useApp();
  const [selectedGroup, setSelectedGroup] = useState<HouseGroup | null>(null);
  const [newName, setNewName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  const activeGroup = selectedGroup
    ? state.houseGroups.find(h => h.id === selectedGroup.id) ?? null
    : null;

  const members = activeGroup
    ? state.pokemon.filter(p => activeGroup.pokemonIds.includes(p.id))
    : [];

  function createGroup() {
    if (!newName.trim()) return;
    const group: HouseGroup = {
      id: `house-${Date.now()}`,
      name: newName.trim(),
      pokemonIds: [],
      selectedFurnitureIds: [],
    };
    dispatch({ type: 'ADD_HOUSE', payload: group });
    setSelectedGroup(group);
    setNewName('');
    setShowNewForm(false);
  }

  function togglePokemon(pokemonId: string) {
    if (!activeGroup) return;
    const ids = activeGroup.pokemonIds.includes(pokemonId)
      ? activeGroup.pokemonIds.filter(id => id !== pokemonId)
      : [...activeGroup.pokemonIds, pokemonId];
    dispatch({ type: 'EDIT_HOUSE', payload: { ...activeGroup, pokemonIds: ids } });
    setSelectedGroup({ ...activeGroup, pokemonIds: ids });
  }

  function toggleFurniture(furnitureId: string) {
    if (!activeGroup) return;
    const ids = activeGroup.selectedFurnitureIds ?? [];
    const updated = ids.includes(furnitureId)
      ? ids.filter(id => id !== furnitureId)
      : [...ids, furnitureId];
    dispatch({ type: 'EDIT_HOUSE', payload: { ...activeGroup, selectedFurnitureIds: updated } });
    setSelectedGroup({ ...activeGroup, selectedFurnitureIds: updated });
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Group Builder</h2>
        <button className="btn-primary" onClick={() => setShowNewForm(true)}>+ New Group</button>
      </div>

      {showNewForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex gap-2">
          <input
            className="input flex-1"
            placeholder="House name..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createGroup()}
            autoFocus
          />
          <button className="btn-primary" onClick={createGroup}>Create</button>
          <button className="btn-secondary" onClick={() => setShowNewForm(false)}>Cancel</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* House List */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Your Houses</h3>
          {state.houseGroups.length === 0 ? (
            <p className="text-sm text-gray-400">No groups yet. Create one above.</p>
          ) : (
            <div className="space-y-1">
              {state.houseGroups.map(h => (
                <button
                  key={h.id}
                  onClick={() => setSelectedGroup(h)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                    activeGroup?.id === h.id
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-indigo-300'
                  }`}
                >
                  <div className="font-medium text-sm">{h.name}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    {h.pokemonIds.length} Pokemon · {(h.selectedFurnitureIds ?? []).length} furniture
                    {h.island && <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">{h.island}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Builder Panel */}
        {activeGroup ? (
          <>
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-700">{activeGroup.name}</h3>
                  <button
                    className="text-xs text-red-500 hover:text-red-700"
                    onClick={() => {
                      dispatch({ type: 'DELETE_HOUSE', payload: activeGroup.id });
                      setSelectedGroup(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                  <label className="text-xs font-medium text-gray-500 shrink-0">Island</label>
                  <select
                    className="input text-sm py-1 flex-1"
                    value={activeGroup.island ?? ''}
                    onChange={e => {
                      const updated = { ...activeGroup, island: e.target.value as HouseGroup['island'] || undefined };
                      dispatch({ type: 'EDIT_HOUSE', payload: updated });
                      setSelectedGroup(updated);
                    }}
                  >
                    <option value="">— Unassigned —</option>
                    {ISLANDS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Add/Remove Pokemon</h4>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {state.pokemon.length === 0 && <p className="text-sm text-gray-400">No Pokemon yet.</p>}
                  {state.pokemon
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(p => {
                      const inGroup = activeGroup.pokemonIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => togglePokemon(p.id)}
                          className={`w-full text-left text-sm px-2 py-1 rounded flex items-center gap-2 transition-colors ${
                            inGroup ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-gray-100'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-xs ${
                            inGroup ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300'
                          }`}>
                            {inGroup ? '✓' : ''}
                          </span>
                          {p.name}
                          <span className="text-xs text-gray-400 ml-auto">{p.idealHabitat}</span>
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Assign Furniture</h4>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {state.furniture.length === 0 && <p className="text-sm text-gray-400">No furniture yet.</p>}
                  {state.furniture
                    .filter(f => members.some(p => f.categories.some(c => p.favorites.includes(c))))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(f => {
                      const selected = (activeGroup.selectedFurnitureIds ?? []).includes(f.id);
                      const coveredCount = members.filter(p => f.categories.some(c => p.favorites.includes(c))).length;
                      return (
                        <button
                          key={f.id}
                          onClick={() => toggleFurniture(f.id)}
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
                          <span className="text-xs text-gray-400">{coveredCount}/{members.length}</span>
                        </button>
                      );
                    })}
                  {members.length > 0 && state.furniture.filter(f => members.some(p => f.categories.some(c => p.favorites.includes(c)))).length === 0 && (
                    <p className="text-sm text-gray-400">No matching furniture for current members.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">House Analysis</h4>
                <HouseSummary members={members} selectedFurnitureIds={activeGroup.selectedFurnitureIds ?? []} />
              </div>
              {members.length >= 2 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <CompatibilityMatrix members={members} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="col-span-2 flex items-center justify-center text-gray-400 text-sm">
            Select or create a house group to get started.
          </div>
        )}
      </div>
    </div>
  );
}
