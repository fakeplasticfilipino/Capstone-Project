# MACARIO Build Tracker

Purpose: paste this at the start of a new session to resume work without
re-establishing context. Update the status markers as work is completed.

Status markers used: (COMPLETE), (IN PROGRESS), (NOT STARTED), (BLOCKED)

Last updated: after Block 1, role routing verified working.

## 1. Build status

Block 0, Schema v2: RLS fix, act tables, item bank, grading RPC (COMPLETE)
Block 1, Role routing and class enrollment (COMPLETE)
Block 2, Act framework for Acts I through IV (NOT STARTED)
Block 3, Assessment module (NOT STARTED)
Block 4, Teacher dashboard (NOT STARTED)
Block 5, Android smoke test and final commit (NOT STARTED)

## 2. Project facts

Title: MACARIO, a 2D narrative RPG on the life of Macario Sakay, for
Grade 8 Araling Panlipunan.

Institution: STI College Dasmarinas

Stack: vanilla HTML, CSS, and JavaScript with Supabase. The proposal
document specifies Unity; the implementation does not use it. See
section 7.

Hosting: GitHub Pages

Supabase project reference: rkfnovfkroajottpmxxq

Target platform: Android phones via Chrome

### Accounts

guro@example.com, teacher role. Its class_id is NULL, which is correct;
teachers own a class rather than being enrolled in one.

hi@example.com, student role. Holds existing save data. Enrolled in
class MAC8-RIZAL.

Class name: Grade 8 - Rizal. Join code: MAC8-RIZAL.

## 3. Current state

### Repository files

index.html: original, with the cache-buster bumped to v=5.

game.js: 1061 lines, Block 1 applied. A canonical copy is held by Claude.
Request whole-file replacements rather than applying patches by hand.

style.css: unchanged.

supabaseClient.js: unchanged.

macario_schema.sql: version 1. Already executed. Do not run again.

macario_schema_v2.sql: applied.

enrollment_setup_filled.sql: applied.

check_migration_state.sql: read-only diagnostic, safe to re-run.

create_accounts.js: version 2, gitignored. Not currently needed; intended
for bulk account creation during classroom testing.

teacher.html, teacher.css, teacher.js: authentication gate only. The
dashboard body is empty pending Block 4.

### Database

Tables: profiles, classes, game_progress (including the current_act
column), assessment_scores, act_progress, assessment_items, act_trivia.

Functions: my_role, my_class_id, is_teacher_of, get_assessment_items,
submit_assessment.

Seeded data: Act I trivia fact and 10 assessment items, comprising 5
pre-test and 5 post-test items written as parallel forms. These items
were drafted by Claude and have not yet been validated by the subject
matter expert.

### Gameplay implemented

Login-gated side-scrolling world of 4400px, with keyboard and touch
controls and a camera that follows the player.

Sprite-sheet animation covering idle, walk, and death states for both the
player and NPCs, with placeholder boxes shown for missing assets.

Dialogue system supporting staged conversation sets and completion hooks.

Gift mechanic (delivering the buko to the barber) and a quest log that
adds, completes, and persists entries.

Stage cutscene sequence: poem recital, day to night transition, death
animation, blackout, reveal of the Katipunero, and teleport to an empty
room.

Save and load, using a debounced write plus a 10 second interval and a
beforeunload flush. Restores quests, story flags, position, room, and
night state.

Teachers are redirected to teacher.html and no longer receive a
game_progress row.

## 4. Decisions on record

Class assignment is pre-assigned by an administrator. The proposal states
that credentials are teacher-managed, so a student-facing join screen was
deferred. The join_code column is reserved for that future use.

The question bank is stored in a database table rather than hardcoded,
which provides a concrete ModuleAssessment entity corresponding to the
ERD.

Assessments allow one attempt only. This suits a pre-test and post-test
design and makes the existing unique constraint intentional rather than
an unhandled failure.

Performance score is currently derived from objective completion alone.
Stealth and combat terms will be added once those systems exist.

The answer key is never transmitted to the browser. The item table is
RLS-locked and both question retrieval and grading run through security
definer functions.

Work proceeds on the main branch, with a commit taken before any
high-risk step.

## 5. Known pitfalls

Clear the Supabase SQL editor before each paste. Leftover text from a
previous query will execute alongside the new file. This produced a
"relation profiles already exists" error. The transaction rolls back, so
no damage occurs, but the cause is not obvious.

