# TRACKER.md

Where the build is: status, next action, what has been run, what is
blocked. The one file that describes status (with ART.md for the art
still owed). How the thing is built is CLAUDE.md, why is DECISIONS.md,
what the story is is STORY.md. This file records present state only;
history is in DECISIONS.md and git. When something is finished,
compress it to a line.

Status markers: (COMPLETE), (IN PROGRESS), (NOT STARTED), (BLOCKED).

Last updated: 2 Oct 2026, after Block 108 and a scan of the whole
repository (the Scan list below: 43 findings, none started, to be
handled later); schema v5 confirmed run by the proponent the same day.
Blocks 106 to 108, the same
day: every ?v= a fingerprint written by node _dev/tools/prepare.js (run
it before every commit; a hook and the first CI job check it), the
animate tools shrink what they write, test.js --only; every moving body
placed by translate (walking and the guards no longer lay out the
street every frame; _dev/tools/profile.js measures it); and ?dev=1 on
the title screen to start a guest from a point in the story. Block 105:
the whole game kept on the
phone after one visit (so a reload downloads nothing and a guest plays
with no internet), the road drawn from the picture the loader waited
for, the Supabase library in the repository instead of a CDN, and every
sheet a quarter of its size (25 MB of assets down to about 13, the
part the game downloads about 11, of which 5 is sound). Not yet seen on a device (Next
action 1). Before that, 1 Oct 2026: Block 104, the suites run on GitHub
Actions on every push (first run green, 12 minutes); Block 103, the horse and the sewing
table away at night; Block 102, the pamphlet three's art, an easier
barber, an empty night street; Block 101, the proponent's seven
characters in place of old art and placeholders, and a calm idle;
Block 100, the horse from the proponent's still; Block 99, people drawn
side on turn to look at Macario; Block 98, six of the artist's stills;
Block 97, one tool and a rig per character for animating any still;
Block 96, the big siga from the artist's still. Blocks 90 to 97 were
tested on the phone that day with no fault reported; Blocks 98 to 103
have not been seen on a device yet (Next action 1). Earlier blocks:
the Blocks list below, and DECISIONS.md. test.js 776 passed, 0 failed;
verify_new_scene.js 255 passed, 0 failed, locally and on CI. Everything
is committed and pushed to main.

