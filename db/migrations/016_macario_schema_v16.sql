-- =============================================================
-- MACARIO — schema v16: a name beside every student's code
--
-- Block 159 (9 Nov 2026, the instructor's suggestion, the proponent's
-- yes in the session the same day). Until now a student's only name in
-- the database was the code (profiles.full_name, rizal-07), and the
-- teacher wrote each real name beside its code on paper. The dashboard
-- now shows a name for every student, which the teacher types when
-- making the accounts or later on the student card.
--
-- What this does: adds profiles.display_name, text, empty by default,
-- at most 80 characters. It is written only by the create-students
-- function (the service role): since schema v11 no browser role may
-- UPDATE profiles, and this adds no grant, so a student cannot set or
-- change it. It is read through the policies that already exist: a
-- student sees their own profile row, a teacher their class's.
--
-- Does not touch: full_name (still the code, which the login and the
-- numbering read), any policy, grant, function or row. Every existing
-- student keeps an empty name until the teacher gives one.
--
-- Privacy: real names are now in the database (never in the public
-- repository). The study's consent and the school's rules govern them,
-- as they do the scores.
--
-- Checked (TRACKER.md, Run log): the column exists and is empty; as the
-- test student, an update of it is refused; the teacher reads it for
-- her class; a visitor reads no profile.
--
-- Undo:
--   alter table public.profiles drop column display_name;
--   (and the dashboard and the function from before Block 159)
-- =============================================================

alter table public.profiles
  add column if not exists display_name text
    check (display_name is null or char_length(display_name) <= 80);
