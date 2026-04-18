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

function Sidebar() {
  return (
    <aside className="w-48 shrink-0 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="px-4 py-5 border-b border-gray-700">
        <h1 className="text-lg font-bold leading-tight">Pokopia<br />Housing</h1>
      </div>
      <nav className="flex-1 py-4">
        {NAV_ITEMS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `block px-4 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">{children}</main>
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
