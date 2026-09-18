# _dev

Development tooling. Nothing in this folder is served to students or
loaded by the game. It exists so any future session can verify the build
without rebuilding a test rig first.

## Running the suite

From the repository root:

    npm install
    node _dev/test.js

Expected output ends with a count. Anything other than "0 failed" is a
regression.

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
mid Act I at the outpost, settings persistence across a reload, backward
compatibility with pre-scene saves, a shell that never receives a world,
and one block per gameplay system added since Block 6.

TRACKER.md's Verification section carries the current check count.

## Measuring a sprite sheet

    node _dev/measure-sprite.js <path-to-png> --columns=N --frames=M

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

Only 8-bit, non-interlaced PNGs are supported (every sheet in Assets/ is
one); anything else is refused with what to re-export as, rather than
silently measured wrong.

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

    python3 _dev/key-black.py "Assets/Act 1/Muslim_Walk.jpg" --columns=4 --rows=3

It needs Pillow and is dev-time only. Measure the PNG with
measure-sprite.js afterwards, and point the content at the PNG.