A new session, on any device: git pull first; read CLAUDE.md, then
this file's Start here and Next action, then STORY.md before touching
content; look at the last CI run (the Actions tab) to know the build
was green when this file was written; and check for pictures the
proponent dropped into assets/ (git status shows them untracked). A
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
full reset, schema v5, run); the Talaan (the teacher's papers on
the road); and the teacher dashboard (roster, questions editor, Talaan
papers). The loader waits for every picture that exists, fetches the
whole act on the title screen, and never lets a student in with art
missing; a service worker keeps every file on the phone, and since Block
105 the page hands it the whole game after the first visit, so the next
opens with no download, a guest can play with no internet, and the
title screen says when the phone is ready ("Nakahanda na ang laro
kahit walang internet."). A student's login and save still need the
internet.

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
                                        5 rounds, 4 to 7 a round right,
                                        20 in all (Block 102)
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

Art: Macario's idle, walk, jump, punch and shot are the artist's; so
are the street paintings, the inside of the entablado, the Mananahi,
and the stills of the bantay, the three siga, the direktor, the
Katipunero and the Kasama. The proponent drew Kabayo, Nanay, the
Kutsero, the Barbero, Maryam, the Sultan, the kawal, the Mabalasig and
the three who take the pamphlets (Blocks 100 to 102). Characters drawn
side on or three-quarter move, their motion made from the one still by
tools (animate-bantay.js, animate-kabayo.js, and animate-still.js with a
rig each); those drawn facing the front stand still. Nothing is drawn
in code. Still owed (ART.md): three pictures, none of them a person,
the Barbero's chair, the Mananahi's sewing table and the pulungan's
painting.

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
fault. Blocks 98 to 103 are pushed and not yet seen on a device:
Next action 1 says what to look for.

Versions: since Block 106 every ?v= is the file's fingerprint, written
by node _dev/tools/prepare.js before each commit and checked by the
hook and CI, so there is no list to keep here. The Supabase library is
supabase-js 2.117.2 (js/vendor/supabase.js). sw.js carries no version:
the browser checks it on every visit.

## Next action

In order.

1. Every new block is seen on the phone before it is called done: in
landscape, from a private tab, after the push, with the sound on,
played from the start, or since Block 108 from the nearest point in the
story: open the game with ?dev=1 after the address
(https://fakeplasticfilipino.github.io/Capstone-Project/?dev=1), pick
the point from the list on the title screen and press Simulan dito. It
plays as a guest and saves nothing. Play from the start before the
pilot all the same, since a jump skips what comes before it. Write the block's own checks here (what to see,
and what failure looks like) when it ships, and take them out again
once the proponent reports it working. Blocks 90 to 97 were tested on
1 Oct 2026. Open:

    Block 105, loading. On the phone, in a private tab on wifi: the
      title screen shows "Sine-save ang laro sa telepono para sa
      offline: n%" climbing, then in green "Nakahanda na ang laro kahit
      walang internet." (a minute or two on a slow connection). Play a
      little: the road is there from the first frame, and every
      character looks exactly as before (the sheets are a quarter of
      the size; nobody should be able to tell). Then turn on airplane
      mode, reload: the game opens at once, the line is still green,
      Maglaro bilang Bisita goes into the street with every picture,
      the road and the music. Then turn wifi back on and reload: it
      opens without a download (no loading bar to speak of). Failure:
      the line stuck below 100% on good wifi, a blank road, a dashed
      box, a character with blotchy colour or a ragged edge, no music
      offline, or a blank page in airplane mode. The teacher dashboard
      still logs in (it uses the same library, now from the repository).
      Note that a phone which never finished the first visit is not
      ready; the line is what tells you.

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
      pulungan the Katipunero, the Kasama and the Mabalasig look at
      him; so does the Kasama on the street, and Nanay (Block 101).
      Maryam, the Kutsero and the Barbero face the front and do not
      turn. The three siga, and anyone else standing together, breathe
      out of step, each at his own pace. Failure: anyone still looking
      away, a turn that flickers while Macario stands in front of
      someone, a placeholder box whose name reads backwards, or
      breathing in step.

    Block 100, the horse. Beside the Kutsero (x 3560) Kabayo is the
      proponent's saddled bay, not the small white horse: hooves on the
      road, the head dipping slowly and the tail tucking in, a two
      second loop. Suklayin opens the grooming game with the same horse
      in its picture. Failure: a dashed box, a white sliver between the
      tail and the rump, a seam at the neck in front of the saddle, or a
      horse floating or sunk into the road. (Its motion was halved in
      Block 101.)

    Block 101, the proponent's seven characters and a calm idle. Nanay
      is side on: she walks on in the opening on her own walk, not a
      box, turns to face Macario, and walks home with him, the hem
      swaying. The Kutsero, the Barbero and Maryam are the new front-on
      stills and stand still. The Mabalasig, in the pulungan and the
      year on, is side on with his paper and bolo, breathing. On the
      stage the Sultan marches on and off and has a dialogue bust; the
      soldiers (turban, kris, shield) march at Macario, rock back on
      the red !, throw themselves forward with the kris, and flinch.
      Everyone standing (the siga, the direktor, the Katipunero, the
      Kasama, Nanay, the Sultan, the horse) barely breathes: you should
      have to look for it. Failure: anyone sliding, floating or walking
      backwards, a seam at a leg, a piece of a blade or cape moving with
      a leg, a dashed box where a character should be, or breathing you
      can see from across the street.

    Block 102, the night and the barber. The barber's game is five short
      requests (two, two, three, three, four tools), said more slowly;
      each round right pays 4 to 7, and one good run reaches his 20.
      On the pamphlet night the street holds only the mangingisda, the
      tabakera and the karpintero (now the proponent's art, standing
      still) and the guards: no Nanay, Kutsero, Mananahi, direktor or
      Kasama until the Kasama comes for him after the third, and since
      Block 103 no horse and no sewing table either. Failure: anyone or
      anything else on the night street, a dashed box for one of the three,
      or a perfect barber run paying less than 20.

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

5. Art from the artist: ART.md's Owed list, three pictures since Block
102 (the pulungan's painting, the Mananahi's sewing table and the
Barbero's chair). PNGs with transparency; each goes through ART.md's steps.
A character delivered as one still rather than a sheet is animated by
the tool (CLAUDE.md, Animating a character from one still): ask the
artist for the whole figure side on, standing, arms free of the body.

6. Then the remaining polish, the pilot, and Acts II to IV against the
source material, Act II starting from STORY.md, Threads left open.

7. The Scan list (2 Oct 2026, below): 43 findings from reading every
file, none started. Worked as an agreed list once the proponent has
answered it item by item; the ones that bear on the study (S1, S2, S10
to S15) before the pilot.

8. Privacy of the public repository (30 Sep 2026). Done: the names of
the team, the resource person and the school are out of every tracked
file, docs-private/ and *.pdf and *.docx are gitignored, and the two
private files were deleted from GitHub. Open: they and the names are
still in the git history (the proposal and the validation form in older
commits; older README versions), and every commit carries the author
name and email. Only a history rewrite and a force push purges them, and
the GitHub username stays in the repository's URL either way. The
proponent has not yet decided whether to rewrite the history.

## Loading list (Block 105)

Agreed 2 Oct 2026, after a presentation failed to load: nine items, all
(COMPLETE). A, the Supabase library in the repository; B, the road and
the default backdrop drawn from the versioned picture; C, the whole game
kept on the phone after one visit; D, music and sounds served from the
phone; E, three seconds for a crawling connection; F, the title screen's
line; G, a guest with no internet (checked, nothing to change); H, the
sheets shrunk to a quarter; I, .claude/ gitignored. Why: DECISIONS.md,
Block 105.

## Scan list (2 Oct 2026)

A read of every tracked file (the engine, the content, the dashboard,
the database files, the tools, the tests and the documents), asked for
by the proponent, who wants it handled later. Each item says where, what
is wrong, why it matters, and a suggested fix; nothing here is started.
Per CLAUDE.md (Plan first) the list is answered item by item before any
of it is built. All (NOT STARTED).

### Bugs

S1. Dashboard performance is pulled down by empty acts. js/teacher.js,
buildRoster: the Performance column averages performance_score over
every act_progress row the student has. Finishing Act I shows the
transition screen, and "Magpatuloy sa Ikalawang Yugto" runs
Acts.enterAct(2), whose _ensureRow inserts an Act II row with
performance_score 0 (Act II is a stub). A student who scored 90 in Act I
then shows 45. Matters: it is a figure the panel and the teacher read.
Fix: average only rows with status completed, or only acts with
objectives_total > 0; or show Act I's score alone while it is the only
act with content.

S2. The quiz's Back button keeps a borrowed label. js/assessment.js,
_onBack clones the button and resets only its icon. askReplay labels it
"Tapusin na" and the feedback form "Laktawan"; every later question
screen that shows Back (index > 0) keeps that word. A student who fails
the post-test, replays and sits it again sees "Tapusin na" on the Back
button of every question. Fix: _onBack takes a label and defaults it to
"Bumalik"; askReplay and the feedback pass their own.

S3. No way out of a score that cannot be saved. assessment.js, _submit:
on a failed insert (no internet, a dead connection) the screen offers
only "Subukan Ulit", and the promise always resolves into another try,
so a student offline at the end of a test is held there for good. Fix:
after one or two failed tries offer a second button that keeps the
answers in localStorage and moves on, sending them on the next login;
or at least a way back to the world with the score shown.

S4. A guest who finishes Act I gets no ending. The last flag
(pinunoNgBalangay) is set after "Wakas ng Unang Yugto", but
Acts.checkObjectives and finishAct return at once without a
currentUserId, so a guest is left in the pulungan with "Wala nang
gawain." Matters for a presentation played as a guest. Fix: for a guest,
show the act's end screen (Acts.showTransition with the "Wakas" text,
without the next act) when the last objective is done.

S5. ?dev=1 on a phone with a student logged in enters that student.
game.js, enterGameAsGuest returns at once when currentUserId is set, and
shell.js has already marked the gate taken, so "Simulan dito" drops the
tester into the student's real save (which is then written to). Fix:
hide the story-point list when a session exists, or sign out first with
a warning.

S6. The corner shop button opens an empty shop. The only item
(damit-entablado) has price 0, so Inventory.forSale lists nothing and
the always-visible coins button opens "Walang paninda ngayon." A
student taps it and learns nothing. Fix: hide #btn-shop while
Inventory.forSale(null) is empty (one line in the game loop), and show
it again when items are for sale.

S7. A replay keeps the stage clothes. acts.js, replayAct clears the
story's flags but not the inventory, so after a failed post-test the
replayed act is played in the clothes from the start, with their
slower detection, before the direktor has given them. Fix: unequip and
remove damit-entablado on a replay (its grant flag is a story event),
or declare per item whether a replay keeps it.

S8. A scene script that throws leaves the world frozen. game.js,
runSceneScript catches the error but leaves cutscenePlaying as the
script set it, so Macario cannot move until a reload, and the doneFlag
is never set, so the reload plays the same script again. Fix: in the
catch, clear the cutscene (setCutscene(false)) and close any open
dialogue; log it so the harness fails on it.

S9. Two saves can arrive out of order. game.js, saveProgress has no
in-flight guard: the ten-second autosave and the 800 ms debounce can
both be sending, and if the earlier payload lands last it overwrites
the newer one (an objective flag lost until the next save). Rare, and
the next save repairs it, but a logout in that window keeps the stale
row. Fix: one save at a time; a save asked for while one is in flight
runs once more after it.

### The study and the assessment

S10. A post-test question gives away another's answer. content/
questions.js (and the seeded bank): post item 10's stem says "Ang mga
tulad ni Sakay na mananahi at barbero", which answers post item 2
("Barbero at mananahi") in the same test. Fix: reword item 10's stem
without the trades ("mga karaniwang manggagawa tulad ni Sakay"), in the
database too if the teacher has saved the bank there.

S11. No answer is ever D. The pre-test keys are B,A,C,B,B,A,B,B,C,B
(B six times) and the post-test's C,C,A,C,C,B,A,C,B,B; neither test
has a D. A student who notices never picks D, and three of four
choices become two of three. Fix: move some keys to D (rotating the
choices of a few items), keeping each pair's keys in different
positions.

S12. Pair 10 has its key in the same place in both tests (B), against
the standing rule that matched pairs put the key in a different
position. Fix: move one of them, with S11.

S13. The dashboard's gain uses the latest post-test try. teacher.js
keeps the highest attempt per test, so a student who failed, replayed
and passed shows the gain of the retake. The study's learning gain is
probably the first post-test against the pre-test (and the retake
reported separately). Fix: show the first attempt's gain in the Gain
column and summary, and the latest beside it, so the paper reports
what it defines.

S14. The instrument can change in the middle of the study. Any teacher
can edit any act's questions and trivia (schema 006 policies are not
per class), a pre-test item can be edited without its post-test
partner, and nothing stops an edit once students have sat a test. Fix:
a lock (refuse to save a test that has scores against it, or warn and
require a confirmation), and edit pairs together; at least say it in
the dashboard and in the study's procedure.

