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

Last updated: after Block 27, two commissioned sheets wired in. A tap
on Atake plays Macario's new punch (Assets/Prefab/Macario_Melee.jpg, 4 by
3, 12 frames), and the aim pose now waits 150ms before showing so a tap
never flashes the aiming arm first. Kutsero is drawn from his own idle
sheet (Assets/Act 1/Kutsero.png, 5 by 3, 14 frames) instead of the
placeholder box. The melee file is a PNG named .jpg; it works as is.
ASSET_VERSION 9, game.js v35, content/act1.js v19. Suite 417 passed, 0
failed; _dev/verify_new_scene.js 36 passed, 0 failed. NOT RUN ON A PHONE.

Earlier, Block 26: the backdrop seam. The dark tree-shadow posts were
replaced by mirroring every second copy of Tondo.png, so the painting
continues across each join. game.js v34, style.css v22.

Earlier, Block 25: the item and inventory overhaul. Permanent items in
Sandata, Anting-anting and Damit; stacking consumables used with
Gamitin; quest items sold only while their quest is open, with the
horse's apple split out as "Mansanas para sa kabayo"; two-column shop
and inventory screens with select-then-act; guests can buy and use
items; Tindahan and Imbentaryo doors removed from inventory and pause.
db/reset_test_accounts.sql should be run once after pulling it.

Earlier, Block 24: the body model. Every character's art now stands
on its logical body (mountBody, bodySprite, a per-sheet footX), hazards
hurt on overlap, and a pixel-reading suite section (AM) proves the
drawing and the hitbox agree. Fixed a hazard that hurt only when
Macario was drawn past it. game.js v32, style.css v20, act1.js v17.

Earlier, Block 23: a correction to Block 22's throw spawn point that
read the sprite element's offsetWidth. Superseded by Block 24, which
found the real cause.

Earlier, Block 22: three fixes reported directly by the proponent
playing the game — the same interaction-hitbox asymmetry (fixed with
edgeGap, a real edge-to-edge gap rather than a raw anchor distance),
the projectile draw-order bug Block 23 above went on to correct more
fully, and Mansanas reclassified from kind: "equipment" (buyable,
wearable) to kind: "consumable" (no slot; its +1 max health applies
from ownership alone and ends the moment Inventory.consume() is
called, which Kabayo's gift.onComplete now does). game.js's script
version to v30, style.css's to v19, inventory.js's to v6, shell.js's
to v10, content/items.js's to v5, content/act1.js's to v16.

Earlier, Block 21: a same-session correction to Block 20. Block 20
finished the kutsero scene Block 19 left half-built — the world grew
to 2150px, Kutsero and Tindero carry Kabayo's quest to a real ending,
a hazard sits on the road, and Tindahan's first item, Mansanas, sells
for 5 barya — but Block 20 also had giving Kabayo the apple finish
Act I outright, since that flag was the act's third and last
objective. On direct feedback: the kutsero scene is a flashback and
finishing it must not finish the act around it. Block 21 fixed that
with a fourth objective, pumunta_entablado, whose flag nothing in
content sets, added as an open quest the moment Kabayo's gift lands.
content/act1.js's script version went to v15.

Earlier, Block 18: the real Tondo.png backdrop (1983x793) tiled across
Act I's world with a new seam-masking shadow effect
(buildSkylineShadows(), game.js), plus a stacking fix, #player { z-index:
1 }, so Macario now renders in front of Nanay and every other NPC/guard/
decoration instead of behind them. See Blocks done and CLAUDE.md,
Decisions on record, for the full mechanism. ASSET_VERSION to 8, game.js's
script version to v27. Verified by a new suite section (5 checks) plus
headless screenshots of the tiled backdrop with a shadow band in frame and
a direct elementFromPoint check confirming Macario paints above
Nanay — NOT YET SEEN ON THE PHONE ITSELF. 346 passed, 0 failed.

Earlier the same broader run of sessions: Block 17, a third real
commissioned sprite (Assets/Prefab/Macario_Shooting.png, 25 frames) wired
in as Macario's first-ever ranged-attack animation. The engine gained two
new optional per-sheet fields, startFrame and endFrame, so one 25-frame
image can be declared as two named poses (shootAim, frames 0-12, held
while the attack button is down; shootFire, frames 13-15, a muzzle flash
played once at the instant the throw fires) rather than needing two
files. ASSET_VERSION to 7, game.js's script version to v26. Verified by a
suite section (14 checks) plus two headless screenshots of the aim pose
and the fire pose.

Earlier still, the same broader run of sessions: Block 16, a full UI retheme
replacing Block 15's Katipunan flag chrome (gold, navy, red) with a
natural wood-and-green palette (browns, greens, cream; no red or gold
anywhere), done in pure CSS with no new image assets, per an explicit
request for a natural rather than modern-flat look. Gameplay and status
colors were left untouched, same boundary Block 15 drew; two spots that
used to read the retired gold variable directly (the guard meter fill,
the thrown spear) are now the literal #f4c542 instead. style.css's
script version went to v17. See Blocks done and CLAUDE.md, Decisions on
record, for the color mapping.

Earlier the same broader work: the student added two real commissioned
sprites for Macario, his own base walk and idle cycles
(Assets/Prefab/Macario_Walking.png, 20 frames; Macario_Idle.png, 16
frames, both 5 by 4 grids), wired into BASE_SPRITE_SHEETS in place of
placeholder paths that never existed on this device (ASSET_VERSION 6,
game.js v25). Getting the real art on screen exposed a scaling bug —
every sheet was grounded by its fixed FRAME size rather than by how
much of that frame the art actually filled, so Macario's idle, his own
walk cycle and Nanay's sprite were three different heights and all
floated above the ground. Fixed without touching any image: game.js
gained spriteFit plus two optional per-sheet fields, contentTop and
contentHeight, measured from each sheet's own alpha channel (see
CLAUDE.md, Sprite sheets, for the format). That measuring is now a
permanent tool, _dev/measure-sprite.js (zero dependencies — PNG chunk
parsing plus node:zlib), rather than the one-off script it started as.
See Known problems, missing production art, for what is still
outstanding (Dead.png, Cement_Tile.png, Tondo.png, Tondo_Night.png).

## Right now

content/act1.js was reset to a one-scene, one-NPC (Nanay) blank slate
some sessions ago, a deliberate rollback rather than damage — see
Blocks done for why and what stayed covered. Block 19 built forward
from that base for the first time since, and Block 20 carried it to
where the flashback resolves: Act I is now two scenes (tondo,
kutsero), three quests done inside the flashback plus a fourth, still
open, waiting on the entablado (Block 21), and one item (Mansanas,
now a consumable rather than equipment — Block 22, which otherwise
touched only engine mechanics, not content: an interaction-distance
hitbox bug and a projectile draw-order bug, both reported directly by
the proponent playing on the device this ships to, the second of
which needed a same-session correction of its own in Block 23 once
the first fix still visibly failed). Read Blocks done, Blocks 19-23,
before assuming anything below about "Act I plays end
to end with hazards, pickups..." describes only the ENGINE rather than
the shipped content: it now does describe the content too, for
hazards and shop purchases specifically — Act I's kutsero scene has
both. It still has no guard, and content/items.js still holds only the
one item. What Act I does not have yet is anywhere the entablado, or
its own fourth objective, is actually
depicted — the game currently returns Macario to an ordinary tondo
with an errand he cannot yet complete, on purpose (Block 21), until
that content exists.

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

