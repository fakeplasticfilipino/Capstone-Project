-- =============================================================
-- MACARIO — schema v8: three functions no longer callable from the API
--
-- Supabase's security advisor (3 Oct 2026) flagged security definer
-- functions that anyone, signed in or not, can call through
-- /rest/v1/rpc. Three of them have no reason to be callable:
--
--   handle_new_user()       the trigger that makes a profiles row when
--                           an account is created (on_auth_user_created
--                           on auth.users). Only the auth service needs
--                           it; called by hand it could make a profile.
--   get_assessment_items()  unused since Block 68: the game reads
--   submit_assessment()     assessment_items and grades a test itself.
--
-- Nothing is dropped and no table, row or policy changes: only who may
-- EXECUTE them. The trigger keeps working (the auth service and the
-- owner keep EXECUTE, granted explicitly since PUBLIC's is revoked).
-- The functions every policy or the game itself uses (my_role,
-- my_class_id, is_teacher_of and the other policy helpers,
-- can_reset_my_data, reset_my_play_data) are untouched: they are
-- callable on purpose.
--
-- Undo, if ever needed:
--   grant execute on function public.<name>(<args>) to anon, authenticated;
-- =============================================================

revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to supabase_auth_admin, service_role;

revoke execute on function public.get_assessment_items(integer, text) from public, anon, authenticated;
grant execute on function public.get_assessment_items(integer, text) to service_role;

revoke execute on function public.submit_assessment(integer, text, jsonb) from public, anon, authenticated;
grant execute on function public.submit_assessment(integer, text, jsonb) to service_role;