S15. Nothing exports. The proponents receive aggregate figures and
will analyse them; the dashboard shows tables only (Deferred:
"Dashboard export"). Fix: a "Download CSV" of the roster rows already
fetched (no new query), done in the browser.

S16. Already noted (Next action 4) and still open: the "Mangingisda at
magsasaka" distractor, a person the student meets; and the rite (the
three questions, "Anak ng Bayan") is taught but not tested.

### Player-facing text and screens

S17. The page title is "Long Road" (index.html, <title>), the name of
an earlier draft, and the page declares lang="en" though the game is in
Tagalog. The tab, the home-screen shortcut and a screen reader all say
it. Fix: <title>MACARIO</title> and lang="tl" (teacher.html stays en).

S18. English on the student's login. index.html: the button reads "Log
In"; game.js writes "Loading..." while signing in, and shows Supabase's
own English error ("Invalid login credentials") on a wrong password.
Fix: "Mag-log in", "Naglo-load...", and a Tagalog line for the common
errors (wrong email or password, no connection), the raw message kept
for the console.

S19. Settings' list of controls is out of date (index.html,
.shell-controls): "Ibato" (throw) is now a gunshot; running (hold a
direction) and the dash (Atake toward an enemy) are not listed; jump
also takes the up arrow. Fix: reword to the controls as they are.

