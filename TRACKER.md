# TRACKER.md

Current build status. Architecture and conventions live in CLAUDE.md.

This file records present state, not history. When something is finished,
compress it to a line rather than accumulating detail. A tracker that grows
every session stops being useful.

Status markers: (COMPLETE), (IN PROGRESS), (NOT STARTED), (BLOCKED)

Last updated: after Block 3.

## Milestone

Target is about one month out. Whether it is a progress presentation or a
final defense with student data collection is not yet confirmed, and that
answer changes the plan below. If data collection is expected, the software
must be finished roughly ten days before the date to allow for scheduling a
session at Imus NHS and analysing what comes back.

Every priority 0 item is now built. The remaining blocker on data
collection is not code, it is validation of the assessment items by the
resource person. See documentation debt.

Hosting for the testing window is GitHub Pages, which is sufficient for a
month of student testing and requires no migration. Deploying elsewhere
mid-testing would risk breaking links testers already hold, for no gain.

## Done

Schema v2: RLS recursion fix, act_progress, assessment_items, act_trivia,
server-side grading functions, Act I item bank seeded. (COMPLETE)

Role routing and class enrollment. Teachers redirect to teacher.html and
never receive a game_progress row. (COMPLETE)

Teacher dashboard. Roster, act completion, pre and post scores, gain,
performance, class averages, and all empty and error states. (COMPLETE)

Act framework, Block 2 in full. Act I extracted to content/act1.js, world
building wrapped in loadAct and unloadAct, act state machine writing to
act_progress, stub content files for Acts II through IV, ordered unlocking,
act title card and act transition screen, and resume into the act recorded
in game_progress.current_act. (COMPLETE)

Act I gameplay: five NPCs, buko gift quest, stage performance cutscene with
day to night transition and death animation, Katipunero reveal, save and
resume. (COMPLETE)

Sprite system: multi-row grid sheets via the columns field, scaling from
frame height, and asset cache busting through ASSET_VERSION. (COMPLETE)

Assessment module, Block 3. Trivia card, pre-test, and post-test in
assessment.js, one question per screen with a back control, submitting
through submit_assessment. Handles an already recorded attempt, an act with
no items seeded, and network failure, none of which strand the student.
The teacher dashboard's pre-test, post-test, and gain columns now populate
with no changes to teacher.js. (COMPLETE)

## Art status

Assets/ currently holds only Cement_Tile.png and the player Walk.png. Every
other sprite and background was removed pending replacement art from
classmates. Act I is fully playable but visually skeletal: the player shows
a placeholder box while idle, all NPCs and both skylines are placeholder
boxes, and the death animation in the stage cutscene is a placeholder. This
is the fallback system working, not a fault.

Confirm Walk.png is genuinely 12 frames in a 5 + 5 + 2 grid. If the cycle
pauses or shows a sliver of the next frame, the columns value in
SPRITE_SHEETS is wrong.

## Next

Combat and stealth, deliberately minimal. Tap to attack, hold for ranged,
detection radius with no line of sight. Built and tuned inside Act II,
because a system with no level to exercise it cannot be tested.
(NOT STARTED)

Jump and health. Prerequisites for combat. Note that the functional
requirements specify movement and jump; only lateral movement exists.
(NOT STARTED)

Act II content, The Long Shadow of War. Script, dialogue, assessment items,
and art. This is the long pole and it is human work, not code. The
framework is finished and waiting: content/act2.js is a registered, loadable
act with an empty npcs array, so filling it in requires no engine change.
(NOT STARTED)

Act III, The Republic in the Shadows. Act IV, The Bitter Harvest.
Planned as thin content against a complete framework. (NOT STARTED)

Seed assessment items and a trivia fact for Acts II through IV. Until then
those acts skip their tests with a notice, which is deliberate. (NOT STARTED)

## Deferred

Equipment system and player_equipment table.
Cosmetic rewards and in-game currency.
Achievements.
Session telemetry. The ERD specifies GameSession, PlayerAction, and
GameScore; none exist.
Audio. Audacity is listed among the project tools but there are no sound
assets.
Dynamic difficulty scaling across acts.
In-game logout, pause, and settings screens.
Dashboard export and per-question item analysis.
Offline and save-conflict handling.
Persisting partial test answers. A student who reloads mid-test currently
restarts that test from question one. No answers are recorded until the
whole test is submitted, so nothing is lost and no partial attempt is
counted, but the questions are asked again.

## Housekeeping

create_accounts.js is listed in .gitignore but was committed before that
rule existed, so it remains publicly visible. It holds only placeholder
text at present, but a real secret key pasted in later would publish to a
public repository and would bypass every RLS policy. Fix with
git rm --cached create_accounts.js. (NOT STARTED)

Replace placeholder text: the stage poem and the Katipunero dialogue are
both placeholders. (NOT STARTED)

Re-export the capstone proposal as a real PDF. The current file is a ZIP
archive of page images. (NOT STARTED)

## Pitfalls found in Block 2 and 3

These are recorded because each cost real debugging time and each would
have shipped silently.

The auth bootstrap must stay inside the DOMContentLoaded listener in
game.js. It used to run at parse time, and because acts.js and
assessment.js load after game.js, a student with a stored session hit
getSession() resolving on a microtask before acts.js had executed. The
window.Acts guards then swallowed the whole act lookup, so every reload
landed in Act I regardless of current_act. Nothing appeared in the console.

saveProgress refuses to write until saveReady is set at the end of the
login sequence. The parse-time loadAct call adds Act I's starting quest,
which marks the save dirty, and the resulting debounced write fired
mid-login with Acts.current still at its initial 1, overwriting the stored
act. A slower connection made it more likely, not less.

Assessment checks for an existing score before showing any questions rather
than relying on submit_assessment raising ALREADY_SUBMITTED. The constraint
is still the real guarantee, but discovering the clash at submit time meant
the student answered every question for nothing.

## Documentation debt

These will be raised at the defense and are tracked separately from code.

Justify Unity to vanilla JavaScript and Supabase, argued from the existing
literature review: a comparable project was constrained by 3D performance
on low-end devices, and a lightweight browser application addresses that
gap directly. Frame as responding to an identified limitation rather than
as reduced scope. (NOT STARTED)

Reconcile the ERD, which documents 15 entities, against the 7 tables built.
Either revise it or annotate the remainder as future scope. (NOT STARTED)

Obtain validation of the assessment item bank from Ms. Donadillo-Espiritu,
already listed in Appendix A as the resource person. This is the answer to
questions about instrument validity, and it is now the blocking item rather
than a nice to have: the items are live and will be sat by real students
the moment testing starts. (NOT STARTED)

Document server-side grading. The answer key never reaches the client,
which is a design strength worth stating. (NOT STARTED)

Document the dashboard query approach and its RLS enforcement, since a
panel may ask how one teacher is prevented from reading another class's
data. (NOT STARTED)

Revise Technical Background. Aseprite, Audacity, and Figma remain accurate.
Unity and Visual Studio should be removed. (NOT STARTED)

Credit any licensed art assets used for enemies or combat animations.
(NOT STARTED)
