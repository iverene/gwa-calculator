import { useState, useEffect, useCallback } from 'react';
import { GraduationCap, CheckCircle, AlertTriangle } from 'lucide-react';
import GradeForm from './components/GradeForm';
import RecordsTable from './components/RecordsTable';
import StudentModal from './components/StudentModal';
import { getStudents, createStudent, updateStudent, deleteStudent } from './lib/supabase';
import './index.css';

export default function App() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getStudents();
      setRecords(data || []);
    } catch (err) {
      showToast('Failed to load records. Check your Supabase config.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const handleCreate = async (data) => {
    const student = await createStudent(data);
    setRecords((prev) => [student, ...prev]);
    showToast(`GWA of ${parseFloat(student.gwa).toFixed(2)} saved for ${student.name}!`);
  };

  const handleUpdate = async (id, data) => {
    const newGWA = await updateStudent(id, data);
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, ...data, gwa: newGWA }
          : r
      )
    );
    // Also refresh selected student's subjects
    if (selected?.id === id) {
      setSelected((prev) => ({ ...prev, ...data, gwa: newGWA }));
    }
    showToast('Record updated successfully!');
    return newGWA;
  };

  const handleDelete = async (id) => {
    await deleteStudent(id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    showToast('Record deleted.');
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="grain-overlay" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-ink-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-ink-900 rounded-xl flex items-center justify-center">
              <GraduationCap size={16} className="text-accent" />
            </div>
            <div>
              <h1 className="font-display font-bold text-ink-900 text-base leading-none">GWA Calculator</h1>
              <p className="text-[10px] font-body text-ink-400 mt-0.5 leading-none">General Weighted Average</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs font-body text-ink-400">
              {records.length} record{records.length !== 1 ? 's' : ''} total
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* New Entry Card */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-ink-100" />
            <h2 className="text-xs font-display font-semibold text-ink-400 uppercase tracking-widest whitespace-nowrap">
              New Entry
            </h2>
            <div className="h-px flex-1 bg-ink-100" />
          </div>
          <div className="card p-6 sm:p-8">
            <GradeForm onSubmit={handleCreate} />
          </div>
        </section>

        {/* Records */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-ink-100" />
            <h2 className="text-xs font-display font-semibold text-ink-400 uppercase tracking-widest whitespace-nowrap">
              Student Records
            </h2>
            <div className="h-px flex-1 bg-ink-100" />
          </div>
          <RecordsTable
            records={records}
            loading={loading}
            onSelect={setSelected}
            onDelete={handleDelete}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-ink-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-body text-ink-300">
            GWA Calculator · Formula: GWA = Σ(Grade × Units) / Σ(Units)
          </p>
        </div>
      </footer>

      {/* Modal */}
      {selected && (
        <StudentModal
          student={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg animate-in
          ${toast.type === 'error' ? 'bg-red-900 text-white' : 'bg-ink-900 text-white'}`}>
          {toast.type === 'error'
            ? <AlertTriangle size={14} className="text-red-300 shrink-0" />
            : <CheckCircle size={14} className="text-accent shrink-0" />}
          <p className="text-sm font-body">{toast.msg}</p>
        </div>
      )}
    </div>
  );
}