S20. The corner buttons have no words. #btn-pause, #btn-inventory and
#btn-shop are icon-only (aria-label only), against CLAUDE.md's rule
that every button is an icon and a label. Either give them short
labels if they fit at 0.7 zoom, or record the exception and why in
CLAUDE.md, Icons.

S21. No way back from the login box. After Magsimula the login form
has no button back to the title screen (guest mode, settings); a
student who tapped the wrong one reloads. Fix: a "Bumalik" under the
form that shows the title panel again.

S22. Repeat lines that no longer fit the moment (content/act1.js):
the Mananahi's "Nariyan ang tahian, kung gusto mo pa ng dagdag na
barya" is still said after her 25 is paid (the tahian then says she is
done); Nanay's last set ("Ituloy mo lang 'yan...") is what she says on
the street after he has joined and, a year on, lied to her. Fix: a
set after SEWING_JOB.full, and one for Nanay after the oath (ours,
marked PLACEHOLDER and +).

### Dead code and unused files

S23. The apple game is no longer used by the story. game.js,
playCatchGame (about 300 lines), its screen in index.html and its CSS
are exercised only by test.js (Blocks 57, 65); no content calls it
since Block 89. Matters little at run time; it is weight to read and
keep tested. Fix: remove it and its checks, or keep it on purpose and
say so in CLAUDE.md (a ready mechanic for Acts II to IV).

