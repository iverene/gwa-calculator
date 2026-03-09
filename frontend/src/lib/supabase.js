import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Students CRUD ────────────────────────────────────────────────────────────

export async function getStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('*, subjects(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getStudentById(id) {
  const { data, error } = await supabase
    .from('students')
    .select('*, subjects(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createStudent({ sr_code, name, subjects }) {
  const gwa = calcGWA(subjects);

  const { data: student, error: sErr } = await supabase
    .from('students')
    .insert({ sr_code, name, gwa })
    .select()
    .single();
  if (sErr) throw sErr;

  const subjectRows = subjects.map((s) => ({
    student_id: student.id,
    subject_name: s.subject_name || `Subject ${s.index ?? ''}`,
    grade: parseFloat(s.grade),
    units: parseFloat(s.units),
  }));

  const { error: subErr } = await supabase.from('subjects').insert(subjectRows);
  if (subErr) throw subErr;

  return { ...student, subjects: subjectRows, gwa };
}

export async function updateStudent(id, { sr_code, name, subjects }) {
  const gwa = calcGWA(subjects);

  const { error: sErr } = await supabase
    .from('students')
    .update({ sr_code, name, gwa, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (sErr) throw sErr;

  // Replace all subjects
  const { error: delErr } = await supabase.from('subjects').delete().eq('student_id', id);
  if (delErr) throw delErr;

  const subjectRows = subjects.map((s) => ({
    student_id: id,
    subject_name: s.subject_name || `Subject`,
    grade: parseFloat(s.grade),
    units: parseFloat(s.units),
  }));

  const { error: subErr } = await supabase.from('subjects').insert(subjectRows);
  if (subErr) throw subErr;

  return gwa;
}

export async function deleteStudent(id) {
  const { error } = await supabase.from('students').delete().eq('id', id);
  if (error) throw error;
}

// ─── GWA Formula ─────────────────────────────────────────────────────────────

export function calcGWA(subjects) {
  const valid = subjects.filter(
    (s) => !isNaN(parseFloat(s.grade)) && !isNaN(parseFloat(s.units)) && parseFloat(s.units) > 0
  );
  if (!valid.length) return 0;
  const totalWeighted = valid.reduce((sum, s) => sum + parseFloat(s.grade) * parseFloat(s.units), 0);
  const totalUnits = valid.reduce((sum, s) => sum + parseFloat(s.units), 0);
  return parseFloat((totalWeighted / totalUnits).toFixed(4));
}

export function getGWALabel(gwa) {
  if (gwa <= 1.5) return { label: 'Excellent', cls: 'gwa-excellent' };
  if (gwa <= 2.0) return { label: 'Good', cls: 'gwa-good' };
  if (gwa <= 2.5) return { label: 'Average', cls: 'gwa-average' };
  return { label: 'Poor', cls: 'gwa-poor' };
}

export function exportToCSV(students) {
  const header = ['SR-Code', 'Name', 'GWA', 'Date'];
  const rows = students.map((s) => [
    s.sr_code,
    s.name,
    s.gwa,
    new Date(s.created_at).toLocaleString(),
  ]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gwa-records.csv';
  a.click();
  URL.revokeObjectURL(url);
}
