import { createContext, useContext, useReducer, useEffect, useState, type ReactNode } from 'react';
import type { AppData } from '../types';
import { appReducer, EMPTY_STATE, type AppAction } from './appReducer';

const STORAGE_KEY = 'pokopia-data';

type AppContextValue = {
  state: AppData;
  dispatch: React.Dispatch<AppAction>;
  loading: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

function loadFromStorage(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppData;
  } catch {
    // corrupt storage, start fresh
  }
  return null;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, EMPTY_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      dispatch({ type: 'IMPORT_DATA', payload: stored });
      setLoading(false);
      return;
    }
    // No stored data — fetch seed from public/data/seed.json
    fetch('/data/seed.json')
      .then(r => r.json())
      .then((data: AppData) => dispatch({ type: 'IMPORT_DATA', payload: data }))
      .catch(() => {/* start empty if fetch fails */})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, loading]);

  return (
    <AppContext.Provider value={{ state, dispatch, loading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