S24. Sounds downloaded and never played: intertitle.wav (black cards
are silent since Block 84) and streak.wav (the apple game only). Every
phone stores them since Block 105. Fix: remove with S23, or keep if
the apple game stays.

S25. Five empty lines before buildNpcs in game.js (after
SHADOW_TREE_URLS). Cosmetic.

### Documents and comments that are out of date

S26. README.md: still says "a v=N query string, and images are
versioned through ASSET_VERSION" (fingerprints since Block 106); says
several characters are placeholder boxes (only the chair, the table and
the pulungan are owed); its Tests section lacks prepare.js and --only.

S27. content/act1.js's header tells earlier stories: the Mananahi
paying him on the street, the third pamphlet ending the act, "the
direktor is the last of the Mananahi's deliveries"; CITIZENS' comment
names the apple tree and "the Mananahi's customers".

S28. game.js comments that describe things gone or changed: the
"Blocks applied" header stops at Block 7; Tondo.png as the backdrop;
Horse.png as a 32px sheet (the horse is the proponent's large sheet);
the melee sheet "a PNG that carries a .jpg name"; nanay.png "has a
space"; the stage poem, night and death sequence (setPaused, fadeToScene
comments); the outpost and the amulet; the Tindero; "fps not checked on
a phone"; the stage ramp in floorHeightAt.

S29. content/items.js and js/inventory.js comments: the Tindero's
stall, Kabayo's apples, the Mananahi selling the clothes, and
"assets/items/", a folder that does not exist (the example path
"assets/Items/Sibat.png" is also capitalised).

S30. js/acts.js comments: "Act I has five objectives", the drip paying
50 before "the outpost" (Act I has fourteen objectives and no drip,
objectiveCurrency false); DAMAGE_BUDGET "a careful first run of the
Act I outpost".

S31. js/assessment.js header: "owns ... the two RPC calls" (none used
since Block 68).

S32. index.html comments: the page card "showNotebookCard" (now
showPageCard, the Talaan), "Login / signup gate" (there is no signup).

