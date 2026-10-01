# TRACKER.md

Where the build is: status, next action, what has been run, what is
blocked. The one file that describes status (with ART.md for the art
still owed). How the thing is built is CLAUDE.md, why is DECISIONS.md,
what the story is is STORY.md. This file records present state only;
history is in DECISIONS.md and git. When something is finished,
compress it to a line.

Status markers: (COMPLETE), (IN PROGRESS), (NOT STARTED), (BLOCKED).

Last updated: 1 Oct 2026, after Block 99. The day's work, newest
first: Block 99, people drawn side on turn to look at Macario and
standing loops start at a random frame and speed; Block 98, six of the
artist's stills in place of placeholders (the leader and the small
siga, the direktor, the Katipunero, the Kasama, the Mananahi); Block
97, one tool and a rig per character for animating any still; Block
96, the big siga from the artist's still, and enemies' hit sheet.
Blocks 90 to 97 were tested on the phone that day with no fault
reported; Blocks 98 and 99 have not been seen on a device yet (Next
action 1). Earlier blocks: the Blocks list below, and DECISIONS.md.
test.js 767 passed, 0 failed; verify_new_scene.js 239 passed, 0
failed. Everything is committed and pushed to main.

A new session, on any device: read CLAUDE.md, then this file's Start
here and Next action, then STORY.md before touching content. A
computer that has never run the suites needs the setup under
Verification first.

## Start here

What MACARIO is right now.

Every engine system is built and covered by the suites: movement, jump
(with coyote time and a buffer) and a run; one-way platforms; health,
hazards and heart pickups; guards with a detection meter, a sight cone,
hide spots, and hostility (chase and shoot); melee that is a dash through
the enemy, a takedown and a ranged shot; enemies that fight back; blows with weight (a flash, a
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
the Kasama takes him into. Fourteen objectives, one chain, shown one at
a time in the quest log (finished ones in Mga Setting). Since Block 89
nothing but the turns is staged: the work is simply there, and can be
done again.

    1  Umuwi kasama si Nanay            the thought after the opening
    2  Maghanap ng trabaho: kausapin    the Kutsero's first conversation
       ang Kutsero
    3  Alagaan ang kabayo ng Kutsero    the first grooming round; the
                                        horse stays there: 4 to 7 barya
                                        a round, 25 in all
    4  Magtrabaho sa barberya           the Barbero's first game (Block
                                        94), his own: the customer's
                                        order of tools, from memory;
                                        4 to 7 a round, 25 in all
    5  Kausapin ang Mananahi            her first conversation (before
                                        the barber she sends him there)
    6  Tulungan ang Mananahi sa         the same game as grooming, at her
       pananahi (n/2)                   tahian; after the second round
                                        she stops him and sends him
                                        with the costumes
    7  Ihatid ang mga damit sa          the direktor's gift button; done
       direktor                         when Macario agrees to act
    8  Gumanap bilang Don Rodrigo sa    the play and its fight; 79 to
       dula                             110 barya
    9  Mag-ipon para kay Nanay (n/100)  shown from the Kutsero's talk as a
                                        second line; Nanay's gift, offered
                                        once the play is done and he
                                        holds 100; then a black card,
                                        four years on
   10  Gumanap bilang Principe          the play, and the Katipunan's
       Baldovino                        two men in the wings asking
                                        whether he is sure
   11  Hanapin ang naghihintay sa       the password to the Kasama,
       kalye                            x 12500
   12  Sumapi sa Katipunan              the oath in the pulungan
   13  Ipamigay ang mga polyeto (n/3)   out the back door, past three
                                        guardia civil: the mangingisda,
                                        the tabakera, the karpintero;
                                        after the third the rounds end
   14  Bumalik sa pulungan at mag-ulat  the Kasama comes to him and
                                        takes him back (Block 95);
                                        the report, then a year on,
                                        Tondo, 1895: the head of his
                                        council, the lie to Nanay, the
                                        door shut on her; this ends the
                                        act and the post-test runs

