# TRACKER.md

Current build status. Architecture and conventions live in CLAUDE.md.
The audit of the proposal against the code lives in PAPER_VS_BUILD.md.

This file records present state, not history. When something is finished,
compress it to a line rather than accumulating detail. A tracker that grows
every session stops being useful.

Status markers: (COMPLETE), (IN PROGRESS), (NOT STARTED), (BLOCKED)

Last updated: after the paper audit and the scope decisions taken from it.

## Milestone

Final defense with student data collection, confirmed. Grade 8 students at
Imus NHS play the game and sit both tests. More than six weeks out. School
and parental permissions are secured.

Data collection covers Act I, since Acts II through IV have no content yet.

Freeze the software roughly ten days before the defense to leave room for
scheduling the session and analysing the results.

## Scope, settled

Every open question from the paper audit now has an answer. These are
decisions, not proposals, and the reasoning for each is in CLAUDE.md.

Kept as changed from the proposal: administrator-created accounts rather
than self-registration, and a hard online requirement rather than deferred
synchronisation.

Built simply on purpose: dynamic difficulty is guard speed scaled by act and
nothing else. Equipment effects are a faster projectile and one extra heart.
Cosmetics are period-correct outfits that change the sprite only.

Added because the paper asks for them and they were missing: environmental
hazards, heart pickups, a completed performance score, and an optional user
feedback form.

Dropped from the ERD rather than built: PlayerAction, because a per-action
replay log costs writes on a phone on mobile data and would never be
queried, and the achievement entities, because currency and cosmetics
already cover reward. GameScore is folded into act_progress rather than
given its own table.

Content is placeholder throughout, including Act I, and will be written
after the mechanics are finished.

## Done

Schema v2 and v3: RLS recursion fix, act_progress, assessment_items,
act_trivia, server-side grading, inventory, equipment and session tables,
and a currency column. (COMPLETE)

Role routing and class enrollment. Teachers redirect to teacher.html and
never receive a game_progress row. (COMPLETE)

Teacher dashboard. Roster, act completion, pre and post scores, gain,
performance, class averages, and all empty and error states. (COMPLETE)

Act framework across four acts: content extracted to content/actN.js, world
building wrapped in loadAct and unloadAct, the act state machine, ordered
unlocking, title cards, transition screens, and resume into the stored act.
(COMPLETE)

Assessment module. Trivia card, pre-test and post-test, one question per
screen, submitting through submit_assessment. Handles an already recorded
attempt, an act with no items seeded, and network failure. (COMPLETE)

Block 6, movement and conflict. Scenes, jump with gravity and one-way
platforms, health with invulnerability and respawn, stealth guards with a
detection meter and hide spots, and combat with melee, takedown from behind,
and a thrown projectile. (COMPLETE)

Block 7, schema v3 and the game shell. Title screen with an entry gate,
pause that halts the loop and offsets wall-clock timers, settings persisted
to localStorage, and logout with a save flush. (COMPLETE)

Act I outpost. Two patrolling guards, three crates, two platforms, and a
kasama to deliver the message to. (COMPLETE)

Paper audit. Seventeen functional requirements, ten non-functional, five
modules, seventeen ERD entities and all four act storyboards checked against
the code. (COMPLETE)

Revised Act I item bank, ten matched pre and post pairs, plus a trivia fact
that no longer leaks pre-test answers. Written as macario_items_v3.sql and
NOT yet run; it goes in after the validation packet comes back. (COMPLETE,
NOT RUN)

## Next

Ordered by dependency and by how much of a stated objective each closes.
Blocks 8 through 11 finish the second stated objective. Block 9 also
finishes the third.

Block 8, hazards, pickups and difficulty. Scene-level hazard regions that
cost one health, heart pickups that restore one, and guard speed scaled by
act number. No schema change and no new screens. Closes the Health System
and Dynamic Difficulty requirements outright. (NOT STARTED)

Block 9, schema v4 and measurement. Adds damage_taken, detections and
elapsed time to act_progress, turns performance_score into a weighted sum of
objective completion, survival and stealth, writes game_sessions rows, adds
a feedback table, and drops player_actions and player_achievements. Also
adds the optional feedback form after the post-test. Closes Performance
Scoring, Progress Tracking and the user feedback half of the third
objective. (NOT STARTED)

Block 10, inventory and equipment. content/items.js as pure data, an
inventory screen in the shell, weapon and accessory slots, and two effects:
a faster projectile and one extra heart. Closes the Equipment System
requirement. (NOT STARTED)

Block 11, currency and cosmetics. Currency awarded on act completion and
scaled by performance score, a simple shop inside the inventory screen, and
period-correct outfits that change the player sprite. Closes the Cosmetic
Reward requirement. (NOT STARTED)

Block 12, polish. Mobile control layout fix, the outpost balance pass, and
audio if there is time. (NOT STARTED)

Send the validation packet to Ms. Donadillo-Espiritu, then run
macario_items_v3.sql once it comes back. External turnaround, so it goes out
first regardless of what else is happening. (NOT STARTED)

Chase the replacement art. External turnaround and cannot be compressed at
the end. (NOT STARTED)

Rewrite Act I in full against the finished mechanics, then write Acts II
through IV. Content work, done once the systems stop moving. (NOT STARTED)

Seed trivia and assessment items for Acts II through IV. Until then those
acts skip their tests with a notice, which is deliberate. (NOT STARTED)

Provision student accounts for the session and pilot with two or three
students who are not part of the study, since a pilot run on a study account
uses up that student's one attempt. (NOT STARTED)

## Art status

