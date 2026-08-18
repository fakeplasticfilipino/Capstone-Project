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
melee and thrown-projectile combat, and a health system with hazards and
pickups. Completing objectives earns currency, which buys period-correct
cosmetic outfits, and equipment can be found and equipped for small effects.

Teachers get a separate dashboard showing their class roster, act
completion, assessment results, gain scores, and class averages.

## Status

See TRACKER.md, which is the only file to trust on what is and is not
built.

In short: the framework is complete across all four acts and Act I is
playable end to end across two scenes. Acts II through IV are registered
and loadable but have no content yet, which is deliberate. Act I's script is
also placeholder and will be rewritten once the mechanics are finished.

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
    content/act1.js       Act I as data: scenes, NPCs, guards, objectives
    content/act2.js       Acts II to IV, registered but not yet written
    content/act3.js
    content/act4.js
    content/items.js      equipment and cosmetic definitions
    style.css             game styles

    teacher.html          teacher entry point
    teacher.js            dashboard: roster, aggregation, rendering
    teacher.css           dashboard styles

    supabaseClient.js     shared Supabase client
    Assets/               sprite sheets and backgrounds

    macario_schema.sql     initial schema, already applied
    macario_schema_v2.sql  act tables, item bank, grading functions
    macario_schema_v3.sql  inventory, equipment, sessions, currency
    macario_items_v3.sql   revised Act I item bank, ten matched pairs
    enrollment_setup.sql   role and class assignment helper
    create_accounts.js     admin script, runs locally only

    CLAUDE.md             architecture and conventions
    TRACKER.md            current build status
    PAPER_VS_BUILD.md     audit of the proposal against the code

Script order in index.html matters. Act and item content files must load
before game.js, acts.js must load after it, then assessment.js, then
shell.js last.

## Assessment integrity

Assessment questions are stored in the database with row level security
enabled and no student read policy. Questions are served through a security
definer function that omits the answer key, and grading runs server side
through a second function. The correct answers never reach the browser, so
they cannot be read from developer tools.

Each student may take each test once per act, enforced by a unique
constraint and by the grading function.