Act I completes (holdOpen is gone since Block 80). It pays no barya per
step; the performance award is paid on completion.
One item ships: the stage clothes (damit-entablado), which the direktor
gives Macario after Principe Baldovino, worn from then on; standing
still in them, a guard notices him five times more slowly. The harness
fixture covers every other item path. Acts II to IV are registered stubs.

Enemies are content: content/enemies.js describes each kind
once (bantay, kawal, and the three siga of the opening) and scenes place
them by type.

Art: Macario's idle, walk, jump, punch and shot are the artist's; so are
Nanay, the Kutsero, Kabayo, Maryam,
the play's soldiers, the Mananahi, the street paintings and the inside
of the entablado; and the stills of the bantay, the three siga, the
direktor, the Katipunero and the Kasama, whose motion is made from them
by tools (animate-bantay.js; animate-still.js and a rig each, Blocks 96
to 98). The proponent accepted the big siga on 1 Oct 2026 ("peak").
Nothing is drawn in code any more. Any further still the artist
delivers is animated the same way (CLAUDE.md, Animating a character
from one still). What is still owed is ART.md: nine pictures.

Interface: a flat pixel theme, Press Start 2P for titles and VT323 for
everything read, self-hosted. Sound: calm.mp3 as the music, intense.mp3
for the fights, the gunshot, the horse near
Kabayo, and about twenty short effects; Musika and Mga tunog switches in
settings. The teacher dashboard is a light report page in English.

The proponent has confirmed on the phone: Block 36's speed fix (18 Sep
2026) and Blocks 37 and 38 as functional. Blocks 57 and 58 were accepted
from the harness and screenshots (23 Sep 2026). The proponent reported
Blocks 80 to 85 working on the phone on 30 Sep 2026, and accepted
Blocks 86 to 89 from the desktop browser the same day. On 1 Oct 2026
the proponent tested Blocks 90 to 97 on the phone and reported no
fault. Blocks 98 and 99 (the six new characters; facing and breathing
out of step) are pushed and not yet seen on a device: Next action 1
says what to look for.

Current versions, which index.html must match on every push:

    css/style.css v59    js/game.js v96       js/shell.js v21
    js/inventory.js v11  js/acts.js v14       js/assessment.js v5
    content/act1.js v70  content/items.js v13  content/act2-4.js v1
    content/enemies.js v5   content/questions.js v1
    js/asset-manifest.js v6 (bumped by make-asset-manifest.js)
    ASSET_VERSION 34 (in js/game.js)
    sw.js carries no version: the browser checks it on every visit
    teacher.html: css/teacher.css v4, js/teacher.js v5,
      js/teacher-questions.js v2, js/teacher-talaan.js v2

## Next action

In order.

1. Every new block is seen on the phone before it is called done: in
landscape, from a private tab, after the push, with the sound on,
played from the start. Write the block's own checks here (what to see,
and what failure looks like) when it ships, and take them out again
once the proponent reports it working. Blocks 90 to 97 were tested on
1 Oct 2026. Open:

    Block 98, six characters. The opening: all three siga are the
      artist's, the leader in a salakot and shawl, the big one in a red
      sash, the small one with a pouch; three heights, the big one
      tallest, the small one shortest. They walk on, breathe and nod
      while the leader taunts, and in the fight each draws his fist back
      on the red ! and punches, and flinches when hit. The leader's
      dialogue bust is his new art. The Mananahi stands still, facing
      the front. The direktor, on the street and in the wings, breathes
      and nods, his cane staying on the ground. After Principe
      Baldovino the Katipunero and the Kasama walk on from the wing,
      facing the way they walk, and stand breathing; the Kasama walks up
      to Macario after the pamphlets, and the two walk in the year-on
      scene. Failure: anyone walking backwards, floating or sinking,
      sliding while standing, a dashed box, a seam or a smudge where an
      arm moved, the shawl or the bolo moving with a leg, or a cane that
      lifts.

    Block 99, facing and breathing. On the street the direktor looks
      left at Macario as he comes, and turns if Macario walks past him;
      in the wings he looks right, at Macario on his right. In the
      pulungan the Katipunero, the Kasama and (once drawn) the Mabalasig
      look at him; so does the Kasama on the street, and Maryam on the
      stage. The three siga, and anyone else standing together, breathe
      out of step, each at his own pace. Failure: anyone still looking
      away, a turn that flickers while Macario stands in front of
      someone, a placeholder box whose name reads backwards, or
      breathing in step.

