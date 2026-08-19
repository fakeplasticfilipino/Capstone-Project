# _dev

Development tooling. Nothing in this folder is served to students or
loaded by the game. It exists so any future session can verify the build
without rebuilding a test rig first.

## Running the suite

From the repository root:

    npm install -D playwright
    npx playwright install chromium
    node _dev/test.js

Expected output ends with a count. Anything other than "0 failed" is a
regression.

The install steps are one-time. Add node_modules/ to .gitignore before
running them.

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

55 checks across five scenarios.

A. A fresh student with no stored session: title screen offers Magsimula,
the login box appears only after tapping it, the pre-act flow runs, and a
game_progress row is created.

B. A returning student mid Act I at the outpost: the title screen offers
Magpatuloy and holds the student there, the stored scene resumes rather
than restarting Act I, pause freezes guard patrol and the detection meter,
the invulnerability window survives a pause, Escape toggles pause, the
settings round trip returns to the right screen, and logout asks first.

C. Settings persist across a reload.

D. Backward compatibility: a legacy current_room of "empty" falls back to
the first scene, and Acts II to IV still register with no objectives.

E. A shell that never receives a world: the title screen stays up, the
button stays disabled, and a stalled load eventually offers a way out
rather than hanging forever.

## Adding checks

Each block builds a page with newPage(seed), where seed becomes
window.__TEST and seeds the fake database. Assertions use ok(name,
condition, extra). Keep the name a plain statement of what should be true,
so a failure line reads as the defect.

When a block adds a system, add its checks here in the same commit. The
suite is only worth keeping if it stays honest about what is covered.
