# CLAUDE.md

Context file for AI assistants working on this project. Paste this at the
start of a new session. It describes architecture, conventions, and
constraints, all of which change rarely.

Current build status is NOT in this file. It lives in TRACKER.md, which
should be pasted alongside this one. If it was not provided, ask for it
before planning any work, because this file will not tell you what has
already been built.

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

This is adequate for the project's needs and should not be migrated
mid-testing without reason. Every script and stylesheet carries a v=N query
string because browser caching is aggressive on Pages.

## Project

MACARIO, a narrative-driven 2D RPG teaching the life and historical role of
Macario Sakay, for Grade 8 Araling Panlipunan. Capstone project, BSIT,
STI College Dasmarinas.

Three stated objectives, which are what the panel will assess against:

1. A 2D narrative RPG presenting Sakay's life across four acts.
2. Gameplay mechanics including dynamic difficulty, health, equipment, and
   cosmetic rewards.
3. Integrated assessment with per-act pre-tests and post-tests, and a
   teacher dashboard for monitoring.

Target device is a low-end Android phone in Chrome. This constraint is the
justification for the entire technical approach and should not be traded
away for convenience.

## Stack

Vanilla HTML, CSS, and JavaScript. No build step, no bundler, no framework,
no ES modules. Plain script tags in document order.

Supabase for auth, Postgres, and row level security. Hosted on GitHub Pages.

The proposal document specifies Unity. The implementation does not use it.
This deviation is deliberate and is argued from the study's own literature
review, where a comparable project was constrained by 3D performance on
low-end devices. Do not reintroduce heavier tooling.

## Architecture

Three layers, with a strict dependency direction.

Content, in content/actN.js. Pure data. NPCs, stage, decorations,
objectives, starting quests. Contains no engine logic. Registers itself as
window.ACT_N.

Engine, in game.js. Renders worlds, runs dialogue, animates sprites, and
handles auth and save/load. Knows nothing about what an act means. Reads
act data through loadAct().

Controller, in acts.js. Owns the act lifecycle and is the only file that
writes to act_progress.

Load order in index.html, which is load bearing:

    supabase CDN
    supabaseClient.js
    content/act1.js      before game.js, which reads window.ACT_1 on start
    game.js
    acts.js              after game.js

Getting content and engine the wrong way round produces a blank world and
an undefined property error.

## Act data format

    window.ACT_N = {
      number, title,
      worldWidth, startX,
      objectives: [{ id, label, flag }],
      startingQuests: [{ id, text }],
      npcs: [...],
      stage: {...} | omitted,
      decorations: [...]
    }

NPC shape:

    {
      id, x, label,
      img: "Assets/X.png"                        static, or
      animation: { src, frames, fps },           sprite sheet
      startsHidden: true,                        optional
      stage: 0,                                  conversation index
      dialogueSets: [{ lines: [{speaker, text}], onComplete() }],
      gift: { buttonLabel, requiresFlag, givenFlag,
              responseLines, completesQuest }    optional
    }

Talking to an NPC advances through dialogueSets one per conversation,
holding on the last. onComplete fires once, when that conversation ends.

## Sprite sheets

Sheets may be a single horizontal strip or a grid. The optional columns
field is how many frames sit across one row; omit it and it defaults to
the frame count, which is the single-strip case.

    { src: "Assets/Walk.png", frames: 12, fps: 12, columns: 5 }

loadSpriteSheet derives frameWidth, rows, and frameHeight from that.
Scaling is always from frameHeight, never naturalHeight, or a multi-row
sheet renders at 1/rows size. Both the player animator and
setupNpcAnimation handle grids.

Every image load goes through assetUrl(), which appends the
ASSET_VERSION constant in game.js. Images are not covered by the v=N
strings in index.html, so without this the browser and the Pages CDN
serve stale sprites indefinitely after a file is replaced. Bump
ASSET_VERSION whenever anything in Assets/ changes, and bump the
game.js script version too, since the browser must refetch game.js to
learn the new asset version.

Missing images do not break anything. They fall back to a dashed
placeholder box showing the expected filename.

## Objectives

Objectives map to story flags in state.flags. Because flags persist inside
game_progress.save_state, objective progress survives a reload without
needing separate storage.

## Database

Tables: profiles, classes, game_progress, assessment_scores, act_progress,
assessment_items, act_trivia.

Functions: my_role, my_class_id, is_teacher_of, get_assessment_items,
submit_assessment.

Row level security is the actual security boundary. Client-side role checks
are usability guards only and must never be described as security.

Two policy rules that were learned the hard way:

Policies that query each other across tables cause infinite recursion. Use
security definer helper functions instead. Never name one current_role,
which is a reserved SQL keyword.

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

## Decisions on record

Class assignment is administrator-assigned. The join_code column exists but
no student-facing join screen is built.

Assessments allow one attempt per act per test type. Enforced by a unique
constraint and by submit_assessment.

performance_score is currently completion percentage only. It becomes a
weighted sum once stealth and combat exist. Worth stating in documentation,
since the name implies more than it currently measures.

The teacher dashboard runs four scoped queries and stitches results in
JavaScript rather than using a joined view or RPC. RLS enforces correctness
per query. Class sizes of 40 to 50 make the extra round trips immaterial.

The dashboard uses plain tables with no charting library, matching the
documented limitation that it provides basic summaries only.

The act_progress schema allows trivia, pretest, and posttest states. These
are deliberately unused until the assessment module exists, so that no
state is written that nothing can exit.

Combat and stealth are deliberately minimal by decision: tap to attack,
hold for ranged, and a simple detection radius with no line of sight
calculation.

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

## Accounts

guro@example.com, teacher.
hi@example.com, student, enrolled in class MAC8-RIZAL.

Supabase project reference: rkfnovfkroajottpmxxq
