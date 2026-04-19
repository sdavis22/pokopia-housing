import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { Pokemon } from '../types';
import { PokemonSprite } from '../components/PokemonSprite';
import {
  allCompatiblePairs,
  allCompatibleGroups,
  groupsContainingSeed,
  type CompatibilityGroup,
} from '../utils/scoring';
import { ISLANDS } from '../config/scoring';
import { groupHasEvoLinePair } from '../config/evoLines';

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

function GroupRow({ group }: { group: CompatibilityGroup }) {
  const allSameHabitat = group.members.every(p => p.idealHabitat === group.members[0].idealHabitat);
  return (
    <li className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg hover:bg-gray-50">
      <div className="flex flex-wrap items-center gap-1 min-w-0">
        {group.members.map((p, i) => (
          <span key={p.id} className="inline-flex items-center gap-0.5 text-sm text-gray-800">
            {i > 0 && <span className="text-gray-400 mx-0.5">+</span>}
            <PokemonSprite pokemon={p} size="xs" />
            {p.name}
          </span>
        ))}
        {allSameHabitat && (
          <HabitatBadge habitat={group.members[0].idealHabitat} />
        )}
      </div>
      <span className="shrink-0 bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
        {group.score}pts
      </span>
    </li>
  );
}

function SeedPicker({
  allPokemon,
  seed,
  onSelect,
}: {
  allPokemon: Pokemon[];
  seed: Pokemon | null;
  onSelect: (p: Pokemon | null) => void;
}) {
  const [query, setQuery] = useState(seed?.name ?? '');
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allPokemon.filter(p => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [allPokemon, query]);

  function pick(p: Pokemon) {
    setQuery(p.name);
    setOpen(false);
    onSelect(p);
  }

  function clear() {
    setQuery('');
    setOpen(false);
    onSelect(null);
  }

  return (
    <div className="relative w-full">
      <div className="flex gap-1">
        <input
          className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-indigo-400"
          placeholder="Seed pokemon…"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); onSelect(null); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {seed && (
          <button
            className="text-xs text-gray-400 hover:text-gray-600 px-1"
            onClick={clear}
          >
            ✕
          </button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-200 rounded shadow-md mt-1 w-full text-sm">
          {suggestions.map(p => (
            <li
              key={p.id}
              className="px-3 py-1.5 hover:bg-indigo-50 cursor-pointer"
              onMouseDown={() => pick(p)}
            >
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const PAGE_SIZE = 50;

export default function PairsPage() {
  const { state } = useApp();
  const { pokemon } = state;

  const [groupSize, setGroupSize] = useState<2 | 3 | 4>(2);
  const [search, setSearch] = useState('');
  const [filterHabitat, setFilterHabitat] = useState('');
  const [filterIsland, setFilterIsland] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [seed, setSeed] = useState<Pokemon | null>(null);
  const [hideEvoLines, setHideEvoLines] = useState(false);
  const [page, setPage] = useState(1);

  // Reset page when filters/size/seed change
  useEffect(() => { setPage(1); }, [groupSize, search, filterHabitat, filterIsland, minScore, seed, hideEvoLines]);

  // --- Global pairs (always computed, fast) ---
  const pairs = useMemo(() => allCompatiblePairs(pokemon), [pokemon]);

  // --- Global trios/quartets (expensive — compute async) ---
  const [globalGroups, setGlobalGroups] = useState<CompatibilityGroup[]>([]);
  const [computing, setComputing] = useState(false);

  useEffect(() => {
    if (seed || groupSize === 2) return;
    setComputing(true);
    setGlobalGroups([]);
    const pool = filterIsland ? pokemon.filter(p => p.island === filterIsland) : pokemon;
    const id = setTimeout(() => {
      const result = allCompatibleGroups(pool, groupSize as 3 | 4);
      setGlobalGroups(result);
      setComputing(false);
    }, 0);
    return () => clearTimeout(id);
  }, [pokemon, groupSize, seed, filterIsland]);

  // --- Seed groups ---
  const [seedGroups, setSeedGroups] = useState<CompatibilityGroup[]>([]);
  const [seedComputing, setSeedComputing] = useState(false);

  useEffect(() => {
    if (!seed || groupSize === 2) return;
    setSeedComputing(true);
    setSeedGroups([]);
    const pool = filterIsland ? pokemon.filter(p => p.island === filterIsland || p.id === seed.id) : pokemon;
    const id = setTimeout(() => {
      const result = groupsContainingSeed(seed, pool, groupSize as 3 | 4);
      setSeedGroups(result);
      setSeedComputing(false);
    }, 0);
    return () => clearTimeout(id);
  }, [seed, pokemon, groupSize, filterIsland]);

  // --- Pick the active raw result set ---
  const activeGroups: CompatibilityGroup[] = useMemo(() => {
    if (groupSize === 2) {
      // In seed mode, filter pairs by seed membership
      if (seed) return pairs.filter(g => g.members.some(p => p.id === seed.id));
      return pairs;
    }
    if (seed) return seedGroups;
    return globalGroups;
  }, [groupSize, seed, pairs, seedGroups, globalGroups]);

  const isLoading = (computing || seedComputing) && groupSize !== 2;

  // --- Apply filters ---
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return activeGroups.filter(g => {
      if (q && !g.members.some(p => p.name.toLowerCase().includes(q))) return false;
      if (filterHabitat && !g.members.some(p => p.idealHabitat === filterHabitat)) return false;
      if (filterIsland && !g.members.every(p => p.island === filterIsland)) return false;
      if (g.score < minScore) return false;
      if (hideEvoLines && groupHasEvoLinePair(g.members.map(p => p.id))) return false;
      return true;
    });
  }, [activeGroups, search, filterHabitat, filterIsland, minScore, hideEvoLines]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageSlice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SIZE_LABELS: Record<number, string> = { 2: 'Pairs', 3: 'Trios', 4: 'Quartets' };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Compatibility Explorer</h2>

      {/* Group size tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {([2, 3, 4] as const).map(size => (
          <button
            key={size}
            onClick={() => setGroupSize(size)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              groupSize === size
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {SIZE_LABELS[size]}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          className="border border-gray-300 rounded px-2 py-1.5 text-sm w-full focus:outline-none focus:border-indigo-400"
          placeholder="Search by name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
          value={filterHabitat}
          onChange={e => setFilterHabitat(e.target.value)}
        >
          <option value="">All habitats</option>
          {['Warm', 'Bright', 'Humid', 'Dark', 'Dry', 'Cool'].map(h => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>

        <select
          className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
          value={filterIsland}
          onChange={e => setFilterIsland(e.target.value)}
        >
          <option value="">All islands</option>
          {ISLANDS.map(i => <option key={i} value={i}>{i}</option>)}
        </select>

        <select
          className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-400"
          value={minScore}
          onChange={e => setMinScore(Number(e.target.value))}
        >
          <option value={0}>Any score</option>
          <option value={2}>≥ 2 pts</option>
          <option value={5}>≥ 5 pts</option>
          <option value={7}>≥ 7 pts</option>
          <option value={10}>≥ 10 pts</option>
        </select>

        <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hideEvoLines}
            onChange={e => setHideEvoLines(e.target.checked)}
            className="accent-indigo-600"
          />
          Hide evo lines
        </label>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm text-gray-500 shrink-0">Seed:</span>
          <div className="flex-1">
            <SeedPicker allPokemon={pokemon} seed={seed} onSelect={setSeed} />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            Computing {SIZE_LABELS[groupSize].toLowerCase()}…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            No {SIZE_LABELS[groupSize].toLowerCase()} match your filters.
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
              <span className="text-xs text-gray-400">
                {filtered.length.toLocaleString()} {SIZE_LABELS[groupSize].toLowerCase()}
                {seed ? ` containing ${seed.name}` : ''}
              </span>
              {totalPages > 1 && (
                <span className="text-xs text-gray-400">
                  Page {page} of {totalPages}
                </span>
              )}
            </div>
            <ul className="divide-y divide-gray-50 px-1 py-1">
              {pageSlice.map((g, i) => (
                <GroupRow key={i} group={g} />
              ))}
            </ul>
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-3 py-2 border-t border-gray-100">
                <button
                  className="text-sm text-indigo-600 disabled:text-gray-300"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  ← Prev
                </button>
                <button
                  className="text-sm text-indigo-600 disabled:text-gray-300"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