S33. _dev/README.md names make-placeholder-sprites.py, which no longer
exists (Stand-in art section). key-black.py's example file name,
"muslim-walk.jpg", from an early draft, is better replaced with a
neutral one (the play's soldiers are "kawal").

S34. The database's own description: db/scripts/db_healthcheck.sql
checks "the eleven tables" of schema v4 and nothing from 006 or 007
(the attempt column, the partial unique index for the pre-test,
talaan_entries and its policies); the Run log said the database holds
eleven tables (twelve since 007). Fix: extend the health check.

S35. This file's requirement tables: Equipment System said "no item
ships since Block 52" (the stage clothes ship since Block 82), and Data
Synchronization did not mention play as a guest with no internet
(Block 105). Corrected in this update; kept here so the paper's own
tables are checked the same way.

S36. CLAUDE.md is about 133 KB and is loaded by every session. Much of
it is history (the long "I can't see Nanay" pitfall, old file names,
superseded paragraphs) that belongs in DECISIONS.md. Fix: a pass that
moves history out and keeps rules, as Block 79 did.

### Open items and process

S37. db/scripts/reset_test_accounts.sql is still not recorded as run
(owed since Block 25). Schema v5 itself is run (2 Oct 2026, the
proponent).

S38. Blocks 98 to 108 have not been seen on a phone (Next action 1).

S39. The git history still holds the private files and names (Next
action 8); the decision on a history rewrite is pending.

S40. Owed art: the barber's chair, the sewing table, the pulungan's
painting (ART.md).

S41. Waiting on the proponents and the source book (Next actions 2 to
4): the years, every + line, the Talaan's three papers; and on others
(Blocked on other people): the resource person's written delegation,
the pilot accounts.

S42. Sound is now half of what a phone downloads: calm.mp3 and
intense.mp3 are 1.9 MB each and gabi.wav (the night) is an
uncompressed 324 KB. Fix: gabi as MP3 or OGG, and the two tracks at a
lower bitrate (96 kbps mono is plenty for a phone speaker), done with an
encoder on a computer that has one (nothing in Node encodes MP3).

S43. The pre-commit hook is on the proponent's computer only (git
config core.hooksPath _dev/hooks); a cloned copy or a cloud session
relies on CI. package.json has no "test" script. Fix: add "scripts":
{ "test": ..., "prepare": "git config core.hooksPath _dev/hooks" } so
npm install turns the hook on everywhere.

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
    db/migrations/005_macario_schema_v5.sql    RUN (confirmed by the
                                        proponent, 2 Oct 2026). The
                                        three functions behind the
                                        in-game full reset; no tables,
                                        columns or policies. Its list of
                                        accounts allowed to reset is the
                                        two test accounts
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
                                        checks the eleven tables of v4, the
                                        two v4 drops and the v4 columns;
                                        nothing from 006 or 007 yet (S34)
    db/scripts/reset_test_accounts.sql         run before any full-flow
                                        test. Owed once since Block 25
                                        (the id "mansanas" changed
                                        meaning); NOT RECORDED AS RUN.
                                        Record the date here when it is

Supabase project reference: rkfnovfkroajottpmxxq. The database holds
twelve tables: the eleven of the revised ERD and talaan_entries (schema
007), which the ERD in the paper still needs.

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
| Equipment System | (BUILT) Sandata, Anting-anting and Damit slots, stacking consumables, quest items, granting and buying, stock per seller. Act I ships one item, the stage clothes (Block 82, worn, slower detection while still); the rest verified against the fixture |
| Cosmetic Reward | (BUILT) Currency awarded per act and scaled by performance, a shop, the Damit slot and sprite swap. No outfit ships yet; verified against the fixture |
| Trivia | (BUILT) Act I built in and editable; Acts II to IV not written |
| Act Assessment | (BUILT) Act I built in and editable; a 75% pass mark and a replay before another post-test try. Acts II to IV not written |
| Performance Scoring | (BUILT) Weighted sum, 50 completion and 25 each for survival and stealth. Time recorded, not scored |
| Progress Tracking | (BUILT) Completion, scores and attempts, damage taken, detections, play time |
| Teacher Monitoring | (BUILT) Class roster and summary per class, scoped by RLS, searchable and sortable; basic summaries, no charts, by decision. Also the questions editor and the Talaan papers |
| Data Synchronization | (CHANGED) Writes go straight to Supabase and a student's login and save require a connection. No offline queue, so "upon internet availability" is not implemented as worded. Since Block 105 the game itself is kept on the phone after one visit and a guest can play with no internet |

## Non-functional requirements

The paper specifies ten.

