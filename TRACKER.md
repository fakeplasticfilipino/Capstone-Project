# MACARIO Build Tracker

Purpose: paste this at the start of a new session to resume work without
re-establishing context. Update the status markers as work is completed.

Status markers used: (COMPLETE), (IN PROGRESS), (NOT STARTED), (BLOCKED)

Last updated: after Block 2.3, act state machine writing to act_progress.

## 1. Build status

Block 0, Schema v2: RLS fix, act tables, item bank, grading RPC (COMPLETE)
Block 1, Role routing and class enrollment (COMPLETE)
Block 4, Teacher dashboard (COMPLETE)
Block 2, Act framework for Acts I through IV (IN PROGRESS)
  2.1 Act I content extracted to content/act1.js (COMPLETE)
  2.2 World building wrapped in loadAct and unloadAct (COMPLETE)
  2.3 Act state machine writing to act_progress (COMPLETE)
  2.4 Act stubs for II through IV, plus gating (NOT STARTED)
  2.5 Resume into the correct act on load (NOT STARTED)
Block 3, Assessment module (NOT STARTED)
Block 5, Android smoke test and final commit (NOT STARTED)

Note the ordering. Block 4 was brought forward ahead of Blocks 2 and 3
because it is purely additive and could not break the working game,
whereas Block 2 refactors existing code.

## 2. Project facts

Title: MACARIO, a 2D narrative RPG on the life of Macario Sakay, for
Grade 8 Araling Panlipunan.

Institution: STI College Dasmarinas

Repository: github.com/fakeplasticfilipino/Capstone-Project

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

game.js: the engine. Renders worlds, runs dialogue, animates sprites.
Holds no act content. A canonical copy is held by Claude; request
whole-file replacements rather than applying patches by hand.

content/act1.js: Act I as pure data. NPCs, stage, decorations,
objectives, starting quests. Must load BEFORE game.js.

acts.js: the act flow controller. The only file that writes to
act_progress. Loads AFTER game.js.

index.html: script order is act content, then game.js, then acts.js.

style.css: unchanged.

supabaseClient.js: unchanged.

teacher.html, teacher.css, teacher.js: complete teacher dashboard.
teacher.js is 417 lines.

macario_schema.sql: version 1. Already executed. Do not run again.

macario_schema_v2.sql: applied.

enrollment_setup_filled.sql: applied.

check_migration_state.sql: read-only diagnostic, safe to re-run.

seed_test_data.sql: temporary fixtures used to verify the dashboard
before Blocks 2 and 3 exist. Parts A and B seed, Part C removes.

create_accounts.js: version 2. Listed in .gitignore but still tracked in
git, so it remains publicly visible. See section 6, priority 0.

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

Act I is loaded through loadAct(), which builds NPCs, decorations, and
the stage from act data and can be called repeatedly. unloadAct()
removes every node it created and resets the animator list.

Act I objectives are tracked against existing story flags and written to
act_progress, with performance_score computed from completion. The act
auto-completes when all four objectives are met.

### Teacher dashboard implemented

Access gate requiring both a live session and a teacher role, with
students bounced back to index.html.

Class picker, shown only when the teacher owns more than one class.

Roster table with columns for name, current act, acts completed out of
four, Act I pre-test, Act I post-test, gain, performance score, and last
active date.

Class summary showing student count, number started, average pre-test,
average post-test, and average gain.

Gain is calculated as post-test percentage minus pre-test percentage,
displayed in percentage points and colour coded.

Handled states: no class assigned, class with no students, student who
has never played, missing scores rendered as muted dashes rather than
zeroes, and query failure with a specific hint shown if RLS recursion is
detected.

Important: act_progress and assessment_scores remain empty until Blocks 2
and 3 are built, so score columns will legitimately display dashes until
then. This is expected behaviour, not a fault.

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

The dashboard runs four scoped queries and stitches the results in
JavaScript rather than using a joined view or an RPC. This avoided an
additional migration and kept Block 4 purely additive. RLS still enforces
correctness on each query individually, and class sizes of 40 to 50 make
the extra round trips immaterial. It converts to an RPC later without
changing any rendering code if that ever becomes necessary.

