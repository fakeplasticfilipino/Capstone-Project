-- =============================================================
-- MACARIO — schema v14: a student may be archived
--
-- Block 150 (25 Oct 2026, the proponent's choice). The teacher may
-- now take students off her class's roster from the dashboard. A
-- student who has played is archived, never deleted: deleting the
-- account would cascade through every table that holds a student_id
-- (schemas 001 to 004 all say on delete cascade) and take the scores,
-- the progress, the sessions and the feedback with it, which are the
-- study's data. Archiving keeps every row, bans the login (done by
-- the create-students function with the secret key, not here) and
-- hides the student from the roster and the averages until the
-- teacher shows archived students again or restores one. Only an
-- account that never played may be deleted, and the function checks
-- that against the tables themselves.
--
-- What this does: adds profiles.archived_at, null for a student in
-- play, the moment of archiving otherwise. Written only by the
-- create-students function (the service role): no browser role may
-- update profiles since schema v11, so a student cannot un-archive
-- himself and a teacher can only ask the function.
--
-- Does not touch: any other table or column, any row, any policy,
-- any grant, any function. The teacher's read of her class's
-- profiles is unchanged, so an archived student is still hers to see.
--
-- Checked: the column exists, null for every row; a signed-in
-- student, the teacher and a signed-out visitor see the same number
-- of profiles rows before and after (TRACKER.md, Run log).
--
-- Undo:
--   alter table public.profiles drop column archived_at;
--   (and lift the ban of any archived account first, from the
--   dashboard's Restore, or it stays unable to log in)
-- =============================================================

alter table public.profiles
  add column if not exists archived_at timestamptz;

comment on column public.profiles.archived_at is
  'Block 150: set when the teacher archives the student (login banned, kept off the roster); null otherwise. Written by the create-students function only.';
