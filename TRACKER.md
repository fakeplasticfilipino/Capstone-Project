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

Last updated: after Act I and the item catalogue were reset to a blank
slate. The icon pass and the settings reset from Block 12 are still not
yet confirmed on the device.

## Right now

content/act1.js and content/items.js were both just reset to a blank
slate: Act I is one scene, one NPC (Nanay) and one exchange, and the
item catalogue is empty. This was a deliberate rollback, not damage —
see Blocks done for why and what stayed covered. Read that entry before
assuming anything below about "Act I plays end to end with hazards,
pickups..." describes what ships today: it describes the ENGINE, which
is unchanged and still fully verified: the hazard, guard, pickup, stage
and shop mechanics themselves are exactly as built and tested, just not
currently wired into Act I's shipped content.

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

The automated suite passes at 289 checks, 0 failures.

The UI now reads as a game rather than a form. Every button carries an
inline SVG icon beside its Tagalog label, and the panels and the touch
controls have a bevel and a rim rather than a flat fill. All of it is
verified in the harness and NONE of it has been seen on the phone yet.

The settings screen offers a full reset: every row the student owns,
in all seven tables, so they start the game from the very beginning
with their account and password intact. It needs schema v5, WHICH HAS
NOT BEEN RUN. Until it is, the button never appears, because the
function that decides whether to show it does not exist yet and the
client treats that as no.

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

Act I is rewritten. content/act1.js now carries a real narrative,
two scenes ("tondo" then "misyon"), written directly against the ten
item pairs in db/macario_items_v3.sql:

    LO1  Sakay's origins and social class
    LO2  Theatre experience and public speaking
    LO3  The Katipunan, when joined, and its aim
    LO4  Secrecy and communication in the movement
    LO5  Personal cost, and who the Katipunan was

Every one of the ten items traces to a specific stated line: Tondo
and the tailor-and-barber trade from the neighbor, the moro-moro and
the stage-to-public-speaking connection from the theatre beat, 1894
and the Katipunan's aim from the recruiter, secrecy and the risk to
a messenger from the mission briefing and the courier NPC, and the
personal cost and the movement's ordinary-worker makeup from that
same NPC's second conversation. See CLAUDE.md, Decisions on record,
for the scene split and why the old hidden-NPC pattern was dropped.

Every fact in the new script is one the item bank's own correct
answers already commit to. No other date, name, or incident was
added. The resource person's source material, a physical book, has
not been read into this yet — if it says more or says something
different, that is the next pass on this file, not a green light to
leave it as written.

_dev/test.js is updated alongside it: the room ids, objective flags
and the two loadScene() calls in Block 8's fixtures now point at
"tondo" and "misyon" rather than the old "silid" and "labasan". The
suite is back to 289 passed, 0 failed, run twice to rule out
flakiness from the new content's positions.

## Next action

Get the resource person's source material in hand before writing any
more of Act I — that is the whole reason it was just reset to a
one-NPC skeleton rather than extended further. Alongside that: a
device pass on the icon work, which has only been seen in a headless
browser, then Block 12's remaining polish, then the pilot. Writing
Acts II through IV, against the source material this time, is the
content work after that; see Blocks remaining.

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

    db/macario_schema_v5.sql            NOT RUN. Adds the three
                                        functions behind the in-game
                                        full reset. No tables, no
                                        columns, no policy changes, so
                                        the ERD stays at eleven. Move
                                        it to db/applied/ once it has
                                        been run and date this line

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
Framework complete. Act I is currently a one-scene, one-NPC skeleton,
reset from a fuller draft that was written ahead of the resource
person's source material rather than against it; Acts II through IV
are still registered stubs with no content. Writing real content for
all four, against the source material this time, is what remains of
this objective.

Objective 2, gameplay mechanics: dynamic difficulty, health,
equipment, cosmetic rewards. (IN PROGRESS) All four are built, and
were confirmed live against a fuller Act I draft that has since been
reset to a blank slate; the mechanics themselves are unchanged and
stay fully covered by _dev/test.js's own fixture, independent of what
Act I currently ships. The only things between this objective and
(COMPLETE) are outfit art and real content to carry the mechanics
again, both drawing/writing tasks rather than code ones.

Objective 3, integrated assessment. (COMPLETE) Pre-tests and
post-tests, server-side grading, in-game performance scoring,
optional feedback, and the teacher dashboard are all built.

## Functional requirements

The paper specifies seventeen. This is the scoreboard a panel will
work through.