The automated suite has grown to 417 checks, after Block 27 extended
section AI for the melee clip on top of Block 26's 412 (see Blocks
done). It is fully green: 417 passed, 0 failed, as of Block 27. The one check
that used to fail for real here — unequipping a cosmetic outfit restores
the base walk cycle — still passes, because the base walk sheet it
asserts against is a real file. See Known problems, missing production
art, and Verification.

Block 13 is done: #btn-inventory and #btn-shop now sit next to
#btn-pause in the main UI, so either screen is one tap from gameplay
instead of requiring pause first. Both keep working the old way too
(through the pause menu). See Blocks done for the detail and CLAUDE.md,
Decisions on record, for how shell.js tells the two entry paths apart.

Block 14 (play-as-guest), Block 15 (the Katipunan flag UI retheme) and
Block 16 (replacing that palette with a natural wood-and-green one) are
all done; see Blocks done for detail and CLAUDE.md, Decisions on
record, for the mechanism behind each. All three are verified in the
harness only — NONE HAS BEEN SEEN ON THE PHONE YET, same as the icon
pass below.

A report of "I can't see Nanay anywhere" was investigated this session
and is NOT a code fault: driving the actual shipped files headlessly
shows Nanay's sprite and dialogue working correctly. The live GitHub
main branch was already serving the reset content and the CSS fix at
the time of checking, but index.html's own script version numbers
(?v=N) on that branch were STALE relative to the files they point at —
exactly the caching failure this project has warned about since Block
7. See Known problems below and CLAUDE.md, Pitfalls, for the detail and
what to check before assuming the code regressed. This session's own
copies of index.html, game.js, shell.js, style.css and _dev/test.js
carry correctly bumped numbers (game.js v23, shell.js v8, style.css
v16, content/act1.js v11, content/items.js v3); whatever pushes them
to GitHub next should push all of them together, not file by file.

A SECOND, separate "can't see Nanay" / "no questions at all" report
came in later in that same chat, from a test account, and was NOT the
same caching issue as the paragraph above: that account had already
completed Act 1 under older content, so on login the game tried to
resume into empty Act 2 rather than show Act 1 at all — which also
explains "no questions", since Acts II through IV have no seeded
trivia or assessment content. The in-game "start over" button could
not fix this itself, because it needs schema v5, which per the Run log
has never been run. The student ended the conversation saying the
account was fixed ("everything worked") without this session
confirming how — whether v5 was actually run, the stale rows were
edited by hand in the Supabase dashboard, or something else. Do not
assume from that line that v5 is now applied; check the Run log entry
and the live Supabase project directly. Real, unrelated 404s surfaced
during that same investigation, for root-level Assets/ files that
turned out not to exist on this device at all — see Known problems,
missing production art, which folds that finding in rather than
repeating it here.

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

## Next action

Block 20 finished the apple quest Block 19 left open, at the same
proponents'-own-direction authority (Content authority, below): a
scene-setting errand, not a new historical claim. Block 21, the same
session, fixed the open thread Block 20 surfaced rather than closed:
the fourth objective, pumunta_entablado, now exists and correctly
keeps Act I from finishing when the flashback resolves — but nothing
built yet depicts reaching the entablado itself, so the act currently
ends its playable content with an open quest nothing can complete. That
is the next beat: a scene (or a repurposing of tondo) where arriving
at the entablado sets nasaEntablado and Act I finishes for real. See
Blocks done, Blocks 20-21, and CLAUDE.md, Decisions on record, for the
full reasoning.

Separately, still outstanding: a device pass on the icon work, on
play-as-guest, the new UI theme, and now Blocks 19 through 25 (for
Block 24: walk onto the kutsero hazard from both sides and confirm the
heart goes only while his feet are on the glass, and that Nanay and
the placeholder NPCs still look placed where intended; for Block 25:
open Tindahan and Imbentaryo on the phone and confirm both panels fit
the screen sideways with Bumalik visible, that tiles are easy to tap,
and that eating a Mansanas after the glass restores the heart; for
Block 26: walk the kutsero scene end to end and confirm there is no dark
post and no visible jump where the backdrop repeats; for Block 27: tap
Atake facing both ways and confirm the punch plays without a flash of
the aiming pose, that holding still throws, and that Kutsero stands on
the road at his own spot), none of
which have been seen on a phone yet, only in a headless browser, then
Block 12's remaining polish, then the pilot. Writing Acts II through
IV, against the source material this time, is the content work after
that; see Blocks remaining.

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

    db/macario_schema_v5.sql            NOT RUN, per this file's own
                                        bookkeeping (not present in
                                        db/applied/ on this device). A
                                        prior chat ended with a reset-
                                        related problem reported fixed
                                        ("everything worked") without
                                        confirming here whether v5 was
                                        actually the fix; a session
                                        with no database tool cannot
                                        verify the live project either
                                        way. Check the Supabase SQL
                                        editor directly for whether
                                        can_reset_my_data() exists
                                        before trusting this line. Adds
                                        the three functions behind the
                                        in-game full reset. No tables,
                                        no columns, no policy changes,
                                        so the ERD stays at eleven. Move
                                        it to db/applied/ once confirmed
                                        run and date this line

    db/macario_items_v3.sql             RUN, 28 Aug 2026

    db/db_healthcheck.sql               read-only, run any time
    db/reset_test_accounts.sql          run before any full-flow test.
                                        Rewritten in Block 25 (same seven
                                        tables, no schema change). RUN IT
                                        ONCE after pulling Block 25: the
                                        id "mansanas" changed meaning, so
                                        an old test save resumes owning
                                        the wrong apple
    db/enrollment_setup.sql             only needed for a fresh database

Supabase project reference: rkfnovfkroajottpmxxq

The database holds eleven tables, matching the revised ERD. Confirm
with db/db_healthcheck.sql, which checks all eleven, confirms the two
v4 drops happened, and verifies every migration column.

## The three stated objectives

What the panel assesses against.

Objective 1, a 2D narrative RPG across four acts. (IN PROGRESS)
Framework complete. Act I is now two scenes, four quests (one still
open) and one shop item (Blocks 19-21), up from the one-scene, one-NPC
skeleton it was reset to after a fuller draft was written ahead of the
resource person's source material rather than against it. The
flashback plays start to finish and correctly does not finish the
act on its own; what remains is the content Act I's fourth objective
is waiting on — depicting Macario actually reaching the entablado —
plus Acts II through IV, still registered stubs with no content.
Writing real content for all of it, against the source material for
anything the assessment tests, is what remains of this objective.

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

