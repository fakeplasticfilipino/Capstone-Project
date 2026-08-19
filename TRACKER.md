# TRACKER.md

The single source of truth for status. If you are a session starting
work on this project, read this file first and read all of it.

Two files carry context, and they do not overlap:

    CLAUDE.md     how the thing is built. Architecture, conventions,
                  data formats, decisions on record. Changes rarely.
    TRACKER.md    where the build is. Status, next action, what has
                  been run, what is blocked. Changes every session.

Nothing else in this repository describes status. README.md is the
public face on GitHub and is written for a reader who is not working
on the code.

This file records present state, not history. When something is
finished, compress it to a line rather than accumulating detail. A
tracker that grows every session stops being useful.

Status markers: (COMPLETE), (IN PROGRESS), (NOT STARTED), (BLOCKED).

Last updated: after Block 10 was built and passed the harness.

## Right now

Blocks 1 through 9 are built, verified and live. Schema v4 has been
run against the live database, the client is pushed, and Act I plays
end to end on a desktop browser with hazards, pickups, the weighted
performance score and the optional feedback form all working.

Block 10 is written and passes the harness at 156 checks, and has NOT
yet been run against the live database or pushed. It needed no
migration: schema v3 already created player_inventory and
player_equipment with their policies, so there is nothing to run in
the SQL editor and nothing to add to the Run log. It moves to done
below once the live checkpoint in its section passes.

The automated suite passes at 156 checks, 0 failures.

What is not done is everything that does not depend on writing more
engine code: the game has never run on a real phone, the assessment
item bank has not been validated, and there is no replacement art.
Two of those three are waiting on other people.

## Next action

One thing, and it is not a block.

Send the validation packet to Ms. Donadillo-Espiritu.
MACARIO_Act1_Instrument_Validation.docx is written and ready.

It goes first because it is the longest external dependency in the
project and because macario_items_v3.sql cannot be run until it comes
back. The item bank is what the entire learning gain finding rests
on, and the returned form is the Appendix exhibit and the answer to
any question about instrument validity.

Checkpoint: the packet is sent and the date is written into the Run
log below. Failure is another week passing with it still in the
folder.

After that, in order: a device pass on a real Android phone, then
Block 10.

## The milestone

Final defense with student data collection, confirmed. Grade 8 students at
Imus National High School play the game and sit both tests. School approval
is secured.

Parental consent was waived by the guidance office and the resource person,
on the grounds that the session runs about an hour and that identifiable
results stay with the teacher while the proponents receive only aggregate
figures. Get that waiver in writing and keep it with the validation form. A
panel asking about consent wants a document, not a recollection.

Data collection covers Act I, since Acts II through IV have no content yet.
Act I quality and the assessment instrument therefore outrank Act II content
entirely.

Freeze the software roughly ten days before the defense, to leave room for
scheduling the session, running it, and analysing what comes back.

Students are identified by a code, never by name. create_accounts.js issues
mag-aaral01 through however many the session needs, with a matching coded
email, and the teacher keeps the code to name mapping on paper. The database
therefore holds nothing identifying, which is what makes the consent waiver's
premise literally true: this Supabase project is owned by the proponents, and
row level security does not restrict a project owner. Numbering must stay
stable once the accounts exist, because the code is the student's identity
for the whole study.

Content authority: the resource person has left the assessment questions and
the storyline to the proponents, on the condition that both stay faithful to
the source material she provided. That makes the Act I rewrite a writing
task rather than an approval loop, but the source is the standard it will be
judged against. That source is a physical book rather than a file, so it
cannot be put in the repository. The proponents will work through it with
the session at the time of the rewrite; do not go looking for it on disk.

## Run log

What has actually been applied to the live Supabase project, and
when. A fresh session should trust this over any memory of a chat.

    db/applied/macario_schema.sql       RUN
    db/applied/macario_schema_v2.sql    RUN
    db/applied/macario_schema_v3.sql    RUN
    db/applied/macario_schema_v4.sql    RUN, 19 Aug 2026

    db/macario_items_v3.sql             NOT RUN. Waits on the
                                        validation packet coming back.

    db/db_healthcheck.sql               read-only, run any time
    db/reset_test_accounts.sql          run before any full-flow test.
                                        Clears inventory and equipment
                                        as of Block 10, so a retest
                                        sees the Act I grant happen
    db/enrollment_setup.sql             only needed for a fresh database

Supabase project reference: rkfnovfkroajottpmxxq

The database holds eleven tables, matching the revised ERD. Confirm
with db/db_healthcheck.sql, which checks all eleven, confirms the two
v4 drops happened, and verifies every migration column.

