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
melee and thrown-projectile combat, and a health system with environmental
hazards and collectible restoratives. Guard speed scales with the act
number. Equipment and cosmetic outfits are built: an inventory and a shop
reached from the pause screen, in-game currency awarded per act and scaled
by performance, and outfits that change the player sprite.

Teachers get a separate dashboard showing their class roster, act
completion, assessment results, gain scores, and class averages.

## Status

See TRACKER.md, which is the only file in this repository that describes
status. Anything about progress stated anywhere else, including here, may
be out of date.

In short: every system is built, live, and confirmed on a real Android
phone. Assessment, performance scoring, equipment, currency, cosmetics and
the teacher dashboard all work end to end.

No story is written yet. Act I currently holds a TEST STAGE rather than a
narrative: one room containing one example of every mechanic, plus a bare
second room that proves scene transport. Acts II through IV are registered
and loadable but empty. Writing the four acts against the source material
is the remaining work.

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

## Layout

    index.html            student entry point, the game
    game.js               engine: rendering, physics, dialogue, combat,
                          stealth, health, save/load
    acts.js               act flow controller, owns act_progress writes
    assessment.js         trivia card, pre-test, post-test, feedback
    shell.js              title screen, pause, settings, inventory, logout
    inventory.js          inventory, equipment and the shop
    content/act1.js       Act I as data. Currently a test stage: scenes,
                          NPCs, guards, hazards, pickups, objectives
    content/act2.js       Acts II to IV, registered but not yet written
    content/act3.js
    content/act4.js
    content/items.js      the item catalogue, equipment and cosmetics
    style.css             game styles

    teacher.html          teacher entry point
    teacher.js            dashboard: roster, aggregation, rendering
    teacher.css           dashboard styles

    supabaseClient.js     shared Supabase client
    Assets/               sprite sheets and backgrounds

    db/applied/           migrations already run against the live project
    db/macario_items_v3.sql     revised Act I item bank, matched pairs
    db/db_healthcheck.sql       read-only; checks tables, RLS and columns
    db/reset_test_accounts.sql  clears test account play data
    db/enrollment_setup.sql     role and class assignment helper
    create_accounts.js    admin script, runs locally only, not in git

    _dev/test.js          headless test suite
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