Macario's own base sprites. Assets/Prefab/Macario_Walking.png (1280x1024,
5 columns by 4 rows, 20 frames) and Assets/Prefab/Macario_Idle.png (same
1280x1024, 5 by 4 grid, but only 16 of the 20 cells are real frames) were
added by the student, real commissioned art rather than the earlier
Claude-drawn placeholders. game.js's BASE_SPRITE_SHEETS now reads
Assets/Prefab/Macario_Walking.png and Assets/Prefab/Macario_Idle.png in
place of Assets/Walk.png and Assets/Idle.png, which the code had named for
several blocks but which never actually existed on this device (see Known
problems, missing production art); fps was left unchanged (idle 6, walk
12) since nobody has judged it against a phone yet. ASSET_VERSION bumped
to 6, game.js's own script version to v24. The one test that hardcoded the
old, nonexistent path and had been failing for real because of it —
"unequipping restores the base walk cycle" — now passes, along with the
two other Section Y assertions that hardcoded the old idle/walk paths and
needed updating to match. Dead.png is still missing and still falls back
to the placeholder box.

Seeing the real art on screen surfaced a second fault in the same
session: Macario's idle pose rendered smaller than his own walk cycle,
neither matched Nanay's height, and all three floated above the ground
by different amounts, because every sheet was scaled and grounded by
its 256px FRAME rather than by how much of that frame the art actually
fills, which varies sheet to sheet. Fixed without touching any image:
game.js gained spriteFit and two new optional per-sheet fields,
contentTop and contentHeight, measured from each sheet's own alpha
channel (union of every frame's non-transparent bounding box) — Nanay
45/166, Macario's idle 73/106, his walk 60/127, out of every 256px
frame. See CLAUDE.md, Sprite sheets and Decisions on record. game.js
bumped to v25 and content/act1.js (Nanay's animation def now carries
the two fields) to v12.

327 passed, 0 failed, run twice, from a disposable sandbox with the
repository staged into it (this session had no shell on the device
itself). Confirmed two ways beyond the suite: a headless screenshot of
a guest session idling and walking next to Nanay, and reading the
player's and Nanay's own getBoundingClientRect() in that same run, which
report an identical top, bottom and height for both — not just similar
in a screenshot, but the same box. (COMPLETE)

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
CORRECTION, found scanning this file: index.html actually references
content/act1.js?v=12 right now, not v11 as recorded above. Content
still matches this entry's blank-slate description (one scene, one
NPC, one exchange), so nothing regressed, but some later edit bumped
the number past what got written down here and no session recorded
why. Trust the live file's own query string over this line.

Block 13, direct-entry shop and inventory. Two new buttons in the main
UI, #btn-inventory and #btn-shop, next to #btn-pause, styled the same
way and gated the same way (window.Inventory, and visible only while
actually playing, exactly like #btn-pause already was). Either one
pauses the game itself and jumps straight to its panel; the shop
button skips inventory entirely when reached this way. The original
pause-menu doors into both panels are unchanged and still work exactly
as before. shell.js tracks which door was used (invReturn, shopReturn)
so "back" resumes the world directly when the door was the main UI, or
returns to pause/inventory when it was the older path. index.html,
game.js, shell.js and style.css all bumped (v22, v7, v15 respectively);
_dev/test.js gained a new section (T2) plus extensions to the existing
icon-audit and touch-target sections covering the two new buttons. 310
passed, 0 failed, run twice. Verified by hand in a headless browser
against the real shipped content as well. (COMPLETE)

Block 14, play-as-guest. A second title-screen button, #shell-guest,
drops straight into Act I with no login box, no account, and nothing
written to Supabase; closing the tab loses everything, on purpose. Free
of charge, essentially, because every write-path function in acts.js
and game.js already refused to run without a currentUserId, and a guest
simply never gets one. game.js and shell.js bumped (v23, v8);
_dev/test.js gained a new section (AH, 17 checks) proving the button
enters the world without a login box, that no row appears in any table
across a played session, and that a reload lands back on a fresh title
screen. See CLAUDE.md, Decisions on record, for the mechanism. 327
passed, 0 failed against a session-local copy of Assets/ — see Known
problems, missing production art, for the true count on this device
(326 passed, 1 failed, unrelated to this block). (COMPLETE)

Block 15, UI retheme. The gold-on-black chrome replaced with a
Katipunan flag palette (deep red, navy, cream, gold used sparingly for
accents), requested because the old scheme did not fit the game.
Gameplay and status colors (health, hazards, the guard meter, platforms,
hide-spots, danger/success signals) were deliberately left untouched;
only panels, buttons, borders and generic text changed, via a small set
of new CSS custom properties in :root rather than one-off literals.
style.css bumped (v16); no new test coverage needed since only color
values changed and the existing suite already exercises every screen
touched. Verified by hand against screenshots of the title screen,
settings, pause, and inventory panels. 327 passed, 0 failed, re-run
after the retheme — but that run used a session-local stand-in copy of
Assets/, not this device's real one; see Known problems, missing
production art, for the true count (326 passed, 1 failed, for a reason
unrelated to this block). See CLAUDE.md, Decisions on record, for the
one color (#7bc47f) that needed a context-dependent split rather than a
global swap. (COMPLETE)

Paper audit. Seventeen functional requirements, ten non-functional,
five modules, seventeen ERD entities and all four act storyboards
checked against the code. Its findings are the two scoreboards above.
(COMPLETE)

Revised Act I item bank. Ten matched pre and post pairs plus a trivia
fact that no longer leaks pre-test answers. Seeded and confirmed
serving ten questions per test. (COMPLETE)

Block 16, second UI retheme. Block 15's Katipunan flag palette (gold,
navy, red) replaced with a natural wood-and-green one (browns, greens,
cream), requested because the flag chrome still read as flat and
modern rather than natural. Pure CSS, no new image assets, per the
request. Chrome only — panels, buttons, borders, generic text — same
boundary Block 15 drew; gameplay and status colors (hearts, hazards,
the guard meter, platforms, hide-spots, danger/success signals) stayed
exactly as they were, and the two spots that used to read the retired
gold variable directly (the guard meter fill, the thrown spear) are now
a literal #f4c542 so they could not be recolored by retiring it. New
:root custom properties (--c-wood, --c-wood-deep, --c-wood-light,
--c-green, --c-green-deep, plus -rgb triplets) replace the retired
--c-navy*/--c-red*/--c-gold* set; --c-border-muted was redefined from
navy-blue to a warm brown in place, so every rule already referencing
it updated for free. style.css bumped to v17; no new test coverage
needed, since only color values changed and the existing suite already
exercises every screen touched. 327 passed, 0 failed, re-run after the
retheme. Verified by hand against headless screenshots of the title
screen, the game world and HUD, the pause menu, the settings panel and
the inventory panel. See CLAUDE.md, Decisions on record, for the full
color-to-color mapping and for which pre-existing green status literals
were deliberately left alone rather than rewired to the new chrome
green. (COMPLETE)

Block 17, the shooting animation. A third real commissioned sprite,
Assets/Prefab/Macario_Shooting.png (500x500, 5 by 5, 25 frames), wired
in as Macario's ranged-attack pose — there was no dedicated animation
for that action before this; holding attack to throw (Ibato) left
whatever pose the player was already in unchanged while the projectile
spawned. Measured the same way as the other two sprites (_dev/
measure-sprite.js: contentTop 23, contentHeight 51). This sheet is one
continuous clip covering an aim/draw-up sequence and a muzzle flash
around frame 15, with several unused frames after it, so it needed
something the walk/idle sprites did not: playing only PART of a sheet,
and different parts at different times. The engine gained two more
optional per-sheet fields, startFrame and endFrame (default 0 and
frames - 1, so idle/walk/dead are unaffected), which let the one image
be declared twice under two names: shootAim (frames 0-12, held on 12
for as long as the button stays down) and shootFire (frames 13-15, the
muzzle flash, played once at the exact instant the throw fires — not
before it and not after). A new shooting state variable suppresses the
main loop's own idle/walk switch while either is playing, the same way
cutscenePlaying already does for the death sequence; a plain timer
sized to the fire clip's own frame count and fps hands the pose back
afterwards, the same approach flashAttack already uses for the melee
flash. A guard catch, a hazard knockback, or the stage cutscene
starting while attack happens to be held could otherwise leave the aim
pose stuck for the rest of a scene visit; respawnInScene and
startPerformance now both clear it defensively. ASSET_VERSION to 7,
game.js's script version to v26. New coverage in _dev/test.js, section
AI (14 checks): both named sheets load and declare the right ranges;
pressing attack switches the pose immediately; a long hold settles on
and holds frame 12 rather than looping past it; a quick release cancels
the pose into a melee swing with nothing thrown; a qualifying hold
plays the fire clip from its own frame 13 with the projectile appearing
in the same step; the pose is handed back on its own once the fire clip
finishes; and a mid-hold respawn clears a stuck pose. 341 passed, 0
failed, run twice. Verified further by two headless screenshots, the
aim pose and the fire-with-projectile frame, confirming the timing
looks right and not just that the checks pass. See CLAUDE.md, Sprite
sheets and Decisions on record, for the full mechanism. (COMPLETE)

Block 18, the Tondo backdrop and a stacking fix. Assets/Act 1/Tondo.png
(1983x793) is real now, replacing the placeholder path the CSS and
game.js pointed at; Assets/Act 1/Tondo_Night.png was renamed to match
proactively even though that file is still missing (see Known
problems). It repeats across the world via CSS (background-repeat:
repeat-x), and because it is a painted scene rather than a seamless
texture, a new buildSkylineShadows() (game.js, called from loadScene)
places a soft, tapered .tree-shadow div — two blended CSS gradients, no
image — at each x where the background actually repeats, computed from
the art's real aspect ratio and the element's rendered height at scene
load rather than a guessed pixel width, so the seam reads as a tree's
cast shadow instead of an obvious repeat. Separately, Macario was
rendering behind Nanay (and would render behind any NPC, guard or
decoration): #player is static and DOM-early in index.html while every
NPC/guard/decoration is appended later, in loadScene, and CSS breaks a
z-index tie between them by DOM order. Fixed with #player { z-index: 1
}; checked first that inHideSpot() has no visual effect of its own, so
nothing relies on the old ordering. ASSET_VERSION to 8, game.js's
script version to v27. New coverage in _dev/test.js, section AJ (5
checks): #player's z-index is positive; the skyline loads the real file
without falling back to the placeholder; at least one shadow band is
placed with an explicit position and size; unloadScene removes them.
346 passed, 0 failed. Verified further by headless screenshots of the
tiled backdrop with a shadow band in frame, plus a direct
elementFromPoint check confirming the browser paints Macario, not
Nanay, at their overlap. See CLAUDE.md, Decisions on record, for the
full mechanism. (COMPLETE)

