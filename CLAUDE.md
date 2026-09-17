# CLAUDE.md

Context file for AI assistants working on this project. It describes
architecture, conventions, and constraints, all of which change rarely.

Current build status is NOT in this file, and neither is the requirement
scoreboard. Both live in TRACKER.md, which is the only file that describes
status. Read it before planning any work.

Two files, and they do not overlap. This one is how the thing is built and
changes rarely. TRACKER.md is where the build is and changes every session.
Nothing else in the repository describes either.

Read in this order at the start of a session: this file, then TRACKER.md.
Both sit in the repository, so read them directly rather than asking for
them to be pasted.

## Source of truth

The repository is public:
https://github.com/fakeplasticfilipino/Capstone-Project

Read the current code from there rather than reconstructing it from
conversation history. Files described in an old chat may be out of date.
Before editing any file, fetch it.

If a file is described here but is missing from the repository, assume it
was written locally and not yet pushed. Ask rather than guessing at its
contents.

Fetches of the GitHub page are sometimes served from cache and may show a
stale file list. If something described here appears missing, say so and
ask the user to confirm rather than concluding it was never pushed.

## Deployment

GitHub Pages, served from the main branch. Pushing to main publishes; there
is no build step. Student testing runs against the live URL:

    https://fakeplasticfilipino.github.io/Capstone-Project/

Every script and stylesheet carries a v=N query string because browser
caching is aggressive on Pages.

## Project

MACARIO, a narrative-driven 2D RPG teaching the life and historical role of
Macario Sakay, for Grade 8 Araling Panlipunan. Capstone project, BSIT,
STI College Dasmarinas.

Three stated objectives, which are what the panel will assess against:

1. A 2D narrative RPG presenting Sakay's life across four acts.
2. Gameplay mechanics including dynamic difficulty, health, equipment, and
   cosmetic rewards.
3. Integrated assessment with per-act pre-tests and post-tests, in-game
   performance scoring, optional user feedback, and a teacher dashboard.

Target device is a low-end Android phone in Chrome, HELD SIDEWAYS, with PC
browsers used for development and testing. This constraint is the
justification for the entire technical approach and should not be traded
away for convenience.

Landscape is the intended orientation and portrait is not a second
supported layout. A phone held upright gets a rotate notice instead. That
one decision is what removed the mobile control overflow from the work
rather than fixing it, because the overflow only ever happened in
portrait.

## Act I's content: a deliberate reset, then built forward again