| Requirement | Status |
|---|---|
| User Authentication | (CHANGED) Login and role routing built. Self-registration deliberately not built; accounts are administrator-created |
| Chapter Progression | (PARTIAL) All four registered and unlock in order. Act I is a one-scene, one-NPC skeleton reset from a fuller draft written ahead of the source material; Acts II through IV are still content-free stubs |
| Player Movement | (BUILT) |
| Combat Mechanics | (BUILT) Melee, takedown from behind, thrown projectile as the special attack. No act currently ships a guard to use it against |
| Stealth Mechanics | (BUILT) Patrols, detection meter, hide spots. No act currently ships any of the three; verified in the harness against its own fixture, not shipped content |
| Interaction System | (BUILT) |
| Narrative Delivery | (PARTIAL) The delivery system is built. Act I uses it for one exchange; Acts II through IV have none yet |
| Dynamic Difficulty | (BUILT) Guard speed scaled by act, 1.00 to 1.45. Verified in the harness against its own fixture; no shipped act currently has guards |
| Health System | (BUILT) Health, damage, invulnerability, respawn, hazards, heart pickups |
| Equipment System | (BUILT) Weapon and accessory slots, an inventory screen on pause, granting and the shop mechanic. content/items.js currently ships zero items; mechanic verified against the harness's own fixture catalogue |
| Cosmetic Reward | (BUILT) Currency awarded per act and scaled by performance, a shop inside the inventory, cosmetic outfit slot and sheet-swap. content/items.js currently ships zero outfits; mechanic verified against the harness's own fixture catalogue |
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

Act I test stage, superseded by the real Act I below. The old road
and outpost content, and the test stage after it, are both deleted,
in git history, and not to be restored.

Act I rewrite. content/act1.js replaced wholesale with a narrative
written against the ten item pairs in db/macario_items_v3.sql: the
scene "tondo" (safe) for origins, trade, the moro-moro and the
recruitment, the scene "misyon" (dangerous) for the courier task and
the farewell. Same five objectives and the same 10-barya drip as the
test stage it replaces; the guard, hide spot, platform, pickup and
hazard all carried over into "misyon" with the same tuning against
the 1176 pixel camera. _dev/test.js updated to match. 289 passed, 0
failed, run twice. (COMPLETE)

Act I refinement pass. Placeholder sprites for the four NPCs, the
guard, the two decorations and the Tondo day/night skyline — flat
silhouette PNGs, Claude-drawn, ASSET_VERSION bumped to 4. Finding
worth recording: buildGuards() in game.js has no code path that ever
loads a static guard.img; that branch shows the placeholder box
unconditionally. The guard's sprite in content/act1.js is declared as
animation instead, which is the only way a guard renders as anything
but a box — an engine fact, not a content choice, and worth knowing
before anyone gives a future guard an img and wonders why nothing
changes. Also rebalanced two dialogue exchanges that had no Macario
line at all (the neighbor's revisit, the director's whole
conversation). 289 passed, 0 failed, run twice after both changes.
(COMPLETE)