Block 19, Act I's second scene and third quest. content/act1.js's
tondo dialogue was rewritten: Nanay asks where Macario is going and
sends him to deliver something to the kutsero, a man he worked for as
a boy; Macario is cut off mid-sentence ("Nay, mahuhuli na po a-") as
the scene fades. Both starting quests, "Kausapin si Nanay" and
"Pumunta sa trabaho", complete together in that onComplete, since in
the story the errand starts the instant the conversation ends. The
fade lands on a new scene, "kutsero", the same Tondo backdrop reused
rather than redrawn: a new optional scene field, greyFilter, toggles
a CSS grayscale filter on #skyline (game.js, loadScene; style.css). It
holds one NPC, Kabayo the horse — img: Assets/Horse.png, no art yet,
falls back to the placeholder naming the file, same as every other
missing image in this project. Talking to him ("Neighh" / "Gutom ka
na ba? Saglit lang ha, bili muna akong mansanas") adds a third quest,
"Bilhan ng mansanas ang kabayo", via addQuest from his own onComplete
rather than being in startingQuests, since a quest for a fact the
player has not discovered yet would be a spoiler. Its objective,
bilhan_mansanas, has no flag set anywhere in this pass — the apple
purchase itself is not built yet — which is what correctly stops Act
I at 2 of 3 objectives done rather than finishing early.

Acts.gotoScene (acts.js) now fades to black around every scene change
rather than swapping instantly: a new fadeToScene (game.js) reuses
the same #blackout element and hold/fade timings the stage cutscene
already used, and sets cutscenePlaying for the duration so movement,
jumping, attacking and interacting are suppressed the same way they
already are mid-cutscene. This is gotoScene's first real caller, so
nothing existing depended on the instant-swap behavior it replaces.
game.js's script version to v28, acts.js's to v9, style.css's to v18,
content/act1.js's to v13; no new Assets/ file, so ASSET_VERSION stays
at 8. See CLAUDE.md, Act data format and Decisions on record, for the
full mechanism and for why this is a content decision the proponents
are authorized to make without the resource person's source material
in hand (Content authority, above): it is a scene-setting errand, not
a new historical claim.

Verified two ways. First, the full existing suite, unchanged, against
this device's real files: 346 passed, 0 failed. Second, a new one-off
headless script (_dev/verify_new_scene.js, not part of the shipped
suite) drives the REAL content/act1.js — no fixture routing — through
the actual login flow: both starting quests present and the apple
quest absent at scene start; each dialogue line checked verbatim
against the script; the blackout and cutscenePlaying confirmed up
mid-fade; the landed scene id, the grey-filter class, both flags and
both quests confirmed done after the fade and before Kabayo is met;
Kabayo's two lines checked verbatim and the apple quest confirmed
added only after that conversation; the placeholder box confirmed to
name Assets/Horse.png; and Acts.objectivesFor(1).length === 3,
Acts.countDone(1) === 2, Acts.status === "playing" confirmed together,
proving the act does not auto-complete. 24 passed, 0 failed. Not run
on a phone. (COMPLETE)

Block 20, the kutsero scene finished — and, with it, Act I. The world
grew from 1176px to 2150px; Kabayo's dialogue now leads somewhere
(the quest it already added gets an actual ending), Kutsero (x:750)
pays 10 barya through a conversation and points at Tindero (x:1950,
opensShop: true), who skips dialogue entirely and opens Tindahan
directly at the map's far edge. Tindahan's first real item, Mansanas
(content/items.js), sells for 5 barya, is worth +1 max health as an
accessory, and — via a new item field, buyFlag — sets the flag
Kabayo's gift button (requiresFlag) needs, since the gift system can
only ever read state.flags, never Inventory.owns() directly. A hazard
sits on the road between Kutsero and Tindero, the scene's first.

Three engine additions made this possible, all general rather than
one-off: opensShop (an NPC field) and Game.onShopRequest (the facade
call shell.js registers a listener with, the same shape
Inventory.onChange already uses in the other direction) let an NPC
open the shop screen directly without game.js ever calling into
shell.js; gift.onComplete (a gift field) lets a gift end a scene, the
same way a dialogueSet's own onComplete already can; buyFlag (an item
field) is described above. See CLAUDE.md, Act data format and Item
data format, for the exact shapes, and Decisions on record for the
full reasoning behind each.

