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

## Adding checks

Each block builds a page with newPage(seed), where seed becomes
window.__TEST and seeds the fake database. Assertions use ok(name,
condition, extra). Keep the name a plain statement of what should be true,
so a failure line reads as the defect.

When a block adds a system, add its checks here in the same commit. The
suite is only worth keeping if it stays honest about what is covered.
