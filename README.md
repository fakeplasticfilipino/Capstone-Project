# MACARIO

A narrative-driven 2D RPG on the life and historical role of Macario Sakay,
built as a supplementary instructional tool for Grade 8 Araling Panlipunan.

Capstone project, Bachelor of Science in Information Technology,
STI College Dasmarinas.

Proponents: Kurt Vincent S. Rino, Chauncy John F. Castro,
Kennel Keith L. Malulan
Adviser: Felecisimo Buensuceso Jr., MIT
Resource person: Kimberly Donadillo-Espiritu, Araling Panlipunan teacher,
Imus National High School

## What it does

Students log in with credentials issued by their teacher and play through a
four-act linear narrative covering Sakay's life, from his work as a tailor
and barber in Tondo through the Katipunan, the Tagalog Republic, and his
capture. Each act is bracketed by a historical trivia card, a pre-test, and
a post-test, so learning gain is measured per act rather than only at the
end.

Gameplay is movement and jump, stealth past patrols with a detection meter,
a melee punch and a ranged shot, and a health system with environmental
hazards, collectible hearts and food that heals. Guard speed scales with
the act number. Items are built: an inventory with three equipment slots
(Sandata, Anting-anting, Damit), stacking consumables and quest items, and
a shop reached from its own button or from a shopkeeper, with in-game
currency awarded per act and scaled by performance. The interface is a
flat pixel-art style to match the sprites.

Teachers get a separate dashboard showing their class roster, act
completion, assessment results, gain scores, and class averages.

## Status

See TRACKER.md, which is the only file in this repository that describes
status. Anything about progress stated anywhere else, including here, may
be out of date.

In short: every system is built and live, and the game was confirmed to
run smoothly on a real Android phone; the most recent changes still need a
second phone pass. Assessment, performance scoring, equipment, currency, cosmetics and
the teacher dashboard all work end to end as mechanics — none of that
depends on what story content happens to be loaded, and it stays fully
covered by the automated suite even while Act I's content below is thin.

The story is being written one passage at a time against the resource
person's source material. Act I currently has two scenes: Macario's
mother sends him on an errand, and a flashback to his work for a kutsero
has him buy an apple for the horse. It stops short of its final beat, at
the entablado, which is the next thing to write. The shop sells two
items so far. Acts II through IV are registered and loadable but empty.

## Stack

Vanilla HTML, CSS, and JavaScript. No build step and no framework.
Supabase for authentication, database, and row level security.
Hosted on GitHub Pages. Visual Studio Code as the editor.

The target device is a low-end Android phone running Chrome, which is the
reason for the deliberately light stack. PC browsers are used for
development and testing.

The proposal specifies Unity and C#. Neither is used, deliberately; see
CLAUDE.md.

## Deployment

Deployed on GitHub Pages from the main branch, which is also where testing
happens. There is no build step, so pushing to main publishes.

    https://fakeplasticfilipino.github.io/Capstone-Project/

Changes can take a minute to appear, and browsers cache aggressively. Every
script and stylesheet is referenced with a v=N query string for that
reason. Increment it whenever you change the file, or testers keep running
the old build. Images are versioned separately through ASSET_VERSION in
game.js.

For local development, any static file server works:

    python3 -m http.server 8000

Then open http://localhost:8000

Opening index.html directly from the filesystem will not work, because the
Supabase client requires an http origin.

Accounts cannot be self-registered. They are created by an administrator,
either through the Supabase dashboard or with create_accounts.js. Students
must also be assigned to a class, or the teacher dashboard will show
nothing.

The title screen also offers Maglaro bilang Bisita, play as a guest:
Act I with no account and no login, for a quick look at the game without
provisioning one. Nothing about a guest session is saved or written to
the database, so it does not appear on the teacher dashboard and cannot
be used to complete an act for the study.

## Layout

    index.html            student entry point, the game
    game.js               engine: rendering, physics, dialogue, combat,
                          stealth, health, save/load
    acts.js               act flow controller, owns act_progress writes
    assessment.js         trivia card, pre-test, post-test, feedback
    shell.js              title screen, pause, settings, inventory and
                          shop screens, logout
    inventory.js          item ownership, equipment, consumables, the shop
    content/act1.js       Act I as data: two scenes so far; see TRACKER.md
    content/act2.js       Acts II to IV, registered but not yet written
    content/act3.js
    content/act4.js
    content/items.js      the item catalogue; two items so far
    style.css             game styles, including the pixel theme

    teacher.html          teacher entry point
    teacher.js            dashboard: roster, aggregation, rendering
    teacher.css           dashboard styles

    supabaseClient.js     shared Supabase client
    Assets/               sprite sheets, backgrounds and the two
                          self-hosted pixel fonts (Assets/Fonts, OFL)

    db/applied/           migrations already run against the live project
    db/macario_items_v3.sql     revised Act I item bank, matched pairs
    db/db_healthcheck.sql       read-only; checks tables, RLS and columns
    db/reset_test_accounts.sql  clears test account play data
    db/enrollment_setup.sql     role and class assignment helper
    create_accounts.js    admin script, runs locally only, not in git

    _dev/test.js          headless test suite
    _dev/verify_new_scene.js   the same, against the real Act I content
    _dev/measure-sprite.js     measures a sprite sheet's placement numbers
    _dev/sb-stub.js       fake Supabase client used by the suite
    _dev/README.md        how to run it

    CLAUDE.md             architecture and conventions
    TRACKER.md            status, next action, and what has been run

Script order in index.html matters. Act content files must load before
game.js, acts.js must load after it, then assessment.js, then shell.js
last.

## Assessment integrity

Assessment questions are stored in the database with row level security
enabled and no student read policy. Questions are served through a security
definer function that omits the answer key, and grading runs server side
through a second function. The correct answers never reach the browser, so
they cannot be read from developer tools.

Each student may take each test once per act, enforced by a unique
constraint and by the grading function.

## Tests

    npm install
    node _dev/test.js

Serves the repository, opens index.html in headless Chromium at phone
dimensions, and drives the real game against a fake in-memory database. It
never touches the live Supabase project. See _dev/README.md.
