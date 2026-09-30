# STORY.md

The plot of MACARIO: what happens, where, to whom, and every line that
is said. A session that is about to write or change story reads this
file first; a proponent who wants to know what a student sees reads it
instead of the code.

The context files, and they do not overlap (ART.md, since Block 77,
lists the art still owed for the people and places below):

    CLAUDE.md     how the thing is built. Architecture, conventions
                  (including how dialogue is written), data formats.
                  Changes rarely. Why it is built that way, block by
                  block, is DECISIONS.md.
    TRACKER.md    where the build is. Status, next action, what has
                  been run, what is blocked. Changes every session.
    STORY.md      what the story is. Scenes, places, people, beats,
                  interactions and the script. Changes whenever the
                  story does.

This file says what happens, not how it is built and not whether it is
finished. Flags, positions and scene ids appear only so a reader can
find the beat in content/act1.js; how a mechanic works is CLAUDE.md's,
and what is owed or broken is TRACKER.md's.

content/act1.js is what ships. This file is its script, and the two are
changed together, in the same change, or the story is wrong in one of
them. verify_new_scene.js checks that every line of dialogue and every
black card in content/act1.js appears here word for word, and fails if
one does not.

How to read the script:

    Speaker: line          the proponents' own line, as given
  + Speaker: line          ours, marked PLACEHOLDER in content/act1.js,
                           until the proponents accept or replace it
    [BLACK] line           a black card (playIntertitle)
    [HINT] Title: text     a hint for the post-test, found on the road
    (stage direction)      what happens, not what is said

Lines of ours are written to the standard in CLAUDE.md, Conventions,
Writing dialogue. The proponents' lines are never rewritten to match
ours. Since Block 93 their spelling and grammar are corrected, at their
request, with the wording and the meaning kept (po rather than 'ho,
'Nay, rin and rito after a vowel, 'yung, no "Okay").

