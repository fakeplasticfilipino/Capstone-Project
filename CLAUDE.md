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

## Act I is a deliberate blank slate

content/act1.js has gone through three shapes: a proving ground (one room,
one example of every engine system, placeholder dialogue about buko and
errands), a full narrative written directly against the ten item pairs in
db/macario_items_v3.sql (two scenes, five objectives, a stage cutscene, a
guard corridor), and now a reset back to one scene, one NPC (Nanay,
Macario's mother, with real commissioned art) and one exchange. All three
are in git history; none should be restored by copying old code back in
without a reason.

The reset was deliberate, not a regression: the narrative-complete version
was written ahead of the resource person's source material rather than
against it, and starting over from a real, working, minimal base was
chosen over layering more content onto a story that might not survive
contact with the source. content/items.js was reset the same way, back to
an empty catalogue, for the same reason — the two granted equipment items
and two purchasable outfits it carried were content decisions made without
the source material either.

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
Nanay, the only NPC content/act1.js currently declares (see Act I is
a deliberate blank slate, and Decisions on record). Any future NPC,
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

Block 13 gave inventory and shop their own main-UI buttons, #btn-inventory
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
