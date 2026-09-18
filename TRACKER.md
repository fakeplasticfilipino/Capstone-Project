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

Last updated: 18 Sep 2026, after Block 39 (the teacher dashboard
restyled), and audited the same day against the code and the device
folder's git history. Blocks 30 to 38 are pushed: the device's reflog
shows origin/main at a054ba0 ("fixed npc ai", Block 38), after 23ef262
("completed act 1 scene", Block 37) and 61c354b ("updated trackers").
Block 39 is written to the device folder and not yet pushed. The suite
was run against the device folder's files: 554 passed, 0 failed;
_dev/verify_new_scene.js 138 passed, 0 failed. The proponent played
Blocks 37 and 38 and reported everything functional.

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

Act I is four scenes and is the only act with content. Acts II to IV are
registered stubs. Act I can be completed: the third pamphlet finishes it
and runs the post-test. Everything from the end of the fight on (Block
37) is a placeholder script, written ahead of the source book and owed a
check against it (see Next action).

    tondo     Nanay (real art) hands Macario his money (200 barya) and
              brings up the kutsero, and the memory cuts him off.
              Talking to her completes objectives 1 and 2 and fades
              into:
    kutsero   a greyed-out flashback. Kabayo the horse (real art,
              neighing while Macario is near) asks for an apple;
              Kutsero (real art) gives 10 barya; a glass hazard sits on
              the road; Tindero (real art, opensShop) sells Mansanas
              (food, heals one heart) and "Mansanas para sa kabayo"
              (quest item).
              The memory opens with Nanay's voice after the fade-in.
              Giving Kabayo the quest apple completes objective 3 and
              fades back to tondo with a fourth quest, "Pumunta sa
              entablado", that nothing can complete yet.
    tondo     (after) Macario stands beside Nanay and an eight-line
              exchange plays by itself, ending with a quest, "Kausapin
              ang mananahi" (objective 4). Further down the road, which
              is 2900px, the Mananahi (placeholder box) talks about his
              stage costume, which completes it, and her shop opens:
              Damit para sa Entablado, 100 barya, worn in Damit, makes
              a guard notice him five times slower while he stands
              still (the lansangan's guards are what it is for). At the end of the
              road, now 2900px, stands the entablado (real art); Pasok
              at its stairs goes in.
    entablado the inside of the stage (Entablado.png as the whole
              backdrop, no dirt strip). Walking in plays the moro-moro by
              itself: Maryam's six lines, a man walking on from the right
              (placeholder), three more lines, then five guards
              (placeholders) to fight, with Intense.mp3 under it. Winning
              sets nagapiAngMgaGuwardiya; until then every entry replays
              the scene. Then Maryam announces the Christian kingdom won,
              that she will convert and marry Macario, and the audience
              cheers (dialogue only), which completes pumunta_entablado
              (objective 5). Lumabas at the left edge goes back out to the
              stairs, and is closed during the fight. The guards share
              the man's placeholder, Muslim.png.
    tondo     (after the play) Bonifacio and a Katipunero (placeholders)
              wait at the stairs; a twelve-line meeting opens by itself:
              greeting, the password, and the task, "Ipamahagi ang mga
              polyeto (0/3)" (objective 6 done). Tumuloy at the end of the
              road opens only now.
    lansangan a 7200px street on the Tondo backdrop, in colour. No gun
              (a hold punches). Four guards (Bantay.png placeholders),
              their sight drawn on the road; once one's meter fills he
              turns hostile (a red "!"), chases and shoots until punched
              down twice or Macario runs out of hearts. In the stage
              clothes, standing still fills a meter five times slower,
              drawn pale blue;
              three platforms of different heights that are out of sight;
              a heart on the high one. Three citizens (Mamamayan.png
              placeholders) each take a pamphlet through Iabot ang
              polyeto. Running out of hearts restarts at the last one
              reached. The third pamphlet completes objective 7 and Act I.
              Bumalik at the left edge returns to tondo.

content/items.js ships three items: the two apples and the stage
clothes (Damit). No Sandata or Anting-anting item exists yet. The
harness fixture carries equipment, outfits, a consumable and a quest
item, so those paths stay tested.

Macario's art: idle, walk, jump, melee punch (tap Atake) and shooting
(hold Atake) are real sheets, measured with _dev/measure-sprite.js. His
death pose is missing.

The interface is a flat pixel-art theme (Block 29): square panels, hard
outlines, Press Start 2P for titles and VT323 for everything read, both
self-hosted in Assets/Fonts.

Sound: Calm.mp3 loops as background music from the moment the world is
entered, Gun_Shot.mp3 plays on every shot, Horse.mp3 loops near Kabayo,
and Intense.mp3 plays for the fight on the entablado and stops when it is
won. Settings has Musika and Mga tunog switches, both on by default.

Current versions, which index.html must match on every push:

    style.css v29        game.js v45          shell.js v13
    inventory.js v9      acts.js v10          assessment.js v3
    content/act1.js v27  content/items.js v8  content/act2-4.js v1
    ASSET_VERSION 14 (in game.js)

The proponent has played Blocks 37 and 38 and reported them functional,
and confirmed Block 36's speed fix on the phone. Whether the rest of
Blocks 14 to 38 has been through a full pass on the phone is not
recorded, so the device checklist under Next action still stands before
the pilot.

The teacher dashboard (teacher.html) was restyled in Block 39: a light
report page, six summary figures each with its n, and a roster that can
be searched and sorted, with Act I's status, objectives and play time.
Its versions are teacher.css v2 and teacher.js v2, named in
teacher.html, which index.html does not load.

## Right now

Blocks 1 to 39 are built. Blocks 22 to 39 were one build session, 17 to
18 September 2026, each on direct feedback from the proponent:

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

Blocks 30 to 38 are pushed (a054ba0). Push Block 39 as one commit:
teacher.html, teacher.css, teacher.js, _dev/sb-stub.js, _dev/test.js,
CLAUDE.md and TRACKER.md. teacher.html names teacher.css?v=2 and
teacher.js?v=2, so the three go together. Assets/Act 1/Muslim_Woman.png
is a byte-for-byte copy of Muslim_Girl.png and nothing loads it.

Schema v4 and the Act I item bank are live. Schema v5 (the in-game
reset) is NOT confirmed run; see Run log. db/reset_test_accounts.sql
should be run once after Block 25, because the item id "mansanas"
changed meaning, and is also the way to clear hi@example.com before a
demo; whether it has been run is not recorded.

## Next action

In order.

1. Push Block 39 (see Right now), then a device pass on Blocks 14 to
38, on the phone, in landscape, from a private tab (browsers cache
index.html; see Known problems). Check:

    Title, pause, settings: pixel fonts show (not plain monospace,
      which would mean Assets/Fonts did not upload), text readable at
      Maliit, Katamtaman and Malaki.
    Guest mode: the button enters Act I with no login.
    tondo: Nanay's dialogue reads comfortably; the prompt arrow blinks.
    kutsero: Kutsero stands on the road; no dark post or visible jump
      where the backdrop repeats; the glass takes a heart only while
      his feet are on it, from either side.
    Atake: a tap punches with no flash of the aiming pose; a hold aims,
      and release fires with the flash and a shot from the pistol, in
      both facings.
    Tindahan (from Tindero and the corner button): fits the screen with
      Bumalik visible; tiles are easy to tap; both apples listed.
    Imbentaryo: eating a Mansanas after the glass restores a heart; the
      quest apple cannot be eaten; Kabayo takes it.
    Sound: music starts after the title tap (not before) and keeps going
      in pause and the shop; a shot bangs with the flash, with no
      noticeable delay; Kabayo neighs as Macario reaches him and fades
      out walking on; Musika and Mga tunog Patay silence each; locking
      the phone silences the game; the music is not too loud against
      the gunshot.
    The memory and the return: the memory's line waits for the fade-in;
      coming back, Macario is already beside Nanay when the screen
      clears, not seen jumping there; talking to her again gives
      "Mag-ingat ka lagi, anak."; the Mananahi is absent before the
      memory and on the road after it; the dialogue box does not hide
      whoever is speaking.
    The tailor: the barya chip shows 200 more after Nanay; the quest
      appears after the return and ticks when the Mananahi finishes
      talking; her shop opens by itself and lists only the clothes;
      buying leaves 100 less; Isuot puts them in Damit; the corner
      shop button does not sell them.
    The entablado: the building stands on the road at a sensible size
      beside Macario; Pasok appears at its stairs; inside, the painting
      fills the screen with its floor under his feet and no dirt strip;
      Lumabas at the left edge is findable and returns to the stairs.
    The moro-moro: the jump pose reads as a jump and his feet land on the
      ground; the scene opens by itself and each line is readable; the man
      walking on is visible before he speaks; the fight is winnable with
      the touch buttons, the warning before a swing is noticeable, and
      five enemies at once do not drop the frame rate. Judge the pacing
      numbers here (see CLAUDE.md, Block 35) against a real student.
    Kabayo: crisp pixels rather than a blur, standing on the road,
      roughly Macario's height. If he reads too small for a horse,
      that is one number (an NPC display height) to add.
    After the play (Block 37): Maryam's ending plays straight after the
      fight; out the door, Bonifacio's meeting opens by itself; Tumuloy
      appears at the road's end only after it.
    The street: the yellow sight band on the road is noticeable and
      reads as which way a guard faces; a guard's bullet is visible in
      time to jump; the high ledge (with the heart) is reachable but
      takes a try or two; standing on any platform is safe; with the
      stage clothes on, freezing as the second guard walks toward you
      lets him pass, with his meter pale blue and crawling; a guard who
      does see him turns red with a "!", runs after him and keeps
      shooting, never goes back to patrolling, and drops after two
      punches; running away outpaces him; a hold on Atake punches and says there is no gun;
      the road feels long without dragging; running out of hearts
      restarts at the last citizen. The third pamphlet runs the
      post-test.
    Teacher dashboard (Block 39), as guro@example.com on a laptop and a
      projector: the class name, six figures and the roster load; the
      search box and each column's sort work; a student who has not
      played reads Hindi pa nagsisimula with dashes.

2. Check Block 37's placeholder script against the resource person's
source book (Content authority, under The milestone), line by line:
Maryam's ending, the meeting at the stairs (above all the password, Anak
ng Bayan and the dilim and liwanag lines, and whether Bonifacio himself
met Sakay after a performance), who the second Katipunero is, what the
pamphlets were and who received them. content/act1.js marks the block.
Act I is now completable, so this is also what stands between the build
and a pilot.

