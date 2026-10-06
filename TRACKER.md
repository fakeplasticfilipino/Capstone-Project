# TRACKER.md

Where the build is: status, next action, what has been run, what is
blocked. The one file that describes status (with ART.md for the art
still owed). How the thing is built is CLAUDE.md, why is DECISIONS.md,
what the story is is STORY.md. This file records present state only;
history is in DECISIONS.md and git. When something is finished,
compress it to a line.

Status markers: (COMPLETE), (IN PROGRESS), (NOT STARTED), (BLOCKED).

Last updated: 6 Oct 2026, after Block 123. Block 123: an overnight
pass at the proponent's word (work on, no questions): the release run
at a student's speed made green again (the checks waited by fixed
silences a black card outlasts; the game was right), the dashboard's
average post-test made the first attempts' like the gain, a question
save that can no longer leave a test empty, "Sa makalawa" made "Sa
susunod na linggo" (Act II, a week), five English lines of Act
III given their Tagalog, and a login whose reads fail tried again and
then stopped, never putting a student into the wrong act (and what he
carries read again too); an act's end that cannot be written said, with
a reload, instead of a next-act button that did nothing; Escape no
longer opens the pause screen (and the Talaan) in the middle of a test;
the save sent the moment the phone leaves the page; the test's answers
two to a row in landscape, so Susunod is on screen without scrolling. Waiting on the proponent: a database change,
drafted and kept off the repository until applied, and the drafts for
the paper (both on the proponent's computer, Claude outputs/). Block 122: the password
change offered to every student again (a panelist's suggestion), with
the current password asked first; the trackers read through against
the build. Block 121: the audit of 5
Oct 2026, fifteen items, all approved: a fight that moves always goes
on to the right, at once if he is already past the point; the shop
sells three things (lagundi, the anting-anting, the pulbura), shut
while Act I saves for Nanay; a failed save is sent again; a replay
takes back only its own act's items and gives back no barya; an act
entered with no row plays on; one "Walang pagsusulit" per act; the
password change for test accounts only (undone in Block 122); and the small ones (an old
Act III save, a catch in the grace window, the reset's kept scores,
the CSV, CI on Markdown). Block 120: the pacing pass,
twelve changes from a read of the whole game, all approved: what was
told on black and could be shown is shown (the post's bell, the
amnesty in a cell in Bilibid, Paris read in Laguna, Palanan told by
Isko); the long walks shortened (Act II's press door, Act IV's
Kutsero) and the stranger in Nanay's house pointed to; Act III's middle
made to go wrong (the law mid-petition, the last name refused, an empty
house); Tanay's three buttons one drill; and the battles given a goal
each (the scarecrows and the flag as decoys, the fight out of the post,
the push into Malabon's plaza), the crowd and the Republic's soldiers
seen as placeholders. Block 119: Act IV written,
1903 to 1907, end to end, from the proponent's labelled sources: the
first presidential order, a Constabulary post raided for guns and
uniforms, the manifesto, the costume for Tanay (whether he went left
unsaid), San Francisco de Malabon, the reconcentration heard of and the
rice shared out, Gómez and the terms, Manila, the reception in Cavite,
Bilibid, the court, the Assembly elected without him, and the last
morning, walked by the student; two battles of fifteen; a stone floor
for Bilibid. The game now has all four acts. The same day, every tracker read
through against the build (TRACKER, ART, STORY, CLAUDE, README) and
the stale lines brought up to date. Block 118: Act III revised
against the proponent's labelled sources (the source of truth): Santa
Mesa heard of from a runner, not shown, the opening fight a patrol in
the hills; Macario at the Partido Nacionalista's founding and its
Secretary-General, with Álvarez and Poblete; the Sedition Law read from
a notice; President and Generalissimo, and the Republic's own flag;
every beat tagged [CONTEXT], [MACARIO] or [INSERT]. No art borrowed or
made for anyone not drawn: the tinted stand-ins removed, the fighters
placeholders. Block 117: Act III written,
1899 to 1902, end to end (Santa Mesa and the war, Manila under guard,
the haircut on an American, the creed, Isko's surrender, the Sedition
Law, the capture, the Republika ng Katagalugan and the vow, the
Brigandage Act; two battles of fifteen; the Americans in English, each
line given in Tagalog). Block 116 (4 Oct): a guest who
finishes Act I plays on into Act II, with no tests and nothing saved.
Block 115: the suites in pieces, the story fast-forwarded under test and
run side by side (both suites, 1,347 checks since Block 123, in about two minutes; CI
in four shards, about two and a half). Block 114: a floor drawn for each
place, each job played once, the barber's game a haircut on a customer
drawn in pixels. Block 113: Act II written, 1896 to 1898, as a tragedy;
the detection meter twice as fast; Act I's lines accepted by the
proponents. The proponent reported Blocks 98 to 112 working on the
phone on 4 Oct 2026, and Blocks 113 to 118 on 5 Oct 2026. Earlier blocks: the Blocks list below, and
DECISIONS.md. Both suites green locally and on CI. Everything is
committed and pushed to main.

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

Acts II to IV are written (Blocks 113, 117, 119), below Act I's list. Act I, rewritten in Block 52 against the
proponents' script and built forward since, and since Block 80 it has
an ending. STORY.md has it beat by beat, with every line. It is one
street ten paintings long (14500px, street-01..04.jpg in order, twice,
then 01 and 02, a silhouette tree over each join; keep anyone a student
must reach 90px clear of a multiple of 1450), the inside of the
entablado, which only the direktor (and later the four-year card) takes
Macario into, and the pulungan, the Katipunan's secret room, which only
the Kasama takes him into. Fourteen objectives, one chain, shown one at
a time in the quest log (finished ones in Mga Setting). Since Block 89
nothing but the turns is staged: the work is simply there; since Block
114 each job is played once, paid 8 to 12 by how well it went.

    1  Umuwi kasama si Nanay            the thought after the opening
    2  Maghanap ng trabaho: kausapin    the Kutsero's first conversation
       ang Kutsero
    3  Alagaan ang kabayo ng Kutsero    the grooming round, once
                                        (Block 114): 8 to 12 barya
    4  Magtrabaho sa barberya           the Barbero's own game (Block
                                        114): a haircut on a customer
                                        drawn in pixels, scissors over
                                        his hair; 8 to 12 by how clean
    5  Kausapin ang Mananahi            her first conversation (before
                                        the barber she sends him there)
    6  Tulungan ang Mananahi sa         the same game as grooming, at her
       pananahi                         tahian, once (8 to 12); after it
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
The stage clothes (damit-entablado) are the direktor's gift after
Principe Baldovino, worn from then on; standing still in them, a guard
notices him five times more slowly. Act III's disguise (balatkayo) is
the same kind of item. Since Block 121 the corner shop sells three
things for barya (lagundi, the anting-anting, the pulbura), shut until
Nanay has her savings. The harness fixture covers every other item path.

Act II, Ang Mahabang Anino ng Digmaan (Block 113), 1896 to 1898: eight
places joined by black cards (the Katipunan's press, where it opens;
Act I's street; home; Pugad Lawin; San Juan del Monte; the Nangka
River; Balara at night; Laguna), fourteen steps in one chain, every
line ours (+ in STORY.md, PLACEHOLDER in content/act2.js). A tragedy,
at the proponent's word: Macario sends nobody to protect Nanay, is
chased from her guarded door, and never learns her fate; the Kasama
dies at San Juan del Monte. The work game prints Kalayaan; four long
stealth stretches (the day's walk to the press, the press, the night's
walk back, the retreat), each restarting a catch at the last point
passed; the cedula is torn with Bonifacio's button; San Juan del Monte
is fifteen soldiers in four waves; the Nangka is three scarecrows and
six soldiers; it ends with Jacinto in Laguna and 1897 and 1898 on
black. Its paintings, Isko,
Jacinto, Bonifacio, the printer, the messenger, the press and the straw
are owed (ART.md), drawn as placeholders. The soldiers are the bantay's
art (the sundalo of the enemy catalogue).

Act III, Ang Republika sa Lilim (Blocks 117, 118), 1899 to 1902, from
the proponent's labelled sources: seven places (his band's camp in the
hills outside Manila, where the news of Santa Mesa reaches him; Act I's
street under American guard, by day in
1899 and at night in 1902; the barbershop; a town plaza; Calle Gunao in
Quiapo; a cell in Bilibid, Block 120; the camp at Morong), fifteen
steps in one chain, every line
ours (+ in STORY.md, PLACEHOLDER in content/act3.js), every beat
tagged [CONTEXT], [MACARIO] or [INSERT]. Macario is never at a [CONTEXT]
event. The Americans speak English, every line given in Tagalog after
it. Two battles of fifteen (an American patrol in the hills, the
Constabulary at Morong), two
stealth runs past American sentries (the first in Maryam's disguise,
the balatkayo), the haircut once more on an American, three counted
steps (the creed taught, the petition signed as the Partido
Nacionalista's Secretary-General, three doors), Isko's surrender, the
Sedition Law read from a notice, the capture at an oath, the Republika
ng Katagalugan with its flag, Macario its President and Generalissimo,
and the vow not to cut their hair. Nanay's fate stays unknown. Its
paintings, its new people, its flag and its fighters are owed (ART.md):
placeholders until drawn.

Act IV, Ang Mapait na Ani (Block 119), 1903 to 1907, from the
proponent's labelled sources: nine places (Morong again, a Constabulary
post at night, the Di-Masalang camp, San Francisco de Malabon, Act I's
street in July 1906, the hall in Cavite, a cell in Bilibid, the court in
Cavite, Bilibid's yard), thirteen steps in one chain, every line ours (+
in STORY.md, PLACEHOLDER in content/act4.js), every beat tagged. Two
battles of fifteen (the post's alarm, Malabon), a stealth run, the
press's work game, two counted steps (three taught for Tanay, the rice
shared), Gómez and the three terms, the crowd in Manila (Isko and his
son, Maryam, the Kutsero's carriage), the toast broken at the
reception, the plea and the sentence, the election heard through the
bars, the father answered on the last night, and the walk to the
scaffold, which the student makes. His last statement is the last line
of the game; the last card stays black. At the proponent's word the
game does not say whether he was at Tanay, whether Gómez knew, or what
became of Montalan and Villafuerte. Nanay's fate stays unknown. Its
paintings and new people are owed (ART.md).

Enemies are content: content/enemies.js describes each kind
once (bantay, kawal, the three siga of the opening, Act II's sundalo,
Act III's amerikano, sentinela and konstable, and Act IV's
bantay-konstable) and scenes place them by type.

Art: Macario's idle, walk, jump, punch and shot are the artist's; so
are the street paintings, the inside of the entablado, the Mananahi,
and the stills of the bantay, the three siga, the direktor, the
Katipunero and the Kasama. The proponent drew Kabayo, Nanay, the
Kutsero, the Barbero, Maryam, the Sultan, the kawal, the Mabalasig and
the three who take the pamphlets (Blocks 100 to 102). Since Block 113
the people who return in Acts II to IV are described once, in
content/people.js. Characters drawn
side on or three-quarter move, their motion made from the one still by
tools (animate-bantay.js, animate-kabayo.js, and animate-still.js with a
rig each); those drawn facing the front stand still. Nothing is drawn
in code. Still owed (ART.md): fifty-two pictures, Act I's three (the
Barbero's chair, the Mananahi's sewing table, the pulungan's painting),
Act II's fifteen, Act III's sixteen and Act IV's eighteen. No picture is made or borrowed
for what is not drawn (CLAUDE.md, Conventions).

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
fault, on 4 Oct 2026 Blocks 98 to 112, and on 5 Oct 2026 Blocks 113
to 118.

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
1 Oct 2026, Blocks 98 to 112 on 4 Oct 2026, Blocks 113 to 118 on 5
Oct 2026. Open:

    Block 123, the overnight pass. Dashboard (teacher.html): Ave.
      post-test reads "n = ..., first attempt". The questions editor
      still saves (Saved...) and the test plays. Act II (?dev=1,
      Pugad Lawin): Bonifacio says "Sa susunod na linggo". Act III
      (?dev=1, the barbershop): "Kanina pa raw siya naghihintay." after
      the American's first line, a thought giving his verdict after
      the cut, "At sa akin na raw ang sukli."; the raid: "Itaas daw ang
      kamay. Huwag gagalaw." The pre-test on the phone: the four
      answers two to a row, Susunod visible without scrolling. Login on
      the phone as usual: no change
      to see (the failure path is the harness's, section BU). Failure:
      an English line with no Tagalog after it, a question save that
      says Saved and changes nothing, or a student opening in the wrong
      act.

    Block 121, the audit. Act I: no coins button until Nanay has her
      savings; after, the coins open Tindahan with three: Dahon ng
      Lagundi (5), Anting-anting (50), Pinong Pulbura (90), each tile
      a symbol, no picture. Buy and wear the anting-anting: four hearts.
      (Block 122) Settings as a student: Palitan ang password asks
      for the current one first; a wrong one says "Mali ang kasalukuyan
      mong password." and changes nothing.
      Act IV (?dev=1, Malabon): chase an enemy of the first wave far to
      the right; when it falls, the next wave comes where he stands, no
      "pumunta sa kanan" pulling him back. Act II to
      IV as a student with no questions written: "Walang pagsusulit"
      before the act, nothing after it. Failure: a shop button in Act I
      before the gift, a coins button that opens empty, a fight that
      waits behind him, or a password changed without the current one.

    Block 120, the pacing pass. Act II ("Pauwi kay Nanay"): the press
      door is now between the Mananahi and the tabakera, the walks
      shorter; at the Nangka ("Ilog Nangka") the soldiers go for the
      scarecrows, which topple after two blows; Laguna's end, the
      messenger's paper, Jacinto reading Paris aloud. Act III: in the
      town, Isko tells of Palanan; at Calle Gunao ("ang petisyon") two
      sign, the law arrives, and the Guro ("ang huling pirma") refuses;
      the second door at night does not answer; after the raid, a cell
      in Bilibid ("ang amnestiya"), the guard, and the gate on the right;
      at Morong the soldiers stand by the flag, and in the last fight a
      Constable reaching the flag hacks at it (eight blows and the wave
      starts again). Act IV: the bell rings (no card), Montalan comes
      out, the three watchmen fire; the fight moves right to the fence
      with "Lumaban palabas" at the top of the log; Tanay's line of three
      ("Sanayin"), a row of figures saluting; Malabon pushes right into
      the plaza; Manila shows six dashed townspeople and the Kutsero with
      Kabayo at about the Mananahi. Failure: a fight that never moves
      on, a decoy that never falls or never stands again, a black card
      where a scene should be, or a line said behind black.
    Block 119, Act IV. ?dev=1 lists thirteen points under Ang Mapait
      na Ani; each opens its place with its task in the log. From Ang
      simula: "Marso 18, 1903" at Morong, sign the order at the table;
      Montalan, "Makikita mo rin"; the post at night, three guards, the
      storeroom at the left end, the bell and fifteen in four waves;
      April 1904, the Manlilimbag's press (the work game, once);
      Di-Masalang, three taught for Tanay (the hair kept under the hat),
      the cards saying the record does not say whether he went; Malabon,
      fifteen; the woman of Cavite and the rice; 1906, Gómez and the three
      terms; Manila, the crowd, Isko and his son, the Kutsero's
      "Sumakay"; the toast broken at "At sa araw na—"; Bilibid (a stone
      floor), Montalan; the court, "Hindi ako nagkasala", the plea
      changed on black, the sentence; 1907, the window, the election
      heard; the last night; the yard: walk him to the scaffold yourself,
      his statement, the cards, "Wakas ng Ikaapat na Yugto", and the
      screen stays black under the end card (a guest: Wakas, back to the
      title). New people and places are dashed boxes or dark walls:
      expected. Failure: Macario anywhere a [CONTEXT] event happens, an
      English line with no Tagalog after it, a black screen with nothing
      happening (before the end), the scaffold reached with nothing
      said, or the scene coming back after the last card.

Still to watch, in the pilot rather than on
one phone: whether the work game's green patch is too thin by the fifth
stroke, and whether students find the Kasama and the three who take
the pamphlets from what they are told (beats and crates are
PAMPHLET_GUARDS in content/act1.js).

2. Act I's lines, years and papers: accepted by the proponents on 4 Oct
2026 (Block 113). Nothing open in Act I.

3. The proponents' review of Act II: every line marked + in STORY.md,
Act II (PLACEHOLDER in content/act2.js), the names ours gave (Isko, the
Manlilimbag, the Tagapagbalita), Bonifacio's and Jacinto's words, and
Act II's three Talaan papers, against the source book (STORY.md, Open
questions). And Act III's (Block 117) the same way: every + line, the
Americans' English, Bonifacio's three precepts as taught, Aguinaldo's
proclamation and the Sedition Law in our words, the names ours gave and
the Talaan's papers (STORY.md, Open questions). And Act IV's (Block
119): every + line, Sakay's last statement in our Tagalog, Gómez's and
Van Schaick's words, the names ours gave and the Talaan's papers
(STORY.md, Open questions).

4. The test questions: not ours. Teachers write and change them on the
dashboard (CLAUDE.md, Standing decisions); nothing here tracks them.

5. Art from the artist: ART.md's Owed list, fifty-two pictures since
Block 120 (Act I's three: the pulungan's painting, the Mananahi's
sewing table and the Barbero's chair; Act II's fifteen: seven
paintings, Isko, Jacinto, Bonifacio, a printer, a messenger, the press,
the straw and the scarecrow; Act III's sixteen: five paintings,
Álvarez, Poblete, Carreón, Montalan, a teacher, an American officer,
the American in the barber's chair, the stranger in Nanay's house, the
Katagalugan's flag, the American soldier and the Constabulary; Act
IV's eighteen: seven paintings, Gómez, Van Schaick, Villafuerte, de
Vega, the judge, a Bilibid guard, a woman of Cavite, Isko's son, the
Katagalugan's fighter, and since Block 120 two townspeople for the
crowd in Manila). PNGs with transparency; each goes through ART.md's steps.
A character delivered as one still rather than a sheet is animated by
the tool (CLAUDE.md, Animating a character from one still): ask the
artist for the whole figure side on, standing, arms free of the body.

6. Then the remaining polish and the pilot. All four acts are written
(Block 119).

7. The Scan list (2 Oct 2026, below): worked in Block 110. Left: run
reset_test_accounts.sql before a full-flow test (S37; it deletes the
test accounts' play, so on the proponent's word), and S39 to S41 as
listed there.

8. Privacy of the public repository (30 Sep 2026). Done: the names of
the team, the resource person and the school are out of every tracked
file, docs-private/ and *.pdf and *.docx are gitignored, and the two
private files were deleted from GitHub. Open: they and the names are
still in the git history (the proposal and the validation form in older
commits; older README versions), and every commit carries the author
name and email. Only a history rewrite and a force push purges them, and
the GitHub username stays in the repository's URL either way. The
proponent has not yet decided whether to rewrite the history.

## Polish list (Block 112)

Agreed 4 Oct 2026 ("fix all of them"): fourteen items from a scan of the
whole repository, for smooth work on Acts II to IV. #1 to #13
(COMPLETE); #14, leaked password protection, is a switch in the
Supabase dashboard (Authentication) for the proponent (NOT STARTED).
Why each was built as it was: DECISIONS.md, Block 112.

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

A read of every tracked file, 43 findings, worked in Block 110 (2 and 3
Oct 2026) at the proponent's word. What was built and why: DECISIONS.md,
Block 110. Status:

    S1 to S9     the bugs: the dashboard's performance, the quiz's      (COMPLETE)
                 Back label, a score kept offline, a guest's ending,
                 ?dev=1 with a student signed in, the shop button, a
                 replay's stage clothes, a script that throws, saves
                 out of order
    S10 to S12   the item bank                                          (DROPPED: the
                                                                        questions are the
                                                                        teacher's)
    S13 to S15   the dashboard: first post-test's gain, a warning      (COMPLETE)
                 before editing a test students have sat, CSV
    S16          the item bank                                          (DROPPED, as S10)
    S17 to S22   the page's name and language, the login in Tagalog,    (COMPLETE)
                 the controls list, the corner buttons (an exception,
                 recorded), Bumalik from the login, two repeat lines
                 (ours, + in STORY.md)
    S23 to S25   the apple game kept on purpose; intertitle.wav gone;   (COMPLETE)
                 blank lines
    S26 to S35   documents and comments brought up to date; the         (COMPLETE; the health
                 health check covers v5 to v7                           check NOT RUN)
    S36          CLAUDE.md: history moved to DECISIONS.md; the rest     (COMPLETE, a light
                 is the formats every session needs                     pass)
    S37          reset_test_accounts.sql not recorded as run            (BLOCKED: the
                                                                        proponent, Supabase)
    S38          Blocks 98 to 110 not seen on a phone                   (COMPLETE: reported
                                                                        working, 4 Oct 2026)
    S39          private files and names in the git history             (BLOCKED: the
                                                                        proponent's decision)
    S40          the owed pictures (three then, fifty-two since Block 120)  (BLOCKED: the artist)
    S41          the years, every + line, the Talaan papers, the        (the years, lines
                 written delegation, the pilot accounts                 and papers accepted
                                                                        4 Oct 2026; the
                                                                        delegation and the
                                                                        pilot accounts
                                                                        BLOCKED: the
                                                                        proponents)
    S42          music re-encoded, 3.9 MB to 2.9 MB; gabi.wav kept      (COMPLETE)
                 (an MP3 loop has a gap)
    S43          npm install turns the pre-commit hook on               (COMPLETE)

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

Data collection covers Act I. Acts II to IV are written (Blocks 113,
117, 119), but their lines wait on the proponents and they have no
questions of their own yet (the teacher's). Act I quality and the
assessment instrument therefore outrank Acts II to IV entirely.

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
    db/migrations/008_macario_schema_v8.sql    RUN, 3 Oct 2026, from the
                                        session (Supabase connector, at
                                        the proponent's word). Three
                                        functions no longer callable
                                        from the API
    db/migrations/009_macario_schema_v9.sql    RUN, 3 Oct 2026, the same.
                                        The six policy helpers moved to
                                        the schema private; what a
                                        student, the teacher and a
                                        visitor can see checked the same
                                        before and after
    db/migrations/010_macario_schema_v10.sql   RUN, 4 Oct 2026, the same.
                                        Two foreign-key indexes; 26
                                        policies read the signed-in user
                                        once per query. Reads for a
                                        student, the teacher and a
                                        visitor, and a student's own and
                                        refused writes, the same before
                                        and after

    db/seeds/macario_items_v3.sql              RUN, 28 Aug 2026
    db/seeds/enrollment_setup.sql              only for a fresh database
    db/scripts/db_healthcheck.sql              read-only, run any time.
                                        RUN 3 Oct 2026 from the session
                                        (Supabase connector): all twelve
                                        tables with RLS on, the v4 drops
                                        gone, every v3 to v6 column, the
                                        eight functions, the v6 and v7
                                        policies and the pre-test index
                                        present; 10 + 10 Act I items; one
                                        teacher, one student (in a class);
                                        one score, one session row
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
pulungan, and completes into its post-test (Block 80). Act II is
playable end to end, fourteen objectives in eight places (Block 113),
its art owed. Act III is playable end to end, fifteen objectives in
seven places (Blocks 117, 120), its art owed. Act IV is playable end to end,
thirteen objectives in nine places (Block 119), its art owed; its last
card ends the game.

Objective 2, gameplay mechanics: dynamic difficulty, health, equipment,
cosmetic rewards. (IN PROGRESS) All four are built and tested against
the harness fixture. The shipped acts use health (every fight) and
difficulty (guard speed 1.00 to 1.45 across Acts I to IV). Equipment
ships: the two story outfits (Blocks 82, 117), and since Block 121 the
corner shop sells three items bought with barya, the lagundi (a heal),
the anting-anting (a fourth heart) and the pulbura (a faster shot),
open once Act I's savings are given. No cosmetic is sold: one worn
without its sheets would draw Macario as the placeholder box, so two
outfits are asked of the artist (ART.md, Wanted) and go on sale when
drawn. What remains is art, not code.

Stated for the defense (Block 121): since schema 006 (Block 68, the
instructor's decision) a signed-in student can read the answer key
(assessment_items, correct_index) through the database's public API
with the browser's console. Scores are select and insert only, so
none can be changed; the key is readable so the teacher can edit
questions on the dashboard and the game can grade itself.

Objective 3, integrated assessment. (COMPLETE) Pre-tests and post-tests
graded in the game (Block 68, with a pass mark and a replay for a failed
post-test), in-game performance scoring, optional feedback, and the
teacher dashboard, which also edits the questions and the Talaan papers.
Act I's items are seeded and built in (content/questions.js).

## Functional requirements

The paper specifies seventeen.

| Requirement | Status |
|---|---|
| User Authentication | (CHANGED) Login and role routing built. Self-registration deliberately not built; accounts are administrator-created. Play-as-guest: every act, one into the next, with nothing saved and no tests (Block 116). A student can change the password in settings, giving the current one first (Block 122) |
| Chapter Progression | (BUILT) All four acts registered and unlock in order. All four acts playable to their ends (fourteen objectives in Acts I and II, fifteen in Act III, thirteen in Act IV), completing into their post-tests (an act with no questions skips its tests, saying so once); a guest plays on from act to act to the end of Act IV |
| Player Movement | (BUILT) Walk, run, jump with coyote time and a buffer |
| Combat Mechanics | (BUILT) Punch on a tap, takedown from behind, a shot on a hold, each animated; enemies that fight back; blows with a flash, slide, stagger, topple and fade for every body. Act I ships a dash through the enemy, the opening fight with the three siga and the play's fight (four soldiers, real walk and sword art); the pamphlet run's guards can be taken down from behind. Acts II to IV have two battles of fifteen each, in waves, some with decoys to defend or ground to take (Block 120) |
| Stealth Mechanics | (BUILT) Patrols, a detection meter, a sight cone, hide spots, platforms out of sight, guards that turn hostile and shoot. Act I's pamphlet run uses patrols, the meter, the cone, crates and catches; Acts II to IV add long stealth runs with checkpoints and riflemen who fire (the sentinela, the Constabulary on guard) |
| Interaction System | (BUILT) Dialogue, gifts, NPC reach edge to edge, scenery to use (the sewing table), the work game and the barber's haircut (Block 114), tutorials that wait for the task, NPCs that open the shop |
| Narrative Delivery | (BUILT) Scene scripts that play by themselves, black cards, arrival dialogues. All four acts use them; the lines of Acts II to IV await the proponents' review |
| Dynamic Difficulty | (BUILT) Guard and enemy speed scaled by act, 1.00 to 1.45. Verified against the harness fixture; seen in Act II (1.15) since Block 113, Act III (1.30) and Act IV (1.45) |
| Health System | (BUILT) Health, damage, invulnerability, respawn without a game over, hazards, heart pickups, healing items (the lagundi, sold since Block 121) |
| Equipment System | (BUILT) Sandata, Anting-anting and Damit slots, stacking consumables, quest items, granting and buying, stock per seller. The story hands over the stage clothes (Block 82) and Act III's disguise (Block 117), each slowing detection while still; the corner shop sells the lagundi, the anting-anting (a fourth heart) and the pulbura (a faster shot) since Block 121; the rest verified against the fixture |
| Cosmetic Reward | (BUILT) Currency awarded per act and scaled by performance, a shop, the Damit slot and sprite swap. No cosmetic outfit ships until the artist draws one (two asked for, ART.md, Wanted); verified against the fixture |
| Trivia | (BUILT) Act I built in and editable; Acts II to IV have none yet (the teacher's, on the dashboard) |
| Act Assessment | (BUILT) Act I built in and editable; a 75% pass mark and a replay before another post-test try. Acts II to IV have none yet (the teacher's) |
| Performance Scoring | (BUILT) Weighted sum, 50 completion and 25 each for survival and stealth. Time recorded, not scored |
| Progress Tracking | (BUILT) Completion, scores and attempts, damage taken, detections, play time |
| Teacher Monitoring | (BUILT) Class roster and summary per class, scoped by RLS, searchable and sortable; basic summaries, no charts, by decision. Also the questions editor and the Talaan papers |
| Data Synchronization | (CHANGED) Writes go straight to Supabase and a student's login and save require a connection. A test score that cannot be sent is kept on the phone and sent at the next login (Scan S3), and a failed save is sent again by the autosave (Block 121); there is no offline queue for play, so "upon internet availability" is met for scores only. Since Block 105 the game itself is kept on the phone after one visit and a guest can play with no internet |

## Non-functional requirements

The paper specifies ten.

| Requirement | Status |
|---|---|
| Performance | (BUILT) No build step, no framework, plain script tags. The loop writes to the page only on a change; the phone was confirmed smooth after Block 36. Pictures are JPEG where they can be and sheets 256-colour PNGs; the whole game is kept on the phone after the first visit. The six battles of fifteen (Acts II to IV) measured on 6 Oct 2026 with the CPU slowed six times: a steady 60 frames a second, none over 33 ms |
| Reliability | (BUILT) Debounced save, ten second autosave that also resends a save that failed (Block 121), beforeunload and logout flushes. A loader that retries every picture until it arrives |
| Usability | (BUILT) Tagalog throughout the game; the teacher dashboard in English. Touch targets 44px on glass, icons beside every label, a three-step text size, a rotate notice in portrait. No guide arrow, by decision |
| Accessibility | (BUILT) Runs in Chrome on Android, confirmed on a real device |
| Online Functionality | (BUILT) A guest can also play with no internet once the game is kept on the phone (Block 105) |
| Compatibility | (PARTIAL) Confirmed on one Android phone. The harness proves the layout at 823 by 412 and 740 by 360 |
| Maintainability | (BUILT) Layers with a strict dependency direction, documented in CLAUDE.md, and two suites (833 and 514 checks), run in pieces side by side (Block 115). Characters animated from one still by one tool and a rig each |
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
    109 generated stand-ins for the chair and the sewing table (an image
        model through Hugging Face); reverted the same day at the
        proponent's word, white edges left and not the game's look
    110 the Scan list: the nine bugs, the dashboard (gain, CSV, a
        warning before editing a sat test), the login in Tagalog and its
        way back, two repeat lines, documents, smaller music, the hook
    111 the live database: three functions closed to the API (v8), the
        policy helpers moved to a private schema (v9), guardrails
    112 the polish list: every act on the dashboard, in ?dev=1 and in
        the checks; a content check; Writing a new act; a scene's own
        road; speakers and Talaan places in content; CI annotations and
        pins; dead CSS removed; policies read faster (v10)
    113 Act II, 1896 to 1898, end to end, rebuilt the same day as a
        tragedy (Nanay unprotected and never found, the Kasama killed,
        four long stealth stretches, fifteen soldiers at San Juan del
        Monte); the frozen black end fixed; checkpoints that mark
        themselves; Act I's play ends in the kingdom's fall; the
        detection meter twice as fast; Act I's lines accepted;
        content/people.js; the sundalo; no watered-down narratives
    114 a floor for each place (floorboards, bamboo, grass, drawn by
        the engine); each job played once, 8 to 12 barya; the barber's
        game a haircut on a customer drawn in pixels, its lines
        rewritten; the order game removed
    115 testing in minutes: verify_new_scene.js in eight parts
        (--only, --list), the story fast-forwarded ten times under test
        (TEST_SPEED, never for a student), readings by condition not by
        fixed pauses, run.js running both suites in pieces side by side
        (about two minutes for all 1,154 checks, from about fifteen),
        CI in four parallel shards
    116 a guest who finishes an act plays on into the next written one
        (Act I into Act II), with no tests and nothing saved
    117 Act III, 1899 to 1902, end to end: Santa Mesa and fifteen
        Americans, Tondo under guard in Maryam's disguise, the haircut on
        an American, the creed taught, Isko's surrender, the Sedition Law,
        the capture at an oath, the Republika ng Katagalugan and the vow,
        the Constabulary; the Americans in English with the Tagalog after;
        the haircut's customer
    118 Act III revised against the proponent's labelled sources: Santa
        Mesa only heard of, the founding of the Partido Nacionalista and
        Macario its Secretary-General, the Sedition Law from a notice,
        President and Generalissimo and the flag; beats tagged; no
        borrowed or made art (the tint removed, fighters placeholders)
    119 Act IV, 1903 to 1907, end to end, from the proponent's labelled
        sources: the order, the post, the manifesto, Tanay, Malabon, the
        hunger, Gómez, Manila, the reception, Bilibid, the court, the
        window, the last morning; two battles of fifteen; the stone floor
    120 the pacing pass (all twelve approved): cards made scenes (the
        post's bell heard, Bilibid's amnesty in a cell, Paris read in
        Laguna, Palanan told by Isko); the press door nearer home, the
        Kutsero nearer in Manila, the Mananahi sending him to the house;
        the law mid-petition and the last name refused, an empty house,
        Tanay's drill; the scarecrows and the flag as decoys, the fights
        out of the post and into Malabon's plaza; the crowd and the
        Republic's soldiers seen (setDecoys, advanceTo, rouseGuards)
    121 the audit of 5 Oct 2026 (all fifteen approved): advanceTo's
        direction the content's, its run checkpoints passed; the shop's
        stock (lagundi, anting-anting, pulbura), shut while an act saves
        toward a sum, no barya back on a replay; a failed save retried;
        givenInAct; a missing act_progress row; one "Walang
        pagsusulit"; the password for test accounts only; the answer
        key stated; an old Act III save; caughtBy in the grace window;
        the reset's kept scores; the CSV's formulas; an NPC's img
        through loadImage; CI pinned and checking Markdown
    122 the password change for every student again (a panelist's
        suggestion), the current password asked first; the trackers
        read through against the build
    123 an overnight pass: the release run at a student's speed green
        again (checks, not the game), the dashboard's post-test average
        of first attempts, a question save that cannot empty a test,
        "sa susunod na linggo" in Act II, five English lines of Act III
        given their Tagalog; a login that cannot read the save or the
        acts tries again, then stops, never guessing the act

## Blocks remaining

Act I's lines and history checked by the proponents. (COMPLETE, 4 Oct
2026)

Act II's, Act III's and Act IV's lines checked by the proponents (Next
action, 3). (NOT STARTED)

Act II written (Block 113). (COMPLETE) Act III written (Block 117).
(COMPLETE) Act IV written (Block 119). (COMPLETE) An act without questions skips its
tests, saying so once (Block 121), which is deliberate; the questions are the
teacher's.

Real items for Sandata, Anting-anting and Damit: three sold since Block
121 (COMPLETE). Cosmetic outfits: two asked of the artist (ART.md,
Wanted), on sale once drawn (BLOCKED, the artist).

The feel pass, agreed 30 Sep 2026: twelve items, all (COMPLETE) in
Block 85 except two. The item bank, one of them, is the teacher's
(Block 110). Act I's people are all drawn since Block 102; what is still owed,
fifty-two pictures across the four acts, is ART.md's list (BLOCKED, the
artist). The list: DECISIONS.md,
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
minute a push is still deploying can be kept under the new ?v=; any
change to that file's bytes, then prepare.js and a push, gives it a new
fingerprint and fixes it (Block 106). Before a class or a presentation, open the
game once on good wifi on every device and wait for the green line.
(FIX BUILT, NOT SEEN ON DEVICE)

A phone that kept an old index.html keeps asking for old files. Since
Block 62 the service worker asks the network for the page first, which
ends it once a phone has the new page. Test from a private tab, or clear
the site's data, before suspecting the code. Since Block 106 every
changed file's ?v= is its fingerprint, written by prepare.js and
checked by the hook and CI. (KNOWN, BY DESIGN OF PAGES)

Only one phone has been tested, a 4GB Android device. The harness covers
823 by 412 and 740 by 360 in landscape, a floor rather than a survey.
(PARTIAL)

Dynamic difficulty is seen from Act II on (Block 113): its guards and
soldiers move at 1.15 times Act I's speed. Act I is the 1.00 multiplier;
the harness proves the formula against a fabricated act too. (BY DESIGN)

On a PC the animation looks slightly uneven; students play on phones,
where it is smooth. (KNOWN, OUT OF SCOPE)

The teacher dashboard is deliberately not in the game's pixel theme: a
light report page for laptops and projectors. (BY DESIGN)

## Deferred

The game_progress.is_night column is no longer written (Block 91); it can
be dropped in a later migration. A student-facing join screen (join_code exists; classes are assigned by
the administrator). Multiple save slots. Per-question item analysis
(the roster exports as CSV since Block 110). An offline queue for a
student's saves, and save conflicts (a guest plays offline since Block
105, and a test score can wait on the phone since Block 110; a
student's play still needs the internet). Persisting
partial test answers (a reload mid-test asks the questions again;
nothing is recorded until submission, so nothing is lost).

## Verification

Since Block 104 GitHub Actions runs both suites on every push to main
that changes anything but Markdown (.github/workflows/tests.yml), and
since Block 121 its checks on a Markdown-only push too; since
Block 115 in pieces over four machines, about two and a half minutes.
The commit shows a green tick or a red cross, and the Actions tab says
which check failed. Locally, run the pieces a change touches while
building, and both in full at a student's speed before a release to
students (CLAUDE.md, Deployment, Testing a push).

From the repository root:

    npm install
    node _dev/tools/prepare.js              before every commit, a second
    node _dev/tests/run.js                  both suites, in pieces, side by side
    node _dev/tests/run.js verify:act2 test:BR    only those pieces
    node _dev/tests/run.js --real           at a student's speed (a release)
    node _dev/tests/test.js --only=BD,BL    one suite's sections; --list
    node _dev/tests/verify_new_scene.js --only=act1   its parts; --list

CI runs prepare.js --check first, in seconds, and the suites only once
it passes (Block 106).

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

npx playwright install chromium --dry-run prints both numbers for the
Playwright package.json pins, and the harness says which path
it wanted if it is still missing. A Playwright update needs it again.
There run.js runs everything in about two minutes, and at a student's
speed (--real) in about four and a half. Last full run at a student's
speed: 6 Oct 2026, 1,346 passed, 0 failed (Block 123, after its last change). Random play from
every story point (node _dev/tools/monkey.js, Block 123): 6 Oct 2026,
three seeds, 150 runs, no error. Worth a run before the pilot too.

test.js (833 checks) drives the shipping index.html with a stubbed
Supabase client in headless Chromium at 823 by 412, phone landscape,
against its own fixture act and item catalogue, so every engine system
stays tested whatever Act I ships. Its sections are the inventory of
what is covered. verify_new_scene.js (514 checks, ten parts) drives
the real content: Act I end to end as a student, to the post-test
opening; Acts II, III and IV end to end as a guest; reloads mid-beat, old saves, a
guest going on from Act I into Act II, every story point of ?dev=1 and
its floor; and checks that every line of the content is in STORY.md,
that ART.md's Owed list matches the disk, that the asset manifest
matches assets/ and every picture in it opens, and that every sheet has
been through shrink-sprites.js. Anything other than "0 failed" is a
regression. Under test the story runs ten times faster (Block 115);
the world a student plays against does not. Two old flakes are fixed:
the pamphlet guard catch (Block 93: the check starts from full health)
and the enemy's red ! (Block 115: watched by every class change, not a
poll a busy machine can starve). A failure that passes on a rerun is
still worth a look. Neither suite ever touches the live project.

A check that clicks, or reads pixels, is worth more than one that reads
a style (the dead Atake button would have passed any style assertion).
Add checks in the same block that adds the system. Three checks protect
the study rather than the code: complete runs before the feedback form,
and an act still completes with the feedback module or inventory.js
absent. The harness is not a substitute for a device pass, and cannot
tell whether a sound is too loud.

In a cloud sandbox, npm install --no-save playwright@1.56 matches its
preinstalled Chromium; package.json pins 1.62.1 exactly (Polish list
#9), the version CI and the proponent's computer run. The pitfalls the suites were built around are
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

Document grading honestly (stated in DECISIONS.md, Block 121, and under
Objective 2, above): since Block 68 the game grades the tests
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
