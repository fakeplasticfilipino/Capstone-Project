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

Last updated: after Block 12's icon pass and the settings reset. Not
yet confirmed on the device.

## Right now

Blocks 1 through 9 are built, verified and live. Schema v4 has been
run against the live database, the client is pushed, and Act I plays
end to end on a desktop browser with hazards, pickups, the weighted
performance score and the optional feedback form all working.

Block 10 is built, verified against the live database and live. It
needed no migration: schema v3 already created player_inventory and
player_equipment with their policies, so there is nothing in the Run
log for it.

Block 11 is done. Currency, the award formula and the shop were
confirmed against the live database in a full Act I run. It needed no
migration, since game_progress.currency arrived in schema v3 and the
ownership tables were already there.

The Act I item bank is seeded. Both tests now serve ten matched items
and the dashboard reports a real pre, post and gain.

The automated suite passes at 284 checks, 0 failures.

The UI now reads as a game rather than a form. Every button carries an
inline SVG icon beside its Tagalog label, the panels and the touch
controls have a bevel and a rim rather than a flat fill, and the
settings screen offers a reset. All of it is verified in the harness
and NONE of it has been seen on the phone yet.

That pass found something worth more than the icons. Touch targets
were only ever worked out against --zoom for the control cluster.
Everything on a screen was still stated as 44 CSS pixels, which is 30.8
on glass: the four answers to a test item, every menu button, the text
size choices, the shop rows, and the pause button. The four answers are
the most important targets in the study and the ones a Grade 8 student
taps ten times per test. They are all at 44 rendered now, measured by
checks rather than read off the stylesheet.

The game has now run on a real Android phone, a 4GB device, and the
result is the single most important thing in this file: performance
is fine. Smooth, at least 30fps, no problem. That is the answer to
the panel question the entire technical approach rests on, and it is
now measured rather than argued.

Later passes took the camera back in stages, 1.25 then 1 then 0.7,
each earlier value still reading as too close on glass. 0.7 is set
from the jump rather than from taste: at zoom 1 a single jump put
Macario's head at 90% of the screen height, and at 0.7 it is 63%. The
movement buttons are the largest control on screen at 67px, with the
action buttons at 53.

0.7 is CONFIRMED ON THE DEVICE and is the settled value. Do not
change it without a phone in hand; three checks in section AB will
fail if anyone does, including one that jumps and measures the
headroom.

Pulling it back exposed an older fault. Static NPC and guard
placeholders were 80 by 112 while the player's was 134, so Macario
stood a head taller than every character in the game. All four
placeholder call sites now use DISPLAY_HEIGHT. It had been true since
those lines were written and was invisible while the camera was
zoomed in far enough to show him alone.

The first pass found three faults, all fixed and all covered by
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

Rewrite Act I so that it teaches what the item bank tests.

Every system the study needs is now built, live and confirmed on a
real phone. The instrument is seeded and the pipeline records a pre
score, a post score and a gain. What is missing is the middle: the
Act I script is placeholder dialogue about buko and errands, and it
does not state a single one of the five learning objectives the ten
item pairs measure.

    LO1  Sakay's origins and social class
    LO2  Theatre experience and public speaking
    LO3  The Katipunan, when joined, and its aim
    LO4  Secrecy and communication in the movement
    LO5  Personal cost, and who the Katipunan was

Until the script carries these, a gain measures what a student
already knew and how they guessed the second time, not anything the
game did. That is the finding the whole study rests on, so this is
the critical path and everything else is smaller.

This is a writing task against the resource person's source
material, which is a physical book. It cannot be done from the
repository, and the proponents work through it with the session at
the time of the rewrite.

Checkpoint: a student who knew nothing at the pre-test can answer
each of the ten post-test items from something Act I actually showed
them.

After that: a device pass on the icon work, which has only been seen
in a headless browser, then Block 12's remaining polish, then the
pilot.

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

    db/macario_items_v3.sql             RUN, 28 Aug 2026

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
Framework complete and proven by a test stage in Act I. No story is
written yet, and that is now the whole of the remaining work on this
objective.

Objective 2, gameplay mechanics: dynamic difficulty, health,
equipment, cosmetic rewards. (IN PROGRESS) All four are built and
confirmed live. The only thing between this objective and (COMPLETE)
is outfit art, which is a drawing task rather than a code one.

Objective 3, integrated assessment. (COMPLETE) Pre-tests and
post-tests, server-side grading, in-game performance scoring,
optional feedback, and the teacher dashboard are all built.

## Functional requirements

The paper specifies seventeen. This is the scoreboard a panel will
work through.

| Requirement | Status |
|---|---|
| User Authentication | (CHANGED) Login and role routing built. Self-registration deliberately not built; accounts are administrator-created |
| Chapter Progression | (PARTIAL) All four registered and unlock in order. Act I holds a test stage; no act has story content yet |
| Player Movement | (BUILT) |
| Combat Mechanics | (BUILT) Melee, takedown from behind, thrown projectile as the special attack |
| Stealth Mechanics | (BUILT) Patrols, detection meter, hide spots |
| Interaction System | (BUILT) |
| Narrative Delivery | (PARTIAL) The delivery system is built and exercised by the test stage. No narrative is written yet |
| Dynamic Difficulty | (BUILT) Guard speed scaled by act, 1.00 to 1.45. Verified in the harness; no act beyond Act I has guards yet |
| Health System | (BUILT) Health, damage, invulnerability, respawn, hazards, heart pickups |
| Equipment System | (BUILT) Two items, weapon and accessory slots, an inventory screen on pause. Items are granted on act entry; the shop is Block 11 |
| Cosmetic Reward | (BUILT) Currency awarded per act and scaled by performance, a shop inside the inventory, two priced outfits. Confirmed live. Outfits render as the placeholder box until their sheets are drawn |
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
| Usability | (BUILT) Tagalog throughout. Every touch target measured on screen: movement 67px, action 53px, pause 45px, and every button on a screen including the four answers to a test item at 44px. Icons beside every label. The whole control row fits in landscape down to 740px. Portrait shows a rotate notice rather than a broken layout |
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

