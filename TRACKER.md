# TRACKER.md

The single source of truth for status. A session starting work on this
project reads CLAUDE.md for how things are built, then this file for
where they are, then STORY.md for what the story is. Start with "Start here"; it is written so a new session
can act without reading anything else first.

Three files carry context, and they do not overlap:

    CLAUDE.md     how the thing is built. Architecture, conventions,
                  data formats, decisions on record. Changes rarely.
    TRACKER.md    where the build is. Status, next action, what has
                  been run, what is blocked. Changes every session.
    STORY.md      what the story is. Scenes, places, people, beats,
                  interactions and every line of dialogue. Changes
                  whenever the story does (Block 61).

ART.md (Block 77) is the one narrow exception: the art the game still
needs, checked against the files on disk by verify_new_scene.js. Known
problems below points to it rather than keeping a second list.

Nothing else in this repository describes status. README.md is the
public face on GitHub and is written for a reader who is not working
on the code.

This file records present state, not history. When something is
finished, compress it to a line. Detail about how and why lives in
CLAUDE.md, Decisions on record, and in git history.

Status markers: (COMPLETE), (IN PROGRESS), (NOT STARTED), (BLOCKED).

Last updated: 28 Sep 2026, after Block 78: loading cannot be walked
past. A picture that exists is waited for until it arrives (no more
20-second cap, and a 404 during a deploy no longer makes it a box); the
whole act is fetched on the title screen; a slow connection gets a note
and Subukan ulit, never a way in without the art. New:
js/asset-manifest.js and make-asset-manifest.js. test.js 729 passed,
0 failed; verify_new_scene.js 132 passed, 0 failed. Pushed
to main.

Before that, 28 Sep 2026, after Block 77: ART.md, a list of the art
the game still needs, checked against the files on disk by
verify_new_scene.js (_dev/tools/missing-art.js finds them). Check it
from time to time (CLAUDE.md, top). verify_new_scene.js 130 passed, 0
failed. Pushed to main.

Before that, 28 Sep 2026, after Block 76: enemies are content now, an
enemy catalogue (content/enemies.js) of types placed by name, and the
engine has one way of taking a blow for every kind (takeBlow). Nothing
on screen changed. test.js 725 passed, 0 failed; verify_new_scene.js
128 passed, 0 failed. Pushed to main.

Before that, 28 Sep 2026, after Block 75: guards take blows the way
the moro-moro's soldiers do, punches and gunshots alike: a slide, a
flash, a stagger, and when put down the same topple and fade. The
bantay reels in a hit sheet of his own. New tools: preview-sheet.js and
lib/png.js. test.js 718 passed, 0 failed; verify_new_scene.js 126
passed, 0 failed. Pushed to main.

Before that, 28 Sep 2026, after Block 74: the guards' room no longer
follows the talk with Nanay; it is reached only from a "Test Room"
button in Mga Setting (from pause), "<WIP>" card first, and its door
returns to the exact spot. The main plot is back to exactly what it was
before Block 73. test.js 711 passed, 0 failed; verify_new_scene.js 124
passed, 0 failed. Pushed to main.

Before that, 28 Sep 2026, after Block 73: the guard's still (Guard.png)
is assets/sprites/enemies/bantay.png, with a walk and a hip-fire shot
made from its own parts by _dev/tools/animate-bantay.js; and, as work in
progress and NOT the plot, a "<WIP>" card after the talk with Nanay that
leads into a room of three hostile bantay (scene bantayan), whose door
goes back to Nanay. test.js 711 passed, 0 failed; verify_new_scene.js
120 passed, 0 failed. Pushed to main.

Before that, 25 Sep 2026, after Block 72: the three siga have art of
their own, drawn from nothing in code at the proponent's request
(_dev/tools/draw-siga.js), each with a 12-frame idle and an 8-frame
walk that plays while the opening walks them on; three builds, three
heights. test.js 711 passed, 0 failed; verify_new_scene.js 107 passed,
0 failed. Pushed to main.

Before that, 25 Sep 2026, after Block 71: the punch lands with the
fist. The hit, the swing sound, the thump and the enemy's stagger now
happen on the melee clip's contact frame (frame 6, full extension)
rather than on release; a tap while the fist is on its way is ignored.
test.js 711 passed, 0 failed; verify_new_scene.js 105 passed, 0
failed. Pushed to main.

Before that, 25 Sep 2026, after Block 70: the teacher writes the
Talaan now, up to three papers per act on the dashboard (Talaan
Papers), which lie at three places fixed in content (Act I: 2500 on
the road, 8200 and 12200 at jump height); and the shadow trees' crowns
brought down into a phone's screen, so the four models (two palms, two
broadleaf) look different again. Schema 006 is RUN (the proponent, 25
Sep 2026). Schema 007 (talaan_entries) is written and NOT RUN: until
it is, the Talaan Papers card cannot save and no papers lie on the
road. test.js 707 passed, 0 failed; verify_new_scene.js 105 passed, 0
failed. Pushed to main.

Before that, 25 Sep 2026, after Block 69: the teacher dashboard in
English; the Talaan's Block 68 words and hints removed (the engine
kept, the button hidden until the proponents write their own); the
apple tree is now the silhouette tree over the join at 5800, with no
sprite; and the guide removed entirely, so students find their own
way. test.js 696 passed, 0 failed; verify_new_scene.js 99
passed, 0 failed. Pushed to main.

Before that, 25 Sep 2026, after Block 68, the instructor's requests:
the questions and answers in the game (content/questions.js, graded by
the game), a teacher editor for them on the dashboard, a replay of the
act after a failed post-test (75% to pass), a password change in
settings, and the Talaan (glossary words earned by doing things, and
three random hints for the post-test) in place of Block 64's fact
pages; the run toned down from 8.5 to 6.8. Cloud sessions now push
straight to main (CLAUDE.md, Deployment). test.js 699 passed, 0
failed; verify_new_scene.js 115 passed, 0 failed. Pushed to main. Not
played on the phone. Schema 006 is NOT RUN: until it is, the teacher's
edits cannot be saved and a second post-test try is not stored (see
Next action, 0).

Last updated: 24 Sep 2026, after Blocks 62 to 67, one cloud session
asked to "make it fun and performance friendly": a picture loader with
retries, a loading bar and a service worker (62), a run and a forgiving
jump with dust (63), ten pages of history to find along the street (64),
the apple game with streaks, golden apples and a timed round (65), a
measured performance pass (66), and a coin pop when paid (67). It also
found and fixed the body font, which had never been served on the live
site. test.js 676 passed, 0 failed; verify_new_scene.js 115 passed,
0 failed. Blocks 62 to 67 are on the branch claude/quirky-galileo-8gug2y,
not on main, and not played on the phone.

Before that, Block 61 (STORY.md, the plot and script of the game as a
third context file, checked against content/act1.js by
verify_new_scene.js). Blocks 59 to 61 are not pushed; 59 and 60 are not
played on the phone.

Block 60, the same day (combat with weight: a swing
on every punch, a thump when it lands, a freeze of a few frames, a
camera shake, enemies that slide back and topple when dropped, and a
buzz and a jolt when Macario is hit). The proponent loved Block 59's
dialogue; how it was written is now a standing convention (CLAUDE.md,
Conventions, Writing dialogue).

Block 59, the same day (every stand-in sprite made
in code or recoloured deleted, placeholder boxes in their place; no
"1884" jump: the direktor is the last delivery, his lead actor is
missing, and Macario plays him in a moro-moro inside the entablado,
fight included, then is paid and gives Nanay the savings).

Before that: 23 Sep 2026, after Block 58 (the street cleared after the
"1884" card, leaving Nanay, the Mananahi and the direktor, the shadow
trees kept; and nine small sound effects), which followed Block 57 (Act
I on one street, ten paintings long: no house and no tailor's shop,
Nanay outside for good and sliding on, "Tondo, 1880" and "1884" as
black cards, an apple-catching mini-game in place of the timing bar,
the jobs as errands with fixed pay, the direktor on the street taking
Macario into the entablado, and the finished tasks in settings). The
proponent reviewed both, 23 Sep 2026, and is happy with them: Act I's
shape as of Block 58 is accepted, not experimental. Blocks through 41 are pushed
(088f5e4); Blocks 42 to 58 are in the device folder and NOT yet pushed.
Push everything as one commit (see Right now). test.js 634 passed, 0
failed; verify_new_scene.js 91 passed, 0 failed. None of Blocks 42 to
58 has been played on the phone.