Giving Kabayo the apple — the gift, requiresFlag: binilhAngMansanas —
sets bilhanNgMansanasAngKabayo, Act I's third and last objective, and
its onComplete ends the memory, Acts.gotoScene("tondo"). Because that
was the act's last open objective, checkObjectives sees all three
done the instant the flag lands and runs finishAct exactly as it
would for any other act's ending — the post-test, then the transition
screen — right there, in the greyed-out kutsero scene. THIS WAS NOT AN
EXPLICIT REQUEST, and it was not decided quietly: it is the direct,
inevitable consequence of Block 19 having already set Act I's
objectives array at exactly three entries, of this pass supplying the
third's only flag-setter, and of nothing asking for a fourth. If Act I
is meant to continue past this point — toward the entablado Nanay
actually sent Macario to, which nothing built so far depicts — a
fourth objective needs to exist before more content can be added to
Act I without it finishing early again. That decision belongs to the
proponents, on the same content authority the rest of this pass used;
it was surfaced rather than made here.

Also fixed: Nanay's onComplete used to call Acts.gotoScene("kutsero")
unconditionally, harmless while nothing ever returned to tondo. Now
that Kabayo's gift does, a second approach to Nanay would have
replayed her objective-completing dialogueSet and re-triggered the
scene change — a loop, unrecoverable in guest mode specifically, since
Acts.checkObjectives never runs without currentUserId. A firstTime
guard fixes it: the scene change only fires on the first approach: she
just repeats herself after, like any other NPC with nothing new to
say.

game.js's script version to v29, shell.js's to v9, inventory.js's to
v5, content/act1.js's to v14, content/items.js's to v4; no new
Assets/ file (Kutsero.png, Tindero.png, Mansanas.png referenced but
not present, same placeholder fallback as Kabayo), so ASSET_VERSION
stays at 8.