Still to watch, in the pilot rather than on
one phone: whether the work game's green patch is too thin by the fifth
stroke, and whether students find the Kasama and the three who take
the pamphlets from what they are told (beats and crates are
PAMPHLET_GUARDS in content/act1.js).

2. The years are settled (Block 83): the opening reads "Tondo, 1890",
the four-year cut "Tondo, 1894", the year Sakay joined, and the end
"Tondo, 1895" (Block 94). Open: the year he became head of his council,
and the council's name, against the source book. Also open:
by the 1870 birth date he is twenty at the opening, older than the boy
the opening shows (STORY.md, Open questions). The trivia card and the
item bank should use the same years.

3. The proponents' review of our lines: every line marked + in STORY.md
(PLACEHOLDER in content/act1.js), above all Blocks 80 and 81 (the
Katipunan, the oath, the pamphlets) and Blocks 94 and 95 (the Barbero,
the report, the year after, the lie to Nanay, the Kasama coming for
him), and the names Katipunero, Kasama, Karpintero, Tabakera,
Mangingisda and Suki. Block 81 checked the rite, the password and
Principe Baldovino against the histories (DECISIONS.md, Block 81, with
sources); still for the source book: the play's words, the ordeal
chosen, what the pamphlets were, and the Talaan's three papers of facts
(Block 94; STORY.md, The Talaan).

4. The assessment item bank against Act I (db/seeds/macario_items_v3.sql,
built into content/questions.js, editable on the dashboard). Checked 30
Sep 2026: eight of ten items per test were taught by the story. Since
Block 94 the occupation item ("Mananahi at barbero") is taught too: he
sews for the Mananahi and works the Barbero's chair, and the Talaan's
first paper says it. Still for the proponents: "Mangingisda at
magsasaka" is a pre-test distractor while a mangingisda is someone he
meets, which can pull a student toward the wrong answer; and the rite
(the three questions, Anak ng Bayan) is taught but tested by no item,
worth one matched pair. The item bank and the story agree on 1894. The
post-test runs, so this decides whether the study measures anything; do
it before the pilot.

5. Art from the artist: ART.md's Owed list, nine pictures since Block
98 (the Mabalasig, the three who take the pamphlets, the pulungan's
painting, Nanay's side-view walk, the Mananahi's sewing table, and the
Barbero and his chair). PNGs with transparency; each goes through ART.md's steps.
A character delivered as one still rather than a sheet is animated by
the tool (CLAUDE.md, Animating a character from one still): ask the
artist for the whole figure side on, standing, arms free of the body.

6. Then the remaining polish, the pilot, and Acts II to IV against the
source material, Act II starting from STORY.md, Threads left open.

7. Privacy of the public repository (30 Sep 2026). Done: the names of
the team, the resource person and the school are out of every tracked
file, docs-private/ and *.pdf and *.docx are gitignored, and the two
private files were deleted from GitHub. Open: they and the names are
still in the git history (the proposal and the validation form in older
commits; older README versions), and every commit carries the author
name and email. Only a history rewrite and a force push purges them, and
the GitHub username stays in the repository's URL either way. The
proponent has not yet decided whether to rewrite the history.

## Act I polish list (Block 93)

Agreed 30 Sep 2026: seventeen items, all (COMPLETE) except the missing
sprites, which wait on the artist (ART.md; BLOCKED). Tested on the phone
1 Oct 2026. The list and why each was built as it was: DECISIONS.md,
Block 93.

## The milestone

Final defense with student data collection, confirmed. Grade 8 students
at the partner school play the game and sit both tests. School
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
fourteen objectives on one street, in the entablado and in the
pulungan, and completes into its post-test (Block 80). Acts II to IV are
registered stubs.

