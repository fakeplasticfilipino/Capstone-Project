# TRACKER.md

Where the build is: status, next action, what has been run, what is
blocked. The one file that describes status (with ART.md for the art
still owed). How the thing is built is CLAUDE.md, why is DECISIONS.md,
what the story is is STORY.md. This file records present state only;
history is in DECISIONS.md and git. When something is finished,
compress it to a line.

Status markers: (COMPLETE), (IN PROGRESS), (NOT STARTED), (BLOCKED).

Last updated: 29 Sep 2026, after Block 81 (the ending checked against
the histories; guards on the pamphlet run; applause; a new card sound).
test.js 729 passed, 0 failed; verify_new_scene.js 188 passed,
0 failed.

## Start here

What MACARIO is right now.

Every engine system is built and covered by the suites: movement, jump
(with coyote time and a buffer) and a run; one-way platforms; health,
hazards and heart pickups; guards with a detection meter, a sight cone,
hide spots, and hostility (chase and shoot); melee, a takedown and a
ranged shot; enemies that fight back; blows with weight (a flash, a
slide, a stagger, a topple and fade), the same for every kind of body;
scripted scenes, black cards and arrival dialogues; dynamic difficulty;
the act state machine; trivia, pre-test and post-test graded in the game
(with a pass mark and a replay); the weighted performance score;
feedback; currency, the shop, equipment and outfits; play as guest;
sound and settings (text size, music, effects, a password change, the
full reset, which needs schema v5); the Talaan (the teacher's papers on
the road); and the teacher dashboard (roster, questions editor, Talaan
papers). The loader waits for every picture that exists, fetches the
whole act on the title screen, and never lets a student in with art
missing; a service worker keeps every file on the phone.

Act I is the only act with content, rewritten in Block 52 against the
proponents' script and built forward since, and since Block 80 it has
an ending. STORY.md has it beat by beat, with every line. It is one
street ten paintings long (14500px, street-01..04.jpg in order, twice,
then 01 and 02, a silhouette tree over each join; keep anyone a student
must reach 90px clear of a multiple of 1450), the inside of the
entablado, which only the direktor (and later the four-year card) takes
Macario into, and the pulungan, the Katipunan's secret room, which only
the Kasama takes him into. Thirteen objectives, one chain, shown one at
a time in the quest log (finished ones in Mga Setting):

    1  Umuwi kasama si Nanay            the thought after the opening
    2  Maghanap ng trabaho: kausapin    the Kutsero's first conversation
       ang Kutsero
    3  Kumuha ng tatlong mansanas at    apples caught (n/3); done by
       ipakain sa kabayo                feeding the horse
    4  Kunin ang bayad sa Kutsero       his gift button, 50 barya
    5  Kausapin ang Mananahi            her first conversation
    6  Ihatid ang mga tinahing damit    Aling Rosa, Mang Tomas, the
       (n/3)                            direktor; done when Macario
                                        agrees to act
    7  Gumanap bilang Don Rodrigo sa    the play and its fight; 79 to
       dula                             110 barya
    8  Kunin ang bayad sa Mananahi      her gift button, 50 barya
    9  Ibigay kay Nanay ang naipon      Nanay's gift (n/100); then a
                                        black card, four years on
   10  Gumanap bilang Principe          the play, and the Katipunan's
       Baldovino                        two men in the wings asking
                                        whether he is sure
   11  Hanapin ang naghihintay sa       the password to the Kasama,
       kalye                            x 12500
   12  Sumapi sa Katipunan              the oath in the pulungan
   13  Ipamigay ang mga polyeto (n/3)   out the back door, past three
                                        guardia civil: the mangingisda,
                                        the tabakera, the karpintero;
                                        the third ends the act and the
                                        post-test runs

Act I completes (holdOpen is gone since Block 80). It pays no barya per
step; the performance award is paid on completion.
content/items.js is empty, so no item ships (the harness fixture covers
every item path). Acts II to IV are registered stubs.

Outside the story: the Test Room (Mga Setting from pause, then Test
Room): a "<WIP>" card, three bantay who patrol, see, turn hostile, fire
from the hip and take blows, a platform, a crate, and a door back to the
same spot. Enemies are content: content/enemies.js describes each kind
once (bantay, kawal) and scenes place them by type.

