-- =============================================================
-- MACARIO — schema v10: the same rules, read faster (Polish list #13)
--
-- Supabase's performance advisor (3 Oct 2026):
--
--   26 policies call auth.uid() bare, which Postgres evaluates again
--   for every row it checks. Wrapped as (select auth.uid()) it is
--   evaluated once per query (Supabase's own advice). ALTER POLICY
--   changes only the expression; each policy keeps its name, command,
--   roles and meaning: "student_id = the signed-in user" is the same
--   test either way.
--
--   Two foreign keys have no index: classes.teacher_id (every teacher
--   policy and the dashboard's class list look a class up by it) and
--   profiles.class_id (the roster, and every "my class" check).
--
-- Not done, on purpose: the advisor also lists "multiple permissive
-- policies" (a student's own-row rule beside the teacher's rule on the
-- same table). Merging each pair into one policy is a rewrite of the
-- security rules for a speed nobody with forty students would notice.
--
-- Checked when applied: what a signed-in student, the teacher and a
-- signed-out visitor see on every table, the same before and after;
-- and the advisor's 26 initplan warnings and 2 index notices gone.
--
-- Undo: the same ALTER POLICY statements with auth.uid() unwrapped, and
-- drop index classes_teacher_id_idx, profiles_class_id_idx.
-- =============================================================

create index if not exists classes_teacher_id_idx on public.classes (teacher_id);
create index if not exists profiles_class_id_idx on public.profiles (class_id);

alter policy "Students can insert own act progress" on public.act_progress with check (student_id = (select auth.uid()));
alter policy "Students can update own act progress" on public.act_progress using (student_id = (select auth.uid()));
alter policy "Students can view own act progress" on public.act_progress using (student_id = (select auth.uid()));

alter policy "Anyone logged in can read trivia" on public.act_trivia using ((select auth.uid()) is not null);
alter policy "Students can read the item bank" on public.assessment_items using ((select auth.uid()) is not null);

alter policy "Students can insert own scores" on public.assessment_scores with check (student_id = (select auth.uid()));
alter policy "Students can view own scores" on public.assessment_scores using (student_id = (select auth.uid()));

alter policy "Teachers can manage their own classes" on public.classes
  using (teacher_id = (select auth.uid())) with check (teacher_id = (select auth.uid()));

alter policy "Students can insert own feedback" on public.feedback with check (student_id = (select auth.uid()));
alter policy "Students can view own feedback" on public.feedback using (student_id = (select auth.uid()));

alter policy "Students can insert own progress" on public.game_progress with check (student_id = (select auth.uid()));
alter policy "Students can update own progress" on public.game_progress using (student_id = (select auth.uid()));
alter policy "Students can view own progress" on public.game_progress using (student_id = (select auth.uid()));

alter policy "Students can insert own sessions" on public.game_sessions with check (student_id = (select auth.uid()));
alter policy "Students can update own sessions" on public.game_sessions using (student_id = (select auth.uid()));
alter policy "Students can view own sessions" on public.game_sessions using (student_id = (select auth.uid()));

alter policy "Students can delete own equipment" on public.player_equipment using (student_id = (select auth.uid()));
alter policy "Students can insert own equipment" on public.player_equipment with check (student_id = (select auth.uid()));
alter policy "Students can update own equipment" on public.player_equipment using (student_id = (select auth.uid()));
alter policy "Students can view own equipment" on public.player_equipment using (student_id = (select auth.uid()));

alter policy "Students can delete own inventory" on public.player_inventory using (student_id = (select auth.uid()));
alter policy "Students can insert own inventory" on public.player_inventory with check (student_id = (select auth.uid()));
alter policy "Students can update own inventory" on public.player_inventory using (student_id = (select auth.uid()));
alter policy "Students can view own inventory" on public.player_inventory using (student_id = (select auth.uid()));

alter policy "Users can update their own profile" on public.profiles using ((select auth.uid()) = id);
alter policy "Users can view their own profile" on public.profiles using ((select auth.uid()) = id);
