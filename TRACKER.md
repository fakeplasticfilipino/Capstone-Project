# TRACKER.md

The single source of truth for status. A session starting work on this
project reads CLAUDE.md for how things are built, then this file for
where they are. Start with "Start here"; it is written so a new session
can act without reading anything else first.

Two files carry context, and they do not overlap:

    CLAUDE.md     how the thing is built. Architecture, conventions,
                  data formats, decisions on record. Changes rarely.
    TRACKER.md    where the build is. Status, next action, what has
                  been run, what is blocked. Changes every session.

Nothing else in this repository describes status. README.md is the
public face on GitHub and is written for a reader who is not working
on the code.

This file records present state, not history. When something is
finished, compress it to a line. Detail about how and why lives in
CLAUDE.md, Decisions on record, and in git history.

Status markers: (COMPLETE), (IN PROGRESS), (NOT STARTED), (BLOCKED).

Last updated: 23 Sep 2026, after Block 58 (the street cleared after the
"1884" card, leaving Nanay, the Mananahi and the direktor, the shadow
trees kept; and nine small sound effects), which followed Block 57 (Act
I on one street, ten paintings long: no house and no tailor's shop,
Nanay outside for good and sliding on, "Tondo, 1880" and "1884" as
black cards, an apple-catching mini-game in place of the timing bar,
the jobs as errands with fixed pay, the direktor on the street taking
Macario into the entablado, and the finished tasks in settings). The
proponent was happy with Block 57. Blocks through 41 are pushed
(088f5e4); Blocks 42 to 58 are in the device folder and NOT yet pushed.
Push everything as one commit (see Right now). test.js 634 passed, 0
failed; verify_new_scene.js 91 passed, 0 failed. None of Blocks 42 to
58 has been played on the phone.

