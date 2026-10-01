# DECISIONS.md

Why MACARIO is built the way it is: the reasoning behind every block,
moved here word for word from CLAUDE.md in Block 79 so that CLAUDE.md,
which every session loads, holds only the standing rules and formats.

Read it when touching a system, not at the start of a session. Search
by the system's name (Bodies, Inventory and shop, Pixel theme, Audio)
or by "Block N"; CLAUDE.md, Decisions on record, has an index. Where
an older entry says it is superseded, the later entry wins. Entries
name files by the paths they had at the time; Block 44 lists where
each moved.

New decisions are added at the end of Decisions on record, one entry
per block, in the same register: what was asked, what was built, why,
what it cost, and the versions and check counts it shipped with.

## Act I's content: a deliberate reset, then built forward again

content/act1.js has gone through three shapes: a proving ground (one room,
one example of every engine system, placeholder dialogue about buko and
errands), a full narrative written directly against the ten item pairs in
db/seeds/macario_items_v3.sql (two scenes, five objectives, a stage cutscene, a
guard corridor), and a reset back to one scene, one NPC (Nanay, Macario's
mother, with real commissioned art) and one exchange. All three are in
git history; none should be restored by copying old code back in without
a reason.

The reset was deliberate, not a regression: the narrative-complete version
was written ahead of the resource person's source material rather than
against it, and starting over from a real, working, minimal base was
chosen over layering more content onto a story that might not survive
contact with the source. content/items.js was reset the same way, back to
an empty catalogue, for the same reason — the two granted equipment items
and two purchasable outfits it carried were content decisions made without
the source material either.

Built forward from that reset since, one verified passage at a time
(Blocks 19 to 21, then 31 to 37): Act I is no longer the one-scene blank
slate above. It is four scenes. tondo is the road, from Nanay's errand
past the Mananahi to the entablado at its end; kutsero is the flashback,
which resolves without ending the act because a memory is not the act's
own ending; entablado is the stage, where the moro-moro plays out and the
first fight happens; lansangan is the street past the end of the road,
where Macario carries the Katipunan's pamphlets past guards. Seven
objectives, and since Block 37 every one has a flag-setter, so Act I can
be completed and runs its post-test. Block 37's script is a placeholder
written ahead of the source book (see Decisions on record).

Block 52 replaced all of that with the proponents' new script and plot,
a second deliberate reset rather than a regression: Act I now opens on
the street with three siga taunting Macario about his father, Nanay
calls him home, tells him the money went on the cedula, and he resolves
to work, which opens a savings quest that counts his barya toward 100.
Two scenes (tondo, the street; bahay, at home, on the same paintings),
two objectives, and an empty item catalogue. Block 56 added the work:
two jobs on the street, the savings given to Nanay, and an errand to
the entablado, in four scenes and three objectives, with the act held
open (holdOpen) at the end until the next passage is written. The backgrounds and every
asset file were kept; the old scenes, their script and their three
items are in git history. Block 57 put all of it on one street, ten
paintings long, at the proponent's direction: no house and no tailor's
shop to be carried into, Nanay outside for good, the two jobs as
errands with fixed pay, black intertitle cards for "Tondo, 1880" and
"1884", and the entablado reached only with the direktor. Two scenes
(tondo, entablado), nine objectives. Block 59 took out the "1884" jump:
the direktor is the last of the Mananahi's deliveries, his lead actor
is missing, and Macario plays the part in a moro-moro inside the
entablado, with a fight, before he is paid and gives Nanay the savings.
STORY.md describes exactly what Act I contains today, line by line.

None of this touched the ENGINE. Every mechanic the fuller version
exercised — dialogue, the stage/death-sequence cutscene, guard patrol and
detection, hazards, hideSpots, platforms, pickups, the shop, equip and
item-effect system — is unchanged, still fully implemented, and still
fully covered by _dev/tests/test.js, which now carries its own private fixture
scene and item catalogue (FIXTURE_ACT1_JS / FIXTURE_ITEMS_JS, near the top
of that file) so those mechanics stay tested independent of whatever
content/act1.js and content/items.js actually ship. See Decisions on
record for why the harness was rebuilt this way instead of shrinking
alongside the content.

Acts II through IV are still registered, loadable stubs waiting to be
written. Act I's remaining beats, and all of theirs, should be built the
same way the passages since the reset were: one verified passage at a
time against whatever the resource person's source material actually
says, not reassembled from the version sitting in git history.

## Decisions on record

The standing decisions of the first blocks (accounts, attempts, the
score formula, health and respawn, difficulty, pause, logout, the
reset, zoom and touch targets) are rules every session needs, so they
stay in CLAUDE.md, Standing decisions, rather than here.

Act I is two scenes, not one. "tondo" is safe, no guard and no hazard, and
covers origins, the trade, the moro-moro performance and the recruitment
into the Katipunan. "misyon" is where dangerous is true: it holds the
guard, hide spot, platform and hazard that used to live in the test
stage's single room, now carrying the stakes of a courier task rather than
proving the mechanic for its own sake. The split exists because the story
has a safe half and a dangerous half, and forcing both into one room the
way the test stage did was a testing convenience, not a narrative choice.

Five objectives, unchanged from the test stage, so the currency drip stays
floor(50 / 5) = 10 barya each without touching acts.js. Each objective's
flag is chosen freely except one: deathSequenceDone is not content's name
to pick. game.js sets it directly when the stage cutscene's death
animation ends, so whichever objective is "the performance" has to use
that exact string.

The hidden-NPC pattern (startsHidden plus revealedByFlag) that the test
stage used for its guarded NPC is deliberately not reused. game.js only
calls revealNpcsByFlag() after the death sequence and on save restore, so
that pattern only works when the reveal flag IS deathSequenceDone. A
contact "hidden until the player gets past the guard" would need a flag
nothing re-checks, and the guard corridor already makes reaching that NPC
hard without it.

Every historical fact stated in content/act1.js is stated because a
correct answer in db/seeds/macario_items_v3.sql already commits to it: Tondo,
the tailor-and-barber trade, the moro-moro, 1894, the Katipunan's aim of
independence through revolution rather than reform, why it had to stay
secret, the danger to a messenger, and that its members were ordinary
workers. Nothing goes further than that on its own authority. The
connective tissue between beats, such as a character noticing his stage
presence or naming the year aloud, is ordinary scene-setting for a game
and not a claim about what is documented. If the resource person's source
material says something different or something more, later passages
correct or extend these beats rather than the other way around.

The tondo scene's opening NPC is Nanay (Macario's mother), not a generic
neighbor. She was a neighbor originally, carrying the same two LO1 facts
(Tondo, mananahi at barbero); once real commissioned art existed for
Macario's mother specifically (assets/sprites/characters/nanay.png, a 5-column by
3-row, 14-frame sheet), she replaced the neighbor rather than being added
alongside her, since a mother stating her son's trade and their place in
Tondo fits those same two facts at least as well as a neighbor did, and
Assets/ only had one commissioned sprite to place. The dialogue was
reworded for the relationship (a mother doesn't ask her own son whether
he still lives in the same neighborhood) without changing any of the
stated facts. Every other Act I NPC, the guard, and the decorations lost
their earlier Claude-drawn placeholder art in the same folder
reorganisation and were deliberately not given new placeholders; they
render as the engine's own dashed box until real art exists for them too.

content/act1.js was then reset further, on purpose, back to just that one
Nanay exchange: no second scene, no stage, no guard corridor, no other
NPC. The narrative-complete version (two scenes, five objectives) was
written ahead of the resource person's source material rather than
against it; rather than keep extending a story that might not survive
contact with the source, it was rolled back to a small, real, working
base to build forward from once the source material is actually in hand.
content/items.js was reset the same way, back to an empty catalogue — the
two granted equipment items and two purchasable outfits it carried were
likewise content decisions made without the source material.

This time the reset did NOT shrink test coverage. Nearly every section
from Block 8 onward (F through AG) drives the game through a "resuming
student, mid Act I" fixture that used to mean the real misyon scene: its
guard, hazard, hideSpot, platform and pickup, and the real item
catalogue's shop/equip/effect behaviour. Rather than deleting all of that
coverage along with the narrative, _dev/tests/test.js now carries its own
private fixture (FIXTURE_ACT1_JS and FIXTURE_ITEMS_JS, defined near the
top of the file) reproducing that same gameplay skeleton and catalogue,
served in place of content/act1.js and content/items.js ONLY inside the
harness, via enterTestRoom()'s fixtureRoutes() helper. Production content
and the test fixture are now intentionally decoupled: either can change
without touching the other, and the mechanics (guard AI, hazard/pickup
collision, the shop) stay under full regression coverage even while the
shipped content is a blank slate. See Pitfalls for the one trap this
uncovered: any test that resumes a save with objective flags already set,
against the REAL (not fixture-routed) content, now risks auto-completing
the act the instant it loads, because the real Act I has only the one
objective and that flag is already true.