The dashboard presents plain tables with no charting library, matching
the documented limitation that the teacher interface provides basic
summaries only.

Act objectives map to story flags that already exist in state.flags
rather than getting their own storage. Because flags are persisted
inside save_state, objective progress survives a reload with no extra
work.

checkObjectives() is called from saveProgress() rather than after each
flag change, so act_progress writes piggyback on the existing 800ms
debounce instead of introducing a competing write path. It early returns
when the count has not moved.

The trivia, pretest, and posttest states exist in the act_progress
schema but are unused by acts.js. Block 3 inserts them either side of
playing. Writing them now would create states nothing can exit.

performance_score is currently completion percentage only. It becomes a
weighted sum once stealth and combat exist. This is worth stating
explicitly in the documentation, since the name implies more than
completion and a panel may ask.

Work proceeds on the main branch, with a commit taken before any
high-risk step.

## 5. Known pitfalls

Clear the Supabase SQL editor before each paste. Leftover text from a
previous query will execute alongside the new file. This produced a
"relation profiles already exists" error. The transaction rolls back, so
no damage occurs, but the cause is not obvious.

Increment the v=N cache-buster after every change to any script or
stylesheet, otherwise browsers continue serving the cached file.

Script order in index.html is load bearing. content/act1.js must come
before game.js, because game.js reads window.ACT_1 while it executes.
Getting this wrong produces a blank world and an undefined property
error in the console.

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

Adding a filename to .gitignore does not untrack a file that was already
committed. Use git rm --cached for that.

## 6. Outstanding work

### Priority 0

Untrack create_accounts.js from git. The file is listed in .gitignore but
was committed before that rule existed, so it is still public. It
currently holds only placeholder text, so nothing has leaked, but a real
secret key pasted in later would publish to a public repository and would
bypass every RLS policy in the project. Run git rm --cached
create_accounts.js, then commit and push. (NOT STARTED)

RLS recursion fix (COMPLETE)
Class enrollment (COMPLETE)
Role routing (COMPLETE)
Teacher dashboard (COMPLETE)
Act framework, 2.1 through 2.3 (COMPLETE)
Act framework, 2.4 act stubs and gating (NOT STARTED)
Act framework, 2.5 resume into the correct act (NOT STARTED)
Assessment module: trivia, pre-test, act, post-test interface (NOT STARTED)

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

In-game logout control. The dashboard has one; the game does not. (NOT STARTED)
Pause, settings, and main menu screens (NOT STARTED)
Replace the placeholder poem with verified text (NOT STARTED)
Replace the placeholder Katipunero dialogue (NOT STARTED)
Offline and save-conflict handling (NOT STARTED)
Dashboard export to CSV or PDF (NOT STARTED)
Per-question item analysis on the dashboard (NOT STARTED)
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

Document the dashboard query approach and its RLS enforcement, since a
panel may ask how one teacher is prevented from reading another class's
data. (NOT STARTED)

Revise the Technical Background section. Aseprite, Audacity, and Figma
remain accurate; Unity and Visual Studio should be removed. (NOT STARTED)

## 8. Next session

Continuing Block 2 at step 2.4, act stubs and gating.

2.4 creates content/act2.js through content/act4.js as data files with
titles from the proposal and empty npcs arrays, registers them in
Acts.registry, and adds an act transition screen shown on completion.
Attempting a locked act is refused. Checkpoint: completing Act I unlocks
Act II, which loads as an empty world showing its title.

2.5 reads game_progress.current_act on load and loads the matching act
rather than always loading Act I. Existing saves default to 1.
Checkpoint: log out inside Act II, log back in, land in Act II.

After that, Block 3 builds the assessment interface, which is the last
priority 0 item. Once it is done, the pre-test, post-test, and gain
columns on the teacher dashboard will populate with no changes to
teacher.js.

Note that Act I currently ends by calling teleportToNewRoom(), which is
the original empty-room cutscene. Step 2.4 replaces that with a proper
act transition. Until then, completing Act I marks it completed in the
database but still visually drops the player into the empty room.
