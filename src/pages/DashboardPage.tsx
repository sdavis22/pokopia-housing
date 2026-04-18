import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { allCompatiblePairs } from '../utils/scoring';
import { PokemonSprite } from '../components/PokemonSprite';

export default function DashboardPage() {
  const { state, dispatch } = useApp();
  const { pokemon, furniture, houseGroups, furnitureCategories } = state;

  const isEmpty = pokemon.length === 0 && furniture.length === 0;

  const topPairs = useMemo(
    () => allCompatiblePairs(pokemon).slice(0, 5),
    [pokemon],
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {isEmpty && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          No data yet.{' '}
          <button
            className="underline font-medium"
            onClick={() => dispatch({ type: 'LOAD_SAMPLE' })}
          >
            Load sample data
          </button>{' '}
          to get started.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pokemon', value: pokemon.length, to: '/pokemon' },
          { label: 'Furniture Items', value: furniture.length, to: '/furniture' },
          { label: 'House Groups', value: houseGroups.length, to: '/groups' },
          { label: 'Categories', value: furnitureCategories.length, to: '/furniture' },
        ].map(({ label, value, to }) => (
          <Link
            key={label}
            to={to}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-indigo-400 transition-colors"
          >
            <div className="text-3xl font-bold text-indigo-600">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Saved House Groups</h3>
          {houseGroups.length === 0 ? (
            <p className="text-sm text-gray-400">No groups yet. <Link to="/groups" className="text-indigo-600 underline">Build one</Link>.</p>
          ) : (
            <ul className="space-y-2">
              {houseGroups.map(h => (
                <li key={h.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-800">{h.name}</span>
                  <span className="text-gray-400">{h.pokemonIds.length} Pokemon</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-700">Top Compatible Pairs</h3>
            {topPairs.length > 0 && (
              <Link to="/pairs" className="text-xs text-indigo-600 hover:underline">View all →</Link>
            )}
          </div>
          {topPairs.length === 0 ? (
            <p className="text-sm text-gray-400">Add at least 2 Pokemon to see compatibility.</p>
          ) : (
            <ul className="space-y-2">
              {topPairs.map((pair, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-800">
                    <PokemonSprite pokemon={pair.members[0]} size="xs" />
                    {pair.members[0].name}
                    <span className="text-gray-400 mx-0.5">+</span>
                    <PokemonSprite pokemon={pair.members[1]} size="xs" />
                    {pair.members[1].name}
                  </span>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {pair.score}pts
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Link to="/pokemon" className="btn-primary">Browse Pokemon</Link>
        <Link to="/furniture" className="btn-primary">Browse Furniture</Link>
        <Link to="/groups" className="btn-primary">Build a Group</Link>
      </div>
    </div>
  );
}
