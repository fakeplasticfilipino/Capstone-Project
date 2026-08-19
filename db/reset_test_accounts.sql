-- =============================================================
-- MACARIO — reset the test accounts' play data
--
-- CLEAR THE SQL EDITOR BEFORE PASTING.
--
-- Deletes play data only. It does NOT delete the accounts, the
-- class, the assessment items, or the trivia facts.
--
-- WHY THIS IS NEEDED
--
-- Assessments allow ONE attempt per student per act per test
-- type, enforced by a unique constraint and by submit_assessment.
-- An account that has already sat a test resumes past the trivia
-- card and the pre-test, so the full flow cannot be retested
-- without clearing these rows first.
--
-- Separately, any act_progress row written before schema v4 holds
-- a completion-only performance_score. Those numbers mean
-- something different from ones written after, and they cannot be
-- recomputed because the counters were never recorded. Clearing
-- them removes the ambiguity.
--
-- NEVER RUN THIS AGAINST A STUDY ACCOUNT. A study account's one
-- attempt is the data; deleting it deletes the finding. Pilot and
-- study accounts must be separate, which is why this file names
-- the two test accounts explicitly rather than taking a role.
-- =============================================================

do $$
declare
  ids uuid[];
begin
  select array_agg(id) into ids
  from auth.users
  where email in ('hi@example.com', 'guro@example.com');

  if ids is null then
    raise exception 'Neither test account was found. Check the addresses.';
  end if;

  delete from public.feedback           where student_id = any(ids);
  delete from public.assessment_scores  where student_id = any(ids);
  delete from public.act_progress       where student_id = any(ids);
  delete from public.game_progress      where student_id = any(ids);

  -- game_sessions is history rather than state. Cleared too, so a
  -- session count after the next run is unambiguous.
  delete from public.game_sessions      where student_id = any(ids);

  -- Equipment before inventory: a slot row refers to an item the
  -- student owns, and clearing ownership first would leave the
  -- account wearing something it no longer has. Both are cleared so
  -- the next full-flow test starts from an empty inventory screen and
  -- sees the Act I grant happen, which is the whole point of running
  -- the flow again.
  delete from public.player_equipment   where student_id = any(ids);
  delete from public.player_inventory   where student_id = any(ids);

  raise notice 'Reset play data for % account(s).', array_length(ids, 1);
end $$;

-- Expect seven zeros. Scoped to the two test accounts, so this stays
-- correct once real student accounts exist alongside them. A non-zero
-- row means the delete above did not reach that table.
with test_ids as (
  select id from auth.users
  where email in ('hi@example.com', 'guro@example.com')
)
select 'act_progress' as tbl,
       count(*)::text as remaining
from public.act_progress where student_id in (select id from test_ids)
union all
select 'assessment_scores', count(*)::text
from public.assessment_scores where student_id in (select id from test_ids)
union all
select 'game_progress', count(*)::text
from public.game_progress where student_id in (select id from test_ids)
union all
select 'feedback', count(*)::text
from public.feedback where student_id in (select id from test_ids)
union all
select 'game_sessions', count(*)::text
from public.game_sessions where student_id in (select id from test_ids)
union all
select 'player_inventory', count(*)::text
from public.player_inventory where student_id in (select id from test_ids)
union all
select 'player_equipment', count(*)::text
from public.player_equipment where student_id in (select id from test_ids)
order by 1;
