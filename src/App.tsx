import { useState } from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import DashboardPage from './pages/DashboardPage';
import PokemonExplorerPage from './pages/PokemonExplorerPage';
import FurnitureExplorerPage from './pages/FurnitureExplorerPage';
import GroupBuilderPage from './pages/GroupBuilderPage';
import PairsPage from './pages/PairsPage';
import IslandsPage from './pages/IslandsPage';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/pokemon', label: 'Pokemon' },
  { to: '/furniture', label: 'Furniture' },
  { to: '/groups', label: 'Groups' },
  { to: '/islands', label: 'Islands' },
  { to: '/pairs', label: 'Compatibility' },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {NAV_ITEMS.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `block px-4 py-2 text-sm font-medium transition-colors ${
              isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-48 shrink-0 min-h-screen bg-gray-900 text-white flex-col">
        <div className="px-4 py-5 border-b border-gray-700">
          <h1 className="text-lg font-bold leading-tight">Pokopia<br />Housing</h1>
        </div>
        <nav className="flex-1 py-4">
          <NavLinks />
        </nav>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white flex items-center px-4 h-12">
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="mr-3 p-1 rounded hover:bg-gray-700 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
        <h1 className="text-base font-bold">Pokopia Housing</h1>
      </div>

      {/* Mobile nav overlay */}
      {menuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-30 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="md:hidden fixed top-12 left-0 bottom-0 z-40 w-56 bg-gray-900 text-white flex flex-col">
            <nav className="flex-1 py-2 overflow-y-auto">
              <NavLinks onNavigate={() => setMenuOpen(false)} />
            </nav>
          </aside>
        </>
      )}

      <main className="flex-1 overflow-auto p-4 md:p-6 pt-16 md:pt-6">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { loading } = useApp();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-3">🏠</div>
          <p className="text-gray-500 text-sm">Loading Pokopia data...</p>
        </div>
      </div>
    );
  }
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/pokemon" element={<PokemonExplorerPage />} />
        <Route path="/furniture" element={<FurnitureExplorerPage />} />
        <Route path="/groups" element={<GroupBuilderPage />} />
        <Route path="/islands" element={<IslandsPage />} />
        <Route path="/pairs" element={<PairsPage />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
}