3. Remaining art, chased with the artist: Muslim.png (Assets/Act 1/, the
man in the moro-moro, whose sprite his five guards share; there is no
Guwardiya.png), Mananahi.png, Bonifacio.png, Katipunero.png, Bantay.png
(the street's guards), Mamamayan.png (the three citizens, one sprite
shared unless the artist draws three) (all Assets/Act 1/),
Damit_Entablado.png (Assets/Act 1/, the clothes' tile picture; outfit
sheets later if he should look different wearing them),
Macario's Dead sheet, and
Mansanas.png (item icon; the apple symbol stands in). Each new sheet
needs measure-sprite.js and all three numbers pasted.

4. Then Block 12's remaining polish, the pilot, and Acts II to IV
against the source material.

## Where a new session picks up

Read this file's Start here and Next action, then CLAUDE.md as its own
header directs. Everything through Block 38 is pushed and Block 39 is
written to the device folder, all passing their checks; the proponent
handles the push. So the first things a session can do are in Next
action, in order: a device pass against the checklist there, then
checking Block 37's placeholder script against the source book with the
proponents.

Two questions are waiting on the proponents rather than on code, and a
session should ask rather than assume: whether the man in the moro-moro
keeps the on-screen name Muslim, and whether his last line keeps the word
puta. And Block 37's placeholder script waits on the source book (Next
action, 2). See Known problems and Blocked on other people.

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

    db/applied/macario_schema.sql       RUN
    db/applied/macario_schema_v2.sql    RUN
    db/applied/macario_schema_v3.sql    RUN
    db/applied/macario_schema_v4.sql    RUN, 19 Aug 2026

    db/macario_schema_v5.sql            NOT RUN, per this file's own
                                        bookkeeping (not present in
                                        db/applied/ on this device). A
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
                                        so the ERD stays at eleven. Move
                                        it to db/applied/ once confirmed
                                        run and date this line

    db/macario_items_v3.sql             RUN, 28 Aug 2026

    db/db_healthcheck.sql               read-only, run any time
    db/reset_test_accounts.sql          run before any full-flow test.
                                        Rewritten in Block 25 (same seven
                                        tables, no schema change). Owed
                                        once after Block 25, because the
                                        id "mansanas" changed meaning;
                                        NOT RECORDED AS RUN since. Record
                                        the date here when it is
    db/enrollment_setup.sql             only needed for a fresh database