Art: Macario's idle, walk, jump, punch and shot are the artist's; so are
Nanay, the Kutsero, Kabayo, the Tindero (worn by Mang Tomas), Maryam,
the play's soldiers, the bantay's still, the street paintings and the
inside of the entablado. The siga are drawn in code (Block 72) and the
bantay's walk, shot and flinch are made from his still (Blocks 73, 75),
both waiting on the proponent's verdict. What is still owed is ART.md.

Interface: a flat pixel theme, Press Start 2P for titles and VT323 for
everything read, self-hosted. Sound: calm.mp3 as the music, intense.mp3
for the play's fight and the Test Room, the gunshot, the horse near
Kabayo, and sixteen short effects; Musika and Mga tunog switches in
settings. The teacher dashboard is a light report page in English.

The proponent has confirmed on the phone: Block 36's speed fix (18 Sep
2026) and Blocks 37 and 38 as functional. Blocks 57 and 58 were accepted
from the harness and screenshots (23 Sep 2026). The proponent reported
the device pass done on 29 Sep 2026, before Block 80; Blocks 80 and 81
have not been seen on the phone.

Current versions, which index.html must match on every push:

    css/style.css v49    js/game.js v79       js/shell.js v19
    js/inventory.js v9   js/acts.js v14       js/assessment.js v4
    content/act1.js v56  content/items.js v11  content/act2-4.js v1
    content/enemies.js v1   content/questions.js v1
    js/asset-manifest.js v2 (bumped by make-asset-manifest.js)
    ASSET_VERSION 29 (in js/game.js)
    sw.js carries no version: the browser checks it on every visit
    teacher.html: css/teacher.css v4, js/teacher.js v5,
      js/teacher-questions.js v2, js/teacher-talaan.js v1

## Next action

In order.

1. Look at Blocks 80 and 81 on the phone, in landscape, from a private
tab, after the push, with the sound on. Give Nanay the savings and play
to the end. What to look for, and what failure looks like:

    The four years: straight after Nanay's last line, a black card with
      a low drum and a curtain's swish (not the old bell), "Pagkalipas
      ng apat na taon" and "Ngayong gabi sa entablado: Principe
      Baldovino", lifting onto the stage mid-play. Failure: a glimpse of
      the street between the card and the stage.
    The play: three lines, then two kawal from the right wing to fight;
      then Macario's added line, a silent crowd, "Mabuhay si
      Baldovino!", and the curtain card to applause (the first play's
      curtain too). Failure: silence, or the drum, under the curtain.
      Judge whether the applause sounds like a crowd or like rain; a
      recorded one can replace it.
    The wings: the direktor warns about the added line; two dashed
      boxes (katipunero.png, kasama.png) ask whether he is sure and give
      him "Anak ng Bayan".
    The street: no guards and no hearts yet. The Kasama box at 12500;
      the word, and a card: blindfolded, to a secret room.
    The pulungan: a dark wall named pulungan.jpg; the Mabalasig box; the
      warning, the challenge, the three questions, the blindfold again,
      the fire, the oath, the blood; "Lumabas sa likod" on the left.
    The run: out at x 4100 with the hearts showing and three guardia
      civil walking their beats, a crate in each. Seen, the meter fills
      and he is caught: a heart, and back to the door or to the last
      person reached. From behind, a punch takes one down. Hand the
      three their pamphlets (mangingisda, tabakera, karpintero); after
      the third, "Wakas ng Unang Yugto" and the post-test. Failure: a
      guard who sees him while he stands at a person's side, a crate
      that does not hide him, or no post-test.
    Watch whether students find the Kasama and the three from what they
      are told, and whether the guards are too hard; beats and crates
      are PAMPHLET_GUARDS in content/act1.js.

2. Decide the four years. The opening card says 1880, so four years on
is 1884, and the Katipunan was founded in 1892; Sakay joined in 1894,
which the post-test asks. The card names no year for that reason. With
his 1870 birth, a jump of fourteen years (1880 to 1894) would be exact.
Change the gap or the opening year (STORY.md, Open questions).

