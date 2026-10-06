-- =============================================================
-- MACARIO — schema v11: a student cannot make himself a teacher
--
-- Found 6 Oct 2026 (Block 123), read only, on the live project, and
-- applied the same day at the proponent's word.
--
-- 1. profiles had the policy "Users can update their own profile"
--    (schema 001): USING auth.uid() = id, and no WITH CHECK. Supabase
--    grants UPDATE on every column of the table to anon and
--    authenticated, and no trigger guarded the row. So a signed-in
--    student could set his own role to 'teacher' from the browser's
--    console, after which private.my_role() read 'teacher' for him and
--    the policies of schemas 006 and 007 let him insert, change and
--    delete every assessment item, trivia card and Talaan paper, for
--    every class: the research instrument. He could also set his own
--    class_id to any class.
--
--    Nothing in the game or the dashboard writes profiles (game.js and
--    teacher.js only read it; handle_new_user and reset_my_play_data are
--    security definer and do not depend on these grants). Accounts and
--    classes are set by the administrator (create_accounts.js, the SQL
--    editor, the service role). So the narrowest fix is to take UPDATE
--    away from the two browser roles; the policy stays, unused.
--
-- 2. assessment_scores held any number: the game grades in the browser
--    (schema 006, the instructor's decision), so a student with the
--    console could insert 500 of 10. A score must now be possible: 0 to
--    max_score, max_score above 0, act 1 to 4. One row in the table when
--    applied, none breaking these. A made-up score inside the range is
--    still possible; only grading on a server would stop that.
--
-- 3. feedback carried two indexes on (student_id, act_number): the
--    unique constraint's and feedback_student_idx. The second is
--    redundant; dropped.
--
-- Does not touch: any other table, any policy, any row, any function,
-- the service role or the SQL editor (postgres).
--
-- Checked: before, as the test student, an update of his own profile
-- row went through (1 row); after, it is refused (permission denied).
-- What a signed-in student, the teacher and a signed-out visitor can
-- read on every table, the same before and after.
--
-- Undo:
--   grant update on public.profiles to anon, authenticated;
--   alter table public.assessment_scores
--     drop constraint assessment_scores_score_range,
--     drop constraint assessment_scores_act_number_check;
--   create index feedback_student_idx on public.feedback (student_id, act_number);
-- =============================================================

revoke update on public.profiles from anon, authenticated;

alter table public.assessment_scores
  add constraint assessment_scores_score_range
    check (score >= 0 and max_score > 0 and score <= max_score),
  add constraint assessment_scores_act_number_check
    check (act_number between 1 and 4);

drop index if exists public.feedback_student_idx;