Supabase project reference: rkfnovfkroajottpmxxq

The database holds eleven tables, matching the revised ERD. Confirm
with db/db_healthcheck.sql, which checks all eleven, confirms the two
v4 drops happened, and verifies every migration column.

## The three stated objectives

What the panel assesses against.

Objective 1, a 2D narrative RPG across four acts. (IN PROGRESS)
The framework is complete. Act I has four scenes, ten NPCs and seven
objectives, all playable end to end, so the act completes and runs its
post-test; its last stretch (Block 37) is a placeholder script awaiting
the source book. Acts II to IV are registered stubs with no content.

Objective 2, gameplay mechanics: dynamic difficulty, health,
equipment, cosmetic rewards. (IN PROGRESS) All four are built and
tested. Health, hazards and the shop are exercised by shipped content.
Equipment is exercised by shipped content: the stage clothes, whose
effect the lansangan's guards now test (Block 37). Dynamic difficulty is
built but Act I is its 1.00 multiplier, and outfits need art; both are
proven against the harness fixture. What remains is content and art,
not code.

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
| Chapter Progression | (PARTIAL) All four acts registered and unlock in order. Act I has four scenes and can be completed, which unlocks Act II; Acts II to IV are stubs |
| Player Movement | (BUILT) |
| Combat Mechanics | (BUILT) Melee punch on a tap, takedown from behind, a ranged shot on a hold, each with real animation, plus enemies that fight back (Block 35). Act I ships one fight, the five guards in the moro-moro |
| Stealth Mechanics | (BUILT) Patrols, a detection meter, sight drawn on the road, hide spots, platforms out of sight, guards that shoot. Act I's lansangan uses them (four guards, three platforms) |
| Interaction System | (BUILT) Dialogue, gifts, NPC reach measured edge to edge, NPCs that open the shop |
| Narrative Delivery | (PARTIAL) Built. Act I uses it across four scenes and ten NPCs, with conversations that open by themselves and a scripted play; Acts II to IV have none |
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
| Usability | (BUILT) Tagalog throughout. Every touch target measured on screen at 44px or more. Icons beside every label. Pixel theme with a legible body face and a three-step text size setting. Portrait shows a rotate notice |
| Accessibility | (BUILT) Runs in Chrome on Android, confirmed on a real device |
| Online Functionality | (BUILT) |
| Compatibility | (PARTIAL) Confirmed on one Android phone. The harness proves the layout at 823 by 412 and 740 by 360 only |
| Maintainability | (BUILT) Layers with a strict dependency direction, documented in CLAUDE.md, and a 554-check suite |
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