3. The proponents' review of Blocks 80 and 81: every line is ours (+ in
STORY.md, PLACEHOLDER in content/act1.js), and so are the names
Katipunero, Kasama, Karpintero, Tabakera and Mangingisda. Block 81
checked the rite, the password and Principe Baldovino against the
histories (DECISIONS.md, Block 81, with sources); still for the source
book: the play's words, the ordeal chosen, and what the pamphlets were.

4. The assessment item bank against Act I. The pre-test and post-test
(db/seeds/macario_items_v3.sql, built into content/questions.js,
editable on the dashboard) and the trivia card were written against the
old act's facts (Tondo, the tailor-and-barber trade, the moro-moro,
1894, the Katipunan). Act I now reaches the stage and the Katipunan, but
not the tailor-and-barber trade and not 1894 (item 2). The post-test now
runs, so this decides whether the study measures anything; do it before
the pilot.

5. Decide whether students should see the Test Room button (Block 74).
It is in settings for every student, study accounts included. It is
outside the story and returns to the same spot, so it harms nothing,
but before the pilot either keep it, hide it (one line in shell.js,
_openSettings), or remove testRoom from content/act1.js.

6. Art from the artist: ART.md's Owed list (the Mananahi, the direktor,
Aling Rosa, and since Block 80 the Katipunero, the Kasama, the Mabalasig,
the three who take the pamphlets and the pulungan's painting; Macario's
death pose; the night backdrop), and a side-view walk for Nanay. PNGs
with transparency; each goes through ART.md's steps.

7. Then the remaining polish, the pilot, and Acts II to IV against the
source material, Act II starting from STORY.md, Threads left open.

## The milestone

Final defense with student data collection, confirmed. Grade 8 students
at Imus National High School play the game and sit both tests. School
approval is secured.

Parental consent was waived by the guidance office and the resource
person, on the grounds that the session runs about an hour and that
identifiable results stay with the teacher while the proponents receive
only aggregate figures. Get that waiver in writing and keep it with the
validation form. A panel asking about consent wants a document, not a
recollection.

Data collection covers Act I, since Acts II through IV have no content
yet. Act I quality and the assessment instrument therefore outrank Act
II content entirely.

Freeze the software roughly ten days before the defense, to leave room
for scheduling the session, running it, and analysing what comes back.

Students are identified by a code, never by name. create_accounts.js
issues mag-aaral01 through however many the session needs, with a
matching coded email, and the teacher keeps the code to name mapping on
paper. The database therefore holds nothing identifying, which is what
makes the consent waiver's premise literally true: this Supabase project
is owned by the proponents, and row level security does not restrict a
project owner. Numbering must stay stable once the accounts exist,
because the code is the student's identity for the whole study.

Content authority: the resource person has left the assessment questions
and the storyline to the proponents, and has confirmed it a second time
by declining to complete the instrument validation form and telling them
to make the game. The condition is the whole of what she asked for: both
stay faithful to the source material she provided, as historically
accurate as the available data allows. That makes the Act I rewrite and
the item bank writing tasks rather than approval loops, but the source
is the standard both will be judged against, and there is no external
reviewer standing between a wrong item and the defense. The source is a
physical book, not a file; the proponents work through it with the
session at the time. Do not go looking for it on disk.

## Run log

What has actually been applied to the live Supabase project, and when.
Trust this over any memory of a chat.

    db/migrations/001_macario_schema.sql       RUN
    db/migrations/002_macario_schema_v2.sql    RUN
    db/migrations/003_macario_schema_v3.sql    RUN
    db/migrations/004_macario_schema_v4.sql    RUN, 19 Aug 2026
    db/migrations/005_macario_schema_v5.sql    NOT RUN, per this file.
                                        The three functions behind the
                                        in-game full reset; no tables,
                                        columns or policies. A chat once
                                        reported a reset problem fixed
                                        without saying whether v5 was the
                                        fix: check the SQL editor for
                                        can_reset_my_data() before
                                        trusting this line, then record
                                        it here
    db/migrations/006_macario_schema_v6.sql    RUN, 25 Sep 2026 (the
                                        proponent). Students read
                                        assessment_items whole, teachers
                                        edit items and trivia,
                                        assessment_scores gains attempt
    db/migrations/007_macario_schema_v7.sql    RUN, 29 Sep 2026 (the
                                        proponent). talaan_entries, the
                                        teacher's Talaan papers

    db/seeds/macario_items_v3.sql              RUN, 28 Aug 2026
    db/seeds/enrollment_setup.sql              only for a fresh database
    db/scripts/db_healthcheck.sql              read-only, run any time;
                                        checks all eleven tables, the two
                                        v4 drops and every migration column
    db/scripts/reset_test_accounts.sql         run before any full-flow
                                        test. Owed once since Block 25
                                        (the id "mansanas" changed
                                        meaning); NOT RECORDED AS RUN.
                                        Record the date here when it is