Nanay's sprite. Assets/ was reorganised into Assets/Act 1 and
Assets/Prefab; the placeholder set from the pass above was removed on
purpose, and Assets/Act 1/Nanay.png — 1280x768, 5 columns by 3 rows,
14 frames, real commissioned art — was added. The tondo scene's
opening neighbor NPC is now Nanay (Macario's mother) carrying the
same two LO1 facts, since a mother stating her son's trade and their
place in Tondo fits at least as well and Assets/ only had the one
real sprite to place; see CLAUDE.md, Decisions on record. Two things
found along the way, both fixed at the time: Walk.png and
Cement_Tile.png — the player's own walk cycle and the ground tile,
neither Act-I-specific nor placeholder art — were missing from
Assets/ entirely after the reorganisation and were restored from an
earlier staged copy. CORRECTION, next session: that removal was
confirmed intentional, part of the same start-fresh reset that later
emptied content/act1.js and content/items.js. The restored copies are
still sitting in Assets/ on the device because this session has no
tool that can delete files there — only the student who owns the
machine can remove Assets/Walk.png and Assets/Cement_Tile.png if they
still want them gone. setupNpcAnimation's and the player animator's CSS
background-image was built with an unquoted url(${...}), which is
invalid the moment a path has a space in it, as "Assets/Act 1/" now
does — it failed silently, with the sprite sheet reporting a
successful load and the correct frame geometry while never actually
drawing. Both call sites in game.js now quote the url(). ASSET_VERSION
bumped to 5. 289 passed, 0 failed, run twice after all of the above.
(COMPLETE)

Act I and the item catalogue reset to a blank slate. Deliberate, at
the student's direction: the narrative-complete Act I and the two
granted items plus two purchasable outfits were both content written
ahead of the resource person's source material, not against it.
content/act1.js is now one scene ("tondo"), one NPC (Nanay, real
art), one exchange, one objective; content/items.js is now
`window.ITEMS = []`. Both carry a header explaining the reset and
pointing at git history for what used to be there.

The harness was rebuilt rather than shrunk. Blocks 8 through 12's
sections (F through AG, most of the suite) drove the engine's guard,
hazard, hideSpot, platform, pickup and shop/equip/effect mechanics
through what used to be real Act I content; deleting that content
would have deleted their only test fixture along with it. Instead,
_dev/test.js now carries its own private fixture (FIXTURE_ACT1_JS,
FIXTURE_ITEMS_JS, defined near the top of the file) reproducing that
same gameplay skeleton and item catalogue, routed in through
enterTestRoom()'s fixtureRoutes() helper — a page.route interception
of content/act1.js and content/items.js that applies ONLY inside the
harness. Production content and the test fixture are now decoupled on
purpose: neither constrains the other, and the engine mechanics stay
under full regression coverage regardless of what Act I's real
content looks like at any given moment. One new fixture asset,
_dev/fixtures/test-outfit-walk.png, exists so the outfit-swap test
(Y) has a real, always-loadable sprite sheet to swap in without
depending on Assets/Walk.png, whose presence in Assets/ is no longer
guaranteed (see the correction on the entry above). See CLAUDE.md,
Decisions on record and Pitfalls, for the one trap this uncovered: a
seed with objective flags already true, loaded against the REAL
(non-fixture) content, now auto-completes Act I on entry, because the
real act has only one objective and it is already satisfied — every
call site that seeds those flags now routes through fixtureRoutes().
content/act1.js and content/items.js bumped to v11 and v3. Verified
by hand end to end (fresh student through Nanay's three-line exchange
to the flag setting and the act completing into the post-test) as
well as by the harness. 289 passed, 0 failed, run twice. (COMPLETE)

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

The settings reset is written but NOT LIVE. It is a full wipe: all
seven student-owned tables, so a pilot tester starts the game from the
beginning with their account and password intact and can sit both
tests again. That is impossible from a browser by design, since
assessment_scores has no delete policy and must not get one, so it
runs through reset_my_play_data() in db/macario_schema_v5.sql.

RUN THAT MIGRATION BEFORE EXPECTING THE BUTTON TO APPEAR. Until it
exists, can_reset_my_data() errors, shell.js treats that as no, and
the offer is simply never drawn. That is the intended failure.

Only named accounts may wipe. is_reset_allowed() currently lists
hi@example.com and guro@example.com, matching what
db/reset_test_accounts.sql already names. A study account is not on
the list and must never be added: their one attempt is the data. The
check is server side, so a study account cannot wipe itself by
tapping, by editing the page, or from the console. Checks cover the
refusal as well as the wipe.

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

Act I is rewritten against the finished mechanics; see Blocks done.
Write Acts II through IV next. (NOT STARTED)

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

Chase the replacement art. Assets/ holds one real commissioned sprite
today: Nanay, Macario's mother, the only NPC content/act1.js declares.
Walk.png and Cement_Tile.png are technically present in Assets/, but
their removal was confirmed intentional (see Blocks done); nobody has
a tool that can delete them from here, so whether they stay or go is
the student's call to make on the machine itself, not a content gap
to chase. Everything the fuller Act I draft used to need art for — a
director, a recruiter, a courier contact, a guard, decorations, the
Tondo day/night skyline — is not currently declared as content at
all, so there is nothing there to draw against yet; that list comes
back once real content does. The player's own Idle and Dead poses and
everything in Acts II through IV are untouched and still fall back to
the labelled placeholder box, which remains the fallback system
working, not a fault.

Block 11's two outfits, Skin_Walk.png and Skin_Uniporme_Walk.png,
are moot for now: content/items.js was reset to an empty catalogue in
the same pass that reset Act I (see Blocks done), so there is
currently no cosmetic item in the shipped game to draw art for. The
shop, equip and cosmetic-sheet-swap mechanics they used to exercise
are unchanged and still fully tested against _dev/test.js's own
fixture catalogue; only the shipped content is gone. Whoever writes
real items back in can reuse these filenames or choose new ones — it
is one line of content per item either way. (NOT STARTED)

Provision student accounts for the session, and pilot with two or
three students who are not part of the study. A pilot run on a study
account consumes that student's one attempt permanently, so the two
sets must be separate.

When those pilot accounts exist, add their addresses to
is_reset_allowed() in the database and re-run that one statement. It
is a create or replace, so no migration is needed and nothing else in
schema v5 has to run again; record it here. That is what lets a pilot
tester wipe themselves and run the whole flow a second time without a
trip to the SQL editor. Do not add a study account. (NOT STARTED)

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

289 checks. Anything other than "0 failed" is a regression.

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

