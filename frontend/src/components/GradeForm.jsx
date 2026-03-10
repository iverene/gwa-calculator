import { useState, useCallback } from 'react';
import { Plus, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import { calcGWA } from '../lib/supabase';

const emptyRow = () => ({ id: crypto.randomUUID(), subject_name: '', grade: '', units: '' });

export default function GradeForm({ initialData, onSubmit, onCancel, isEdit = false }) {
  const [srCode, setSrCode] = useState(initialData?.sr_code ?? '');
  const [name, setName] = useState(initialData?.name ?? '');
  const [subjects, setSubjects] = useState(
    initialData?.subjects?.length
      ? initialData.subjects.map((s) => ({ ...s, id: crypto.randomUUID() }))
      : [emptyRow(), emptyRow()]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => {
    setSrCode('');
    setName('');
    setSubjects([emptyRow(), emptyRow()]);
    setError('');
  };

  const addRow = () => setSubjects((prev) => [...prev, emptyRow()]);

  const removeRow = (id) => {
    if (subjects.length <= 1) return;
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const updateRow = (id, field, value) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const liveGWA = calcGWA(subjects);
  const hasValidSubjects = subjects.some(
    (s) => s.grade !== '' && s.units !== '' && !isNaN(parseFloat(s.grade)) && !isNaN(parseFloat(s.units))
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError('');

      if (!srCode.trim()) return setError('SR-Code is required.');
      if (!name.trim()) return setError('Name is required.');
      if (!hasValidSubjects) return setError('Add at least one valid subject with grade and units.');

      const validSubjects = subjects.filter(
        (s) => s.grade !== '' && s.units !== '' && !isNaN(parseFloat(s.grade)) && !isNaN(parseFloat(s.units))
      );

      for (const s of validSubjects) {
        const g = parseFloat(s.grade);
        if (g < 1.0 || g > 5.0) return setError('Grades must be between 1.0 and 5.0.');
        if (parseFloat(s.units) <= 0) return setError('Units must be greater than 0.');
      }

      setLoading(true);
      try {
        await onSubmit({ sr_code: srCode.trim(), name: name.trim(), subjects: validSubjects });
        if (!isEdit) reset();
      } catch (err) {
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    },
    [srCode, name, subjects, hasValidSubjects, onSubmit, isEdit]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Student Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-display font-semibold text-ink-500 uppercase tracking-widest mb-1.5">
            SR-Code
          </label>
          <input
            className="input-field font-mono"
            placeholder="e.g. 21-12345"
            value={srCode}
            onChange={(e) => setSrCode(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-display font-semibold text-ink-500 uppercase tracking-widest mb-1.5">
            Full Name
          </label>
          <input
            className="input-field"
            placeholder="e.g. Juan Dela Cruz"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      {/* Subjects Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-display font-semibold text-ink-500 uppercase tracking-widest">
            Subjects
          </label>
          <span className="text-xs text-ink-400 font-body">{subjects.length} row{subjects.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="border border-ink-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_100px_80px_44px] gap-0 bg-ink-50 border-b border-ink-200">
            {['Subject', 'Grade', 'Units', ''].map((h, i) => (
              <div key={i} className={`px-4 py-2.5 text-xs font-display font-semibold text-ink-400 uppercase tracking-wider ${i === 3 ? 'text-center' : ''}`}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-ink-100">
            {subjects.map((row, idx) => (
              <div key={row.id} className="grid grid-cols-[1fr_100px_80px_44px] gap-0 group animate-in">
                <div className="px-3 py-2.5">
                  <input
                    className="w-full bg-transparent text-sm text-ink-800 placeholder-ink-300 focus:outline-none font-body"
                    placeholder={`Subject ${idx + 1}`}
                    value={row.subject_name}
                    onChange={(e) => updateRow(row.id, 'subject_name', e.target.value)}
                  />
                </div>
                
                <div className="px-3 py-2.5 border-l border-ink-100">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    className="w-full bg-transparent text-sm text-ink-800 placeholder-ink-300 focus:outline-none font-mono text-center"
                    placeholder="3"
                    value={row.units}
                    onChange={(e) => updateRow(row.id, 'units', e.target.value)}
                  />
                </div>
                <div className="px-3 py-2.5 border-l border-ink-100">
                  <input
                    type="number"
                    step="0.25"
                    min="1.0"
                    max="5.0"
                    className="w-full bg-transparent text-sm text-ink-800 placeholder-ink-300 focus:outline-none font-mono text-center"
                    placeholder="1.0"
                    value={row.grade}
                    onChange={(e) => updateRow(row.id, 'grade', e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-center border-l border-ink-100">
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={subjects.length <= 1}
                    className="btn-danger disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={addRow}
          className="mt-3 flex items-center gap-1.5 text-xs font-display font-medium text-ink-400 hover:text-accent transition-colors duration-150"
        >
          <Plus size={13} />
          Add subject
        </button>
      </div>

      {/* Live GWA Preview */}
      {hasValidSubjects && (
        <div className="flex items-center gap-3 p-4 bg-ink-50 rounded-xl border border-ink-100 animate-in">
          <div className="flex-1">
            <p className="text-xs font-display font-semibold text-ink-400 uppercase tracking-widest mb-0.5">
              Computed GWA
            </p>
            <p className="text-xs text-ink-400 font-body">Based on current inputs</p>
          </div>
          <div className="text-right">
            <span className="font-mono font-semibold text-2xl text-ink-900">{liveGWA.toFixed(4)}</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 font-body bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-in">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-accent flex items-center gap-2 flex-1 justify-center">
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <ChevronRight size={14} />
          )}
          {loading ? 'Saving…' : isEdit ? 'Update Record' : 'Calculate & Save'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}