## The three stated objectives

What the panel assesses against.

Objective 1, a 2D narrative RPG across four acts. (IN PROGRESS)
Framework complete. Only Act I has content, and that content is
placeholder pending a rewrite.

Objective 2, gameplay mechanics: dynamic difficulty, health,
equipment, cosmetic rewards. (IN PROGRESS) Difficulty and health are
complete. Equipment is built and awaiting its live check. Cosmetics
are Block 11.

Objective 3, integrated assessment. (COMPLETE) Pre-tests and
post-tests, server-side grading, in-game performance scoring,
optional feedback, and the teacher dashboard are all built.

## Functional requirements

The paper specifies seventeen. This is the scoreboard a panel will
work through.

| Requirement | Status |
|---|---|
| User Authentication | (CHANGED) Login and role routing built. Self-registration deliberately not built; accounts are administrator-created |
| Chapter Progression | (PARTIAL) All four registered and unlock in order. Only Act I has content |
| Player Movement | (BUILT) |
| Combat Mechanics | (BUILT) Melee, takedown from behind, thrown projectile as the special attack |
| Stealth Mechanics | (BUILT) Patrols, detection meter, hide spots |
| Interaction System | (BUILT) |
| Narrative Delivery | (PARTIAL) Built for Act I only |
| Dynamic Difficulty | (BUILT) Guard speed scaled by act, 1.00 to 1.45. Verified in the harness; no act beyond Act I has guards yet |
| Health System | (BUILT) Health, damage, invulnerability, respawn, hazards, heart pickups |
| Equipment System | (BUILT, NOT LIVE) Two items, weapon and accessory slots, an inventory screen on pause. Harness green; not yet run against the live database |
| Cosmetic Reward | (NOT BUILT) Currency column exists in schema v3. Block 11 |
| Trivia | (BUILT) Act I seeded; Acts II to IV not seeded |
| Act Assessment | (BUILT) Act I seeded; Acts II to IV not seeded |
| Performance Scoring | (BUILT) Weighted sum, 50 completion and 25 each for survival and stealth. Time recorded but not scored |
| Progress Tracking | (BUILT) Completion, scores, damage taken, detections, elapsed time |
| Teacher Monitoring | (BUILT) |
| Data Synchronization | (CHANGED) Writes go straight to Supabase and the game requires a connection. There is no offline queue, so "upon internet availability" is not implemented as worded |

## Non-functional requirements

The paper specifies ten.

| Requirement | Status |
|---|---|
| Performance | (BUILT) No build step, no framework, plain script tags. Never measured on a real device |
| Reliability | (BUILT) Debounced save, ten second autosave backstop, beforeunload flush, logout flush |
| Usability | (PARTIAL) Tagalog throughout and 44px touch targets, but the mobile control cluster overflows the viewport at phone width. Currently not met on the target device |
| Accessibility | (PARTIAL) Runs in Chrome on Android by design. Never opened on an Android phone |
| Online Functionality | (BUILT) |
| Compatibility | (PARTIAL) Never tested across Android screen sizes |
| Maintainability | (BUILT) Four layers with a strict dependency direction, documented in CLAUDE.md |
| Data Integrity | (BUILT) Row level security, unique constraints, server-side grading |
| Connectivity | (BUILT) |
| Readability | (BUILT) Plus a text size setting the paper does not ask for |

Three of the four PARTIAL entries are the same fact stated four ways:
nothing has ever run on a real phone. One device pass moves all of
them.

## Blocks done

Schema v2 and v3. RLS recursion fix, act tables, assessment items and
trivia, server-side grading, inventory, equipment and session tables,
currency column. (COMPLETE)

Role routing and class enrollment. Teachers redirect to teacher.html
and never receive a game_progress row. (COMPLETE)

Teacher dashboard. Roster, act completion, pre and post scores, gain,
performance, class averages, and all empty and error states.
(COMPLETE)

Act framework across four acts. Content extracted to content/actN.js,
loadAct and unloadAct, the act state machine, ordered unlocking, title
cards, transition screens, resume into the stored act. (COMPLETE)

Assessment module. Trivia card, pre-test and post-test, one question
per screen, submitting through submit_assessment. Handles an already
recorded attempt, an act with no items, and network failure.
(COMPLETE)

Block 6, movement and conflict. Scenes, jump with gravity and one-way
platforms, health with invulnerability and respawn, stealth guards
with a detection meter and hide spots, combat with melee, takedown
from behind, and a thrown projectile. (COMPLETE)