Supabase project reference: rkfnovfkroajottpmxxq. The database holds
eleven tables, matching the revised ERD.

## The three stated objectives

What the panel assesses against.

Objective 1, a 2D narrative RPG across four acts. (IN PROGRESS) The
framework is complete. Act I is playable from the opening to its end,
thirteen objectives on one street, in the entablado and in the
pulungan, and completes into its post-test (Block 80). Acts II to IV are
registered stubs.

Objective 2, gameplay mechanics: dynamic difficulty, health, equipment,
cosmetic rewards. (IN PROGRESS) All four are built and tested against
the harness fixture. The shipped Act I uses health (the play's fight);
its difficulty is the 1.00 of Act I, so the lever cannot be seen; no
equipment or cosmetic item ships (content/items.js is empty). What
remains is content and art, not code.

Objective 3, integrated assessment. (COMPLETE) Pre-tests and post-tests
graded in the game (Block 68, with a pass mark and a replay for a failed
post-test), in-game performance scoring, optional feedback, and the
teacher dashboard, which also edits the questions and the Talaan papers.
Act I's items are seeded and built in (content/questions.js).

## Functional requirements

The paper specifies seventeen.

| Requirement | Status |
|---|---|
| User Authentication | (CHANGED) Login and role routing built. Self-registration deliberately not built; accounts are administrator-created. Play-as-guest for a quick look. A student can change the password in settings |
| Chapter Progression | (PARTIAL) All four acts registered and unlock in order. Act I playable to its end, thirteen objectives, completing into its post-test; Acts II to IV are stubs |
| Player Movement | (BUILT) Walk, run, jump with coyote time and a buffer |
| Combat Mechanics | (BUILT) Punch on a tap, takedown from behind, a shot on a hold, each animated; enemies that fight back; blows with a flash, slide, stagger, topple and fade for every body. Act I ships the play's fight (four soldiers, real walk and sword art); the Test Room's guards can be punched or shot down |
| Stealth Mechanics | (BUILT) Patrols, a detection meter, a sight cone, hide spots, platforms out of sight, guards that turn hostile and shoot. The story's Act I has no stealth section yet; the Test Room shows all of it |
| Interaction System | (BUILT) Dialogue, gifts, NPC reach edge to edge, scenery to use (the apple tree), NPCs that open the shop |
| Narrative Delivery | (PARTIAL) Built: scene scripts that play by themselves, black cards, arrival dialogues. Act I uses them; Acts II to IV have none |
| Dynamic Difficulty | (BUILT) Guard and enemy speed scaled by act, 1.00 to 1.45. Verified against the harness fixture |
| Health System | (BUILT) Health, damage, invulnerability, respawn without a game over, hazards, heart pickups, healing items (fixture; none ships) |
| Equipment System | (BUILT) Sandata, Anting-anting and Damit slots, stacking consumables, quest items, granting and buying, stock per seller. Verified against the fixture; no item ships since Block 52 |
| Cosmetic Reward | (BUILT) Currency awarded per act and scaled by performance, a shop, the Damit slot and sprite swap. No outfit ships yet; verified against the fixture |
| Trivia | (BUILT) Act I built in and editable; Acts II to IV not written |
| Act Assessment | (BUILT) Act I built in and editable; a 75% pass mark and a replay before another post-test try. Acts II to IV not written |
| Performance Scoring | (BUILT) Weighted sum, 50 completion and 25 each for survival and stealth. Time recorded, not scored |
| Progress Tracking | (BUILT) Completion, scores and attempts, damage taken, detections, play time |
| Teacher Monitoring | (BUILT) Class roster and summary per class, scoped by RLS, searchable and sortable; basic summaries, no charts, by decision. Also the questions editor and the Talaan papers |
| Data Synchronization | (CHANGED) Writes go straight to Supabase and the game requires a connection. No offline queue, so "upon internet availability" is not implemented as worded |

## Non-functional requirements

The paper specifies ten.

| Requirement | Status |
|---|---|
| Performance | (BUILT) No build step, no framework, plain script tags. The loop writes to the page only on a change; the phone was confirmed smooth after Block 36. Pictures are JPEG where they can be; everything is kept on the phone after the first visit |
| Reliability | (BUILT) Debounced save, ten second autosave, beforeunload and logout flushes. A loader that retries every picture until it arrives |
| Usability | (BUILT) Tagalog throughout the game; the teacher dashboard in English. Touch targets 44px on glass, icons beside every label, a three-step text size, a rotate notice in portrait. No guide arrow, by decision |
| Accessibility | (BUILT) Runs in Chrome on Android, confirmed on a real device |
| Online Functionality | (BUILT) |
| Compatibility | (PARTIAL) Confirmed on one Android phone. The harness proves the layout at 823 by 412 and 740 by 360 |
| Maintainability | (BUILT) Layers with a strict dependency direction, documented in CLAUDE.md, and two suites (729 and 188 checks) |
| Data Integrity | (BUILT) Row level security and unique constraints. A score cannot be changed or deleted from a browser. Since Block 68 the game grades tests itself (the instructor's decision), so the answer key is readable in the browser |
| Connectivity | (BUILT) |
| Readability | (BUILT) Plus a text size setting the paper does not ask for |

## Blocks

One line each, all (COMPLETE) except 12. Why: DECISIONS.md, by block
number. Before numbering: schema v2 and v3, role routing and class
enrollment, the teacher dashboard, the four-act framework and act state
machine, the assessment module.

    6   scenes, jump, one-way platforms, health, guards, hide spots,
        melee, takedown, projectile
    7   schema v3 and the shell: title gate, pause, settings, logout
    8   hazards, heart pickups, guard speed scaled by act
    9   schema v4: counters, play time, weighted score, sessions,
        feedback
    10  inventory and equipment, granted on act entry
    11  currency by score, the shop, outfits as sprite swaps
    12  polish (IN PROGRESS: what is left is the device pass, Next
        action 3): --zoom 0.7, icons, 44px targets, the full reset
    --  Act I drafted, then reset to Nanay only; the harness fixture
    --  real sprites for Nanay and Macario; spriteFit; measure-sprite.js
    13  corner buttons for inventory and shop
    14  play as guest
    15  flag palette (replaced by 16)
    16  wood, green and cream palette
    17  first shooting sheet; startFrame and endFrame
    18  Tondo.png backdrop; #player above NPCs
    19  the kutsero flashback and Kabayo's apple quest
    20  Kutsero, Tindero, a hazard, the first shop item; opensShop, gift
        onComplete, buyFlag
    21  a fourth objective so the flashback does not end Act I
    22  NPC reach edge to edge; Mansanas a consumable
    23  throw spawn correction (superseded by 24)
    24  bodies: mountBody, bodySprite, footX; hazards hurt on overlap
    25  inventory overhaul: slots, stacks, Gamitin, quest items
    26  mirrored backdrop tiles
    27  the punch sheet; the aim-pose delay
    28  5 by 3 shooting sheet; the shot from the pistol
    29  flat pixel theme and self-hosted fonts
    30  Kabayo's sheet; music, gunshot, nearSound; sound switches
    31  arrivalDialogues, skipIfFlag
    32  the stage clothes, stillDetectionMult, soldBy, opensShopAfter
    33  the real Kutsero sheet; the Tindero; the ground
    34  the entablado; scene backdrops, exits, placement
    35  jump poses; scripted scenes; combat enemies; the moro-moro
    36  performance: no per-frame layout or needless writes
    37  the old ending and pamphlet street; shooting guards, sight,
        platform cover, noRanged, checkpoints, gated exits
    38  hostile guards; a stronger disguise
    39  teacher dashboard restyled, searchable, sortable
    40  the moro-moro's walk and sword art; walkOnly, attackAnimation,
        headroom
    41  stand-in stills (deleted in 59)
    42  the guide (removed in 69); the sight cone; a longer street
    43  painted panels and shadow trees
    44  the repository reorganised
    45  to 47  mirrored panels, then none; the cone from the eyes
    48  the quest chain: linearObjectives, countFlags
    49  and 50  four paintings; four tree models
    51  backdrops as JPEG
    52  Act I rewritten; scene scripts, countCurrency,
        objectiveCurrency, Bagong gawain
    53  to 55  panel street; walks drawn in code (rejected); clean-out
    56  the jobs, the savings, the errand; holdOpen
    57  Act I on one street; black cards, the apple game, movePlayer,
        errands with fixed pay, finished tasks in settings
    58  hiddenByFlag; nine sound effects
    59  stand-ins deleted; the direktor's missing actor and the play
    60  blows with weight: sounds, hit-stop, shake, slide, topple
    61  STORY.md, checked against the content
    62  the loader, loading screens, the service worker
    63  run, coyote time, jump buffer, dust
    64  history pages (replaced by 68)
    65  the apple game's timed round
    66  measured performance pass
    67  the reward pop
    68  questions in the game, the editor, replays, password change,
        the Talaan
    69  dashboard in English; Talaan content removed; the guide removed
    70  the teacher's Talaan papers (schema 007); lower tree crowns
    71  the punch lands on its contact frame
    72  the siga drawn in code
    73  the bantay's walk and shot; the guards' room
    74  the Test Room in settings, outside the story
    75  guards take blows like enemies; the bantay's flinch;
        preview-sheet.js
    76  the enemy catalogue; one blow for every body
    77  ART.md and missing-art.js
    78  loading that cannot be walked past; the asset manifest
    79  the context files compacted: DECISIONS.md split from CLAUDE.md,
        this file rewritten as present state
    80  the end of Act I: four years on, Principe Baldovino, the
        Katipunan, the oath, the pamphlets; holdOpen removed; an owed
        backdrop drawn as a placeholder room
    81  the ending checked against the histories (the komedya, the
        Mabalasig's rite); guards on duty by flag, on the pamphlet run;
        applause; a new black-card sound

## Blocks remaining

Act I's lines and history checked by the proponents, and the item bank
matched to the finished act (Next action, 2 to 4). (IN PROGRESS)

Acts II to IV written against the source material, with their trivia
and test items. Until then those acts skip their tests with a notice,
which is deliberate. (NOT STARTED)

Real items for Sandata, Anting-anting and Damit, and outfit art,
decided against the source material. (NOT STARTED)

## Blocked on other people

These do not depend on any block. Start them before writing more code.

Get Ms. Donadillo-Espiritu's delegation in writing. One paragraph is
enough: that she reviewed the scope, delegated the assessment items and
the storyline to the proponents, and trusts them to stay faithful to the
source material she provided. It replaces the instrument validation form
she declined to complete; without it a panel asking who checked the
questions is told a story rather than shown a document. Keep it with
the consent waiver. (NOT STARTED)

The art in ART.md, from the artist. (NOT STARTED)

Provision student accounts for the session, and pilot with two or three
students who are not part of the study. A pilot run on a study account
consumes that student's one attempt, so the two sets must be separate.
Add the pilot addresses to is_reset_allowed() (a create or replace; no
migration) and record it here. Never add a study account. (NOT STARTED)

## Known problems

Art still owed: ART.md. (KNOWN)

Loading on a slow connection: fixed in Blocks 62 and 78 (a student
cannot go in with art missing); a tester got in with sprites missing
before Block 78. Not yet seen on the phone since. One limit remains: a
picture replaced under the same name and fetched in the minute a push
is still deploying can be kept under the new ?v=; bumping ASSET_VERSION
again fixes it. (FIX BUILT, NOT SEEN ON DEVICE)

A phone that kept an old index.html keeps asking for old files. Since
Block 62 the service worker asks the network for the page first, which
ends it once a phone has the new page. Test from a private tab, or clear
the site's data, before suspecting the code, and bump every changed
file's ?v=N in the same push. (KNOWN, BY DESIGN OF PAGES)

Only one phone has been tested, a 4GB Android device. The harness covers
823 by 412 and 740 by 360 in landscape, a floor rather than a survey.
(PARTIAL)

Dynamic difficulty cannot be seen in the running game, because Act I is
the 1.00 multiplier. The formula is documented and the harness proves
it against a fabricated act; the honest answer to a panel is that the
lever is built and the acts it scales are not written yet. (BY DESIGN)

On a PC the animation looks slightly uneven; students play on phones,
where it is smooth. (KNOWN, OUT OF SCOPE)

The teacher dashboard is deliberately not in the game's pixel theme: a
light report page for laptops and projectors. (BY DESIGN)

## Deferred

A student-facing join screen (join_code exists; classes are assigned by
the administrator). Multiple save slots. Dashboard export and
per-question item analysis. Offline play and save conflicts. Persisting
partial test answers (a reload mid-test asks the questions again;
nothing is recorded until submission, so nothing is lost).

## Verification

From the repository root:

    npm install
    node _dev/tests/test.js
    node _dev/tests/verify_new_scene.js

test.js (729 checks) drives the shipping index.html with a stubbed
Supabase client in headless Chromium at 823 by 412, phone landscape,
against its own fixture act and item catalogue, so every engine system
stays tested whatever Act I ships. Its sections are the inventory of
what is covered. verify_new_scene.js (188 checks) drives the real
content through Act I end to end, to the post-test opening, including
reloads mid-beat, old saves,
a guest and the Test Room, and checks that every line of the content is
in STORY.md, that ART.md's Owed list matches the disk, and that the
asset manifest matches assets/ and every picture in it opens. Anything
other than "0 failed" is a regression. Both never touch the live
project. Both are green as of Block 81.

A check that clicks, or reads pixels, is worth more than one that reads
a style (the dead Atake button would have passed any style assertion).
Add checks in the same block that adds the system. Three checks protect
the study rather than the code: complete runs before the feedback form,
and an act still completes with the feedback module or inventory.js
absent. The harness is not a substitute for a device pass, and cannot
tell whether a sound is too loud.

In a cloud sandbox, npm install --no-save playwright@1.56 matches its
preinstalled Chromium; package.json asks for 1.62, which is right for
the proponent's computer. The pitfalls the suites were built around are
in CLAUDE.md, Pitfalls.

## Documentation debt

For the paper and the defense, tracked apart from code.

Justify vanilla JavaScript and Supabase over Unity and C#, from the
study's own literature review: a comparable project was constrained by
3D performance on low-end devices, and a lightweight browser application
addresses that gap directly. Frame it as responding to an identified
limitation rather than as reduced scope. On 28 Sep 2026 the proponent
asked about porting to Unity and was advised against it (CLAUDE.md,
Stack); this paragraph is the answer to a panel that asks. A draft was
offered. (NOT STARTED)

Revise the ERD to eleven entities. The paper says fifteen and describes
seventeen. PlayerAction and the achievement entities are dropped,
GameScore folds into ActProgress, each with a stated reason. The
database matches. (NOT STARTED)

Document how the assessment items were validated, given that no external
validation form exists: written from the source material, matched pre
and post pairs on the same topic and difficulty with the key in a
different position, and the trivia card checked so it cannot hand a
pre-test answer. Her written delegation sits alongside. (NOT STARTED)

Document grading honestly: since Block 68 the game grades the tests
itself, at the instructor's direction, so a student with the browser's
developer tools could read the answers; a score still cannot be changed
or deleted from a browser, and one attempt per pre-test is enforced by
the database. (NOT STARTED)

Document the dashboard's queries and their RLS enforcement: how one
teacher is kept from another class's data. (NOT STARTED)

Document that game_progress.currency is client written and why that is
acceptable: it buys cosmetics only and touches nothing the dashboard
reports. (NOT STARTED)

Document the performance score formula and its weights, and why time is
recorded but not scored (CLAUDE.md, Standing decisions). (NOT STARTED)

Revise Technical Background: keep Aseprite, Audacity and Figma; remove
Unity and C#; correct Visual Studio to Visual Studio Code; add GitHub
Pages and Supabase. (NOT STARTED)

Credit any licensed art used for enemies, outfits or combat animations.
(NOT STARTED)
