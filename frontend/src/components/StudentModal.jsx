import { useState } from 'react';
import { X, Edit3, CheckCircle } from 'lucide-react';
import GradeForm from './GradeForm';
import { getGWALabel } from '../lib/supabase';

export default function StudentModal({ student, onClose, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [successGWA, setSuccessGWA] = useState(null);

  const { label, cls } = getGWALabel(student.gwa);

  const handleUpdate = async (data) => {
    const newGWA = await onUpdate(student.id, data);
    setSuccessGWA(newGWA);
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl card p-0 overflow-hidden animate-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-ink-100 sticky top-0 bg-white z-10">
          <div>
            <span className="font-mono text-xs bg-ink-100 text-ink-600 px-2.5 py-1 rounded-full">
              {student.sr_code}
            </span>
            <h2 className="font-display font-bold text-xl text-ink-900 mt-2">{student.name}</h2>
            {!editing && (
              <div className="flex items-center gap-3 mt-2">
                <span className={`gwa-badge ${cls}`}>{parseFloat(student.gwa).toFixed(2)}</span>
                <span className="text-xs text-ink-400 font-display">{label}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary flex items-center gap-1.5 text-xs"
              >
                <Edit3 size={12} />
                Edit
              </button>
            )}
            <button onClick={onClose} className="btn-ghost p-2">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Success message */}
          {successGWA !== null && !editing && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-5 animate-in">
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-display font-semibold text-emerald-800">Record updated!</p>
                <p className="text-xs text-emerald-600 mt-0.5">New GWA: <span className="font-mono font-semibold">{parseFloat(successGWA).toFixed(4)}</span></p>
              </div>
            </div>
          )}

          {editing ? (
            <GradeForm
              initialData={student}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(false)}
              isEdit
            />
          ) : (
            <>
              {/* Subject breakdown */}
              <h3 className="text-xs font-display font-semibold text-ink-400 uppercase tracking-widest mb-3">
                Subject Breakdown
              </h3>
              <div className="card overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-ink-50 border-b border-ink-100">
                      {['Subject', 'Grade', 'Units', 'Weighted'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-display font-semibold text-ink-400 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {(student.subjects || []).map((s, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-body text-ink-700">{s.subject_name || `Subject ${i + 1}`}</td>
                        <td className="px-4 py-3 font-mono text-ink-600">{parseFloat(s.grade).toFixed(2)}</td>
                        <td className="px-4 py-3 font-mono text-ink-600">{s.units}</td>
                        <td className="px-4 py-3 font-mono text-ink-500 text-xs">
                          {(parseFloat(s.grade) * parseFloat(s.units)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-ink-50 border-t border-ink-200">
                      <td className="px-4 py-3 text-xs font-display font-semibold text-ink-500 uppercase tracking-wider">Total</td>
                      <td className="px-4 py-3" />
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-ink-700">
                        {(student.subjects || []).reduce((s, x) => s + parseFloat(x.units), 0)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-ink-700">
                        {(student.subjects || []).reduce((s, x) => s + parseFloat(x.grade) * parseFloat(x.units), 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <p className="text-xs text-ink-400 font-body">
                Recorded on {new Date(student.created_at).toLocaleString('en-PH', {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
