# _dev

Development tooling. Nothing in this folder is served to students or
loaded by the game. It exists so any future session can verify the build
without rebuilding a test rig first.

## Running the suite

From the repository root:

    npm install
    node _dev/tests/test.js
    node _dev/tests/test.js --only=BD,BL    only those sections (Block 106)
    node _dev/tests/test.js --list          the sections, by letter
    node _dev/tests/verify_new_scene.js --only=act1,jumps   its parts (Block 115)
    node _dev/tests/verify_new_scene.js --list              the parts
    node _dev/tests/run.js                  both suites, in pieces, side by side
    node _dev/tests/run.js verify:act2 test:BR              only those pieces
    node _dev/tests/run.js --real           at a student's speed (a release)

Expected output ends with a count. Anything other than "0 failed" is a
regression. While building, run the pieces a change touches; the
whole of both suites is CI's on every push, and this computer's before
a release to students (CLAUDE.md, Testing a push).

Since Block 115 the story runs ten times faster under test (the
harness sets window.__TEST_SPEED; game.js, TEST_SPEED): the scripted
pauses, black cards, fades and walks, never the world a student plays
against. Every piece takes a free port of its own, so pieces run side
by side. A check reads what the page shows when it shows it: wait for a
condition, not a fixed pause.

Before every commit, node _dev/tools/prepare.js: the checks that need no
browser, in a second, after fixing what a tool can fix (the sheets, the
manifest and its fingerprints, the ?v= stamps). The pre-commit hook in
_dev/hooks/ runs it with --check once turned on:

    git config core.hooksPath _dev/hooks

The install is one-time. node_modules/ and package-lock.json are already
in .gitignore; _dev/ itself is tracked.

## What it does

test.js serves the repository over http, opens index.html in headless
Chromium sized like a phone, and drives the real game: clicking the title
screen, logging in, pausing, changing settings, and reading back internal
state.

It never touches the live Supabase project. sb-stub.js is a fake client
holding its data in memory, and test.js injects it by intercepting the
request for supabaseClient.js and neutralising the Supabase CDN script.

That interception is the important design choice. An earlier version kept
a separate test.html with the script tags rewritten, which meant the suite
could pass against a page that no longer matched the one students load.
Intercepting at the network layer means the suite exercises the shipping
index.html, in its real script order, and cannot drift away from it.

## What it covers

Deliberately not listed scenario by scenario here. That list went stale
twice, and a tooling README that misstates coverage is worse than one that
does not try. The suite prints its own count, and the scenario headings in
test.js are the inventory.

The shape is: a fresh student with no stored session, a returning student
mid-act in the fixture's test room, settings persistence across a reload, backward
compatibility with pre-scene saves, a shell that never receives a world,
and one block per gameplay system added since Block 6.

TRACKER.md's Verification section carries the current check count.

## Measuring a sprite sheet

    node _dev/tools/measure-sprite.js <path-to-png> --columns=N --frames=M

A sprite's frame is a fixed-size cell; the character drawn inside it
rarely fills that cell edge to edge, and how much of it gets filled
varies sheet to sheet. game.js's contentTop/contentHeight fields (see
CLAUDE.md, Sprite sheets) correct for that, but they have to be measured
from the real art, not eyeballed — this is what does the measuring.

It reads the PNG's own alpha channel directly (no npm install, no image
library; PNG chunk parsing and the scanline unfilter are plain Node plus
node:zlib), slices it into the same grid the sheet's own columns/frames
values describe, and prints every frame's own bounding box plus the
union across all of them, then copy the contentTop/contentHeight/footX
line it prints straight into the sheet's definition. footX is where
the character stands horizontally (the centre of its feet), which is
what game.js stands on the middle of a character's body; see
CLAUDE.md, Sprite sheets, and Bodies under Decisions on record. It also warns when a single
frame's content height strays far from that union, which means a single
number cannot correct that sheet (a raised weapon, a crouch) and it is
worth looking at by eye before trusting the tool.

Only 8-bit, non-interlaced PNGs are supported (every sheet in assets/ is
one); anything else is refused with what to re-export as, rather than
silently measured wrong.

## Looking at a sprite sheet

    node _dev/tools/preview-sheet.js <sheet.png> --from=content/act1.js

or with the numbers given by hand (--columns, --frames, --contentTop,
--contentHeight, --footX, --headroom, --muzzle=x,y). It writes a PNG
to the system's temporary folder (or --out) with every frame numbered
and the game's numbers drawn on: red where the feet should stand, blue
at the top the character is sized by, cyan above which the game cuts
the picture off, green at footX, and an orange cross at the muzzle. The
last cell is an onion skin of all the frames: a foot that slides or a
head that jumps shows as a smear. Measure with measure-sprite.js, then
look with this before trusting the numbers.

Both tools, and animate-bantay.js, read and write PNGs through
_dev/tools/lib/png.js: plain Node, no install.

## Measuring the engine (Block 107)

    node _dev/tools/profile.js            the CPU slowed 6 times
    node _dev/tools/profile.js --cpu=4    another slowdown; --json

Plays the real game (the fake Supabase client, nothing live) at phone
landscape and prints, for standing on the street, standing on the
pamphlet night with the three guards patrolling, and walking: how far
Macario moved, the frame intervals (median, 95th percentile, share over
33 ms), and Chrome's own counts per second of style recalculations and
layouts with the milliseconds spent in script, style and layout. Then
the street and the entablado eight times over, with the DOM nodes, the
listeners and the heap after each round trip: a number that climbs is
a leak. Compare a change against the code before it on the same
computer; a desktop slowed down is not a phone.

## Shrinking sheets (Block 105)

Every sheet in assets/ is a 256-colour palette PNG, about a quarter of
the size of the full-colour PNG an animate tool or the artist gives:

    node _dev/tools/shrink-sprites.js           every sheet not yet shrunk
    node _dev/tools/shrink-sprites.js --check   list them, change nothing

It checks each result before keeping it: within 40 dB of the original
at about the size the game draws it (else the sheet stays full colour),
and every pixel still clear, faint or solid as it was, so the numbers
measure-sprite.js gives do not change. The stills (<name>-still.png)
are left alone. verify_new_scene.js fails while a sheet has not been
through it. Since Block 106 the animate tools shrink what they write
(lib/png.js, writeSheet) and prepare.js shrinks anything else, so this
is seldom run by hand.

## Adding checks

Each block builds a page with newPage(seed), where seed becomes
window.__TEST and seeds the fake database. Assertions use ok(name,
condition, extra). Keep the name a plain statement of what should be true,
so a failure line reads as the defect.

When a block adds a system, add its checks here in the same commit. The
suite is only worth keeping if it stays honest about what is covered.

## Sheets delivered as JPEG

A JPEG has no transparency, so a sheet delivered as one draws inside a
black box. key-black.py writes a PNG beside it with the black background
removed, flooding in from each cell's edges so the character's own dark
hair and clothes survive:

    python3 _dev/tools/key-black.py assets/sprites/enemies/kawal-walk.jpg --columns=4 --rows=3

It needs Pillow and is dev-time only. Measure the PNG with
measure-sprite.js afterwards, and point the content at the PNG.

## Animating a character from one still

    node _dev/tools/animate-still.js <name> --debug
    node _dev/tools/animate-still.js <name>

A rig per character in _dev/rigs/; CLAUDE.md, Animating a character
from one still, has the steps. (The old make-placeholder-sprites.py,
which recoloured frames into stand-ins, went with them in Block 59.)
