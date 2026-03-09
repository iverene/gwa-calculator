import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Download, Trash2, ChevronRight } from 'lucide-react';
import { getGWALabel, exportToCSV } from '../lib/supabase';

export default function RecordsTable({ records, onSelect, onDelete, loading }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records
      .filter(
        (r) =>
          r.sr_code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        let av = a[sortKey];
        let bv = b[sortKey];
        if (sortKey === 'created_at') {
          av = new Date(av);
          bv = new Date(bv);
        }
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [records, search, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }) =>
    sortKey === col ? (
      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
    ) : (
      <ChevronDown size={12} className="opacity-30" />
    );

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (deleteConfirm === id) {
      onDelete(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const cols = [
    { key: 'sr_code', label: 'SR-Code', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'gwa', label: 'GWA', sortable: true },
    { key: 'created_at', label: 'Date & Time', sortable: true },
    { key: '_actions', label: '', sortable: false },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            className="input-field pl-9 py-2.5"
            placeholder="Search by SR-Code or Name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => exportToCSV(filtered)}
          disabled={!filtered.length}
          className="btn-secondary flex items-center gap-2 whitespace-nowrap disabled:opacity-40"
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>

      {/* Count */}
      <p className="text-xs font-display text-ink-400">
        {loading ? 'Loading records…' : `${filtered.length} record${filtered.length !== 1 ? 's' : ''}${search ? ' found' : ''}`}
      </p>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50 border-b border-ink-100">
                {cols.map((col) => (
                  <th
                    key={col.key}
                    className={`px-5 py-3.5 text-left text-xs font-display font-semibold text-ink-400 uppercase tracking-widest whitespace-nowrap ${col.sortable ? 'cursor-pointer select-none hover:text-ink-600' : ''}`}
                    onClick={() => col.sortable && toggleSort(col.key)}
                  >
                    <span className="flex items-center gap-1.5">
                      {col.label}
                      {col.sortable && <SortIcon col={col.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="skeleton h-4 rounded w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-14 text-center">
                    <p className="text-ink-300 font-display text-sm">
                      {search ? 'No records match your search.' : 'No records yet. Add a student above.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const { label, cls } = getGWALabel(r.gwa);
                  return (
                    <tr
                      key={r.id}
                      onClick={() => onSelect(r)}
                      className="table-row-hover animate-in"
                    >
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs bg-ink-100 text-ink-600 px-2.5 py-1 rounded-full">
                          {r.sr_code}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-body font-medium text-ink-800">{r.name}</td>
                      <td className="px-5 py-4">
                        <span className={`gwa-badge text-sm ${cls}`}>
                          {parseFloat(r.gwa).toFixed(2)}
                          <span className="ml-2 text-xs opacity-60">{label}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 text-ink-400 font-body text-xs whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString('en-PH', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelect(r)}
                            className="btn-ghost p-2 text-ink-400"
                          >
                            <ChevronRight size={13} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, r.id)}
                            className={`p-2 rounded-lg text-xs font-display transition-all duration-200 ${deleteConfirm === r.id ? 'bg-red-500 text-white px-3' : 'text-red-300 hover:text-red-500 hover:bg-red-50'}`}
                          >
                            {deleteConfirm === r.id ? 'Confirm?' : <Trash2 size={13} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
