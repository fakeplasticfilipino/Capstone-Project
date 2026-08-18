# TRACKER.md

Current build status. Architecture and conventions live in CLAUDE.md.

This file records present state, not history. When something is finished,
compress it to a line rather than accumulating detail. A tracker that grows
every session stops being useful.

Status markers: (COMPLETE), (IN PROGRESS), (NOT STARTED), (BLOCKED)

Last updated: after Block 7.

## Milestone

Target is about one month out. Whether it is a progress presentation or a
final defense with student data collection is not yet confirmed, and that
answer changes the plan below. If data collection is expected, the software
must be finished roughly ten days before the date to allow for scheduling a
session at Imus NHS and analysing what comes back.

The remaining blocker on data collection is not code, it is validation of
the assessment items by the resource person. See documentation debt.

Note that this question does not block any current build work. Placeholder
items and administrator-created accounts are sufficient for every path
except real data collection, and the real items can land at any point
before a testing window opens.

Hosting for the testing window is GitHub Pages, which is sufficient for a
month of student testing and requires no migration.

## Run before testing Block 7

macario_schema_v3.sql has not been run. Until it is, nothing breaks,
because no code in Block 7 reads or writes the new tables. Blocks 8 onward
will not work without it.

Clear the Supabase SQL editor before pasting. Verification queries are at
the bottom of that file and must be run as each account rather than in the
SQL editor, which bypasses RLS.

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
(COMPLETE)

Block 6, movement and conflict systems. Scenes, jump with gravity and
one-way platforms, health with invulnerability frames and respawn, stealth
guards with a detection meter and hide spots, and combat with melee,
takedown from behind, and a thrown projectile. (COMPLETE)

Act I outpost. Two patrolling guards, three crates, two platforms, and a
kasama to deliver the message to. Delivering it is the fifth objective,
which runs the post-test and the transition into Act II. (COMPLETE)

Block 7, schema v3 and the game shell. macario_schema_v3.sql creating
player_inventory, player_equipment, player_achievements, game_sessions and
player_actions with RLS, plus a currency column on game_progress. shell.js
owning the title screen, pause, settings and logout. Pause halts the loop
outright and offsets the invulnerability and attack-hold timers rather than
letting wall clock time run through it. (COMPLETE)

## Art status

The outpost needs two new sprites that do not exist yet: Assets/Guard.png
and Assets/Kasama.png. Both fall back to labelled placeholder boxes, so the
scene is fully playable without them.

Assets/ currently holds only Cement_Tile.png and the player Walk.png. Every
other sprite and background was removed pending replacement art from
classmates. Act I is fully playable but visually skeletal: the player shows
a placeholder box while idle, all NPCs and both skylines are placeholder
boxes, and the death animation in the stage cutscene is a placeholder. This
is the fallback system working, not a fault.

This is now the highest priority item that is not code, because it is the
one blocked on other people. A 2D narrative RPG that renders as dashed
boxes reads badly in front of a panel regardless of what is behind it, and
classmate turnaround cannot be compressed at the last minute.

Confirm Walk.png is genuinely 12 frames in a 5 + 5 + 2 grid. If the cycle
pauses or shows a sliver of the next frame, the columns value in
SPRITE_SHEETS is wrong.

## Next

The remaining blocks close the third stated objective, which commits to
dynamic difficulty, health, equipment and cosmetic rewards. Health exists.
The other three do not, so this is a gap in a stated objective rather than
polish. Acts II through IV are deliberately held until the framework under
them is finished, so that writing an act is content work and nothing else.

Block 8, inventory and equipment. content/items.js as pure data alongside
the acts, an inventory screen, equip slots reading player_equipment, and
equipment that changes something in play. Menu entries for both are added
here rather than stubbed in Block 7, because an entry that opens nothing is
the first thing a panel taps. (NOT STARTED)

Block 9, currency and cosmetic rewards. Where items come from, tied to act
completion and assessment performance. (NOT STARTED)

Block 10, dynamic difficulty. Scales guard alertRate and detectRadius from
test scores, health lost and respawn count. Needs a stated rule that can be
explained to a panel rather than a tuned feel. (NOT STARTED)

Block 11, telemetry and achievements. Writers for game_sessions and
player_actions, batched and fire and forget, plus content/achievements.js
and unlock records. Closes the ERD gap. (NOT STARTED)

Block 12, audio, the outpost balance pass, and replacing the placeholder
stage poem and Katipunero dialogue. Audio settings sliders are deliberately
absent from the Block 7 settings screen until this lands. (NOT STARTED)

Act II content, The Long Shadow of War. Script, dialogue, assessment items,
and art. This is the long pole and it is human work, not code. The
framework is finished and waiting: content/act2.js is a registered,
loadable act with an empty npcs array. (NOT STARTED)

Act III, The Republic in the Shadows. Act IV, The Bitter Harvest. Planned
as thin content against a complete framework. (NOT STARTED)

Seed assessment items and a trivia fact for Acts II through IV. Until then
those acts skip their tests with a notice, which is deliberate. (NOT
STARTED)

If time compresses, Blocks 8 through 10 are the ones welded to a stated
objective. Blocks 11 and 12 can be dropped without a panel noticing.

## Deferred

