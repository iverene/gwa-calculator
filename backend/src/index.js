require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ─── GWA Helper ──────────────────────────────────────────────────────────────
function calcGWA(subjects) {
  const valid = subjects.filter(
    (s) => !isNaN(parseFloat(s.grade)) && !isNaN(parseFloat(s.units)) && parseFloat(s.units) > 0
  );
  if (!valid.length) return 0;
  const totalWeighted = valid.reduce(
    (sum, s) => sum + parseFloat(s.grade) * parseFloat(s.units), 0
  );
  const totalUnits = valid.reduce((sum, s) => sum + parseFloat(s.units), 0);
  return Math.round((totalWeighted / totalUnits) * 100) / 100;
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET all students
app.get('/api/students', async (req, res) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, subjects(*)')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET single student
app.get('/api/students/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('students')
    .select('*, subjects(*)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

// POST create student
app.post('/api/students', async (req, res) => {
  const { sr_code, name, subjects } = req.body;
  if (!sr_code || !name || !subjects?.length) {
    return res.status(400).json({ error: 'sr_code, name, and subjects are required.' });
  }

  const gwa = calcGWA(subjects);

  const { data: student, error: sErr } = await supabase
    .from('students')
    .insert({ sr_code, name, gwa })
    .select()
    .single();
  if (sErr) return res.status(500).json({ error: sErr.message });

  const subjectRows = subjects
    .filter((s) => !isNaN(parseFloat(s.grade)) && !isNaN(parseFloat(s.units)))
    .map((s) => ({
      student_id: student.id,
      subject_name: s.subject_name || 'Subject',
      grade: parseFloat(s.grade),
      units: parseFloat(s.units),
    }));

  const { error: subErr } = await supabase.from('subjects').insert(subjectRows);
  if (subErr) return res.status(500).json({ error: subErr.message });

  res.status(201).json({ ...student, subjects: subjectRows });
});

// PUT update student
app.put('/api/students/:id', async (req, res) => {
  const { sr_code, name, subjects } = req.body;
  const { id } = req.params;

  const gwa = calcGWA(subjects);

  const { error: sErr } = await supabase
    .from('students')
    .update({ sr_code, name, gwa, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (sErr) return res.status(500).json({ error: sErr.message });

  await supabase.from('subjects').delete().eq('student_id', id);

  const subjectRows = subjects
    .filter((s) => !isNaN(parseFloat(s.grade)) && !isNaN(parseFloat(s.units)))
    .map((s) => ({
      student_id: id,
      subject_name: s.subject_name || 'Subject',
      grade: parseFloat(s.grade),
      units: parseFloat(s.units),
    }));

  const { error: subErr } = await supabase.from('subjects').insert(subjectRows);
  if (subErr) return res.status(500).json({ error: subErr.message });

  res.json({ gwa, subjects: subjectRows });
});

// DELETE student
app.delete('/api/students/:id', async (req, res) => {
  const { error } = await supabase.from('students').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

// ─── Start ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`GWA API running on :${PORT}`));
