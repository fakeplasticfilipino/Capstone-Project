# CLAUDE.md

Context file for AI assistants working on this project. It describes
architecture, conventions, and constraints, all of which change rarely.

Current build status is NOT in this file. Read TRACKER.md before planning
any work, because this file will not tell you what has already been built.
Read PAPER_VS_BUILD.md before arguing about scope, because it records what
the proposal promised and what was deliberately changed.

Both sit next to this file in the repository and in the connected project
folder, so read them directly rather than asking for them to be pasted.

Read in this order at the start of a session: this file, then TRACKER.md,
then PAPER_VS_BUILD.md only if scope is in question.

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

Target device is a low-end Android phone in Chrome, with PC browsers used
for development and testing. This constraint is the justification for the
entire technical approach and should not be traded away for convenience.

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
decorations, objectives, starting quests, hazards, pickups, item and
cosmetic definitions. Contains no engine logic. Registers itself on window.

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

Shell, in shell.js. Owns every screen that is not the game world: title,
pause, settings, inventory, logout. Unlike assessment.js it is NOT optional
and nothing should guard on window.Shell, with one documented exception at
the awaitEntry call in game.js.

Load order in index.html, which is load bearing:

    supabase CDN
    supabaseClient.js
    content/act1.js      before game.js, which reads window.ACT_1 on start
    content/act2.js      through act4.js, before acts.js builds its registry
    content/items.js     before shell.js, which renders the inventory
    game.js
    acts.js              after game.js
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
      price,                                     in-game currency
      img,
      effect: { projectileCooldown: 0.6 }        equipment only
            | { maxHealthBonus: 1 }
    }

Effects are deliberately small and few. A faster projectile and one extra
heart are the whole design brief; anything that needs a balance spreadsheet
is out of scope.

Cosmetics are period-correct outfits and change the player sprite only.
They never affect gameplay.

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

Assessment items have RLS enabled with no student read policy. Questions
are served by get_assessment_items, which omits correct_index, and grading
runs in submit_assessment. The answer key must never be sent to the client.
Do not add a student read policy to that table.

## Conventions

Comments explain why, not what. Existing comments record reasoning and
tradeoffs; match that register.

Whole-file replacements, not hand-applied patches. The user has asked for
this explicitly. Present complete files.

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

Performance score is a weighted sum of objective completion, survival, and
stealth. Time taken is recorded but not scored, because a timer rewards
skipping the dialogue, which is the entire lesson.

User feedback is optional and skippable. A required form after a post-test
would be answered by a student who wants to leave, which is worse than no
data.

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

## Accounts

guro@example.com, teacher.
hi@example.com, student, enrolled in class MAC8-RIZAL.

Supabase project reference: rkfnovfkroajottpmxxq
