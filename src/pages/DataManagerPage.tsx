import { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportToJson, parseImport } from '../utils/importExport';

export default function DataManagerPage() {
  const { state, dispatch } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const result = parseImport(text);
      if (result.success) {
        dispatch({ type: 'IMPORT_DATA', payload: result.data });
        setImportErrors([]);
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportErrors(result.errors);
        setImportSuccess(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function addCategory() {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    dispatch({ type: 'ADD_FURNITURE_CATEGORY', payload: trimmed });
    setNewCategory('');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Data Manager</h2>

      {/* Import / Export */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <h3 className="font-semibold text-gray-700">Import / Export</h3>

        <div className="flex gap-3 flex-wrap">
          <button className="btn-primary" onClick={() => exportToJson(state)}>
            Export JSON
          </button>
          <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
            Import JSON
          </button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFileImport} />
          <button
            className="btn-secondary"
            onClick={() => dispatch({ type: 'LOAD_SAMPLE' })}
          >
            Load Sample Data
          </button>
        </div>

        {importSuccess && (
          <p className="text-green-600 text-sm">Import successful!</p>
        )}
        {importErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-sm font-semibold text-red-700 mb-1">Import errors:</p>
            <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
              {importErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Data Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="font-semibold text-gray-700 mb-3">Current Data</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Pokemon</span><span className="font-medium">{state.pokemon.length}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Furniture</span><span className="font-medium">{state.furniture.length}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">House Groups</span><span className="font-medium">{state.houseGroups.length}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Categories</span><span className="font-medium">{state.furnitureCategories.length}</span></div>
        </div>
      </div>

      {/* Furniture Categories */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
        <h3 className="font-semibold text-gray-700">Furniture Categories</h3>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="New category name..."
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
          />
          <button className="btn-primary" onClick={addCategory}>Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {state.furnitureCategories.map(c => (
            <span key={c} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-sm px-3 py-1 rounded-full">
              {c}
              <button
                className="text-indigo-400 hover:text-red-500 ml-1 font-bold leading-none"
                onClick={() => dispatch({ type: 'DELETE_FURNITURE_CATEGORY', payload: c })}
                title="Remove category"
              >
                ×
              </button>
            </span>
          ))}
          {state.furnitureCategories.length === 0 && (
            <p className="text-sm text-gray-400">No categories yet.</p>
          )}
        </div>
      </div>

      {/* Reset */}
      <div className="bg-white border border-red-200 rounded-lg p-5">
        <h3 className="font-semibold text-red-700 mb-2">Danger Zone</h3>
        {confirmReset ? (
          <div className="space-y-2">
            <p className="text-sm text-red-600">This will delete all your Pokemon, furniture, and house groups. Are you sure?</p>
            <div className="flex gap-2">
              <button
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-1.5 rounded"
                onClick={() => { dispatch({ type: 'RESET' }); setConfirmReset(false); }}
              >
                Yes, reset everything
              </button>
              <button className="btn-secondary" onClick={() => setConfirmReset(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button
            className="border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium px-3 py-1.5 rounded transition-colors"
            onClick={() => setConfirmReset(true)}
          >
            Reset All Data
          </button>
        )}
      </div>
    </div>
  );
}