| Requirement | Status |
|---|---|
| Performance | (BUILT) No build step, no framework, plain script tags. The loop writes to the page only on a change; the phone was confirmed smooth after Block 36. Pictures are JPEG where they can be and sheets 256-colour PNGs; the whole game is kept on the phone after the first visit |
| Reliability | (BUILT) Debounced save, ten second autosave, beforeunload and logout flushes. A loader that retries every picture until it arrives |
| Usability | (BUILT) Tagalog throughout the game; the teacher dashboard in English. Touch targets 44px on glass, icons beside every label, a three-step text size, a rotate notice in portrait. No guide arrow, by decision |
| Accessibility | (BUILT) Runs in Chrome on Android, confirmed on a real device |
| Online Functionality | (BUILT) A guest can also play with no internet once the game is kept on the phone (Block 105) |
| Compatibility | (PARTIAL) Confirmed on one Android phone. The harness proves the layout at 823 by 412 and 740 by 360 |
| Maintainability | (BUILT) Layers with a strict dependency direction, documented in CLAUDE.md, and two suites (776 and 255 checks). Characters animated from one still by one tool and a rig each |
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
    100 Kabayo is the proponent's saddled bay, animated from one still
        by animate-kabayo.js (head and tail); ALWAYS PULL FIRST added to
        CLAUDE.md
    101 the proponent's seven stills (Nanay, the Mabalasig, the Sultan,
        the kawal animated; the Kutsero, the Barbero, Maryam still);
        march, thrust, legSplit and stride in animate-still.js; the idle
        calmed to a quarter for everyone
    102 the three who take the pamphlets (stills); the barber's game
        easier, 4 to 7 a round right, 20 in one run; the night street
        empty but for the three and the guards
    103 the horse and the sewing table away at night too
    104 GitHub Actions runs both suites on every push; a full local run
        only before a release to students
    105 load once, play anywhere: the whole game kept on the phone and
        said on the title screen, music kept, a crawling connection
        given 3 seconds, the road versioned, the Supabase library in the
        repository, the sheets shrunk to a quarter (shrink-sprites.js)
    106 fingerprints instead of hand-bumped versions (a phone fetches
        only what changed); prepare.js, the pre-commit hook and a
        one-minute first CI job; the animate tools shrink what they
        write; test.js --only and --list
    107 every moving body placed by the translate property, not left:
        walking 41 layouts a second to 3, the guards' night 60 to 0;
        profile.js measures the game slowed like a phone
    108 start a guest from a point in the story: the title screen with
        ?dev=1 lists nine (the jobs, the direktor, the play, the
        savings, Baldovino, the Kasama, the oath, the pamphlets, the
        report), each checked by verify_new_scene.js

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
(IN PROGRESS). The placeholder art it waited on has arrived: every
person is drawn since Block 102; only the chair, the sewing table and
the pulungan's painting are still owed (ART.md; BLOCKED). The list: DECISIONS.md,
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
cannot go in with art missing), and in Block 105 (the game kept whole on
the phone after one visit, the road no longer a second download that
nothing waited for, the Supabase library no longer from a CDN, the
sheets a quarter of the size, and a crawling connection given three
seconds before the kept page opens). A presentation failed to load on a
bad connection before Block 105. Not yet seen on the phone since. One
limit remains: a picture replaced under the same name and fetched in the
minute a push is still deploying can be kept under the new ?v=; bumping
ASSET_VERSION again fixes it. Before a class or a presentation, open the
game once on good wifi on every device and wait for the green line.
(FIX BUILT, NOT SEEN ON DEVICE)

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

Since Block 104 GitHub Actions runs both suites on every push to main
that changes anything but Markdown (.github/workflows/tests.yml), the
two side by side on a fresh machine; the commit shows a green tick or a
red cross, and the Actions tab says which check failed. Locally, run
what a change touches while building, and both in full before a
release to students (CLAUDE.md, Deployment, Testing a push).

From the repository root:

    npm install
    node _dev/tools/prepare.js              before every commit, a second
    node _dev/tests/test.js                 --only=BD,BL for sections
    node _dev/tests/verify_new_scene.js

CI runs prepare.js --check first, in about a minute, and the two suites
only once it passes (Block 106).

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

test.js (776 checks) drives the shipping index.html with a stubbed
Supabase client in headless Chromium at 823 by 412, phone landscape,
against its own fixture act and item catalogue, so every engine system
stays tested whatever Act I ships. Its sections are the inventory of
what is covered. verify_new_scene.js (255 checks) drives the real
content through Act I end to end, to the post-test opening, including
reloads mid-beat, old saves,
a guest, and checks that every line of the content is
in STORY.md, that ART.md's Owed list matches the disk, and that the
asset manifest matches assets/ and every picture in it opens, and that
every sheet has been through shrink-sprites.js. Anything
other than "0 failed" is a regression, with one caution learned on
30 Sep 2026: on a busy machine verify_new_scene.js has twice failed a
timing check (the pamphlet guard catch) or lost a page ("Page crashed")
once, and passed on the next run; rerun before believing either.
test.js did it once on 1 Oct 2026 ("after lighting up first, so the
swing is readable": an enemy already mid-dash when the check starts
watching for its red !), and passed on the rerun. Both never touch the
live project. Both are green as of Block 108, locally and on CI (about 8 minutes there). The guard-catch flake was
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

Revise the ERD to twelve entities (eleven, and talaan_entries since schema 007). The paper says fifteen and describes
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