Block 7, schema v3 and the game shell. Title screen with an entry
gate, pause that halts the loop and offsets wall-clock timers,
settings persisted to localStorage, logout with a save flush.
(COMPLETE)

Block 8, hazards, pickups and difficulty. Hazard regions that cost one
health and knock the player clear rather than respawning them, heart
pickups that restore one and are refused at full health, guard speed
scaled by act number. (COMPLETE)

Block 9, schema v4 and measurement. Per-act damage and detection
counters persisted in save_state, play time that excludes pauses, the
weighted performance score, game_sessions rows, and the optional
feedback form after the post-test. (COMPLETE)

Act I content. Two scenes: the road and the outpost. Two patrolling
guards, three crates, two platforms, two bamboo stake hazards, one
heart pickup, and a kasama to deliver the message to. Placeholder
script throughout. (COMPLETE)

Paper audit. Seventeen functional requirements, ten non-functional,
five modules, seventeen ERD entities and all four act storyboards
checked against the code. Its findings are the two scoreboards above.
(COMPLETE)

Revised Act I item bank. Ten matched pre and post pairs plus a trivia
fact that no longer leaks pre-test answers, written as
db/macario_items_v3.sql. (COMPLETE, NOT RUN)

## Blocks remaining

Block 10, inventory and equipment. content/items.js as pure data,
inventory.js owning both ownership tables, an inventory screen on the
pause panel, weapon and accessory slots, and two effects: a faster
spear and one extra heart. Items are granted on entering Act I rather
than bought, because the shop is Block 11. No migration; schema v3
already had the tables. (IN PROGRESS, awaiting the live check)

The live checkpoint, in order. Run db/reset_test_accounts.sql, which
now clears player_inventory and player_equipment too. Log in as
hi@example.com and enter Act I. Pause, open Imbentaryo: two items
listed, both slots reading Wala. Tap Agimat: the slot fills and the
HUD shows four hearts with the fourth full. Resume, take a hazard
hit: three of four. Reload and resume: still four hearts at full, and
that is the check that equipment is being read back at login. Equip
the sibat and hold attack: the spear crosses the outpost visibly
faster and the next throw comes sooner. Set health to four and
unequip the Agimat: three hearts, health clamped, not a fourth heart
the HUD cannot draw. In Supabase, player_inventory holds two rows for
the student and player_equipment never holds two rows for one slot.
Teacher login in incognito is unchanged.

Failure looks like a fourth heart that renders empty, a heart count
that does not survive a reload, or an inventory screen that is empty
after entering the act.

Block 11, currency and cosmetics. Currency awarded on act completion
and scaled by performance score, a simple shop inside the inventory
screen, and period-correct outfits that change the player sprite.
Closes the Cosmetic Reward requirement and the second objective.
(NOT STARTED)

Block 12, polish. The mobile control overflow, the outpost balance
pass, and audio if there is time. (NOT STARTED)

Rewrite Act I in full against the finished mechanics, then write Acts
II through IV. Content work, done once the systems stop moving.
(NOT STARTED)

Seed trivia and assessment items for Acts II through IV. Until then
those acts skip their tests with a notice, which is deliberate.
(NOT STARTED)

## Blocked on other people

These cannot be compressed at the end and do not depend on any block.
Start them before writing more code.

Send the validation packet to Ms. Donadillo-Espiritu. The packet is
written and ready. See Next action. (READY TO SEND)

Chase the replacement art. Assets/ holds only a floor tile and the
player walk cycle. Everything else falls back to a labelled
placeholder box, so the game is fully playable and visually skeletal.
That is the fallback system working, not a fault. Block 11's cosmetic
system is pointless to demonstrate without at least two real outfits.
(NOT STARTED)

Provision student accounts for the session, and pilot with two or
three students who are not part of the study. A pilot run on a study
account consumes that student's one attempt permanently, so the two
sets must be separate. (NOT STARTED)

## Known problems

Nothing has ever run on a real phone. Every test to date is a desktop
browser or headless Chromium at phone dimensions. This is the largest
untested assumption in the project, and it sits directly under the
argument that justifies the entire technical approach. (NOT STARTED)

The mobile control cluster overflows the viewport at phone width.
Block 6 added a jump button and an attack button to a row that
already held three, and at 1.75 zoom the interact button runs off the
right edge of a 412px screen. Scheduled for Block 12. (NOT STARTED)

Assets/Cement_Tile.png is 1.4 MB for a repeating floor tile. On a
project whose stated justification is low-end Android performance
over mobile data, this is worth fixing before anyone measures a load
time. (NOT STARTED)