(Superseded by Block 25, below.) Block 13 gave inventory and shop their own main-UI buttons, #btn-inventory
and #btn-shop, next to #btn-pause, so either screen is one tap from
gameplay instead of two or three through the pause menu. Both panels kept
their original pause-menu doors too; nothing about the Block 10/11 flow was
removed, only added to. shell.js tracks which door was used, invReturn for
the inventory panel and shopReturn for the shop panel, each set to either
"paused" (came in through the pause menu; a direct-open still exists for
the inventory-hosted shopOpen button, which passes "inventory") or
"playing" (came straight from the main UI). _closeInventory/_closeShop
read that flag to decide whether "back" returns to the pause screen or
fully resumes the world; a direct-open pauses the game itself first
(the same Game.setPaused(true) call and cutscene-refusal guard openPause
uses) since there was no prior pause tap to have done it. The shop button
opens the shop panel directly, skipping inventory entirely, when reached
from the main UI; reached from inside the inventory panel (either
door's inventory) it behaves as it always has. The two new buttons reuse
the i-bag and i-coins icons already used for their pause-menu
counterparts (Imbentaryo, Tindahan) rather than new art, and their
visibility is driven by game.js, in the same per-frame branch and the
same window.Inventory guard that already governs #btn-pause, rather than
by shell.js, since that is the file that already owns "the student is
currently playing" as a rendered fact.

Block 14 added play-as-guest: a second title-screen button
(#shell-guest) next to Magsimula/Magpatuloy that drops straight into Act
I with no account, no login box, and nothing written to the database.
The whole feature turned out to be one new function on each side rather
than a parallel code path threaded through the engine, because every
write-path function in acts.js (syncStart, _ensureRow, setStatus,
checkObjectives) and saveProgress in game.js already began with
`if (!currentUserId) return;` — a guard written for "nothing to save
yet", not for guests, but it covers a guest for free as long as
currentUserId is simply never set. game.js's enterGameAsGuest sets a new
isGuest flag instead, then calls loadAct(Acts.getAct(1), "tondo")
directly; shell.js's _onGuestStart sets this.entered = true before
calling it, the same trick _onStart already plays for a real login, so
that when enterGameAsGuest calls Shell.awaitEntry() afterward it finds
entry already underway and drops straight into _enterWorld() rather than
waiting on a login-box tap that would never come. A guest is not a real,
disposable Supabase account and never touches Supabase at all: closing
the tab loses everything, on purpose, and Game.isGuest()/Game.isSignedIn()
report which state a session is in for anything that needs to ask
(nothing currently does; both are exposed for the shop/inventory code to
guard against in the future should a guest ever reach them). Reset,
logout, and the teacher dashboard are all meaningless for a session that
never wrote a row and were left untouched rather than special-cased.
See _dev/tests/test.js, AH, for the coverage: the button entering the world
without a login box, no rows appearing in any table across a played
session, and a reload landing back on a fresh title screen rather than
resuming, since there is nothing to resume from.

Block 15 replaced the gold-on-black UI chrome with a Katipunan flag
palette (deep red, royal blue/navy, cream, pale gold used sparingly for
accents) requested after the gold/black look was judged not to fit the
game. This retextures UI chrome only — panels, buttons, borders, and
generic text — never gameplay or status colors, which carry meaning
independent of branding and stayed exactly as they were: health hearts,
environmental hazards, the guard detection meter, platforms, hide-spots,
the stage platform, the cutscene blackout, and the danger/success signal
colors on quiz feedback and inventory rows. The palette lives as CSS
custom properties in :root (--c-navy, --c-navy-deep, --c-red, --c-gold,
--c-cream and their dim/faint variants, plus an -rgb triplet for each so
any translucent rgba(...) use can write rgba(var(--c-x-rgb), alpha)
instead of a new hardcoded literal) rather than as one-off hex literals
at each use site, so a future palette change is a handful of variable
edits instead of another file-wide hunt. One color needed a
context-dependent split rather than a global swap: #7bc47f was doing
double duty as both a semantic "owned/success" indicator
(.inv-item-owned, .shell-note.ok, .shell-keeps .ico — left green, since
green-means-success is a signal, not a brand color) and as the decorative
border on .shell-btn-primary (recolored to gold, since that one use was
chrome). #43a047 similarly stayed green on .inv-item-owned's border while
every other use of it (the login/quiz/primary-action buttons) became the
new red. Logout's border stays a separate, pre-existing danger red
(#7f1d1d family) rather than being merged with the new brand red; the two
read as visually close in a palette this red-heavy, which is a tradeoff
worth revisiting if a tester ever confuses "the button that logs me out"
with "the button that does the main thing," but splitting them further
seemed premature without that evidence. See _dev/tests/test.js: no new coverage
was added for this block, since it changes only color values and the
existing suite already exercises every screen touched; the full 327-check
suite (310 plus Block 14's 17) was re-run after the retheme with no
regressions.

Macario's own base walk and idle sprites are real commissioned art, not
Claude-drawn placeholders: assets/sprites/player/macario-walk.png (1280x1024,
a full 5-column by 4-row grid, 20 frames) and assets/sprites/player/macario-idle.png
(same 1280x1024, 5 by 4 grid, but only 16 of the 20 cells are real frames —
the last row has one frame, not five). Both live in Assets/Prefab, not
Assets/ directly, matching the folder's purpose from the earlier
reorganisation: Assets/Act 1 holds art specific to one act (Nanay), and
Assets/Prefab holds art that is not act-specific and that every act falls
back to, which is exactly what the player's own base sprites are.
BASE_SPRITE_SHEETS in game.js was repointed at these two files, replacing
Assets/Walk.png and Assets/Idle.png — names the code had carried for
several blocks but which never actually existed on this device (see
TRACKER.md, Known problems, missing production art). fps was left
unchanged from the placeholder sheets (idle 6, walk 12) rather than
guessed at; nobody has judged the new art's speed against a phone yet, so
treat that pair as a first guess to revisit once someone has. Dead.png is
still missing and still falls back to the placeholder box, which is the
fallback system working as designed, not a fault. ASSET_VERSION bumped to
6 and game.js's own script version to v24, since the browser must refetch
game.js to learn the new asset version. _dev/tests/test.js, section Y, had three
assertions that hardcoded the old Assets/Walk.png and Assets/Idle.png
path strings as the expected "base sheet restored" value; all three were
updated to the new paths, and the one check that had actually been failing
against this device's real files because Assets/Walk.png never
existed — "unequipping restores the base walk cycle" — now passes for
real. 327 passed, 0 failed, run twice.

Getting the real art on screen exposed a second, separate problem: every
sheet was scaled and grounded by the size of its FRAME (always 256px
tall here), not by the size of the character actually drawn inside that
frame, and real art does not fill its frame edge to edge. Measuring each
sheet's own alpha channel (union of every frame's non-transparent
bounding box) found Nanay's drawing fills about two thirds of her frame
(contentTop 45, contentHeight 166 of 256) while Macario's idle pose
fills barely two fifths of his (contentTop 73, contentHeight 106) and
his walk cycle a bit more (contentTop 60, contentHeight 127) — three
different amounts of empty padding on three sheets that were all being
scaled and grounded identically regardless. The visible symptoms were
exactly that mismatch: Macario's idle pose rendered smaller than his own
walk cycle, neither matched Nanay's height, and all three floated above
the ground line by however much empty space sat below their feet,
because the sprite box's bottom edge is the bottom of the FRAME, not
the bottom of the drawing.

The fix is spriteFit (game.js, just above loadSpriteSheet) plus two new
optional fields on a sheet, contentTop and contentHeight — see Sprite
sheets for the format and the measurement rule. It does not touch any
image: every number above came from reading the existing PNGs' alpha
channel, not from redrawing them, which is what the fix had to do
without editing the art. BASE_SPRITE_SHEETS.idle and .walk in game.js
and Nanay's animation def in content/act1.js now carry these fields; a
sheet without them (Dead.png once it exists, any cosmetic outfit, the
harness's own fixtures) renders exactly as before, since spriteFit
falls back to the full frameHeight and a zero top offset when either
field is absent. Confirmed by comparing the player's and Nanay's actual
getBoundingClientRect() in a headless run: both now report the identical
top, bottom and height, meaning both are DISPLAY_HEIGHT tall and both
feet land on the same ground line, not just similar-looking in a
screenshot. 327 passed, 0 failed, run twice; no existing check measured
backgroundPosition or backgroundSize directly, so none needed updating,
only the visual verification above.

The three sheets above were measured by a one-off script, written and
discarded in the same session. _dev/tools/measure-sprite.js is that script
made permanent, once it was clear this would come up again for Dead.png
and for outfit art: it takes any sheet plus its columns/frames and
prints the same contentTop/contentHeight a person would otherwise have
to eyeball, straight from the PNG's own alpha channel. See Sprite sheets
and _dev/README.md.

Block 15's Katipunan flag palette (gold, navy, red) was retired and
replaced with a natural wood-and-green palette, because the flag chrome
still read as a flat, modern interface rather than something physically
made, and the request this time was explicit: pure CSS and SVG only, no
new image assets, and a fully natural color range (browns, greens,
cream) rather than keeping any red or gold as an accent. This retextures
UI chrome only, the same boundary Block 15 drew and for the same
reason: panels, buttons, borders and generic text changed; gameplay and
status colors did not. Hearts, hazards, the guard detection meter, the
thrown spear, platforms, hide-spots, the stage platform, the cutscene
blackout, and the danger/success colors on quiz feedback and inventory
rows are all exactly the literals they were before this block.

The palette lives in the same :root custom-property shape Block 15
used: --c-wood, --c-wood-deep and --c-wood-light for panels, overlays
and borders; --c-green and --c-green-deep for the one accent color this
retheme uses, covering what gold used to cover (headings kept a plain
--c-cream instead; see below); each with an -rgb triplet so a
translucent rgba(var(--c-x-rgb), alpha) never needs a new hardcoded
literal. --c-border-muted was redefined from a cool navy-blue to a warm
muted brown (#6d5842) in place, so every rule that already referenced it
(the quiz choices, the inventory rows, the settings choices, and others)
picked up the new tone with no per-rule edit needed.

Two colors needed to be decoupled rather than swapped, for the same
reason Block 15 decoupled a shared literal once before. The guard meter
fill and the thrown spear both used to read var(--c-gold) directly, so
retiring that variable would have recolored two gameplay signals along
with the chrome. Both are now the literal #f4c542 instead, unchanged in
appearance and untouched by any future chrome palette change.

Retired var(--c-gold) split three ways depending on what it was doing.
Panel and button borders (auth box, quest log, dialogue box, the
act/quiz/shell overlay boxes, the pause/inventory/shop buttons, the
touch controls) became --c-wood-light: a border is chrome, not an
accent. Headings and titles (auth title, quest log title, act and quiz
titles, the shell heading, the rotate notice) became a plain --c-cream
rather than an accent color, on the view that a heading in this palette
reads better as cream-on-wood than as another green surface. Everything
that was signaling "this is the one active or emphasized thing" —
the dialogue speaker name, the quiz progress line, the toast, the
selected quiz choice, the active settings choice, the equipped
inventory row, the currency balance, an object's owned/worn marker,
the interact prompt's active state, the feedback stars — became
--c-green, since green was already this project's one existing accent
(the interact prompt, an owned item) before this block and re-using it
rather than inventing a second accent keeps the palette to browns,
greens and cream as asked. Retired var(--c-red) (auth submit, the gift
button, the act/quiz primary button, the shell primary button)
became the same --c-green for the identical reason: one obvious thing
to tap, colored the one accent this palette has. Chrome tints that were
previously rgba(var(--c-gold-rgb), n) on plate-like surfaces (the
panel button borders and icon wells in the Icons and button chrome
section, the round world-button and touch-control radial gradients,
the shell box's outer glow) became rgba(var(--c-wood-light-rgb), n)
instead of green, since those are texture rather than emphasis and a
screen where every surface glows green stops reading as an accent at
all.

Pre-existing status-green literals were deliberately left alone rather
than rewired to --c-green: .inv-item-owned, #auth-status.success,
.shell-note.ok and .shell-keeps .ico all already used their own
hardcoded greens (#43a047, #7bc47f family) as an "owned/success" signal
independent of chrome, exactly the separation Block 15 established.
They happen to render close to the new chrome green now, which is a
coincidence of both drawing from the same natural palette, not a
merge — a future chrome change that moves --c-green elsewhere will not
move these, and that is the point of them staying literals.

Verified by running the existing suite unchanged (327 passed, 0 failed,
run twice) — this block touches color values only, so no check needed
writing or updating — and by a headless screenshot pass over the title
screen, the game world and HUD, the pause menu, the settings panel and
the inventory panel, confirming the wood/green/cream look renders
correctly and that gameplay elements (hearts, the quest log, the touch
controls) kept their prior appearance. style.css's own script version
was bumped in index.html for the cache-buster reason stated under
Pitfalls.

A third real commissioned sprite, assets/sprites/player/macario-shoot.png (a
500x500, 5 by 5 grid, 25 frames), was added and wired in as Macario's
ranged-attack pose — there was previously no dedicated animation for
that action at all; holding the attack button to throw (Ibato) left
whatever pose (idle or walk) the player was already in unchanged while
the projectile spawned. Measured the same way as the other two
(_dev/tools/measure-sprite.js, contentTop 23, contentHeight 51 of a 100px
cell), but this sheet needed something the other two did not: it is one
continuous 25-frame clip — an aim/draw-up sequence, a muzzle flash
around frame 15, then several unused recovery frames — and only part of
it should ever play, and different parts at different times, rather
than one sheet meaning one pose end to end.

The engine gained startFrame and endFrame, two more optional per-sheet
fields (see Sprite sheets), so BASE_SPRITE_SHEETS declares this one
image twice under two names: shootAim (frames 0-12, loop: false) and
shootFire (frames 13-15, loop: false). applyAnim and updateAnimFrame
both fall back to 0 and frames - 1 when these are absent, so idle, walk
and dead are unaffected. This is a smaller, more general change than a
one-off "shooting sheet" special case would have been, and the same
mechanism is available to the next sheet that turns out to hold more
than one pose.

A new module-level variable, shooting (null | "aim" | "fire"), tracks
which of the two owns the player's pose right now, and the main loop's
own idle/walk switch is skipped whenever it is set — exactly the way
cutscenePlaying already suppresses that switch for the death sequence,
not a second, different mechanism. startAttackHold sets shooting to
"aim" and switches to shootAim the moment the button goes down, before
anyone — including the engine — knows whether this hold will end up a
melee swing or a throw; that is only decided on release, by
ATTACK_HOLD_MS, exactly as it already was. endAttackHold either clears
shooting (a short tap, which becomes meleeAttack as before) or calls the
new playShootFire, which switches to shootFire and starts
throwProjectile in the same call, so the muzzle-flash frame and the
projectile's appearance land in the same frame rather than one ahead of
the other. There is no general "animation finished" callback in this
engine, so playShootFire hands the pose back with a plain
setTimeout sized to the clip's own frame count and fps — the same
approach flashAttack already uses for the melee brightness flash, not a
new pattern.

Holding attack across a guard catch, a hazard knockback, or the stage
cutscene starting is possible, and previously nothing reset
attackHoldStart in any of those cases (nothing needed to — idle and
walk look the same regardless). A stuck shooting pose is a new failure
this feature could have introduced, so respawnInScene and
startPerformance now both clear attackHoldStart, shooting and the fire
timer defensively, the same two lines in both places.

Covered in _dev/tests/test.js, section AI: both sheets load without falling
back to a placeholder and declare the right frame ranges; pressing
attack switches to the aim pose immediately; a long hold climbs to and
holds on frame 12 rather than looping past it; a quick release cancels
the pose and throws nothing; a qualifying hold plays the fire clip
starting on its own frame 13 with the projectile appearing in the same
step; the fire clip hands the pose back on its own after its 250ms
without further input; and a respawn mid-hold clears the pose rather
than leaving it stuck. 341 passed, 0 failed. ASSET_VERSION to 7 and
game.js's own script version to v26, for the same reason as the last
two sprites.

assets/backgrounds/act1/tondo.png is now real commissioned art (1983x793, a painted
Tondo river-village scene, not a texture drawn to tile seamlessly) and
replaces the placeholder path the CSS and game.js previously pointed at
(Assets/Tondo.png, root). It lives in Assets/Act 1/ rather than
Assets/Prefab/, matching Nanay.png, since this backdrop is Act I's alone
(see Act data format). assets/backgrounds/act1/tondo-night.png was renamed to match
proactively, on the same reasoning, even though that file still does not
exist on this device (see TRACKER.md, Known problems) — dropping it in
later is now the only step left. checkBackgroundImage's two skyline calls
and both #skyline/#skyline-night background-image URLs were updated to
the new path; ASSET_VERSION to 8 for the same reason a new file under
Assets/ always bumps it.

(The seam shadow in the next paragraph is superseded by Mirrored backdrop
tiles, Block 26, below.)
#skyline tiles the backdrop horizontally (background-repeat: repeat-x,
background-size: auto 100%) to cover the world, which is much wider than
one copy of the art, and because the art is a real composition rather
than a seamless texture, each repeat leaves a visible seam. Rather than
hide or avoid the repeat, a new buildSkylineShadows() (game.js, called
from loadScene alongside the other build*() functions) places a
.tree-shadow div at each seam x, so the seam reads as a tree's long cast
shadow falling across the path — the same "clever reuse read as
diegetic" idea as reusing one sprite sheet as two named poses earlier in
this same run of sessions. The shadow is two CSS gradients combined with
background-blend-mode: multiply (a vertical taper and a horizontal
taper), not an image asset. Seam position is computed at scene load from
skyline.clientHeight (not a hardcoded pixel guess), using
SKYLINE_ASPECT = 1983/793 to convert the rendered height back into the
tile's actual on-screen width; this is deliberately a one-time-per-load
computation with no resize listener, matching that no other system in
this engine handles window resize either (see Pitfalls). The divs are
pushed to actElements, so unloadScene's existing cleanup removes them
with everything else the scene created — no separate lifecycle needed.

Macario was rendering behind Nanay (and would render behind any NPC,
guard, or decoration) because #player is a static, early child of
#world in index.html while every NPC/guard/decoration is appended into
#world later, at scene-load time, by loadScene's build*() calls; with
every one of them at the browser default z-index (auto), CSS resolves
the tie by DOM order, and later-appended always wins. Fixed with a single
declaration, #player { z-index: 1 }, which pulls Macario into a later
painted tier than all of them regardless of DOM order. Checked that
nothing in this engine relies on the old behavior first: inHideSpot()
(see Combat and stealth, above) is a pure logic flag consulted only by
guard detection math and has no visual effect of its own, so there is no
"Macario visually ducks behind cover" mechanic this could break.

Covered in _dev/tests/test.js, section AJ: #player's computed z-index is
positive; the skyline loads assets/backgrounds/act1/tondo.png without falling back
to the placeholder; buildSkylineShadows() places at least one
.tree-shadow div with an explicit position and width; and unloadScene
removes them. 346 passed, 0 failed. game.js's own script version to
v27, for the same reason as every other block that touches its code.

Act I is now two scenes and three quests, up from the one-NPC skeleton
it was reset to. Nanay sends Macario off to the entablado with
something to hand to the kutsero, a man Macario worked for as a boy;
the tondo scene's Nanay dialogue was rewritten around that errand
rather than restating the earlier Tondo/trade lines, and Macario is
cut off mid-sentence before the scene fades to a second scene,
"kutsero", where he finds only the kutsero's horse. This is a content
decision the proponents are authorized to make on their own (see
Content authority, in TRACKER.md's milestone section): the resource
person has left the storyline itself to them, faithful to the source
material's facts, and nothing in this pass invents a historical claim
the item bank does not already commit to — it is a scene-setting
errand, not a fact.

The engine gained the two pieces of support this needed, both general
rather than one-off. First, Acts.gotoScene now fades to black around
every scene change (fadeToScene, game.js) instead of swapping
instantly, reusing the same #blackout element and hold/fade timings
runNightTransition and runDeathSequence already used for the stage
cutscene, and setting cutscenePlaying for the duration so movement,
jumping, attacking and interacting are suppressed the same way they
already are mid-cutscene. This is gotoScene's only caller so far, so
there was no existing behavior to preserve; a future scene that
genuinely needs an instant cut would need its own path rather than an
option threaded through this one, since there is no second caller yet
to design that option against. Second, a scene may declare greyFilter
to desaturate #skyline
(see Act data format) — the kutsero scene reuses the same Tondo
backdrop rather than needing separate art for a scene that is really
the same street, moments later.

Kabayo (the kutsero's horse) is a static-image NPC, img:
"Assets/Horse.png", which does not exist yet and falls back to the
dashed placeholder box naming the file, same as every other missing
image in this project (see Icons). Talking to him adds a third quest,
"Bilhan ng mansanas ang kabayo" (buy the horse apples), via addQuest
called from his own onComplete rather than being in Act I's
startingQuests — a log entry for a quest the player has not
discovered yet would be a spoiler for nothing. That quest's objective,
bilhan_mansanas, has no flag anywhere in this pass: buying the apples
is not built yet, and leaving its flag unset is what keeps
checkObjectives from finishing Act I on two objectives out of three
rather than waiting for a beat that does not exist. The other two
objectives, kausapin_nanay and pumunta_trabaho, complete together, in
Nanay's onComplete, because in the story the trip to work starts the
moment that conversation ends rather than through a separate action.

Block 20 finished the kutsero scene Block 19 left half-built: the
world grew from 1176px to 2150px, Kabayo now sends Macario off with an
actual quest rather than a dead end ("Gutom ka na ba? Saglit lang ha,
bili muna akong mansanas"), and two new NPCs carry it — Kutsero
(x:750), a conversation that pays 10 barya through the currency
facade (Game.addCurrency, the same call acts.js uses to pay out
objectives), and Tindero (x:1950, opensShop: true), at the far edge of
the widened map, selling the pass's one new item: Mansanas, 5 barya,
+1 max health as an accessory, and — via buyFlag — the thing that
makes it legible to Kabayo's gift (see Act data format and Item data
format for opensShop, gift.onComplete and buyFlag, all three added
this pass). A hazard sits on the road between Kutsero and Tindero
(x:1300, width:100, "Natapakan mo ang bubog!"), the scene's first, and
is what makes it "dangerous" (see Act data format's derivation) and
shows the hearts. This is the same class of decision Block 19's was
(Content authority, TRACKER.md's milestone section): a scene-setting
errand, not a new historical claim, so it did not need the resource
person's source material in hand first.

Giving Kabayo the apple — the gift button, requiresFlag:
binilhAngMansanas — sets bilhanNgMansanasAngKabayo, the third and last
of Act I's three objectives, and its onComplete calls
Acts.gotoScene("tondo") to end the memory. THIS FINISHES ACT I: the
moment that flag lands, checkObjectives (called from every
saveProgress, game.js) sees all three objectives done and runs the
same finishAct — post-test, then complete(), then the transition
screen — any other act's last objective would. This was not asked for
explicitly; it is what asking for "the memory to complete and go back
to the previous map" necessarily does, given Act I's objectives array
already had exactly three entries (Block 19) and this pass supplies
the third's only flag-setter. If Act I is meant to continue past this
point — toward the entablado itself, say — a fourth objective would
need to exist before this quest could finish without also closing the
act; nothing here adds one, since the proponents did not ask for one
and the correct number of objectives is their call, not an engine
one.

Fixed in the same pass: Nanay's onComplete used to run
Acts.gotoScene("kutsero") unconditionally, which was harmless while
nothing ever returned to tondo. Kabayo's gift now does, so a second
approach to Nanay would have replayed her first dialogueSet (the
objective-completing one) and re-triggered the scene change — a loop,
and one guest mode could never break out of on its own, since
Acts.checkObjectives never runs without currentUserId. A firstTime
guard, read before her flags are set, keeps the scene change to the
first approach only; she just repeats herself on any visit after,
same as every other NPC with nothing new to say.

game.js's script version to v29, shell.js's to v9, inventory.js's to
v5, content/act1.js's to v14, content/items.js's to v4; no new
Assets/ file (Kutsero.png, Tindero.png and Mansanas.png are referenced
but do not exist on this device, so all three fall back to the dashed
placeholder box naming the file, same as Kabayo since Block 19), so
ASSET_VERSION stays at 8.

Verified two ways. First, the full existing suite, extended with a
new section (AK) covering opensShop/Game.onShopRequest, a gift's
onComplete, and an item's buyFlag against the fixture content: 354
passed, 0 failed. Second, _dev/tests/verify_new_scene.js (Block 19's
one-off, extended rather than replaced) drives the REAL content/act1.js
end to end: Nanay into the fade, Kabayo's quest, Kutsero's two lines
checked verbatim and the 10-barya payment (and its absence on a repeat
visit), the hazard costing a heart, Tindero opening Tindahan with no
dialogue box, Mansanas listed and bought (ownership, buyFlag, the 5
barya spent), the gift button appearing back at Kabayo, the fade back
to tondo with all three objectives done, and — the flagged consequence
above — Acts.status reaching "completed" and the transition screen
appearing after the post-test's feedback survey is answered. 24
passed, 0 failed. Not run on a phone.

Block 21, on direct feedback the same session: Block 20's flagged
consequence was wrong for the story being told. The kutsero scene is a
flashback — it plays out desaturated (greyFilter) precisely because it
is memory, not the present — and finishing a flashback must not finish
the act around it. Fixed with the fourth objective Block 20's own
write-up already named as the fix: pumunta_entablado ("Pumunta sa
entablado"), added to Act I's objectives with a flag,
nasaEntablado, that nothing in content/act1.js sets. This is the same
deliberate-gap trick Block 19 used to keep Act I from finishing on the
apple quest alone; it now keeps Act I from finishing on the flashback
alone. Kabayo's gift.onComplete now also calls addQuest for
pumunta_entablado, right before Acts.gotoScene("tondo"), so the quest
log shows the same open thread the objective counter now carries —
Macario is back in tondo, in the story's present, still on his way to
the entablado, with no content yet depicting arriving there.

Nothing else about Block 20 changed: Kutsero, Tindero, Mansanas, the
hazard, opensShop, gift.onComplete and buyFlag all stand exactly as
built. Only the objectives array and Kabayo's gift.onComplete moved.
content/act1.js's script version to v15; nothing else touched, so
game.js, shell.js, inventory.js, content/items.js and ASSET_VERSION
are unchanged from Block 20.

Verified by re-running the full suite unchanged (354 passed, 0 failed
— none of Block 21's changes touch anything the fixture-driven suite
exercises) and by rewriting _dev/tests/verify_new_scene.js's ending: it no
longer walks the post-test/transition flow at all, and instead asserts
the opposite of what Block 20 confirmed — Acts.objectivesFor(1).length
=== 4, Acts.countDone(1) === 3, a new pumunta_entablado quest logged
and undone, and Acts.status still "playing" (not "completed") with no
transition screen, a full two seconds after the flashback resolves.
26 passed, 0 failed. Not run on a phone.

Block 22, three fixes reported directly by the proponent playing the
game: a hitbox bug, a projectile draw-order bug, and a reclassification
of Mansanas.

findNearby() (game.js) used to compare posX (Macario's own left edge)
straight against an NPC's own left edge, npc.x, to decide whether he
was close enough to interact. That is an anchor-to-anchor distance,
not an edge-to-edge one, and Macario (40px wide, PLAYER_WIDTH) and an
NPC (roughly 80, the new NPC_WIDTH — .npc-sprite's own CSS width) are
not the same width: from Macario's left, npc.x already sits past the
NPC's own far edge, so the anchor distance undercounts how close he
truly is and the prompt fired early, well before contact; from his
right, npc.x is the NPC's NEAR edge, so the same math overcounts the
gap and nothing happened until his own body had nearly swallowed the
NPC's whole width — which is what read as "only works from the far
right of a thing." A new helper, edgeGap(aX, aWidth, bX, bWidth),
measures the real empty space between the two boxes instead (0 once
they overlap, never negative), and findNearby's own INTERACT_DISTANCE
(90, unchanged) is now compared against that instead of the raw
anchor distance — the same configured reach, applied consistently
regardless of which side Macario approaches from. Hazards were never
affected: updateHazards already compared a true centre
(posX + PLAYER_WIDTH / 2) against a hazard's own real bounds, which is
why it never showed this asymmetry — it was the model to fix NPCs
toward, not a second bug.

throwProjectile() (game.js) used posX + facing * 30 for the spawn
point regardless of which way Macario was facing. Facing left, posX
(his own left edge) is already his leading edge, so this correctly
spawned 30px clear of his own body; facing right, the same math
spawned only 30px past his left edge — still inside his 40px-wide
body (PLAYER_WIDTH) — so the throw started underneath him rather than
beside him. Invisible facing left, since nothing overlapped to reveal
it, and exactly why it "only" rendered behind him facing right:
.projectile (style.css) carries no z-index of its own, so it only
loses the stacking order to #player's explicit one (z-index: 1,
Block 18) where the two genuinely overlap on screen. Fixed at the
source — the spawn point now measures its 30px clearance
(PROJECTILE_SPAWN_GAP) from Macario's actual leading edge, posX +
PLAYER_WIDTH facing right or posX facing left, so it clears his body
either way — and reinforced defensively: .projectile now carries its
own z-index: 2, one above #player's, so an overlap that happens
anyway (Macario stepping back into his own throw, say) is still never
hidden behind him.

(The consumable model in the next paragraph is superseded by Block 25,
below: consumables no longer apply an effect while carried.)
Mansanas (content/items.js) was kind: "equipment", slot: "accessory" —
buyable, wearable, ownership permanent once bought. On direct
feedback: it should be "a unit type... rather than something you own
or wear... something you consume." It is now kind: "consumable", the
first of a new item kind (see Item data format, above, for the full
shape): no slot, so Inventory.equip()/toggle() refuse it outright and
shell.js's inventory screen shows it as owned rather than offering an
Isuot/Tanggalin toggle it has no slot to back; its +1 max health
applies the moment it is owned rather than needing an equip step
(Inventory.effects() now also sums any owned consumable's effect,
not only what is actually equipped); and Inventory.consume(id) — new —
is what actually uses it up: an optimistic ownedIds removal and a
player_inventory delete, rolled back on a failed write the same
shape buy() already rolls back its own. Kabayo's gift.onComplete
(content/act1.js) calls Inventory.consume("mansanas") the moment the
apple is actually handed over, so the +1 max health lasts exactly as
long as Macario is carrying it — bought and carried, worth a heart;
given away, worth 10 barya, a quest, and nothing further. This last
part is a judgement call rather than something the request settled
outright: a permanent stat-up potion (the bonus stays even after the
item is gone) would have been just as reasonable a reading of "you
consume it," and would have needed no new mechanism beyond this one
either — say so if the lasting version was intended instead.

game.js's script version to v30, style.css's to v19, inventory.js's
to v6, shell.js's to v10, content/items.js's to v5, content/act1.js's
to v16. No new Assets/ file, so ASSET_VERSION is unchanged at 8.

Verified by extending the full suite with a new section covering all
three fixes independently of any real content: a same-real-gap
symmetry check on findNearby (a 50px gap reaches identically from
either side of a test NPC; a 100px gap, past INTERACT_DISTANCE,
reaches from neither), a thrown projectile's spawn point confirmed to
clear Macario's own body on both facings plus its own z-index, and a
fixture consumable (gatas) bought, confirmed to apply its effect
immediately with no equip step, confirmed to refuse equip()/toggle(),
consumed with its effect and ownership both ending, and rolled back
correctly on a simulated failed write — 371 passed, 0 failed. Second,
_dev/tests/verify_new_scene.js, extended with two more checks on the real
Mansanas exchange: no longer owned and the +1 max health gone,
immediately after it is actually given to Kabayo — 28 passed, 0
failed. Not run on a phone, so the hitbox and throw fixes specifically
are unconfirmed on the touch controls and viewport this was actually
reported from.

Block 23 (superseded by Bodies, Block 24, below) corrected Block 22's projectile fix, which turned out to be
right about the mechanism (spawn from the leading edge, add a z-index)
but wrong about the width — it still visibly failed facing right,
exactly the report that reopened it, confirmed with a screenshot
before touching any code rather than guessed at from the source.

throwProjectile() (game.js) measured its leading edge as
posX + PLAYER_WIDTH facing right. PLAYER_WIDTH (40) is Macario's
LOGIC-side hitbox only — narrower on purpose than how wide he actually
renders, the same way a forgiving hitbox works in most games — and has
nothing to do with the visible <div class="player-sprite">, which
applyAnim() sizes to fit.displayFrameWidth (scaled off DISPLAY_HEIGHT,
134) and which measured well over 150px wide once a real sheet had
loaded. #player itself carries no CSS width of its own — only
`left`, set to posX every frame — so as a single-child flex column
its rendered box just wraps that sprite: left edge pinned to posX,
extending purely rightward from there, in EITHER facing direction,
since facing left only mirrors the artwork in place via
playerSpriteEl's own scaleX(-1) (applyAnim) — a transform, which
repaints pixels but never moves the element's layout box. So a
rightward throw needed to clear posX + the sprite's real rendered
width, not posX + 40; the Block 22 fix cleared the narrower bound and
still spawned deep inside the visible body. A leftward throw was
never wrong: the sprite never extends left of posX at all, so posX
itself was already past it.

Fixed by reading the actual rendered width at throw time —
playerSpriteEl.offsetWidth, not a constant — so this tracks whatever
sheet happens to be loaded (including a worn outfit's own sheets,
Inventory.applyOutfit) rather than drifting stale if the art changes
again; PROJECTILE_SPAWN_GAP (30) still adds its own clearance beyond
that. Falls back to PLAYER_WIDTH only if asked to throw before any
sheet has finished loading, when offsetWidth would read 0.

_dev/tests/test.js's own Section AL assertion was too weak to have caught
this: it checked the throw against posX + PLAYER_WIDTH, the same
narrower bound the buggy code used, so it could not fail regardless
of which fix was in place. Rewritten to check against
playerSpriteEl.offsetWidth instead — the box a player actually sees —
so it would have failed against the Block 22 version and now passes
against this one. game.js's script version to v31; _dev/tests/test.js is
dev-only and unversioned.

Verified with a one-off screenshot script (_dev/screenshot_throw.js,
not part of the shipped suite) driving the real index.html: before
the fix, a rightward throw's projectile sat entirely inside #player's
own rendered bounding box on screen; after, it lands clear of it —
matching what a screenshot actually shows, not just what the
coordinates say. Full suite re-run clean after the assertion rewrite:
371 passed, 0 failed.

Bodies (Block 24). Every character in the world is a body first and a
picture second. A body is a box on the ground whose left edge is the
character's x (posX, npc.x, guard.pos) and whose width is PLAYER_WIDTH
(40), NPC_WIDTH (80) or GUARD_WIDTH (40). The .entity element's own box
IS that body: mountBody (game.js) sets its left, width and height, and
style.css no longer lets it size itself to its content. The art inside
is absolutely positioned by one function, bodySprite, which scales it
through spriteFit, puts the sheet's footX on the middle of the body,
and sets transform-origin to that same point so a facing flip mirrors
the character about his own feet. bodyPlaceholder does the same for a
missing image. Player, NPCs, guards and decorations all go through
these; a second copy of that arithmetic anywhere is how the picture and
the logic drifted apart in the first place.

What it replaced: #player was a flex column wrapping a sprite element
the size of a whole scaled sheet cell (324px for the idle sheet),
pinned to posX on its left, with the character drawn in the middle of
the cell. The logic box shared only the left edge, so Macario's drawn
feet stood about 140px right of every collision. The reported symptom
was a hazard that did not hurt while he stood on it and did hurt once
he was drawn past it. Blocks 22 and 23 had already corrected the throw
against this twice, each against a different wrong width, without
finding it. The request was for an overhaul rather than a third
offset, and a single place where picture and body are made to agree is
what that means.

Two collision rules, applied everywhere. Harm is by overlap: a hazard
hurts while any part of the body is over its band. Support and cover
are by centre: a platform holds, a hide spot hides and a pickup is
reached by the middle of the body. Harm by overlap matches what a
student sees (a foot on the glass); support by centre matches it too
(standing half off a ledge does not drop him). Guard detection, melee
and the spear's hit test measure centre to centre, which with equal
guard and player widths leaves their reach numerically where it was.
The throw spawns PROJECTILE_SPAWN_GAP past the body's leading edge,
and a leftward throw also steps back by PROJECTILE_SIZE so the whole
ball clears; reading the sprite element's offsetWidth (Block 23) is
gone, since that element's width no longer says anything about where
he is.

The body widths were kept, not re-derived from the art. 40 is close to
the idle drawing's measured width at display scale (48) and narrower
than the walk cycle's stride, which is the forgiving direction for
harm, and keeping it left every tuned distance (INTERACT_DISTANCE,
MELEE_RANGE, the knockback, the hide spots) meaning what it meant. A
body does not change width with the animation, on purpose: a hitbox
that grew mid-stride would take a heart for walking past a hazard's
edge.

The visible consequence is that NPCs moved: art that used to hang to
the right of x now stands centred on x + 40, so Nanay is drawn about
60px left of where she was and a placeholder NPC about 7px. Content x
values were not adjusted to compensate, since the new position is the
one that matches the reach.

The harness checks this in pixels (section AM): the player is
screenshotted shown and hidden, the changed columns are where he is
drawn, and those are compared against his body in world coordinates,
with CSS animations frozen so a bobbing pickup does not read as part
of him. A check written against style values would have passed the
old model, which is the lesson Block 23's assertion already taught.

Inventory and shop (Block 25). Requested as an overhaul for polish, with
three explicit rules: permanent items worn in Sandata, Anting-anting and
Damit; consumables like an apple that are used up instead; and Tindahan
removed from the inventory screen and Imbentaryo removed from the pause
menu.

One door each. The inventory opens only from #btn-inventory, the shop
only from #btn-shop or an opensShop NPC. With the pause-menu and
inventory-to-shop doors gone, shell.js no longer tracks which door was
used (invReturn and shopReturn are deleted): opening pauses the world and
back resumes it, always.

Both are wide panels with the same anatomy, because a phone held sideways
has width and no height: a header with the title, a coin balance chip and
Bumalik (so back never scrolls away), then a list on the left and the
selected item on the right. The inventory list is the three slots and one
grid of owned tiles, ordered permanent, consumable, quest, with a corner
badge (Nakasuot, a count, Misyon) instead of three headed sections, which
did not fit the height. The detail pane shows the picture, the name, a
kind chip, the description, what the item does in Tagalog
(Inventory.effectLines) and the one action the item allows: Isuot or
Tanggalin, Gamitin, or for a quest item a line of text and no button. The
shop's pane carries Bilhin with the price. A disabled action says why on
the button itself (Kulang na barya, Nasa iyo na, Puno ang supot, Buo ang
iyong puso) rather than just greying out.

Selecting and acting are two taps, on purpose. Before, tapping an
inventory row wore it and tapping a shop row bought it. A Grade 8
student tapping to find out what something is must not eat the last
apple or spend their barya doing so, and the detail pane is where what
will happen is explained before it happens.

Consumables do their one thing when used, and nothing while carried.
Block 22's "+1 max health while owned" is gone: with stacking, carrying
five apples would have meant five extra hearts and made hoarding the
point. Stacks are capped (default 5) for the same reason. Heal is
refused at full health rather than wasted. A heal is applied to the
engine before its write and is not undone if the write fails; the unit
is put back instead, since a heart that reappears and then vanishes
reads as damage.

Two apples, not one, at the proponent's direction. "mansanas" is now the
consumable a student eats. The horse's apple is its own quest item,
"mansanas-kabayo" (Mansanas para sa kabayo), so eating apples can never
use up the one the quest needs, and the screen says plainly which one
is the errand. Reusing the "mansanas" id for a different item breaks the
never-reuse rule above: a test save that bought the old apple resumes
owning the food apple with binilhAngMansanas set. No study account has
played the kutsero scene, so db/scripts/reset_test_accounts.sql was the whole
remedy; the rule stands for every id after this.

Guests get the whole system in memory. Every inventory write path used
to return early without currentUserId, which meant a guest could never
buy the horse's apple and could not finish the kutsero scene. Now
inventory.js distinguishes "can play" (signed in or guest) from "can
write" (signed in), and a guest's items vanish with the tab like the rest
of a guest's play.

No schema change. Stacks use player_inventory.quantity and its update
policy, both in schema v3, and reset_my_play_data() already deletes the
row whatever it holds. The engine gained Game.health() and Game.heal(n),
numbers in and out, so game.js still never learns what an item is.

No permanent items ship. The catalogue's equipment was cleared with the
Act I reset for want of source material, and nothing in this block puts
invented equipment back; the slots render empty and say so. The harness
fixture carries two equipment items, two outfits, a consumable and a
quest item, so every path is covered regardless.

Mirrored backdrop tiles (Block 26). The tree shadow (Block 18) was
reported as ugly: at the phone's zoom it was a dark vertical post in the
middle of the scene, and it only covered the seam rather than removing
it. buildSkylineShadows and .tree-shadow are deleted.

buildSkylineTiles (game.js, called from loadScene where the shadows
were) lays the backdrop out as absolutely positioned tiles inside
#skyline and #skyline-night, each exactly one image wide at the layer's
rendered height, with every second tile flipped by scaleX(-1). A flipped
copy meets its neighbour at the same column of the painting on both
sides, so the join is continuous at both of the image's edges, with no
art edited and no new asset. The alternatives were tried on the real
image before choosing: plain repeat jumps in the clouds and water; a
crossfade over an overlap ghosts palms and huts through each other;
mirroring's only cost is a symmetry, which in a row of stilt houses
reads as more village.

Details that are load bearing. Each layer names its picture once in a
custom property, --skyline-src, which the tiles read, so one function
serves day and night and the night art needs no code when it lands. The
layer's own repeat-x background stays until the tiles exist and is then
switched off by .skyline-tiled, so the backdrop is never blank for a
frame, and checkBackgroundImage still has a real background to replace
if the file is missing. Tile widths are rounded to whole pixels and each
tile overlaps the next by one, because two fractional edges can show a
hairline of sky, and the overlap is invisible precisely because the
mirrored columns match. greyFilter is a filter on #skyline, so it still
greys every tile inside it.

Section AJ checks it in pixels: with everything in front of the backdrop
hidden and the camera on the first seam, the columns either side of the
join must differ no more than columns either side of nearby points in the
same painting. The same check fails against unmirrored tiles (about twice
the nearby difference), so it can tell a seam from no seam.

Melee clip and Kutsero's art (Block 27; the Kutsero sheet turned out to be
the Tindero's, see Block 33). Two commissioned sheets
arrived: assets/sprites/player/macario-melee.png (4 by 3, 12 frames, a punch)
and assets/sprites/characters/kutsero.png (5 by 3, 14 frames, a front-facing idle).
Both were measured with measure-sprite.js. The melee sheet is a PNG with
transparency saved under a .jpg name; browsers decode by content, so it
is referenced as delivered, and renaming it later means changing the src
in BASE_SPRITE_SHEETS.melee and bumping ASSET_VERSION.

A tap on Atake now plays the punch (playMelee, 12 frames at 24fps, half a
second) through the same shooting variable and hand-back timer the fire
clip uses, so every existing reset path already clears it. (Superseded
by Block 71, which moved the hit onto the contact frame.) The hit still
lands on release, not on the punch's contact frame: making gameplay wait
for the art would add a quarter second of lag to a one-tap attack and
break nothing visible enough to be worth it.

The aim pose no longer appears the instant the button goes down. It waits
AIM_POSE_DELAY_MS (150), switched on by updateAttackHoldPose from the game
loop, because with a punch to play on release every tap would otherwise
flash the aiming arm first. ATTACK_HOLD_MS (400) alone still decides
whether a release is a punch or a throw; the delay only decides what is
drawn while the button is down.

Kutsero changed from a static img (a placeholder, since the file never
existed) to an animation def in content/act1.js, which is all an NPC
needs to go through bodySprite. ASSET_VERSION to 9.

The redrawn shooting sheet (Block 28). assets/sprites/player/macario-shoot.png
was replaced with a 5 by 3 sheet of 12 frames, the muzzle flash on frame 4
counting from one (index 3). shootAim is now frames 0-2, held on 2;
shootFire is 3-11 at 18fps, half a second, and starts on the flash so the
flash and the projectile appear together. Remeasured: contentTop 63,
contentHeight 126 (the union, which includes the pistol lifted in recoil;
a tighter pair would crop the gun in frames 5-7), footX 117.

A sheet may now declare muzzle: { x, y }, in native cell pixels, and
throwProjectile starts the shot there: forward of the feet by
(muzzle.x - footX) and above them by (contentTop + contentHeight -
muzzle.y), both scaled by spriteFit, mirrored for facing left. It never
spawns nearer the body than the plain PROJECTILE_SPAWN_GAP point, so a
future sheet with a short reach cannot put the shot inside Macario.
Measured from the pistol's tip in frame 2: x 178, y 87. Without muzzle
the old spawn (body edge plus the gap, 60px up) applies. ASSET_VERSION
to 10.

Pixel theme (Block 29). Requested directly: the chrome read as rounded,
glossy and 3D beside pixel-art sprites and a pixel-art backdrop, and the
text as plain. The whole interface was restyled as a flat 16-bit window
set, in one section of style.css ("PIXEL THEME") placed after the rules
it overrides and before the touch-target block, which stays last. It
sets no width, height or min-height on anything tappable, so every
on-glass size the harness measures is unchanged.

The rules: square corners everywhere; flat fills, no gradients, glows or
blurred shadows; depth only as a hard offset shadow or a solid 4px darker
band along a button's bottom edge, removed with a 2px drop on press;
windows outlined twice, a wood frame inside a near-black ink line. The
Block 16 palette is kept, since it already matches the painted art.
Gameplay colours keep their literals; only shapes changed, which is why
the hearts are now pixel hearts cut with clip-path (outlined by stacked
drop-shadows on #hud-hearts, and an empty heart is a dark heart rather
than a hollow square, because a clipped shape cannot carry a border).

Two pixel faces, chosen by rendering ten candidates with the game's own
words: Press Start 2P for titles only, VT323 for everything read. VT323
was the only face that kept B apart from 8 and 5 apart from S at body
sizes with clear word spacing; Pixelify Sans was built first and failed
both, which matters for Grade 8 students reading Tagalog on a small
screen. VT323 is small for its nominal size, so every text size in the
theme is about a third larger than the rule it replaces, including the
text-size setting's small and large variants, which the theme restates.
font-synthesis: none stops a smeared fake bold on single-weight faces.

The fonts are self-hosted in Assets/Fonts (woff2, latin subsets, their
SIL Open Font License files beside them), not loaded from Google Fonts: a
phone on patchy data or a school network blocking the font CDN would
otherwise fall back to Courier, which is the plain look this replaced.
Section AN checks both faces actually load from there.

The dialogue prompt is now Tagalog ("I-tap o pindutin ang E") with a
blinking arrow drawn in CSS borders, since it was the one English line
left on a player-facing screen.

Audio (Block 30). Requested with the first sound files: Calm.mp3 as the
default background music, Gun_Shot.mp3 on firing, and Horse.mp3 playing
while Macario is near Kabayo, whose 22-frame strip (Assets/Act 1/
Horse.png) arrived at the same time. Intense.mp3 is in Assets/Prefab and
deliberately unused until a scene is written that calls for it.

Three sounds, three mechanisms, each chosen for the target phone. Music
is one <audio> element, streamed as it plays; decoding a two minute
track through Web Audio would hold about 40MB of samples. The gunshot is
a Web Audio buffer, fetched and decoded at parse time, because an
<audio> element on Android Chrome can start late enough to be heard
after the muzzle flash; a plain <audio> is the fallback when Web Audio
is missing or the decode fails. A character's ambience is its nearSound
(Act data format), one looping <audio> element per file, eased in and
out by updateNearSounds from the top of the game loop.

What plays when. Music starts right after Shell.awaitEntry in both entry
paths, because the title tap is the gesture a browser requires before
sound; if play() is refused anyway, the next touch or key retries. It
keeps playing behind pause, inventory, shop and settings, since a menu
that goes silent reads as a crash, and it plays under the trivia card and
the tests too, at 0.35 volume. Ambience stops while the world is stopped
(paused, a screen open, logged out) because the thing making the noise is
part of that world. A hidden tab silences everything, since Chrome does
not do that reliably on every Android build. The gunshot is played from
throwProjectile after its one-in-flight guard, so a release that throws
nothing makes no sound, and it lands in the same step as the flash
because endAttackHold calls throwProjectile and playShootFire together.

Two switches in settings, Musika and Mga tunog, each Bukas or Patay, in
the same localStorage object as text size and on by default. Switches
rather than a slider: in a classroom the question is whether a phone
makes noise at all. shell.js owns the choice and hands the engine two
booleans through Game.setAudio at start-up and on every change; game.js
owns what they silence. A stored value from before this block has
neither key and keeps both on.

Section AO covers it by counting what the engine asks the browser to
play, since a headless browser cannot listen: buffers started and
<audio> play() calls are spied on, so the fallback path cannot pass a
check silently. Two of its checks were run against deliberately broken
copies (no gunshot call, no release band) to confirm they fail.

Conversations around the memory (Block 31). Requested as script: Nanay's
voice opening the flashback, Macario back beside her for her reply when
it ends, a Mananahi down the road asking to be paid for his stage
costume, and a new first line for Nanay about his money.

The two lines nobody walks up to needed an engine piece, arrivalDialogues
(Act data format), rather than an NPC placed out of sight to be talked
to. It lives in fadeToScene, the one path that changes scene inside an
act: the conversation is chosen and Macario placed under the blackout,
and it opens only after the fade-in, so the first line is read against
the scene it belongs to. Its once-only rule is a flag in state.flags,
the same persistence objectives already use, and not a field on the
scene, which is rebuilt from content on every load.

Returning to tondo exposed a fault Block 20 had only worked around:
buildNpcs resets every NPC's stage to 0, so talking to Nanay after the
memory replayed her errand. The firstTime guard stopped the scene change
but not the lines. skipIfFlag fixes the cause, reading the flag at the
moment a conversation starts, so a reload lands on the same set.

tondo grew from one screen to 2150px, the kutsero scene's width, for the
road. The Mananahi is hidden until the apple is given to Kabayo, which
is set before the fade back, so buildNpcs draws her when tondo is
rebuilt; revealNpcsByFlag is not needed and still runs only where it did.
Her art does not exist yet (assets/sprites/characters/mananahi.png). Her last line
asks for payment, and nothing is built behind it yet: no item, no
objective. The dialogue speaker was "Mana", as written, until Block 42
made it "Mananahi" to match the guide's label for her.

The first equipment (Block 32). Requested as script and mechanics: Nanay
hands Macario 200 barya with his money line, the return conversation
ends with her reminding him to see the Mananahi (a quest), and the
Mananahi sells his stage clothes for 100, which slow a guard's notice
while he stands still. Nanay's opening was rewritten by the proponent in
the same pass so the kutsero is still what starts the memory.

Worn in Damit, not Anting-anting, because it is clothing, which meant
letting equipment take the outfit slot. Nothing in inventory.js tied a
kind to a slot, so that was a documentation change plus effectLines,
not a code path.

The shop needed stock per seller, or the clothes would have appeared on
the corner button everywhere and on Tindero's stall inside the memory.
soldBy is the smallest form of that: one optional field, and the corner
button and Tindero behave exactly as they did.

The quest completes when the Mananahi's conversation ends, not on the
purchase. Kausapin ang mananahi is an objective, and making an objective
wait on spending barya would put the act behind a purchase a struggling
student might not afford, which is what the no-game-over rule and the
outfit prices were set against. In Act I as shipped the student cannot
be short: 200 from Nanay, 10 from Kutsero, and at most 30 in apples.

0.5 is chosen, not measured, like the score budgets. Act I has no guard,
so the effect cannot yet be seen in shipped content; section AQ proves it
against the fixture guard by driving updateGuards directly.

The fifth objective changes Act I's drip to floor(50 / 5) = 10 a
objective, which is what the fixture act already used.

Art sorted out (Block 33). The sheet shipped as Kutsero.png in Block 27
was the Tindero, misnamed. The artist renamed it Tindero.png and delivered
the real kutsero (straw hat, sash) as Kutsero.png: 5 by 3, 12 frames,
contentTop 74, contentHeight 117, footX 128. Tindero's sheet was
remeasured and is unchanged (14 frames, 69, 121, 128); he is now an
animation def instead of a missing static img. The pitfall this is an
instance of: a file name is not evidence of what is drawn in it, so a
new sheet is looked at, not only measured.

The ground is assets/backgrounds/act1/ground-lupa.jpg, replacing the Cement_Tile.png the
CSS had named since before any art existed. It is a 447px seamless
texture (edge columns differ from each other by about as much as any two
neighbouring columns), drawn at 120px rather than the old 30px tile size
so its blotches stay visible. With real ground under a greyed memory
the road was still brown, so greyFilter now greys #ground-tiles along
with #skyline. Characters stay in colour, as they always have.
ASSET_VERSION to 12, which also stops phones serving the old picture
cached under Kutsero.png.

The entablado (Block 34). Two pictures arrived: Entablado_Labas.png, the
outside of the stage on a transparent background, and Entablado.png, one
painting of the inside. The request was the outside in the first scene
and, on interacting with it, a room with the inside as its background,
like the flashback.

The outside is a decoration at x 2400 at the end of the tondo road, which
grew from 2150 to 2900 so the building clears the Mananahi. It is drawn
400px tall, about three people, measured with measure-sprite.js like any
sheet (contentTop 14, contentHeight 914, footX 835). The door is an exit
over its stairs. The inside is scene "entablado", one phone screen wide,
with backdrop and ground: false.

Three engine pieces, each the smallest that did the job. The skyline had
one picture for every scene, set in CSS; a scene's backdrop now sets the
same --skyline-src custom property the tiles already read, so the day
and night layers and greyFilter needed no change. Tiling had to be
skipped for it, since a mirrored second stage beside the first reads as
a mistake where a mirrored stilt house does not. Interacting with scenery
had no mechanism, and the existing STAGE object is the performance
cutscene, not a door, so exits are their own small list rather than a
flag bent onto an NPC or the stage. And gotoScene took no position,
which would have returned Macario to the start of the road; it now takes
an optional { x, facing }.

A way back out, Lumabas at the room's left edge, was added although it
was not asked for: without it a student who walks in is stuck in a room
with nothing in it until the entablado has content. Going in sets no
flag, so pumunta_entablado stays open and Act I does not finish.

The moro-moro (Block 35). The proponent delivered a jump sheet and the
Muslim girl's sheet with the scene's script: the love scene on the
entablado, a man walking on from the right, and a fight with at least
five enemies, placeholders for now.

The jump is three named views of one sheet, chosen from velY rather than
from a timer, so a short hop and a long fall both look right and the jump
itself still happens the instant the button is pressed (the crouch frames
are not played; waiting for them would add lag to the one control a
student presses most). Landing holds frame 8 for LAND_POSE_MS, measured
by the speed he lands at so stepping down a ramp is not a landing.
frameBottoms, above, is what keeps the tucked frames on his body.

The scene is written as an async function in content/act1.js out of seven
plain calls (above). The alternative was a cutscene format in the engine,
in data, which would have to grow a case for every beat a later scene
wants; a content file that awaits a few small calls can already express
anything those cases would.

Combat is its own list, not a mode on guards. A guard's rules are the
stealth rules, where a swing from the front is a mistake that costs a
heart, and a fight where attacking is punished is not a fight. What they
share is what should be shared: the same body, the same difficulty
multiplier, the same damagePlayer and the same meter element.

The pacing numbers are chosen, not measured, like the score budgets: 2
points each, 700ms before the first swing, 1800ms between swings, a 350ms
warning. Five enemies queue rather than stack, so only the one in front
is swinging. All of it is worth re-tuning the first time a Grade 8
student plays it on a phone.

Two things about this content the proponents should decide before the
pilot, not the engine: the man is called Muslim on screen, which is what
the file was named, and his last line calls Maryam a puta. That is the
script as given, and the game is played by Grade 8 students in a
classroom with a teacher present.

Performance (Block 36). Reported as the game getting laggy once the
entablado and the fight were in. Measured rather than guessed, with
Chrome's own counters (layout count, style recalculation, script time)
over four seconds of play at a sixth of this machine's speed, and with
the DOM writes the loop makes per frame counted directly.

What it found, per frame: the interact button's label was written every
frame whether or not the word changed, which dirties the element; the
camera read viewport.clientWidth back from the layout after the frame's
own writes, which forces the browser to lay the whole world out again to
answer; the player's left and bottom and the camera transform were
written every frame even when nothing had moved; the world element was a
fixed 4400px whatever the scene was, so the backdrop, ground and every
layer over them were painted at that width in a room one screen wide;
the night backdrop was tiled at every scene load although no shipped
scene turns to night; and every music swap threw the old element away, so
coming back to Calm downloaded two megabytes again.

Standing in tondo went from 243 layouts in four seconds to none at all,
walking from 482 to 242, and the five-enemy fight from 604 to 301, with
layout time down by two thirds in each. Section AT holds those where
they are by counting the writes rather than by timing anything, since a
timing check on a build machine says nothing about a phone.

What was NOT done, and why: paint and raster could not be measured
honestly here (a headless browser's compositor is not a phone's), so
nothing was changed on a guess about them. It turned out not to be
needed. The proponent confirmed the phone runs smoothly after this
block, which closes the report. If speed is ever a question again, the
next levers in order are the size of the backdrop art, the mirrored
tiles' paint area, and the grayscale filter in the flashback, each
measured on the device first.

The same report noted that the animation looks slightly uneven on a PC.
That was left alone by decision: the target device is a phone, where it
is smooth, and the desktop camera is zoomed in 1.75 against the phone's
0.7, which magnifies anything imperfect. The likely cause is sprite
frames being stepped against a clock tuned for a 60Hz screen on a
monitor that refreshes faster; smoothing that would trade real
simplicity in the animator for a machine no student plays on.

After the play, the Katipunan, and the pamphlets (Block 37). Requested as
a placeholder for the rest of Act I: Maryam ends the moro-moro by
announcing the Christian kingdom's victory, her conversion and her
marriage to Macario, with the audience cheering in dialogue only; outside,
Bonifacio and a second Katipunero greet him and speak in code, and give
him a task; the road leads on to a second street on the same backdrop,
where he hands pamphlets to three people past guards who shoot, with his
own gun taken away, the stage clothes' effect working, and two or three
varied platforms to stay out of sight.

The whole script is a placeholder written ahead of the source book, and
says so at the top of the script block in content/act1.js. Three things
in it read as fact and must be checked against the book before the
pilot: the password exchange (Anak ng Bayan, and the dilim and liwanag
lines), that Bonifacio himself met Sakay after a performance, and what
the pamphlets were. The second Katipunero is unnamed for the same
reason.

The last pamphlet finishes Act I and runs the post-test, at the
proponent's direction. The end of the play now sets nasaEntablado, so
all seven objectives have flag-setters for the first time. Seven
objectives make the drip floor(50 / 7) = 7 a objective. A save that won
the fight before this block walks into the ending instead of nothing: a
second arrival dialogue on the entablado requires nagapiAngMgaGuwardiya
and uses nasaEntablado itself as its doneFlag, so the ending plays once
however it is reached.

The meeting outside opens by itself on the fade out of the entablado
(arrivalDialogues). Bonifacio carries the same lines as his first
dialogue set, skipped once nakausapAngKatipunan is set, because an
arrival plays only through a fade and a student who reloads before it
would otherwise have nobody to get the task from.

The pamphlets are three gifts (Iabot ang polyeto), the mechanism Kabayo's
apple already uses, rather than an inventory item: a quest item is one of
a kind by definition, and a stack of three would have meant a new item
rule for a placeholder. givePamphlet counts all three flags rather than
adding one, so the order does not matter and a reload cannot miscount,
and rewrites the quest line through setQuestText, the one new global.

Guards that shoot. (Superseded in part by Block 38: a full meter now turns
a guard hostile rather than firing once, and detections count on the
turn.) The request was that guards can shoot; the smallest
honest version is that a full meter is a shot instead of a catch. The
bullet is visible and slow enough to see (9 px a frame), travels at chest
height the way he faces, and can be jumped, passes under a student on a
platform, and runs out past detectRadius plus 120. A hit costs one heart
and knocks Macario on the way the bullet was going, like the glass on the
road, rather than sending him to the start; a catch sending him back
works on a short corridor, and this road is 7200px. Being shot at is
where detections is counted, once per shot. The meter holds red until the
1.5s cooldown lets him fire again. The gunshot sound is the one Macario's
own pistol uses.

Sight from a platform. Platforms were one-way ledges with no stealth
meaning, and the request was platforms to avoid sight. The rule is the
simplest one a student can see: standing on anything 60 or more above the
floor is off the road a guard is watching. Only while standing, so a hop
in front of a guard is not a way through. The guard's sight is now drawn
on the road for the same reason the meter is drawn: a placeholder box has
no front, and a mechanic learned without a tutorial has to be visible.
Real guard art turns with his facing; a placeholder does not, so its
filename stays readable.

The stage clothes. (Block 38 raised the effect to 0.2, about 7s.)
stillDetectionMult was built in Block 32 against a
fixture guard because Act I had none. The second guard's stretch is laid
out for it: a student who freezes as he walks toward them is passed in
about 2.4s, the meter takes about 2.8s to fill while standing still in
the clothes and 1.4s without. The Katipunero says so in the briefing, and
verify_new_scene.js checks it against the real guard, not the fixture.

No gun. A scene declares noRanged, and a long hold punches instead of
aiming and throwing, with a toast saying why, so the button never goes
dead. The alternative, hiding Atake's hold, would have left a student
pressing a button that does something in every other scene and nothing
here without a word.

Checkpoints. Running out of hearts on a 7200px road would send a student
back past work already done, which is what the no-game-over rule is
against. A scene's checkpoints name story flags already being set (the
first and second pamphlet), so no new save state exists for them.

Exits may wait on a flag (requiresFlag), because the road out of tondo
should not open before anyone has given Macario a reason to take it.

Art. The moro-moro's guards share the man's sprite at the proponent's
direction (Muslim.png then; his real walk and attack sheets since Block
40); there is no Guwardiya.png. The street's guards are
the town's rather than his, so they have their own placeholder,
Bantay.png. Bonifacio.png, Katipunero.png and Mamamayan.png (shared by
the three citizens) are placeholders too. No new file was added under
Assets/, so ASSET_VERSION is unchanged.

Tuning, all chosen and none measured, like every number of its kind:
guard radii of 200 to 300, a 1.5s shot cooldown, 60 of platform height
for cover, and a road 7200px long. Judge them on a phone.

Hostile guards, and a stronger disguise (Block 38). Reported after
playing Block 37: a guard who fired once and went back to watching read
as one who had forgotten what he saw, and the stage clothes' effect was
visible but not convincing. The request was the ordinary game behaviour,
detected then hostile.

A shooting guard whose meter fills is now hostile until one of two
things happens: he is put down, or Macario runs out of hearts and every
guard goes back to his post. While hostile he ignores his patrol and his
sight, faces Macario wherever he is, runs at him at GUARD_CHASE_SPEED
(2.6, about half Macario's), stops at GUARD_HOLD_DISTANCE (170) and
fires every GUARD_SHOT_COOLDOWN_MS (1300), the first shot GUARD_AIM_MS
(450) after he turns. He does not give up on distance: that is the
"back to looking" the proponent ruled out. Running still works because he
is slower, and a platform or a jump still gets over his bullets, so no
chase is unwinnable.

Because he always faces Macario, a takedown from behind is impossible
once he is hostile, so a punch on a hostile guard is now a hit rather
than a mistake: he has hp (2 by default, like the moro-moro's guards),
each punch knocks him back and delays his next shot, and the second puts
him down. A punch from the front on a guard who has not yet seen Macario
still costs a heart, and now also turns him hostile.

detections is counted once, on the turn, not per shot, which is what the
stealth term measures: how often he was seen, not how long a chase ran.

The stage clothes go from 0.5 to 0.2, five times slower: about 7 seconds
in plain sight standing still instead of 1.4, so a patrol walking toward
a frozen student passes him every time. Two things make it visible rather
than a number on trust: the meter is pale blue whenever the clothes are
what is holding it back, and the first time in a scene a toast says why
("Artista lang ang tingin niya sa iyo."). The item's line now says how
much, "5× na mas mabagal", computed from the value. Once a guard is
hostile the clothes do nothing, since he already knows.

The first-time toast is remembered on the scene object for the session,
not saved, and costs nothing if it repeats after a reload.

The teacher dashboard restyled (Block 39). Requested as making it more
professional. It is now a light report page rather than the old gold on
black: teachers read tables of numbers on school laptops and projectors,
where dark text on a light page reads best, and the game's wood and
green survive only as accents so the two pages still belong together.
The pixel theme was not carried over for the same reason.

What it shows: the class name, six summary figures (students, started,
finished Act I, and average pre-test, post-test and gain), each with the
n it was averaged over, because an average over three students and one
over forty otherwise read the same; and one roster row per student with
Act I's status as a pill, objectives done, both scores as a percentage
over the raw score, gain, performance, play time and last activity. The
status, objectives and play time come from act_progress columns the
dashboard's existing query can already read (schema v4), so no query was
added and none was widened. The four scoped queries and the no-chart
rule both stand.

Search and sort work on rows already fetched. Missing values sort last
in either direction, so sorting by score shows scores first. A refresh
button reruns the same load. The performance formula is printed under
the table, since an instructor will ask what the number is.

Every value is written as text, never as HTML: a student's name is
whatever was typed into a profile. _dev/tests/sb-stub.js learned .in() and
the classes and assessment_scores tables so section AV can drive the
page; before this block the dashboard had no coverage at all.

The man in the moro-moro gets real art (Block 40). Two sheets arrived in
Assets/Act 1: Muslim_Walk.jpg (4 by 3, 12 frames) and Muslim_Attack.jpg
(4 by 4, 15 frames, a sword swing). Both are true JPEGs on black, not
PNGs under a .jpg name like Macario_Melee.jpg, so they were keyed to
Muslim_Walk.png and Muslim_Attack.png with _dev/tools/key-black.py and the
originals kept. The flood runs from each cell's edges through near-black
only, because his hair and vest are nearly black too and a plain colour
key would have punched holes in him.

Measured with measure-sprite.js. The walk is clean: contentTop 43,
contentHeight 70, footX 72. The attack is not: the sword crosses into
neighbouring cells, so its union box is the whole cell and useless. Its
numbers are the standing body instead, top 30 and feet at 126 in frames
0 to 3, so contentHeight 97, footX 88 from the standing feet, and
headroom 29 so the raised sword shows without the one stray row that
frame 5's blade leaks into the top of frame 9. Below the feet the blade
is cut at the floor line, which reads as the tip at the ground.

He is the one character who walks on and stands to talk with only a
walk sheet, which needed walkOnly and faceMovement on decorations. His
five guards share both sheets, as decided in Block 37, which needed
attackAnimation on enemies: a second sprite inside the same body,
swapped in on the change rather than rewritten every frame. The swap
starts with the telegraph, so the wind-up the student is taught to
watch for is now the sword going back, not only the flash.
setupNpcAnimation gained an optional playing() gate and loop: false for
both. The street's Bantay guards are the town's, not his, and keep their
own placeholder. ASSET_VERSION to 15.

Stand-in stills for the remaining placeholders (Block 41). Requested:
PNG sprites for everything still drawn as a dashed box, in the style of
the existing art, still frames acceptable. Nothing could be drawn from
scratch in that painted style at that quality, so each is a frame of a
commissioned sheet recoloured and given a prop, which keeps the
artist's outline, shading and proportions: Bonifacio is the Tindero in
white camisa and red trousers and sash; the Katipunero is the Kutsero in
red; the townspeople are the Kutsero in faded blue; the guardia civil is
the Tindero in navy with a kepi and a rifle; the Mananahi is Nanay with
a green tapis, a maroon skirt and a tape measure. The apple and the
stage clothes' tile are 32px pixel drawings scaled up nearest neighbour.

_dev/tools/make-placeholder-sprites.py builds all seven, so the choices are
reproducible and adjustable rather than baked into files. Each
character is one 256px frame in the sheet's own cell, measured with
measure-sprite.js and declared in a STILL table in content/act1.js as
an animation def with frames: 1, which is what puts it through
bodySprite like every other character; a static img NPC would not be
scaled to DISPLAY_HEIGHT or stood on its feet. Bantay's footX is set to
the body's 128 by hand, because his rifle butt sits in the rows
measure-sprite.js averages.

They are stand-ins, and say so in the content and in TRACKER.md. They
read as relations of the characters they came from, which is fine for
a pilot and not what a finished game should ship. Real art replaces
each one by overwriting the file and updating its STILL entry.
ASSET_VERSION to 16.

The guide, the cone and a longer street (Block 42). Requested as
improving Act I without changing its story: consistency, a way for
students to know where to go, a cone rather than a line for a guard's
sight, and ten citizens with more guards on the pamphlet street. Asked
and answered before building: a guide arrow rather than a practice area
or first-time control hints; a low cone under the existing rules rather
than true cone detection; and a street of about 11000px.

The guide is an arrow, not a tutorial, on purpose. The quest log already
says what to do; what was missing was where, on roads up to 11000px long
at a zoom that shows a few hundred of them. A practice area would have
cost minutes of a one-hour session that also holds both tests. The
engine reads the act's guide list (Act data format) and never learns
what a goal means, the same line it holds everywhere else. It is hidden
whenever a student could not act on it, and like the rest of the loop it
writes to the page only when what it shows changes (Block 36); section
AW counts the writes while standing still.

The cone is the same rule drawn better, not a new rule. True cone
detection would have made a platform hide Macario only beyond some
distance from a guard, which would have needed the street redesigned
around it and a new thing to teach. The low cone keeps "up there, he
cannot see you" true everywhere and makes it visible: its top edge is
under GUARD_SIGHT_CLEARANCE, so a student standing on any platform is
standing over it. It is still detectRadius long from the middle of his
body, so the picture and the test are one number. Faint on purpose; it
turns red with the meter when he turns, and pale blue while the stage
clothes are holding him.

The street is 11000px with ten citizens and eight guards, each stretch
teaching one way past before the next mixes them (content/act1.js lists
them): the first citizen stands before any guard, so the gift button is
learned in safety; a low platform, a high ledge, a walkway over a
sentry, a platform mid-beat, two guards sharing one platform, a sentry
with his back turned for a takedown, and two steps. Three hearts, all on
platforms. Checkpoints after the second, fourth, sixth and eighth
citizens, each outside every guard's beat and sight, and
verify_new_scene.js checks that no citizen or checkpoint stands in a
guard's sight at either end of his patrol. The citizens are one table
(CITIZENS), from which the gifts, the flags, the quest count and the
guide's list are all derived, so they cannot disagree. The first three
flags are Block 37's, so an old save still counts what it gave. The
seven new people are placeholder script like the rest of Block 37, and
their trades are ordinary workers of Tondo, which is as far as the item
bank goes.

Consistency, without touching the story: every count in the dialogue
says ten; the Mananahi speaks as "Mananahi" (not "Mana"), matching the
name the guide shows; Macario calls his mother "Nay" throughout; the
Kutsero's barya is paid once per save (skipIfFlag on a new flag,
nakahingiNgBarya, which also tells the guide to send Macario on to the
Tindero), where before a reload into the memory paid it again; the
gift button reads "Ibigay ang mansanas" in the same case as "Iabot ang
polyeto"; and spelling was brought to one standard ('yung, 'yon, 'wag,
mag-ingat, puwede, kumusta, bagama't, Muslim and Kristiyano capitalised).
The man in the moro-moro's lines were not touched; they are the
proponents' open decision (Block 35). The Katipunero's repeat line gained
the takedown from behind, since the street now has a guard built for it.

game.js v48, style.css v30, content/act1.js v30. No new file under
Assets/, so ASSET_VERSION is unchanged at 16.

Painted panels and shadow trees (Block 43). Requested with eight new
paintings in Assets/Act 1/Background: put them next to each other, with
a shadow tree that separates them and that Macario walks behind, to hide
where one picture ends and the next begins. They are separate
paintings, not one wide one, so no join can be made seamless by
mirroring the way Tondo.png's was (Block 26); a hut is cut in half at
every edge. The tree is what hides that, standing in front of the join
the way a foreground tree does in any side-scroller.

Each panel is a fixed 1450 world px wide, painted with background-size
cover anchored at the bottom. The alternative, one image wide at the
layer's height as Tondo's tiles are, would have put every join, and so
every tree, somewhere different on every phone, since the layer's height
is the screen's height over --zoom. With a fixed width a join is at the
same x everywhere and content can keep its people off it. The cost is a
little cropping, of sky on a short screen and of the painting's own
sides on a wide one, and the sides are under a tree. 1450 is about one
phone screen: at 412px tall and --zoom 0.7 a painting's natural width is
about 1390.

The tree is geometry, not art: a silhouette of overlapping crown lobes,
hanging leaf tips and a trunk, generated once and pasted into game.js as
an SVG data URL, set as each tree's background. No file to download
means a slow connection cannot leave a join bare, and one URL means the
browser decodes it once for every tree. The crown hangs about 300 above
the road, over every head, so on the road only the trunk hides anyone,
for about a body's width. A faint shade either side of the trunk, in the
backdrop layer, melts the two paintings into each other; it is Block
18's rejected shadow post, but with the tree in front of it that it
belongs to.

tondo uses paintings 1 and 2, the memory 3 and 4 (greyed, trees too),
and the lansangan all eight in the order 5, 6, 9, 12, 1, 2, 3, 4. The
twelfth was delivered as a 4520px WebP of about 2MB and was converted to
a 1848px JPEG, 12.jpg, the size of the others; the WebP and "9 (1).jpg",
a byte-for-byte copy of 9.jpg, are left in the folder and loaded by
nothing. Every join was checked against every NPC, exit and checkpoint
in the three scenes; none needed moving. Tondo.png and its mirrored
tiles remain for any scene without panels, and the harness fixture
still uses them.

Characters still stand on the Lupa.jpg strip, which covers the
paintings' flowerbed edge; the paintings' own dirt road reads as the
road behind them. ASSET_VERSION to 17; game.js v49, style.css v31,
content/act1.js v31.

The repository reorganised (Block 44). Requested as cleaning the
directory so it looks professional. Nothing about how the game plays
changed; only where files live and what they are called. See
Repository layout, above, for the result and the naming rule.

Where each old path went, for reading the Decisions on record above:

    Assets/Act 1/Nanay.png, Kutsero.png, Tindero.png,
      Mananahi.png, Bonifacio.png, Katipunero.png,
      Mamamayan.png                    assets/sprites/characters/<name>.png
    Assets/Act 1/Horse.png             assets/sprites/characters/kabayo.png
    Assets/Act 1/Muslim_Girl.png       assets/sprites/characters/maryam.png
    Assets/Act 1/Muslim_Walk.png,
      Muslim_Attack.png                assets/sprites/enemies/muslim-walk.png,
                                       muslim-attack.png
    Assets/Act 1/Bantay.png            assets/sprites/enemies/bantay.png
    Assets/Prefab/Macario_Idle.png,
      _Walking, _Jump, _Shooting       assets/sprites/player/macario-idle.png,
                                       -walk, -jump, -shoot
    Assets/Prefab/Macario_Melee.jpg    assets/sprites/player/macario-melee.png
    Assets/Dead.png (missing)          assets/sprites/player/macario-dead.png
    Assets/Act 1/Background/1..6.jpg   assets/backgrounds/act1/street-01..06.jpg
    Assets/Act 1/Background/9.jpg      assets/backgrounds/act1/street-07.jpg
    Assets/Act 1/Background/12.jpg     assets/backgrounds/act1/street-08.jpg
    Assets/Act 1/Tondo.png             assets/backgrounds/act1/tondo.png
    Assets/Act 1/Tondo_Night.png       assets/backgrounds/act1/tondo-night.png
    Assets/Act 1/Entablado.png         assets/backgrounds/act1/entablado-inside.png
    Assets/Act 1/Entablado_Labas.png   assets/backgrounds/act1/entablado-outside.png
    Assets/Act 1/Lupa.jpg              assets/backgrounds/act1/ground-lupa.jpg
    Assets/Mansanas.png                assets/items/mansanas.png
    Assets/Act 1/Damit_Entablado.png   assets/items/damit-entablado.png
    Assets/Prefab/Calm.mp3, Intense    assets/audio/music/calm.mp3, intense.mp3
    Assets/Prefab/Gun_Shot.mp3         assets/audio/sfx/gunshot.mp3
    Assets/Act 1/Horse.mp3             assets/audio/sfx/horse.mp3
    Assets/Fonts/*                     assets/fonts/vt323.woff2,
                                       press-start-2p.woff2, OFL-*.txt
    style.css, teacher.css             css/
    game.js and the other scripts      js/
    _dev/test.js, verify_new_scene.js,
      sb-stub.js, fixtures/            _dev/tests/
    _dev/measure-sprite.js, key-black.py,
      make-placeholder-sprites.py,
      create_accounts.js               _dev/tools/
    db/applied/macario_schema*.sql,
      db/macario_schema_v5.sql         db/migrations/001..005_*.sql
    db/macario_items_v3.sql,
      enrollment_setup.sql             db/seeds/
    db/db_healthcheck.sql,
      reset_test_accounts.sql          db/scripts/

The melee sheet took its true extension on the way: it was always a PNG
saved under a .jpg name (Block 27). db/applied/ as a folder that meant
"has been run" is gone; the migrations are numbered in running order
and TRACKER.md's Run log is the one record of what has run, which it
already was.

Removed: the WebP original of street-08 and "9 (1).jpg" (copies of
files kept), Muslim_Woman.png (a byte-for-byte copy of maryam.png), and,
from the repository only, the "Claude outputs" screenshots, the proposal
PDF and the instrument validation form, which now sit in docs-private/
on the proponent's computer: the repository is public and published, so
anything in it can be downloaded from the game's URL.

Two things moving the stylesheet broke, both caught before shipping.
Every url() in css/style.css is now ../assets/, because a url() in a
stylesheet resolves against the stylesheet, not the page. And a scene's
own backdrop, which game.js writes into the --skyline-src custom
property, came out as css/assets/... and 404'd: a url() inside a custom
property resolves against the stylesheet that reads the variable. It is
now written as an absolute URL, and verify_new_scene.js loads the URL
the backdrop tile actually computes to rather than the name the content
gives (it failed on the broken version).

ASSET_VERSION to 18; game.js v50, style.css v32, content/act1.js v32,
content/items.js v9. Every other file's URL changed with its folder, so
its version number did not need to.

Back to Tondo.png, with the trees (Block 45). Requested after seeing
Block 43's paintings on the device: the simpler backdrop, Tondo.png,
repeated along the road with every second copy mirrored as in Block 26,
and the shadow trees kept at the joins. All three streets (tondo, the
memory, the lansangan) declare panels: TONDO_PANELS, the one picture,
and mirrorPanels: true. The panel machinery stayed rather than going
back to Block 26's tiles because the trees need joins at fixed x
(1450 apart) to keep NPCs clear of them; the tiles' joins moved with
the screen's height. Cover crops both edges of every panel alike, so a
mirrored neighbour still meets it at the same column of the painting,
and the tree now hides a join that is already continuous. The eight
street paintings stay in assets/backgrounds/act1, loaded by nothing.
game.js v51, content/act1.js v33; no asset changed.

No mirror, the picture on the floor, and the cone from the eyes (Block
46). Three requests after Block 45 on the device. The mirroring read as
ugly, so the streets are Tondo.png repeated the right way round, and
the shadow trees go back to hiding a real jump at each join, which is
what they were made for (mirrorPanels stays in the engine, unused).

The picture was drawn with cover, anchored at the bottom of the screen,
so its lowest 60 pixels ran down behind the dirt strip: the painting
looked dug into the ground. A panel now starts at --ground-level and
draws the picture at its full width and its own shape (1450 by 580),
bottom edge on the floor. On a screen taller than the picture the space
above is the scene's panelSky, Tondo.png's own top-row sky colour
(#72a8d0), so the sky carries on; on a shorter one it is the top of the
sky that goes past the screen's edge, never the ground. The panel width
stays fixed for the trees' sake (Block 43), so the whole picture is
visible only where the screen is at least about 640 world pixels tall;
a 412px-tall phone at --zoom 0.7 shows all of it but the top 50 or so of
the sky.

The cone left from the middle of the guard's body at waist height,
chosen in Block 42 so its top stayed under the platforms. The proponent
asked for it to leave from the eyes instead. Measured on the Bantay
still, his eyes are 107 of his 121 native pixels above his feet, 118 at
display height, so the cone's element now runs from 6 below the road to
122 above it and its polygon narrows to the eyes (122 to 114) and opens
to the dirt at the far end, its top edge there at 48. The rule did not
move: standing on any platform 60 or more up is still out of sight,
though near a guard the picture now crosses a platform. If that ever
confuses a tester, the choice is the picture or the rule, not both.

game.js v52, style.css v33, content/act1.js v34.

The cone looks straight ahead (Block 47). Block 46's cone left from the
eyes but slanted down to the dirt, which the proponent found odd for an
eye. It now points level: a point at his eyes opening evenly to 90
pixels tall at the far end, about 10 degrees either side, still
detectRadius long. Visual only, at the proponent's direction; the range
and the rule did not change. The cost, stated so nobody rediscovers it:
the drawn cone now crosses every platform a guard walks near, so the
picture no longer says "up there he cannot see you". The platforms still
work; the briefing line ("Ang bantay ay nakatingin sa daan, hindi sa
itaas") is what tells a student so. style.css v34.

The quest system rebuilt (Block 48). Requested because quests had grown
inconsistent over many blocks: some objectives were logged the moment
they started and some only when done, "Pumunta sa trabaho" was ticked the
instant Nanay finished talking, before Macario had gone anywhere, three
steps of the memory (the horse, the barya, the purchase) were in no log
at all, and the log grew into a list of struck-through lines. The request
was that the log show the current objective, that finished ones go into
a Tapos na section that starts closed, and that Macario's job start by
talking to Maryam rather than by walking onto the stage.

Act I's objectives are now eleven steps in story order (content/act1.js,
and TRACKER.md, Start here, lists them) and the log is drawn from them
(linearObjectives, Act data format), so there is one source of truth for
what a student is doing, the objective counter the dashboard reads and
the line on screen being the same list. Every content call to addQuest,
completeQuest and setQuestText is gone. The chain rule, first unset step
is current and a later flag fills in the earlier ones, is what keeps the
log honest for a save made before a step existed.

A chain is only honest if its order cannot be broken, so each step is
gated behind the one before by the story itself, not by the log: the
Kutsero sends Macario to the horse until he has seen it (the new
requiresFlag on dialogue sets), the horse's apple is on sale only while
buying it is the task (its forQuest names that step), Pasok stays shut
until the Mananahi (it had been open from the start, so the play could
be walked into before the memory), and the play waits for Maryam.
Without the gates a student could skip a step inside a scene the story
then leaves, and Act I could never complete.

Maryam is an NPC now, not a decoration. Walking in, Macario says he must
talk to her first; her first conversation is the love scene and its
onComplete runs the rest of the play (playMoroMoro, the old arrival
script moved unchanged). Until the fight is won that conversation
replays, as the arrival did. Nobody can be talked to while enemies are
up, which matters now that she stands in the middle of the fight.

The log: "Gawain" holds the task in hand only; "Tapos na (n)" is an icon
and label button (Icons) that opens and closes the done list, sized 44px
on glass, closed at every scene load, and it does not pause the game.
renderQuests writes only when what it shows changed.

Eleven objectives make the drip floor(50 / 11) = 4 barya a step, the
remainder paid on completion. Pumunta sa trabaho's flag,
nasaDaanPatungoSaTrabaho, is still set by Nanay, because her own dialogue
sets skip on it; no objective reads it. Old test saves: run
db/scripts/reset_test_accounts.sql rather than trust a mid-act save,
although the chain rule means one will not get stuck. game.js v53,
style.css v35, content/act1.js v35, content/items.js v10.

Four new paintings and a coconut palm (Block 49). Four new pictures of
the street arrived (a colonial town: the church, the stone houses, the
bay behind them), delivered as "1 1.png", "2 2.png", "3 2.png" and
"4.png". They are assets/backgrounds/act1/street-01..04.png, named the
way the layout asks rather than the way they arrived, and every road in
Act I now lays all four in order and starts again at the first when the
road is longer (tondo shows one and two, the memory the same two, the
lansangan all four twice). Block 45's single repeated Tondo.png is gone
from the scenes; tondo.png stays as the backdrop for any scene without
panels, which is what the harness fixture uses. Block 43's eight
paintings were deleted. panelSky is #51a6ea, the average of the four
tops.

The shadow tree is a coconut palm now, and about a third wider and
taller (520 by 1100 against 380 by 900): a leaning trunk with flared
roots, ten drooping fronds with saw-edged leaflets, a cluster of
coconuts, and a lighter tone on the fronds facing the light. The trunk's
base is centred on the join it hides and the crown leans off to one
side, which is what a palm does and also what keeps the join covered at
the road, where a student looks. The harness checks that in pixels
(section AX, Macario standing at a join), and it caught the first draft,
whose trunk leaned off the join at the ground.

The palm is geometry, not art, like the tree before it, and now has a
generator: _dev/tools/make-shadow-tree.py writes the SVG that is pasted
into SHADOW_TREE_URL, so the next change to the tree is a change to the
script rather than to a wall of path data. ASSET_VERSION to 19; game.js
v54, style.css v36, content/act1.js v36.

Four trees (Block 50). Requested after Block 49 on the device: the
trees should be mostly trunk, and the trunk thick enough to hide how the
houses fail to line up across a join, with the leaves only partly
visible at the top; and four models rather than one, two coconut palms
and two ordinary trees. Two corrections came back the same session and
are folded in below: the first draft was too fat, and the second tone
inside the shapes was distracting.

The trunk is the whole point of a shadow tree, so it is now what the
tree mostly is: about 130 world px wide at the height of a person and
long enough that a phone screen (about 590 world px tall at --zoom 0.7)
holds trunk from the road to the top, with the crown's lowest leaves
coming in at the top edge. The box is 440 by 1200, narrower and taller
than Block 49's 520 by 1100: a trunk this thick needs no room either
side of it for a crown that is mostly off screen. The first draft was
about 180 wide and read as too fat on the device; 130 covers a join
without eating the road.

One flat tone, and the outline carries everything. Blocks 43 to 49 drew
a lighter green inside the silhouette (lit fronds, leaf scars, bark
streaks) to keep a large dark shape from reading as a hole in the
painting; on the device that grain read as distracting instead, so it is
gone. What replaced it is shape: a slow wobble down each trunk's edges
so no side is a straight cut, three uneven roots at the road, a neck
that swells into a coconut's crownshaft (drawn as part of the trunk, not
as a collar on top of it, which left a step), saw-edged fronds with two
old ones hanging down the side, and on the broadleaves a canopy of lobes
with a spray of leaves off each outer one.

Four models, in _dev/tools/make-shadow-tree.py: two coconut palms
leaning opposite ways with a cluster of coconuts under the crown, and
two broadleaf trees with limbs leaving the trunk into the canopy. Which
model stands at a join is the join's own number (game.js,
buildPanelBackdrop), so a road alternates palm, tree, palm, tree, and
the same tree stands at the same place on every phone and on every
visit. Random would have been one line shorter and would have moved the
trees on a reload.

A flat silhouette shows every seam between the shapes it is built from,
which was the whole of the refinement pass: a limb has to leave the
trunk from inside it, a lobe has to sit over the fork where the limbs
and the trunk meet, and the fronds need a blob at the crown they all
leave from, or a sliver of sky shows through and reads as a tear. None
of that is visible as a highlight; it is only visible as an outline
that holds together.

The cost, and it is the reason the clearance rule in Act data format
moved from 40px to 90px: a thicker trunk hides more of the road.
Nothing in Act I had to move (verify_new_scene.js checks every citizen,
exit and checkpoint against every join and passes), but a character
placed within about 90px of a multiple of panelWidth now stands behind
a trunk where before they would have been beside it.

Section AX measures the trunk rather than trusting the drawing: with
Macario standing on a join, the row of screen pixels at his chest is
counted in the tree's own colour and converted back to world pixels,
for each of the four models in turn. It reads about 124 and the check
wants more than 100; with the tree hidden the same row reads about 1,
and Block 49's palm would have read about 50, so it can tell a thick
trunk from a thin one. game.js v56, style.css v37; no asset changed, so
ASSET_VERSION stays at 19.

The backdrops are JPEGs (Block 51). Requested before a presentation,
after working out where the waiting on a slow connection comes from:
the six backdrops with no transparency were PNGs of about 1.9MB each,
11MB in all, which is most of what a scene has to download, and a
painting is exactly the picture a PNG is the wrong format for. They are
now quality-86 progressive JPEGs at the same pixel size: 11.0MB to
1.7MB, about six and a half times less, at 40dB PSNR, which on a
painted backdrop at phone size is not a difference anyone sees. The
street a student walks went from 7.8MB of paintings to 1.2MB.

assets/backgrounds/act1/entablado-outside.png stays a PNG, because it
is a cut-out of the building with an alpha channel and a JPEG has none.
Quantising it to a palette got it to 247KB but flattened the
semi-transparent edge (alpha off by up to 46), which would show as a
jagged edge around a building drawn 400px tall, and halving its size
would have meant changing the contentTop/contentHeight/footX measured
from its native pixels. Left alone at 1.5MB, and it is now the largest
file in the game.

What did NOT change: the world still opens before its pictures have
arrived, and a picture that fails outright is still the dashed box with
no retry until that scene is loaded again (Macario's own sheets and the
backdrop, only on a reload). Block 51 makes the window smaller; the
loading bar, the retries and the service worker in TRACKER.md's Known
problems are still the actual fix. ASSET_VERSION to 20; game.js v57,
style.css v38, content/act1.js v37, all four of which name a picture
whose extension changed.

Act I rewritten (Block 52). Requested with a new script and plot: rewrite
the entire act, keep the background, remove almost everything else
without deleting any file, and make sure the features exist so later
passages can be integrated easily. Asked and answered before building:
the (0/100) counts barya rather than a new currency; the bullies are
"Siga" on screen; Macario says "Tsk"; the item catalogue is emptied.

The act is two scenes. tondo is the street, on the same four paintings
and the same trees; its id is kept so a save from before the rewrite
lands there, and every old scene id (kutsero, entablado, lansangan)
falls back to it the way unknown ids always have. bahay is at home, on
the same paintings, one panel wide, at the proponents' direction to
keep the background rather than paint a room. Three beats, each a scene
script: the siga and Nanay on the street, the conversation at home, and
Macario's thought back on the street, which opens the savings step.

Three engine pieces, each general. Scene scripts, because an act's
opening has to play on a login and arrivalDialogues deliberately do not;
the alternative, an NPC placed to be walked up to, would make a
cutscene something the student has to find. countCurrency, because the
savings step counts money rather than people, and the balance already
exists. objectiveCurrency: false, because the drip would otherwise have
paid 25 barya for watching the opening and put the count at 25/100
before the story had paid him anything. The "Bagong gawain" toast
answers the script's "New Quest" line and is general: any linear act
announces its next step.

The savings step's flag is set by nothing, the deliberate gap used since
Block 19: earning the barya, and what finishing the step means (handing
it to Nanay is the obvious reading of its line), are the next passage,
and the act stays open until then. The siga are stand-in stills made by
make-placeholder-sprites.py the way Block 41's were (the Tindero twice,
recoloured, one with a bandana; the Kutsero once), which now builds only
the files named on its command line so adding one does not rewrite the
rest. The lines are the proponents' as written, apostrophes
straightened and the two "…" characters written as "...", since VT323's
latin subset may not carry the ellipsis.

What was removed from the content and kept on disk: Kabayo, the
Kutsero, the Tindero, the Mananahi, Maryam and the man in the moro-moro
and his guards, Bonifacio and the Katipunero, the ten citizens and the
eight Bantay, the entablado inside and out, the horse and fight sounds,
and the three items' tile pictures. None of the engine they exercised
was touched, and the harness fixture still covers all of it. The
assessment item bank (db/seeds/macario_items_v3.sql) was written
against the old Act I's facts and has not been changed; see TRACKER.md.

game.js v58, acts.js v11, content/act1.js v38, content/items.js v11.
The siga pictures are new files rather than replaced ones, so
ASSET_VERSION stays at 20. test.js gained section AZ, and
verify_new_scene.js was rewritten for the new act.

Five backgrounds and a walk of our own (Block 53). Requested after
Block 52: expand the street so it shows the entirety of the five
backgrounds, and attempt sprites of our own, with animation, starting
with Nanay walking.

The five are street-01..04.jpg and tondo.jpg, the river village that had
been only the fallback for a scene without panels. The street is now
exactly five panels, 7250px, one painting each in that order, so none
repeats and none is cut off at the road's end; worldWidth is written as
the panel count times the panel width so the two cannot drift apart.
Each painting is drawn whole at 1450 wide in its own shape, as Block 46
set; on a 412px-tall phone the top of the sky still goes past the
screen's edge, which is the one part of "the entirety" a fixed panel
width cannot give. tondo.jpg's own sky is a lighter blue than the
street's panelSky, which shows only on a screen taller than it. bahay
stays one panel.

The walk is made, not drawn: _dev/tools/make-walk-cycle.py takes one
still frame of a commissioned sheet and moves the artist's own pixels
into eight frames. The feet are cut out and stepped in turn (the
swinging foot lifts 6px and travels 5px either side of rest while the
planted one slides back), the body leans 2px toward the walk and dips
2px on each landing, drawn over the feet so no gap opens under the hem,
and the hem kicks forward as each leg passes. Drawing a new character
from nothing in the artist's painted style was not attempted: at 256px
a from-scratch figure would not match, and a walk that reuses her own
pixels cannot fail to look like her. The art is front-facing, so the
result is a front-facing walk that steps and leans toward the right,
mirrored by faceMovement for a walk to the left; a true side view is
owed to the artist.

footX is her idle sheet's 127, not the 129 measure-sprite.js reads for
the walk (the lean pulls the stance forward), so she does not slide two
pixels when she stops. The generator takes a table entry per character
(which sheet and frame, where the feet start and part, where the skirt
or trousers begin), so the next character's walk is an entry, not a
new script.

game.js v59, content/act1.js v39. nanay-walk.png is a new file, not a
replaced one, so ASSET_VERSION stays at 20. verify_new_scene.js checks
the five panels, the road's length, and Nanay walking on with her walk
sheet stepping through its frames and standing with her idle sheet.

A side-view walk, four paintings, and ambience built but off (Block 54).
Three things back from Block 53. Nanay was meant to walk sideways:
Block 53's walk moved her front-facing pixels, so she stepped toward the
camera while travelling across it. The proponent deleted tondo.jpg as an
old file, so "the five backgrounds" are four and the street is four
panels, 5800px. And a request for sprites of our own, for small moving
things (clouds, birds, leaves), with the condition that they not be
added if they cost performance.

The walk is drawn from nothing now: _dev/tools/draw-nanay-walk.py builds
eight profile frames with Pillow in her sheet's colours (hair down her
back, cream blouse with a puffed sleeve, blue tapis tied at the front,
dark skirt whose hem swings with the stride, sandals stepping under it,
arms swinging opposite), flat-shaded with the one-pixel dark outline the
cast has, in 160px cells. It is plainly less detailed than the artist's
painting, so it is a stand-in until the artist draws her walk; she
still stands with her real idle sheet, and turns front-on when she
stops. make-walk-cycle.py now writes <name>-walk-front.png, so running
it can never overwrite a real side view. ASSET_VERSION to 21, because
nanay-walk.png was replaced under the same name.

With tondo.jpg gone, the fallback backdrop (a scene with no panels and
no backdrop, which is what the harness fixture uses) is street-01.jpg,
in style.css's --skyline-src and checkBackgroundImage, and
SKYLINE_ASPECT is its 1952 by 736.

Ambience. _dev/tools/draw-ambient.py draws two clouds, a flock of three
birds in two wingbeat frames, and a leaf, each a few hundred bytes,
scaled up pixelated. A scene declaring ambient: { clouds, birds, leaves }
gets clouds drifting and fading across the sky, flocks crossing now and
then, and leaves falling from each shadow tree (leaves is per tree).
Positions and timing come from each element's index, not Math.random,
so a street looks the same on every visit. setPaused stops them,
prefers-reduced-motion hides them, and nothing reads them: a bird
cannot be hit.

They are off in every Act I scene, because measured they cost. With
Chrome's own counters over four seconds of standing and walking on the
street at a sixth of this machine's speed, the frame rate held at 60
with or without them, but the main thread's busy time rose from about
0.45 to 0.9 seconds, most of it style and compositing. Three ways of
moving them were tried and none escaped it: CSS keyframes reading
custom properties (which cannot leave the main thread), the Web
Animations API with plain values, and the game loop writing only the
ones near the camera, which is what shipped because it costs nothing at
all when a scene declares no ambient. A headless browser composites in
software, so a phone's GPU may make the real cost smaller; trying that
is one line in a scene (content/act1.js says which), and the device is
the judge. Section BA covers the mechanism against the fixture scene.

game.js v60, style.css v39, content/act1.js v40, ASSET_VERSION 21.

The proponent's verdict on the drawn walk, the same day: it is not good
enough. Recorded so it is not tried again: character sprites drawn in
code (Block 53's moved pixels, Block 54's drawn profile) do not reach
the artist's painted standard, and a character that walks needs a walk
sheet from the artist. Small scenery (the ambience pictures, the shadow
trees) and recoloured stand-ins built from the artist's own frames
(Blocks 41 and 52) are a different matter and stand. Whether Nanay slides
on with her idle sheet or keeps the drawn walk until the real one
arrives is open (TRACKER.md, Next action, 0). Blocks 52 to 54 are an
experimental window, in the proponent's words: expect parts of them to
be replaced.

A clean-out (Block 55). The proponent deleted, on the computer: the
"Claude outputs" previews, docs-private/screenshots, the old
entablado-inside.png (its .jpg stays), entablado-outside.png, the
ambience pictures and draw-ambient.py, and the two walk tools
(make-walk-cycle.py, draw-nanay-walk.py). And said the ambience is not
wanted, so it is gone from the engine too: buildAmbient, updateAmbient,
the pause hook, the .ambient styles, the ambient scene field and
section BA. Block 54's measurements stay recorded above as the reason
it was never switched on. nanay-walk.png stays because Nanay's
decoration still names it (TRACKER.md, Next action, 0). horse.mp3 and
intense.mp3 are in no Act I scene but the harness uses both (sections
AO and AS), so deleting either would fail the suite. "Claude outputs/"
is now in .gitignore, since the repository is public and published.
game.js v61, style.css v40, content/act1.js v41.

Work, the savings, and the errand (Block 56). The proponents' next
passage: two people on the street give Macario work, the Kutsero at
x 1900 (his real sheet, Block 33, with the white horse beside him at
2150, a decoration, and horse.mp3 near him) and the Mananahi at 3500
(mananahi.png, measured). Their first conversations are the script's
lines as written; the request spelled them "Kutchero" and
"Manananahi", normalised to the names used everywhere else. Each
conversation ends in a job: a timing bar, chosen by the proponent over
the other offered mini-games, in which a marker sweeps back and forth
and a press while its middle is in the green zone is a success. A
success pays 5 to 14 barya, at random. Until the savings are given to
Nanay each job pays at most 50 in all, the last pay trimmed to land on
50 exactly, so the two jobs together make exactly the 100 the quest
counts. What each job has paid is kept in its own flag as a number
(kinitaSaKutsero, kinitaSaMananahi): state.flags is saved whole, so
numbers survive a reload with no schema change.

The mini-game is engine, playTimingGame in game.js, and knows nothing
about barya: content passes canPlay (the cap) and onSuccess (the pay,
returning the line to show). It is the #job-screen window in
index.html, styled like the act screen. It blocks the world with
setUiBlocked, and takes its keys (E, Space, Enter to press, Escape to
stop) in the capture phase on window and stops them there, because
otherwise the same Escape also opened pause in shell.js and the same
Space made Macario jump. The E that closes the conversation opening it
is older than the window, so its timestamp is compared and it is not
taken as the first attempt. content opens it a tick after the
conversation's onComplete for the same reason.

A gift can wait only on a flag, not on a balance (the question left
open in Block 52). Content sets sapatNaAngIpon when a job's pay takes
the balance to 100, and Nanay's gift, "Ibigay ang ipon", waits on that;
no engine change. So Nanay is an NPC in bahay now instead of a
decoration, and bahay has a door out (Lumabas) and the street a door
home (Umuwi, at 230), both shut until the story has sent him to work.
Her gift plays the proponents' five lines, spends the 100, sets
naibigayAngIponKayNanay (which lifts the cap) and fades straight to
patahian, a new scene: the tailor's shop, on street-03 since there is
no painting of one, where a scene script plays the Mananahi's errand
and sets natanggapAngPadala. That flag opens the entablado's door at
the street's end (5660) into the entablado scene, on
entablado-inside.jpg, where the direktor (the mamamayan still, a
stand-in) takes the costume with a gift, "Iabot ang damit", and pays
79 to 110 barya at random, shown as a toast. The outside of the
entablado has no picture since Block 55, so its door is a label on the
road.

Three objectives: Umuwi kasama si Nanay, Mag-ipon (n/100), and Dalhin
ang damit sa direktor sa entablado. At the proponent's direction Act I
does not end when all three are done; the post-test must wait for the
rest of the story. holdOpen: true on the act (acts.js,
checkObjectives) says so honestly, where the old way, an objective
whose flag nothing sets, put a task on screen nobody could do.

Lines of ours, marked PLACEHOLDER in content/act1.js, to be replaced by
the proponents: the direktor's two (the proponent asked for two short
stand-ins), and one line each for a second visit to the Kutsero, the
Mananahi, Nanay and the direktor, and for the Kutsero and the Mananahi
at the cap. Section BA of the harness is now the mini-game and
holdOpen (the old ambience section BA left in Block 55).
verify_new_scene.js plays the whole passage with real presses on the
bar. game.js v62, acts.js v12, style.css v41, content/act1.js v42.

One street (Block 57). Requested after playing Block 56: the proponent
disliked being carried from one place to another (the house, the
tailor's shop, the door into the entablado) and asked for the map to be
ten paintings long, Nanay outside for good, a black card with the place
and year, the finished missions in settings, and the timing bar
replaced, because it "feels very dishonest", with a retrieving game.
Asked and answered before building: apples caught in a basket, and the
Kutsero first, 50 barya each.

The street is 14500 px, ten panels: the four paintings in order, twice,
then the first two again. "Double" and "ten backgrounds" were both in
the request; ten was taken as the number, since four doubled (8) is not
ten. Everything happens on it except the inside of the entablado, and
that is entered only by talking to the direktor, who goes in with
Macario, at the proponent's direction. bahay and patahian are gone; an
old save naming either falls back to the street, as any unknown scene
id always has, and the scene scripts put the student where the story
is (verify_new_scene.js checks both).

The opening now walks. After "Tsk", Macario and Nanay leave together to
where she stays (x 2000), and the cedula conversation plays there. That
needed movePlayer, the player's own moveDecoration: it moves posX from
its own animation frame, the loop draws the walk cycle while it runs
(scriptWalking) even though the cutscene holds everything else, and the
camera follows as it always does. Nanay moves as a decoration and is
then swapped for an NPC standing in the same place (startsHidden,
revealedByFlag, revealNpcsByFlag called from content), because a
decoration can be walked and an NPC can be talked to, and neither can
do both. She slides on her idle sheet: walkAnimation was dropped, which
settles Block 54's open question.

The black card is playIntertitle, an engine call like playDialogue, and
not an extension of #blackout: the fade between scenes has no text and
must stay exactly as it is, and a card whose lines fade on their own
needed its own element above the dialogue box. Its options are the two
places it is used. startBlack is for "Tondo, 1880", which opens the
game, so the street is never seen before it; whileBlack is for "1884",
where the years pass and Macario is moved beside the Mananahi under the
black (placePlayer), which is the whole of how a jump in time is done
without a scene change. A tap or E skips the reading time once the first
line has been up for 1.2 seconds, never the fades, so a tap meant for
the last line of a conversation cannot throw the card away unread.
"Tondo, 1880" is the first beat of the opening script rather than
something shown every time the page opens: a returning student in 1884
would otherwise be told it is 1880. "1884" is its own scene script
(requires the savings given, done when the errand is received), started
directly from Nanay's gift through runSceneScript, so a reload before
the errand plays it again rather than skipping it.

The timing bar is gone from the engine (playTimingGame, #job-screen and
section BA's checks for it). What was dishonest about it was that the
thing pressed had nothing to do with the work and the pay was a random
number. The apples are the work: a basket moved left and right catches
apples that shake in the leaves for 0.65 s and then fall, one at a
time, a little faster with each one held. A miss costs nothing but the
wait for the next. The game counts; content decides what a catch means
(one flag per apple, so the quest line counts them with countFlags and
a student who stops at two keeps two). It is in a window rather than in
the world because a thumb on the movement buttons cannot also be a
basket, and the window takes its keys in the capture phase for the same
reason the timing bar did (Space must not jump, Escape must not pause).

The jobs are errands now, and pay a fixed 50 each, once, so the two make
exactly the 100 without a cap: the Kutsero sends Macario to the apple
tree, the horse eats them (a gift), the Kutsero pays (a gift, "Kunin ang
bayad"); the Mananahi sends him to three customers (a gift each,
counted from their flags so the order does not matter), then pays. Both
payments are gift buttons because a gift already means "the thing this
person is waiting on", which is what being paid is. The chain is linear,
Kutsero first, as answered: nine objectives, one line at a time, the
guide leading to each. The direktor keeps Block 56's random 79 to 110,
which was the proponent's own number.

The apple tree is an NPC with onInteract and interactLabel ("Pumitas"),
because E on it has to open the mini-game and not a conversation, and
an NPC already has everything else it needs (a body to reach, a guide
target, a label). Its picture is drawn in code by
_dev/tools/make-apple-tree.py, 64 by 80 and drawn pixelated at 280 px
tall: scenery, which Block 54's verdict allows, unlike a character. The
horse became an NPC too (it is fed), which needed displayHeight on NPCs,
and took the horse's nearSound from the Kutsero.

The finished tasks moved to the settings panel, "Mga natapos na
gawain", read from Game.doneQuests each time the panel opens. The
button and list under the quest log are deleted rather than hidden.

Lines of ours, marked PLACEHOLDER in content/act1.js: what each
job-giver says the work is, their reminders, pay lines and thanks, the
horse, the three customers (their names too) and the direktor on the
street. The proponents' own lines are unchanged, including "manananahi"
in the 1884 card, spelled as given. game.js v63, shell.js v14,
style.css v42, content/act1.js v43. puno-mansanas.png is a new file,
so ASSET_VERSION stays at 21.

The street cleared after 1884, and sound effects (Block 58). Requested
after Block 57, which the proponent was happy with: clean the map after
the time-skip, with no more trees and miscellaneous NPCs, and add sound
effects. Asked and answered before building: of the trees, only the
apple tree goes (the shadow trees over the joins stay, since without
them the joins show); and Nanay stays with the Mananahi and the
direktor.

An NPC may declare hiddenByFlag, the opposite of revealedByFlag: once
the flag is set, he is gone. The Kutsero, the horse, the apple tree and
the three customers all name naibigayAngIponKayNanay, the flag Nanay's
gift sets. buildNpcs reads both rules from the flags (npcShouldHide), so
a reload rebuilds the street in the right state, but setting the flag
does not by itself move anyone: content calls refreshNpcVisibility at
the moment it wants the change seen, which for 1884 is under the black
card (whileBlack), so the street is full when the card comes up and
cleared when it lifts. revealNpcsByFlag now calls refreshNpcVisibility,
so its two old callers (the death sequence, a save restore) apply both
rules.

Nine small effects, made by _dev/tools/make-sfx.py as retro tones
(square, triangle and sine waves and a little noise) in 16-bit mono WAV
at 22050 Hz, 1 to 94 KB each, their loudness baked into the file so the
engine plays every one at SFX_VOLUME: blip on each line of dialogue
(very quiet, since it is the one heard most), jump, coin when barya is
earned (not when spent), give when a gift is handed over, quest with
the Bagong gawain toast, catch and miss in the apple game, door on
every fade between scenes, and intertitle, a slow low bell, with a
black card's first line. All nine are events the engine already had, so
the calls are in game.js and content names none of them; every act gets
them. They load and play the way the gunshot does (Block 30): fetched
and decoded into Web Audio buffers at parse time, an <audio> element as
the fallback, silent when Mga tunog is off or the tab is hidden. No
recorded sound was available and none was invented from a real source;
a recorded or commissioned effect replaces any of these by dropping a
file over the same name. WAV rather than MP3 because nothing in the
sandbox encodes MP3 and the files are small enough that it does not
matter; GitHub Pages serves WAV as audio/wav.

Section BB of the harness checks that every effect decodes, which event
asks for which effect (by wrapping playSfx), that spending barya is
silent, that the switch silences them, and hiddenByFlag.
verify_new_scene.js checks the street before and after 1884, and a save
from after it. game.js v64, content/act1.js v44, ASSET_VERSION 22 (new
files under assets/).

No stand-in art, and the play instead of 1884 (Block 59). Two requests.
First, every sprite made in code or recoloured from the artist's frames
was judged ugly and removed, in favour of the dashed placeholder box:
siga-1..3, the Mananahi, Bonifacio, the Katipunero, the mamamayan, the
Bantay, nanay-walk, the apple tree and the two item tiles, with the two
tools that built them (make-placeholder-sprites.py, make-apple-tree.py).
This extends Block 54's verdict to the recoloured stand-ins of Blocks
41 and 52 as well: character and item art comes from the artist or is
a placeholder box, nothing in between. Content still names the missing
files (siga-1..3.png, mananahi.png, direktor.png, aling-rosa.png,
puno-mansanas.png), so each box says what is owed and real art drops
in under that name. Scenery drawn as geometry (the shadow trees) and
the sound effects were not part of the request and stay. ASSET_VERSION
to 23, so a phone does not keep showing the deleted pictures from its
cache.

Second, no jump to 1884. The Mananahi's third delivery is the direktor,
last, and the story turns there: his lead actor (Julian) is sick, the
seats are full, the costume Macario carried fits him, and the direktor
begs him to take the part. Inside the entablado is a short moro-moro,
the kind of play Tondo's stages put on and the stage Sakay is known to
have acted on: Maryam walks him through it backstage, he forgets his
first line and is prompted from the wings, adds a line of his own,
fights the Sultan's four soldiers (spawnEnemies with the Block 40
sheets, noRanged on a stage), and the curtain closes on a standing
crowd. Every line of it is ours and marked PLACEHOLDER; the direction
was that the dialogue must sound natural, so it is written as people
talk, with the small beats (a forgotten line, a whisper, a tease)
carrying the scene rather than exposition. The play's two kingdoms are
not named by religion, and it ends in a blessing rather than the
form's traditional conversion, a choice made for a Grade 8 classroom
that the proponents may reverse.

Shape. The chain stays nine steps: the delivery step now counts three
flags (two customers and the direktor), and is completed by the
direktor's scene script (theMissingActor, doneFlag naihatidAngMgaDamit)
rather than by the third gift, so Bagong gawain announces the play as
they go in rather than while he is still pleading. The play is a scene
script in the entablado (thePlay), so a reload in the middle plays it
from backstage; the play's flag is set before the direktor's pay, so a
reload cannot pay twice. The Mananahi's pay and Nanay's gift follow;
Nanay's gift keeps the proponents' five lines with four of ours after
the third, telling her about the play. The direktor refuses his
costumes until the two customers have theirs (naihatidSaDalawangSuki),
since the Mananahi sends him there last. With nothing to clear, the
street keeps everyone; hiddenByFlag and refreshNpcVisibility stay in
the engine, unused by content. The entablado grew from 900 to 1180,
one sideways phone screen at --zoom 0.7, because 900 left a dark strip
at the side. The direktor still pays 79 to 110 at random, so after the
100 goes to Nanay Macario keeps what the play earned.

verify_new_scene.js plays the new passage end to end (100 checks),
including reloads mid-scene, mid-play and a Block 57 save whose
deliveries were all done. game.js v65 (ASSET_VERSION only),
content/act1.js v45.

The weight of a blow (Block 60). Requested after Block 59: combat
should feel like it has weight, with a punch sound, a camera shake or
enemies sent back, the choice left open. All three, plus a freeze, each
small, because weight in a fighting game is several small cues landing
on the same frame rather than any one big one.

impact(kind) in game.js is the one place a blow is felt, so a punch on
an enemy and a punch on a guard land alike. It plays a sound, freezes
the world for a few frames (hitStop) and shakes the camera
(shakeCamera), from one table, IMPACTS: a punch that lands (55ms
freeze, 3px shake), a knockout (110ms, 7px), and Macario hurt (no
freeze, 6px). Every press of Atake also swings, heard whether or not it
connects, so a miss sounds like a miss. Macario hurt covers every
damagePlayer, so hazards and guards got the same jolt for free.

The freeze is the game loop skipping its update and its animation step
while the camera still shakes, so the blow lands on a held picture.
Timers measured against performance.now() run on through it, which at
a tenth of a second nobody can see; offsetting them the way pause does
would have been machinery for nothing.

The shake eases to nothing, in whole pixels so the art stays crisp, from
two sines rather than random numbers, so a frame costs nothing extra.
The camera is still written only when it moves (Block 36): drawCamera
compares the shake as well as the position, so standing still writes
nothing, and a shake ends on the plain translateX it started from. A
device that asks for reduced motion gets no shake and no fall.

Knockback slides instead of jumping. A hit sets a velocity that decays
by ENEMY_KNOCK_DECAY a frame, tuned to come to rest where the old 45px
jump put him, so every distance tuned against it (reach, spacing, the
wind-up) still means what it meant. The first frame of the slide is
applied with the blow so the hit reads through the freeze.
updateKnockback runs every frame, not only while the student can act,
so the last soldier finishes falling even as the play's script takes
the world back. The knockout sends him further, tips him over away
from the blow about his feet (a CSS animation on the body element,
since the sprite's own transform is its facing flip), and then fades
him. The fight's promise resolves FIGHT_END_BEAT_MS (600) after the
last one falls rather than on the blow, so the scene does not cut in
on the fall.

The four sounds are made by _dev/tools/make-combat-sfx.js, in Node
because the proponent's computer has no Python to run make-sfx.py, and
levelled against the other effects by RMS. Every number here is chosen,
not measured, like the fight's pacing (Block 35); the freeze and the
shake are the first to try smaller if the fight feels sluggish on the
phone. Section BC covers it: which effect a punch, a miss, a knockout
and a hurt ask for, the freeze holding the world still, the shake
moving the camera and letting it go, the slide and its distance, the
topple, and the beat before the fight ends. game.js v66, style.css v43,
ASSET_VERSION 24.

STORY.md (Block 61). Requested: a tracker for the plot itself, the
dialogue, the interactions, what happens and where, integrated with the
other two files. It is a third context file beside this one and
TRACKER.md, with its own lane: what the story is. This file keeps how
content is built (the data formats, the engine calls) and TRACKER.md
keeps what is owed; STORY.md says what a student sees and hears, beat
by beat, with every line, and so is the one document a proponent can
review the script in without reading JavaScript.

It holds the full script, not a summary, because the dialogue is the
lesson and is what the proponents review; a summary would leave them
reading content/act1.js. A script beside the code is a second copy, and
a second copy drifts, so drift is made a failing check rather than a
matter of discipline: verify_new_scene.js reads content/act1.js as
text, pulls out every line of dialogue and every black card, and fails
if any is not in STORY.md word for word. Reading the source rather than
the running game is what covers the lines no test walks to (a repeat
visit, a reload branch). It runs one way only, so a deleted line has to
be deleted from STORY.md by hand; the other direction would need
STORY.md in a strict format, which would make it worse to read.

Ours and theirs are told apart by a + in the margin, the one piece of
markup the file needs, because which lines the proponents wrote is the
first thing a reviewer asks. The file also keeps the places (where
everyone stands on the street), the cast (who has real art and who is
a box), each person's repeat lines by story state, the threads the
story has left open, and the questions only the proponents can answer.
Flags and x positions appear only so a reader can find a beat in the
content; mechanics are described here, not there.

The TRACKER.md walkthrough of Act I's scenes, which had grown into a
second script in prose, was replaced by a pointer to STORY.md.
verify_new_scene.js to 101.

Blocks 62 to 67 were one session, requested as "make it fun and
performance friendly", spending a cloud budget on the project. Each is
additive; nothing the proponents wrote was changed.

Loading, retries and the service worker (Block 62). The fix TRACKER.md
had chosen for art missing on a slow connection, built. Every picture
goes through loadImage (game.js, near the top, because loadAct reaches
it at parse time): one download and one promise per URL, and a failure
retried after 0.8, 2 and 5 seconds unless a HEAD request says it is a
real 404, in which case the placeholder box appears at once as before
and the URL is not asked for again this session. Sprite sheets, the
panels, a scene's backdrop and the CSS fallbacks all use it, so it
counts everything a scene draws. The title screen shows a bar of what
has arrived; a student who taps in before it is full waits on "Sandali
lang..." (up to 20 seconds, then the world opens with what has come,
which is what always happened before) and nothing starts behind that
screen, because the entry promise resolves after it. A scene change
holds its black until the new scene's art is in, up to 8 seconds.

sw.js keeps every file on the phone. Two rules: a URL with ?v= is cache
first, since it never changes under that URL, and storing one deletes
the same path under any older ?v=; everything else from the site (the
pages themselves above all) is network first, falling back to the
cache offline, which also ends the stale index.html problem. Other
origins (Supabase) are never touched, and range requests (streamed
music) are left to the browser. Registered on https only, after load,
so the harness on localhost never meets it unless a check sets
__SW_TEST; test.js sets PW_EXPERIMENTAL_SERVICE_WORKER_NETWORK_EVENTS so
a context's routes see the worker's requests. The file's header holds
the three lines that switch it off on every phone if that is ever
needed.

The same session found the body font had never been served: VT323.woff2
was committed only under the old Assets/Fonts casing, so on GitHub
Pages, which is case sensitive, every student read Courier. It is now
assets/fonts/vt323.woff2, and section AN passes for the first time.

Takbo, a forgiving jump, and dust (Block 63). Holding one way for 450ms
breaks into a run (8.5 against SPEED's 5; 6.8 since Block 68), ramped in over 12 frames,
with the walk cycle stepped faster in step, and dropped at once on
release or a turn. No button: the cluster is full and the thumb is
already on the one control that means "go". Off wherever a guard or an
enemy is up, because detection, chases and the fight were tuned
against SPEED. A jump pressed within 110ms of walking off an edge still
jumps (coyote time) and one pressed within 130ms before landing jumps
on the landing (a buffer); neither can start a jump from a jump. Dust
puffs at the start of a run, on each stride, at take-off and landing,
from a pool of six elements animated by transform and opacity, the
size set with the separate scale property so the keyframes read no
custom property (Block 54's lesson).

The notebook (Block 64). TRACKER.md, Next action 2, recorded that the
rewritten Act I teaches none of what the pre-test and post-test ask. Ten
pages now lie along the street, every other one at jump height (the
only use Talon has on a street with no platforms), each saying what one
of the item bank's ten matched pairs commits to and nothing further,
the rule every historical fact in content already follows. They are
outside the story (pages of a history of the man the boy becomes, the
story being in 1880) and optional, so the chain and the act are
untouched. All of it is ours and marked PLACEHOLDER; STORY.md has the
text and the question for the proponents. The engine side is general:
an act's notebook, a "page" pickup, a card, and Game.notebook() for the
Kuwaderno on the pause screen. The trivia rule is unaffected: the pages
are found after the pre-test, never on the card before it.

The apple game, with feeling (Block 65). Once the horse is fed, the tree
is a game of its own: thirty seconds, apples falling a little faster
with each catch, every fifth one golden and worth three, and the best
round kept in a flag as a number. In both modes a catch squashes the
basket and raises a "+1", a miss splats, and three in a row is a streak
with its own sound. Three sounds were added by
_dev/tools/make-fun-sfx.js (page, fanfare, streak), levelled against
the others by RMS. ASSET_VERSION to 25.

Measured, not guessed (Block 66). With Chrome's counters at a sixth of
this machine's speed, the ten pages bobbing along the road doubled the
style work of standing still even when none was on screen. Pages out of
view now hold still (a class written only when one crosses the edge),
and a page bobs three times as it comes into view and then stops,
keeping its glow; standing and walking measure as before Block 62. The
same pass found the game loop setting six HUD elements' classes every
frame whether or not they changed, and the player's facing flip written
every frame; both are now written only on a change (setClass).

The reward pop (Block 67). Being paid raises "+N" and a coin over
Macario's head (Game.addCurrency, floatOverPlayer), from a pool of two
elements. Spending raises nothing.

The instructor's requests (Block 68). Asked for together, on 25 Sep
2026, and each reverses something earlier on purpose.

The questions are in the game. content/questions.js holds the built-in
bank (Act I's trivia card and ten matched pairs, copied from
db/seeds/macario_items_v3.sql) with each answer and the act's pass mark
(passing, 0.75). assessment.js reads assessment_items whole when the
teacher has put questions there, else the bank, and when the read fails
it falls back to the bank rather than stranding a student; it grades
the answers itself and inserts the score. This supersedes the secrecy
rule of schema v2 ("the answer key never leaves the database"): the
instructor judged it unnecessary, and a student with developer tools
can now read the answers. The trivia card falls back to the bank the
same way. The harness serves an empty bank by default, so every section
written before Block 68 still meets a test with nothing to sit; section
BH asks for the real one (realQuestions).

A replay after a failed post-test. Below the pass mark the student is
offered "Ulitin ang Yugto" or "Tapusin na", as equals. Finishing
completes the act with the score it has. Replaying (Acts.replayAct)
clears the story's flags but keeps the Talaan's (salita_, pahiwatig_),
the engine's own "__" flags and any the act names in keepFlagsOnReplay;
puts the barya back to what the act began with ("__startCurrency_N",
recorded as play begins; a save from before Block 68 has none and goes
to 0, which is what Act I starts with); restarts the counters; moves
act_progress back to playing, the one place the client ever writes that
row backwards; reloads the act at its first scene behind its title card
and runs its opening again. The pre-test is not sat again. The post-test
is, as attempt 2 and on, and only after a replay: "__retakePost_N" is
set by the replay and spent by the next post-test, so a student who
reloads on a failed result is offered the choice again rather than a
free try. Each attempt is its own assessment_scores row; attempt 1 is
written without the column, so a database without schema 006 still
records first tries exactly as before, and a second try it refuses is
shown to the student and not stored. The dashboard shows the latest try
and how many there were. Act I is still held open (holdOpen), so its
post-test, and so the replay, is not reached in the shipped game until
the act has an ending.

The teacher edits the questions. teacher.html has a "Mga Tanong at
Sagot" card (js/teacher-questions.js): per act and test, every question,
its choices and the right one, reorder, add and remove, and the trivia
card. It starts from the built-in bank when the database has none.
Saving a test deletes its rows and inserts the edited list in order,
which needs no bookkeeping for reorders; a failure between the two
leaves no rows, and the game then uses its bank, which is a safe place
to fail to. Schema 006 grants teachers the writes.

The password. Settings offers "Palitan ang password" to a signed-in
student: two fields, at least six characters, and
sb.auth.updateUser({ password }), which changes only the session's own
account. Awaited, with the result said in Tagalog.

The Talaan replaces the notebook. The proponents did not want Block
64's ten fact pages. In their place: ten glossary words, each earned by
doing the thing it names (meeting the Kutsero, the first pay, the play),
with ordinary meanings rather than claims about Sakay; and three hints
for the post-test, at three of ten spots on the street, from a pool of
six, chosen at random per student and kept in the save. All of it is
ours and marked PLACEHOLDER; STORY.md has every word.

The run is slower. Block 63's 8.5 read as far too fast; RUN_SPEED is
6.8. game.js v68, acts.js v13, assessment.js v4, shell.js v16,
style.css v45, content/act1.js v47, content/questions.js v1;
teacher.html's teacher.css v3, teacher.js v3, teacher-questions.js v1.

Four changes on the proponent's word (Block 69). The teacher dashboard
is in English: every label, message, status pill and the question
editor. The Talaan's Block 68 content (ten words and six hints) is
removed from content/act1.js and STORY.md, the engine kept, since the
proponent liked the mechanics and not the content. The apple tree is
no longer a sprite: it is the silhouette tree over the join at 5800 (a
broadleaf, not a palm), made usable by an NPC with scenery: true, a
body to reach and a label and nothing drawn, so the art it owed
(puno-mansanas.png) is no longer owed. And the guide (Block 42) is gone
entirely, from the engine, the page, the stylesheet, the act format
and the content, so that a student works out where to go from what
the story says; this supersedes Block 42's guide and every later
mention of it. The Kutsero's "diyan sa unahan" is now the only
direction to the tree. game.js v69, style.css v46, content/act1.js v48;
teacher.js v4, teacher-questions.js v2. test.js section BJ covers the
Talaan's engine against the fixture and a scenery NPC; section AW
checks that nothing of the guide remains.

The teacher's Talaan papers, and trees that differ (Block 70). Two
requests. The teacher writes the Talaan now: up to three papers per
act, each a title and a text, on the dashboard's Talaan Papers card
(js/teacher-talaan.js), saved to talaan_entries (schema 007). Where
they lie is not the teacher's to choose, at the proponent's direction:
content names three places per act (Act I: 2500 on the road between
Nanay and the Kutsero, where everyone walks; 8200 and 12200 at jump
height, so Talon has a use), and paper n always lies at place n. That is
the fixed mode of the Block 68 hints (Act data format, The Talaan), not
a second system: the pool the engine lays from is simply the teacher's
instead of content's. The papers are loaded by acts.js on a login
(syncStart), on entering an act and for a guest, without being awaited,
because the engine lays them whenever they arrive; a failed read is an
act without papers, which is what an act the teacher has not written
for looks like anyway. Guests read them, since they are the game's
content and hold nothing private, which is the one read a guest makes
of the database. Schema 007 lets the anon role select and nothing else.

Saving upserts the filled slots on (act_number, slot) and deletes the
emptied ones, rather than the delete-and-insert the question editor
uses, so a slot keeps its row and the flag a student earned for it
(pahiwatig_ plus the slot less one) still means that paper after the
teacher rewrites it. A paper needs its text; a title is optional. The
card and the list say "Papel", ours and marked PLACEHOLDER, as are the
two lines under a found paper.

The shadow trees. Reported as the four models having become one. They
had not changed since Block 50, which hung their crowns 640 to 800
above the road so that a phone showed "trunk and only the lowest
leaves". A sideways phone at --zoom 0.7 shows about the lowest 590 of
each tree's 1200, so it showed four near-identical trunks, and the
diversity the proponent remembered was Block 49's lower crown. The
crowns now hang about 450 to 600 above the road, each model at its own
height: inside the screen, over every head (Macario's is 194 up), and
far enough down that a palm's fronds and a broadleaf's canopy and limbs
read at a glance. Only the four crown heights and the broadleaf limbs
moved in make-shadow-tree.py; the trunks are the same width at the road,
and section AX still reads about 124 world px of trunk at chest height.
The apple tree at 5800, a broadleaf, now looks like a tree with fruit
to pick rather than a post.

game.js v70, acts.js v14, shell.js v17, content/act1.js v49;
teacher.js v5, teacher-talaan.js v1, teacher.css v4. test.js gained
section BK (the fixed papers against the fixture, Acts.loadTalaan and
the dashboard editor); verify_new_scene.js checks Act I's three places,
the papers laid, found, saved and kept across a reload, a guest, and
that no paper stands behind a trunk.

The punch lands with the fist (Block 71). Reported as the punch
looking disconnected: the hit was resolved on release (Block 27 chose
that so gameplay never waited for the art), and the arm reached out a
quarter second after the enemy had already staggered. The melee sheet
now declares contact: 6, the first frame at full reach (the drawing's
right edge runs 116, 134, 147, 160, 161 over frames 3 to 7, measured
with measure-sprite.js), and updateMeleeContact, called from the game
loop right after the sprite steps, runs meleeAttack on that frame:
the swing sound, the flash, the hit, the thump, the hit-stop and the
knockback all land on the picture of the fist arriving. 6 frames at
24fps is 250ms after release, under the enemy's 350ms telegraph.

Two rules follow from waiting. A tap while the fist is still on its way
is ignored, so rapid tapping cannot keep restarting a punch before it
connects; a tap after contact starts the next one. And the punch's end
is driven from the animation, not a timer, so a pause or a hit-stop
holds the whole punch, contact included; anything that takes the pose
away first (a respawn, a cutscene, a throw) means the punch never
lands, which is right, since it was never seen to land. With the art
missing there is no fist to wait for, and the hit resolves on release
as before. game.js v71.

The siga drawn in code (Block 72). Requested by the proponent: a
sprite for the siga built from nothing, not a modified existing one,
with an idle and a walk. This reverses, for the siga only and on the
proponent's own word, the verdict of Blocks 54 and 59 that characters
drawn in code do not reach the artist's standard; that verdict was
about a walk made by moving the artist's pixels and stand-ins
recoloured from the artist's frames, and this is neither.
_dev/tools/draw-siga.js (Node, no dependencies, since the proponent's
computer has no Python) builds each boy as a jointed figure: two legs,
two arms, a spine and a head, a few angles a frame, wearing clothes
made of shapes. Every part is painted the way the commissioned sheets
look: a thin dark outline, a shade on the side away from a light at
the upper left, a highlight toward it, and cast shadows from what
hangs over it (the shirt hem on the trousers, the jaw on the neck, the
near arm on the shirt). It is drawn at four times the size and
averaged down, which is what makes the edges soft rather than
stair-stepped. The rig puts the lower sole on the ground every frame,
so the walk bobs by itself and nothing floats.

Three boys, one table (BOYS): the leader (siga-1, the one who speaks)
in a red panyo with its tails flying, a faded indigo camisa with the
sleeves rolled, khaki trousers rolled to the calf and a stalk of grass
in his teeth; a big one (siga-2) in a buri hat pushed back and an open
white camisa with a red sash; a small one (siga-3) with a mop of hair
in an ochre shirt too big for him, patched at the back. All three are
barefoot, side on, facing right. The idle is 12 frames at 7fps
(breathing, the weight on the back foot, a hand on the hip, the stalk
worked in his teeth); the walk is 8 frames at 14fps, a loose swagger,
leaning back, chin up, which at the opening's 170 px a second puts the
feet about where the ground moves under them.

Each decoration carries animation (the idle) and walkAnimation (the
walk), the Block 53 pair, so the walk plays only while the opening
walks them on. Both sheets share footX 128, the hip, rather than the
walk's own measured 124, so a boy does not slide when he stops. And
since spriteFit draws every sheet DISPLAY_HEIGHT tall whatever its
contentHeight, each boy's displayHeight is 134 times his height over
127 (Macario's), which is what keeps the big one taller and the small
one shorter. The numbers are chosen, not measured against anything but
the other sheets; the colours, the build and the pose of each boy are
lines in BOYS and idlePose/walkPose, and rerunning the tool rewrites
all six files. content/act1.js v50, game.js v72, ASSET_VERSION 26.

The bantay, walking and shooting, and a room of them (Block 73).
Requested by the proponent with one still from the artist (Guard.png at
the root: a guardia civil side on, facing right, rifle at order arms),
said to be not the official plot: name the guard to match everything
else, animate a walk and a shot, and after the talk with Nanay put a
"<WIP>" card and a room of guards with the full hostile-guard mechanism.

The file is assets/sprites/enemies/bantay.png, the name the street
guards of Blocks 37 to 42 had, in the folder for guards and fighters.
The walk and the shot are made from it by _dev/tools/animate-bantay.js
(Node, no dependencies), which cuts the still into its parts and moves
them, the way a paper cut-out is animated: the rifle is found by a band
along its own bent centre line and by colour (wood and grey metal, then
only the dark edges that touch them, so his belt stays his), its piece
behind the hand filled in from the wood either side; the hand is lifted
over it; the legs are cut at the coat's hem and turned at the hip and
the knee. Nothing of him is drawn except the far arm in the shot (a
sleeve in the coat's navy, outline and cuff, with his own hand turned
under the barrel), the muzzle flash and the smoke. This is neither
Block 53's verdict (a walk made by moving pixels of a front-facing
still) nor Block 72's (drawn from nothing): the still is side on, so
moving its own legs is a side-on walk, and the result was looked at
before shipping. The proponent judges it on the phone.

The walk is 8 frames: each leg swings 19 degrees either side about the
hip, the knee folds up to 42 degrees while it swings forward, the far
leg is the same leg half a cycle later and darkened, and whichever
sole is lowest is put on the ground, which makes the bob. The rifle is
carried 26 pixels off the ground and sways with the step. The shot is
7 frames: the rifle slides down through his hand to the hip (0, 1), is
level (2), flashes (3), kicks back and up (4, 5) and smokes (6). Fired
from the hip, not the shoulder, on purpose: the muzzle sits about 64
above the road, where the old chest-height bullet (70) flew, so a jump
still clears a bullet; a shoulder shot would have put it at 100 and
made the jump nearly useless.

The engine: a guard may bring walkAnimation and shootAnimation beside
animation, three sprites in one body with one shown (drawGuard, written
on a change), the way an enemy's attack sheet is. The shoot sheet's
frame is picked by the shot itself (setupNpcAnimation's new frameAt
option, guardShootFrame), not by the sheet's clock, so the flash is on
the frame the bullet leaves. He stops to shoot (Act data format, the
guard's art), because a rifle levelled at the hip on a man sliding
along the road read as wrong, and the bullet starts at the muzzle
(guardFire), clamped to Macario's near edge so a shot at point-blank
is not a miss. A guard without the sheets behaves exactly as before,
which is what the harness fixture's guard is, so section AU is
unchanged.

The room is scene "bantayan" in content/act1.js, three paintings long:
a patrol, a sentry with his back turned for a takedown, a second
patrol, a platform above their sight with a heart, a crate, and
intense.mp3. (Superseded by Block 74: it is reached only from the
Test Room button in settings.) It was reached from the end of the opening: after
Macario's thought, playIntertitle(["<WIP>"], { keepBlack: true }) and
Acts.gotoScene. keepBlack is new: it puts the scene fade's own black up
behind the card at once, so the card lifts onto black and the street is
never seen between the two. The door at the far end (Lumabas) goes back
to the street beside Nanay, and the plot carries on untouched; the
Kutsero is already the task in hand while he is in the room. STORY.md
records it in its own section, "Work in progress (not the plot)",
because the drift check needs every black card there and the plot
itself was not to change.

verify_new_scene.js to 120: the card, no street between it and the
room, the three guards' sheets, a patrol walking and a sentry
standing, the sentry levelling before he fires, the flash frame on the
shot, the bullet from the muzzle, and the door back. game.js v73,
content/act1.js v51, ASSET_VERSION 27.

The test room from settings (Block 74). Asked the same day: the room
should not come after the talk with Nanay, since the main plot was not
to be touched, but from a "Test Room" button in settings, "<WIP>" card
and all. content/act1.js's opening is back to exactly what it was
before Block 73 (thinkingAboutWork ends with setCutscene(false)).

An act declares testRoom: { scene, card, x, facing } (Act data format),
and the engine does the rest: Game.testRoom() says whether it can be
entered now (the act has one, the world has been handed over, no
cutscene or conversation is up, and he is not already in it), and
Game.enterTestRoom() keeps where he is in the save as __returnTo (an
engine flag: a replay keeps it and no objective reads it), plays the
card with keepBlack and calls Acts.gotoScene. The room's door declares
back: true, which returns to that spot, facing the same way, and clears
it. The room is outside the story: no story flag, objective or scene
script is set on the way in or out, which verify_new_scene.js checks by
comparing the flags before and after. A reload inside lands in the room
(it is the saved scene) and the door still knows the way back.

shell.js shows the button (#shell-testroom, "Test Room", i-blade) only
in settings opened from pause and only while Game.testRoom() is true;
pressing it closes the screens and resumes the world the way Bumalik
does, then calls Game.enterTestRoom, whose card holds the world. The
label is English on purpose: it is a tool for the proponents, named as
they asked, not a line of the story.

verify_new_scene.js to 124. game.js v74, shell.js v18, content/act1.js
v52; no asset changed.

Guards react to blows like the enemies (Block 75). Requested: the
physical reaction the moro-moro's soldiers have when hit, their dying
animation, the same for guns, and better tools. Until now a punch
jumped a guard 40px in one frame, a gunshot dropped him on the spot
with nothing, and a guard put down stood where he was, greyed.

Now a blow on a guard is hitGuard(guard, damage, dir, message) for
punches and shots alike, with the enemies' numbers: a punch does
ENEMY_PUNCH_DAMAGE (1), a shot ENEMY_SHOT_DAMAGE (2), so a two-hit bantay
still falls to one shot. He slides (ENEMY_KNOCK_SPEED, decaying by
ENEMY_KNOCK_DECAY; updateKnockback now carries guards too), flashes
(guard-hit, the enemy-hit rule), turns to face the blow, and staggers
for GUARD_STAGGER_MS (450): no walking, no aim, no shot; his next shot
waits GUARD_HIT_STAGGER_MS (600), as before. The blow that drops him,
and a takedown, go through disableGuard(guard, message, dir): a longer
slide (ENEMY_KO_KNOCK_SPEED) and the enemies' own topple and fade
(guard-fall-right/left and guard-down share enemy-fall's keyframes and
enemy-down's fade). A guard who survives a shot turns hostile. The
enemies were already like this for both punches and shots and did not
change.

The bantay got a hit sheet from animate-bantay.js: he rocks back about
the hip, head, arm and rifle with him, the far foot stepping back to
catch him, and comes upright (4 frames, in the walk's cells and with
its numbers). It plays once while he reels; knockoutFrame (1, leaning
furthest back) is held while he topples. A guard dropped from behind
(fellForward) falls forward as he stood instead, since leaning back
while falling forward read wrong.

The tools. _dev/tools/lib/png.js holds the PNG reading and writing that
animate-bantay.js had inline; the new preview-sheet.js uses it too
(measure-sprite.js and draw-siga.js keep their own copies, untouched).
preview-sheet.js exists because every sheet this session was checked by
writing a throwaway crop script: it lays a sheet's frames out numbered,
draws the game's numbers on them (ground, top, headroom, footX, muzzle),
adds an onion skin of all frames, and with --from reads the numbers
from the content file itself, so it shows what the game will do rather
than what the image looks like. Output goes to the system's temporary
folder unless --out says otherwise.

test.js section BL (718): the slide and its length, the flash, the
stagger holding him still, a real shot dropping him the way it went,
the topple and the fade, a takedown falling forward, and a guard stood
up again losing the fall. verify_new_scene.js to 126: the real bantay
reeling in his hit sheet and falling the way the shot went. game.js
v75, style.css v47, content/act1.js v53, ASSET_VERSION 28.

The enemy catalogue, and one way of taking a blow (Block 76). Asked
whether enemies could be a template rather than written out per entry.
Three places were per entry, and two were changed; the third was left
until it is needed.

The content: content/enemies.js (Enemy data format), loaded before the
acts. The bantay and the play's kawal moved into it with their sheets
and numbers; the Test Room's guards and the play's four soldiers are now
placements that name them. The Sultan, a decoration, reads his walk
sheet from the kawal. Nothing on screen changed.

The engine: guards and enemies were two systems with two copies of the
same reaction once Block 75 copied the enemies' onto guards. Now there
is one, takeBlow(body, damage, dir, message) and knockOut(body, dir,
message), under BLOWS in game.js, and a BODY_KINDS table per kind with
only what really differs: the body's width, the class prefix (the CSS
was already shared), the stagger's length, what a stagger delays (a
guard's shot, an enemy's swing), whether he is kept on the road, and
what "down" means (a guard disabled, drawn in his fall; an enemy dead,
his sword put away and the fight ended if he was the last). hitGuard,
hitEnemy and disableGuard are kept as one-line doors into it, because
the melee, the shot and the harness call them. Every body now carries
kind ("guard" or "enemy"), set by buildGuards and spawnEnemies. The
existing checks ran unchanged and green against it, which is the proof
that nothing moved.

Not done: the art tool. animate-bantay.js has the bantay's parts (the
rifle's line, the hand, the hip, the knee) written in as pixel positions.
Those could move to a description file per character so the next still
needs points marked rather than a new tool, but with one character the
format would be guessed. Do it when a second character arrives as a
single side-on still; when the artist delivers full sheets it is not
needed at all.

test.js section BM (725): the merge and its rules, a new type with no
art built and hit with no code of its own, and the two kinds told
apart. verify_new_scene.js to 128: the room's guards and the play's
soldiers come from the catalogue. game.js v76, content/act1.js v54,
content/enemies.js v1; no asset changed.

ART.md, the art still owed (Block 77). Requested: a simple file of
everything that has no sprite yet, to keep track, with an instruction
that it be checked from time to time. It is a fourth file at the root,
narrow on purpose: the pictures the game names that are missing (the
Owed list), the stand-ins that exist but are not the artist's final
work, and what the game draws with no picture by design. TRACKER.md's
Known problems kept its own list of missing art until now; it points
to ART.md instead, so there is one list.

A list kept by memory goes stale, so it is checked by the harness the
way STORY.md is (Block 61). _dev/tools/missing-art.js finds every
picture the game asks for, from the content as the page runs it (the
enemy catalogue, the acts and the items, walked for strings under
assets/ ending .png or .jpg, with the id or label of whoever uses
them), from game.js's code lines and from the stylesheet's url()s, and
says which are not on disk. verify_new_scene.js runs it first and fails
if a missing picture is not in ART.md's Owed list, or if one listed
there has arrived. Only the Owed list is checked; the stand-ins and the
by-design list are written by hand. verify_new_scene.js to 130; no
shipped file changed.

Loading that cannot be walked past (Block 78). Reported: a test student
got into the game with sprites missing. Block 62's loader had four ways
through. The entry wait gave up after 20 seconds and opened the world
with what had arrived. A single 404 made a picture "missing" for the
rest of the visit, and GitHub Pages answers 404 for a minute or so while
a push deploys, which this project does often. A picture that kept
failing was given up on after three retries and then counted as done,
so the bar reached 100 with it absent. And only the scene in hand was
asked for, so the entablado and the play's soldiers were fetched when
first needed, behind an 8-second cap and no cap at all respectively.

The fix rests on knowing which pictures exist. js/asset-manifest.js
lists every file under assets/, written by
_dev/tools/make-asset-manifest.js and checked against the disk by
verify_new_scene.js. A picture not in it is owed art: never asked for,
the placeholder box at once, as ART.md lists. A picture in it exists, so
every failure is the connection or the host: it stays pending and is
tried again after 0.8, 2 and 5 seconds and then every 8, for as long as
it takes, each retry fetching it afresh (cache: "reload", past a browser
cache that may hold the failed answer) and showing it from that copy.
A picture outside assets/ (the harness's fixtures) keeps Block 62's
rules.

On top of that: loadAct asks for every picture the act's data names and
every enemy type's (preloadActArt), so the title's bar and the entry
wait cover the whole act and a scene change finds its art already
there. Neither wait is capped any more. The loading screen, when nothing
has arrived for ASSET_STALL_MS (10 s), says the connection is slow and
offers Subukan ulit, which tries every waiting picture at once
(Game.retryAssets). A scene change's black shows how much has arrived
after SCENE_ART_NOTE_MS (2 s). There is no button that goes in without
the art, on purpose: a dead connection cannot play anyway (logins and
saves need it), and a broken file cannot hold it, because
verify_new_scene.js opens every picture the manifest lists.

The service worker needed no change: it already stores only whole,
successful answers. One limit is left as it was: a push that changes a
picture under the same name, fetched in the minute the old one is still
being served, can be kept under the new ?v=; bumping ASSET_VERSION
again fixes it, as it always has.

test.js section BD reworked: a retry now makes two requests under
Playwright (its routing turns the browser cache off); the whole act
asked for before the street opens; owed art never asked for; a scene
change finding its art there; a listed picture answering 404 holding the
loading screen, the slow note and Subukan ulit, and entry once it is
back. verify_new_scene.js to 132: the manifest matches assets/, and
every picture in it opens. game.js v77, shell.js v19, style.css v48,
asset-manifest.js v1.

The context files compacted (Block 79). Requested: cut the trackers
down, the proponent having noticed how long they had grown. CLAUDE.md
had reached about 45,600 words, two thirds of it this block-by-block
history, and it is loaded whole into every session before anything is
typed, so the history cost every session's working memory whether or
not the session touched those systems.

This file is that history, moved word for word: the Act I reset section
and Decisions on record from Block 13 on. The standing rules of Blocks 1
to 12 (accounts, attempts, the score, health and respawn, difficulty,
pause, logout, the reset, zoom and touch targets) stayed in CLAUDE.md as
Standing decisions, because every session needs them. CLAUDE.md keeps
the rules, the formats, the pitfalls and an index of where each system's
reasoning is here, at about 16,100 words. The move was checked line by
line: every line of the old CLAUDE.md after its introduction is in one
of the two files.

TRACKER.md was rewritten as present state only, from about 12,300 words
to about 5,000: one "last updated" line instead of a chain of them, one
block list instead of two, the device checklist cut to what still
applies, and its pitfalls folded into CLAUDE.md's (the one it alone had,
checking for an existing score before a test, was added there). Several
statements had gone stale and were corrected rather than carried over:
the requirements table still described content removed in Block 52 (the
lansangan, its guards, the stage clothes), the objectives said two
scenes and two objectives, the suite was 598 checks, and "the answer key
never reaches the client" had been untrue since Block 68. README.md,
the public face, carried the same false claim and a description of the
old Act I, and was rewritten to match, the grading cost stated plainly.

Not touched: STORY.md and ART.md, already compact and checked line by
line by the harness, and the code's comments, which follow the "explain
why" rule and cost almost nothing to download (compressed, and kept on
the phone after the first visit); stripping them would need the build
step this project avoids. A stale comment is cut when its code is next
touched. No shipped file changed.

The end of Act I (Block 80). Requested by the proponent after the device
pass: after Nanay is given the savings, a cut, then four years later
Macario inside the theatre performing Principe Baldovino, the four years
said on the cut in letters; after the play, members of the KKK
approach him and ask whether he is sure he wants to join; an NPC on the
street takes him to a new room where he is formally accepted; then a
mission to hand pamphlets to three citizens. Placeholders where there
is no art.

Built from the parts the act already had, with one engine change. The
cut is a black card (playIntertitle) started from Nanay's gift through
runSceneScript, exactly as the direktor's scene starts from his, and it
leaves the fade's black up (keepBlack, Block 73) so the card lifts onto
the stage without the street between. The play, the men in the wings
and the oath are scene scripts; the men are decorations walked on and
off, as the Sultan is; the Kasama, the Pangulo and the three are NPCs;
the pamphlets are gifts counted from their flags, as the deliveries
are. The third pamphlet sets a flag that a last scene script waits on,
and that script's doneFlag is the thirteenth objective, so setting it
finishes the act through the ordinary check and the post-test runs. The
act ends on a beat (a thought and "Wakas ng Unang Yugto") rather than
on the gift's own closing line, because the post-test opening straight
over a thank-you would read as the game cutting the student off.

holdOpen (Block 56) is removed from Act I rather than from acts.js; it
stays in the engine for the next act written a passage at a time.

The four years. The opening says "Tondo, 1880", so four years on is
1884, eight years before the Katipunan was founded (1892) and ten before
the year the post-test gives for Sakay joining (1894). The request was
four years and the card says four years, but it names no year, so the
game does not state a date the post-test contradicts. Which number
moves is the proponents' call and is Next action in TRACKER.md.

A save made before this block that gave Nanay the savings without ever
playing the first play (the Block 56 and 57 saves the harness keeps)
now gets the four years too. The first play's script gained unlessFlag
lumipasAngApatNaTaon so such a save goes to Principe Baldovino and not
back to Don Rodrigo four years late.

Reload points. Each beat saves on its way out and replays from its
start: the card (before it lifts), the play (before the wings), the men
(a script of their own, listed before the play's because the first due
entry is the one run), the oath (the room is saved as current_room, and
the script plays on login), the Kasama (a one-line set that takes him in
again), and the last beat. naitanghalAngBaldovino is set mid-script, as
naitanghalAngDula is before the direktor's pay, so a reload after the
curtain does not replay the play.

The step for the play is finished by the men leaving, not by the
curtain, so "Bagong gawain: Hanapin ang naghihintay sa kalye" appears
after they have told him to go there rather than in the middle of them
asking. Repeat lines that the four years made wrong were given a set of
their own (the direktor on the street and inside, Maryam, Nanay), each
by requiresFlag so the set is read from the flags and a second
conversation cannot step past it.

The history. The three questions (the country's past, present and
future) and the signature in blood are the Katipunan's rite as it is
commonly taught, and "Anak ng Bayan" as the first degree's password is
the same; Block 37 used the password too and flagged it for the source
book. What happens in Principe Baldovino is ours: Sakay is known to have
played the part, and the comedia's plot is not something to guess at,
so it is written as a prince refusing a foreign king, which is also why
the Katipunan notices him. All of it is marked for checking.

An owed backdrop. The pulungan's painting does not exist. A scene's own
backdrop used to go straight into --skyline-src, so a missing one was
requested by the browser (a 404 the loader never counted) and drew
nothing, leaving the street's fallback behind a blank room. Since this
block loadScene leaves the stylesheet alone for a backdrop the manifest
does not list, and buildSkylineTiles draws the tile as the placeholder
rule every missing sprite follows: a dark wall, the dashed yellow
border, the file name. Nothing is asked for until the painting is in
assets/ and the manifest.

The people are placeholders with their own file names (katipunero,
kasama, pangulo, karpintero, tabakera, mangingisda), in ART.md's Owed
list, which the harness checks against the disk. No file was added, so
ASSET_VERSION is unchanged. game.js v78, style.css v49, content/act1.js
v55. verify_new_scene.js to 175: the whole ending walked with real key
presses to the post-test opening, and a reload at each beat.

The ending checked against the histories, guards on the pamphlet run,
and two sounds (Block 81). Requested after Block 80: verify the
recruitment and the Principe Baldovino line, add guards while the
pamphlets are handed out, a sound of the crowd clapping, and a new sound
for the black card, whose bell "sounds like a messenger sound".

What was checked, and where. The English Wikipedia articles
"Katipunan" and "Macario Sakay" (the latter citing Antonio K. Abad,
General Macario L. Sakay, 1955), and secondary summaries of the Tagalog
komedya, read on 29 Sep 2026. They agree on these, which the game now
follows:

    Sakay acted in Principe Baldovino (and Doce Pares de Francia and
      Amante de la Corona), and joined the Katipunan in 1894. His birth
      is given as 1 March 1870, or 1878 from his death certificate.
    Principe Baldovino is a komedya attributed to Jose de la Cruz,
      Huseng Sisiw. The genre's prince fights the enemy's armies and
      wins, usually for a princess. No text of the play was found.
    From December 1892 the triangle method of recruiting was dropped
      for an initiation rite: the recruit, who had to know the Kartilya
      by heart, was blindfolded and led into a dim room hung with black
      curtains; the blindfold came off before a warning on the wall
      (strength and valour may go on, mere curiosity should leave); the
      Mabalasig, the "terrible brother", challenged him to withdraw if
      he lacked courage; three questions asked the country's condition
      when the Spaniards came, now, and its hope for the future; ordeals
      followed (a revolver said to be loaded, fired at a man, or a leap
      over a fire said to be burning); and he signed the oath in blood
      from his arm, to defend the Katipunan, keep its secrets and help
      its members in every danger.
    "Anak ng Bayan" was the password of the first grade, the Katipon.
    Kalayaan, the Katipunan's newspaper, first came out in 1896.

What changed because of it. Block 80's play was a prince refusing a
foreign king, which is not what a komedya is; it is now a rescue and a
battle (two kawal, fought), and the patriotic line is Macario's own
ad-lib, as his first night's line was, so the game does not put words
of resistance into a real play's mouth. The Katipunan's man in the
wings now quotes that ad-lib ("Wala 'yon sa komedya"). The "Pangulo"
was a guess at an office; the rite's conductor was the Mabalasig, so he
is that, and his art is mabalasig.png. The rite gained the blindfold
(on the card into the room and again for the ordeal), the warning, the
challenge to turn back, one ordeal, the oath's content and the blood
from the arm, and the Mabalasig explains that "Anak ng Bayan" is the
Katipon's word, which the recruit was given early. Of the two ordeals
the fire is used: a blindfolded boy firing at a man, even with no
bullet, is a heavier thing to put in front of a Grade 8 class, and the
proponents may prefer the other. The warning is paraphrased. The
pamphlets stay unnamed, since Kalayaan is two years after 1894. Not
used: the symbolic name every member took, because Sakay's is not in
these sources.

The four years stay as asked, and the problem stays on the list: 1880
plus four is eight years before the Katipunan existed. With the 1870
birth, fourteen years (1880 to 1894) would be exact.

Guards. A guard may declare requiresFlag and unlessFlag, read in
buildGuards (guardOnDuty), so Act I's street has three bantay only while
the pamphlets are the task. The hearts are derived from the guards on
duty (GUARDS), not from every guard the scene names, or the hearts
would show for the whole act. They do not shoot: a gunfight on the
street where Nanay lives is not the errand, and a catch (a heart, a
detection, a respawn) is exactly the stealth term the performance score
has never been able to measure in the shipped Act I. Each has a crate
in the middle of his beat, and the beats end short of the next hand-
over, since sight is 260 from the middle of his body. The street is
noRanged now for the same reason.

The respawn takes the furthest checkpoint reached (respawnX, Block 37),
which assumes the student travels right. Block 80's run went left from
the Kasama, so a catch near the last pamphlet would have sent him back
across most of the street. Rather than change a rule the harness holds,
the pulungan's way out is now the back way, onto the street at 4100,
and the three are met left to right (the mangingisda, the tabakera, the
karpintero), each with a checkpoint on its pamphlet flag.

Sounds. applause.wav and a new intertitle.wav are made by
_dev/tools/make-scene-sfx.js, no recording used: the applause is three
dozen people clapping at their own rates, each clap a burst of noise
filtered to the band a clap lives in, with a small room and a swell in
and out; the card is a low soft drum under a curtain's swish, a stage
sound where the old bell was a phone's. make-sfx.py no longer writes
the card's sound. A card may name its own effect (playIntertitle's
sfx), which is how both curtain calls get applause without game.js
knowing what a play is. A freely licensed recording dropped over either
file replaces it; none was downloaded, because a download needs the
proponent's say-so and a synthesized file carries no licence question.

game.js v79, content/act1.js v56, asset-manifest.js v2, ASSET_VERSION
29. verify_new_scene.js to 188: the battle, the ad-lib, the applause
asked for, each step of the rite, the back door, the guards on duty
only on the run (after a reload too), a catch, and the checkpoint moving.

A reload onto the street mid-run first showed the crates and no guards:
the scene is built before a login's save arrives, and guards were only
ever built with it. refreshOnDuty, called from applyLoadedState beside
revealNpcsByFlag, builds the guards and crates again when the restored
flags change which are on duty. Found by a screenshot, not the harness,
which reached the street only through a scene change; it now reloads
onto the street on both sides of the oath.

The stage clothes, showing rather than telling, and the run (Block 82).
Requested after Block 81: a line where the one who hired him suggests
he wear his theatre suit, the suit slowing detection five times while
he stands still; anything the game can represent animated rather than
told; and bugs fixed, starting with being unable to run during the
pamphlets.

The suggestion is the direktor's, who hired Macario into the company:
after the warning about guardia civil in the audience, he tells him to
go home in costume, because nobody looks twice at a tired actor. The
Kasama picks it up in the pulungan ("Mabuti't suot mo pa..."), which is
where a student learns what it does. The item is the stage clothes of
Blocks 32 and 38 returning under their old id, damit-entablado, as the
same thing (an id is never reused for a different item, and this is
not a different one): outfit slot, stillDetectionMult 0.2, Block 38's
number, which is exactly five times slower, price 0. It is granted and
worn by content through a new Inventory.grant(id), which works for a
guest in memory, because grantForAct gives items on entering an act and
this one belongs to a moment in the story. No tile picture and no
sheets, so no art is owed; the guard's meter drawn pale blue while the
clothes help is how the effect is seen.

Show, not tell. jumpPlayer(dx) is a new script call: the jump's own
velocity, sound, pose and dust, carried forward over the time a jump
takes, resolving on landing. The fire ordeal's two black cards ("Tumalon
siya." and the line saying there was no fire) became Macario leaping
and the Mabalasig saying it. After the Baldovino battle Macario walks
back to Maryam instead of being placed there. The cards that remain
narrate what the game cannot draw without art: a blindfold, the curtain,
the cut in the arm.

The run. runAllowed refused a run wherever any guard existed in the
scene (Block 63), which was right for one short corridor and wrong for
a 14500px street with three guards on it. It now refuses only within a
guard's sight plus RUN_GUARD_MARGIN (150), middle to middle as sight is
measured, or near any hostile guard; a guard taken down does not count.
test.js's check was rewritten to the new rule: a run far from the
fixture guard, none beside him.

Other bugs looked for, by playing the run headless with real keys: the
catch, the checkpoint, the crates and the running all behaved; none
further found. The reload-onto-the-street bug of Block 81 was the one
found that way before.

game.js v80, inventory.js v10, content/act1.js v57, content/items.js
v12. verify_new_scene.js to 193: the stage clothes worn with their
effect, the leap played with no card, running near and far, and the
meter slowed while he stands still in costume.

The years (Block 83). Asked whether the four-year jump should become
fourteen, the proponent answered: stick with four years and 1894. So
the opening card, one of the proponents' own lines, now reads "Tondo,
1890" instead of "Tondo, 1880", and the cut names its year, "Tondo,
1894", between "Pagkalipas ng apat na taon" and the play. Nothing else
in the game, the trivia card or the item bank named 1880. With the 1870
birth date Sakay is twenty at the opening; that is noted for the
proponents in STORY.md rather than acted on. game.js v81 (a comment),
content/act1.js v58.

Silent black screens (Block 84). The proponent asked for the black-out
sound to go; asked which, they said both. A black card is silent unless
it names a sound (playIntertitle's sfx), which only the two curtain
calls do, with applause; the scene fade no longer plays "door". The
files stay in assets/ and in SFX_SOURCES, unused, so either can come
back with one line. The card's sound was tried twice (Block 58's bell,
Block 81's drum) and fitted neither time; silence is the honest third
answer. test.js's check was rewritten: a card is silent, and a card
that names applause plays it. game.js v82.

The feel pass (Block 85). Twelve suggestions were listed and the
proponent asked for all of them; ten are built here, and TRACKER.md
carries the other two (the item bank, which the proponents must
approve, and the art, which the artist owes).

Night is a scene field, night: true or { requiresFlag, unlessFlag,
music }, read like a guard's duty: the day paintings and the road take
a moonlit filter (the same two layers greyFilter reaches, so the people
stay readable) and the music becomes the night's while it lasts. Act I's
street is night from the oath until the last pamphlet. The music is
crickets over a faint wind, music/gabi.wav, made by make-scene-sfx.js
as an eight-second loop that joins without a click, because the calm
track said "nothing is wrong" and intense.mp3 said "fight".

Detection is heard: notice, two soft rising notes when a guard's meter
starts from empty (not more than once in 2.5 s for one guard), and
caught, a low stab on a catch. The first notice in a save also says, as
a toast, to hide behind a crate or get out of his sight: there is no
guide, and this is the one line of teaching stealth gets. The crates
stay in the middle of each beat, where following a guard's back and
ducking in when he turns is what works.

The post-test opens on "Handa ka na ba?" with the number of questions
and a button, instead of straight over the act's last black card
(assessment.js, runTest, post only).

The rite and the Katipunan's approach were cut by five lines of ours
and broken with movement: the older man leaves when he has his answer
and the Kasama gives the word alone; Macario looks around the dark room
before the warning; he carries the pamphlets to the Kasama by the door
and hears the directions there, where the way out is.

A dialogue line may name a sound (line.sfx) in place of the blip: the
crowd's "Mabuhay!" lines cheer, a crowd made the way the applause is.

An outfit without sheets may name a tint (item.tint, a CSS filter),
applied to Macario's sprite element when it is worn (Game.setOutfitTint,
through inventory.js): the stage clothes warm him toward a costume's
gold until the artist draws them. One element, set on a change, never in
the loop.

Fast reading: lines are remembered as read (short hashes in
state.flags.__nabasa, an "__" flag so a replay keeps them), and holding
E, the interact button or the dialogue box moves through read lines
every 140 ms after 450 ms of holding, stopping at the first unread one.
A first reading is one tap a line. Holding E used to fire on key
autorepeat and skip every line, read or not; that is fixed.

Less walking: the Mananahi comes to watch the first play and pays
Macario outside the entablado (a second NPC, and a new NPC field,
hiddenWhile, keeping her shop empty from the play until the years
pass), which removes a walk of about 7000px; her first line changes
from hearing of the play to having seen it.

game.js v83, style.css v50, inventory.js v11, assessment.js v5,
content/act1.js v59, content/items.js v13, asset-manifest.js v3,
ASSET_VERSION 30. verify_new_scene.js to 200.

## Block 86: the attack is a movement; the speaker on the box

Combat was stand and tap. A tap with a living enemy ahead (nearest in
front, within DASH_SEEK 340) now sends Macario through him: an eased
slide of DASH_MIN_MS to DASH_MAX_MS (200 to 400), faster than walking
at its peak (about 0.75 px/ms on average against 0.3), that really
moves posX. Within DASH_HIT_RANGE (170) it hits as his centre crosses
the enemy's and carries him DASH_PASS (110) beyond, so he ends behind
the enemy, clear of its reach. From further it stops DASH_MISS_TRAVEL
(140) along, hits nothing, and costs a longer wait (520ms against 120)
and a stumble (250ms without walking), leaving him in front of the
enemy's sword. That gap is the skill the change was for. He cannot be
struck while the dash is under way, which is what makes dashing through
a swing an answer to it. The blow's direction is the dash's, so the
enemy slides on past him, not back toward where he came from. With no
enemy ahead the old punch stands, so guards, takedowns and the stealth
rule are untouched.

Enemies: the tell is 300ms (was 350) and the swing lands on it. Each
enemy walks 0.9 to 1.1 of its kind's speed, and the wind-up (600 to 900)
and cooldown (1300 to 2100) are drawn each time, so no sequence can be
memorised, and none is shorter than before is fair. A swing already
begun still lands at ENEMY_STRIKE_REACH (68), so stepping back a few
pixels does not cancel it; leaving further, or dashing, does.

Dialogue: the speaker stands on the top edge of the box, Macario on the
left, anyone else on the right, drawn from the first frame of a sheet
the scene already holds (an NPC's or decoration's animation, else the
player's idle) through bodySprite. A speaker whose art is owed, or who
has none (the crowd), shows no portrait, so the placeholder boxes do
not appear on the box. Speakers are matched by label or decoration id
after dropping a trailing "(...)" (Direktor (pabulong), Macario (sa
isip)).

Not seen on the phone yet. game.js v84, style.css v51. test.js to 750.

## Block 87: the opening fight, the dash on guards, busts

The Test Room showed the dash did nothing: its opponents are guards, not
enemies, and the dash only looked for enemies. It now also takes a guard
who is hostile, or who faces away (a takedown from behind); one who is
unaware and facing Macario is left to the stealth rules, so a tap on the
pamphlet street does not lunge at a sentry. The blow itself is
strikeGuard, split out of meleeAttack so a punch and a dash do the same
thing to a guard.

The opening now runs insult, fight, Nanay. The three siga leave the
scenery and become enemies where they stood (types siga1 to siga3 in
content/enemies.js, on the walk sheets already drawn, hp 2, 2, 1),
with the fight music and the tutorial toast the play uses. An enemy can
now carry displayHeight, as a decoration does, so the three keep their
sizes, and any enemy with a walk sheet steps it only while walking
(before, only those with an attack sheet did). The siga's laugh after
Nanay's first line was dropped, since they are beaten; STORY.md says so.

The dialogue portrait is now a framed bust, head to chest, in the
margin beside the text (140 by 130 frame, the figure drawn 270 tall and
cropped by the frame), not a standing figure over the box. The box keeps
190px clear each side for it.

game.js v85, style.css v52, content/act1.js v60, enemies.js v2.
test.js 752, verify_new_scene.js 201.

## Block 88: one template for everything that fights

Spamming attack had no answer: an enemy stopped at arm's length and
wound up for 600 to 900 ms, so Macario could dash in for free. The
enemy now decides at ENEMY_COMMIT_RANGE (130), before Macario need be
near: it lights up for ATTACK_TELL_MS (250 plus up to 100), lunges up to
50px of him, and strikes ENEMY_STRIKE_REACH (78) in front of it, in the
direction it faced when it decided (the facing is locked, and a turn
takes ATTACK_TURN_MS). Behind it, or higher than ENEMY_STRIKE_HEIGHT
(a jump), the blow hits air. So sliding through to its back, or jumping,
answers a decision; dashing from too far ends in front of it, in the
stumble, and takes the blow. The dash lost its invulnerability: the side
of the enemy he ends on is the whole of the dodge. Cooldown is 900 to
1600 ms; a blow to the enemy cancels what it decided.

Guards and enemies had two unrelated behaviours. Not merged into one
body (the guard has patrol, a meter, a rifle sheet and bullets, the enemy
a walk and an attack sheet, and the harness holds hundreds of checks on
each) but made to share the template: jitter, turnToward, setTell and
the ATTACK_* times are used by both. A hostile guard now takes a beat to
turn, holds the way he faced once a shot is coming (so a bullet goes
where he looked), shows the same lit-up tell if he has no rifle sheet,
and fires on a bounded random cooldown. A scripted fight needs no
meter: spawnEnemies takes a type from either half of the catalogue and a
guard-kind one is built already hostile (makeGuard, mountGuard, fight:
true), counted by enemiesAlive and finishing the fight when down, and
put back hostile by a respawn. Not built: a melee guard that patrols,
or a shooting enemy in a scripted fight from a plain enemy-kind type.
CLAUDE.md gains the Consistency rule.

The dialogue portrait lost its frame and background: the bust stands on
the box with a fade at its bottom edge, PORTRAIT_HEIGHT 400 cropped to
a 170 by 200 window.

game.js v86, style.css v53. test.js 757, verify_new_scene.js 201.

## Block 89: the work is there to be done

Act I was a chain of staged errands: three apples, feed the horse, be
paid once; three deliveries; be paid once. Each step had one way to
happen and one moment to happen in. The proponent asked for the
opposite philosophy: a quest, and the things are simply there.

The Kutsero and the Mananahi now each give work that is available at
any time afterwards, as often as the student likes: the horse (E on
Kabayo, Suklayin) and the sewing (E on the tahian, a scenery body beside
the Mananahi). Both are one game, playWorkGame: a marker sweeps a bar,
a green patch waits at a new place, five strokes are a round. A round
pays JOB_PAY_MIN to JOB_PAY_MAX (4 to 7) by how many strokes were good,
and each job stops paying at JOB_CAP (25); the last round is cut to what
is left. Leaving before the fifth stroke pays nothing. The first round
finishes the quest line's step and nothing else waits on it. The pay
and the cap are in flags (kitaSaKutsero, kitaSaMananahi), not "__"
flags, so a replay after a failed post-test starts them again; the
alternative left a student who replayed with no way to reach 100.

The one script is the Mananahi stopping him at the sewing. After the
second round (the quest line counts it, n/2) she stops him and sends him
with the direktor's costumes; that sets mayDalangDamit, which is what
offers the direktor's gift and closes the sewing until it is delivered.
The script has an unlessFlag on the delivery: the objective chain marks
an earlier step done by setting its flag, so a save that jumped ahead
would otherwise have replayed her.

Cut: the apples and the tree, the horse's feeding, both paydays (the
Mananahi's second pay at the play with them), and Aling Rosa's and Mang
Tomas's deliveries. The two remain on the street as customers still
waiting, one line each. Thirteen objectives became twelve. Everything
above is content; the engine gained playWorkGame and one field on a
gift, requiresCurrency, because the savings step is no longer certain to
be affordable: the play pays 79 to 110 and the jobs at most 50, so a
student short of 100 goes back to the horse or the sewing instead of
handing Nanay less. Nanay's button waits for the money.

Money on the way, for balancing: Kutsero 25 at most, Mananahi 25, the
play 79 to 110, so 100 is reached by anyone who has done three or four
rounds. The numbers are chosen, not tested on students.

Not built: a job that gets harder, a job that ends the day, more than two
jobs, an apple-catching return. game.js v87, style.css v54, act1.js v61.
test.js 761, verify_new_scene.js 197.

## Block 90: the work gets harder, and the sewing is a different game

The green patch is 34% of the bar at the first stroke and 11% at the
fifth, shrinking evenly, and the marker gets quicker as before. Each
round starts easy again, so a job repeated for barya is not a job that
gets harder each time.

The sewing is played another way: hold the button (or E) and the bar
fills, and a stroke is letting go inside the patch. Held to the end the
thread snaps and the stroke is lost. It is the same game and the same
pay, with one option (mode "hold") rather than a second mini-game, per
the Consistency rule. The fill time also shortens with each stroke.

Each job has a picture above the bar, drawn in CSS so nothing is owed to
the artist: the horse from his own sheet (the NPC's art, through
bodySprite) with a brush that sweeps over him on a good stroke and him
shying from a bad one, brighter as it goes well; a cloth with a seam of
five marks, a needle that pokes and moves on, and a stitch kept at each
good stroke, a crooked red one at each bad.

A bug the new key handling exposed and the suite caught: the game took
the release of the stroke key (keyup) even when the press that opened
it had gone down in the world, so the world never saw E come up and
ignored the next E. It now takes only the release of a key it took.

Aling Rosa and Mang Tomas are gone entirely (their lines, their places,
their art from ART.md); the Kasama's directions no longer name them or the
apple tree. Their names come out of STORY.md's cast. tindero.png stays in
assets/, unused. game.js v88, style.css v55, act1.js v62. test.js 761,
verify_new_scene.js 201.

## Block 91: what nothing used any more

Removed at the proponent's request, "the unnecessary stuff such as the
night version and macario-dead":

The legacy stage performance, the only consumer of both. Before scenes,
an act could declare a stage: a raised platform with ramps, a button
Ganap, a poem in two halves with a fade to a separate night painting
(#skyline-night, tondo-night.png) between them, and Macario's death
pose (macario-dead.png) after. No shipped content used it since the
Act I reset, and the harness never tested it. Gone with it: STAGE and
buildStage, the ramps in floorHeightAt (which now returns the ground and
nothing else), startPerformance, runNightTransition, runDeathSequence,
the cutscene-part1 and -part2 dialogue modes, the #stage-platform and
.stage-slope rules, the #skyline-night layer and its rules, the death
sheet and the "dead" sheet an outfit could declare, and is_night from
the save. The column stays in the database, unwritten. Block 85's night
on the pamphlet run is not this: it is a tint over the day paintings
(night-tint, applyNight) and stays, so no night painting is owed.

Aling Rosa's art entry and the unused Tindero sheet (tindero.png,
deleted; the manifest regenerated, ASSET_VERSION 31). The fixture's
objective flag for the old performance is now an ordinary flag.

ART.md is down to nine owed pictures, all people and the pulungan.
game.js v89, style.css v56, asset-manifest v4. test.js 759,
verify_new_scene.js 201.

## Block 92: a dash you can see coming, and lessons that wait

Enemies had range 130 and a quiet lunge, so nothing warned the student
and spamming Atake still won. An enemy now decides at ENEMY_COMMIT_RANGE
(230), shows a red "!" above its head for the tell (a CSS ::after on the
lit-up body, which guards get too, rifle or not), then dashes
ENEMY_DASH_DISTANCE (220) in ENEMY_DASH_MS (200), eased, with a swing
and dust, in the direction it faced when it decided. It hits whatever it
touches on the way, low enough (a jump clears it); Macario behind it,
past its length, or backed away by the end of the tell, is missed. The
old strike-at-the-end with a lunge is gone. The distances are chosen,
not tested on students.

Tutorials (teach, noteTask, TUTORIALS in game.js) teach a control at the
moment it matters and stop the world until it is used: a card at the top,
the control pulsing, enemies, guards and bullets held, and every timer
carried forward when it is over (shiftTimers, which setPaused now uses
too: it had missed enemy cooldowns and dashes). Macario's own controls
work throughout. A task is reported by the code where it happens (move,
jump, attack, interact) or by shell.js (inventory); "react" is answered
by any of move, jump or attack. A card stays at least 600ms so what was
already in motion cannot dismiss a lesson nobody read; one is taught once
per save (a "__turo_" flag, kept by a replay); two asked for at once
queue, content's ahead of the engine's own (the first red !, the first
person within reach). Content asks for walking and jumping after the
opening thought, Atake in the opening fight and the bag after the stage
clothes; a fight lesson is taken down, unlearned, when the fight ends.
Under the harness (window.__TEST) they are off unless a test asks.

The log can now carry a second line: an objective with pinned: { from }
stays beside the step in hand from that flag until it is done. Act I
pins the savings, renamed "Mag-ipon para kay Nanay", from the Kutsero's
first talk, so the barya can be watched as they are earned.

game.js v90, style.css v57, shell.js v20, act1.js v63. test.js 763,
verify_new_scene.js 212.

## Block 93: the Act I polish list

A full playthrough on 30 Sep 2026, headless at 823 by 412, against the
proponent's own list of twelve; five more were found on the way. All
are in TRACKER.md, Act I polish list.

The stuck walk. The loop left whatever pose was showing when a cutscene
began, for a script's held pose; no script holds one, and a walk or a
dash caught at that moment stayed a walk on the spot for the whole
scene. A cutscene now picks the pose as if nothing were held, so he
stands, and the leap in the pulungan shows the jump for the first time.

Nanay comes to him. After the opening fight she walked to a fixed spot
(1090), off screen whenever the fight had carried him left. She now
starts just past the right edge of what the screen shows and stops 190
in front of him (NANAY_MEETS, the old distance), through three small
calls for content: playerX, viewEdges, placeDecoration. The walk home
starts from there. She walks on a named, owed walk sheet
(nanay-walk.png), which is the placeholder box until drawn: the
proponent asked for the placeholder rather than the slide, and the
Mananahi's table (tahian.png, scenery/) is named the same way, so both
are on ART.md's Owed list, eleven now.

The jump's sound. The proponent disliked the square wave sweeping up (a
cartoon boing, make-sfx.py). It is a scuff and a low thump now, no tone
(make-fun-sfx.js, which already held the other generated sounds that
are not the combat's). ASSET_VERSION 32.

The proponents' lines. At their request their spelling and grammar are
corrected, meaning kept: po for 'ho, 'Nay for Nay and inay, rin and
rito after a vowel, 'yung, sa'yo, sa inyo, kumusta, periods between
thoughts, "Ayos lang" for "Okay lang". Nanay's "Wag mo pansinin yung mga
yan" was written before Block 87 put a fight in front of it, and now
reads "Tama na 'yan, anak. Huwag mo na silang pansinin.", ending the
fight rather than a taunt. They remain theirs, unmarked in STORY.md.

Icons by action. The work game's button always showed the sword, and
the main action button the talk bubble whatever E would do. The work
game takes opts.icon (a brush for grooming, a needle for sewing), an
NPC used rather than talked to names interactIcon (default a hand), and
a door shows the door. setIcon now writes only on a change, as setLabel
does, because the loop sets the icon every frame.

The trees' roots. All four shadow trees had tan triangles cut out of
their base: the trunk and its three roots are one path, filled nonzero,
and the two right-hand roots were wound against the trunk, so where they
overlapped it the winding summed to zero. They are wound the same way
now, in the pasted SVGs and in make-shadow-tree.py.

Enemies between blows. They stood still for the whole cooldown after a
dash, which read as stopping. While cooling down an enemy now backs off
to 150 from Macario, facing him, or shuffles a little either way within
reach. And once he has struck, a decision may be (three in ten) a hop
clean over Macario instead of the dash: an arc 150 high over half a
second, landing 90 beyond him, which hurts nobody, is knocked out of the
air by a punch, and is always followed by a strike from there with the
usual tell (a second hop in a row was the harness's first catch). One
enemy in the air at a time. Guards are untouched: they shoot. The
numbers are chosen, not tested on students.

The first play. After the fight Macario walks back to his mark beside
Maryam while the Sultan finishes leaving, as he already did after
Principe Baldovino; the Sultan had been walking back onto the spot a
fight left him on.

The way out. A scene may declare wayOut, a line with an arrow at the
top of the log shown only when no script of the scene is pending or
playing: "Lumabas ng entablado: pumunta sa kanan" and "Lumabas sa likod:
pumunta sa kaliwa". It is read only once the world is handed over
(questAnnounceReady), because loadAct reaches the log at parse time and
the running-scripts set is declared below it. It is the one thing on
screen that says where to go since the guide was removed (Block 69),
asked for by the proponent.

Found on the way: the dialogue box covered the actors on the stage, so a
scene may ask for it at the top (dialogueAtTop, the entablado); a bust
is not drawn from a sheet under 90 native pixels tall (the Sultan
borrows the soldiers' 70px walk and was a smear at nearly six times);
a crate now stands in front of Macario, who is dimmed while it hides
him; and the first step is marked done with the thought, so the log
names the Kutsero during the walking and jumping lessons.

game.js v91, style.css v58, act1.js v64, ASSET_VERSION 32. test.js 767,
verify_new_scene.js 216.

## Block 94: the barber, the head of his council, and papers of facts

At the proponent's direction, 1 Oct 2026, three things: Act I ends the
way The Godfather does, Macario takes work as a barber, and the Talaan's
papers carry facts.

The end. After the third pamphlet he goes back to the pulungan and
reports; a card, "Pagkalipas ng isang taon / Tondo, 1895"; and he is the
head. The proponent asked for the head of the Katipunan, and accepted
the correction before anything was built: in 1895 the Katipunan's
Supremo was Bonifacio, and the histories make Sakay the head of a
council of it (a sangguniang balangay), so that is what he becomes. The
year he became its head and the council's name are left to the source
book (STORY.md, Open questions). The Godfather's last scene, mapped: the
men bring him business and take his orders (the pamphlets on three
routes, the recruits to be blindfolded); his mother comes to the door
and asks whether he is one of them; he lies, as the actor he is ("Nag-
eensayo lang po kami ng bagong komedya"); he turns his back and goes to
his place, and the Kasama shuts the door on her as they call him
Pangulo. It pays off the thread STORY.md had left open (Nanay does not
know, and already worries) and the play's craft, and it is the cost of
secrecy that the item bank asks about.

How it is built. The pamphlet step now ends on a card, "Natapos ang
ronda ng mga guardia civil", under which the guards and their crates
go off duty (a flag of their own, nataposAngRonda, and refreshOnDuty,
which only ran on a save's arrival before); walking back past three
guards with the respawn pointing the other way would have sent a caught
student 5000px back. The night stays until he has reported. The street
gains its first exit, Kumatok at the back door. In the pulungan the
report and the year are one script; the report's flag is saved before
the year, so a reload replays only the year from its card, the way
Principe Baldovino hands on to the men. During the year the room's
people are decorations that can move, the NPCs hidden (hiddenWhile), and
the act's last flag is set after the last card, so the post-test
follows the end, not the report. The Katipunero leaves as the Kasama
comes in, at once: one after the other was seven seconds with nothing
said.

The barber. Sakay is recorded as a barber and a tailor; the item bank
asks it ("Mananahi at barbero"), and until now only the tailor was
shown. The Barbero stands between the Kutsero and the Mananahi, and
each sends Macario on to the next until he has worked there (the barber
to the Kutsero, the Mananahi to the barber), because a linear chain
marks every earlier step done when a later flag is set: a student who
met the Mananahi first would never have had the barber in the log.

The proponent first asked for "his own cutscene" and corrected it
mid-build to his own mini-game. The game is a memory one, chosen from
three offered (it, snipping locks, a razor drag), because the horse and
the sewing are already one timing game in two modes and a third mode
would not be "his own". Each round the customer asks for the cut as a
list of tools (Suklay, Gunting, Labaha), shown a word at a time and
then taken away, and the student presses them in that order; a wrong
tool ends the round; four rounds, two tools to five. It is a new
engine call, playOrderGame, on its own screen, built from the work
game's parts (the same box, buttons and result colours; the request on
a cream strip; three new inline icons), and content names the words,
as with playWorkGame. It pays as the other jobs do, 4 to 7 by rounds
right, 25 in all, through the same workAt, which now plays either game.
The tool buttons are shell buttons, 63 CSS px on the phone, 44 on glass.

The papers. The Talaan's three slots were the teacher's alone, and
empty until she wrote them, so most students would have found none. The
content now holds three papers of its own (Sakay himself; the komedya;
the Katipunan's founding and his joining), facts from the general
histories, and hintsDef merges by slot: a paper the teacher writes
replaces its slot, an empty one keeps the content's. The dashboard says
which paper an empty slot keeps. They are taught after the pre-test and
are fair for the post-test; the trivia card's rule does not apply to
them. All three are ours, to be checked against the source book.

game.js v92, style.css v59, act1.js v65, teacher-talaan.js v2,
ASSET_VERSION 32 (no assets changed). Owed: barbero.png and
silya-barbero.png.

## Block 95: the Kasama takes him back; the Test Room removed

At the proponent's request, 1 Oct 2026. The back door Block 94 put on
the street (Kumatok, x 4100) was not found on the phone: a doorway on a
dark street is a zone with no picture, and nothing points at it since
the guide went (Block 69). The proponent asked for the person who
takes him to the pulungan instead. After the rounds-over card the
Kasama comes to Macario wherever he is, from just past the edge of the
screen, as Nanay does after the opening fight (placeDecoration and the
view's edge, Block 93), says three lines and a card takes him back. No
walk and no search, and the pamphlet step's flag is set before the fade
so the report is due on arrival. A reload that lands between the two
finds the Kasama at his old spot (x 12500), whose line takes him in.
The street has no exit again.

The Test Room (Blocks 73 and 74) is removed, at the proponent's
direction: the settings button, the guards' room scene, the act's
testRoom, the engine's testRoom/enterTestRoom and the exit back: true
with its __returnTo flag. It was outside the story and Next action 5
had asked whether students should see it. What it alone showed (guards
that shoot, the bantay's walk, shot and flinch on screen) stays in the
engine and in test.js's fixture, and the bantay stay in the enemy
catalogue for the pamphlet run. The harness's own enterTestRoom() and
atTestRoom() in test.js are its fixture world, older than the feature,
and keep their names.

game.js v93, shell.js v21, act1.js v66.

## Block 96: the big siga is the artist's, and moves

At the proponent's request, 1 Oct 2026: the artist's first reference
for a siga (a young man side on, in a rolled-sleeve camisa, a red sash,
brown trousers and sandals), put on the tallest of the three, with
animations "simple but verbose", obvious for the viewer.

One still, so the sheets are made from it the way the bantay's were
(Blocks 73, 75): _dev/tools/animate-siga.js cuts it into a head, a
torso with the sash, an upper arm in its sleeve, a forearm and hand,
and a leg split at the knee, and moves the parts. Every pixel of him is
the artist's. What a moved part uncovers (his side under the sleeve,
the sash and trousers under the hand) is filled from the solid colours
around it and smoothed; the faint edge of the export holds junk colour
under alpha 0 (pure yellow among it), so only solid pixels lend. The
far sandal is cut away, since the far leg is the near leg drawn again
half a step later and darkened. The still faces left and is mirrored,
because the engine's art faces right.

The motion is broad on purpose: standing, a deep breath, a sway and a
cocky nod (the opening's taunt); walking, long strides with the arm
swinging against the near leg; the punch, drawn back through the red !
and thrown from the shoulder on the dash, arm straight, with streaks
behind the fist; the flinch, head snapped back and body tipped back. A
first cut kept the elbow at his waist and swung the forearm alone,
which read as a man holding a cup, not a punch: the upper arm is a part
of its own for that reason. All four sheets share one cell, sized from
every frame drawn, so nothing is clipped and one set of numbers serves
them all; he is drawn at three quarters of the still (about the
bantay's 394 pixels) to keep the sheets' memory down, and keeps the
height he had against the other two.

Enemies had no hit sheet; guards had one since Block 75. Rather than a
second way of reeling, an enemy now takes the guard's: hitFrame (was
guardHitFrame) serves any body, an enemy with a hit sheet turns on
whoever hit him as a guard does, and drawEnemy chooses his one sheet
showing. It is drawn at the blow, so the hit-stop freezes him in the
flinch rather than in his walk. An enemy without a hit sheet is drawn
exactly as before.

The drawing code animate-bantay.js had (layers, affine maps, the
canvas, the sheet) moved unchanged into _dev/tools/lib/puppet.js for
both tools, checked by the bantay's sheets coming out byte for byte the
same. draw-siga.js now writes only the leader and the small one, so it
cannot overwrite the artist's. preview-sheet.js --from loads the enemy
catalogue first, as the page does, since act1.js reads its fighters
from it.

game.js v94, act1.js v67, enemies.js v3, asset-manifest.js v5,
ASSET_VERSION 33.

## Block 97: one tool for any character from one still

At the proponent's request, 1 Oct 2026, the day the big siga was
animated (Block 96): the same treatment for other characters without
working it out each time, and not only for enemies ("this isn't
limited to just siga but will probably be used in other type of
npcs"), and established in the repository rather than in anyone's
memory, since the proponent works from more than one device.

animate-siga.js held two kinds of thing: what is true of any figure
standing side on (how a part is cut, turned, filled behind and drawn;
how a breath, a stride, a punch and a flinch move) and what is true of
one picture (where its elbow is). The first is now
_dev/tools/animate-still.js, the second a rig, one file per character
in _dev/rigs/. A rig is a JavaScript module, not JSON, because a far
foot is most simply a line, and siga-2.js keeps its as a function. The
motions are a library a rig picks from, so an NPC who only stands and
talks asks for idle and nothing else; the arm parts are optional, so a
character whose arms cannot be freed still breathes, sways and walks.
Distances in the motions (the lunge, the streaks) are written for a
still 540 tall and scale with the rig's own height.

The proof that the general tool is the old one: siga 2's four sheets
come out of animate-still.js with his rig byte for byte as they were.
A rig without arms was tried on a copy of the still, outside the
repository: idle and walk drawn, the arm riding with the body.

The bantay keeps animate-bantay.js. A rifle is a prop with rules of
its own (grip, aim, muzzle), and one prop is not yet a pattern; a
second held thing would be the time to make props a part of the rig.

The procedure is CLAUDE.md, Animating a character from one still,
including what to ask the artist for. ART.md points to it.

act1.js v68 and enemies.js v4 (comments naming the tool). No sheet and
no engine code changed.

## Block 98: six characters from the artist's stills

At the proponent's request, 1 Oct 2026: six pictures delivered to fill
placeholders, two more siga ("the bullies, just apply them however you
want, requires animation"), the two men of the Katipunan ("requires it
too I think"), the direktor ("idk if he moves") and the Mananahi ("can
stay stationary").

Who is who was read from the pictures and ART.md: the older man with
the moustache is the Katipunero ("the older of the two"), the young man
in red with the bolo the Kasama. Of the two boys, the one in the salakot
and shawl is the leader (siga-1), the one with the pouch the small one
(siga-3); their heights against Macario are the opening's as before
(content/enemies.js, sigaFighter size), not the pictures'.

All but the Mananahi went through Block 97's tool, a rig each, which
was the tool's first use beyond the picture it was made from; it needed
three things it did not have. overLegs became a list, because the
leader's shawl and sash both hang past his waist. An entry may be
marked clear, because the bolo's blade behind the Kasama's hip hangs
clear of his legs: filling the trousers in under it, as under a sash,
left a trouser-coloured blade riding on his thigh. And a motion,
breathe, the breath and the nod with no sway and no arms, because the
direktor holds a cane on the ground and a book, and the idle's sway
would lift the cane. The siga-2 sheets came out of the changed tool
byte for byte as before.

The engine needed nothing. Every new sheet faces right: NPCs never turn
in this engine and the dialogue bust mirrors right-facing art, so the
stills drawn facing left (the three siga, the direktor) are mirrored by
their rigs. The two men walk on decorations with walkAnimation and
faceMovement (Blocks 40, 53), so they face the way they go. The
Mananahi faces the front and is the still itself, one frame, measured.

With all three siga the artist's, draw-siga.js had nothing left to draw
and was removed (git keeps it; Block 72 records how it worked). The
"Siga" speaker's bust, the leader's, is now the artist's art, which
settles the question left open on 1 Oct.

game.js v95 (ASSET_VERSION 34), act1.js v69, enemies.js v5,
asset-manifest.js v6.

## Block 99: people look at Macario, and do not breathe in step

At the proponent's request, 1 Oct 2026, after seeing Block 98: "people
stare awkwardly to an opposite direction, like the direktor in the main
scene (should be looking to the left, where macario comes from)", the
Katipunero "stares blankly in the pulungan", and "randomize their
animation... so they don't look like zombies moving in sync". Answered
item by item first; the proponent chose both suggested fixes.

An NPC never turned. Every sheet faces right, so the direktor at x 13600
looked away from a Macario arriving from the left, and the Katipunero at
x 920 away from one entering at x 120. A fixed facing per placement was
the other option and was not taken: the same direktor stands in the
wings at x 60 with Macario to his right, so no one direction is right
for him, and every new placement would need its own. facesPlayer turns
a side-on person to whichever side Macario stands on, written only on
a change and never on a placeholder box, whose file name would read
backwards; the Barbero and the Mabalasig carry it already and will turn
once their art arrives. The Kutsero, Nanay and the Mananahi face the
front and the horse is a horse, so they do not.

Every free-running loop started on frame 0 the moment a scene loaded,
at one fps, so three siga breathed as one. setupNpcAnimation now starts
such a loop on a random frame and runs it within 10% of its fps. A sheet
whose frames are tied to something (a walk, a swing, a shot, a flinch)
is left exact. The spread is declared beside NPC_WIDTH, because loadAct
reaches setupNpcAnimation at parse time.

game.js v96, act1.js v70.

## Block 100: the horse is the proponent's own

The proponent dropped a still of their own into assets/ (a saddled bay,
side on, facing right, 1024 by 559) and asked for it to replace the
32px white horse, with a simple animation.

animate-still.js was not used. Its rig is a person's (a head nodded at
the neck, a torso, two legs split at the knee, an arm), and a horse
fits none of it; bending the rig to four legs would be a second kind of
character inside one tool. A held prop already set the precedent for a
tool of its own (animate-bantay.js), so the horse has
_dev/tools/animate-kabayo.js on the same lib/puppet.js and lib/png.js.
It moves two parts and leaves the rest the still: the head and neck,
nodded about the middle of a cut from the front of the saddle to the
chest (cut 8px long behind the line so the seam stays covered), and the
tail, swished about its root and drawn under the body. The tail only
ever tucks in: swung out past where it hangs, its edge left a white
sliver against the rump, seen on the first preview. Twelve frames at 6
fps, a two second loop, small on purpose: a horse at rest.

The still was saved as kabayo-still.png (its delivered name had a space,
which Pages and url() both trip on) and the sheet replaces kabayo.png
under the same name, so the street and the grooming game, which share
KABAYO, both changed with no other content edit. Drawn at half the
still's size: 262px of horse, more than the 120 it is drawn at.

The Kutsero's own line said "puting kabayo" (a white horse), and the
new horse is a bay. The line is the proponents', so it was asked about
rather than changed; the proponent said to drop "puting", and it now
reads "Alagaan mo 'yung kabayo sa kuwadra."

game.js v97, act1.js v71, ASSET_VERSION 35.

## Block 101: the proponent's seven characters, and a calm idle

The proponent dropped seven stills of their own into assets/ ("New
sprites. Replace the old ones. Apply animations to side-facing
characters") and said the idle was "way too exaggerated". Planned first
and answered item by item: the three-quarter figures try the rig and
fall back to a glide only if it looks wrong; "balisig (recruiter)" is
the Mabalasig.

Who got what. Drawn side on, and animated: Nanay (idle and walk; her
walk sheet, owed since Block 93, is now made from her still) and the
Mabalasig (idle only: his hands hold a paper and stay put). Drawn
facing the front, and left still, as the Mananahi was in Block 98:
the Kutsero, the Barbero and Maryam; the Block 99 facesPlayer came off
the Barbero and Maryam, since mirroring a front view turns nothing.
Nanay and the Mabalasig carry it. Drawn three-quarter: the Sultan and
the kawal.

The three-quarter figures needed one thing the tool did not have. Its
walk cuts one leg and draws it twice, the far copy darkened, which is
right side on where one leg hides the other; with both legs side by
side it would give a man four. legSplit, the x between his legs, cuts
each whole leg as its own part, and the march lifts them in turn while
the body rides up a little on each step, which at 120px reads as a man
walking. The kawal's hands are full (a kris and a shield), so his
strike is the thrust: the whole body rocks back through the red ! and
is thrown forward behind the blade, on the attack's timing, which
game.js's tell is written against. The fallback glide was not needed.

A held blade crossing the legs broke on the first preview: the part of
it past the trousers was filled into the legs layer and lifted with a
leg, a blade-coloured scrap. A blade is now traced in two, filled over
the trousers and clear beyond them (CLAUDE.md, Animating a character
from one still).

Nanay's legs are under a skirt to her ankles, which cannot stride like
trousers; stride, a rig field, scales every leg angle, hers 0.35, so
the hem sways and her feet step.

The idle was a 5% breath, a 2.5 degree sway and a 7 degree nod every
1.3 seconds: a man hyperventilating. It is now 1.5%, 0.6, 1.8 at 4 fps,
two seconds a loop, and every rig was run again, so the siga, the
direktor, the Katipunero and the Kasama are calm too. The cells came out
a few pixels shorter at the top with less to fit, so their contentTop
and headroom changed in the content. The horse's nod and tail were
halved with them. Walks and fights are unchanged: those are actions,
and actions are what should read across a street.

The old moro-moro sheets (muslim-walk, muslim-attack) were deleted; the
Sultan no longer borrows his soldiers' walk, and with art of his own
he has a dialogue bust for the first time (verify_new_scene.js expected
none). test.js's example of owed art that is never asked for moved from
the Barbero's, which arrived, to the karpintero's.

game.js v98 (ASSET_VERSION 36), act1.js v72, enemies.js v6.
