-- =============================================================
-- MACARIO — schema v9: the policy helpers out of the API's reach
--
-- Supabase's security advisor (3 Oct 2026) flagged the six security
-- definer helpers the row level security policies call (my_role,
-- my_class_id, is_teacher_of, is_teacher_of_student,
-- is_in_teachers_class, is_own_class) as callable by anyone through
-- /rest/v1/rpc. They cannot simply lose EXECUTE: every policy that names
-- them runs as the signed-in user, who therefore needs it.
--
-- Supabase's own advice is to keep such functions out of an exposed
-- schema. This moves the six into a schema "private", which the API
-- does not serve. A policy refers to a function by its identity, not by
-- name, so every existing policy keeps calling the same function and
-- behaves exactly as before; nothing is dropped and no row changes. The
-- game never calls these six by RPC (only can_reset_my_data and
-- reset_my_play_data, which stay in public on purpose: the in-game
-- reset, guarded by is_reset_allowed, which anon and authenticated
-- cannot call).
--
-- FROM NOW ON a policy or function written by hand names them
-- private.my_role() and so on, not public.my_role(). Migrations 001 to
-- 007 name them in public, as they were when run; they are history and
-- are not re-run.
--
-- Checked when applied (3 Oct 2026): a signed-in student and the
-- teacher saw the same row counts on profiles, game_progress,
-- act_progress, assessment_scores, assessment_items and classes before
-- and after, and a signed-out visitor the same on talaan_entries.
--
-- Undo: alter function private.<name>(<args>) set schema public;
-- =============================================================

create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

alter function public.my_role() set schema private;
alter function public.my_class_id() set schema private;
alter function public.is_teacher_of(uuid) set schema private;
alter function public.is_teacher_of_student(uuid) set schema private;
alter function public.is_in_teachers_class(uuid) set schema private;
alter function public.is_own_class(uuid) set schema private;
