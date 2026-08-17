# TRACKER.md

Current build status. Architecture and conventions live in CLAUDE.md.

This file records present state, not history. When something is finished,
compress it to a line rather than accumulating detail. A tracker that grows
every session stops being useful.

Status markers: (COMPLETE), (IN PROGRESS), (NOT STARTED), (BLOCKED)

Last updated: after Block 2.3.

## Milestone

Target is about one month out. Whether it is a progress presentation or a
final defense with student data collection is not yet confirmed, and that
answer changes the plan below. If data collection is expected, the software
must be finished roughly ten days before the date to allow for scheduling a
session at Imus NHS and analysing what comes back.

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

Act framework 2.1 through 2.3. Act I extracted to content/act1.js,
world building wrapped in loadAct and unloadAct, act state machine writing
to act_progress with completion scoring. (COMPLETE)

Act I gameplay: five NPCs, buko gift quest, stage performance cutscene with
day to night transition and death animation, Katipunero reveal, save and
resume. (COMPLETE)

Sprite system: multi-row grid sheets via the columns field, scaling from
frame height, and asset cache busting through ASSET_VERSION. (COMPLETE)

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

## In progress

Block 2, act framework.

  2.4 Act stubs for II through IV, registration in Acts.registry, act
      transition screen on completion, refusal of locked acts. Replaces the
      current ending, which still calls teleportToNewRoom. (NOT STARTED)

  2.5 Read game_progress.current_act on load and load the matching act.
      Existing saves default to 1. (NOT STARTED)

## Next

Block 3, assessment module. The last priority 0 item. Trivia card,
pre-test, act, post-test, writing through submit_assessment. Database side
is already built and tested, so this is interface and wiring. Once done,
the pre-test, post-test, and gain columns on the teacher dashboard populate
with no changes to teacher.js. (NOT STARTED)

Combat and stealth, deliberately minimal. Tap to attack, hold for ranged,
detection radius with no line of sight. Built and tuned inside Act II,
because a system with no level to exercise it cannot be tested.
(NOT STARTED)

Jump and health. Prerequisites for combat. Note that the functional
requirements specify movement and jump; only lateral movement exists.
(NOT STARTED)

Act II content, The Long Shadow of War. Script, dialogue, assessment items,
and art. This is the long pole and it is human work, not code. It does not
block on the framework and should proceed in parallel. (NOT STARTED)

Act III, The Republic in the Shadows. Act IV, The Bitter Harvest.
Planned as thin content against a complete framework. (NOT STARTED)

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
questions about instrument validity. (NOT STARTED)

Document server-side grading. The answer key never reaches the client,
which is a design strength worth stating. (NOT STARTED)

Document the dashboard query approach and its RLS enforcement, since a
panel may ask how one teacher is prevented from reading another class's
data. (NOT STARTED)

Revise Technical Background. Aseprite, Audacity, and Figma remain accurate.
Unity and Visual Studio should be removed. (NOT STARTED)

Credit any licensed art assets used for enemies or combat animations.
(NOT STARTED)