Block 11, currency and cosmetics. Currency in game_progress, awarded
as objectives land and topped up on completion so an act pays exactly
its rounded performance score. A shop panel off the inventory screen,
two outfits at 50 and 90, and a sprite swap that replaces whichever
sheets an outfit declares. No migration was needed. (COMPLETE)

Act I test stage. The old road and outpost content is deleted, in git
history, and not to be restored. content/act1.js now holds one room
with one example of every system, dialogue with two conversations, a
gift, a stage cutscene, a hidden NPC revealed by flag, a patrolling
guard, a hide spot, a one-way platform, a heart pickup, a hazard and a
decoration, plus a bare second room reached by scene transport. Five
objectives, so the currency drip is a round 10 each. Laid out and
tuned against the 1176 pixel camera. (COMPLETE)

Paper audit. Seventeen functional requirements, ten non-functional,
five modules, seventeen ERD entities and all four act storyboards
checked against the code. Its findings are the two scoreboards above.
(COMPLETE)

Revised Act I item bank. Ten matched pre and post pairs plus a trivia
fact that no longer leaks pre-test answers. Seeded and confirmed
serving ten questions per test. (COMPLETE)

## Blocks remaining

Block 12, polish. (IN PROGRESS)

Done, from the device passes: pointer-events on .action-cluster so
Atake and Talon work, --zoom at 0.7 for phone landscape with the
control sizes stated for that context so they render right on glass,
the placeholder height fix that stopped Macario standing a head above
everyone, and the rotate notice that makes portrait a prompt rather
than a layout. All are covered by checks in sections AA, AB and AC.

The device work is done and confirmed.

The balance pass is done, against the test stage rather than the
outpost, which no longer exists. The old numbers were set for a
camera showing 470 world pixels and read as a twitch in the corner at
1176. The room went from 2400 wide to 3600, about three screens, so
the guard, the hazard and the exit each arrive as their own problem.
The patrol went from 400 to 800, two thirds of a screen, so a route
reads as a route. The detection radius went from 240 to 300, about a
quarter of a screen and deliberately well under half, because there
is no line of sight test and a guard owning most of the screen would
be unfair rather than tense. alertRate went from 0.012 to 0.010, so
crossing the zone head on at the player's 300 px/s still loses and
the hide spot still matters. The hide spot moved inside the patrol,
because cover outside the route is scenery.

Those numbers get copied into the real acts, so they are written as
fractions of what is visible rather than as raw pixels.

Assets/Cement_Tile.png is done. It was 1640 by 656 and 1.37MB to draw
a tile the stylesheet renders at 30 by 30. It is now 120 by 120 and
21.7KB, a 98% cut, indistinguishable on screen and still four times
the resolution the CSS asks for. ASSET_VERSION went to 3, and game.js
with it, since the browser has to refetch game.js to learn the new
asset version.

The icon pass is done. An inline SVG symbol sheet in index.html and a
use reference per button, chosen over Unicode and emoji on a render:
the crossed swords fell back to a thin monochrome cross and the up
arrow drew as a blue emoji tile, so one row of buttons carried three
presentations. Icons sit WITH their labels, never instead of them.

It moved three things beyond the icons themselves. Every label write
now goes into a .lbl span, because textContent on a button destroys
its icon and two of the six write sites run every frame. The icon and
label are pointer-events: none so the button stays the hit target,
which the harness refused to click until it was. And the 44px rule was
extended from the control cluster to every button on a screen, which
is where it had never been applied.

The settings reset is done. It clears the text size and the two
ownership tables and nothing else, because those are the only tables a
student's browser may delete from. Seven checks assert that the
assessment scores, the act's performance score and objective count, the
save row, the session row, the feedback and the barya all survive it.
It is not a substitute for db/reset_test_accounts.sql and cannot
become one: a full-flow retest needs the scores cleared and no client
can clear them.

Left: audio if there is time, which is still the first thing to cut.

Left, and needing the phone rather than a decision: the action button
labels shrank from 18px to 15px CSS to fit an icon above them, which
is 12.6 to 10.5 on glass. Atake and Talon now lean on the icon to
carry the meaning. Read them on the device before the pilot; if they
are too small, the fix is to grow those buttons from 76px and re-run
the control row fit check, not to drop the icons.

One thing to watch on the next device session rather than change
blind: the dialogue text and quest log shrank with the camera. The
text size setting in the pause menu has sm, md and lg. Try lg before
raising any base sizes.

The same session should look at the panels. The taller buttons made
the inventory screen scroll a little more than it did. The shell box
has always scrolled and still does, so nothing is unreachable, but a
student who has to scroll to find Bumalik is worth knowing about.

Write the real Act I against the finished mechanics, replacing the
test stage, then write Acts II through IV. This is the next action;
see above. (NOT STARTED)

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

Assets/Cement_Tile.png was 1.4 MB for a repeating floor tile. Now 120
by 120 and 21.7 KB. (COMPLETE)

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

284 checks. Anything other than "0 failed" is a regression.

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