Objective 2, gameplay mechanics: dynamic difficulty, health, equipment,
cosmetic rewards. (IN PROGRESS) All four are built and tested against
the harness fixture. The shipped Act I uses health (the play's fight);
its difficulty is the 1.00 of Act I, so the lever cannot be seen; one
equipment item ships, the stage clothes (Block 82), and no cosmetic.
What remains is content and art, not code.

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
| Chapter Progression | (PARTIAL) All four acts registered and unlock in order. Act I playable to its end, fourteen objectives, completing into its post-test; Acts II to IV are stubs |
| Player Movement | (BUILT) Walk, run, jump with coyote time and a buffer |
| Combat Mechanics | (BUILT) Punch on a tap, takedown from behind, a shot on a hold, each animated; enemies that fight back; blows with a flash, slide, stagger, topple and fade for every body. Act I ships a dash through the enemy, the opening fight with the three siga and the play's fight (four soldiers, real walk and sword art); the pamphlet run's guards can be taken down from behind |
| Stealth Mechanics | (BUILT) Patrols, a detection meter, a sight cone, hide spots, platforms out of sight, guards that turn hostile and shoot. Act I's pamphlet run uses patrols, the meter, the cone, crates and catches; shooting guards are covered by the harness fixture |
| Interaction System | (BUILT) Dialogue, gifts, NPC reach edge to edge, scenery to use (the sewing table), the work game and the barber's memory game, tutorials that wait for the task, NPCs that open the shop |
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
| Maintainability | (BUILT) Layers with a strict dependency direction, documented in CLAUDE.md, and two suites (767 and 239 checks). Characters animated from one still by one tool and a rig each |
| Data Integrity | (BUILT) Row level security and unique constraints. A score cannot be changed or deleted from a browser. Since Block 68 the game grades tests itself (the instructor's decision), so the answer key is readable in the browser |
| Connectivity | (BUILT) |
| Readability | (BUILT) Plus a text size setting the paper does not ask for |

## Blocks

One line each, all (COMPLETE). Why: DECISIONS.md, by block
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
    12  polish: --zoom 0.7, icons, 44px targets, the full reset (its
        device pass done 1 Oct 2026)
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
    82  the stage clothes from the direktor (Inventory.grant); jumpPlayer,
        the fire leap shown; running allowed away from guards
    83  the opening in 1890, the cut to 1894
    84  black screens silent: no sound on a black card or a scene fade
    85  the feel pass: night, detection sounds, a breath before the
        post-test, the rite trimmed, crickets, the cheer, the costume
        tint, the first-guard hint, fast-forward, the Mananahi at the play
    86  the dash attack, enemy tells and spread, dialogue portraits
    87  the opening ends in a fight with the siga; the dash on guards;
        portraits as busts
    88  one template for everything that fights: decide, tell, strike
        fast; transparent busts
    89  Act I's work is there to be done: the horse and the sewing as
        one repeatable game, the Mananahi stopping him as the one script
    90  the work gets harder as it goes; sewing played by holding; a
        picture for each job; Aling Rosa and Mang Tomas removed
    91  the legacy stage performance (poem, night, death), the night
        backdrop layer and the unused Tindero file removed
    92  enemy dash and red !, tutorials that stop the world, the savings
        pinned in the log
    93  the Act I polish list (TRACKER.md, above; DECISIONS.md)
    94  the Barbero and his own game (playOrderGame); the end a year on,
        the head of his council; the Talaan's own papers of facts
    95  the Kasama takes him back instead of a door; the Test Room
        removed
    96  the big siga from the artist's still: breath, swagger, punch,
        flinch; enemies take a hit sheet
    97  one tool for any character from one still: animate-still.js,
        a rig per character, a shared library of motions
    98  six of the artist's stills: the leader and the small siga, the
        direktor (breathing), the Katipunero, the Kasama, the Mananahi;
        draw-siga.js removed
    99  people drawn side on look at Macario (facesPlayer); standing
        loops start at a random frame and speed

## Blocks remaining

Act I's lines and history checked by the proponents, and the item bank
matched to the finished act (Next action, 2 to 4). (IN PROGRESS)

Acts II to IV written against the source material, with their trivia
and test items. Until then those acts skip their tests with a notice,
which is deliberate. (NOT STARTED)

Real items for Sandata, Anting-anting and Damit, and outfit art,
decided against the source material. (NOT STARTED)

The feel pass, agreed 30 Sep 2026: twelve items, all (COMPLETE) in
Block 85 except two. The item bank matched to Act I is Next action 4
(IN PROGRESS), and the placeholder art (the Mananahi, the direktor and
the Kasama first) waits on the artist (BLOCKED). The list: DECISIONS.md,
Block 85.

## Blocked on other people

These do not depend on any block. Start them before writing more code.

Get the resource person's delegation in writing. One paragraph is
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

The game_progress.is_night column is no longer written (Block 91); it can
be dropped in a later migration. A student-facing join screen (join_code exists; classes are assigned by
the administrator). Multiple save slots. Dashboard export and
per-question item analysis. Offline play and save conflicts. Persisting
partial test answers (a reload mid-test asks the questions again;
nothing is recorded until submission, so nothing is lost).

## Verification

From the repository root:

    npm install
    node _dev/tests/test.js
    node _dev/tests/verify_new_scene.js

Setting up a computer that has never run them (done on the proponent's
Windows computer, 1 Oct 2026): install Git and Node.js LTS (winget
install Git.Git and OpenJS.NodeJS.LTS, or the installers), sign Git in
to GitHub on the first push, then npm install and npx playwright install
chromium from the repository root. Python is not needed for anything
but the optional art scripts (key-black.py and the like, with Pillow).
On that computer Playwright's own downloader timed out every time while
curl fetched the same file at full speed; the fix was to download the
headless shell by hand and unzip it where Playwright looks:

    https://cdn.playwright.dev/builds/cft/<chrome version>/win64/chrome-headless-shell-win64.zip
    into %LOCALAPPDATA%\ms-playwright\chromium_headless_shell-<build>\

npx playwright install chromium --dry-run prints both numbers (1243
and 153.0.8010.12 for Playwright 1.63), and the harness says which path
it wanted if it is still missing. A Playwright update needs it again.
The suites take about 7 minutes (verify_new_scene.js) and 10 (test.js)
there; run them one after the other, not at once.

test.js (767 checks) drives the shipping index.html with a stubbed
Supabase client in headless Chromium at 823 by 412, phone landscape,
against its own fixture act and item catalogue, so every engine system
stays tested whatever Act I ships. Its sections are the inventory of
what is covered. verify_new_scene.js (239 checks) drives the real
content through Act I end to end, to the post-test opening, including
reloads mid-beat, old saves,
a guest, and checks that every line of the content is
in STORY.md, that ART.md's Owed list matches the disk, and that the
asset manifest matches assets/ and every picture in it opens. Anything
other than "0 failed" is a regression, with one caution learned on
30 Sep 2026: on a busy machine verify_new_scene.js has twice failed a
timing check (the pamphlet guard catch) or lost a page ("Page crashed")
once, and passed on the next run; rerun before believing either. test.js
has not done it. Both never touch the live
project. Both are green as of Block 99. The guard-catch flake was
traced in Block 93: a siga's blow landing, at random, in the moment
before the harness knocks the opening fight down left Macario short of
hearts for the rest of the act, so the catch emptied them. That check
now starts from full health.

A check that clicks, or reads pixels, is worth more than one that reads
a style (the dead Atake button would have passed any style assertion).
Add checks in the same block that adds the system. Three checks protect
the study rather than the code: complete runs before the feedback form,
and an act still completes with the feedback module or inventory.js
absent. The harness is not a substitute for a device pass, and cannot
tell whether a sound is too loud.

In a cloud sandbox, npm install --no-save playwright@1.56 matches its
preinstalled Chromium; package.json asks for ^1.62, which installed
1.63 on the proponent's computer. The pitfalls the suites were built around are
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