Last updated: 30 Sep 2026, Block 93 (the proponents' early lines
corrected; Nanay comes to Macario wherever the fight left him, walking
on a placeholder until her walk sheet arrives; the tahian is seen;
Macario walks back to his mark before the Sultan returns; the way out of
the entablado and the pulungan is said in the log). Before that, Block 92 (tutorials that stop the world until
the task is done: walking and jumping after the opening thought, Atake in
the opening fight, the first red !, talking, and the bag after the stage
clothes; the savings step is also pinned in the log). Before that, Block 89 (the work is there to be done, not
staged: the horse to groom and the sewing, each repeatable for barya; the
Mananahi stopping Macario to send him to the direktor is the one script;
the apple quest, the two customers' deliveries and both paydays are gone).
Before that, Block 87 (the opening ends in a fight with the
three siga before Nanay comes; the siga's laugh after Nanay's first line
is gone, since they are beaten). Before that, Block 85 (the feel pass: night on the
run, the crowd heard, the rite trimmed and broken with movement, the
Mananahi at the play). Before that, 29 Sep 2026, Block 83 (the opening is Tondo, 1890, at
the proponent's direction, so the four-year cut names Tondo, 1894).
Before that, Block 82 (the direktor's stage clothes for
the walk home; the leap over the fire shown, not told). Before that,
Block 81 (the play and the rite checked
against the histories: a komedya battle and an ad-lib, the Mabalasig,
the blindfold, the warning, the ordeal; guardia civil on the pamphlet
run, which now starts from the back door). Before that, Block 80 (the
end of Act I: four years on,
Principe Baldovino, the Katipunan, the oath and the pamphlets; beats 11
to 15). Before that, 28 Sep 2026, Block 74 (the guards' room is reached
only from a Test Room button in settings, recorded under its own
heading). Before that, 25 Sep 2026, Block 70 (the Talaan's papers are
the teacher's, at three fixed places on the street).

## The story in brief

Act I, Ang Pinagmulan ni Macario. Tondo, 1890. A boy teased about the
father who never came back learns that his mother spent the last of
their money on her cedula, and goes out to earn. He takes work where it
is, grooming a kutsero's horse and helping a mananahi sew, as often as he
likes for a few barya a time, until she stops him and sends him with the
theatre company's costumes, and he walks
into their crisis: their lead actor is sick and the
house is full. The costume he carried fits him. He goes on, forgets his
first line, adds one of his own, wins the stage fight, and walks off to
a standing crowd and an offer to join the company. He brings the money
home to his mother.

Four years on he is the company's lead, playing Principe Baldovino. He
wins its battle and adds a line of his own, as on his first night, and
this one ("Walang bayang mananatiling alipin...") is heard by two men of
the Katipunan. They find him in the wings and ask whether he is sure he
wants to join; he thinks of his mother and the cedula, and says he is.
He says their password to the one waiting on the street, is taken
blindfolded to a secret room, and goes through the rite: the warning,
the Mabalasig, the three questions, the leap over the fire, the oath in
blood. He is sent out the back with pamphlets for three people, past
guardia civil on their rounds. The third handed over ends Act I, and
the post-test follows.

Acts II to IV are not written. Their content files are registered stubs
(content/act2.js to act4.js) and hold no story.

## Places

Act I has three.

tondo, the street. One long road, 14500 wide, ten paintings of the town
end to end (street-01 to 04 in order, twice, then 01 and 02), a palm or
a tree in silhouette over each join between two paintings. Everyone in
Act I lives on it, left to right:

    x 900      where Macario stands when the game opens
    x 2000     Nanay, where she and Macario walk to in the opening
    x 3300     the Kutsero
    x 3560     his white horse, Kabayo (used with E, not talked to)
    x 4800     the mangingisda (four years on, once Macario is sworn in)
    x 6400     the Mananahi (from the first play until the four years,
               outside the entablado instead, at x 13250)
    x 6540     her tahian, the sewing (scenery, used with E)
    x 6900     the tabakera (as the mangingisda)
    x 10600    the karpintero (as the mangingisda)
    x 12500    the Kasama (four years on, once the Katipunan has found
               Macario in the wings)
    x 13600    the direktor, at the far end, by the entablado

The siga are not on the street after the opening: they walk on behind
Macario at the very start and are gone when he walks off with Nanay.
Everyone else stays through the four years.

entablado, inside the theatre. One painting of a stage (curtains, a
painted backdrop of a Moorish city by the sea), one phone screen wide,
1180. The direktor stands in the left wing (x 60), Maryam on the stage
(x 300); the Sultan and his soldiers come from the right wing; the way
out, Lumabas, is at the right edge and leads back to the street beside
the direktor. It is reached only with the direktor, once, and four
years later by the black card, into Principe Baldovino.

pulungan, the Katipunan's secret room. One screen wide, 1180. The way
out, Lumabas sa likod, is on the left and stays shut until he is sworn
in; the Kasama stands by it (x 300), the Mabalasig (x 760) and the
Katipunero (x 920) at the far end. It is reached only with the Kasama,
once, and its back way leads onto the street at x 4100, short of the
mangingisda. Its painting is owed: until it arrives it is a dark wall
with the file name on it.

## Cast

    Macario        the boy, the player. Real art (idle, walk, jump,
                   punch, shooting).
    Nanay          his mother. Real art standing; walks as a
                   placeholder box (nanay-walk.png, owed, Block 93).
    Mga Siga       three street toughs, drawn in code (Block 72,
                   draw-siga.js), each with an idle and a walk: the
                   leader in a red panyo with a stalk of grass in his
                   teeth (siga-1, the one who speaks), a big one in a
                   buri hat and an open white camisa (siga-2), and a
                   small one in an ochre shirt too big for him
                   (siga-3). One speaks alone ("Siga"), all three laugh
                   ("Mga Siga").
    Kutsero        a carriage driver, Macario's first employer. Real art.
    Kabayo         the kutsero's white horse. Real art.
    Mananahi       a seamstress, his second employer. Placeholder box
                   (mananahi.png).
    Direktor       head of the theatre company. Placeholder box
                   (direktor.png), on the street and on the stage.
    Julian         the company's lead actor. Never seen: sick with a
                   fever, which is the whole of his part.
    Maryam         the company's leading lady; plays the princess.
                   Real art.
    Sultan         in the play, Maryam's father. Real art (the old
                   moro-moro's walk sheet).
    Mga Kawal      in the play, the Sultan's four soldiers. Real art
                   (walk and sword sheets).
    Mga Manonood   the audience. Heard, never seen.
    Katipunero     the older of two men of the Katipunan who find
                   Macario in the wings, and at his oath. Placeholder
                   box (katipunero.png).
    Kasama         his companion, who gives Macario the password, waits
                   for him on the street and leads him in. Placeholder
                   box (kasama.png).
    Mabalasig      the "terrible brother" who conducted a recruit's
                   rite: he swears Macario in and gives him the
                   pamphlets. A role from the histories, not a named
                   person. Placeholder box (mabalasig.png). (Block 80's
                   Pangulo, renamed in Block 81.)
    Mangingisda,   the three who take the pamphlets: a fisherman, a
    Tabakera,      woman from the cigar factory and a carpenter.
    Karpintero     Placeholder boxes (mangingisda.png, tabakera.png,
                   karpintero.png).
    Guardia civil  three bantay on the street, on the pamphlet run
                   only. Real art (the bantay of the enemy catalogue).

Names and roles marked as ours: Julian, Don
Rodrigo (the part Macario plays), the Sultan, and every person of
Block 80 (the Katipunero, the Kasama and the three). The proponents
may rename any of them. Principe Baldovino is a real komedya and a part
Sakay is recorded as having played; what happens in it here is ours.

## Act I, beat by beat

The quest log shows one task at a time; the task each beat completes
is named at its end. Barya is Macario's money; the savings count
toward 100.

### 1. The opening

tondo, x 900. Plays by itself the first time a student enters Act I.

    [BLACK] Tondo, 1890
    [BLACK] Kung saan nagsimula ang buhay ni Macario

    (Macario stands alone, facing right. The three siga walk up
    behind him from the left. He turns to face them.)

    Siga: Ano, Macario? Hinihintay mo pa rin ang tatay mo?
    Mga Siga: BAHAHAHAHAHAHA!
    Macario: Isara mo 'yang bunganga mo!

    (Block 87. The insult ends in a fight. The three siga step out of
    the scenery and come at him; the student fights them, with the fight
    music and the hearts showing: "Pindutin ang Atake para lumaban!".
    A tap sends Macario sliding through the nearest one, so how far off
    he taps decides where it leaves him. When the last one falls the
    music goes back to calm, and:)

    (Nanay comes in from the right, from just past the edge of the
    screen, and stops a step in front of him, wherever the fight left
    him (Block 93). He turns to her. She walks on the placeholder of
    her owed walk sheet.)

    Nanay: Macario, umuwi na tayo. May kailangan akong sabihin sa'yo.
    Nanay: Tama na 'yan, anak. Huwag mo na silang pansinin.

    (Block 93. Her line was "Wag mo pansinin yung mga yan", said
    before Block 87 put a fight in front of it; it now ends the fight
    rather than a taunt.)
    Macario: Tsk.

    (He and Nanay walk off together to the right, to x 2000, and the
    siga are left behind. There, outside:)

    Macario: 'Nay, ano po ba 'yung sasabihin n'yo?
    Nanay: Macario, anak, naubos na 'yung pera natin sa pagbili ko ng cedula...
    Nanay: Wala na tayong pambili ng bigas. Humingi na lang ako ng ulam sa kapitbahay para sa hapunan natin ngayon...
    Nanay: Pasensya ka na, anak, ha?
    Macario: Ayos lang po, 'Nay. Magtatrabaho na po ako para makatulong sa inyo.
    Nanay: Sigurado ka ba diyan, 'nak?
    Macario: Opo, 'Nay. Ako na po ang bahala.

    Macario (sa isip): Kailangan ko ng pera para matulungan si Nanay. Saan kaya ako makakahanap ng trabaho?

Completes: Umuwi kasama si Nanay. Nanay stays at x 2000 for the rest of
the act. A reload during the opening plays it again from the black
card; a reload after the talk plays only the thought.

### 2. The Kutsero

tondo, x 3300. Walk up and talk (Usap).

    Macario: Kutsero, maaari po ba akong magtrabaho rito?
    Kutsero: Macario? Mabuti naman at naisipan mong magtrabaho.
    Macario: Kailangan na po, e. Nangangailangan po si Nanay.
    Kutsero: O sige, magsimula ka na agad. Alagaan mo 'yung puting kabayo sa kuwadra.
  + Kutsero: Suklayin mo siya. Bawat linis na matapos mo, may bayad ka sa akin.

Completes: Maghanap ng trabaho: kausapin ang Kutsero.

### 3. The horse

tondo, x 3560, beside the Kutsero. Nothing is staged: the horse is
simply there, and the button reads Suklayin. Before the Kutsero has been
spoken to, Macario thinks it over instead:

  + Macario (sa isip): Kabayo ito ng Kutsero. Kausapin ko muna siya bago ko galawin.

Grooming is a small game (Block 89, game.js, playWorkGame): a marker
sweeps a bar, a green patch waits at a new place, and five strokes,
pressed with the button or E, are a round. The patch is thinner with
each stroke (Block 90), and over the horse a brush sweeps on a good
one while he shies from a bad one. Each good stroke is worth
more: a round pays 4 to 7 barya (5 good strokes pay 7, none pay 4), it
can be done again as often as he likes, and the Kutsero stops paying at
25 from this job. A round cut short pays nothing.

  + (the game) Kabayo / Suklayin siya kapag nasa berde ang guhit.
  + (a good stroke) Hiiiii!
  + (a missed one) Umiwas ang kabayo!
  + (the end) n/5 ang maayos. +n barya

Completes, with the first round: Alagaan ang kabayo ng Kutsero. Nothing
else waits on the horse; the job stays there.

### 4. The Kutsero, afterwards

  + Kutsero: Sapat na 'yan sa ngayon, Macario. Malinis na malinis na si Kabayo.

Said, with no game, once the horse has paid its 25. Before that, see
Repeat lines.

### 5. The Mananahi

tondo, x 6400. Talk, at any time after the first step: she does not wait
on the Kutsero.

    Macario: Mananahi, tumatanggap po ba kayo ng trabahador?
    Mananahi: Oo naman, Macario. Kumusta na ang inay mo?
    Macario: Ayos lang po. Nangangailangan lang po kami ng pera ngayon.
    Mananahi: O, sige, sige. Tara rito.
  + Mananahi: Nariyan ang tahian. Tulungan mo akong magtahi, may bayad ang bawat matapos mo.

Completes: Kausapin ang Mananahi.

### 6. The sewing, and being stopped

tondo, x 6540, beside her, at her table (tahian.png, owed: a
placeholder box until it is drawn, Block 93). The same game as the horse with the sewing's
words, the button reading Manahi, played by holding the button to fill
the bar and letting go over the green (Block 90), a cloth that gains a
stitch at each stroke; the same pay (4 to 7 a round, 25 in
all). Before she has been spoken to:

  + Macario (sa isip): Tahian ito ng Mananahi. Kausapin ko muna siya.

  + (the game) Pananahi / Hawakan ang pindutan, bitawan kapag nasa berde.
  + (a good stroke) Diretso ang tahi!
  + (a missed one, or held too long) Baluktot ang tahi! / Napatid ang sinulid!

The quest line counts the first two rounds (n/2). When the second is done
she stops him, the one thing here that is scripted:

  + Mananahi: Macario, teka! Ihinto mo muna 'yan.
  + Macario: Po? May mali po ba sa tahi ko?
  + Mananahi: Wala, wala. Nakalimutan ko lang ang mas mahalaga.
  + Mananahi: 'Yung mga damit ng direktor para sa palabas mamayang gabi. Kanina pa dapat nakarating 'yon.
  + Mananahi: Ikaw na ang magdala. Nasa dulo pa ng kalye ang entablado.
  + Macario: Sige po, ihahatid ko na ngayon.
  + Mananahi: Bilisan mo, ha. Huwag mong ibababa sa daan 'yan.

Completes: Tulungan ang Mananahi sa pananahi (2/2). With the costumes on
him the sewing waits:

  + Macario (sa isip): May dala akong damit para sa direktor. Ihahatid ko muna.

The direktor, at the far end, x 13600. The button reads Iabot ang damit,
offered once she has sent him:

  + Macario: Magandang hapon po. Padala po ng Mananahi, 'yung mga damit para sa palabas.
  + Direktor: Salamat sa Diyos, dumating din! Akin na, iho.

Completes, with the next beat: Ihatid ang mga damit sa direktor.

### 7. The missing actor

tondo, beside the direktor. Plays by itself straight after he takes
the costumes.

  + Direktor: Teka... nasaan na ba si Julian?
  + Direktor: Julian! JULIAN!
  + Macario: Sino po si Julian?
  + Direktor: 'Yung bida namin. Siya dapat ang gaganap na Don Rodrigo mamaya.
  + Direktor: Kaninang umaga pa siya hindi nagpapakita. Ang sabi ng kapatid niya, nilalagnat daw.
  + Direktor: Diyos ko... puno na ang mga upuan sa loob. Hindi ko puwedeng pauwiin ang mga tao.
  + Macario: Wala po bang ibang puwedeng pumalit sa kanya?
  + Direktor: Wala na. May kanya-kanyang papel na ang lahat ng artista ko.
  + Direktor: ...
  + Direktor: Iho, tumayo ka nga nang tuwid.
  + Macario: Po?
  + Direktor: Kasing-tangkad mo si Julian. Kasyang-kasya sa'yo 'yang damit na dinala mo.
  + Macario: Ako po? Naku, hindi po ako marunong umarte.
  + Direktor: Hindi mo kailangang maging magaling. Kailangan ko lang ng taong kayang tumayo sa entablado nang hindi tumatakbo palabas.
  + Direktor: Nasa gilid lang ako. Ibubulong ko sa'yo ang bawat linya. At babayaran kita, siyempre.
  + Macario (sa isip): Dagdag na pera para kay Nanay...
  + Macario: Sige po. Susubukan ko.
  + Direktor: Salamat, iho! Tara na sa loob, bago ka pa magbago ng isip!

    (The screen fades, and they are inside the entablado.)

Completes: Ihatid ang mga tinahing damit (3/3). A reload before
Macario says yes plays the scene again.

### 8. The play

entablado. Plays by itself on arrival. A moro-moro: two kingdoms at
war and a love across them, the kind of play Tondo's stages put on.

Backstage. (Macario enters on the right, facing Maryam.)

  + Maryam: Ikaw ba 'yung papalit kay Julian?
  + Macario: Opo. Macario po.
  + Maryam: Ako si Maryam. Ako ang prinsesa.
  + Maryam: Namumutla ka. Kinakabahan ka, 'no?
  + Macario: Hindi ko nga po alam ang kuwento.
  + Maryam: Madali lang. Magkasintahan tayo, pero magkaaway ang mga kaharian natin.
  + Maryam: Darating ang ama ko, ang Sultan, kasama ang mga kawal niya. Lalabanan mo sila.
  + Maryam: Kahoy lang ang mga espada. Basta huwag mong lakasan ang palo.
  + Macario: ...Sige po.
  + Direktor (pabulong): Pumuwesto na ang lahat! Bubuksan na ang telon!

  + [BLACK] Bumukas ang telon.

The first scene. (Macario on his mark beside Maryam.)

  + Maryam: O Don Rodrigo! Bakit ka naparito? Kapag nakita ka ng aking ama, tiyak ang iyong kamatayan!
  + Macario: ...
  + Direktor (pabulong): "Hindi ako natatakot sa kamatayan..."
  + Macario: Hindi ako natatakot sa kamatayan!
  + Macario: ...Ang tanging kinatatakutan ko ay ang mawalay sa iyo.
  + Direktor (pabulong): Wala 'yan sa iskrip...
  + Maryam: Kay tamis ng iyong mga salita, Don Rodrigo...
  + Mga Manonood: Uyyy!

    (The Sultan walks on from the right wing. Macario turns to him.)

  + Sultan: Maryam! Sino ang lapastangang ito na nangangahas lumapit sa aking anak?
  + Maryam: Ama, maawa po kayo! Mahal ko siya!
  + Sultan: Isang kaaway, sa loob ng aking palasyo? Mga kawal! Dakpin ang kabalyerong iyan!
  + Direktor (pabulong): Ikaw na, Macario! Labanan mo sila!

The fight. The Sultan walks off; four soldiers come in from the right
wing, one after another, and the student fights them ("Pindutin ang
Atake para lumaban!"). Two punches drop each one. The hearts show; no
gun on a stage. Running out of hearts starts the fight again with the
fallen ones still down. The fight music (intense.mp3) plays until the
last one falls.

    (Macario walks back to his mark beside Maryam, and the Sultan comes
    back to a stage of fallen soldiers; Block 93.)

  + Sultan: Natalo... ang lahat ng aking kawal?
  + Sultan: Kung ganyan katapang ang pag-ibig mo sa aking anak, sino ako para humadlang?
  + Maryam: Ama!
  + Sultan: Sa inyo na ang aking basbas.
  + Mga Manonood: Mabuhay! Mabuhay!

    (A crowd's cheer is heard with the line, since Block 85.)

  + [BLACK] Nagsara ang telon.
  + [BLACK] Tumayo at pumalakpak ang mga manonood.

    (Applause over the card, since Block 81.)

In the wings. (Macario beside the direktor, Maryam behind him.)

  + Direktor: Macario! Narinig mo ba 'yon? Nakatayo ang mga tao!
  + Macario: Nanginginig pa rin po ang tuhod ko.
  + Direktor: 'Yung linya mo kanina, 'yung "mawalay sa iyo"... hindi ko isinulat 'yon.
  + Macario: Pasensya na po. Bigla na lang pong lumabas sa bibig ko.
  + Direktor: Pasensya? Isasama ko 'yon sa iskrip!
  + Maryam: Hindi ka raw marunong umarte, ha.
  + Direktor: Heto, iho. Sa'yo 'yan. Pinaghirapan mo.

    (+79 to 110 barya, at random.)

  + Macario: Salamat po!
  + Direktor: At kung gusto mo, may puwesto ka sa kompanya namin. Pag-isipan mo, ha?

Completes: Gumanap bilang Don Rodrigo sa dula. The student is free;
Lumabas at the right edge leads back to the street, and the log says so
at the top: "Lumabas ng entablado: pumunta sa kanan" (Block 93). A reload before the
pay plays the play again from backstage.

The play's ending is a blessing, not the moro-moro's traditional
conversion of the princess, and its kingdoms are not named by
religion: a choice made for a Grade 8 classroom that the proponents
may reverse.

### 9. The Mananahi at the play

tondo, outside the entablado (x 13250), where she has come to watch;
since Block 85, so that she is not a walk back across the street. She
no longer pays (Block 89): the work paid each time. No task waits on
her. Talk:

  + Mananahi: Macario! Nanood ako sa likod. Ikaw pala ang bumida!
  + Macario: Nawala po kasi 'yung artista nila. Ako na lang po ang pinagsuot ng damit.
  + Mananahi: Aba, e 'di ikaw pala ang unang nagsuot ng tinahi ko! Kasya ba?
  + Macario: Kasyang-kasya po.
  + Mananahi: Sabi ko na nga ba.

### 10. The savings

tondo, x 2000. The button reads Ibigay ang ipon, and appears once the
play is done and he holds 100 barya (Block 89): the play's 79 to 110
and what the work brought in, so anyone short goes back to the horse
or the sewing. 100 barya go to Nanay; Macario keeps the rest.

    Macario: 'Nay, nakapag-ipon na po ako ng pera para makatulong.
    Nanay: Maraming salamat, anak ko! Napakahusay mo! Ginalingan mo ba sa trabaho?
    Macario: Opo, 'Nay. Nagtrabaho po ako sa Kutsero at sa Mananahi.
  + Macario: Tapos, Nay... umarte pa po ako sa entablado.
  + Nanay: Ikaw? Sa entablado?
  + Macario: Nagkasakit po kasi 'yung bida nila. Ako na lang po ang ipinalit ng direktor.
  + Nanay: Kaya pala hindi mawala-wala 'yang ngiti mo.
    Nanay: Ituloy mo lang 'yan, 'nak. Malayo ang mararating mo sa buhay.
    Macario: Maraming salamat po, 'Nay!

Completes: Mag-ipon para kay Nanay (n/100), which since Block 92 is
also a second line in the log from the moment he has spoken to the
Kutsero, counting the barya as they come in. As she finishes, the
screen goes black.

### 11. Four years on

Plays by itself straight after the savings; a reload before the card
lifts plays it again.

  + [BLACK] Pagkalipas ng apat na taon
  + [BLACK] Tondo, 1894
  + [BLACK] Ngayong gabi sa entablado: Principe Baldovino

    (The card lifts onto the entablado, in the middle of the play.
    Macario on his mark beside Maryam, facing her.)

Principe Baldovino is a komedya, attributed to Huseng Sisiw, that Sakay
is recorded as having acted in; the genre's prince fights the enemy's
armies and wins, usually for a princess. Its text is not to hand, so
the words below are ours, written in the genre (Block 81).

  + Maryam: Principe Baldovino! Ikaw ba 'yan? Bihag ako ng kaaway, at bukas ay ilalayo nila ako sa kaharian!
  + Macario: Prinsesa, huwag kang mangamba. Walang pader at walang hukbong makahahadlang sa akin.
  + Direktor (pabulong): Ayan na ang mga kawal...

The battle. Two of the enemy's soldiers come in from the right wing
and the student fights them (the first play's kawal), with the fight
music, the hearts showing and no gun on a stage. Then he walks back to
her side.

  + Maryam: Iniligtas mo ako, mahal kong prinsipe!
  + Macario: At tandaan ng lahat ng nakikinig:
  + Macario: Walang bayang mananatiling alipin, kung ang mga anak nito ay handang lumaban!
  + Direktor (pabulong): Wala na naman 'yan sa iskrip...
  + Mga Manonood: ...
  + Mga Manonood: Mabuhay si Baldovino!

    (The cheer again.)

    (His own line again, as on his first night; this one is not about
    love. The crowd is quiet for a moment before it cheers.)

  + [BLACK] Nagsara ang telon.
  + [BLACK] Muling tumayo at pumalakpak ang mga manonood.

    (Applause over the card, as over the first play's.)

In the wings. (Macario beside the direktor, Maryam behind him.)

  + Direktor: Macario... 'yung idinagdag mo sa dulo. Wala 'yon sa iskrip.
  + Macario: Pasensya na po. Bigla na naman pong lumabas.
  + Direktor: Nagustuhan ng mga tao. Pero may guardia civil sa likod ng mga upuan ngayong gabi. Mag-ingat ka.
  + Direktor: Pag-uwi mo, huwag mo nang hubarin 'yang damit mo.
  + Macario: Po?
  + Direktor: Walang guardia na nag-uusisa sa artistang pagod. Tumayo ka lang nang tahimik, iisipin nilang nagpapahinga ka lang.

    (Block 82. He keeps the stage clothes on: the costume the Mananahi
    sewed, first worn as Don Rodrigo. They go into his inventory, worn,
    with a toast, "Suot mo: Damit-Pangteatro". While he stands still in
    them a guard takes five times as long to notice him, and the guard's
    meter is drawn pale blue while they are helping.)

  + Maryam: Apat na taon na, pero hindi ka pa rin marunong sumunod sa iskrip, 'no?

### 12. The Katipunan asks

entablado. Straight on from the play; a reload from here plays only
this.

    (Macario walks to stage right. Two men who are not of the company
    come in from the right wing and stop in front of him.)

  + Katipunero: Principe Baldovino.
  + Macario: Macario po. Sino po sila?
  + Katipunero: 'Yung huling linya mo kanina. Wala 'yon sa komedya.
  + Katipunero: Linya lang ba 'yon, o pinaniniwalaan mo?
  + Macario: ...
  + Katipunero: May kaibigan kang nagtanong-tanong tungkol sa amin. Sabi niya, gusto mo raw sumali.
  + Macario: Kayo po ba... ang Katipunan?
  + Kasama: Hinaan mo ang boses mo.
  + Katipunero: Minsan ko lang itatanong. Sigurado ka bang gusto mong sumali?
  + Katipunero: Hindi ito komedya. Dito, hindi kahoy ang mga espada.
  + Macario (sa isip): Si Nanay...
  + Macario (sa isip): Pero kaya nga ako sasali. Para wala nang inang mauubusan ng pambili ng bigas dahil sa cedula.
  + Macario: Sigurado po ako.

    (The Katipunero has his answer and walks off into the wing. The
    Kasama stays a moment.)

  + Kasama: Paglabas mo, hanapin mo ako sa kalye, bago ang entablado.
  + Kasama: Lalapitan mo ako at sasabihin mo: "Anak ng Bayan." Kapag hindi mo 'yon sinabi, hindi kita kilala.
  + Macario: Anak ng Bayan.
  + Kasama: Hindi rito. Sa labas.

    (They walk off into the right wing. The student is free; Lumabas
    leads back to the street beside the direktor.)

Completes: Gumanap bilang Principe Baldovino.

### 13. The word

tondo, the Kasama at x 12500, left of the direktor. Talk (Usap).

  + Macario: Anak ng Bayan.
  + Kasama: ...
  + Kasama: Walang sumunod sa'yo?
  + Macario: Wala po.
  + Kasama: Sumunod ka sa akin. Huwag kang lilingon.

  + [BLACK] Piniringan ang mga mata ni Macario,
  + [BLACK] at dinala siya sa isang lihim na silid sa Tondo.

    (The card lifts onto the pulungan. A recruit was brought in
    blindfolded.)

Completes: Hanapin ang naghihintay sa kalye.

### 14. The oath

pulungan. Plays by itself on arrival; a reload in the room plays it
again from the top.

The rite follows the histories (Block 81), in their order: from
December 1892 a recruit was blindfolded and led into a dim room hung
with black curtains, where the blindfold came off before a warning on
the wall; the Mabalasig ("terrible brother") challenged him to turn
back if he lacked courage; he answered three questions (the country
when the Spaniards came, now, and in the future); he went through
ordeals (a revolver said to be loaded, fired at a man; a leap over a
fire said to be burning); and he signed the oath in blood from his
arm. "Anak ng Bayan" was the password of the first grade, the Katipon.
Of the two ordeals the game uses the fire, for a Grade 8 room. The
warning is paraphrased, not the original's words; everything said is
ours.

  + Mabalasig: Alisin ang kanyang piring.
  + Macario (sa isip): Madilim... itim ang lahat ng kurtina.

    (He looks around the room.)

  + Mabalasig: Basahin mo ang nakasulat sa dingding.
  + Macario: "Kung may lakas at tapang ka, magpatuloy ka. Kung pag-uusisa lamang ang nagdala sa iyo rito, umalis ka na."
  + Mabalasig: Ako ang Mabalasig. Ito na ang huli mong pagkakataong umatras.
  + Macario: Hindi po ako aatras.
  + Mabalasig: Lumapit ka.

    (Macario walks up to the Mabalasig.)

  + Mabalasig: Tatlong tanong. Sagutin mo nang tapat.
  + Mabalasig: Ano ang kalagayan ng ating bayan nang dumating ang mga Kastila?
  + Macario: May sarili po tayong pamumuhay at pamahalaan. Malaya po tayo.
  + Mabalasig: At ano ang kalagayan nito ngayon?
  + Macario: Alipin po sa sarili nating lupa.
  + Mabalasig: At ano ang maaasahan nito sa darating na panahon?
  + Macario: Kalayaan po... kung may lalaban.
  + Mabalasig: ...
  + Mabalasig: Piringan siyang muli.

  + [BLACK] Muling piniringan si Macario.

  + Mabalasig: Sa harap mo ay may nagliliyab na apoy. Tumalon ka.
  + Macario (sa isip): Wala akong makita...
  + Macario (sa isip): Para kay Nanay. Para sa bayan.

    (He jumps, and lands. Shown, not told, since Block 82.)

  + Mabalasig: Alisin ang piring.
  + Mabalasig: Walang apoy. Tapang mo ang sinubok namin, hindi ang balat mo.

  + Mabalasig: Ngayon, ang panunumpa.
  + Mabalasig: Isumpa mong ipagtatanggol mo ang Katipunan, iingatan mo ang mga lihim nito, at tutulungan mo ang bawat kapatid sa anumang panganib.
  + Macario: Isinusumpa ko po.

  + [BLACK] Hiniwaan si Macario sa braso,
  + [BLACK] at sa sarili niyang dugo, nilagdaan niya ang panunumpa.

  + Mabalasig: Mula ngayon, kapatid ka na namin, Macario. Isa ka nang Katipon, ang unang baitang.
  + Mabalasig: Kaya "Anak ng Bayan" ang salitang ibinigay sa iyo. Iyon ang hudyat ng mga Katipon.
  + Katipunero: Maligayang pagdating, kapatid. Hindi na linya lang 'yung sinabi mo sa entablado.
  + Mabalasig: Heto ang una mong gawain: mga polyeto. Kailangang mabasa ito ng ating mga kababayan.

    (He takes them to the Kasama by the door.)

  + Kasama: Sa likod ka dadaan. Ang mangingisda ang pinakamalapit. Ang tabakera, lampas sa patahian. Ang karpintero, malapit na sa entablado.
  + Kasama: May mga guardia civil na nagroronda ngayong gabi. Huwag kang dadaan sa harap nila. Magtago ka kung kailangan.
  + Kasama: Mabuti't suot mo pa 'yang damit-teatro. Kapag tumigil ka at hindi gumalaw, hindi ka nila agad papansinin.
  + Macario: Opo. Ako na po ang bahala.

Completes: Sumapi sa Katipunan. The student is free; the way out,
Lumabas sa likod ("Lumabas sa likod: pumunta sa kaliwa" at the top of
the log, Block 93), leads onto the street at x 4100, short of the
mangingisda, facing right.

### 15. The pamphlets

tondo, at night in the story (the paintings are the day's). The
mangingisda (x 4800), the tabakera (x 6900) and the karpintero
(x 10600), met in that order walking right from the back door, though
any order works. Each button reads Iabot ang polyeto, and Macario says
the same thing to each:

  + Macario: Para po sa inyo. Itago n'yo po, at basahin nang palihim.

Mangingisda:

  + Mangingisda: Matagal ko nang hinihintay 'to. Sa bangka ko itatago, walang guardia na sumisilip doon.

Tabakera:

  + Tabakera: Isisingit ko 'to sa mga tabako. Maraming babae sa pagawaan ang dapat makabasa nito.

Karpintero:

  + Karpintero: Katipunan? ...Itatago ko 'to. Ipapabasa ko sa mga kasama ko sa talyer.

The guardia civil (Block 81). On this run only, three bantay walk the
street, one before each of the three: between the mangingisda and the
apple tree (5000 to 5600), past the tabakera (7400 to 8000), and past
the middle of the street (9700 to 10150). Each has a crate in the middle of his beat
to hide behind. They do not shoot: one who sees Macario catches him,
which costs a heart and puts him back at the back door, or at the last
of the three he has already reached. From behind, a guard can be taken
down. Standing still in the stage clothes, he is noticed five times
more slowly. He can run, except near a guard (Block 82). Nobody speaks;
the Kasama's warning is the whole of the instruction.

At night (Block 85): the street darkened toward moonlight while the
pamphlets are the task, and crickets instead of the day's music. The
first time a guard starts to notice him, a hint says to hide behind a
crate or get out of his sight; a rising note sounds whenever one starts
to notice, and a sting on a catch.

The pamphlets count (n/3). After the third, wherever he is:

  + Macario (sa isip): Naibigay ko na ang tatlo.
  + Macario (sa isip): Dati, barya ang iniipon ko para kay Nanay.
  + Macario (sa isip): Ngayon, may mas malaki na akong ipinaglalaban.

  + [BLACK] Dito nagsimula ang paglilingkod ni Macario sa Katipunan.
  + [BLACK] Wakas ng Unang Yugto

Completes: Ipamigay ang mga polyeto (3/3), the last task. Act I is
finished, and the post-test runs.

## The Test Room (not the plot)

Blocks 73 and 74, at the proponent's request. Outside the story: it is
reached only from the Test Room button in Mga Setting (from pause), and
nothing in the plot above leads to it or changes because of it.

Pressing it shows a black card:

    [BLACK] <WIP>

and Macario is in the guards' room (bantayan): three paintings of the
town, 4350 wide, with three bantay (guardia civil, real art walking and
shooting) who see, turn hostile, level their rifles and fire, a
platform above their sight with a heart on it, and a crate to hide
behind. Nobody speaks. The door at the far end (Lumabas) returns him to
the very spot he left, facing the same way, with the story where it was.

## Repeat lines

What each person says when talked to again, by where the story is.
One line each, on purpose (CLAUDE.md, Writing dialogue).

Nanay:

  + Nanay: Mag-iingat ka sa trabaho, anak. At umuwi ka bago dumilim.
    (before the savings)
    Nanay: Ituloy mo lang 'yan, 'nak. Malayo ang mararating mo sa buhay.
    (after)
  + Nanay: Ginagabi ka na naman, anak. Mag-ingat ka sa mga guardia civil sa labas.
    (once he is sworn in; she does not know)

Kutsero:

  + Kutsero: Nariyan lang si Kabayo. Suklayin mo, may barya ka sa bawat linis.
    (before the first grooming)
  + Kutsero: Ang ganda ng trabaho mo. Balik ka lang kung gusto mo pa ng dagdag na barya.
    (while there is more to earn)
  + Kutsero: Sapat na 'yan sa ngayon, Macario. Malinis na malinis na si Kabayo.
    (paid all he will pay)

Mananahi:

  + Mananahi: Ihatid mo na 'yung damit ng direktor, baka hinahanap na nila.
    (sent with the costumes, not yet delivered)
  + Mananahi: Nariyan ang tahian, kung gusto mo pa ng dagdag na barya.
    (while there is sewing to do)
  + Mananahi: Hinahanap ka raw ng direktor sa entablado. Bilisan mo!
    (delivered, the play not yet done; only an old save reaches this)
  + Mananahi: Iuwi mo na 'yang naipon mo sa nanay mo. Matutuwa 'yon.
    (after the first talk outside the entablado)
  + Mananahi: Kapag may tahi ulit, ipapatawag kita, ha?
    (afterwards)

Direktor, on the street:

  + Direktor: Pasensya na, iho, abala kami. Mamayang gabi na ang palabas at ang dami pang kulang.
    (before the Mananahi has sent him)
  + Direktor: Ikaw 'yung bata ng Mananahi, 'di ba? Dala mo na ba ang mga damit namin?
    (sent, with the costumes still on him)
  + Direktor: O, ano pa'ng hinihintay natin? Tara na sa loob, naghihintay na ang mga tao!
    (Macario agreed but is still outside, after a reload; takes him in)
  + Direktor: Hindi pa rin ako makapaniwala. Iniligtas mo ang palabas namin, iho.
    (after the play)
  + Direktor: Apat na taon na, iho, at ikaw pa rin ang hinahanap ng mga manonood.
    (four years on)

Direktor and Maryam, in the entablado:

  + Direktor: Huminga ka nang malalim, iho. Nandito lang ako sa gilid.
    (before the play)
  + Direktor: Bumalik ka rito kahit kailan mo gusto. May puwesto ka sa amin.
    (after)
  + Direktor: Magpahinga ka na, iho. May palabas ulit tayo sa Sabado.
    (four years on)
  + Maryam: Kaya mo 'yan. Tumingin ka lang sa akin kapag nalito ka.
    (before the play)
  + Maryam: Alam mo, mas bagay sa'yo si Don Rodrigo kaysa kay Julian. Huwag mo lang sasabihin sa kanya.
    (after)
  + Maryam: Sino 'yung dalawang lalaking kausap mo kanina? Ang seryoso ng mga mukha.
    (four years on, after the two men)

Kasama, on the street:

  + Kasama: Ano pa'ng hinihintay mo? Sumunod ka na.
    (the word said, after a reload before the oath; takes him in)
  + Kasama: Huwag kang tumambay rito. Ipamigay mo na ang mga polyeto.
    (during the pamphlets)
  + Kasama: Magaling, kapatid. Magkikita pa tayo.
    (afterwards)

In the pulungan, after the oath:

  + Kasama: Lumabas ka nang mag-isa. Hindi tayo dapat makitang magkasama.
  + Mabalasig: Humayo ka na, kapatid. Naghihintay ang tatlo.
  + Katipunero: Sa susunod na palabas mo, manonood ulit ako. Sa likod, gaya ng dati.

The three, before the pamphlet and after:

  + Karpintero: Gabi na, iho. Sarado na ang talyer.
  + Karpintero: Wala akong nakita, wala akong narinig. Ingat ka, iho.
  + Tabakera: Pagod na ako, iho. Maghapon akong nagbalot ng tabako.
  + Tabakera: Kumakalat na sa pagawaan ang ibinigay mo. Mag-ingat ka, ha.
  + Mangingisda: Maaga pa ako bukas sa laot. Ano'ng kailangan mo?
  + Mangingisda: Nabasa ko na. Ipinasa ko na rin sa kapitbahay.

## The Talaan

Block 70. The papers are the teacher's. Up to three, written on the
dashboard (Talaan Papers); what they say is not in this file because
it is not in the content, and it changes whenever the teacher saves.
Where they lie is fixed:

    Paper 1   x 2500, on the road between Nanay and the Kutsero; every
              student walks into it on the way to the first job
    Paper 2   x 8200, past the Mananahi's sewing, at jump height
    Paper 3   x 12200, before the direktor, at jump height

An empty slot lays nothing. With no papers written the Talaan button
does not appear. A found paper opens a card over a stopped world:

  + (card) Papel 1 / 3
  + (under a paper) Naitala ito sa Talaan. Buksan ang Talaan sa pause para basahin ulit.
  + (under the last) Nahanap mo na ang lahat ng papel!

and is listed on the pause screen under "Mga Papel". Act I declares no
words (Block 69).

## Threads left open

What the story has set up and not yet paid off, for whoever writes the
next passage. None of these is a promise; they are what is there.

    The father. The siga's taunt ("inaantay mo pa din tatay mo?") is
      the first thing said in the game and is never answered.
    The company. Macario took the direktor's offer: four years on he
      is its lead. The direktor and Maryam both saw the two men.
    Maryam. Teases him three times, prefers him to Julian, and asks
      who the serious men were. He has not answered.
    Julian. Sick on the first night; never heard of again.
    Nanay. Does not know he has joined, and already worries about the
      guardia civil.
    The Katipunan. Macario is a sworn member with one errand done. The
      Kasama: "Magkikita pa tayo." Act II starts from here.

## Open questions for the proponents

    Every + line above: accept, rewrite or replace.
    The names ours gave: Julian, Don Rodrigo,
      the Sultan.
    The play's ending (a blessing, not a conversion) and its kingdoms
      not named by religion.
    Check the play against the source book, and the year on the
      opening card against Sakay's birth year in it.
    The years (settled in Block 83, by the proponent: four years, and
      1894). The opening is now "Tondo, 1890" and the cut names "Tondo,
      1894", the year Sakay joined the Katipunan. With his birth given
      as 1870 he is twenty at the opening and twenty-four when he
      joins; with 1878 (his death certificate), twelve and sixteen.
      The opening's boy and his first job read younger than twenty; if
      the proponents follow the 1870 date, the siga's taunt and the
      errands may want a look.
    Checked against the histories in Block 81 (DECISIONS.md lists the
      sources): the password, the three questions, the blindfold, the
      room in black, the warning, the Mabalasig, the ordeals and the
      oath in blood from the arm. Still to check against the source
      book: the words of Principe Baldovino (the scene is ours, in the
      komedya's form), the warning's exact words, the ordeal chosen
      (the fire rather than the revolver), and what the pamphlets were
      (the Katipunan's newspaper, Kalayaan, dates from 1896, so the
      game does not name them).
    What the direktor pays (79 to 110 at random, the proponents' own
      numbers from Block 56).
    The Talaan: whether Act I should have words a student earns
      (empty since Block 69), and the wording of the two + lines under
      a found paper. The papers themselves are the teacher's.