Increment the v=N cache-buster in index.html after every game.js change,
otherwise mobile browsers continue serving the cached file.

Test teacher login in an incognito window. An active student session will
otherwise take precedence.

A NULL class_id on the teacher account is correct and is not a fault.

If profiles.class_id is unset for students, every teacher policy returns
zero rows silently, with no error message. Check this first if the
dashboard appears empty.

The profiles and classes RLS policies originally referenced one another,
causing infinite recursion. This was resolved with security definer
helper functions. Note that current_role is a reserved SQL keyword and
cannot be used as a function name.

## 6. Outstanding work

### Priority 0, corresponds to the stated research objectives

RLS recursion fix (COMPLETE)
Class enrollment (COMPLETE)
Role routing (COMPLETE)
Act framework: Acts I through IV as first-class state, with gating and
act_progress writes (NOT STARTED)
Assessment module: trivia, pre-test, act, post-test interface (NOT STARTED)
Teacher dashboard: roster, act completion, pre and post averages, and
gain scores (NOT STARTED)

### Priority 1, core scope commitments

Jump control. The functional requirements specify movement and jump; only
lateral movement exists. (NOT STARTED)
Melee and special attack combat (NOT STARTED)
Enemy entities (NOT STARTED)
Stealth mechanics and detection meter (NOT STARTED)
Health system with collectible restoration (NOT STARTED)
Performance scoring, extended with stealth and combat terms (NOT STARTED)
Dynamic difficulty progression from Act I to Act IV (NOT STARTED)
Act II content, The Long Shadow of War (NOT STARTED)
Act III content, The Republic in the Shadows (NOT STARTED)
Act IV content, The Bitter Harvest (NOT STARTED)

### Priority 2, in scope but reasonable to defer

Equipment system and player_equipment table (NOT STARTED)
Cosmetic rewards and in-game currency (NOT STARTED)
Achievements (NOT STARTED)
Session telemetry. The ERD specifies GameSession, PlayerAction, and
GameScore; none exist. (NOT STARTED)
Audio. Audacity is listed among the project tools but the repository
contains no sound assets. (NOT STARTED)

### Priority 3, polish and operations

In-game logout control (NOT STARTED)
Pause, settings, and main menu screens (NOT STARTED)
Replace the placeholder poem with verified text (NOT STARTED)
Replace the placeholder Katipunero dialogue (NOT STARTED)
Offline and save-conflict handling (NOT STARTED)
Re-export the capstone proposal as a genuine PDF. The current file is a
ZIP archive of page images. (NOT STARTED)

## 7. Documentation debt

Tracked separately from code, as these items will be raised at the
defense.

Justify the change from Unity to vanilla JavaScript and Supabase. The
argument is available in the existing review of related literature:
Bayani Chronicles was constrained by 3D performance on low-end devices,
and a lightweight browser application addresses that gap directly. This
should be framed as responding to an identified limitation rather than as
a reduction in scope. (NOT STARTED)

Reconcile the ERD, which documents 15 entities, against the 7 tables
actually implemented. Either revise the diagram or annotate the remainder
as future scope. (NOT STARTED)

Obtain validation of the assessment item bank from Ms. Donadillo-Espiritu,
who is already listed in Appendix A as the resource person. This provides
a defensible answer to questions about instrument validity. (NOT STARTED)

Document the server-side grading approach. Because the answer key never
reaches the client, this is a design strength worth stating explicitly.
(NOT STARTED)

Revise the Technical Background section. Aseprite, Audacity, and Figma
remain accurate; Unity and Visual Studio should be removed. (NOT STARTED)

## 8. Next session

Beginning with Block 2, the act framework.

Approach: game.js remains the engine. A new file, acts.js, will own the
flow controller with the state sequence locked, trivia, pretest, playing,
posttest, completed, followed by unlocking the next act. Act I's NPCs and
stage move into content/act1.js as data conforming to the same NPCS shape
the engine already consumes. Acts II through IV receive empty stubs so
the framework can gate them.

Checkpoint before any new functionality is added: Act I must play
identically to its current behaviour, with the same NPCs, cutscene, and
save and resume handling. Verify this first, then build on top.

An alternative sequencing option is to complete Block 4, the teacher
dashboard, before Block 2. Block 4 is purely additive and touches no
working code, making it lower risk if the remaining session budget is
limited.