The outpost needs Assets/Guard.png and Assets/Kasama.png. Both fall back to
labelled placeholder boxes, so the scene is fully playable without them.

Assets/ currently holds only Cement_Tile.png and the player Walk.png. Every
other sprite and background was removed pending replacement art. Act I is
fully playable but visually skeletal. This is the fallback system working,
not a fault.

Blocks 10 and 11 add two more art needs: equipment icons and period-correct
outfit sprites. Both fall back to placeholders, but the cosmetic system is
pointless to demonstrate without at least two real outfits.

Confirm Walk.png is genuinely 12 frames in a 5 + 5 + 2 grid. If the cycle
pauses or shows a sliver of the next frame, the columns value in
SPRITE_SHEETS is wrong.

## Deferred

Student-facing join screen. join_code exists but class assignment is
administrator-assigned.
Multiple save slots.
Dashboard export and per-question item analysis.
Offline and save-conflict handling.
Persisting partial test answers. A student who reloads mid-test restarts
that test from question one. Nothing is recorded until submission, so no
answers are lost, but the questions are asked again.

## Bugs

The mobile control cluster overflows the viewport at phone width. Block 6
added a jump button and an attack button to a row that already held three
controls, and at the 1.75 zoom the interact button runs off the right edge
of a 412px screen. Everything is reachable on a desktop browser, which is
where it was tested. Scheduled for Block 12. (NOT STARTED)

## Housekeeping

create_accounts.js is listed in .gitignore but was committed before that
rule existed, so it remains publicly visible. It holds only placeholder text
at present, but a real secret key pasted in later would publish to a public
repository and would bypass every RLS policy. Fix with
git rm --cached create_accounts.js. (NOT STARTED)

Capstone_Project_Proposal.pdf is 2.8 MB and sits in a public repository
without being used by the application. Harmless, but worth a decision.
(NOT STARTED)

## Pitfalls found the hard way

These are recorded because each cost real debugging time and each would
have shipped silently.

The auth bootstrap must stay inside the DOMContentLoaded listener in
game.js. It used to run at parse time, and because the other files load
after it, a student with a stored session hit getSession() resolving on a
microtask before acts.js had executed. The window.Acts guards swallowed the
whole act lookup, so every reload landed in Act I regardless of current_act.
Nothing appeared in the console.

The same microtask hazard rules out an event as the shell's entry signal.
shell.js registers its listeners inside its own DOMContentLoaded handler,
which runs after game.js's. enterGameAsUser calls Shell.awaitEntry()
directly for that reason. Do not replace it with an event.

Acts.syncStart awaits the entire pre-act flow, trivia card and pre-test
included. The entry gate has to sit before it, or a student taps into a test
that has been running behind the title screen.

saveProgress refuses to write until saveReady is set at the end of the login
sequence. The parse-time loadAct call adds Act I's starting quest, which
marks the save dirty, and the resulting debounced write fired mid-login with
Acts.current still at 1, overwriting the stored act.

The same debounce is why logout awaits Game.flushSave() before signing out.

Pausing has to stop the loop rather than cover it. Invulnerability and the
attack hold are measured against performance.now(), which does not stop for
a pause screen, so both are offset by the pause duration on resume.

Assessment checks for an existing score before showing any questions rather
than relying on submit_assessment raising ALREADY_SUBMITTED. The constraint
is still the real guarantee, but discovering the clash at submit time meant
the student answered every question for nothing.

The trivia card is shown before the pre-test, so a trivia fact drawn from
the tested content hands students the answers. The Act I fact did exactly
that for three of five items.

## Testing

There is a development harness that is not in the repository: a stubbed
Supabase client and Playwright suites driving Chromium at phone dimensions
against a fake database. Block 7 adds 55 checks covering the entry gate on
both the fresh and resuming paths, pause halting guard patrol and the
detection meter, the invulnerability offset, settings persistence, logout
confirmation, the legacy current_room fallback, and a stalled load offering
a way out.

It is not a substitute for a device pass. Nothing has ever run on a real
phone.

## Documentation debt

These will be raised at the defense and are tracked separately from code.

Justify Unity and C# to vanilla JavaScript and Supabase, argued from the
existing literature review: a comparable project was constrained by 3D
performance on low-end devices, and a lightweight browser application
addresses that gap directly. Frame as responding to an identified limitation
rather than as reduced scope. (NOT STARTED)

Revise the ERD to match what is built. The paper says fifteen entities and
then describes seventeen, so it needs correcting regardless. The revised
diagram has eleven, and the three entities dropped or folded each have a
stated reason. (NOT STARTED)

Obtain validation of the assessment item bank from Ms. Donadillo-Espiritu.
The packet is written and ready to send. The returned form is the Appendix
exhibit and the answer to any question about instrument validity. (READY TO
SEND)

Document server-side grading. The answer key never reaches the client, which
is a design strength worth stating. (NOT STARTED)

Document the dashboard query approach and its RLS enforcement, since a panel
may ask how one teacher is prevented from reading another class's data.
(NOT STARTED)

Document that game_progress.currency is client written and why that is
acceptable. (NOT STARTED)

Document the performance score formula and its weights, including why time
is recorded but not scored. (NOT STARTED)

Revise Technical Background. Aseprite, Audacity and Figma remain accurate.
Unity and C# should be removed. Visual Studio should be corrected to Visual
Studio Code. GitHub Pages and Supabase should be added, since neither
appears in the tools list despite both being central. (NOT STARTED)

Credit any licensed art assets used for enemies, outfits, or combat
animations. (NOT STARTED)
