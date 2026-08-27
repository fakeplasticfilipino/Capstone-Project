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

## Content is placeholder, mechanics are the foundation

Only Act I has content, and that is deliberate. Acts II through IV are
registered, loadable stubs waiting to be written.

Act I's script is itself placeholder and is expected to be rewritten in
full once the mechanics are finished. Do not treat the current dialogue as
settled, do not optimise around it, and do not build systems that depend on
a particular line existing. The build order is mechanics first, then
content written against whatever mechanics exist.

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
is the only file that reads or writes either, and owns the shop. It reduces the student's
equipped items to plain numbers and hands them to the engine through
Game.setEffects, so game.js never learns that an item exists. Optional the
same way assessment.js is: acts.js checks window.Inventory before calling
it and shell.js hides the inventory button without it.

Shell, in shell.js. Owns every screen that is not the game world: title,
pause, settings, inventory and logout. Unlike assessment.js it is NOT
optional and nothing should guard on window.Shell, with one documented
exception at the awaitEntry call in game.js.

The one exception inside shell.js is window.Inventory, which it does guard
on, because that module is optional and the screen it draws is not the way
into the game.

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
    stats()              { damageTaken, detections, playMs }, a copy
    resetStats()         called by Acts.enterAct, and by nothing else
    setEffects(obj)      { maxHealthBonus, projectileSpeedMult }
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
That also means the act after it stays locked, which is correct.

NPC shape:

    {
      id, x, label,
      img: "Assets/X.png"                        static, or
      animation: { src, frames, fps },           sprite sheet
      startsHidden: true,                        optional
      revealedByFlag: "someFlag",                optional; unhides when set
      stage: 0,                                  conversation index
      dialogueSets: [{ lines: [{speaker, text}], onComplete() }],
      gift: { buttonLabel, requiresFlag, givenFlag,
              responseLines, completesQuest }    optional
    }

Talking to an NPC advances through dialogueSets one per conversation,
holding on the last. onComplete fires once, when that conversation ends.

## Item data format

Items are pure content, in content/items.js as window.ITEMS. They hold no
secret and are identical for every student, so a database round trip on a
low-end phone would buy nothing. Only ownership is stored.

    {
      id, name, description,
      kind: "equipment" | "cosmetic",
      slot: "weapon" | "accessory" | "outfit",
      price,                                     in-game currency; 0 is
                                                 not for sale
      img,
      grantedOnAct: 1,                           optional; handed over on
                                                 entering that act
      effect: { projectileSpeedMult: 1.5 }       equipment only
            | { maxHealthBonus: 1 }
      sheets: { walk: {...} }                    cosmetic only; any of
                                                 idle, walk, dead
    }

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
neither contributes nothing, which is what makes a cosmetic a cosmetic.

Cosmetics are period-correct outfits and change the player sprite only.
They never affect gameplay, and carry no effect object at all, which is
what makes them cosmetic.

The outfit art does not exist yet. A missing sheet falls back to the
dashed placeholder box naming the file it wanted, exactly like every other
missing image in this project, including Idle.png and Dead.png today. An
outfit with no art is still bought, still worn, and still shown that way.
There is deliberately no gate hiding it until the art lands: one behaviour
for a missing image is easier to explain than two, and the placeholder is
how the artist finds out what to draw.

An item id is a text key with no foreign key behind it. An item deleted
from the content file leaves an orphan ownership row that inventory.js
ignores, which is the correct failure: a student's save is not corrupted by
an edit to a content file.

## Sprite sheets

Sheets may be a single horizontal strip or a grid. The optional columns
field is how many frames sit across one row; omit it and it defaults to
the frame count, which is the single-strip case.

    { src: "Assets/Walk.png", frames: 12, fps: 12, columns: 5 }

loadSpriteSheet derives frameWidth, rows, and frameHeight from that.
Scaling is always from frameHeight, never naturalHeight, or a multi-row
sheet renders at 1/rows size. Both the player animator and
setupNpcAnimation handle grids.

Every image load goes through assetUrl(), which appends the ASSET_VERSION
constant in game.js. Images are not covered by the v=N strings in
index.html, so without this the browser and the Pages CDN serve stale
sprites indefinitely after a file is replaced. Bump ASSET_VERSION whenever
anything in Assets/ changes, and bump the game.js script version too, since
the browser must refetch game.js to learn the new asset version.

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

The inventory screen is reached from pause and from nowhere else. The
mobile control cluster already overflows the viewport at 412px, which is a
known problem scheduled for Block 12, and a sixth button in that row would
make a documented fault worse to save one tap. Opening from pause also
means the game is stopped for the whole visit, so an effect can never
change under a running frame.

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

The camera is one number, --zoom in style.css, and the visible world is
always screen width divided by it. 1.75 on desktop, 1 on a phone in
landscape, which shows the world at 1:1 with Macario at 33% of the screen
height. 1.75 was a desktop taste applied to every screen until a phone was
actually held: at 412px wide it left 235 world pixels visible, about two
and a half Macarios across. 1.25 was the first correction and still read as
zoomed in on the device, menus included, because every screen in this game
lives inside #app-scale and scales with this number.

At zoom 1 the touch buttons render at 46 and 50 on screen, which still
clears the 44px minimum this project holds itself to. Any further
reduction of --zoom would put them under it, so the phone-landscape button
sizes would have to rise to compensate. A check measures the rendered
button rather than the stylesheet, so that cannot ship unnoticed.

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

## Accounts

guro@example.com, teacher.
hi@example.com, student, enrolled in class MAC8-RIZAL.

Supabase project reference: rkfnovfkroajottpmxxq

Migrations and database tooling live in db/. Those already applied are in
db/applied/. TRACKER.md's Run log records which have actually been run
against the live project; trust it over a filename.
