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

Last updated: after the first device pass on a real Android phone.

## Right now

Blocks 1 through 9 are built, verified and live. Schema v4 has been
run against the live database, the client is pushed, and Act I plays
end to end on a desktop browser with hazards, pickups, the weighted
performance score and the optional feedback form all working.

Block 10 is built, verified against the live database and live. It
needed no migration: schema v3 already created player_inventory and
player_equipment with their policies, so there is nothing in the Run
log for it.

Block 11 is written, pushed, and live on Pages, and passes the
harness. What it has NOT had is its live checkpoint: nobody has
confirmed the currency award and the shop against the real database.
It needed no migration either, since game_progress.currency arrived
in schema v3 and the ownership tables were already there. It moves to
done below once that checkpoint passes.

The automated suite passes at 226 checks, 0 failures.

The game has now run on a real Android phone, a 4GB device, and the
result is the single most important thing in this file: performance
is fine. Smooth, at least 30fps, no problem. That is the answer to
the panel question the entire technical approach rests on, and it is
now measured rather than argued.

The same pass found three faults, all fixed and all covered by
checks. Atake and Talon did nothing at all, because .action-cluster
never set pointer-events: auto inside a control bar that is
pointer-events: none. The camera was a desktop setting applied to
every screen: at 412px wide it showed 235 world pixels, about two and
a half Macarios across. And the game is meant to be held sideways,
which was never written down anywhere, so portrait is now a rotate
notice rather than a layout to fix.

What is left is the assessment item bank, which is unblocked and
waiting to be run, and the replacement art.

## Next action

Run db/macario_items_v3.sql against the live project.

It is unblocked. Ms. Donadillo-Espiritu declined to fill in the
validation form and told the proponents to make the game, on the
understanding that events stay as historically accurate as the
available data allows. The assessment items are ours to write. The
packet is therefore closed, and the item bank stops waiting on
anybody.

Run it as written. It was already revised once, against the leak
where the Act I trivia fact handed students three pre-test answers.
Items can still be edited afterwards, because nothing is collected
until the session runs.

Checkpoint: macario_items_v3.sql moves to RUN in the Run log with its
date, and a full Act I run finally shows real questions in the
pre-test and the post-test instead of the empty-bank notice.

After that, in order: ask her for the written note described below,
a device pass on a real Android phone, then Block 12.

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
the storyline to the proponents, and has confirmed it a second time by
declining to complete the instrument validation form and telling them to
make the game. The condition is unchanged and is the whole of what she asked
for: both stay faithful to the source material she provided, as historically
accurate as the available data allows. That makes the Act I rewrite and the
item bank writing tasks rather than approval loops, but the source is the
standard both will be judged against, and there is now no external reviewer
standing between a wrong item and the defense. That source is a physical book rather than a file, so it
cannot be put in the repository. The proponents will work through it with
the session at the time of the rewrite; do not go looking for it on disk.

## Run log

What has actually been applied to the live Supabase project, and
when. A fresh session should trust this over any memory of a chat.

    db/applied/macario_schema.sql       RUN
    db/applied/macario_schema_v2.sql    RUN
    db/applied/macario_schema_v3.sql    RUN
    db/applied/macario_schema_v4.sql    RUN, 19 Aug 2026

    db/macario_items_v3.sql             NOT RUN. No longer blocked;
                                        this is the next action.

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
equipment, cosmetic rewards. (IN PROGRESS) Difficulty, health and
equipment are complete. The cosmetic system is built and awaiting its
live check. After that, the only thing between this objective and
(COMPLETE) is outfit art, which is a drawing task rather than a code
one.

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
| Equipment System | (BUILT) Two items, weapon and accessory slots, an inventory screen on pause. Items are granted on act entry; the shop is Block 11 |
| Cosmetic Reward | (BUILT, NOT LIVE) Currency awarded per act and scaled by performance, a shop inside the inventory, two priced outfits. Harness green. Outfits render as the placeholder box until their sheets are drawn |
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
| Performance | (BUILT) No build step, no framework, plain script tags. Measured on a 4GB Android phone: smooth, at least 30fps |
| Reliability | (BUILT) Debounced save, ten second autosave backstop, beforeunload flush, logout flush |
| Usability | (BUILT) Tagalog throughout, 44px touch targets, and the whole control row fits in landscape down to 740px. Portrait shows a rotate notice rather than a broken layout |
| Accessibility | (BUILT) Runs in Chrome on Android, confirmed on a real device |
| Online Functionality | (BUILT) |
| Compatibility | (PARTIAL) Confirmed on one Android phone. Not yet tested across screen sizes; the harness proves the layout down to 740 by 360 only |
| Maintainability | (BUILT) Four layers with a strict dependency direction, documented in CLAUDE.md |
| Data Integrity | (BUILT) Row level security, unique constraints, server-side grading |
| Connectivity | (BUILT) |
| Readability | (BUILT) Plus a text size setting the paper does not ask for |

Three of those entries used to be the same fact stated four ways:
nothing had ever run on a real phone. The device pass moved all of
them. What is left of Compatibility is genuinely a second phone
rather than a first one.

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