## Blocks remaining

Block 12, polish. (IN PROGRESS) Audio is built (Block 30) and
Intense.mp3 now plays for the moro-moro's fight (Block 35); what remains
of it is whatever the device pass says about volume. Everything else in
Block 12 is a device check
now folded into Next action, item 1: label sizes on the touch buttons,
whether dialogue and quest text read comfortably at each text size,
and whether the inventory and shop fit without scrolling to Bumalik.

Act I's Block 37 placeholder script checked against the source book,
then Acts II to IV written against it. (NOT STARTED)

Seed trivia and assessment items for Acts II to IV. Until then those
acts skip their tests with a notice, which is deliberate. (NOT STARTED)

Real items for Sandata and Anting-anting, and outfit art, decided
against the source material. The Damit slot has its first item
(Block 32). (IN PROGRESS)

Two decisions in the moro-moro's script belong to the proponents rather
than to the build. The man is named Muslim on screen, after the file
name, and his last line calls Maryam a puta. Both ship as written and
both are easy to change; a Grade 8 classroom with a teacher present is
the room they will be read in. (KNOWN, PROPONENT'S CALL)

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

Chase the remaining art with the artist: Muslim.png (his guards share
it), Mananahi.png, Bonifacio.png, Katipunero.png, Bantay.png,
Mamamayan.png, Damit_Entablado.png,
Macario's Dead sheet and Mansanas.png (see Known
problems for where each shows). Later, once real items and the entablado
content are decided, the art they need. (NOT STARTED)

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