Blocks 52 to 57 are an experimental window: the new Act I is being tried
out passage by passage, and some of it will not stay. Block 57 changes
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
      6  Ihatid ang mga damit sa mga suki (n/3)  three customers' gifts
      7  Kunin ang bayad sa Mananahi             her gift button, 50 barya
      8  Ibigay kay Nanay ang naipon (n/100)     Nanay's gift
      9  Dalhin ang damit sa direktor sa         the direktor's gift,
         entablado                               inside the entablado

    tondo     the street, Macario at 900. The opening plays by itself on
              a login (a scene script): black, "Tondo, 1880 / Kung saan
              nagsimula ang buhay ni Macario" fading in and out
              (playIntertitle); three siga (stand-in stills) walk up
              behind him and taunt him; Nanay slides in from the right
              on her idle sheet and calls him home; "Tsk"; the two of
              them walk off together to x 2000 (movePlayer); there,
              outside, she tells him about the cedula and he says he
              will work; his thought; "Bagong gawain". Nanay stays at
              x 2000 as an NPC for the rest of the act.
              The Kutsero (x 3300) sends him to the apple tree (x 4900,
              "Pumitas"): the catch mini-game (playCatchGame), three
              apples, then the white horse (x 3560, "Ipakain ang
              mansanas"), then the Kutsero's "Kunin ang bayad", 50.
              The Mananahi (x 6400, only after the Kutsero has paid)
              sends him with three finished clothes to Aling Rosa
              (7800), Mang Tomas (9300) and Ginoong Reyes (10800),
              "Iabot ang damit" each, then pays 50. Nanay's "Ibigay ang
              ipon" spends the 100; black, "1884 / Nagtrabaho si Macario
              bilang isang tagatulong ng kutsero at manananahi"; the
              black lifts on Macario beside the Mananahi, who gives him
              the costume for the direktor. Under that black the street
              is cleared (Block 58): the Kutsero, the horse, the apple
              tree and the customers are gone for good, and only Nanay,
              the Mananahi and the direktor remain (the shadow trees
              stay). The direktor (x 13600, the
              far end) takes him inside:
    entablado on entablado-inside.jpg. The direktor takes the costume,
              "Iabot ang damit", two placeholder lines, and pays 79 to
              110 barya. Lumabas returns to the street beside him. Act I
              stays open (holdOpen).

A reload in the middle of the opening or of 1884 plays it again from the
top; a reload after the talk with Nanay plays only the thought. Saves
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
guards with cones, platforms, hazards, heart pickups, checkpoints, the
guide, and the art for Kabayo, the Kutsero, the Tindero, Maryam, the
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

    css/style.css v42    js/game.js v64       js/shell.js v14
    js/inventory.js v9   js/acts.js v12       js/assessment.js v3
    content/act1.js v44  content/items.js v11  content/act2-4.js v1
    ASSET_VERSION 22 (in js/game.js)
    css/teacher.css v2   js/teacher.js v2     (named in teacher.html)

The proponent has played Blocks 37 and 38 and reported them functional,
and confirmed Block 36's speed fix on the phone. Whether the rest of
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

Everything through Block 41 is pushed (088f5e4). Blocks 42 to 58 are in
the device folder and waiting to be pushed. Block 44 moved nearly every
file, so the push is a commit of deletions and additions that git shows
as renames: stage everything (git add -A) rather than picking files, or
the site will load a page whose scripts and pictures are not there. The
old Assets/ folder, the root scripts and stylesheets, the old db/ and
_dev/ files, "Claude outputs", the proposal and the validation form
should all show as deleted or moved; if any still show as present in
git status, they were not deleted on the computer. Block 51 does the
same on a smaller scale: street-01..04.png, tondo.png and
entablado-inside.png are replaced by .jpg files of the same name, so
those six PNGs must be deleted on the computer before the push or the
repository carries 11MB nothing loads. Blocks 52 to 55 add
assets/sprites/characters/siga-1..3.png and nanay-walk.png. The
proponent deleted, on the computer, tondo.jpg, entablado-inside.png,
entablado-outside.png, the ambience pictures, the drawing tools,
"Claude outputs" and docs-private/screenshots; git add -A records the
deletions. Do not delete horse.mp3 or intense.mp3: the harness uses
both. Block 57 adds assets/sprites/scenery/puno-mansanas.png and
_dev/tools/make-apple-tree.py; Block 58 adds nine
assets/audio/sfx/*.wav files and _dev/tools/make-sfx.py.

Schema v4 and the Act I item bank are live. Schema v5 (the in-game
reset) is NOT confirmed run; see Run log. db/scripts/reset_test_accounts.sql
should be run once after Block 25, because the item id "mansanas"
changed meaning, and is also the way to clear hi@example.com before a
demo; whether it has been run is not recorded.

## Next action

In order.

0. Nanay's walk is settled (Block 57): she slides on with her idle
sheet, at the proponent's direction. assets/sprites/characters/nanay-walk.png
is named by nothing now and can be deleted on the computer. The real
fix is still the artist: ask for a side-view walk for Nanay (and for
the cast generally) as a PNG with transparency. Lesson recorded in
CLAUDE.md, Block 54: character art drawn in code does not reach the
artist's standard.

1. Write the next passage of Act I with the proponents, after the
direktor pays. Act I is held open (holdOpen) until then; when the
passage that ends the act is written, remove holdOpen and the post-test
runs as before. Also from the proponents: the lines marked PLACEHOLDER
in content/act1.js (Block 57 added several: what the Kutsero and the
Mananahi say the job is, their reminders and thanks, the horse, the
three customers and their names, the direktor on the street), and
whether a direktor sprite (the mamamayan still stands in), an apple tree
from the artist (drawn in code for now) and customers of their own
(Maryam's, the Tindero's and the Katipunero's art stand in) are coming.
The intertitle "1884" line is as given, with "manananahi" spelled that
way; confirm the spelling.

2. The assessment item bank no longer matches Act I. The pre-test and
post-test items (db/seeds/macario_items_v3.sql) and the trivia card were
written against the old act's facts (Tondo, the tailor-and-barber trade,
the moro-moro, 1894, the Katipunan). The new act so far teaches none of
them. Either the new passages carry those facts, or the item bank is
rewritten to match the new story before the pilot. Data collection
covers Act I only, so this decides whether the study measures anything.

3. A device pass, on the phone, in landscape, from a private tab. For
Block 57:

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
    The apples: the tree reads as a tree at its size (drawn in code, a
      stand-in); "Pumitas" opens the mini-game; the basket follows the
      Kaliwa and Kanan buttons held down and a finger dragged across
      the field; an apple is fair to catch (it shakes for 0.65s, then
      falls about 1.3s). Too hard or too easy is CATCH_FALL_SPEED and
      CATCH_BASKET_SPEED in game.js. The window fits the screen with
      its three buttons tappable.
    The horse, the Kutsero's pay, the Mananahi, the three customers, the
      guide leading to each in turn along a long road (the longest walk
      is about 45 seconds end to end), and "+50 barya" twice.
    1884: after Nanay's gift, the black card, and the black lifting on
      Macario beside the Mananahi. Nothing is seen to move. Walking the
      street after it, only Nanay, the Mananahi and the direktor are
      there (Block 58).
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
    The siga: the stand-ins stand at Macario's height on the road and
      read as three different boys.

Blocks 42 to 51 were never played on the phone either, but what they
showed (the guide, cones, the long street, the moro-moro) has left
Act I with the rewrite. What still applies from them: the four
paintings and the trees at the joins (is the join covered at head
height, does the crown read as leaves), the JPEG backdrops (banding in
the sky), and the pixel fonts, sound switches, guest mode and the
teacher dashboard, which Block 52 did not touch.

4. Real art for the siga (siga-1..3.png, stand-ins), and later for
whoever the next passages bring on. Macario's death sheet
(macario-dead.png) is still missing; no shipped scene plays it. Each new
sheet needs measure-sprite.js and all three numbers pasted. Ask for PNG
exports with transparency.

5. Then Block 12's remaining polish, the pilot, and Acts II to IV
against the source material.

## Where a new session picks up

Read this file's Start here and Next action, then CLAUDE.md as its own
header directs. Everything through Block 41 is pushed; Blocks 42 to 57
are in the device folder, passing their checks, and wait on the
proponent's push. Act I was rewritten in Block 52, carried through
the jobs and the errand in Block 56 and rebuilt onto one street in
Block 57, so the next work is its next
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
post-tests, server-side grading, in-game performance scoring,
optional feedback, and the teacher dashboard are all built. Act I's
item bank is seeded.

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
| Act Assessment | (BUILT) Act I seeded; Acts II to IV not seeded |
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
| Usability | (BUILT) Tagalog throughout. A guide arrow to the next goal (Block 42). Every touch target measured on screen at 44px or more. Icons beside every label. Pixel theme with a legible body face and a three-step text size setting. Portrait shows a rotate notice |
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

Chase the real art with the artist for the siga (Block 52 stand-ins),
a side-view walk for Nanay (Block 54's drawn one was rejected), and
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

Stand-ins, not the artist's, owed real art. In use (Block 52, made by
_dev/tools/make-placeholder-sprites.py):

    sprites/characters/siga-1..3.png   the three siga on the street

On disk and in no scene since Block 52 (Block 41): mananahi.png,
bonifacio.png, katipunero.png, mamamayan.png, enemies/bantay.png, and
the two item tiles.

All under assets/.

Still missing outright, falling back to the dashed placeholder box:

    sprites/player/macario-dead.png    Macario's death pose; no shipped
                                       scene plays it
    backgrounds/act1/tondo-night.png   night backdrop; no shipped scene
                                       switches to night, so nothing shows

verify_new_scene.js checks that every Act I character draws a picture
rather than a box. (KNOWN)

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
Chosen fix, not yet built: a loading bar on the title screen that fetches
the current scene's art first and retries failed files, scene changes
that wait behind the blackout until the next scene's art is in, and a
service worker that keeps every file on the phone after the first visit
(which also answers the stale index.html problem below and lets the
game open with no connection; saves would still need one). Offline play
that syncs saves later was discussed and deferred. (KNOWN, FIX CHOSEN)

Browsers cache index.html. It carries no version number of its own, so
a phone that loaded an old copy keeps requesting the old ?v=N files
even after a correct push. On 17 Sep 2026 a report that "none of the
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

test.js: 634 checks against a fixture act and item catalogue (so
mechanics stay tested whatever Act I ships). verify_new_scene.js: 91
checks driving the REAL content/act1.js and content/items.js through
Act I as of Block 57: the ten-painting street, the "Tondo, 1880" card,
the opening with the walk off beside Nanay, the talk and the thought,
both jobs (apples caught with real key presses, a miss, a stop and a
resume, the horse, three customers, the fixed pay), Nanay's gift, the
"1884" card and the errand beside the Mananahi, the direktor taking him
inside and paying with the act held open, the street cleared after
1884 (Block 58), the settings list, reloads
mid-beat, saves from Blocks 52 and 56, and a guest.
Both last ran green on 23 Sep 2026 against the Block 58 files (in a
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