Block 10, inventory and equipment. content/items.js as the catalogue,
inventory.js owning both ownership tables, an inventory screen on the
pause panel, weapon and accessory slots, and two effects: a faster
spear and one extra heart. Items are granted on entering the act
whose content names them, because the shop is Block 11. No migration
was needed. (COMPLETE)

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

Block 11, currency and cosmetics. Currency in game_progress, awarded
as objectives land and topped up on completion so an act pays exactly
its rounded performance score. A shop panel off the inventory screen,
two outfits at 50 and 90, and a sprite swap that replaces whichever
sheets an outfit declares. No migration was needed.
(IN PROGRESS, awaiting the live check)

The live checkpoint, in order. Run db/reset_test_accounts.sql. Log in
as hi@example.com and enter Act I with a balance of zero. Complete an
objective: a toast reads plus 10 and the inventory screen shows 10.
Reload and resume: the balance is unchanged, and this is the check
that matters most, because paying again on every login was a real bug
the harness caught rather than a hypothetical. Finish the act: the
transition names the award, and the total paid equals the
performance_score on the act_progress row, rounded. Open Tindahan:
Damit ng Magsasaka is buyable at 50 and Uniporme ng Katipunero reads
Kulang until you can afford it. Buy one: the balance drops once, the
row reads Pag-aari, and it appears in the owned list. Wear it: the
player becomes a dashed placeholder box naming Skin_Walk.png, which
is correct until that file exists. Take it off: the walk cycle comes
back.

Failure looks like a balance that grows on reload, a total that does
not match the score, a purchase that charges twice, or a player
sprite that does not come back after unequipping.

Block 12, polish. (IN PROGRESS)

Done, from the device pass: pointer-events on .action-cluster so
Atake and Talon work, --zoom at 1.25 for phone landscape, and the
rotate notice that makes portrait a prompt rather than a layout. All
three are covered by checks in sections AA, AB and AC.

Left: the outpost balance pass, now that the camera shows more than
two Macarios of the corridor and the equipment from Block 10 exists.
Assets/Cement_Tile.png is 1.4MB for a repeating floor tile and should
be shrunk before anyone measures a load time. Audio if there is
time, which is still the first thing to cut.

Rewrite Act I in full against the finished mechanics, then write Acts
II through IV. Content work, done once the systems stop moving.
(NOT STARTED)

Seed trivia and assessment items for Acts II through IV. Until then
those acts skip their tests with a notice, which is deliberate.
(NOT STARTED)

## Blocked on other people

These cannot be compressed at the end and do not depend on any block.
Start them before writing more code.

Get Ms. Donadillo-Espiritu's delegation in writing. One paragraph is
enough: that she reviewed the scope, delegated the assessment items
and the storyline to the proponents, and trusts them to stay faithful
to the source material she provided.

This replaces MACARIO_Act1_Instrument_Validation.docx, which she
declined to complete. That form was going to be the Appendix exhibit
and the answer to any question about instrument validity, and without
a substitute there is now no external evidence of either. A panel
asking who checked the questions would otherwise be told a story
rather than shown a document.

The same rule already applies to the consent waiver, and for the same
reason: get it in writing and keep the two together. (NOT STARTED)

Chase the replacement art. Assets/ holds only a floor tile and the
player walk cycle. Everything else falls back to a labelled
placeholder box, so the game is fully playable and visually skeletal.
That is the fallback system working, not a fault.

Block 11 adds two named files to that list: Skin_Walk.png and
Skin_Uniporme_Walk.png, the two outfits. Both are bought and worn
today and both render as the placeholder, so the cosmetic system is
complete in code and invisible on screen until they are drawn. The
filenames and the sheet geometry are one line of content each in
content/items.js; rename them to match whatever the artist delivers.
(NOT STARTED)

Provision student accounts for the session, and pilot with two or
three students who are not part of the study. A pilot run on a study
account consumes that student's one attempt permanently, so the two
sets must be separate. (NOT STARTED)

## Known problems

Only one phone has been tested, a 4GB Android device. It ran well and
every control works, but nothing is known about how the layout holds
on a much narrower or much wider screen. The harness covers 823 by
412 and 740 by 360 in landscape, which is a floor rather than a
survey. (PARTIAL)

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

226 checks. Anything other than "0 failed" is a regression.

It drives the shipping index.html with a stubbed Supabase client and
Playwright against Chromium at 823 by 412, phone LANDSCAPE, so it
cannot pass against a page students no longer load. It never touches
the live project.

It ran portrait until the device pass, which was wrong in a way that
hid faults for four blocks. Do not move it back. A check that clicks
an on-screen button is worth more than one that reads its style: the
dead Atake button would have passed any style assertion.

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

Document how the assessment items were validated, given that no
external validation form exists. The resource person declined to
complete one and delegated the items to the proponents, so the
Appendix carries the method instead: items written from the source
material she provided, matched pre and post pairs on the same topic
and difficulty with the key in a different position, and the trivia
card checked so it cannot hand students a pre-test answer. Her
written delegation, once obtained, sits alongside it. This is the
answer to a panel asking who checked the questions, and it needs
writing before anyone asks. (NOT STARTED)

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