Missing production art. Assets/ holds real art for Nanay, Kutsero,
Kabayo, Tindero, both entablado pictures, Tondo.png, Lupa.jpg (the
ground), and Macario's idle, walk, melee and shooting sheets, plus the
two fonts and four sound files. Still missing, each falling
back to the dashed placeholder box naming the file (or, for the item,
to its symbol):

    Assets/Act 1/Muslim.png    the man in the moro-moro, and the five
                               guards he calls (one sprite, by decision)
    Assets/Act 1/Mananahi.png  the Mananahi, on the tondo road
    Assets/Act 1/Bonifacio.png   Bonifacio, outside the entablado
    Assets/Act 1/Katipunero.png  the second Katipunero, beside him
    Assets/Act 1/Bantay.png    the four guards on the lansangan (a
                               sheet facing right; see CLAUDE.md,
                               Pitfalls, for facing)
    Assets/Act 1/Mamamayan.png the three citizens, one shared sprite
    Assets/Act 1/Damit_Entablado.png  the stage clothes' tile (the shirt
                               symbol stands in)
    Assets/Dead.png            Macario's death pose
    Assets/Mansanas.png        the apple tile in the shop and inventory
    Assets/Act 1/Tondo_Night.png  night backdrop; no shipped scene
                               switches to night yet, so nothing shows

Nothing in the suite fails for these; only verify_new_scene.js checks
that named NPCs (Kutsero, Kabayo, Tindero) and the ground draw real art. (KNOWN)

Browsers cache index.html. It carries no version number of its own, so
a phone that loaded an old copy keeps requesting the old ?v=N files
even after a correct push. On 17 Sep 2026 a report that "none of the
changes applied" was exactly this: GitHub and the live site were both
serving the new files. Test from a private tab, or clear the site's data
in Chrome, before suspecting the code. Keep every changed file's ?v=N
bumped in the same push. (KNOWN, BY DESIGN OF PAGES)

The "Claude outputs" folder of preview screenshots is tracked in git
and published with the site, about 5MB of images the game never loads.
Harmless, but a public repository for a study probably should not carry
it. To stop tracking it: add "Claude outputs/" to .gitignore, then run
git rm -r --cached "Claude outputs" and commit; the local copies stay.
(KNOWN, PROPONENT'S CALL)

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
    node _dev/test.js
    node _dev/verify_new_scene.js

test.js: 554 checks against a fixture act and item catalogue (so
mechanics stay tested whatever Act I ships). verify_new_scene.js: 138
checks driving the REAL content/act1.js and content/items.js through
every Act I scene, from Nanay to the third pamphlet and the post-test.
Both last ran green on 18 Sep 2026 against the device folder's files
after Block 39 (Playwright's headless shell pointed at the sandbox's
preinstalled Chromium). Anything other than "0 failed"
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
