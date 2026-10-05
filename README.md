# MACARIO

A narrative-driven 2D RPG on the life and historical role of Macario Sakay,
built as a supplementary instructional tool for Grade 8 Araling Panlipunan.

Capstone project, Bachelor of Science in Information Technology.

## What it does

Students log in with credentials issued by their teacher and play a
four-act linear narrative of Sakay's life. Each act is bracketed by a
historical trivia card, a pre-test and a post-test, so learning gain is
measured per act; a student below the pass mark may replay the act and
sit the post-test again.

Gameplay is movement, a run and a jump; stealth past patrols with a
detection meter and a visible line of sight; a punch, a takedown and a
ranged shot, and an attack that is a dash through the enemy; enemies that fight back, with blows that land with weight;
health with hazards and collectible hearts; jobs to do again for barya;
and short tutorials that stop the world until the control is used. Guard and enemy speed
scale with the act number. An inventory with three equipment slots, a
shop and in-game currency awarded by performance are built, ready for
the items the story will bring.

The interface is flat pixel art to match the sprites, with two
self-hosted pixel fonts, a three-step text size, music and sound effect
switches, and a notice asking for landscape on a phone held upright.

Teachers get a separate dashboard: the class roster with each student's
progress, scores, gain and play time, an editor for the test questions
and the trivia card, and the Talaan papers, short notes the teacher
writes that students find on the road.

## Status

TRACKER.md is the only file in this repository that describes status;
anything about progress stated anywhere else, including here, may be out
of date.

In short: every system is built and covered by automated tests, and the
game runs on a real Android phone. All four acts are written and
playable from their openings to their ends, each closing with its
post-test; Act I's lines are accepted by the proponents, and those of
Acts II to IV are waiting on their review. Act I's people are all drawn;
fifty pictures across the four acts (rooms, places, the people of Acts
II to IV and their fighters) are still placeholder boxes until the
artist's drawings arrive (ART.md).

## Stack

Vanilla HTML, CSS and JavaScript. No build step and no framework.
Supabase for authentication, database and row level security. Hosted on
GitHub Pages. Visual Studio Code as the editor.

The target device is a low-end Android phone running Chrome, held
sideways, which is the reason for the deliberately light stack. The
proposal specifies Unity and C#; neither is used, deliberately (see
CLAUDE.md, Stack).

## Deployment

Deployed on GitHub Pages from the main branch; pushing to main publishes.

    https://fakeplasticfilipino.github.io/Capstone-Project/

Every script, stylesheet, picture and sound is asked for with a ?v= that
is the file's own fingerprint, because phones cache aggressively; node
_dev/tools/prepare.js writes them before every commit, and a pre-commit
hook and CI check them. A service worker keeps every file on the phone
after the first visit, so a guest can then play with no internet, and
the game waits on a loading screen until every picture has arrived.

For local development, any static file server works (the Supabase client
needs an http origin, so opening index.html from the filesystem does
not):

    python3 -m http.server 8000

Accounts cannot be self-registered. They are created by an
administrator, through the Supabase dashboard or create_accounts.js, and
students must be assigned to a class or the dashboard shows nothing. The
title screen also offers Maglaro bilang Bisita, play as a guest: nothing
about a guest session is saved, there are no tests, and a guest who
finishes an act plays on into the next, to the end of Act IV.

## Layout

    index.html, teacher.html   the game and the teacher dashboard
    css/                       game and dashboard styles
    js/                        the engine (game.js), the act flow
                               (acts.js), assessment, inventory, the
                               screens (shell.js), the dashboard, and
                               the asset manifest
    content/                   Act I to IV data, the enemy catalogue,
                               the item catalogue, the built-in questions
    assets/                    sprites, backgrounds, items, audio, fonts
    db/                        migrations, seeds and scripts for Supabase
    _dev/                      the test suites and the tools that make
                               and check art (_dev/README.md)
    sw.js                      the service worker

    CLAUDE.md       how it is built: architecture, formats, conventions
    DECISIONS.md    why, block by block
    TRACKER.md      status, next action, and what has been run
    STORY.md        the story and every line of dialogue
    ART.md          the art still owed

## Assessment integrity

Each student sits each pre-test once per act, enforced by a unique
constraint in the database; a post-test may be retaken only after
replaying the act, and every attempt is its own row. Row level security
lets a student insert a score but never change or delete one, so a score
cannot be altered from a browser.

Since a change requested by the instructor, the game grades the tests
itself, so the teacher can edit the questions from the dashboard. The
cost, stated plainly: the answer key reaches the browser, and a student
with developer tools could read it. The session is supervised, and the
scores measure learning gain rather than rank students.

## Tests

    npm install                             also turns the pre-commit hook on
    node _dev/tools/prepare.js              before every commit
    node _dev/tests/test.js                 --only=BD,BL for some sections
    node _dev/tests/verify_new_scene.js

GitHub Actions runs prepare.js --check and both suites on every push.
The first suite drives the real game in headless Chromium at phone size
against its own fixture act and a fake in-memory database, covering
every engine system. The second plays the real content of all four
acts end to end and checks the story, the art list and the asset manifest against the
repository. Neither touches the live Supabase project, and neither is a
substitute for playing it on a phone. See _dev/README.md.