Student-facing join screen. join_code exists but class assignment is
administrator-assigned.
Multiple save slots. One save per student.
Character customization beyond cosmetics.
Dashboard export and per-question item analysis.
Offline and save-conflict handling.
Persisting partial test answers. A student who reloads mid-test currently
restarts that test from question one. No answers are recorded until the
whole test is submitted, so nothing is lost and no partial attempt is
counted, but the questions are asked again.

## Bugs

The mobile control cluster overflows the viewport at phone width. Block 6
added a jump button and an attack button to a row that already held three
controls, and at the 1.75 zoom the interact button runs off the right edge
of a 412px screen. Everything is reachable on a desktop browser, which is
where it was tested, and not on the target device. This is a Block 6 defect
rather than a Block 7 one and is untouched by the shell work. (NOT STARTED)

## Housekeeping

create_accounts.js is listed in .gitignore but was committed before that
rule existed, so it remains publicly visible. It holds only placeholder
text at present, but a real secret key pasted in later would publish to a
public repository and would bypass every RLS policy. Fix with
git rm --cached create_accounts.js. (NOT STARTED)

Replace placeholder text: the stage poem and the Katipunero dialogue are
both placeholders. Folded into Block 12. (NOT STARTED)

Re-export the capstone proposal as a real PDF. The current file is a ZIP
archive of page images. (NOT STARTED)

## Pitfalls found in Blocks 2, 3 and 7

These are recorded because each cost real debugging time and each would
have shipped silently.

The auth bootstrap must stay inside the DOMContentLoaded listener in
game.js. It used to run at parse time, and because acts.js and
assessment.js load after game.js, a student with a stored session hit
getSession() resolving on a microtask before acts.js had executed. The
window.Acts guards then swallowed the whole act lookup, so every reload
landed in Act I regardless of current_act. Nothing appeared in the console.

The same microtask hazard rules out an event as the shell's entry signal.
shell.js registers its listeners inside its own DOMContentLoaded handler,
which runs after game.js's, and the browser drains microtasks between the
two. A stored session can therefore have enterGameAsUser already running
before the shell is listening at all, and a dispatched event would be sent
to nobody. enterGameAsUser calls Shell.awaitEntry() directly for that
reason. Do not replace it with an event.

Acts.syncStart awaits the entire pre-act flow, trivia card and pre-test
included. The entry gate therefore has to sit before it rather than after,
or a student taps Magpatuloy into a test that has been running behind the
title screen.

saveProgress refuses to write until saveReady is set at the end of the
login sequence. The parse-time loadAct call adds Act I's starting quest,
which marks the save dirty, and the resulting debounced write fired
mid-login with Acts.current still at its initial 1, overwriting the stored
act. A slower connection made it more likely, not less.

The same debounce is why logout awaits Game.flushSave() before signing out.
On a shared classroom phone, logout is used seconds after something
happened, which is exactly the window the debounce would drop.

Pausing has to stop the loop rather than cover it. Invulnerability and the
attack hold are measured against performance.now(), which does not stop for
a pause screen, so both are offset by the pause duration on resume. Without
that a ten second pause silently eats the one second invulnerability
window.

Assessment checks for an existing score before showing any questions rather
than relying on submit_assessment raising ALREADY_SUBMITTED. The constraint
is still the real guarantee, but discovering the clash at submit time meant
the student answered every question for nothing.

## Testing

There is a development harness that is not in the repository: a stubbed
Supabase client and Playwright suites driving Chromium at phone dimensions
against a fake database. Block 7 adds 55 checks covering the entry gate on
both the fresh and resuming paths, pause halting guard patrol and the
detection meter, the invulnerability offset, the settings round trip and
its persistence, logout confirmation, the legacy current_room fallback, and
a stalled load offering a way out.

It is not a substitute for a device pass. Everything to date has been
verified in a desktop browser or headless Chromium at phone dimensions,
which is not the same as a phone. Open the live URL on an actual Android
device and play Act I end to end, including both tests and the outpost,
before trusting any of it in a classroom. The mobile control overflow
recorded under Bugs is what a device pass would have caught months ago.

## Documentation debt

These will be raised at the defense and are tracked separately from code.

Justify Unity to vanilla JavaScript and Supabase, argued from the existing
literature review: a comparable project was constrained by 3D performance
on low-end devices, and a lightweight browser application addresses that
gap directly. Frame as responding to an identified limitation rather than
as reduced scope. (NOT STARTED)

Reconcile the ERD, which documents 15 entities, against the tables built.
game_sessions and player_actions now exist and are named to match. GameScore
is deliberately not built, because assessment_scores together with
act_progress.performance_score already satisfy it; annotate rather than
duplicate. (NOT STARTED)

Obtain validation of the assessment item bank from Ms. Donadillo-Espiritu,
already listed in Appendix A as the resource person. This is the answer to
questions about instrument validity, and it is the blocking item on any
data collection. (NOT STARTED)

Document server-side grading. The answer key never reaches the client,
which is a design strength worth stating. (NOT STARTED)

Document the dashboard query approach and its RLS enforcement, since a
panel may ask how one teacher is prevented from reading another class's
data. (NOT STARTED)

Document that game_progress.currency is client written and therefore not
trustworthy, and why that is acceptable: it buys cosmetics and touches
nothing the dashboard reports. Better stated by the proponents than
discovered by the panel. (NOT STARTED)

Revise Technical Background. Aseprite, Audacity, and Figma remain accurate.
Unity and Visual Studio should be removed. (NOT STARTED)

Credit any licensed art assets used for enemies or combat animations.
(NOT STARTED)