Verified two ways. First, the full existing suite, extended with a
new section covering opensShop/Game.onShopRequest, gift.onComplete
and buyFlag against the fixture content: 354 passed, 0 failed. Second,
_dev/verify_new_scene.js (Block 19's one-off, extended) drives the
REAL content/act1.js through the whole new flow: Kabayo's quest,
Kutsero's two lines verified verbatim, the 10-barya payment and its
absence on a repeat visit, the hazard costing a heart, Tindero opening
Tindahan with no dialogue box, Mansanas listed and bought (ownership,
buyFlag, currency spent), the gift button appearing back at Kabayo,
the fade to tondo with all three objectives done, and — the flagged
consequence above, confirmed rather than assumed — Acts.status
reaching "completed" and the transition screen actually appearing once
the post-test's feedback survey is answered. 24 passed, 0 failed. Not
run on a phone. (COMPLETE)

Block 21, a same-session correction to Block 20: the kutsero scene is
a flashback, not the story's present, and finishing it must not finish
Act I. A fourth objective, pumunta_entablado ("Pumunta sa entablado"),
was added, with a flag, nasaEntablado, that nothing in content/act1.js
sets — the same deliberate-gap trick Block 19 used to keep Act I from
finishing on the apple quest alone, now keeping it from finishing on
the flashback alone. Kabayo's gift.onComplete now also addQuests
pumunta_entablado, right before returning to tondo, so the quest log
carries the same open thread the objective counter does. Everything
else about Block 20 is unchanged — Kutsero, Tindero, Mansanas, the
hazard, opensShop, gift.onComplete, buyFlag all stand as built; only
the objectives array and one onComplete moved. content/act1.js's
script version to v15; nothing else touched.

Verified by re-running the full suite unchanged (354 passed, 0 failed)
and by rewriting _dev/verify_new_scene.js's ending to assert the
opposite of what Block 20 confirmed: Acts.objectivesFor(1).length ===
4, Acts.countDone(1) === 3, a new open pumunta_entablado quest logged
and undone, and Acts.status still "playing" with no transition screen
visible a full two seconds after the flashback resolves. 26 passed, 0
failed. Not run on a phone. (COMPLETE)

Block 22, three fixes reported directly by the proponent playing the
game — two engine bugs and one content reclassification.

The hitbox bug: findNearby (game.js) decided whether Macario could
interact with an NPC by comparing posX (his own left edge) straight
against npc.x (the NPC's own left edge) — an anchor-to-anchor
distance. Macario is 40px wide (PLAYER_WIDTH) and an NPC is roughly
80 (a new constant, NPC_WIDTH, matching .npc-sprite's own CSS width),
so the same INTERACT_DISTANCE (90, unchanged) meant a different real
gap depending on which side he approached from: too generous from the
left (the prompt fired well before contact), and too strict from the
right (requiring his own body to nearly swallow the NPC's) — which is
what read as "only works from the far right of a thing." Fixed with a
new helper, edgeGap, that measures the actual empty space between the
two entities' bounding boxes instead of the raw distance between their
anchors. Hazards were never affected — updateHazards already compared
a true centre against a hazard's real bounds, which is the model this
fix brings NPCs in line with.

The projectile bug: throwProjectile (game.js) spawned a thrown
weapon 30px past posX regardless of facing. Facing left, posX (his own
left edge) is already his leading edge, so this correctly cleared his
body; facing right, the same 30px landed only just past his own left
edge — still inside his 40px-wide body — so the throw started
underneath him and rendered behind him, since .projectile (style.css)
carries no z-index of its own and only loses the stacking order to
#player's explicit one (z-index: 1, Block 18) where the two actually
overlap. Fixed at the spawn point (now measured from his real leading
edge, whichever side that is) and backed up with a z-index on the
projectile itself, one above #player's.

The reclassification: Mansanas (content/items.js) was kind:
"equipment", slot: "accessory" — buyable, wearable, kept forever once
bought. On direct feedback, it should be "a unit type... something you
consume" rather than something worn. It is now kind: "consumable", a
new item kind with no slot at all (see CLAUDE.md, Item data format):
Inventory.equip()/toggle() refuse one outright, its +1 max health now
applies from ownership alone rather than from being equipped, and a
new Inventory.consume(id) is what actually uses it up — ownership and
effect both end together. Kabayo's gift.onComplete (content/act1.js)
now calls it the moment the apple is actually handed over. One
judgement call inside this: the health bonus ends when the item is
consumed rather than lasting permanently, which the request did not
settle either way — flagged in CLAUDE.md, Decisions on record, in case
the lasting version was actually intended.

game.js's script version to v30, style.css's to v19, inventory.js's to
v6, shell.js's to v10, content/items.js's to v5, content/act1.js's to
v16. No new Assets/ file, so ASSET_VERSION is unchanged at 8.

Verified by extending the full suite with a new section that exercises
all three fixes independently of real content — a same-real-gap
symmetry check on the interaction reach, a thrown projectile confirmed
to clear Macario's own body on both facings plus carry its own
z-index, and a fixture consumable bought, confirmed to apply its
effect with no equip step, confirmed to refuse equip()/toggle(),
consumed with its effect and ownership both ending, and rolled back on
a simulated failed write: 371 passed, 0 failed. Second,
_dev/verify_new_scene.js, extended with two checks on the real
Mansanas exchange: no longer owned and the health bonus gone,
immediately after it is actually given to Kabayo. 28 passed, 0 failed.
NOT run on a phone, so the hitbox and throw fixes specifically remain
unconfirmed on the touch controls and viewport they were actually
reported from. (COMPLETE)

Block 23, a same-session correction to Block 22's projectile fix,
reopened by direct feedback that a rightward throw still visibly
appeared behind Macario. Investigated with a screenshot first, of the
real page, rather than re-reasoning from the source: it showed the
projectile landing well inside #player's own rendered bounding box on
screen even after the Block 22 fix.

The real cause: Block 22 measured the throw's leading edge as
posX + PLAYER_WIDTH facing right, but PLAYER_WIDTH (40) is Macario's
LOGIC-side hitbox only — deliberately narrower than how wide he
actually renders, the same way a forgiving hitbox works in most
games — and has nothing to do with the visible
<div class="player-sprite">, which applyAnim() sizes to
fit.displayFrameWidth (scaled off DISPLAY_HEIGHT, 134) and which
measured well over 150px wide with a real sheet loaded. #player
itself carries no CSS width of its own, only a `left` set to posX
every frame, so as a single-child flex column its rendered box just
wraps that sprite: left edge pinned to posX, extending purely
rightward from there, in EITHER facing direction (facing left only
mirrors the artwork in place via a transform on the sprite, which
repaints pixels but never moves the box). A rightward throw needed to
clear posX + the sprite's real rendered width, not posX + 40; Block
22 cleared a bound roughly a quarter that size and the throw kept
landing inside the visible body. A leftward throw was never wrong —
the sprite never extends left of posX in the first place.

Fixed by reading the sprite's actual rendered width at throw time,
playerSpriteEl.offsetWidth, instead of the PLAYER_WIDTH constant —
so this keeps tracking whatever sheet is actually loaded (a worn
outfit's own sheets included) rather than going stale if the art
changes — with PLAYER_WIDTH kept only as a fallback for the case of
throwing before any sheet has finished loading, when offsetWidth
would read 0.

_dev/test.js's own Section AL assertion could not have caught this:
it checked the throw against the same posX + PLAYER_WIDTH bound the
buggy code used, so it was satisfied by construction regardless of
which fix was in place. Rewritten to check against
playerSpriteEl.offsetWidth instead, the box a player actually sees —
confirmed to fail against the Block 22 version and pass against this
one.

game.js's script version to v31. _dev/test.js is dev-only and
unversioned, so nothing else in index.html changed.

Verified two ways. First, a one-off screenshot script
(_dev/screenshot_throw.js, scratch, not part of the shipped suite)
driving the real index.html: before this fix, the thrown projectile's
on-screen box sat entirely inside #player's own rendered bounding
box facing right; after, it lands clear of it, matching what the
numbers said it should. Second, the full suite re-run after the
Section AL rewrite: 371 passed, 0 failed. Not run on a phone.
(COMPLETE, superseded by Block 24)

Block 24, the body model. Reported directly by the proponent: the
hazard band in the kutsero scene did not hurt Macario while he stood
on it and did hurt him when he was drawn past its right end. The
request was for an overhaul rather than another point fix, since the
report pointed at the hitbox and the sprite in general.

Measured first, in pixels: a scratch script swept Macario across the
real hazard, screenshotted him shown and hidden at every step, and
compared the columns he was drawn in against where damage happened.
His drawing stood about 140px to the right of his logic box, and
damage began only once the drawing had fully passed the band. The
cause was structural. #player was a flex column that wrapped a sprite
element sized to a whole scaled sheet cell (324px wide for the idle
sheet), pinned at posX on its left, with the character drawn in the
middle of the cell; the 40px logic box shared only that left edge.
Blocks 22 and 23 had corrected the throw against this twice without
finding it. NPCs and guards had the same shape: Nanay's drawing stood
about 60px right of her reach box.

The overhaul, all in game.js and style.css. An .entity's own box is
now the character's body (mountBody sets its left, width and height
from the same constants collisions read: PLAYER_WIDTH 40, NPC_WIDTH
80, and a new GUARD_WIDTH equal to PLAYER_WIDTH). Its art is
absolutely positioned inside it by one function, bodySprite, which
puts the drawn feet on the middle of the body and sets the flip
origin to the same point, so turning around does not slide him.
Placeholder boxes go through bodyPlaceholder the same way. Where the
feet are is a new optional per-sheet field, footX, measured by
_dev/measure-sprite.js (now printed on its paste line) from the
bottom fifth of the drawing rather than from the whole drawing,
because the shooting pose's extended arm pulls the whole-drawing
centre 14 native pixels forward of the feet. Measured: idle 130,
walk 126, shooting 49, Nanay 127. A sheet without it is assumed to
stand in the middle of its cell.

Collision rules were written down as two and applied consistently:
harm by overlap (updateHazards now hurts on any overlap of the body
with the band, instead of the body's centre), support and cover by
centre (platforms, hide spots and pickups, unchanged). Guard
detection, melee and the spear's hit test now measure centre to
centre; since guard and player bodies are the same width, detection
and melee reach are numerically unchanged. The stage's interact
distance now measures from the body's centre, since STAGE.x is the
stage's centre. The throw spawns PROJECTILE_SPAWN_GAP past the body's
leading edge in both directions, stepping back by the ball's width
(new PROJECTILE_SIZE, 14) facing left; Block 23's offsetWidth reading
is gone. Decorations get a zero-width body, so their x is where they
stand; no shipped content declares one.

Visible consequence to check on the device: NPCs now stand centred on
their x plus 40 rather than offset to the right of it, so Nanay is
drawn about 60px further left than before, and the static-image NPCs'
placeholder boxes about 7px further left. Nothing about reach changed
for them, only where they are drawn, which is now where the reach is.

game.js's script version to v32, style.css's to v20,
content/act1.js's to v17 (Nanay's footX). No new Assets/ file, so
ASSET_VERSION is unchanged at 8.

Verified three ways. First, the scratch sweep re-run: drawn span and
damage now agree to within the 20px sweep step at both edges of the
band. Second, a new suite section, AM, which reads screenshots rather
than style values (the lesson of Block 23's too-weak assertion):
idle and walk drawn centred on the body within 12px in both facings,
the shooting pose's drawing covering the body in both facings,
turning around moving him less than 12px, the hazard hurting 5px
inside either edge of the band and not 5px outside it, "when the
hazard hurts him, he is drawn over it" (the report itself, as a
check), and an NPC's and a guard's box equal to its body with its art
centred on it. AM was run against the Block 23 code and failed 12
checks there, including the report check, so it can tell the two
apart. Section AL's throw assertions were rewritten against the body.
Full suite: 387 passed, 0 failed. _dev/verify_new_scene.js against the
real content: 28 passed, 0 failed. Third, headless screenshots of
idle, walk, aim and fire in both facings with the body box outlined.
NOT RUN ON A PHONE. (COMPLETE)

Block 25, the item and inventory overhaul. Requested for polish, with
three rules: permanent items worn in Sandata, Anting-anting and Damit;
consumables like an apple that are used up; Tindahan removed from the
inventory and Imbentaryo from the pause menu. Clarified before building:
Gamitin heals and story items cannot be eaten, with the horse's apple as
its own quest item named "Mansanas para sa kabayo"; consumables stack
with a count; and the SQL wanted is the test-account reset.

inventory.js was rewritten around counts (item id to quantity) instead
of a list of owned ids, and around three groups: permanent (equipment,
cosmetic), consumable and quest. New: use(id), count(id), buyBlocker and
useBlocker (the reasons shown on disabled buttons), kindLabel and
effectLines (the Tagalog the screens show), forQuest shop filtering, and
a single _writeCount that upserts the quantity or deletes at zero.
Consumables no longer apply an effect while carried. Guests can buy,
wear and use in memory with nothing written. game.js gained
Game.health() and Game.heal(n).

shell.js's inventory and shop code was replaced. Both are wide panels
(#shell-box gets shell-box-wide): header with title, coin chip and
Bumalik; slots and a tile grid on the left; the selected item's detail
and its one action on the right. Tapping a tile selects; the action
button acts. invReturn, shopReturn, _onItemTap and _onBuyTap are gone,
along with #shell-inventory-open and #shell-shop-open in index.html.
Three symbols were added (i-apple, i-scroll, i-heart). Item tiles show
the item's symbol until its img exists, rather than the dashed
placeholder box; see CLAUDE.md, Icons.

content/items.js now holds Mansanas (consumable, 5 barya, heals 1,
stacks to 5) and Mansanas para sa kabayo (quest, 5 barya, forQuest
bilhan_mansanas, buyFlag binilhAngMansanas). Kabayo's gift consumes
"mansanas-kabayo". No permanent items ship, since none have been
decided against the source material; the slots render empty.

db/reset_test_accounts.sql rewritten: same seven tables, comments
updated for stacks, quest items and the changed "mansanas" id. No
migration.

Versions: game.js v33, style.css v21, shell.js v11, inventory.js v7,
content/items.js v6, content/act1.js v18. ASSET_VERSION unchanged at 8.

Verified: full suite 407 passed, 0 failed, with sections P, T, T2, U, Z
and AL's consumable checks rewritten for the new model (two-tap select
and act, slot labels, stacking to one row with a quantity, the full
stack and full health refusals, quest items on the shelf only while
their quest is open, the removed doors) and guest buying and using added
to AH. _dev/verify_new_scene.js against the real content: both apples on
the shelf, buying the horse's apple does not buy the food, eating the
food heals without touching the quest item, and Kabayo still takes the
right one; 35 passed, 0 failed. Headless screenshots of both panels at
823 by 412. NOT RUN ON A PHONE. (COMPLETE)

Block 26, the backdrop seam. Reported directly: the tree shadow bands
Block 18 placed over each repeat of Tondo.png read as ugly black posts.
Three approaches were compared on the real image before building: plain
repetition (a visible jump in the clouds and water), a crossfade over an
overlap (palms and huts ghosting through each other), and mirroring every
second copy (continuous at both edges, at the cost of a symmetry). Built
the mirror.

game.js: buildSkylineShadows and TREE_SHADOW_WIDTH removed;
buildSkylineTiles lays out whole-pixel tiles one image wide, overlapping
by one pixel, every second tile flipped, inside both #skyline and
#skyline-night, pushed to actElements. style.css: .tree-shadow removed;
each layer names its image in --skyline-src; .skyline-tile and
.skyline-tile-mirrored added; .skyline-tiled switches the layer's own
repeat off once tiles exist. No asset change, so ASSET_VERSION stays at 8.
game.js v34, style.css v22.

Verified: section AJ rebuilt (tiles cover the world, alternate tiles
mirrored, layer repeat off, no shadow bands, one fresh set per scene
load, tiles removed on unload) plus a pixel check with everything in
front of the backdrop hidden and the camera on the seam. That check read
75.6 across an unmirrored join against 38.1 nearby and failed, and passes
with mirroring. Full suite 412 passed, 0 failed.
_dev/verify_new_scene.js 35 passed, 0 failed. Headless screenshots of
both seams at 823 by 412, before and after. NOT RUN ON A PHONE.
(COMPLETE)

Block 27, Macario's melee clip and Kutsero's idle. Two sheets delivered:
Assets/Prefab/Macario_Melee.jpg (800x600, 4 by 3, 12 frames; a PNG with
alpha under a .jpg name) and Assets/Act 1/Kutsero.png (1280x768, 5 by 3,
14 of 15 cells). Measured with _dev/measure-sprite.js: melee contentTop 47,
contentHeight 109, footX 96 (six punch frames dip about ten pixels, which
is the lunge, not a size fault); Kutsero contentTop 69, contentHeight
121, footX 128.

game.js: BASE_SPRITE_SHEETS.melee (24fps, loop false) and its preload;
playMelee plays it once on a tap, through the existing shooting state
and hand-back timer; the aim pose moved from startAttackHold into
updateAttackHoldPose, called from the game loop, and shows only after
AIM_POSE_DELAY_MS (150). ATTACK_HOLD_MS (400) is unchanged and still the
only thing that decides punch or throw. The hit still lands on release.
ASSET_VERSION to 9, game.js v35.

content/act1.js: Kutsero's img replaced with an animation def (6fps,
matching Nanay). v19.

Verified: section AI extended (no aim pose on the first frame of a
press, aim pose after the delay, a tap plays the melee clip and throws
nothing, the melee sheet loads as a 4 by 3 grid, the punch hands the
pose back after its half second, and a quick tap sampled every frame
never shows the aim pose); full suite 417 passed, 0 failed.
_dev/verify_new_scene.js gained a check that Kutsero draws his sheet
rather than the placeholder; 36 passed, 0 failed. Headless screenshots of
idle and mid-punch facing both ways, with Kutsero beside him. NOT RUN ON
A PHONE. (COMPLETE)

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

Act I was rewritten once against the finished mechanics, then reset
back to a one-scene, one-NPC blank slate because that draft was
written ahead of the resource person's source material rather than
against it; see Blocks done. Writing real content for Act I, and then
for Acts II through IV, against the source material this time, is the
content work that remains. (NOT STARTED)

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

Chase the remaining replacement art. Assets/ now holds five real
commissioned files: Act 1/Nanay.png (Macario's mother, the only NPC
content/act1.js declares), Act 1/Tondo.png (the day skyline backdrop,
added Block 18), and Prefab/Macario_Walking.png, Macario_Idle.png and
Macario_Shooting.png (Macario's own base walk/idle cycles and his
ranged-attack pose — see Known problems, missing production art, and
CLAUDE.md, Decisions on record). Still needed: Macario's Dead pose (the
one base sprite still falling back to the placeholder box for every
player), the Cement_Tile.png ground tile, and Tondo_Night.png (the night
skyline — the path was renamed to Assets/Act 1/ in Block 18 to match the
day version, even though the file itself is still missing). Verify
against the device directly (device_list_dir or equivalent) before
trusting any list like this one — a session's own working copy can
silently carry stand-in files that were never written back to the user's
machine, which is what made an earlier version of this paragraph wrong.
Everything the fuller Act I draft used to need art for — a director, a
recruiter, a courier contact, a guard, decorations, the night skyline — is
not currently declared as content at all, so there is nothing there to
draw against yet; that list comes back once real content does. Acts II
through IV are untouched and still fall back to the labelled placeholder
box wherever art is missing, which is the fallback system working, not a
fault.

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
by 120 and 21.7 KB. (COMPLETE, but see the entry below — the file that
was optimized here is not on this device anymore)

Missing production art. NARROWED in one direction, WIDENED in another:
four of the original six files this entry used to list are real, but
scanning the actual device this session (for Block 23's tracker
update) turned up three more the kutsero scene now needs and never
got an entry here.

Real: Assets/Prefab/Macario_Walking.png (20 frames) and
Macario_Idle.png (16 frames) are Macario's base walk and idle cycles,
which every player, guest or not, falls back to; Assets/Prefab/
Macario_Shooting.png (25 frames, Block 17) is his ranged-attack pose;
Assets/Act 1/Tondo.png (1983x793, Block 18) is the day skyline
backdrop, now tiled across the world with a seam-masking shadow
effect (see Blocks done).

Still missing, the original three: Cement_Tile.png (the ground tile),
Assets/Act 1/Tondo_Night.png (the night skyline — the path was renamed
to Assets/Act 1/ in Block 18 alongside the day version, on the same
reasoning, even though the file itself is still missing), and
Dead.png (Macario's death pose).

Missing, newly found and not caused by anything in Blocks 22-23: three
of the kutsero scene's own NPCs, content/act1.js's img field pointing
straight at Assets/ (its root, not Act 1/ or Prefab/) for all three —
Assets/Horse.png (Kabayo), Assets/Kutsero.png (Kutsero, same name as
the scene), and Assets/Tindero.png (Tindero, at the shop end of the
map). These have been missing since Blocks 19-20 built the scene and
were never entered here; this device's Assets/ folder holds only the
Act 1/ and Prefab/ subfolders confirmed above, nothing at its own
root. Six files missing in total now, not three. (Block 27: Kutsero now
has real art at Assets/Act 1/Kutsero.png, so five remain: Horse.png,
Tindero.png, Tondo_Night.png, Cement_Tile.png and Dead.png.)

The live game as currently checked out on this device would show no
ground texture, no night skyline, a defeated Macario falling back to
the placeholder box, and all three of Kabayo, Kutsero and Tindero as
dashed placeholder boxes naming their missing file, in the one scene a
proponent is most likely to actually play through right now.
_dev/test.js's one real symptom of the original three — the check
that unequipping a cosmetic outfit restores the base walk cycle,
which asserts against the actual walk sheet rather than a fixture —
passes, since that sheet is real (see Verification), and
_dev/verify_new_scene.js drives the kutsero scene entirely through
FIXTURE_ACT1_JS-free real content without ever asserting that Kabayo,
Kutsero or Tindero actually render as art rather than placeholders —
so all six missing files have no automated coverage and are silently
broken with both suites fully green around them. A Claude session
cannot create real game art and has no way to know whether a working
copy of any of these six files exists somewhere outside this project
folder; the Cement_Tile.png line in an earlier version of this entry
confirmed at least that one was optimized and present at some point,
so check git history for a commit that still has it (`git log --all
--full-history -- Assets/`) before concluding any of this art is
lost. (KNOWN, BLOCKING A REAL DEVICE PASS ON BLOCKS 14, 15, 19 AND 20
AND ON ACT I GENERALLY — six files now, not three)

Dynamic difficulty cannot be demonstrated in the running game,
because only Act I has guards and Act I is the 1.00 multiplier. The
formula is documented and the harness proves it against a fabricated
act. The honest answer to a panel is that the lever is built and the
acts it scales are not written yet. (BY DESIGN)

The deployed site can silently fall behind the repository's own files.
Checked this session: raw.githubusercontent.com's main branch already
had Nanay's content and the CSS quote fix in game.js, but the live
index.html's own script tags still named OLDER ?v=N numbers
(content/act1.js?v=5, game.js?v=14, shell.js?v=4, style.css?v=9,
content/items.js?v=2) than the files sitting behind those exact URLs.
A browser or CDN that already fetched one of those URLs has no reason
to ask again, so it keeps serving whatever it cached under that
version number regardless of what the file now contains. This is the
likely explanation for a report of missing content (Nanay, in this
case) when a fresh, uncached fetch of the same files shows them
working. Before assuming the code regressed: hard refresh or open the
live URL in a private window, and confirm the numbers index.html
actually references were bumped in the same push that changed the
files they name. Nothing in a Claude session run this way can commit
or push, so keeping these numbers in step across a push is on whatever
does the pushing, not something verifiable by fetching GitHub alone
afterward. (KNOWN, WATCH ON NEXT PUSH)

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

417 checks, after Block 27 extended section AI (the melee clip and the
aim pose delay) on top of Block 26's 412 (see Blocks done). Anything
other than "0 failed" is a regression. It last ran 417 passed, 0 failed,
in Block 27 — run
from a disposable sandbox with the repository staged into it and a
symlinked global Playwright install, since that session had no shell on
the device itself; the same command is what to run directly on the device
when one is available. Blocks 19 through 21 (the kutsero scene, the
apple quest, and the flashback-objective fix) are covered separately,
against the REAL content/act1.js and content/items.js rather than
test fixtures, by _dev/verify_new_scene.js (28 passed, 0 failed as of
Block 22, its own most recent addition) — not part of this count and
not run by `node _dev/test.js`; run it on its own the same way.

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