Blocks 52 to 56 were an experimental window, tried out passage by
passage; Blocks 57 and 58 settled it, and the proponent has accepted the
result (23 Sep 2026). What is still open is content, not shape: the
PLACEHOLDER lines, stand-in art, and the passage after the direktor
(Next action, 1). Block 57 changes
Act I's objectives from three to nine, so db/scripts/reset_test_accounts.sql
should be run on the test accounts before a full-flow test (an old save
still lands somewhere sensible; see verify_new_scene.js).

## Start here

What MACARIO is right now, in one screen.

Every engine system is built and covered by the suite: movement and
jump, one-way platforms, health, hazards, heart pickups, guards with a
detection meter, hide spots, melee and a ranged shot, enemies that fight
back, scripted scenes, dynamic difficulty, the act state machine, trivia,
pre-test and post-test with server-side grading, the weighted performance
score, feedback, currency, the shop, equipment and outfits,
play-as-guest, sound, settings and the full reset (which needs schema
v5), and the teacher dashboard.

Since Blocks 62 to 67: pictures load through one loader that retries a
dropped download, the title screen shows a loading bar, the world and
every scene change wait (briefly) for their art, and a service worker
keeps every file on the phone after the first visit. Holding a
direction for half a second breaks into a run (not near guards or in a
fight), jumps forgive a thumb a few frames late or early, and dust
flies. Block 64's ten pages of history were replaced in Block 68 by
the Talaan, whose content the proponents did not want (Block 69); since
Block 70 it holds up to three papers the teacher writes on the
dashboard, lying at three fixed places on the street, each opening a
card and listed on the pause screen (STORY.md, The Talaan). The apple tree, once
the horse is fed, is a thirty-second game with golden apples and a best
score. Being paid pops "+N" with a coin.

Speed: the lag reported after Block 35 is fixed. Block 36 cut the game
loop's per-frame layout and DOM work, and the proponent confirmed the
game runs smoothly on the Android phone afterwards, 18 Sep 2026. On a PC
the animation looks slightly uneven; that is a development machine, not
the target device, and the proponent has ruled it out of scope.

Act I was rewritten in Block 52 against the proponents' new script and
plot, and is the only act with content. Acts II to IV are registered
stubs. Act I cannot be completed yet, on purpose: since Block 56 every
step can be done, and holdOpen keeps the act (and the post-test) open
until the story past the entablado is written.

The street is ten paintings long (Block 57, at the proponent's
direction): assets/backgrounds/act1/street-01..04.jpg in order, twice,
then 01 and 02 again, one 1450px panel each, 14500px in all, each
standing whole on the floor with the street's sky colour above, with a
tree in silhouette over each of the nine joins (Blocks 43 and 50).
Keep anyone a student must reach at least 90px clear of a join
(multiples of 1450). There is no other scene except the inside of the
entablado, which only the direktor takes Macario into.

    The quest log (Block 48) shows one task, the step in hand. The
    finished ones are listed in Mga Setting, "Mga natapos na gawain"
    (Block 57). Act I's nine objectives, one chain:

      1  Umuwi kasama si Nanay                   the thought at the end
                                                 of the opening
      2  Maghanap ng trabaho: kausapin ang       the Kutsero's first
         Kutsero                                 conversation
      3  Kumuha ng tatlong mansanas at ipakain   counts apples caught;
         sa kabayo (n/3)                         done by feeding the horse
      4  Kunin ang bayad sa Kutsero              his gift button, 50 barya
      5  Kausapin ang Mananahi                   her first conversation
      6  Ihatid ang mga tinahing damit (n/3)     Aling Rosa, Mang Tomas,
                                                 then the direktor; done
                                                 when Macario agrees to act
      7  Gumanap bilang Don Rodrigo sa dula      the play, inside the
                                                 entablado; 79 to 110 barya
      8  Kunin ang bayad sa Mananahi             her gift button, 50 barya
      9  Ibigay kay Nanay ang naipon (n/100)     Nanay's gift

    What happens in each step, where everyone stands, and every line,
    is in STORY.md, Act I, beat by beat: the opening on the street,
    the Kutsero's apples and horse, the Mananahi's deliveries, the
    direktor's missing actor, the play in the entablado, the Mananahi's
    pay and the savings. Act I stays open (holdOpen) after the last.

A reload in the middle of the opening, the direktor's scene or the play
plays it again from the top; a reload after the talk with Nanay plays
only the thought. Saves
from Blocks 52 to 56 (bahay, patahian) land on the street. Act I pays no
barya per finished step (objectiveCurrency: false), so only the story
moves the count; the whole performance award is paid on completion.

content/items.js is empty since Block 52. The corner shop button still
opens Tindahan, which lists nothing. The harness fixture carries
equipment, outfits, a consumable and a quest item, so those paths stay
tested.