content/act1.js has gone through three shapes: a proving ground (one room,
one example of every engine system, placeholder dialogue about buko and
errands), a full narrative written directly against the ten item pairs in
db/macario_items_v3.sql (two scenes, five objectives, a stage cutscene, a
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
(Blocks 19-21): Act I is no longer the one-scene blank slate above — it
is now two scenes, tondo and a kutsero flashback, with a fourth
objective (pumunta_entablado) that keeps the act open once the
flashback resolves, since the flashback is a memory within the act, not
the act's own ending. content/items.js correspondingly holds two real
items as of Block 25: Mansanas, a consumable a student eats to heal,
and "Mansanas para sa kabayo", the quest item Kabayo takes (see Item
data format, below). See TRACKER.md, Right now and Blocks done (Blocks
19-23), for exactly what is built, what still has no content (the
entablado itself, a guard, anything past the flashback), and for the
two engine bugs Blocks 22-23 fixed along the way that are unrelated to
this content work.

None of this touched the ENGINE. Every mechanic the fuller version
exercised — dialogue, the stage/death-sequence cutscene, guard patrol and
detection, hazards, hideSpots, platforms, pickups, the shop, equip and
item-effect system — is unchanged, still fully implemented, and still
fully covered by _dev/test.js, which now carries its own private fixture
scene and item catalogue (FIXTURE_ACT1_JS / FIXTURE_ITEMS_JS, near the top
of that file) so those mechanics stay tested independent of whatever
content/act1.js and content/items.js actually ship. See Decisions on
record for why the harness was rebuilt this way instead of shrinking
alongside the content.

Acts II through IV are still registered, loadable stubs waiting to be
written. Once Act I's content comes back for real, it should be built one
verified passage at a time against whatever the resource person's source
material actually says, not reassembled from the version now sitting in
git history.

## Stack

Vanilla HTML, CSS, and JavaScript. No build step, no bundler, no framework,
no ES modules. Plain script tags in document order.

Supabase for auth, Postgres, and row level security. Hosted on GitHub Pages.
Visual Studio Code as the editor.

The proposal document specifies Unity and C#. The implementation uses
neither, deliberately, and is argued from the study's own literature review:
a comparable project was constrained by 3D performance on low-end devices,
and a lightweight browser application addresses that gap directly. Do not
reintroduce heavier tooling.

## Architecture

Four layers, with a strict dependency direction.

Content, in content/actN.js and content/items.js. Pure data. NPCs, stage,
decorations, objectives, starting quests, hazards, pickups, and the item
catalogue. Contains no engine logic. Registers itself on window.

Engine, in game.js. Renders worlds, runs dialogue, animates sprites, and
handles auth, physics, health, stealth, combat and save/load. Knows nothing
about what an act means. Reads act data through loadAct().

Controller, in acts.js. Owns the act lifecycle and is the only file that
writes to act_progress.

Assessment, in assessment.js. Owns the trivia card, both tests, and the
optional feedback form, and is the only file that calls
get_assessment_items or submit_assessment. It reports back by resolving a
promise and never writes act_progress itself. It is optional: acts.js
checks window.Assessment before calling it, and the flow collapses to
playing then completed without it.

Inventory, in inventory.js. Owns player_inventory and player_equipment and
is the only file that reads or writes either, and owns the shop's rules
(what is for sale, what can be bought, what can be used). It reduces the
student's worn items to plain numbers and hands them to the engine through
Game.setEffects, and a consumable's heal through Game.heal, so game.js
never learns that an item exists. Optional the same way assessment.js is:
acts.js checks window.Inventory before calling it, and game.js and
shell.js keep both the inventory and shop buttons hidden without it.

Shell, in shell.js. Owns every screen that is not the game world: title,
pause, settings, inventory and logout. Unlike assessment.js it is NOT
optional and nothing should guard on window.Shell, with one documented
exception at the awaitEntry call in game.js.

The one exception inside shell.js is window.Inventory, which it does guard
on, because that module is optional and the screen it draws is not the way
into the game.

game.js also declares three global UI helpers, used by every file that
writes a button: setLabel, setIcon and makeIcon. They are plain hoisted
declarations rather than methods on window.Game, matching the other
file-scope globals the harness already reads, and they live in game.js
because it is the first file everything else loads after.

Every button in the game is an icon plus a label, so writing a button's
text means writing its .lbl span rather than the button. setLabel does
that, and builds the span when a button carries an icon without one,
because the old fallback of writing the button directly turned a markup
mistake into an icon that vanished the first time the label changed.
That is not hypothetical: it is what happened to the quiz button, whose
label has never been in index.html.

Load order in index.html, which is load bearing:

    supabase CDN
    supabaseClient.js
    content/act1.js      before game.js, which reads window.ACT_1 on start
    content/act2.js      through act4.js, before acts.js builds its registry
    content/items.js     before inventory.js, which reads window.ITEMS
    game.js
    acts.js              after game.js
    inventory.js         after acts.js, which is what calls it
    assessment.js        after acts.js
    shell.js             last

Getting content and engine the wrong way round produces a blank world and
an undefined property error.

The auth bootstrap in game.js is registered on DOMContentLoaded rather than
called at parse time, and must stay that way. acts.js, assessment.js and
shell.js load after game.js, but enterGameAsUser needs all of them. A
student with a stored session has getSession() resolve on a microtask,
before the browser reaches the next script tag, so calling it at parse time
skips the entire act lookup and silently drops everyone into Act I.

## The engine to shell contract

game.js exposes window.Game and nothing else:

    setPaused(bool)      returns false if refused, which it is mid-cutscene
    isPaused()
    flushSave()          awaitable; logout must await it
    setUiBlocked(bool)   suppresses world input while a screen is open
    isSignedIn()
    enterAsGuest()       Block 14; see Decisions on record
    isGuest()
    stats()              { damageTaken, detections, playMs }, a copy
    resetStats()         called by Acts.enterAct, and by nothing else
    setEffects(obj)      { maxHealthBonus, projectileSpeedMult }
    health()             { health, max }, a copy; Block 25
    heal(n)              false and no change at full health; Block 25
    setOutfit(sheets)    awaitable; null restores the base sprites
    currency()
    addCurrency(n)
    spendCurrency(n)     false and no change when the student is short

Currency lives in game.js because game.js is the only writer of
game_progress, and currency is save state exactly like quests, flags and
position. acts.js awards it, inventory.js spends it, and neither touches
the column. An award therefore costs no extra round trip: it rides the
save that was going to happen anyway.

setEffects takes numbers rather than items, deliberately. The engine applies
a bonus and a multiplier and never learns what produced them, which is the
same line game.js holds against acts.js. inventory.js is the only caller.

The engine counts; acts.js reads and writes. game.js still knows nothing
about what an act is, and acts.js knows nothing about how damage happens.

shell.js exposes window.Shell.awaitEntry(), which game.js awaits after the
world is built and before Acts.syncStart runs.

That ordering is deliberate. syncStart resumes the trivia card and the
pre-test, both of which open an overlay. Started before the student has
tapped through the title screen, they would run behind it.

The signal is a direct call rather than an event. shell.js registers its
listeners inside its own DOMContentLoaded handler, which runs after
game.js's, and the browser drains microtasks between the two, so a
dispatched event can be sent before anyone is listening.

## Act data format

An act is a list of scenes. Objectives and quests belong to the act; the
world belongs to the scene.

    window.ACT_N = {
      number, title,
      titleTagalog,                              shown on the title card
      developmentNotice,                         optional; marks a stub
      objectives: [{ id, label, flag }],
      startingQuests: [{ id, text }],
      scenes: [ {...}, {...} ]
    }

Scene shape:

    {
      id,                                        persisted as current_room
      worldWidth, startX,
      dangerous: true,                           optional; shows the hearts
      greyFilter: true,                          optional; desaturates #skyline
      npcs: [...],
      stage: {...} | omitted,
      decorations: [...],
      platforms: [{ x, y, width }],              optional; one-way
      hideSpots: [{ x, width }],                 optional; suppress detection
      hazards: [{ x, width, reason }],           optional; costs one health
      pickups: [{ id, x, y, type: "heart" }],    optional; restores one health
      guards: [{ id, x, patrolFrom, patrolTo,    optional
                 speed, facing, detectRadius,
                 alertRate, decayRate, img }]
    }

Acts written before scenes existed declare worldWidth, startX, npcs, stage
and decorations directly on the act. scenesFor() wraps those in a single
implicit scene, so content/act2.js through act4.js need no changes. Do not
"modernise" them; the fallback is the compatibility guarantee.

A guard whose patrolFrom and patrolTo are within 1px of each other is a
stationary sentry and keeps its given facing.

A hazard's reason is the Tagalog toast shown on contact and defaults to
"Nasugatan ka!". Hazards sit on the base floor and are cleared by jumping;
there is no y. A pickup's y is optional and defaults to the floor, so a
heart can be placed on a platform.

A scene counts as dangerous, and therefore shows the hearts, if it declares
dangerous, or declares any guard, or declares any hazard. The explicit flag
still wins. The derivation exists because a scene that adds a hazard and
forgets the flag would take a heart the student cannot see.

An act with an empty objectives array can never complete, which is how
Acts II through IV are kept from reporting progress they have not made.
That also means the act after it stays locked, which is correct. The
same mechanism works one objective at a time: an objective whose flag
nothing in content ever sets keeps the act from finishing without
needing to be left out of the array, which is how Act I currently
stops short of the courier task.

greyFilter reuses whatever backdrop #skyline already has (Assets/Act
1/Tondo.png, at present) rather than needing a second background
asset for a flashback or memory beat. It is read once, in loadScene,
and toggled rather than only ever added, so a scene without it clears
whatever the previous scene set. See Decisions on record for the
scene it was added for and for Acts.gotoScene now fading to black
around every scene change instead of swapping instantly.

NPC shape:

    {
      id, x, label,
      img: "Assets/X.png"                        static, or
      animation: { src, frames, fps },           sprite sheet
      startsHidden: true,                        optional
      revealedByFlag: "someFlag",                optional; unhides when set
      opensShop: true,                           optional; see below
      stage: 0,                                  conversation index
      dialogueSets: [{ lines: [{speaker, text}], onComplete() }],
      gift: { buttonLabel, requiresFlag, givenFlag,
              responseLines, completesQuest,
              onComplete() }                     optional; onComplete optional
    }

An NPC's x is the left edge of its body, NPC_WIDTH (80) wide, and its art
is drawn standing on the middle of that body (see Bodies, under Decisions
on record). A guard's x and patrol bounds are the left edge of a body
GUARD_WIDTH (40) wide, the same way. A decoration has no body: its x is
the point it stands on.

Talking to an NPC advances through dialogueSets one per conversation,
holding on the last. onComplete fires once, when that conversation ends.
A gift's onComplete fires once, right after its flag and its quest are
both set (endDialogue, game.js), the same position in the sequence a
dialogueSet's own onComplete already has. Most gifts have nothing
further to do once given; Kabayo's (content/act1.js, Blocks 20-21)
uses it to add the next quest, "Pumunta sa entablado", and leave the
scene, Acts.gotoScene("tondo") — the kutsero scene is a flashback, and
resolving it returns Macario to tondo without finishing Act I, which
still has an open fourth objective (pumunta_entablado) nothing sets.

opensShop: true skips dialogue entirely: pressing E opens Tindahan
directly (Game.onShopRequest, below), and the NPC needs no
dialogueSets at all — none are read if opensShop is set, checked
before dialogueSets would ever be (handleInteractPress, game.js). An
NPC with both would have opensShop win and dialogueSets go unused,
which is not a useful thing to declare on purpose.

