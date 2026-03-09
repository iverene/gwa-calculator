# GWA Calculator

A clean, minimal General Weighted Average Calculator built with React, Node.js, Supabase, and deployed on Vercel.

---

## Features

- **Student Input Form** — SR-Code, Name, dynamic subject rows (grade + units)
- **Live GWA Preview** — See computed GWA before saving
- **GWA Formula** — `GWA = Σ(Grade × Units) / Σ(Units)`
- **Records Table** — Sortable, searchable history of all records
- **Click to Edit** — Open any record, view subject breakdown, update grades
- **Delete with Confirm** — Two-click delete protection
- **Export CSV** — Download filtered records as CSV
- **Responsive** — Works on desktop and mobile

---

## Project Structure

```
gwa-calculator/
├── frontend/               # React + Tailwind CSS
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GradeForm.jsx       # Input form with live GWA preview
│   │   │   ├── RecordsTable.jsx    # Sortable/searchable records table
│   │   │   └── StudentModal.jsx    # View/edit student details
│   │   ├── lib/
│   │   │   └── supabase.js         # Supabase client + CRUD helpers
│   │   ├── App.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   └── package.json
├── backend/                # Node.js + Express REST API
│   └── src/
│       └── index.js        # CRUD endpoints for students + subjects
├── supabase-schema.sql     # Run this in Supabase SQL Editor
├── vercel.json             # Vercel deployment config
└── .env.example            # Environment variable template
```

---

## Setup Guide

### Step 1 — Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** → **New Query**
3. Paste the contents of `supabase-schema.sql` and click **Run**
4. Go to **Project Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon / public key** → `REACT_APP_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_KEY` (keep this secret!)

### Step 2 — Local Development

```bash
# Clone the repo
git clone https://github.com/your-username/gwa-calculator.git
cd gwa-calculator

# Frontend
cd frontend
cp ../.env.example .env
# Fill in REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
npm install
npm start         # → http://localhost:3000

# Backend (separate terminal)
cd backend
cp ../.env.example .env
# Fill in SUPABASE_URL and SUPABASE_SERVICE_KEY
npm install
npm run dev       # → http://localhost:5000
```

### Step 3 — Deploy to Vercel

1. Push your project to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Set **Root Directory** to `/` (project root)
4. Add all environment variables from `.env.example` in Vercel's **Environment Variables** settings
5. Click **Deploy** — Vercel will build both frontend and backend automatically

---

## GWA Scale Reference

| GWA Range | Rating    |
|-----------|-----------|
| 1.00–1.50 | Excellent |
| 1.51–2.00 | Good      |
| 2.01–2.50 | Average   |
| 2.51–5.00 | Poor      |

---

## API Endpoints (Backend)

| Method | Path                    | Description              |
|--------|-------------------------|--------------------------|
| GET    | `/api/students`         | Get all student records  |
| GET    | `/api/students/:id`     | Get single student       |
| POST   | `/api/students`         | Create student + subjects|
| PUT    | `/api/students/:id`     | Update student + subjects|
| DELETE | `/api/students/:id`     | Delete student record    |

### POST/PUT Body

```json
{
  "sr_code": "21-12345",
  "name": "Juan Dela Cruz",
  "subjects": [
    { "subject_name": "Math 101", "grade": 1.5, "units": 3 },
    { "subject_name": "English 101", "grade": 2.0, "units": 3 }
  ]
}
```

---

## Tech Stack

- **Frontend**: React 18, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Fonts**: Syne (display), DM Sans (body), JetBrains Mono