Everything the old Act I used is still in the engine and still on disk,
ready for the next passages: NPCs with dialogue sets and gifts, shops per
seller, exits and doorways, arrival dialogues, scene scripts, scripted
walk-ons, combat with enemies (the moro-moro's walk and sword sheets),
guards with cones, platforms, hazards, heart pickups, checkpoints
(the guide was removed in Block 69), and the art for Kabayo, the Kutsero, the Tindero, Maryam, the
the inside of the entablado, and the Block 41 stand-ins.

Macario's art: idle, walk, jump, melee punch (tap Atake) and shooting
(hold Atake) are real sheets, measured with _dev/tools/measure-sprite.js. His
death pose is missing.

The interface is a flat pixel-art theme (Block 29): square panels, hard
outlines, Press Start 2P for titles and VT323 for everything read, both
self-hosted in assets/fonts.

Sound: Calm.mp3 loops as background music from the moment the world is
entered, and Gun_Shot.mp3 plays on every shot. Horse.mp3 loops near the
white horse (nearSound). Block 58 added nine small effects
(assets/audio/sfx/*.wav, made by _dev/tools/make-sfx.py): a blip on
each line of dialogue, jump, coin when barya is earned, give on a gift,
a chime with Bagong gawain, catch and miss in the apple game, a swoosh
on every fade, and a low bell with a black card. Intense.mp3 (a fight's track) is on disk and in
no scene since Block 52. Settings has Musika and Mga tunog switches, both on by
default.

Current versions, which index.html must match on every push:

    css/style.css v48    js/game.js v77       js/shell.js v19
    js/inventory.js v9   js/acts.js v14       js/assessment.js v4
    content/act1.js v54  content/items.js v11  content/act2-4.js v1
    content/enemies.js v1   js/asset-manifest.js v1 (bumped by its tool)
    content/questions.js v1 (named in index.html and teacher.html)
    ASSET_VERSION 28 (in js/game.js)
    sw.js carries no version: the browser checks it itself on every
    visit (Block 62)
    css/teacher.css v4   js/teacher.js v5     js/teacher-questions.js v2
    js/teacher-talaan.js v1                   (named in teacher.html)

The proponent has played Blocks 37 and 38 and reported them functional,
and confirmed Block 36's speed fix on the phone. Blocks 57 and 58 were
reviewed and accepted on 23 Sep 2026 from the harness and screenshots,
not yet on the phone. Whether the rest of
Blocks 14 to 44 has been through a full pass on the phone is not
recorded, so the device checklist under Next action still stands before
the pilot.

The teacher dashboard (teacher.html) was restyled in Block 39: a light
report page, six summary figures each with its n, and a roster that can
be searched and sorted, with Act I's status, objectives and play time.
Its versions are in the list above.

## Right now

Blocks 1 to 58 are built. Blocks 22 to 41 were one build session, 17 to
18 September 2026, each on direct feedback from the proponent; Blocks
42 to 49 were 20 September, and Blocks 50 and 51 the 21st:

    22  NPC reach measured edge to edge; Mansanas made a consumable
    23  a throw spawn correction, superseded by 24
    24  the body model: art stands on its hitbox (hazard bug fixed)
    25  item and inventory overhaul: three slots, stacking
        consumables with Gamitin, quest items, two-column shop and
        inventory, select-then-act, guests can use items, Tindahan
        removed from inventory and Imbentaryo from pause
    26  backdrop seam: every second Tondo.png tile mirrored, the dark
        tree-shadow posts removed
    27  melee punch sheet on a tap; Kutsero's idle sheet
    28  new 5 by 3 shooting sheet; the shot leaves from the pistol
    29  flat pixel UI theme and self-hosted pixel fonts
    30  Kabayo's 22-frame sheet (pixelated scaling); audio: Calm.mp3
        music, Gun_Shot.mp3 on a shot, Horse.mp3 near Kabayo, and
        Musika and Mga tunog switches in settings
    31  arrival dialogues (the memory's opening line, the return to
        Nanay), skipIfFlag so Nanay does not replay her errand, Nanay's
        new opening, a longer tondo road and the Mananahi
    32  the first equipment: stage clothes in Damit with
        stillDetectionMult; soldBy stock per seller; opensShopAfter;
        200 barya from Nanay; the tailor quest (fifth objective);
        Nanay's opening rewritten
    33  the real Kutsero sheet; the old one renamed Tindero and wired
        in; Lupa.jpg as the ground, greyed in the memory
    34  the entablado: Entablado_Labas.png at the end of a 2900px road,
        a doorway into an "entablado" scene with Entablado.png as its
        own backdrop, and back out; scene backdrop, ground and exits
    35  the moro-moro: jump poses; scripted scenes (playDialogue,
        moveDecoration and the rest); combat with five enemies
    36  performance: no layout read or needless DOM write per frame, the
        world sized to its scene, night tiles built only when needed,
        music tracks kept rather than refetched
    37  placeholder script for the rest of Act I: Maryam's ending, the
        Katipunan at the stairs, the lansangan street with three
        pamphlets; guards that shoot, sight drawn on the road, platforms
        out of sight, noRanged, checkpoints, gated exits; Act I
        completable
    38  guards hostile once they have seen him (chase, shoot, two
        punches to drop); stage clothes 0.2 with a blue meter and a
        toast
    39  teacher dashboard restyled: light report layout, summary
        figures with n, search and sort, Act I status, objectives and
        play time per student; first harness coverage of the page
    40  the man in the moro-moro and his five guards on real art:
        Muslim_Walk and Muslim_Attack, keyed from JPEG to PNG; walking
        decorations, attack sheets for enemies, sheet headroom
    41  no dashed boxes left in Act I: stand-in stills for the
        Mananahi, Bonifacio, the Katipunero, the townspeople and the
        street guards, built from the commissioned sheets, plus apple
        and stage-clothes tile pictures
    42  the guide (arrow over the next goal, edge tab with distance);
        guard sight as a low cone; the lansangan at 11000px with ten
        citizens, eight guards, seven platforms, three hearts and four
        checkpoints; a consistency pass on Act I's lines and names
    43  the new Background paintings side by side in tondo, the memory
        and the lansangan, with a shadow tree over each join
    44  the repository reorganised: css/, js/, assets/ by type with
        lowercase hyphenated names, db/migrations, seeds and scripts,
        _dev/tests and _dev/tools; private documents and old screenshots
        moved to a gitignored docs-private/ (CLAUDE.md, Repository layout)
    45  the streets back on Tondo.png, every second copy mirrored, the
        shadow trees kept at the joins
    46  mirroring removed; the backdrop drawn whole, standing on the
        floor, with its sky colour above; the guard's cone from his eyes
    47  the cone looks straight ahead instead of down at the road
    48  quests rebuilt: eleven objectives as one gated chain, the log
        showing only the task in hand with a closed Tapos na list; the
        play starts by talking to Maryam, not by walking in
    49  four new street paintings in order along every road, and the
        shadow tree redrawn as a bigger coconut palm
    50  four tree models, two palms and two broadleaf, flat silhouettes,
        mostly trunk and thick enough to hide the join, taking turns
        along the road
    51  the six opaque backdrops re-encoded as JPEGs, 11MB to 1.7MB
    52  Act I rewritten against the new script: the siga and Nanay on
        the street, the cedula at home, a savings quest counting barya;
        scene scripts, countCurrency, objectiveCurrency and the Bagong
        gawain toast in the engine; items.js emptied; siga stand-ins
    53  the street as every background end to end; a front-facing walk
        for Nanay (replaced by 54) and walkAnimation on decorations
    54  Nanay's walk drawn in profile; four panels, 5800px, after
        tondo.jpg was deleted; street-01.jpg as the fallback backdrop;
        clouds, birds and leaves built and left off, measured
    55  clean-out: previews, screenshots, unused pictures and the drawing
        tools deleted; ambience removed from the engine; "Claude
        outputs/" in .gitignore
    56  the Kutsero's and the Mananahi's jobs (a timing-bar mini-game,
        capped at 50 each until Nanay has the savings), Nanay's gift,
        the patahian and the direktor in the entablado; holdOpen
    57  Act I on one street ten paintings long; no house or shop, Nanay
        outside and sliding on; the black cards "Tondo, 1880" and
        "1884"; the apple-catching mini-game in place of the timing
        bar; the jobs as errands (apples and the horse, three
        customers) with fixed pay of 50 each; the direktor on the
        street, taking Macario inside; finished tasks in settings
    58  the street cleared after 1884 (hiddenByFlag); nine sound
        effects: dialogue, jump, coin, gift, new task, catch, miss,
        fade, black card
    59  every stand-in sprite deleted for placeholder boxes; no 1884:
        the direktor is the last delivery, his actor is missing, and
        Macario plays the part in a moro-moro with a fight
    60  combat with weight: swing, punch, knockout and hurt sounds,
        hit-stop, camera shake, sliding knockback, enemies topple
    61  STORY.md: the plot, places, cast and full script of Act I, as a
        third context file kept in step with the content by a check
    62  loadImage with retries and a 404 check; a loading bar on the
        title and "Sandali lang" before entering; scene changes wait
        for their art; sw.js; VT323 finally served from assets/fonts
    63  Takbo (auto-run after 450ms held), coyote time, jump buffer,
        dust puffs
    64  the notebook: ten pages of history on the street, a card per
        page, the Kuwaderno on the pause screen
    65  the apple game: squash, "+1", splat, streaks; a timed round
        with golden apples and a best score once the horse is fed
    66  measured pass: pages still out of view, bob only on arrival;
        HUD classes and the facing flip written only on change
    67  "+N" and a coin over Macario when he is paid
    68  questions in the game (content/questions.js), graded by it;
        teacher editor for questions, answers and trivia; replay after
        a failed post-test, attempts; password change; the Talaan
        (glossary words, three random hints) replacing the fact pages;
        run 6.8; schema 006 written, not run
    69  teacher dashboard in English; Talaan content removed (engine
        kept); the apple tree a silhouette tree (scenery NPC); the guide
        removed from engine, page, styles, act format and content
    70  the teacher's Talaan papers (teacher-talaan.js, talaan_entries,
        schema 007; fixed hints, Game.setHintPool, Acts.loadTalaan);
        the shadow trees' crowns lowered into the screen
    71  the punch's hit on its contact frame (melee contact: 6,
        playMelee, updateMeleeContact, meleePending)
    72  the siga drawn in code (draw-siga.js): siga-1..3.png idle and
        siga-1..3-walk.png, walkAnimation and displayHeight on their
        decorations (verify_new_scene.js to 107)
    73  the bantay: Guard.png moved to sprites/enemies/bantay.png, a walk
        and a hip-fire shot made from it (animate-bantay.js); guards'
        walkAnimation and shootAnimation, frameAt, the bullet from the
        muzzle, playIntertitle keepBlack; WIP (not plot): a "<WIP>" card
        after the opening and the bantayan room (verify_new_scene.js to
        120)
    74  the room moved out of the plot: testRoom on the act,
        Game.testRoom and enterTestRoom, exits with back: true, the Test
        Room button in settings (verify_new_scene.js to 124)
    75  guards take blows like enemies (hitGuard with damage and
        direction, slide, flash, stagger, topple and fade), shots too;
        bantay-hit.png; preview-sheet.js and lib/png.js (test.js section
        BL, to 718; verify_new_scene.js to 126)
    76  the enemy catalogue (content/enemies.js, ENEMY_TYPES, placements
        by type, withEnemyType); one blow for every body (takeBlow,
        knockOut, BODY_KINDS) (test.js section BM, to 725;
        verify_new_scene.js to 128)
    77  ART.md, the art still owed, and missing-art.js; verify_new_scene.js
        checks the one against the other (to 130)
    78  loading made strict: js/asset-manifest.js and its tool, retries
        forever for listed pictures, the whole act preloaded, no caps,
        a slow note with Subukan ulit, a note on the scene-change black
        (test.js section BD reworked; verify_new_scene.js to 132)

Everything through Block 78 is pushed to main and live on GitHub
Pages. The earlier instructions for a hand push of Blocks 42 to 58 from
the device folder are history: those blocks reached main with Blocks 62
to 67 (e7be506), and cloud sessions since push straight to main.

Schema v4 and the Act I item bank are live. Schema v5 (the in-game
reset) is NOT confirmed run; see Run log. db/scripts/reset_test_accounts.sql
should be run once after Block 25, because the item id "mansanas"
changed meaning, and is also the way to clear hi@example.com before a
demo; whether it has been run is not recorded.

## Next action

In order.

000. The Test Room button (Block 74) is in settings for every student,
study accounts included, from pause. It is outside the story and
returns to the same spot, so it harms nothing, but before the pilot
decide whether students should see it; hiding it is one line in
shell.js (_openSettings) or removing testRoom from content/act1.js.

00. Run db/migrations/007_macario_schema_v7.sql in the Supabase SQL
editor, then record it in the Run log. Without it the game still works,
but the dashboard's Talaan Papers card cannot load or save and no
papers lie on the road. Then write one paper on the dashboard, open the
game, and walk right from Nanay: paper 1 should lie on the road at
about 2500 and open a card that says what was typed.

0. Nanay's walk is settled (Block 57): she slides on with her idle
sheet, at the proponent's direction. nanay-walk.png was deleted in
Block 59 with the other stand-ins. The real fix is still the artist: ask for a side-view walk for Nanay (and for
the cast generally) as a PNG with transparency. Lesson recorded in
CLAUDE.md, Block 54: character art drawn in code does not reach the
artist's standard.

1. Write the next passage of Act I with the proponents, after the
direktor pays. Act I is held open (holdOpen) until then; when the
passage that ends the act is written, remove holdOpen and the post-test
runs as before. Write it to the standard in CLAUDE.md, Conventions,
Writing dialogue, which is the proponent's own verdict on Block 59,
and start from STORY.md, Threads left open. The proponents can review
every line in one place in STORY.md, where ours are marked +.
Also from the proponents: the lines marked PLACEHOLDER
in content/act1.js (Block 57 added several: what the Kutsero and the
Mananahi say the job is, their reminders and thanks, the horse, the
customers and their names; Block 59 added the direktor's missing actor
and the whole play, Julian and Don Rodrigo included, and four lines
between the proponents' own in Nanay's gift). The play's two kingdoms
are not named by religion and it ends in a blessing rather than the
moro-moro's traditional conversion; that was chosen for a Grade 8
classroom and is the proponents' to reverse. Check the play against
the source book: that Sakay acted on Tondo's stages is why it is there.
The "1884" card is gone (Block 59), so its spelling question is moot.

2. The assessment item bank no longer matches Act I. Since Block 64 the
ten optional pages on the street carry exactly what the item bank's ten
pairs ask, one page per pair (STORY.md, The notebook), so a student who
explores meets every tested fact; one who walks past them still meets
none. The proponents decide whether that is enough, whether the facts
move into the story, or whether the bank is rewritten. The pre-test and
post-test items (db/seeds/macario_items_v3.sql) and the trivia card were
written against the old act's facts (Tondo, the tailor-and-barber trade,
the moro-moro, 1894, the Katipunan). The new act so far teaches none of
them. Either the new passages carry those facts, or the item bank is
rewritten to match the new story before the pilot. Data collection
covers Act I only, so this decides whether the study measures anything.

3. A device pass, on the phone, in landscape, from a private tab. For
Blocks 62 to 67 first:

    Loading: on a first visit the title shows a green bar filling and
      "Inihahanda ang mga larawan... n%", and it empties to nothing when
      full. Tapping in early shows "Sandali lang..." and then the
      opening, never an empty road. A second visit opens at once (the
      service worker). Since Block 78 it never opens early: on a slow
      or dropped connection, after about 10 seconds with nothing
      arriving it says "Mabagal ang koneksyon..." with Subukan ulit,
      and goes in by itself once the art is there. Try it right after
      a push, and with the phone's data switched off and on again
      mid-load. Failure looks like any placeholder box on Macario,
      Nanay, a guard or the street, the bar stuck on a good
      connection, or the game not opening at all (the switch-off is in
      sw.js's header).
    The body font: dialogue and buttons in VT323 (pixel letters), not
      Courier. It never loaded on the live site before Block 62.
    Running: hold Kanan for half a second; he speeds up, the walk steps
      faster, dust puffs behind him. Failure looks like a jerk in speed,
      or dust that stutters the phone.
    Jumping: a jump pressed a hair after walking off something, or just
      before landing, still happens. No double jump.
    Pages: a parchment page with a glow on the road just past Nanay;
      walking into it opens "Pahina ng Kasaysayan 1 / 10", Sige closes
      it. The second is at jump height past the horse. Pause shows
      "Kuwaderno n/10"; it lists every page. Failure looks like a page
      under a tree or a person, text too small on the card, or a page
      found and back again after a reload.
    The apple game after the horse is fed: thirty seconds, a clock, a
      golden apple every fifth, "Sunod-sunod!" on three in a row, a
      splat on a miss, and a best score the next time. Too hard or too
      easy is CATCH_* in game.js.
    Being paid: "+50" and a coin rise over his head.
    The punch (Block 71), in the play's fight: tap Atake beside a
      soldier. He should stagger, and the thump and the jolt land, at
      the moment Macario's arm is fully out, not as the button is let
      go. Failure looks like the soldier reacting before the arm moves,
      or a tapped punch that never lands. If it feels slow, contact in
      the melee sheet (game.js) is the frame; 5 is a little earlier.

For Block 57:

    The opening card: black from the first frame after the title (and
      the trivia card and pre-test for a new student), "Tondo, 1880" and
      its line fading in one after the other, readable at the phone's
      size, then fading out. A tap after about two seconds skips the
      wait. Failure looks like a flash of the street before the black, or
      text too small or too long for one screen.
    The walk off: after "Tsk", Macario walks right with his walk cycle
      beside Nanay (who slides), the camera following; they stop at
      the same place, and the cedula talk plays there. Failure looks
      like Macario sliding on his idle pose or overtaking her.
    Nanay stays at that spot for the rest of the act.
    The apples: the tree is the silhouette tree over the join at 5800
      (Block 69); walking up to it, "Pumitas" opens the mini-game; the basket follows the
      Kaliwa and Kanan buttons held down and a finger dragged across
      the field; an apple is fair to catch (it shakes for 0.65s, then
      falls about 1.3s). Too hard or too easy is CATCH_FALL_SPEED and
      CATCH_BASKET_SPEED in game.js. The window fits the screen with
      its three buttons tappable.
    The horse, the Kutsero's pay, the Mananahi, the three customers,
      found without a guide along a long road (Block 69: watch whether
      students get lost, and on what), and "+50 barya" twice.
    The play (Block 59): the direktor's scene reads naturally at the
      phone's text size; inside, the stage fills the screen with no dark
      strip; both curtain cards; the Sultan walks on and off; the four
      soldiers are a fair first fight for a student who has only
      punched (four, 2 hits each, are in thePlay); the hearts show only
      during the fight. Failure looks like a soldier hidden under the
      buttons, or a fight too hard to finish.
    Combat feel (Block 60), in the play's fight: each punch swooshes,
      one that lands thumps and the picture holds for an instant with a
      small jolt; a soldier who is hit slides back rather than jumping;
      the last blow on each one topples him over backwards before he
      fades; being hit buzzes and jolts. Failure looks like the fight
      feeling sticky or stuttering (the freeze too long: IMPACTS in
      game.js, stopMs), the shake making text hard to read (shake), or
      any of it with Mga tunog off making sound.
    Sound effects (Block 58), with the phone's volume at a classroom
      level: the blip on each line should be barely there, the coin
      and the chime clear but not sharp, the fade swoosh and the black
      card's bell soft. Too loud or too quiet is one number per sound
      in _dev/tools/make-sfx.py (the last argument of its write line);
      rerun it and bump ASSET_VERSION. Failure looks like a sound that
      is clipped or harsh, or any sound with Mga tunog off.
    The direktor at the far end: talking to him fades into the
      entablado; Lumabas returns beside him.
    Mga Setting from pause: "Mga natapos na gawain" lists what is done,
      and the panel still reaches Bumalik without trouble.
    The Test Room (Block 74): pause, Mga Setting, Test Room. Then the
      bantay (Block 73), in the room after the "<WIP>" card: the card
      lifts onto black and the room fades in, with no flash of the
      street. A guard on patrol walks with his legs stepping and his
      feet on the road, the rifle carried; the sentry stands. Seen, a
      guard's "!" comes up, he stops, brings the rifle down to his hip,
      and fires with a flash at the muzzle and a puff of smoke, the
      bullet leaving from there; a jump still clears it. Facing left he
      is the same, mirrored. He is one size standing, walking and
      shooting. Failure looks like a guard sliding without stepping,
      floating or sunk into the road, the rifle jumping between poses,
      the bullet leaving from his chest instead of the muzzle, or a jump
      that no longer clears it. Lumabas at the far end returns to the
      exact spot the button was pressed.
    Blows on a bantay (Block 75), in the Test Room: punch a guard who
      has seen you and he flashes, rocks back and slides away, then
      comes on again; a second punch, or one shot, and he topples away
      from the blow and fades, the way the play's soldiers do. A guard
      taken down from behind falls forward. Failure looks like a guard
      jumping instead of sliding, still shooting while he reels, or
      falling toward the blow. Whether a walk made from the still's own parts is good
      enough is the proponent's call (Blocks 53, 54 and 72).
    The siga (Block 72): three different boys walk on from the left
      with a walk cycle, stop, and stand breathing (the leader with a
      hand on his hip and a grass stalk working in his teeth); the big
      one a head taller, the small one shorter; their feet on the road,
      nobody sliding when they stop. Failure looks like a boy floating
      or sunk into the road, sliding on stopping, or reading as a box.
      The proponent judges whether code-drawn characters are acceptable
      this time (Block 54 and 59 said no to earlier attempts).

Blocks 42 to 51 were never played on the phone either, but what they
showed (the guide, cones, the long street, the moro-moro) has left
Act I with the rewrite. What still applies from them: the four
paintings and the trees at the joins (is the join covered at head
height, does the crown read as leaves), the JPEG backdrops (banding in
the sky), and the pixel fonts, sound switches, guest mode and the
teacher dashboard, which Block 52 did not touch.

4. Real art from the artist: everything in ART.md's Owed list (the
Mananahi, the direktor and Aling Rosa are placeholder boxes on screen),
and later whoever the next passages bring on. The siga were drawn in code in Block 72; if the proponent rejects
them, deleting the six files and the SIGA sheets in content/act1.js puts
the boxes back. Macario's death sheet
(macario-dead.png) is still missing; no shipped scene plays it. Each new
sheet needs measure-sprite.js and all three numbers pasted. Ask for PNG
exports with transparency.

5. Then Block 12's remaining polish, the pilot, and Acts II to IV
against the source material.

## Where a new session picks up

Read this file's Start here and Next action, then CLAUDE.md as its own
header directs, then STORY.md before writing any story. Block 73 gave
the guard (bantay) a walk and a shot and a room of guards; Block 74 made
that room a Test Room reached from settings, outside the plot (Next
action, 000). Everything
through Block 73 is on main; cloud sessions push
straight to main (CLAUDE.md, Deployment), never to a branch. Block 71
moved the punch's hit onto the fist's contact frame; Block 72 gave the
three siga art drawn in code (draw-siga.js), which the proponent has
still to judge on the phone (Next action, 3). The first thing owed is
schema 007 in Supabase (Next action, 00), which only the proponent can
run. Act I was rewritten in Block 52, carried through
the jobs and the errand in Block 56, rebuilt onto one street in Block
57 and cleared after 1884, with sound effects, in Block 58; the
proponent has accepted that shape. Block 59 removed the stand-in art
and replaced the jump to 1884 with the direktor's missing actor and
the play. The next work is the device pass
(Next action, 3), then its next
passage after the direktor (Next action, 1), written with the proponents from
their script, and the matching question about the item bank (Next
action, 2).

The old Act I's open questions (the man in the moro-moro's on-screen
name and the word puta, Block 37's placeholder script against the source
book) left with its content. They come back only if that content does.

## The milestone

Final defense with student data collection, confirmed. Grade 8 students at
Imus National High School play the game and sit both tests. School approval
is secured.

Parental consent was waived by the guidance office and the resource person,
on the grounds that the session runs about an hour and that identifiable
results stay with the teacher while the proponents receive only aggregate
figures. Get that waiver in writing and keep it with the validation form. A
panel asking about consent wants a document, not a recollection.

Data collection covers Act I, since Acts II through IV have no content yet.
Act I quality and the assessment instrument therefore outrank Act II content
entirely.

Freeze the software roughly ten days before the defense, to leave room for
scheduling the session, running it, and analysing what comes back.

Students are identified by a code, never by name. create_accounts.js issues
mag-aaral01 through however many the session needs, with a matching coded
email, and the teacher keeps the code to name mapping on paper. The database
therefore holds nothing identifying, which is what makes the consent waiver's
premise literally true: this Supabase project is owned by the proponents, and
row level security does not restrict a project owner. Numbering must stay
stable once the accounts exist, because the code is the student's identity
for the whole study.

Content authority: the resource person has left the assessment questions and
the storyline to the proponents, and has confirmed it a second time by
declining to complete the instrument validation form and telling them to
make the game. The condition is unchanged and is the whole of what she asked
for: both stay faithful to the source material she provided, as historically
accurate as the available data allows. That makes the Act I rewrite and the
item bank writing tasks rather than approval loops, but the source is the
standard both will be judged against, and there is now no external reviewer
standing between a wrong item and the defense. That source is a physical book rather than a file, so it
cannot be put in the repository. The proponents will work through it with
the session at the time of the rewrite; do not go looking for it on disk.

## Run log

What has actually been applied to the live Supabase project, and
when. A fresh session should trust this over any memory of a chat.

    db/migrations/001_macario_schema.sql       RUN
    db/migrations/002_macario_schema_v2.sql    RUN
    db/migrations/003_macario_schema_v3.sql    RUN
    db/migrations/004_macario_schema_v4.sql    RUN, 19 Aug 2026

    db/migrations/006_macario_schema_v6.sql    RUN, 25 Sep 2026 (the
                                        proponent). Block 68: students
                                        read assessment_items whole,
                                        teachers edit items and trivia,
                                        assessment_scores gains attempt
                                        (one pre-test row still). Run
                                        after 005 or on its own; it
                                        does not depend on 005

    db/migrations/007_macario_schema_v7.sql    NOT RUN. Block 70:
                                        talaan_entries, the teacher's
                                        Talaan papers; anyone reads,
                                        teachers write. Depends on
                                        my_role() (schema 002)

    db/migrations/005_macario_schema_v5.sql            NOT RUN, per this file's own
                                        bookkeeping. A
                                        prior chat ended with a reset-
                                        related problem reported fixed
                                        ("everything worked") without
                                        confirming here whether v5 was
                                        actually the fix; a session
                                        with no database tool cannot
                                        verify the live project either
                                        way. Check the Supabase SQL
                                        editor directly for whether
                                        can_reset_my_data() exists
                                        before trusting this line. Adds
                                        the three functions behind the
                                        in-game full reset. No tables,
                                        no columns, no policy changes,
                                        so the ERD stays at eleven. Change
                                        this line to RUN and date it once
                                        confirmed

    db/seeds/macario_items_v3.sql             RUN, 28 Aug 2026

    db/scripts/db_healthcheck.sql               read-only, run any time
    db/scripts/reset_test_accounts.sql          run before any full-flow test.
                                        Rewritten in Block 25 (same seven
                                        tables, no schema change). Owed
                                        once after Block 25, because the
                                        id "mansanas" changed meaning;
                                        NOT RECORDED AS RUN since. Record
                                        the date here when it is
    db/seeds/enrollment_setup.sql             only needed for a fresh database

Supabase project reference: rkfnovfkroajottpmxxq

The database holds eleven tables, matching the revised ERD. Confirm
with db/scripts/db_healthcheck.sql, which checks all eleven, confirms the two
v4 drops happened, and verifies every migration column.

## The three stated objectives

What the panel assesses against.

Objective 1, a 2D narrative RPG across four acts. (IN PROGRESS)
The framework is complete. Act I was rewritten in Block 52 against the
proponents' new script: two scenes and two objectives so far, playable
to the savings quest, which cannot finish until the next passage is
written, so the act does not yet complete or run its post-test. Acts II
to IV are registered stubs with no content.

Objective 2, gameplay mechanics: dynamic difficulty, health,
equipment, cosmetic rewards. (IN PROGRESS) All four are built and
tested against the harness fixture. Since Block 52 the shipped Act I
exercises none of them yet: no scene is dangerous, and the item
catalogue is empty. What remains is content and art, not code.

Objective 3, integrated assessment. (COMPLETE) Pre-tests and
post-tests (graded in the game since Block 68, with a pass mark and a
replay for a failed post-test), in-game performance scoring, optional
feedback, and the teacher dashboard, which can also edit the questions,
are all built. Act I's item bank is seeded and is also built into the
game (content/questions.js).

## Functional requirements

The paper specifies seventeen. This is the scoreboard a panel will
work through.

| Requirement | Status |
|---|---|
| User Authentication | (CHANGED) Login and role routing built. Self-registration deliberately not built; accounts are administrator-created. Play-as-guest added for a quick look |
| Chapter Progression | (PARTIAL) All four acts registered and unlock in order. Act I, rewritten in Block 52, has two scenes and cannot be completed until its next passage exists; Acts II to IV are stubs |
| Player Movement | (BUILT) |
| Combat Mechanics | (BUILT) Melee punch on a tap, takedown from behind, a ranged shot on a hold, each with real animation, plus enemies that fight back (Block 35) with real walk and sword-attack art (Block 40). Act I ships the moro-moro's five guards, and the street's guards turn hostile and can be punched down (Block 38) |
| Stealth Mechanics | (BUILT) Patrols, a detection meter, a cone of sight drawn on the road (Block 42), hide spots, platforms out of sight, guards that turn hostile and shoot once they see him (Block 38). Act I's lansangan uses them (eight guards, seven platforms) |
| Interaction System | (BUILT) Dialogue, gifts, NPC reach measured edge to edge, NPCs that open the shop |
| Narrative Delivery | (PARTIAL) Built, including scene scripts that play by themselves on a login (Block 52). Act I uses them across two scenes; Acts II to IV have none |
| Dynamic Difficulty | (BUILT) Guard speed scaled by act, 1.00 to 1.45. Verified against the harness fixture |
| Health System | (BUILT) Health, damage, invulnerability, respawn, hazards, heart pickups, and healing by eating a Mansanas |
| Equipment System | (BUILT) Sandata, Anting-anting and Damit slots, a two-column inventory, stacking consumables, quest items, granting and buying, stock per seller. Act I ships one equipment item, the stage clothes (Damit, slower detection while still), which matters against the lansangan's guards |
| Cosmetic Reward | (BUILT) Currency awarded per act and scaled by performance, a shop, the Damit slot and sprite swap. No outfit ships yet; verified against the fixture catalogue |
| Trivia | (BUILT) Act I seeded; Acts II to IV not seeded |
| Act Assessment | (BUILT) Act I seeded and built in; Acts II to IV not seeded. Teacher-editable, a 75% pass mark, and a replay of the act before another post-test try (Block 68; needs schema 006 for the edits and retries to be stored) |
| Performance Scoring | (BUILT) Weighted sum, 50 completion and 25 each for survival and stealth. Time recorded but not scored |
| Progress Tracking | (BUILT) Completion, scores, damage taken, detections, elapsed time |
| Teacher Monitoring | (BUILT) Class roster and summary per class, scoped by RLS; since Block 39 searchable and sortable, with Act I status, objectives, scores, gain, performance and play time per student. Basic summaries, no charts, by decision |
| Data Synchronization | (CHANGED) Writes go straight to Supabase and the game requires a connection. There is no offline queue, so "upon internet availability" is not implemented as worded |

## Non-functional requirements

The paper specifies ten.

| Requirement | Status |
|---|---|
| Performance | (BUILT) No build step, no framework, plain script tags. Reported laggy after Block 35; Block 36 cut the loop's per-frame layout and DOM writes (none at all while standing, halved while walking and fighting) and the phone was confirmed smooth again on 18 Sep 2026. Not re-measured in frames per second since Block 13 |
| Reliability | (BUILT) Debounced save, ten second autosave backstop, beforeunload flush, logout flush |
| Usability | (BUILT) Tagalog throughout the game; the teacher dashboard in English (Block 69). No guide arrow since Block 69, by decision. Every touch target measured on screen at 44px or more. Icons beside every label. Pixel theme with a legible body face and a three-step text size setting. Portrait shows a rotate notice |
| Accessibility | (BUILT) Runs in Chrome on Android, confirmed on a real device |
| Online Functionality | (BUILT) |
| Compatibility | (PARTIAL) Confirmed on one Android phone. The harness proves the layout at 823 by 412 and 740 by 360 only |
| Maintainability | (BUILT) Layers with a strict dependency direction, documented in CLAUDE.md, and a 598-check suite |
| Data Integrity | (BUILT) Row level security, unique constraints, server-side grading |
| Connectivity | (BUILT) |
| Readability | (BUILT) Plus a text size setting the paper does not ask for |

## Blocks done

One line each. How and why: CLAUDE.md, Decisions on record, and git
history. All (COMPLETE).

Before numbering: schema v2 and v3 (RLS recursion fix, act, assessment,
inventory, equipment and session tables, currency); role routing and
class enrollment; the teacher dashboard; the four-act framework and act
state machine; the assessment module (trivia, pre and post tests,
submit_assessment).

    6   scenes, jump, one-way platforms, health, guards, hide spots,
        melee, takedown, projectile
    7   schema v3 and the shell: title gate, pause, settings, logout
    8   hazards, heart pickups, guard speed scaled by act
    9   schema v4: damage and detection counters, play time, weighted
        score, game_sessions, optional feedback
    10  inventory and equipment, granting on act entry
    11  currency awarded by score, the shop, outfits as sprite swaps
    12  polish (IN PROGRESS, see Blocks remaining): device fixes,
        --zoom 0.7, icons on every button, 44px targets on glass,
        the settings reset (needs schema v5)
    --  Act I written, then deliberately reset to Nanay only, because
        the draft ran ahead of the source material; the harness kept
        full coverage through its own fixture act and catalogue
    --  real sprites for Nanay and Macario's idle and walk; spriteFit
        with measured contentTop and contentHeight; measure-sprite.js
    13  corner buttons for inventory and shop
    14  play-as-guest
    15  Katipunan flag palette (replaced by 16)
    16  wood, green and cream palette
    17  first shooting sheet with startFrame and endFrame (sheet
        replaced by 28)
    18  Tondo.png backdrop tiled across the world; #player above NPCs
        (seam shadows replaced by 26)
    19  kutsero flashback scene with Kabayo's apple quest
    20  Kutsero, Tindero, the hazard, the first shop item; opensShop,
        gift onComplete, buyFlag
    21  fourth objective so the flashback does not finish Act I
    22  NPC reach edge to edge; Mansanas a consumable (reworked by 25)
    23  throw spawn correction (superseded by 24)
    24  body model: mountBody, bodySprite, footX; hazards hurt on
        overlap; pixel-reading suite section AM
    25  inventory overhaul: slots, stacks, Gamitin, quest items,
        two-column screens, select-then-act, guest items; horse's
        apple split into its own quest item
    26  mirrored backdrop tiles; tree-shadow posts removed
    27  melee punch sheet and aim-pose delay; Kutsero's idle sheet
    28  5 by 3 shooting sheet; muzzle field; shot from the pistol
    29  flat pixel theme; VT323 and Press Start 2P self-hosted
    30  Kabayo's sheet, pixelated scaling; music, gunshot, nearSound
        ambience, Musika and Mga tunog switches (section AO)
    31  arrivalDialogues, skipIfFlag (section AP); memory
        conversations; Mananahi on a longer tondo road
    32  stage clothes, stillDetectionMult, soldBy, opensShopAfter
        (section AQ); tailor quest; 200 barya from Nanay
    33  real Kutsero sheet; Tindero wired in; Lupa.jpg ground
    34  entablado outside and in; scene backdrop, ground: false, exits,
        gotoScene placement (section AR)
    35  jump poses and frameBottoms; scripted scenes; combat enemies;
        the moro-moro on the entablado (section AS)
    36  per-frame layout and DOM writes cut; world sized per scene;
        lazy night tiles; music elements kept (section AT)
    37  play ending, Katipunan meeting, lansangan pamphlet street
        (placeholder script); shooting guards, sight bands, platform
        cover, noRanged, checkpoints, exit requiresFlag, setQuestText
        (section AU); Act I completable
    38  hostile guards (chase, fire, hp 2); stage clothes 0.2, blue
        meter and toast (section AU)
    39  teacher dashboard restyle, search, sort, Act I columns (section
        AV)
    40  Muslim walk and attack sheets; walkOnly, faceMovement,
        attackAnimation, headroom, playing() gate; key-black.py
    41  stand-in stills and tile pictures; make-placeholder-sprites.py
    42  guide (ACT guide list, updateGuide, section AW); guard sight
        cone; lansangan 11000px, ten citizens (CITIZENS table), eight
        guards; Act I consistency pass
    43  scene panels and shadow trees (buildPanelBackdrop, section AX);
        Background paintings in tondo, kutsero and lansangan
    44  repository reorganised; custom-property url() made absolute;
        the entablado backdrop check reads the computed URL
    45  mirrorPanels; Act I's streets on Tondo.png again
    46  panelSky, panels on the floor; cone origin at eye height
    47  level cone, evenly open about the eye line
    48  linearObjectives, countFlags, dialogue sets with requiresFlag,
        Tapos na toggle, no talking mid-fight (section AY)
    49  street-01..04 on every road; coconut palm (make-shadow-tree.py)
    50  SHADOW_TREE_URLS, four models picked by join number; the trunk
        measured in pixels at chest height (section AX)
    51  backdrops as .jpg; every reference and ASSET_VERSION with them
    52  Act I rewritten; scene scripts, countCurrency, objectiveCurrency,
        Bagong gawain toast (section AZ); items.js emptied; siga
        stand-ins; verify_new_scene.js rewritten
    53  panel street; walkAnimation; make-walk-cycle.py
    54  profile walk; four panels; street-01.jpg fallback; ambience
        built and off
    55  clean-out; ambience and section BA removed
    56  playTimingGame (#job-screen), holdOpen; the jobs, Nanay's gift,
        patahian, entablado and the direktor (section BA, and
        verify_new_scene.js to 68)
    57  playIntertitle, playCatchGame (#catch-screen, replacing
        playTimingGame), movePlayer, placePlayer, NPC displayHeight,
        onInteract and interactLabel, Game.doneQuests and the settings
        list (sections AY and BA); Act I on one street;
        make-apple-tree.py; verify_new_scene.js rewritten, 87
    58  hiddenByFlag, refreshNpcVisibility; nine sound effects wired in
        game.js; make-sfx.py (section BB; verify_new_scene.js to 91)
    59  stand-in sprites and their two tools deleted; theMissingActor
        and thePlay scene scripts; entablado 1180 wide
        (verify_new_scene.js rewritten from the Mananahi on, 100)
    60  impact(), IMPACTS, hitStop, shakeCamera, drawCamera,
        updateKnockback, FIGHT_END_BEAT_MS; enemy-fall CSS;
        make-combat-sfx.js (section BC, test.js to 645)
    61  STORY.md; verify_new_scene.js checks every line and black card
        of content/act1.js appears in it (to 101)

## Blocks remaining

Block 12, polish. (IN PROGRESS) Audio is built (Block 30) and
Intense.mp3 now plays for the moro-moro's fight (Block 35); what remains
of it is whatever the device pass says about volume. Everything else in
Block 12 is a device check
now folded into Next action, item 1: label sizes on the touch buttons,
whether dialogue and quest text read comfortably at each text size,
and whether the inventory and shop fit without scrolling to Bumalik.

Acts II to IV written against the source material. (NOT STARTED)

Seed trivia and assessment items for Acts II to IV. Until then those
acts skip their tests with a notice, which is deliberate. (NOT STARTED)

Real items for Sandata and Anting-anting, and outfit art, decided
against the source material. The Damit slot has its first item
(Block 32). (IN PROGRESS)

Act I's next passage, and the item bank to match it (Next action, 1
and 2). (IN PROGRESS) The work and the errand are Blocks 56 and 57.

## Blocked on other people

These cannot be compressed at the end and do not depend on any block.
Start them before writing more code.

Get Ms. Donadillo-Espiritu's delegation in writing. One paragraph is
enough: that she reviewed the scope, delegated the assessment items
and the storyline to the proponents, and trusts them to stay faithful
to the source material she provided.

This replaces MACARIO_Act1_Instrument_Validation.docx, which she
declined to complete. That form was going to be the Appendix exhibit
and the answer to any question about instrument validity, and without
a substitute there is now no external evidence of either. A panel
asking who checked the questions would otherwise be told a story
rather than shown a document.

The same rule already applies to the consent waiver, and for the same
reason: get it in writing and keep the two together. (NOT STARTED)

Chase the real art with the artist for the Mananahi, the direktor and
Aling Rosa (placeholder boxes since Block 59; the siga were drawn in
code in Block 72), a side-view walk for Nanay (Block 54's drawn one was rejected), and
Macario's death sheet, and later for whoever the next passages of
Act I bring on. (NOT STARTED)

Provision student accounts for the session, and pilot with two or
three students who are not part of the study. A pilot run on a study
account consumes that student's one attempt permanently, so the two
sets must be separate.

When those pilot accounts exist, add their addresses to
is_reset_allowed() in the database and re-run that one statement. It
is a create or replace, so no migration is needed and nothing else in
schema v5 has to run again; record it here. That is what lets a pilot
tester wipe themselves and run the whole flow a second time without a
trip to the SQL editor. Do not add a study account. (NOT STARTED)

## Known problems

Missing production art. assets/ holds real art for Nanay, Kutsero,
Kabayo, Tindero, Maryam, the man in the moro-moro (walk and attack),
the inside of the entablado, the four street paintings, the
ground, and Macario's idle, walk, jump, melee and shooting sheets, plus
the two fonts and four sound files. Since Block 52 the shipped Act I
uses only Nanay, Macario, the street paintings and the ground; the rest
waits on disk for later passages.

What is still owed (placeholder boxes today: the Mananahi, the
direktor, Aling Rosa, Macario's death pose, the night backdrop), and
what stands in for the artist's work, is in ART.md, since Block 77. Run
node _dev/tools/missing-art.js for the list as it is on disk. (KNOWN)

Characters and the backdrop can be missing on a slow connection. Seen
by the proponent on slow internet and reproduced headless on 20 Sep 2026
at 400 kbps: the world opens straight after the title tap while its
pictures are still downloading, so for the first 30 seconds or more
Macario, Nanay and the backdrop are simply not drawn (the guide arrow
over an empty road), and a picture whose download fails outright becomes
the dashed placeholder box. A scene's own art (NPCs, guards,
decorations) is asked for again the next time that scene loads, so
walking out and back can recover it; Macario's own sheets and the
backdrop are loaded once and recover only on a page reload.
Nothing waits for the art before play starts, and the scene's first
images compete with calm.mp3 streaming beside them (2MB). Block 51 cut
what a scene has to download by about six times (the six opaque
backdrops are JPEGs now: 300KB a street, 1.2MB for the lansangan,
against 1.9MB and 7.8MB), which shortens the window without closing it.
The largest remaining files are the two music tracks, about 2MB each.
The chosen fix is built (Block 62): a loading bar on the title screen,
a wait on "Sandali lang..." for a student who taps in early, retries for
a dropped download, scene changes that hold the black until the next
scene's art is in, and a service worker that keeps every file on the
phone after the first visit (which also answers the stale index.html
problem below and lets the game open with no connection; logging in and
saves still need one). Offline play that syncs saves later was
discussed and deferred. Not yet tried on the phone or on a throttled
connection outside the harness. (FIX BUILT, NOT SEEN ON DEVICE)
Block 78 closed the ways past it that remained (a 20-second cap on
entry, one 404 during a deploy making a picture a box for the visit,
retries that gave up, and art fetched only when a scene or a fight
first needed it): see CLAUDE.md, Decisions on record, Block 78. A
tester got in with sprites missing before it; not yet seen on the phone
since.

Browsers cache index.html. It carries no version number of its own, so
a phone that loaded an old copy keeps requesting the old ?v=N files
even after a correct push. Since Block 62 the service worker asks the
network for index.html first on every visit, which should end this once
a phone has been served the Block 62 page; a phone still holding an
older copy needs the private tab or cleared site data one last time. On 17 Sep 2026 a report that "none of the
changes applied" was exactly this: GitHub and the live site were both
serving the new files. Test from a private tab, or clear the site's data
in Chrome, before suspecting the code. Keep every changed file's ?v=N
bumped in the same push. (KNOWN, BY DESIGN OF PAGES)

The teacher dashboard is deliberately not in the game's pixel theme:
Block 39 made it a light report page for teachers reading numbers on a
laptop or projector, sharing only the game's wood and green as accents.
(BY DESIGN)

Only one phone has been tested, a 4GB Android device. Block 36's speed
work was confirmed on it; everything else added since Block 13, including
Block 35's fight, is still unseen there. The harness covers 823 by 412
and 740 by 360 in landscape, which is a floor rather than a survey.
(PARTIAL)

On a PC the animation looks slightly uneven, which the proponent has
ruled out of scope: students play on phones, where it is smooth. The
likely cause, if it is ever worth chasing, is that sprite frames are
stepped against a clock tuned for a 60Hz screen while a desktop monitor
often refreshes faster. Nothing was changed for it, on purpose.
(KNOWN, OUT OF SCOPE)

Dynamic difficulty cannot be demonstrated in the running game, because
Act I is the 1.00 multiplier. It scales the lansangan's guards and the
moro-moro's enemies, but at 1.00 that is not something a panel can see.
The formula is documented and the harness proves it against a
fabricated act. The honest answer to a panel is that the lever is built
and the acts it scales are not written yet. (BY DESIGN)

## Deferred

Student-facing join screen. join_code exists but class assignment is
administrator-assigned.
Multiple save slots.
Dashboard export and per-question item analysis.
Offline and save-conflict handling.
Persisting partial test answers. A student who reloads mid-test
restarts that test from question one. Nothing is recorded until
submission, so no answers are lost, but the questions are asked
again.

## Verification

The harness lives at _dev/. Run it from the repository root:

    npm install
    node _dev/tests/test.js
    node _dev/tests/verify_new_scene.js

test.js: 729 checks (Block 78 reworked section BD: the whole act asked for up front, owed art never asked for, a 404 during a deploy waited out with the slow note and Subukan ulit; Block 76 added section BM: the enemy catalogue's merge and a new type hit with no code of its own; Block 75 added section BL: guards sliding, flashing, reeling, falling to a shot and to a takedown; Block 71 added four to section AI: the punch lands on its contact frame, once, and not when cut off; section BK is Block 70: fixed papers against the fixture, Acts.loadTalaan and the dashboard's Talaan Papers editor; section BJ is Block 69: the Talaan engine and a scenery NPC; AW now checks the guide is gone; sections BH and BI are Block 68: the built-in
questions graded by the game, the teacher's questions first, the pass
mark, the replay and the second attempt, a reload on a failed result,
the password, and the teacher's editor); before Block 68, 676 checks against a fixture act and item catalogue (so
mechanics stay tested whatever Act I ships); sections BD to BG are
Blocks 62 to 67 (the loader, the loading screens, a scene change held
for its art, and the service worker offline; the run, coyote time, the
jump buffer and dust; the timed apple round; the reward pop).
verify_new_scene.js: 132 checks (Block 78: the manifest matches assets/, and every picture in it opens; Block 77: ART.md's Owed list matches the pictures missing on disk, both ways; Block 76: the room's guards and the play's soldiers come from the catalogue; Block 75: the bantay reeling in his hit sheet and falling the way the shot went; Block 74: the opening ends on the street with no card, the Test Room offered from pause and not inside the room, the door back to the same spot with the story's flags unchanged; Block 73: the "<WIP>" card, no street between it and the room, the bantay's three sheets, a patrol walking, the sentry levelling before he fires, the flash on the shot, the bullet from the muzzle, the door back; Block 72: the siga load their own idle and walk sheets and stand at three heights; Block 70: Act I's three paper places, papers laid, found, saved and kept across a reload, for a guest too, and none behind a trunk; since Block 69 without the guide); since Block 68 it sits the real
trivia card and pre-test, and its Talaan section (replacing Block 64's
notebook) checks the hints, the seed across a reload, a word earned and
the pause panel. 101 of them: one that every line of dialogue and black card in
content/act1.js is in STORY.md (Block 61), then 100 driving the REAL content/act1.js and content/items.js through
Act I as of Block 59: the ten-painting street, the "Tondo, 1880" card,
the opening with the walk off beside Nanay, the talk and the thought,
both jobs (apples caught with real key presses, a miss, a stop and a
resume, the horse, two customers and the direktor last), the
direktor's missing actor, the play (backstage, both curtain cards, the
fight, the pay), the Mananahi's pay, Nanay's gift with no jump in time,
the act held open, the settings list, reloads mid-beat and mid-play,
saves from Blocks 52, 56 and 57, and a guest.
Both ran green on 24 Sep 2026 against the Block 67 files, in a cloud
sandbox with npm install --no-save playwright@1.56.0 (its preinstalled
Chromium). Before that, green against the Block 60 files, on the
proponent's computer. Before that, on 23 Sep 2026 against Block 58 (in a
sandbox whose preinstalled Chromium matched Playwright 1.56, installed
there with npm install --no-save playwright@1.56.1; package.json still
asks for 1.62, which is right for the proponent's computer). Anything other than "0 failed"
is a regression. In a session with no shell on the device, stage the
repository into the sandbox and run the same commands there; Playwright
may need its browser path pointed at the preinstalled Chromium. Audio
is checked by counting what the engine asks the browser to play
(section AO), which headless Chromium allows after the harness's first
click; it cannot tell whether a sound is too loud.

It drives the shipping index.html with a stubbed Supabase client and
Playwright against Chromium at 823 by 412, phone LANDSCAPE, so it
cannot pass against a page students no longer load. It never touches
the live project. Do not move it back to portrait.

A check that clicks, or reads pixels, is worth more than one that reads
a style: the dead Atake button would have passed any style assertion,
and Blocks 22 and 23's throw checks passed on numbers while the screen
was wrong. Sections AJ and AM compare screenshots for that reason.

Add checks in the same block that adds the system. A suite that lags
the build is worse than none.

Three checks protect the study rather than the code: that complete runs
before the feedback form opens, that an act still completes when the
feedback module is absent, and that it still completes when the
inventory module is absent (section U blocks inventory.js at the network
layer to prove it).

It is not a substitute for a device pass.

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

## Documentation debt

Raised at the defense, tracked separately from code.

Justify vanilla JavaScript and Supabase over Unity and C#, argued
from the study's own literature review: a comparable project was
constrained by 3D performance on low-end devices, and a lightweight
browser application addresses that gap directly. Frame as responding
to an identified limitation rather than as reduced scope.
(NOT STARTED)

Revise the ERD to eleven entities. The paper says fifteen and then
describes seventeen, so it needs correcting regardless. PlayerAction
and the achievement entities are dropped, GameScore folds into
ActProgress, and all three have a stated reason. The database now
matches. (NOT STARTED)

Document how the assessment items were validated, given that no
external validation form exists. The resource person declined to
complete one and delegated the items to the proponents, so the
Appendix carries the method instead: items written from the source
material she provided, matched pre and post pairs on the same topic
and difficulty with the key in a different position, and the trivia
card checked so it cannot hand students a pre-test answer. Her
written delegation, once obtained, sits alongside it. This is the
answer to a panel asking who checked the questions, and it needs
writing before anyone asks. (NOT STARTED)

Document server-side grading. The answer key never reaches the
client, which is a design strength worth stating. (NOT STARTED)

Document the dashboard query approach and its RLS enforcement, since
a panel may ask how one teacher is prevented from reading another
class's data. (NOT STARTED)

Document that game_progress.currency is client written and why that
is acceptable. (NOT STARTED)

Document the performance score formula and its weights, including
why time is recorded but not scored. The formula is in CLAUDE.md.
(NOT STARTED)

Revise Technical Background. Aseprite, Audacity and Figma remain
accurate. Unity and C# should be removed. Visual Studio should be
corrected to Visual Studio Code. GitHub Pages and Supabase should be
added, since neither appears despite both being central.
(NOT STARTED)

Credit any licensed art assets used for enemies, outfits, or combat
animations. (NOT STARTED)
