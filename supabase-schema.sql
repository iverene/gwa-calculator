-- ─────────────────────────────────────────────────────────────────────────────
-- GWA Calculator — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── Students ────────────────────────────────────────────────────────────────
create table if not exists students (
  id          uuid primary key default gen_random_uuid(),
  sr_code     text not null,
  name        text not null,
  gwa         numeric(4,2) not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for fast search
create index if not exists idx_students_sr_code on students(sr_code);
create index if not exists idx_students_name    on students(name);

-- ── Subjects ────────────────────────────────────────────────────────────────
create table if not exists subjects (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references students(id) on delete cascade,
  subject_name text not null default 'Subject',
  grade        numeric(3,2) not null check (grade >= 1.0 and grade <= 5.0),
  units        numeric(3,1) not null check (units > 0),
  created_at   timestamptz not null default now()
);

create index if not exists idx_subjects_student_id on subjects(student_id);

-- ── Row Level Security ───────────────────────────────────────────────────────
-- For a public app (no auth), allow anon read/write:
alter table students enable row level security;
alter table subjects  enable row level security;

create policy "Allow all on students" on students for all using (true) with check (true);
create policy "Allow all on subjects" on subjects for all using (true) with check (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Done! The frontend uses anon key directly; the backend uses service_role key.
-- ─────────────────────────────────────────────────────────────────────────────