Game.onShopRequest(fn) is the facade call shell.js registers a single
listener with, the same shape Inventory.onChange(fn) already uses in
the opposite direction: game.js knows an NPC just asked for the shop
(opensShop, pressed) but does not know what a shop is or how to draw
one; shell.js knows how to open one (Shell._openShop(), the same
path #btn-shop uses) but has no reason to watch every
NPC interaction for one that wants it. Registered once, in shell.js's
init, alongside Inventory.onChange, since _openShop is a no-op without
window.Inventory anyway. This is not the one documented exception to
game.js never calling into shell.js (Shell.awaitEntry()) — game.js
still calls nothing on Shell directly; it calls a listener shell.js
handed it, the same indirection Inventory.onChange already relies on.

## Item data format

Items are pure content, in content/items.js as window.ITEMS. They hold no
secret and are identical for every student, so a database round trip on a
low-end phone would buy nothing. Only ownership is stored.

    {
      id, name, description,
      kind: "equipment" | "cosmetic" | "consumable" | "quest",
      slot: "weapon" | "accessory" | "outfit",   equipment and cosmetic
                                                 only; shown as Sandata,
                                                 Anting-anting, Damit
      price,                                     in-game currency; 0 is
                                                 not for sale
      img,                                       picture on the tiles
      icon: "i-apple",                           optional; symbol shown
                                                 until img exists
      grantedOnAct: 1,                           optional; handed over on
                                                 entering that act
      effect: { projectileSpeedMult: 1.5 }       equipment only; applies
            | { maxHealthBonus: 1 }              while worn
      sheets: { walk: {...} }                    cosmetic only; any of
                                                 idle, walk, dead
      use: { heal: 1 },                          consumable only; applied
                                                 once by Gamitin
      maxStack: 5,                               consumable only; default 5
      forQuest: "questId",                       quest only; on sale only
                                                 while that quest is open
      buyFlag: "someFlag"                        optional; see below
    }

There are three groups, and the inventory screen, the shop and
inventory.js all speak in them.

Permanent items are kind "equipment" (slot weapon or accessory) or kind
"cosmetic" (slot outfit). Bought or granted once, kept, and worn in the
slot they name, one item per slot. Equipment's effect applies only while
worn. A cosmetic carries sheets and never an effect, which is what makes
it cosmetic. The slot ids are what player_equipment.slot stores and are
never renamed; Sandata, Anting-anting and Damit are the labels.

Consumables are kind "consumable". No slot, so equip and toggle refuse
one. They stack: buying another adds to player_inventory.quantity on the
same row, up to maxStack. Carrying one does nothing. Gamitin
(Inventory.use) applies its use once and spends one; a use that would do
nothing, a heal at full health, is refused and spends nothing, the same
rule a heart pickup follows. The last unit's row is deleted rather than
left at quantity 0. use.heal is the only use built.

Quest items are kind "quest". No slot, no use, never more than one. They
exist to be handed over: content calls Inventory.consume(id) at that
moment (Kabayo's gift takes "mansanas-kabayo"). A quest item with
forQuest is listed in the shop only while that quest is logged and not
done, so it is neither a spoiler before the quest nor a trap after it.

buyFlag names a story flag, in state.flags rather than in the
ownership table inventory.js otherwise owns entirely, set the moment
the item is bought (Inventory.buy) and not before; granting via
grantedOnAct does not set it. It exists because a gift's requiresFlag
(Act data format, above) can only ever read state.flags, never call
Inventory.owns() directly. Optimistic and rolled back together with the
ownership row on a failed write, and set only once.

A cosmetic's sheets take the sprite sheet shape below. An outfit replaces
whichever of the three it declares and leaves the rest alone, so a skin
that only redraws the walk cycle is a complete outfit.

An earlier draft of this section named the effect projectileCooldown. There
is no cooldown in the engine and never was: the limiter is one projectile in
flight at a time. The built effect is projectileSpeedMult, which scales
PROJECTILE_SPEED, and because a faster spear also clears that limiter sooner
it makes the throw both quicker and more frequent from one lever.

Effects are deliberately small and few. A faster projectile and one extra
heart are the whole design brief; anything that needs a balance spreadsheet
is out of scope. Bonuses add and multipliers multiply, so an item with
neither contributes nothing.

The outfit art does not exist yet. A missing sheet falls back to the
dashed placeholder box naming the file it wanted, exactly like every other
missing sprite in this project. An outfit with no art is still bought,
still worn, and still shown that way. The item's own tile picture (img)
is the one exception to the placeholder rule; see Icons.

An item id is a text key with no foreign key behind it. An item deleted
from the content file leaves an orphan ownership row that inventory.js
ignores, which is the correct failure: a student's save is not corrupted by
an edit to a content file. For the same reason an id is never reused for a
different item. Block 25 had to break that once, when "mansanas" stopped
meaning the horse's apple; see Decisions on record.

## Icons

Every button carries an icon beside its label. The labels stay: a
pictogram alone is a guess, and the audience is Grade 8 students
getting one attempt each on a screen they have never seen.

The icons are inline symbol definitions in index.html, referenced with
use href="#i-name". They cost no request, cannot 404, and inherit
currentColor, so an icon is whatever colour its button already is.
That is why they are strokes rather than glyphs.

There is no icon art and none can be invented. Assets/ holds a floor
tile, the player's walk cycle, and — as of the folder reorganisation
into Assets/Act 1 and Assets/Prefab — one real commissioned sprite,
Nanay (see Act I's content, above, and Decisions on record). Three
more NPCs joined content/act1.js since, in the kutsero scene (Kabayo,
Kutsero, Tindero — Blocks 19-20), and none of the three has real art
either (Kutsero gained real art in Block 27; see Decisions on record):
their img fields point at Assets/Horse.png, Assets/Kutsero.png
and Assets/Tindero.png, none of which exist on this device (see
TRACKER.md, Known problems, missing production art). Any future NPC,
guard or decoration without real art falls back to the dashed
placeholder box naming the file, same as any other missing image, so
referencing an icon PNG would fill the screen with those.

Unicode and emoji were the cheaper option and were rejected on a render
rather than on principle: the crossed swords fell back to a thin
monochrome cross, the up arrow drew as a blue emoji tile, and the
speech bubble stayed full colour, so one row of buttons carried three
different presentations. Font coverage on a low-end Android is a
different set again, and the failure would only have shown up with the
phone in hand.

The icon and the label are pointer-events: none, so the BUTTON is
always the hit target. Without that a tap lands on the icon; the
listeners are on the buttons, so the event still bubbles and the game
still works, which is exactly how it would have shipped unnoticed, the
same way the dead Atake button did. It broke the harness immediately,
because a check that clicks refuses a button whose hit target is a
child. It also keeps every e.target in this codebase pointing at a
button rather than at an svg inside one.

Two places take a badge rather than a pictogram. Quiz answers get
A B C D, because there is no icon for an arbitrary sentence and four
identical marks would be decoration; the letters are also what lets a
teacher say "pindutin ang B" out loud. The text size choices get the
same letter at three sizes, which is the one icon in this game that
carries its meaning without a word beside it.

An item's picture on the inventory and shop tiles is the one missing
image that does NOT become the dashed placeholder box. A tile is too small
for a box that names a file, and a grid of those would teach nothing, so
the tile shows the item's symbol (its icon field, else its slot's symbol,
a scroll for a quest item, else the bag) and the img loads over it when
the file exists. The filename is kept in the tile's title attribute so the
artist can still find out what is owed. Sprites, NPCs and outfit sheets
keep the placeholder box.

A button whose label is written in JavaScript still declares an empty
.lbl span in index.html. Adding an icon to a button with no span was
what broke the quiz button; the empty span is the fix, and setLabel
building one is the backstop.

## Sprite sheets

Sheets may be a single horizontal strip or a grid. The optional columns
field is how many frames sit across one row; omit it and it defaults to
the frame count, which is the single-strip case.

    { src: "Assets/Walk.png", frames: 12, fps: 12, columns: 5 }

loadSpriteSheet derives frameWidth, rows, and frameHeight from that.
frameHeight is always derived from naturalHeight divided by rows, never
assumed, or a multi-row sheet renders at 1/rows size. Both the player
animator and setupNpcAnimation handle grids.

A sheet's frame is a fixed-size cell, not the size of the character drawn
inside it, and real art rarely fills its cell edge to edge. Two more
optional fields, contentTop and contentHeight, say where the character
actually sits within that cell, in the sheet's own native pixels:

    { src: "Assets/Prefab/Macario_Idle.png", frames: 16, fps: 6,
      columns: 5, contentTop: 73, contentHeight: 106 }

Measure both from the real art's alpha channel — the union of every
frame's non-transparent bounding box, so no pose gets clipped — never by
eye, and never by hand either: run

    node _dev/measure-sprite.js <path-to-png> --columns=N --frames=M

which prints every frame's own box, flags any frame whose content
height strays far enough from the union that a single number cannot
correct it (see _dev/README.md), and prints the contentTop/contentHeight/
footX line ready to paste in. It depends on nothing beyond Node itself — the
PNG decoding is plain chunk parsing and node:zlib, not a library — and
is what produced every number in this section and in Decisions on
record. spriteFit (in game.js, just above loadSpriteSheet) turns them into
the scale and background-position shift that renders the CHARACTER, not
the frame, at DISPLAY_HEIGHT tall with its feet on the box's bottom
edge, which is what actually puts a character on the ground and makes
its height comparable to any other sheet's. Omit both fields and a sheet
falls back to the old behaviour exactly (the full frame scaled to
DISPLAY_HEIGHT, feet wherever the frame's own bottom edge happens to
be) — this is why cosmetics with no art yet and the test harness's own
fixture sheets need no changes to keep working. See Decisions on record
for the numbers measured for Macario and Nanay and why this was needed;
the same measurement is owed to Dead.png and to any outfit's walk/idle/
dead sheets once real art exists for them.

A third optional field, footX, says where the character STANDS inside
the cell horizontally, in the same native pixels. It is what lines the
art up with the character's body (see Bodies, under Decisions on
record): bodySprite in game.js puts that point on the middle of the
body and flips the sprite about it. measure-sprite.js prints it on the
same paste line, measured from the bottom fifth of the drawing (the
feet and lower legs) averaged across frames, not from the whole
drawing, because a pose that reaches (Macario_Shooting.png's extended
arm) drags the whole drawing's centre forward of where he stands.
Omit it and the sheet is assumed to stand in the middle of its cell.

    { src: "Assets/Prefab/Macario_Idle.png", frames: 16, fps: 6,
      columns: 5, contentTop: 73, contentHeight: 106, footX: 130 }

A change to footX, like contentTop/contentHeight, is a change to the
content file that declares it, not to the image.

Every image load goes through assetUrl(), which appends the ASSET_VERSION
constant in game.js. Images are not covered by the v=N strings in
index.html, so without this the browser and the Pages CDN serve stale
sprites indefinitely after a file is replaced. Bump ASSET_VERSION whenever
anything in Assets/ changes, and bump the game.js script version too, since
the browser must refetch game.js to learn the new asset version. A change
to contentTop/contentHeight is a change to the CONTENT file that declares
them (game.js for the player, content/actN.js for an NPC), not to the
image, so it needs that file's own v=N bumped rather than ASSET_VERSION.

A sheet may also declare startFrame and endFrame, in frame numbers
rather than pixels, to play only part of itself:

    { src: "Assets/Prefab/Macario_Shooting.png", frames: 12, fps: 8,
      columns: 5, startFrame: 0, endFrame: 2, loop: false,
      contentTop: 63, contentHeight: 126, footX: 117 }

This is what lets one image be declared as more than one named entry in
BASE_SPRITE_SHEETS (see shootAim/shootFire, and Decisions on record) —
two poses drawn on the same sheet by an artist, or a single sheet with a
distinct "aim" and "fire" portion, without splitting the art into two
files. applyAnim starts playback at startFrame instead of always 0, and
updateAnimFrame steps and (with loop: false) holds within
[startFrame, endFrame] instead of [0, frames - 1]. Both default to 0 and
frames - 1 when absent, so every sheet before this one is unaffected.
The two fields describe frame RANGE only; contentTop/contentHeight are
still measured once for the whole sheet, since every frame in it shares
the same cell geometry regardless of which named entry plays it.

Missing images do not break anything. They fall back to a dashed
placeholder box showing the expected filename.

## Scenes

Scenes are changed with Acts.gotoScene(id), which is distinct from
Acts.enterAct: the act, its objectives and its act_progress row are
unchanged, only the location moves. The scene id is persisted in
game_progress.current_room, and an unknown id, including the "empty" that
pre-scene saves hold, falls back to the act's first scene.

## Objectives

Objectives map to story flags in state.flags. Because flags persist inside
game_progress.save_state, objective progress survives a reload without
needing separate storage.

## Database

Tables: profiles, classes, game_progress, act_progress, assessment_items,
assessment_scores, act_trivia, player_inventory, player_equipment,
game_sessions, feedback.

Functions: my_role, my_class_id, is_teacher_of, get_assessment_items,
submit_assessment.

Row level security is the actual security boundary. Client-side role checks
are usability guards only and must never be described as security.

Three policy rules that were learned the hard way:

Policies that query each other across tables cause infinite recursion. Use
security definer helper functions instead. Never name one current_role,
which is a reserved SQL keyword.

Do not write a policy that looks a student up through another table that has
policies of its own. Carry student_id on the row instead, even when it
duplicates a column reachable by join.

feedback has no update and no delete policy, deliberately. A student who
wants to change their answer has no mechanism, which is correct for a
research instrument.

WHICH TABLES A STUDENT MAY DELETE FROM. A reset button is safe or
unsafe entirely on this answer, so it is written down here:

    player_inventory     delete policy exists
    player_equipment     delete policy exists
    game_progress        select, insert, update. No delete
    act_progress         select, insert, update. No delete
    game_sessions        select, insert, update. No delete
    assessment_scores    select and insert only. No update, no delete
    feedback             select and insert only. No update, no delete

So the catastrophe a reset button invites is structurally impossible
from a browser: an assessment score cannot be deleted or altered by the
student who wrote it, which is what makes one attempt per act per test
type mean what it says. Row level security is what makes that true, not
any check in the client.

act_progress is the row that could still be damaged, because it does
carry an update policy. Rewriting it would destroy performance_score,
objectives_done and the counters while leaving the scores stranded, and
no replay could restore them, because assessment.js skips a test that
already has a score. Nothing in the client writes act_progress back to
an earlier state, and nothing should.

Schema v5 adds the one deliberate exception, and adds it as a function
rather than as a policy. reset_my_play_data() is security definer, so
it runs with the privileges of its owner and row level security does
not apply inside it. That is exactly why it takes no arguments and
resolves the student from auth.uid(): the only thing a caller can ask
for is their own erasure, and only if is_reset_allowed() names them.
The table policies above are unchanged, so nothing else in the client
gained any new power.

Assessment items have RLS enabled with no student read policy. Questions
are served by get_assessment_items, which omits correct_index, and grading
runs in submit_assessment. The answer key must never be sent to the client.
Do not add a student read policy to that table.

## Conventions

Comments explain why, not what. Existing comments record reasoning and
tradeoffs; match that register.

Whole-file replacements, not hand-applied patches. The user has asked for
this explicitly. Present complete files.

Do not write a block's technical plan into the repository, or into the
connected project, as its own document. Plan in the session, present the
plan in the conversation, and keep the reasoning in context while the block
is built. A spec file per block is a third status document by another name:
it is accurate for about a day, it goes stale the moment the block ships,
and it then has to be corrected alongside everything else.

What outlives a block goes in one of two places and nowhere else. Decisions
and formats that shape future work go in this file, under Decisions on
record. Status, next action and what has been run go in TRACKER.md. If a
piece of the plan fits in neither, it was working material and belongs in
the conversation only.

Documentation style: plain professional prose. No emoji, no checkboxes, no
bold, no em dashes, no horizontal rules. Status markers in parentheses:
(COMPLETE), (IN PROGRESS), (NOT STARTED), (BLOCKED).

Tagalog for all player-facing text. English for code and comments.

Every change ships with a verifiable checkpoint. State what the user should
see, and what failure looks like, before they test.

Additive work is preferred over refactors when both would work. Refactors
of working code require a commit first.

Simple beats complete. This is a capstone with a fixed defense date, not a
commercial game. When a requirement can be met by a small mechanic that is
honestly described, build that rather than the full version.

## Decisions on record

Class assignment is administrator-assigned. Students cannot self-register.
The join_code column exists but no student-facing join screen is built.
This is a deliberate change from the proposal's User Authentication
requirement and is the right one for supervised classroom sessions.

Assessments allow one attempt per act per test type. Enforced by a unique
constraint and by submit_assessment. A pilot run on a study account
therefore consumes that student's attempt, so pilot and study accounts must
be separate.

Assessment items live in the database because the table holds the answer
key. Item and cosmetic definitions live in code because they hold no
secret. Only ownership needs a table.

The trivia card must not contain the answer to any pre-test item. It is
shown before the pre-test, so a fact drawn from the tested content inflates
the pre-test and shrinks the measured gain.

Pre-test and post-test items are matched pairs: same topic, same difficulty,
different wording, key in a different position.

game_progress.currency is client written. A student with the console open
can set it to anything, which is acceptable because currency buys cosmetics
only and touches nothing the dashboard reports. State this in the
documentation rather than letting a panel find it.

The teacher dashboard runs four scoped queries and stitches results in
JavaScript rather than using a joined view or RPC. RLS enforces correctness
per query. Class sizes of 40 to 50 make the extra round trips immaterial.

The dashboard uses plain tables with no charting library, matching the
documented limitation that it provides basic summaries only.

The act_progress state machine is locked, trivia, pretest, playing,
posttest, completed. Every state can be resumed into and exited from, which
was the condition for writing any of them.

Acts unlock in order: act N requires act N-1 completed, checked against
act_progress rather than a story flag. This is a teaching tool, not a
competitive game, so a console-level bypass is not worth defending against.
RLS protects the data that matters.

Combat and stealth are deliberately minimal by decision: tap to attack,
hold for ranged, and a simple detection radius with no line of sight
calculation.

Detection is a meter rather than a switch. A bar that is visibly filling
is what teaches the mechanic; an instant catch teaches only that the level
is unfair.

Melee reads the guard's facing. From behind an unalerted guard it is a
takedown; from the front it alerts the guard and costs a health point.
That is what makes stealth and combat interlock rather than sit beside each
other, and it means a corridor can be solved two ways.

Dynamic difficulty is guard speed, scaled by act number, and nothing else.
Speed changes the detection window, the cost of a mistimed run, and how much
ground a patrol covers, so one lever moves the whole difficulty curve. A
system with more knobs would need tuning data this project will never
collect.

There is no game over. Reaching zero health returns the player to the start
of the scene at full health. A fail state that ejects a Grade 8 student
from the lesson serves nobody.

Health is not persisted and restores to full on load. A student who closed
the tab on one heart should not be punished for a bus arriving.

Hazards are scene regions that cost one health on contact, subject to the
same invulnerability window as a guard catch. Heart pickups restore one
health and do not respawn within a visit to a scene.

A guard catch respawns the player at the start of the scene. A hazard does
not; it knocks them clear of the band instead. Being returned to the
entrance for one heart turns a small mistake into a large one, and the
knockback is load bearing rather than decorative: without it the player
stands in the band and loses every heart while holding still. damagePlayer
takes a respawn argument for this, and running out of health respawns
regardless of it.

A pickup is refused, not consumed, at full health. A student who walks over
the last heart before the corridor should not lose it for having been
careful.

Dynamic difficulty is the formula 1 + (act - 1) * 0.15, applied to the
content's guard speed once in buildGuards rather than every frame in
updateGuards. Act I is 1.00 and Act IV is 1.45. The act number is read from
currentActData.number and never from window.Acts, because loadAct runs at
parse time before acts.js has executed. Scaled speed must stay well under
the player's SPEED of 5 or a corridor stops being solvable by running.

Platforms are one-way: passed through from below, landed on from above.

Physics is integrated against the real frame delta rather than counted in
frames. The target device will not hold 60fps and a frame-counted jump
would reach half its height at 30.

Pause halts the loop rather than covering it, and offsets the
invulnerability and attack-hold timers, which are measured against
performance.now() and do not stop for a screen.

Logout reloads the page rather than returning to the title screen. The
engine holds per-student state in a dozen places and missing one means the
next student on a shared classroom phone sees the previous student's
progress.

Settings persist to localStorage, not the database. They are a device
preference rather than student data.

Performance score is a weighted sum:

    score = 50 * completion + 25 * survival + 25 * stealth

    survival = 1 - min(1, damageTaken / 6)
    stealth  = 1 - min(1, detections / 5)

Completion carries half the weight so that a student who finishes every
objective scores at least 50 however badly they played, because completion
is what the two tests measure against and the performance score should not
contradict them. The two budgets are chosen, not measured; this project
will never collect the playtesting data to justify a different pair.

Time taken is recorded but not scored, because a timer rewards skipping the
dialogue, which is the entire lesson.

A guard catch increments both damageTaken and detections. The two terms are
correlated by design: being seen is a stealth failure and it costs a health
point, which is how the game already treats it.

The counters are persisted inside game_progress.save_state, unlike health.
Health is a moment-to-moment resource and restoring it on load is a
kindness; the counters are a record, and a student who resumes an act would
otherwise read as having played the replayed half flawlessly.

Act completion is written before the feedback form opens. A student who
closes the tab on an optional form must not lose a completed act and a
graded post-test.

game_sessions rows are written by acts.js and by nothing else, per act
entry rather than per login. A NULL ended_at means the session was
abandoned, which is data rather than a defect. There is deliberately no
beforeunload handler closing them: beforeunload is unreliable on mobile
Chrome, and a half-working close would make NULL mean two things.

User feedback is optional and skippable. A required form after a post-test
would be answered by a student who wants to leave, which is worse than no
data.

Items are granted on entering the act whose content names them, through
grantedOnAct and Inventory.grantForAct. Block 10 has no shop, and an
equipment system a student cannot reach during the only act with content
would close a requirement on paper and demonstrate nothing. Block 11's
purchase path sits beside this rather than replacing it.

The grant runs from both Acts.syncStart and Acts.enterAct. A fresh student
logging into Act I never reaches enterAct, so the login path needs its own
call. It is idempotent twice over: the in-memory check saves the round trip
and the unique constraint on (student_id, item_id) is the real guarantee.

Equipment writes are optimistic, unlike act_progress and unlike the session
rows. The screen changes first and the row follows; a failed write puts the
screen back and says so in Tagalog. Equipment is not study data, and a
student on a classroom phone should not watch a spinner to put on an
amulet. act_progress gets the opposite treatment for the opposite reason.

A raised maximum health arrives full. A fourth heart that renders empty
until the student happens to find a pickup reads as a broken item rather
than a reward. Unequipping clamps health down to the new maximum.

Equipment effects derive from player_equipment and are not written into
save_state. There is no second copy of the truth to fall out of step.

(Superseded by Block 25, below: each screen now has exactly one door.)
The inventory and shop screens were reached from pause and from nowhere
else through Block 12. Block 13 added a second door: #btn-inventory and
#btn-shop, next to #btn-pause in the main UI rather than in the mobile
control cluster (which already overflows the viewport at 412px, a known
problem, and a further button in that row would make a documented fault
worse to save one tap). Either door still stops the game for the whole
visit, so an effect can never change under a running frame; a direct
open pauses the world itself rather than relying on openPause having
already done it. See Decisions on record, Block 13, for how shell.js
tells the two doors apart on the way back out.

The Agimat's extra heart is not compensated for in the performance score.
DAMAGE_BUDGET of 6 was chosen against a three-heart run, so a student
wearing the amulet can absorb more before the survival term moves. The
term measures damage taken rather than hearts remaining, so it stays
comparable between students either way, and re-tuning a budget that was
chosen rather than measured would only move the arbitrariness.

An act pays exactly its rounded performance score, in two parts that sum
to it. The completion term of the score is worth 50, so that half is
dripped as objectives land, floor(50 / objectives_total) each, and the
remainder is paid on completion. A student is paid for what they finish
and paid again for how well they did it.

Paying during the act rather than only at the end is what makes the shop
reachable inside one class period. Act I has five objectives, so a student
holds 50 before the outpost is over, which is the price of the cheaper
outfit. Data collection covers Act I only, so an award that arrived after
the post-test would never be spent by anyone in the study.

Nothing new is stored to keep the drip idempotent. The amount already paid
is the per-objective rate times objectives_done, which act_progress
already holds, so a reload cannot be paid twice.

Outfit prices are set against what one act pays. 50 and 90, against an
award of 50 to 100, so every student who completes an act can afford the
cheaper one and a strong run affords the better one. A shop that is a
locked door to a student who struggled contradicts the no-game-over rule.

Purchases are optimistic and refunded on a failed write, like equipping.
Being charged for an item the database never recorded is the one failure
in this system a student would actually notice.

The settings screen offers a full reset: every row the student owns, in
all seven tables, so they start the game from the very beginning. The
account, its class enrolment and its password survive, so this is
"start over" rather than "delete me", and the student stays logged in.

It runs entirely in the database, through reset_my_play_data() in
schema v5. It could not have been done any other way. A browser cannot
delete an assessment score, because that table has a select policy and
an insert policy and nothing else, and that must stay true: it is what
makes one attempt per student per act per test type mean what it says.
Adding delete policies would have been the smaller migration and the
wrong one, since it would hand every student's browser the permanent
ability to erase its own scores. A security definer function is
narrower: it does one fixed thing and the caller cannot vary it. It
takes no arguments, so there is no student_id in the request for
anyone to edit.

WHO MAY CALL IT is a named list inside is_reset_allowed(), copying the
precedent in db/reset_test_accounts.sql, which names the two test
accounts explicitly rather than taking a role. A role check would not
work: pilot students and study students are both role 'student', and
create_accounts.js issues both as mag-aaralNN@example.com, so no
pattern separates them either. Only a list does. shell.js hides the
button unless can_reset_my_data() says yes, but that is a courtesy so
that nobody is offered something that will be refused. The guarantee is
the function raising NOT_ALLOWED, which happens in the database and
cannot be reached around by editing the page or using the console.

Adding a pilot address later is one create or replace of
is_reset_allowed and a line in the Run log, not a new migration.

The reset is awaited rather than optimistic, unlike equipping and
buying. It is the one action on these screens a student cannot simply
repeat to find out whether it took.

It reloads the page on success rather than repainting. After the wipe
every module in memory still holds the state of a student who no longer
exists in the database, and rebuilding that in place would mean a reset
path through every file, each one a chance to leave something behind. A
reload runs the real login sequence, which already knows how to start a
student who has never played.

Game.stopSaving() is called first, and exists only for this. All four
write paths have to stop, not just the debounce: the pending timer, the
ten second autosave, the beforeunload flush that reads saveDirty, and
saveProgress itself, which is gated on saveReady. Anything that writes
between the wipe and the reload puts part of the old student straight
back, which is the difference between a fresh start and a half-wiped
account that looks fine and is not.

db/reset_test_accounts.sql stays. It clears the same seven tables for
the named test accounts without anyone logging in, which is still the
right tool when an account is wedged or when several need clearing at
once.

Touch targets are 44px MEASURED ON GLASS, which after --zoom of 0.7
means 63 CSS pixels for a height and the diameters already recorded for
the control cluster. That arithmetic had only ever been done for the
control cluster. Everything on a screen was still stated as 44 CSS
pixels, which is 30.8 rendered: the four answers to a test item, every
menu button, the text size choices, the shop rows, and the pause
button, which was 44 everywhere. All of them now clear 44 on the
device, and checks measure the rendered element rather than the
stylesheet.

Those overrides sit at the END of style.css rather than in the
phone-landscape block at the top, because several of the elements are
styled from ids further down and an id inside a media query does not
outrank an identical id after it. Source order is the only thing that
settles it, which is already true of the button diameters.

The camera is one number, --zoom in style.css, and the visible world is
always screen size divided by it. 1.75 on desktop, 0.7 on a phone in
landscape.

The phone number came from the jump rather than from taste. JUMP_VELOCITY
of 14 against GRAVITY of 0.8 puts Macario's head 370 world pixels up at the
apex. At zoom 1 that was 90% of the screen height, so a single jump reached
the top and the world read as a corridor with a ceiling. At 0.7 it is 63%.
1.75, 1.25 and 1 were each tried on the device and each still read as
zoomed in, menus included, because every screen in this game lives inside
#app-scale and scales with this number.

Below 1 the zoom shrinks rather than magnifies, and the controls shrink
with it. The phone-landscape block therefore states button sizes for that
context and picks them so the RENDERED result is right: movement at 96
lands at 67 on glass, the action buttons at 76 land at 53, both clear of
the 44px minimum. Movement is deliberately the largest, because it is the
control a thumb rests on for a whole act. Changing --zoom means redoing
that arithmetic. Two checks measure the rendered button rather than the
stylesheet, and one jumps and measures the headroom, so neither can ship
wrong.

Every placeholder box is DISPLAY_HEIGHT tall and 70% of that wide, at all
four call sites: the player, animated NPCs, static-image NPCs and guards.
The last two were 80 by 112 until the camera was pulled back far enough to
show Macario standing next to somebody, at which point he was visibly a
head taller than every character in the game. A placeholder is a stand-in
for a sprite, so it has to occupy the space that sprite will.

Portrait shows a rotate notice, and its visibility is pure CSS. There is no
JavaScript state that can leave it up on a screen that has already been
turned. shell.js only mirrors the same media query into uiBlocked, so
guards do not patrol and hazards do not bite behind a screen the student
cannot see past, and no play time is counted against it.

The ERD is revised to match what is built rather than the reverse.
PlayerAction and the achievement entities are dropped: a per-action replay
log costs writes on a phone on mobile data and would never be queried, and
achievements add nothing that currency and cosmetics do not already cover.

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
correct answer in db/macario_items_v3.sql already commits to it: Tondo,
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
Macario's mother specifically (Assets/Act 1/Nanay.png, a 5-column by
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
coverage along with the narrative, _dev/test.js now carries its own
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
See _dev/test.js, AH, for the coverage: the button entering the world
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
seemed premature without that evidence. See _dev/test.js: no new coverage
was added for this block, since it changes only color values and the
existing suite already exercises every screen touched; the full 327-check
suite (310 plus Block 14's 17) was re-run after the retheme with no
regressions.

Macario's own base walk and idle sprites are real commissioned art, not
Claude-drawn placeholders: Assets/Prefab/Macario_Walking.png (1280x1024,
a full 5-column by 4-row grid, 20 frames) and Assets/Prefab/Macario_Idle.png
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
game.js to learn the new asset version. _dev/test.js, section Y, had three
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
discarded in the same session. _dev/measure-sprite.js is that script
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

A third real commissioned sprite, Assets/Prefab/Macario_Shooting.png (a
500x500, 5 by 5 grid, 25 frames), was added and wired in as Macario's
ranged-attack pose — there was previously no dedicated animation for
that action at all; holding the attack button to throw (Ibato) left
whatever pose (idle or walk) the player was already in unchanged while
the projectile spawned. Measured the same way as the other two
(_dev/measure-sprite.js, contentTop 23, contentHeight 51 of a 100px
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

Covered in _dev/test.js, section AI: both sheets load without falling
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

Assets/Act 1/Tondo.png is now real commissioned art (1983x793, a painted
Tondo river-village scene, not a texture drawn to tile seamlessly) and
replaces the placeholder path the CSS and game.js previously pointed at
(Assets/Tondo.png, root). It lives in Assets/Act 1/ rather than
Assets/Prefab/, matching Nanay.png, since this backdrop is Act I's alone
(see Act data format). Assets/Act 1/Tondo_Night.png was renamed to match
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

Covered in _dev/test.js, section AJ: #player's computed z-index is
positive; the skyline loads Assets/Act 1/Tondo.png without falling back
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
passed, 0 failed. Second, _dev/verify_new_scene.js (Block 19's
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
exercises) and by rewriting _dev/verify_new_scene.js's ending: it no
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
_dev/verify_new_scene.js, extended with two more checks on the real
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

_dev/test.js's own Section AL assertion was too weak to have caught
this: it checked the throw against posX + PLAYER_WIDTH, the same
narrower bound the buggy code used, so it could not fail regardless
of which fix was in place. Rewritten to check against
playerSpriteEl.offsetWidth instead — the box a player actually sees —
so it would have failed against the Block 22 version and now passes
against this one. game.js's script version to v31; _dev/test.js is
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
played the kutsero scene, so db/reset_test_accounts.sql was the whole
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

Melee clip and Kutsero's art (Block 27). Two commissioned sheets
arrived: Assets/Prefab/Macario_Melee.jpg (4 by 3, 12 frames, a punch)
and Assets/Act 1/Kutsero.png (5 by 3, 14 frames, a front-facing idle).
Both were measured with measure-sprite.js. The melee sheet is a PNG with
transparency saved under a .jpg name; browsers decode by content, so it
is referenced as delivered, and renaming it later means changing the src
in BASE_SPRITE_SHEETS.melee and bumping ASSET_VERSION.

A tap on Atake now plays the punch (playMelee, 12 frames at 24fps, half a
second) through the same shooting variable and hand-back timer the fire
clip uses, so every existing reset path already clears it. The hit still
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

The redrawn shooting sheet (Block 28). Assets/Prefab/Macario_Shooting.png
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

## Pitfalls

Clear the Supabase SQL editor before pasting. Leftover text executes
alongside the new query.

Increment the v=N cache-buster on any script or stylesheet you change, or
mobile browsers keep serving the cached copy.

Test teacher login in an incognito window. An active student session takes
precedence otherwise.

A NULL class_id on a teacher account is correct. Teachers own a class
through classes.teacher_id rather than being enrolled in one.

If students have no class_id, every teacher policy returns zero rows
silently, with no error. Check this first when the dashboard looks empty.

Adding a filename to .gitignore does not untrack an already committed file.

#mobile-controls is pointer-events: none, so taps land on the world between
the buttons rather than on the invisible bar holding them. Every cluster
inside it therefore has to set pointer-events: auto. .action-cluster did
not, and Atake and Talon did nothing at all on a phone for four blocks.
Nobody caught it because a desktop plays with J and Space, and the harness
drove keys too. Any new cluster added to that bar needs the same line, and
any new on-screen button needs a check that clicks it rather than one that
reads its style.

An icon inside a button becomes the hit target unless it is set to
pointer-events: none. The listeners are on the buttons, so the tap
still bubbles and the game still works; only a check that CLICKS
catches it. This is the same fault class as the dead Atake button and
was caught the same way.

Writing textContent on a button destroys its icon. Every label write
goes through setLabel, into the .lbl span. There were six such sites
and two of them were easy to miss: game.js writes the interact button
every frame, including from the branch that runs while a screen is up,
and assessment.js clones its button before writing it.

A number stated in CSS pixels is not what lands on glass. Multiply by
--zoom, which is 0.7 on the target device, before believing any size in
this stylesheet. A 44px minimum written before the camera moved back
now means 31.

loadAct() runs at parse time, near the top of game.js, and reaches deep
into the file through loadScene. Anything it touches must be a hoisted
function declaration, not a const declared further down, or it throws on
the temporal dead zone before the login box ever renders. The HUD lookups
use a cache hung off the function itself for exactly this reason.

saveProgress refuses to write until saveReady is set, at the end of the
login sequence. loadAct runs once at parse time to draw the backdrop behind
the login box and adds that act's starting quests, which marks the save
dirty; the debounced write then fires mid-login with Acts.current still at
1 and overwrites the student's stored act.

The same debounce is why logout awaits Game.flushSave() before signing out.
On a shared classroom phone, logout is used seconds after something
happened, which is exactly the window the debounce would drop.

Acts.syncStart awaits the entire pre-act flow, trivia card and pre-test
included. Anything that gates entry has to sit before it, not after.

The currency drip in checkObjectives pays nothing while _lastDone is -1,
and that guard is load bearing rather than defensive. saveProgress calls
checkObjectives on its own cadence, and the debounced save fires between
saveReady and syncStart on every login, before syncStart has read what the
student had already finished. Without the guard, a student resuming an act
four objectives in is paid for those four objectives again on every single
login. The harness caught it; nothing appeared in the console.

A guard's img field is accepted by the act data format and does nothing.
buildGuards() in game.js only loads art through the animation branch; the
else branch calls showPlaceholder() unconditionally and never attempts to
read guard.img at all. An NPC's img and a guard's img look like the same
field and are not: give a guard a static image and it stays a box forever,
silently, with no error. Declare a guard's sprite as animation or accept
the placeholder.

setupNpcAnimation and setupPlayerAnimation (game.js) used to build their
CSS background-image with an unquoted url(${...}). That breaks the moment
an asset path has a space in it — Assets/Act 1/Nanay.png does — and it
breaks silently in a way that looks like a loading failure but isn't:
loadSpriteSheet's preload Image() still succeeds (browsers tolerate a
literal space in an <img>/Image src), so naturalWidth/naturalHeight,
frameWidth/frameHeight and the computed backgroundSize/backgroundPosition
are all correct. Only the CSS url() token itself is invalid, so
backgroundImage silently stays "none" and the sprite is an invisible box
occupying the right size in the right place. Fixed by quoting both sites:
url("${assetUrl(sheet.src)}"). Any future asset path with a space, a
paren, or a comma needs this same quoting; it's cheap enough to always do.

Seeding a save with objective flags already true and then loading it
against the REAL content/act1.js (rather than through enterTestRoom(),
which routes to the harness's own fixture) can auto-complete the act
before the test gets to do anything. checkObjectives() runs on entry and
compares the seeded flags against whatever objectives the loaded act
actually declares; content/act1.js now declares exactly one, so a seed
carrying { nalamanAngPinagmulan: true, ... } — written when Act I still
had five objectives — reads as "1 of 1 done" the instant the real content
loads, and the act silently finishes and jumps to the real post-test
before #btn-pause or anything else in the test ever becomes visible. Every
_dev/test.js call site that seeds atTestRoom()-shaped flags now passes
fixtureRoutes() to newPage() for exactly this reason (see Decisions on
record); a new call site that skips it and seeds those flags against the
real content will hang on a `page.click` timeout with no other clue why.

A student (or a developer) reporting "I can't see Nanay anywhere" is not
necessarily a code problem. Driving the actual shipped content/act1.js and
game.js headlessly (real files, not the _dev/test.js fixture) confirms the
sprite loads, the CSS is quoted correctly, and the dialogue plays; the
files themselves are not the fault. Checked against the live GitHub main
branch during Block 13: raw.githubusercontent.com already served the
reset, Nanay-only content/act1.js and the quoted-url fix in game.js, but
the live index.html's own script tags still named OLDER v=N numbers
(content/act1.js?v=5, game.js?v=14, shell.js?v=4, style.css?v=9,
content/items.js?v=2) than the content actually sitting behind those same
URLs. Whatever pushed the newer file bytes to main did not bump the
matching query strings, which is exactly the failure this file already
warns about under Pitfalls ("Increment the v=N cache-buster... or mobile
browsers keep serving the cached copy"): a browser or CDN that fetched,
say, content/act1.js?v=5 before that push will keep serving what it
cached at that URL and has no reason to ever ask again, since the URL
never changed. If Nanay is missing on a real device or in a real browser
but a fresh headless fetch of the same files shows her fine, suspect this
before suspecting the code: hard refresh, or open the live URL in a
private window, and confirm the v=N numbers referenced by index.html
actually match a bump made after the file they reference last changed.
This session's own edits keep the numbers matched (see the Run log in
TRACKER.md for the values in effect after Block 13); nothing here reaches
outside this environment to commit or push, so keeping index.html and
the files it names in step is the pushing side's responsibility, not
something a later Claude session can verify by fetching GitHub alone.

Any new element that represents a character in the world must be
built through mountBody and bodySprite (or bodyPlaceholder), and any
new rule about touching must read the body. Positioning a sprite
element directly, or measuring contact against a rendered element's
size, reintroduces the Block 24 fault silently: nothing errors, the
character is simply drawn somewhere other than where he is.

A sheet with no footX stands in the middle of its cell. That is right
for art centred the way Macario's and Nanay's are, and wrong for art
drawn off-centre, where the character will visibly stand to one side
of his hitbox. Run measure-sprite.js on every new sheet and paste all
three numbers, not just the two vertical ones.

The backdrop's tiles are children of #skyline and #skyline-night, which
are static elements that outlive a scene. They are pushed to actElements
so unloadScene removes them, and the layers keep their .skyline-tiled
class, so between an unloadScene and the next loadScene the backdrop is
blank. Every caller today does both back to back, under the blackout. A
new caller that unloads without loading straight after must expect that.

A new text rule written in px for the old sans-serif will render about a
quarter too small in VT323. Size new text against the theme's sizes, not
the older rules above it, and if a new element should follow the text
size setting, add its body.text-sm and body.text-lg variants inside the
theme section too, or the theme's base size will outrank nothing and the
older variants will apply at the old scale.

Tile clicks and action clicks are separate listeners on separate
containers (the list and the detail pane) in both panels. A new action
added to a tile directly would bring back the one-tap purchase this
design removed. Put actions in the detail pane.

An item's count lives in Inventory.counts, not in a list of ids. Code
that asks "is it owned" uses Inventory.owns(id); code that needs how
many uses Inventory.count(id). Writing a count goes through _writeCount,
which deletes at zero, because a row left at quantity 0 reads as owned
to anything that only checks the row exists.

## Accounts

guro@example.com, teacher.
hi@example.com, student, enrolled in class MAC8-RIZAL.

Both are named in two places that matter, and the two lists are the
same list for the same reason: db/reset_test_accounts.sql, which
clears them from the SQL editor, and is_reset_allowed() in schema v5,
which is what lets the in-game reset run at all. A pilot account added
for the session goes in both. A study account goes in neither, ever.

Supabase project reference: rkfnovfkroajottpmxxq

Migrations and database tooling live in db/. Those already applied are in
db/applied/. TRACKER.md's Run log records which have actually been run
against the live project; trust it over a filename.