Dynamic difficulty cannot be demonstrated in the running game,
because only Act I has guards and Act I is the 1.00 multiplier. The
formula is documented and the harness proves it against a fabricated
act. The honest answer to a panel is that the lever is built and the
acts it scales are not written yet. (BY DESIGN)

## Deferred

Student-facing join screen. join_code exists but class assignment is
administrator-assigned.
Multiple save slots.
Dashboard export and per-question item analysis.
Offline and save-conflict handling.
Persisting partial test answers. A student who reloads mid-test
restarts that test from question one. Nothing is recorded until
submission, so no answers are lost, but the questions are asked
again.

## Verification

The harness lives at _dev/. Run it from the repository root:

    npm install
    node _dev/test.js

156 checks. Anything other than "0 failed" is a regression.

It drives the shipping index.html with a stubbed Supabase client and
Playwright against Chromium at phone dimensions, so it cannot pass
against a page students no longer load. It never touches the live
project.

Add checks in the same block that adds the system. A suite that lags
the build is worse than none, because it reports green on code it
never exercised.

Three checks exist to protect the study rather than the code: that
complete runs before the feedback form opens, that an act still
completes when the feedback module is absent, and that it still
completes when the inventory module is absent. Section U blocks
inventory.js at the network layer to prove the last one, rather than
trusting the guards by reading them.

It is not a substitute for a device pass.

## Pitfalls found the hard way

These are recorded because each cost real debugging time and each would
have shipped silently.

The auth bootstrap must stay inside the DOMContentLoaded listener in
game.js. It used to run at parse time, and because the other files load
after it, a student with a stored session hit getSession() resolving on a
microtask before acts.js had executed. The window.Acts guards swallowed the
whole act lookup, so every reload landed in Act I regardless of current_act.
Nothing appeared in the console.

The same microtask hazard rules out an event as the shell's entry signal.
shell.js registers its listeners inside its own DOMContentLoaded handler,
which runs after game.js's. enterGameAsUser calls Shell.awaitEntry()
directly for that reason. Do not replace it with an event.

Acts.syncStart awaits the entire pre-act flow, trivia card and pre-test
included. The entry gate has to sit before it, or a student taps into a test
that has been running behind the title screen.

saveProgress refuses to write until saveReady is set at the end of the login
sequence. The parse-time loadAct call adds Act I's starting quest, which
marks the save dirty, and the resulting debounced write fired mid-login with
Acts.current still at 1, overwriting the stored act.

The same debounce is why logout awaits Game.flushSave() before signing out.

Pausing has to stop the loop rather than cover it. Invulnerability and the
attack hold are measured against performance.now(), which does not stop for
a pause screen, so both are offset by the pause duration on resume.

Assessment checks for an existing score before showing any questions rather
than relying on submit_assessment raising ALREADY_SUBMITTED. The constraint
is still the real guarantee, but discovering the clash at submit time meant
the student answered every question for nothing.

The trivia card is shown before the pre-test, so a trivia fact drawn from
the tested content hands students the answers. The Act I fact did exactly
that for three of five items.

## Documentation debt

Raised at the defense, tracked separately from code.

Justify vanilla JavaScript and Supabase over Unity and C#, argued
from the study's own literature review: a comparable project was
constrained by 3D performance on low-end devices, and a lightweight
browser application addresses that gap directly. Frame as responding
to an identified limitation rather than as reduced scope.
(NOT STARTED)

Revise the ERD to eleven entities. The paper says fifteen and then
describes seventeen, so it needs correcting regardless. PlayerAction
and the achievement entities are dropped, GameScore folds into
ActProgress, and all three have a stated reason. The database now
matches. (NOT STARTED)

Document server-side grading. The answer key never reaches the
client, which is a design strength worth stating. (NOT STARTED)

Document the dashboard query approach and its RLS enforcement, since
a panel may ask how one teacher is prevented from reading another
class's data. (NOT STARTED)

Document that game_progress.currency is client written and why that
is acceptable. (NOT STARTED)

Document the performance score formula and its weights, including
why time is recorded but not scored. The formula is in CLAUDE.md.
(NOT STARTED)

Revise Technical Background. Aseprite, Audacity and Figma remain
accurate. Unity and C# should be removed. Visual Studio should be
corrected to Visual Studio Code. GitHub Pages and Supabase should be
added, since neither appears despite both being central.
(NOT STARTED)

Credit any licensed art assets used for enemies, outfits, or combat
animations. (NOT STARTED)

