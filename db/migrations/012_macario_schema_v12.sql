-- =============================================================
-- MACARIO — schema v12: each test's answers kept with its score
--
-- Block 128, item 2 (9 Oct 2026). The dashboard showed a student's
-- score on each test and nothing about the questions, so the study
-- could say how much a class gained but not which topics the game
-- taught. The game grades a test itself (schema 006), so it already
-- knows each answer; it now writes them beside the score, and the
-- dashboard's Questions report pairs pre-test question n with
-- post-test question n.
--
-- One nullable column, answers, on assessment_scores. Its shape, as
-- the game writes it (js/assessment.js, _submit):
--
--   { "<item id>": { "o": item_order, "c": chosen index,
--                    "k": 1 if right else 0, "q": the question's text } }
--
-- The question's text is copied so a teacher's later edit of a
-- question does not change what a student was asked. A row written
-- before this, or by a game that has not been updated, has no answers
-- and is left out of the report; its score counts as before.
--
-- The check keeps the column an object of reasonable size (a test is
-- about ten items; 32 KB is many times that), so the column cannot be
-- used to park anything else in the table.
--
-- Does not touch: any other column, any row, any policy, any grant,
-- any function. Students already insert into this table under the
-- policy "Students can insert own scores" with table-wide grants, so
-- the new column is theirs to fill on insert and no grant is needed;
-- they still cannot update or delete a row.
--
-- Checked: the column and the check exist (information_schema); as the
-- test student, an insert with answers goes through and one whose
-- answers is a list is refused; what a signed-in student, the teacher
-- and a signed-out visitor can read is the same before and after.
--
-- Undo:
--   alter table public.assessment_scores
--     drop constraint assessment_scores_answers_shape,
--     drop column answers;
-- =============================================================

alter table public.assessment_scores
  add column if not exists answers jsonb;

alter table public.assessment_scores
  add constraint assessment_scores_answers_shape
    check (answers is null
           or (jsonb_typeof(answers) = 'object' and octet_length(answers::text) <= 32768));
