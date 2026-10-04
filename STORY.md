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
  + Speaker: line          ours, marked PLACEHOLDER in the content file,
                           until the proponents accept or replace it.
                           Act I's were accepted on 4 Oct 2026 (Block
                           113), so the + is gone from them; Act II's
                           carry it
    [BLACK] line           a black card (playIntertitle)
    [HINT] Title: text     a hint for the post-test, found on the road
    (stage direction)      what happens, not what is said

Lines of ours are written to the standard in CLAUDE.md, Conventions,
Writing dialogue. The proponents' lines are never rewritten to match
ours. Since Block 93 their spelling and grammar are corrected, at their
request, with the wording and the meaning kept (po rather than 'ho,
'Nay, rin and rito after a vowel, 'yung, no "Okay").

Last updated: 4 Oct 2026, Block 113 (Act II, 1896 to 1898, beat by beat;
Act I's lines accepted by the proponents, the + gone from them). Before
that, 1 Oct 2026, Block 103 (no story change: on the pamphlet
night the street is the three's and the guards' alone, the horse and
the tahian too). Before that, Block 102 (the barber's game easier and
paid by the round right, 20 in all; the night empty of the day's
people; Nanay's night line removed), Block 101 (the proponent's art for
Nanay, the Kutsero, the Barbero, Maryam, the Sultan, the kawal and the
Mabalasig) and Block 100 (the horse; the Kutsero's "puting" dropped).
Before that, Block 95 (no door to find after the
pamphlets: the Kasama comes to Macario and takes him back; the Test
Room is gone). Before that, Block 94 (a third job, the Barbero, with a
game of his own; a new end: the report in the pulungan and a year on,
Tondo, 1895, Macario the head of his council, lying to Nanay at the
door as it is shut on her; three papers of facts of the game's own in
the Talaan). Before that, 30 Sep 2026, Block 93 (the proponents' early lines
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
is, grooming a kutsero's horse, working a barber's chair and helping a
mananahi sew, as often as he likes for a few barya a time, until she stops him and sends him with the
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
guardia civil on their rounds. When the rounds are over the Kasama
comes for him, and he reports.

A year on, in 1895, he is the head of his own council of the Katipunan:
the men bring him their business and take his orders. Nanay comes to
the door, afraid of the secret meetings the neighbours talk about, and
asks whether he is one of them. He tells her he is rehearsing a new
komedya. The Kasama shuts the door on her as the men call him Pangulo,
and Act I ends; the post-test follows.

Act II, Ang Mahabang Anino ng Digmaan. Tondo, August 1896 (Block 113).
He prints the second issue of the Katipunan's paper, Kalayaan, "from
Yokohama" like the first, hears a rumour that someone went to the
priest, and sees where the list of members, with where each lives, is
kept. On the walk home the neighbours will not be seen with him. Nanay
finds ink on his hands, says the word she heard at the door, Pangulo,
and begs him not to vanish as his father did; he swears he will come
back, and before he has finished answering her Isko is at the door:
trouble at the press, nothing more. Nobody knows the sweep has begun.
"Kapapangako mo lang." "Sandali lang po ito." The street is full of
guards; he gets past them to the press, past the guards searching it,
to the list, and finds his own name in it, and only then understands:
the receipts they took give her address, and he left her alone. Running
home through the night he is seen well short of her door ("Hoy,
sino ka?! Bumalik ka dito!") and chased the other way, out of Tondo, to
the mountains. He never gets back. Nobody learns what became of her. In
the hills he tears up his cedula for her, charges the powder store at
San Juan del Monte, where the Kasama dies telling him not to look back,
raises straw soldiers at the Nangka, and hears by a fire at Balara that
Bonifacio, too, left someone. In 1897 Bonifacio is killed by his own
side; Macario stays with Jacinto in Laguna. On black: Biak-na-Bato, the
Americans, Kawit, and Spain selling the country for twenty million
dollars, a price he sets against the cedula, and his promise to Nanay
still unkept.

Acts III and IV are not written. Their content files are registered
stubs (content/act3.js, act4.js) and hold no story.

## Places

Act I has three.

tondo, the street. One long road, 14500 wide, ten paintings of the town
end to end (street-01 to 04 in order, twice, then 01 and 02), a palm or
a tree in silhouette over each join between two paintings. Everyone in
Act I lives on it, left to right:

    x 900      where Macario stands when the game opens
    x 2000     Nanay, where she and Macario walk to in the opening
    x 3300     the Kutsero
    x 3560     his horse, Kabayo (used with E, not talked to)
    x 4100     the pulungan's back door, where he comes out onto the
               street with the pamphlets
    x 4800     the mangingisda (four years on, once Macario is sworn in)
    x 5300     the Barbero (Block 94), and his chair at x 5440 (used
               with E); closed, and gone, from the oath on
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
Everyone else stays through the four years. On the pamphlet night,
from the oath to the report (Block 102), nobody is out but the three
and the guardia civil: Nanay, the Kutsero, the Mananahi, the direktor
and the Kasama are away, and since Block 103 the horse and the tahian
too (the chair goes at the oath).

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
mangingisda; since Block 94 the Kasama brings him back to report
(Block 95: no door to find), and the act ends there, a year on. Its painting is owed: until it arrives it is a dark wall
with the file name on it.

## Cast

    Macario        the boy, the player. Real art (idle, walk, jump,
                   punch, shooting).
    Nanay          his mother. The proponent's still (Block 101), side
                   on: long hair, a blue tapis over a long skirt. Stands
                   and walks, animated from it.
    Mga Siga       three street toughs, the artist's art since Blocks
                   96 and 98, each animated from one still (standing,
                   walking, a punch, a flinch): the leader in a salakot
                   with a checked shawl over his shoulders (siga-1, the
                   one who speaks), a big one in a red sash (siga-2),
                   and a small one with a pouch at his belt (siga-3).
                   One speaks alone ("Siga"), all three laugh ("Mga
                   Siga").
    Kutsero        a carriage driver, Macario's first employer. The
                   proponent's still (Block 101), facing the front, a
                   coil of rope and a whip; standing still.
    Kabayo         the kutsero's horse, a saddled bay. The proponent's
                   still, animated by a tool (Block 100).
    Barbero        a barber, his third employer (Block 94). The
                   proponent's still (Block 101), facing the front, comb
                   and scissors in a pouch at his sash; standing still.
                   His chair is a placeholder box (silya-barbero.png).
    Suki           the barber's customer, heard only in the barber's game,
                   asking for the cut.
    Mananahi       a seamstress, his second employer. Real art, facing
                   the front, standing still (Block 98).
    Direktor       head of the theatre company, on the street and on the
                   stage. Real art (Block 98): an old man with a white
                   beard, a cane and the play under his arm.
    Julian         the company's lead actor. Never seen: sick with a
                   fever, which is the whole of his part.
    Maryam         the company's leading lady; plays the princess.
                   The proponent's still (Block 101), facing the front, a
                   head wrap and a woven skirt; standing still.
    Sultan         in the play, Maryam's father. The proponent's still
                   (Block 101): a plumed turban, a red cape, a kampilan.
                   Stands, and marches on and off, animated from it.
    Mga Kawal      in the play, the Sultan's soldiers. The proponent's
                   still (Block 101): a turban, a kris and a shield.
                   March, strike and flinch, animated from it.
    Mga Manonood   the audience. Heard, never seen.
    Katipunero     the older of two men of the Katipunan who find
                   Macario in the wings, and at his oath. Real art
                   (Block 98): a salakot, a moustache, a striped shawl.
    Kasama         his companion, who gives Macario the password, waits
                   for him on the street and leads him in. Real art
                   (Block 98): young, a red shirt and neckerchief, a
                   bolo at his belt.
    Mabalasig      the "terrible brother" who conducted a recruit's
                   rite: he swears Macario in and gives him the
                   pamphlets. A role from the histories, not a named
                   person. The proponent's still (Block 101), side on: a
                   salakot, a rolled paper in his hand, a bolo at his
                   back. Stands, animated from it. (Block 80's Pangulo,
                   renamed in Block 81.)
    Mangingisda,   the three who take the pamphlets: a fisherman, a
    Tabakera,      woman from the cigar factory and a carpenter.
    Karpintero     The proponent's stills (Block 102), facing the front,
                   standing still: a fisherman with a net and a hat on his
                   back, a woman with a cigar and a bundle of leaves, a
                   young carpenter with a rule and a hammer.
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
    Kutsero: O sige, magsimula ka na agad. Alagaan mo 'yung kabayo sa kuwadra.
    Kutsero: Suklayin mo siya. Bawat linis na matapos mo, may bayad ka sa akin.

Completes: Maghanap ng trabaho: kausapin ang Kutsero.

### 3. The horse

tondo, x 3560, beside the Kutsero. Nothing is staged: the horse is
simply there, and the button reads Suklayin. Before the Kutsero has been
spoken to, Macario thinks it over instead:

    Macario (sa isip): Kabayo ito ng Kutsero. Kausapin ko muna siya bago ko galawin.

Grooming is a small game (Block 89, game.js, playWorkGame): a marker
sweeps a bar, a green patch waits at a new place, and five strokes,
pressed with the button or E, are a round. The patch is thinner with
each stroke (Block 90), and over the horse a brush sweeps on a good
one while he shies from a bad one. Each good stroke is worth
more: a round pays 4 to 7 barya (5 good strokes pay 7, none pay 4), it
can be done again as often as he likes, and the Kutsero stops paying at
25 from this job. A round cut short pays nothing.

    (the game) Kabayo / Suklayin siya kapag nasa berde ang guhit.
    (a good stroke) Hiiiii!
    (a missed one) Umiwas ang kabayo!
    (the end) n/5 ang maayos. +n barya

Completes, with the first round: Alagaan ang kabayo ng Kutsero. Nothing
else waits on the horse; the job stays there.

### 4. The Kutsero, afterwards

    Kutsero: Sapat na 'yan sa ngayon, Macario. Malinis na malinis na si Kabayo.

Said, with no game, once the horse has paid its 25. Before that, see
Repeat lines.

### 5. The Barbero

tondo, x 5300, his chair beside him at x 5440. Block 94, at the
proponent's direction: Sakay is recorded as having been a barber. Before
the horse has been groomed he sends Macario to the Kutsero:

    Barbero: Wala pa akong maipapagawa sa'yo, iho. Pero naghahanap daw ng tagaalaga ng kabayo ang Kutsero.

After it, talk:

    Macario: Magandang araw po. Naghahanap po ba kayo ng katulong?
    Barbero: Katulong? Marunong ka bang humawak ng gunting?
    Macario: Nakapagsuklay na po ako ng kabayo.
    Barbero: ...
    Barbero: Hindi kabayo ang mga suki ko, iho.
    Barbero: Pero sige. Makinig kang mabuti sa gusto ng suki, at sundin mo nang tama ang pagkakasunod-sunod.
    Barbero: Nariyan ang silya. May bayad ang bawat gupit na matapos mo.

The chair's button reads Gupitin. Before he has been spoken to:

    Macario (sa isip): Silya ito ng Barbero. Kausapin ko muna siya.

The barber's game is his own (game.js, playOrderGame), not the work
game: in each of five rounds the customer asks for the cut as a list of
tools, said one word at a time and then taken away, two words the first
two rounds, three the next two and four the last (Block 102, made
easier at the proponent's word), and Macario uses the tools in that
order (three buttons, Suklay, Gunting and Labaha, or the keys 1 to 3).
A wrong tool ends the round. Each round right pays 4 to 7 barya, 20 in
all from him, so one good run is all of it.

    (the game) Barberya / Tandaan ang gusto ng suki
    (the request) Suki: Suklay, Gunting, Labaha.
    (the request taken away) Ikaw na!
    (a round right) Tama ang pagkakasunod-sunod!
    (a wrong tool) Naku, hindi 'yan ang gusto ng suki!
    (the end) n/5 ang maayos. +n barya
    Barbero: Sapat na ang nagupit mo ngayon, iho. Bukas ulit.
    (once he has paid his 20)

Completes, with the first round: Magtrabaho sa barberya.

### 6. The Mananahi

tondo, x 6400. Talk. Before the barber's first game she sends him there
(Block 94), so the jobs are met in the order the log gives them:

    Mananahi: Wala pa akong maipapatahi sa'yo ngayon, iho. Pero balita ko, naghahanap ng katulong ang Barbero. Puntahan mo muna siya.

After it:

    Macario: Mananahi, tumatanggap po ba kayo ng trabahador?
    Mananahi: Oo naman, Macario. Kumusta na ang inay mo?
    Macario: Ayos lang po. Nangangailangan lang po kami ng pera ngayon.
    Mananahi: O, sige, sige. Tara rito.
    Mananahi: Nariyan ang tahian. Tulungan mo akong magtahi, may bayad ang bawat matapos mo.

Completes: Kausapin ang Mananahi.

### 7. The sewing, and being stopped

tondo, x 6540, beside her, at her table (tahian.png, owed: a
placeholder box until it is drawn, Block 93). The same game as the horse with the sewing's
words, the button reading Manahi, played by holding the button to fill
the bar and letting go over the green (Block 90), a cloth that gains a
stitch at each stroke; the same pay (4 to 7 a round, 25 in
all). Before she has been spoken to:

    Macario (sa isip): Tahian ito ng Mananahi. Kausapin ko muna siya.

    (the game) Pananahi / Hawakan ang pindutan, bitawan kapag nasa berde.
    (a good stroke) Diretso ang tahi!
    (a missed one, or held too long) Baluktot ang tahi! / Napatid ang sinulid!

The quest line counts the first two rounds (n/2). When the second is done
she stops him, the one thing here that is scripted:

    Mananahi: Macario, teka! Ihinto mo muna 'yan.
    Macario: Po? May mali po ba sa tahi ko?
    Mananahi: Wala, wala. Nakalimutan ko lang ang mas mahalaga.
    Mananahi: 'Yung mga damit ng direktor para sa palabas mamayang gabi. Kanina pa dapat nakarating 'yon.
    Mananahi: Ikaw na ang magdala. Nasa dulo pa ng kalye ang entablado.
    Macario: Sige po, ihahatid ko na ngayon.
    Mananahi: Bilisan mo, ha. Huwag mong ibababa sa daan 'yan.

Completes: Tulungan ang Mananahi sa pananahi (2/2). With the costumes on
him the sewing waits:

    Macario (sa isip): May dala akong damit para sa direktor. Ihahatid ko muna.

The direktor, at the far end, x 13600. The button reads Iabot ang damit,
offered once she has sent him:

    Macario: Magandang hapon po. Padala po ng Mananahi, 'yung mga damit para sa palabas.
    Direktor: Salamat sa Diyos, dumating din! Akin na, iho.

Completes, with the next beat: Ihatid ang mga damit sa direktor.

### 8. The missing actor

tondo, beside the direktor. Plays by itself straight after he takes
the costumes.

    Direktor: Teka... nasaan na ba si Julian?
    Direktor: Julian! JULIAN!
    Macario: Sino po si Julian?
    Direktor: 'Yung bida namin. Siya dapat ang gaganap na Don Rodrigo mamaya.
    Direktor: Kaninang umaga pa siya hindi nagpapakita. Ang sabi ng kapatid niya, nilalagnat daw.
    Direktor: Diyos ko... puno na ang mga upuan sa loob. Hindi ko puwedeng pauwiin ang mga tao.
    Macario: Wala po bang ibang puwedeng pumalit sa kanya?
    Direktor: Wala na. May kanya-kanyang papel na ang lahat ng artista ko.
    Direktor: ...
    Direktor: Iho, tumayo ka nga nang tuwid.
    Macario: Po?
    Direktor: Kasing-tangkad mo si Julian. Kasyang-kasya sa'yo 'yang damit na dinala mo.
    Macario: Ako po? Naku, hindi po ako marunong umarte.
    Direktor: Hindi mo kailangang maging magaling. Kailangan ko lang ng taong kayang tumayo sa entablado nang hindi tumatakbo palabas.
    Direktor: Nasa gilid lang ako. Ibubulong ko sa'yo ang bawat linya. At babayaran kita, siyempre.
    Macario (sa isip): Dagdag na pera para kay Nanay...
    Macario: Sige po. Susubukan ko.
    Direktor: Salamat, iho! Tara na sa loob, bago ka pa magbago ng isip!

    (The screen fades, and they are inside the entablado.)

Completes: Ihatid ang mga tinahing damit (3/3). A reload before
Macario says yes plays the scene again.

### 9. The play

entablado. Plays by itself on arrival. A moro-moro: two kingdoms at
war and a love across them, the kind of play Tondo's stages put on.

Backstage. (Macario enters on the right, facing Maryam.)

    Maryam: Ikaw ba 'yung papalit kay Julian?
    Macario: Opo. Macario po.
    Maryam: Ako si Maryam. Ako ang prinsesa.
    Maryam: Namumutla ka. Kinakabahan ka, 'no?
    Macario: Hindi ko nga po alam ang kuwento.
    Maryam: Madali lang. Magkasintahan tayo, pero magkaaway ang mga kaharian natin.
    Maryam: Darating ang ama ko, ang Sultan, kasama ang mga kawal niya. Lalabanan mo sila.
    Maryam: Kahoy lang ang mga espada. Basta huwag mong lakasan ang palo.
    Macario: ...Sige po.
    Direktor (pabulong): Pumuwesto na ang lahat! Bubuksan na ang telon!

    [BLACK] Bumukas ang telon.

The first scene. (Macario on his mark beside Maryam.)

    Maryam: O Don Rodrigo! Bakit ka naparito? Kapag nakita ka ng aking ama, tiyak ang iyong kamatayan!
    Macario: ...
    Direktor (pabulong): "Hindi ako natatakot sa kamatayan..."
    Macario: Hindi ako natatakot sa kamatayan!
    Macario: ...Ang tanging kinatatakutan ko ay ang mawalay sa iyo.
    Direktor (pabulong): Wala 'yan sa iskrip...
    Maryam: Kay tamis ng iyong mga salita, Don Rodrigo...
    Mga Manonood: Uyyy!

    (The Sultan walks on from the right wing. Macario turns to him.)

    Sultan: Maryam! Sino ang lapastangang ito na nangangahas lumapit sa aking anak?
    Maryam: Ama, maawa po kayo! Mahal ko siya!
    Sultan: Isang kaaway, sa loob ng aking palasyo? Mga kawal! Dakpin ang kabalyerong iyan!
    Direktor (pabulong): Ikaw na, Macario! Labanan mo sila!

The fight. The Sultan walks off; four soldiers come in from the right
wing, one after another, and the student fights them ("Pindutin ang
Atake para lumaban!"). Two punches drop each one. The hearts show; no
gun on a stage. Running out of hearts starts the fight again with the
fallen ones still down. The fight music (intense.mp3) plays until the
last one falls.

    (Macario walks back to his mark beside Maryam, and the Sultan comes
    back to a stage of fallen soldiers; Block 93.)

    Sultan: Natalo... ang lahat ng aking kawal?
  + Macario: Bumagsak na ang iyong kaharian, Sultan. Ibaba mo ang iyong kampilan.
  + Sultan: ...

    (The kampilan falls on the boards.)

  + Sultan: Ang kaharian ng aking mga ninuno... bumagsak sa iisang gabi.
  + Maryam: Ama...
  + Maryam: Patawarin mo ako. Sasama ako kay Don Rodrigo, at tatanggapin ko ang kanyang pananampalataya.
  + Sultan: Kung gayon, wala na akong kaharian... at wala na rin akong anak.
    Mga Manonood: Mabuhay! Mabuhay!

    (A crowd's cheer is heard with the line, since Block 85.)

    [BLACK] Nagsara ang telon.
    [BLACK] Tumayo at pumalakpak ang mga manonood.

    (Applause over the card, since Block 81.)

In the wings. (Macario beside the direktor, Maryam behind him.)

    Direktor: Macario! Narinig mo ba 'yon? Nakatayo ang mga tao!
    Macario: Nanginginig pa rin po ang tuhod ko.
    Direktor: 'Yung linya mo kanina, 'yung "mawalay sa iyo"... hindi ko isinulat 'yon.
    Macario: Pasensya na po. Bigla na lang pong lumabas sa bibig ko.
    Direktor: Pasensya? Isasama ko 'yon sa iskrip!
    Maryam: Hindi ka raw marunong umarte, ha.
    Direktor: Heto, iho. Sa'yo 'yan. Pinaghirapan mo.

    (+79 to 110 barya, at random.)

    Macario: Salamat po!
    Direktor: At kung gusto mo, may puwesto ka sa kompanya namin. Pag-isipan mo, ha?

Completes: Gumanap bilang Don Rodrigo sa dula. The student is free;
Lumabas at the right edge leads back to the street, and the log says so
at the top: "Lumabas ng entablado: pumunta sa kanan" (Block 93). A reload before the
pay plays the play again from backstage.

Block 113, at the proponent's word: the play ends as the moro-moro
did, the Moorish kingdom fallen to the Christian knight and the
princess leaving her father for the knight's faith, the crowd cheering
the fall. It replaced a father's blessing, which softened the genre (a
Spanish-era stage play about who wins) for a Grade 8 room; no
narrative here is softened that way (CLAUDE.md, Writing dialogue). The
four new lines are ours (+).

### 10. The Mananahi at the play

tondo, outside the entablado (x 13250), where she has come to watch;
since Block 85, so that she is not a walk back across the street. She
no longer pays (Block 89): the work paid each time. No task waits on
her. Talk:

    Mananahi: Macario! Nanood ako sa likod. Ikaw pala ang bumida!
    Macario: Nawala po kasi 'yung artista nila. Ako na lang po ang pinagsuot ng damit.
    Mananahi: Aba, e 'di ikaw pala ang unang nagsuot ng tinahi ko! Kasya ba?
    Macario: Kasyang-kasya po.
    Mananahi: Sabi ko na nga ba.

### 11. The savings

tondo, x 2000. The button reads Ibigay ang ipon, and appears once the
play is done and he holds 100 barya (Block 89): the play's 79 to 110
and what the work brought in, so anyone short goes back to the horse
or the sewing. 100 barya go to Nanay; Macario keeps the rest.

    Macario: 'Nay, nakapag-ipon na po ako ng pera para makatulong.
    Nanay: Maraming salamat, anak ko! Napakahusay mo! Ginalingan mo ba sa trabaho?
    Macario: Opo, 'Nay. Nagtrabaho po ako sa Kutsero at sa Mananahi.
    Macario: Pati po sa Barbero.
    Macario: Tapos, Nay... umarte pa po ako sa entablado.
    Nanay: Ikaw? Sa entablado?
    Macario: Nagkasakit po kasi 'yung bida nila. Ako na lang po ang ipinalit ng direktor.
    Nanay: Kaya pala hindi mawala-wala 'yang ngiti mo.
    Nanay: Ituloy mo lang 'yan, 'nak. Malayo ang mararating mo sa buhay.
    Macario: Maraming salamat po, 'Nay!

Completes: Mag-ipon para kay Nanay (n/100), which since Block 92 is
also a second line in the log from the moment he has spoken to the
Kutsero, counting the barya as they come in. As she finishes, the
screen goes black.

### 12. Four years on

Plays by itself straight after the savings; a reload before the card
lifts plays it again.

    [BLACK] Pagkalipas ng apat na taon
    [BLACK] Tondo, 1894
    [BLACK] Ngayong gabi sa entablado: Principe Baldovino

    (The card lifts onto the entablado, in the middle of the play.
    Macario on his mark beside Maryam, facing her.)

Principe Baldovino is a komedya, attributed to Huseng Sisiw, that Sakay
is recorded as having acted in; the genre's prince fights the enemy's
armies and wins, usually for a princess. Its text is not to hand, so
the words below are ours, written in the genre (Block 81).

    Maryam: Principe Baldovino! Ikaw ba 'yan? Bihag ako ng kaaway, at bukas ay ilalayo nila ako sa kaharian!
    Macario: Prinsesa, huwag kang mangamba. Walang pader at walang hukbong makahahadlang sa akin.
    Direktor (pabulong): Ayan na ang mga kawal...

The battle. Two of the enemy's soldiers come in from the right wing
and the student fights them (the first play's kawal), with the fight
music, the hearts showing and no gun on a stage. Then he walks back to
her side.

    Maryam: Iniligtas mo ako, mahal kong prinsipe!
    Macario: At tandaan ng lahat ng nakikinig:
    Macario: Walang bayang mananatiling alipin, kung ang mga anak nito ay handang lumaban!
    Direktor (pabulong): Wala na naman 'yan sa iskrip...
    Mga Manonood: ...
    Mga Manonood: Mabuhay si Baldovino!

    (The cheer again.)

    (His own line again, as on his first night; this one is not about
    love. The crowd is quiet for a moment before it cheers.)

    [BLACK] Nagsara ang telon.
    [BLACK] Muling tumayo at pumalakpak ang mga manonood.

    (Applause over the card, as over the first play's.)

In the wings. (Macario beside the direktor, Maryam behind him.)

    Direktor: Macario... 'yung idinagdag mo sa dulo. Wala 'yon sa iskrip.
    Macario: Pasensya na po. Bigla na naman pong lumabas.
    Direktor: Nagustuhan ng mga tao. Pero may guardia civil sa likod ng mga upuan ngayong gabi. Mag-ingat ka.
    Direktor: Pag-uwi mo, huwag mo nang hubarin 'yang damit mo.
    Macario: Po?
    Direktor: Walang guardia na nag-uusisa sa artistang pagod. Tumayo ka lang nang tahimik, iisipin nilang nagpapahinga ka lang.

    (Block 82. He keeps the stage clothes on: the costume the Mananahi
    sewed, first worn as Don Rodrigo. They go into his inventory, worn,
    with a toast, "Suot mo: Damit-Pangteatro". While he stands still in
    them a guard takes five times as long to notice him, and the guard's
    meter is drawn pale blue while they are helping.)

    Maryam: Apat na taon na, pero hindi ka pa rin marunong sumunod sa iskrip, 'no?

### 13. The Katipunan asks

entablado. Straight on from the play; a reload from here plays only
this.

    (Macario walks to stage right. Two men who are not of the company
    come in from the right wing and stop in front of him.)

    Katipunero: Principe Baldovino.
    Macario: Macario po. Sino po sila?
    Katipunero: 'Yung huling linya mo kanina. Wala 'yon sa komedya.
    Katipunero: Linya lang ba 'yon, o pinaniniwalaan mo?
    Macario: ...
    Katipunero: May kaibigan kang nagtanong-tanong tungkol sa amin. Sabi niya, gusto mo raw sumali.
    Macario: Kayo po ba... ang Katipunan?
    Kasama: Hinaan mo ang boses mo.
    Katipunero: Minsan ko lang itatanong. Sigurado ka bang gusto mong sumali?
    Katipunero: Hindi ito komedya. Dito, hindi kahoy ang mga espada.
    Macario (sa isip): Si Nanay...
    Macario (sa isip): Pero kaya nga ako sasali. Para wala nang inang mauubusan ng pambili ng bigas dahil sa cedula.
    Macario: Sigurado po ako.

    (The Katipunero has his answer and walks off into the wing. The
    Kasama stays a moment.)

    Kasama: Paglabas mo, hanapin mo ako sa kalye, bago ang entablado.
    Kasama: Lalapitan mo ako at sasabihin mo: "Anak ng Bayan." Kapag hindi mo 'yon sinabi, hindi kita kilala.
    Macario: Anak ng Bayan.
    Kasama: Hindi rito. Sa labas.

    (They walk off into the right wing. The student is free; Lumabas
    leads back to the street beside the direktor.)

Completes: Gumanap bilang Principe Baldovino.

### 14. The word

tondo, the Kasama at x 12500, left of the direktor. Talk (Usap).

    Macario: Anak ng Bayan.
    Kasama: ...
    Kasama: Walang sumunod sa'yo?
    Macario: Wala po.
    Kasama: Sumunod ka sa akin. Huwag kang lilingon.

    [BLACK] Piniringan ang mga mata ni Macario,
    [BLACK] at dinala siya sa isang lihim na silid sa Tondo.

    (The card lifts onto the pulungan. A recruit was brought in
    blindfolded.)

Completes: Hanapin ang naghihintay sa kalye.

### 15. The oath

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

    Mabalasig: Alisin ang kanyang piring.
    Macario (sa isip): Madilim... itim ang lahat ng kurtina.

    (He looks around the room.)

    Mabalasig: Basahin mo ang nakasulat sa dingding.
    Macario: "Kung may lakas at tapang ka, magpatuloy ka. Kung pag-uusisa lamang ang nagdala sa iyo rito, umalis ka na."
    Mabalasig: Ako ang Mabalasig. Ito na ang huli mong pagkakataong umatras.
    Macario: Hindi po ako aatras.
    Mabalasig: Lumapit ka.

    (Macario walks up to the Mabalasig.)

    Mabalasig: Tatlong tanong. Sagutin mo nang tapat.
    Mabalasig: Ano ang kalagayan ng ating bayan nang dumating ang mga Kastila?
    Macario: May sarili po tayong pamumuhay at pamahalaan. Malaya po tayo.
    Mabalasig: At ano ang kalagayan nito ngayon?
    Macario: Alipin po sa sarili nating lupa.
    Mabalasig: At ano ang maaasahan nito sa darating na panahon?
    Macario: Kalayaan po... kung may lalaban.
    Mabalasig: ...
    Mabalasig: Piringan siyang muli.

    [BLACK] Muling piniringan si Macario.

    Mabalasig: Sa harap mo ay may nagliliyab na apoy. Tumalon ka.
    Macario (sa isip): Wala akong makita...
    Macario (sa isip): Para kay Nanay. Para sa bayan.

    (He jumps, and lands. Shown, not told, since Block 82.)

    Mabalasig: Alisin ang piring.
    Mabalasig: Walang apoy. Tapang mo ang sinubok namin, hindi ang balat mo.

    Mabalasig: Ngayon, ang panunumpa.
    Mabalasig: Isumpa mong ipagtatanggol mo ang Katipunan, iingatan mo ang mga lihim nito, at tutulungan mo ang bawat kapatid sa anumang panganib.
    Macario: Isinusumpa ko po.

    [BLACK] Hiniwaan si Macario sa braso,
    [BLACK] at sa sarili niyang dugo, nilagdaan niya ang panunumpa.

    Mabalasig: Mula ngayon, kapatid ka na namin, Macario. Isa ka nang Katipon, ang unang baitang.
    Mabalasig: Kaya "Anak ng Bayan" ang salitang ibinigay sa iyo. Iyon ang hudyat ng mga Katipon.
    Katipunero: Maligayang pagdating, kapatid. Hindi na linya lang 'yung sinabi mo sa entablado.
    Mabalasig: Heto ang una mong gawain: mga polyeto. Kailangang mabasa ito ng ating mga kababayan.

    (He takes them to the Kasama by the door.)

    Kasama: Sa likod ka dadaan. Ang mangingisda ang pinakamalapit. Ang tabakera, lampas sa patahian. Ang karpintero, malapit na sa entablado.
    Kasama: May mga guardia civil na nagroronda ngayong gabi. Huwag kang dadaan sa harap nila. Magtago ka kung kailangan.
    Kasama: Mabuti't suot mo pa 'yang damit-teatro. Kapag tumigil ka at hindi gumalaw, hindi ka nila agad papansinin.
    Macario: Opo. Ako na po ang bahala.

Completes: Sumapi sa Katipunan. The student is free; the way out,
Lumabas sa likod ("Lumabas sa likod: pumunta sa kaliwa" at the top of
the log, Block 93), leads onto the street at x 4100, short of the
mangingisda, facing right.

### 16. The pamphlets

tondo, at night in the story (the paintings are the day's). The
mangingisda (x 4800), the tabakera (x 6900) and the karpintero
(x 10600), met in that order walking right from the back door, though
any order works. Each button reads Iabot ang polyeto, and Macario says
the same thing to each:

    Macario: Para po sa inyo. Itago n'yo po, at basahin nang palihim.

Mangingisda:

    Mangingisda: Matagal ko nang hinihintay 'to. Sa bangka ko itatago, walang guardia na sumisilip doon.

Tabakera:

    Tabakera: Isisingit ko 'to sa mga tabako. Maraming babae sa pagawaan ang dapat makabasa nito.

Karpintero:

    Karpintero: Katipunan? ...Itatago ko 'to. Ipapabasa ko sa mga kasama ko sa talyer.

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

    Macario (sa isip): Naibigay ko na ang tatlo.
    Macario (sa isip): Dati, barya ang iniipon ko para kay Nanay.
    Macario (sa isip): Ngayon, may mas malaki na akong ipinaglalaban.

    [BLACK] Natapos ang ronda ng mga guardia civil.

    (Block 94. Under the card the guardia civil leave the street and
    their crates with them. It is still night.)

    (Block 95. The Kasama comes to him, wherever he is, from just past
    the edge of the screen, and stops a step in front of him.)

    Kasama: Tapos na ang tatlo?
    Macario: Opo. Walang nakakita sa akin.
    Kasama: Mabuti. Sumunod ka. Hinihintay ka nila sa pulungan.

    [BLACK] Ibinalik siya ng Kasama sa lihim na silid.

Completes: Ipamigay ang mga polyeto (3/3).

### 17. The report

pulungan. Plays by itself on arrival (Block 94). A reload on the street
before it finds the Kasama at his spot (x 12500), who says his last
line again and takes him back.

    Kasama: Narito na siya.
    Macario: Naiabot ko na po ang tatlo.

    (He walks up to the Mabalasig.)

    Mabalasig: Lahat? Sa iisang gabi, at may ronda pa?
    Macario: Nagtago po ako sa likod ng mga kahon. Kapag tumitigil po ako, akala nila artistang pagod lang.
    Katipunero: Sabi ko sa inyo. Hindi lang linya ang alam ng batang 'yan.
    Mabalasig: ...
    Mabalasig: Hindi ka nagmadali, at walang nahuli. Tatandaan namin ang gabing ito, kapatid.

### 18. A year on

Straight on from the report; a reload after it plays only this, from
the card. Block 94, at the proponent's direction: Act I ends the way
The Godfather does. The histories make Sakay the head of a council of
the Katipunan (a sangguniang balangay), never of the Katipunan itself,
whose Supremo was Bonifacio, so that is what he becomes.

    [BLACK] Pagkalipas ng isang taon
    [BLACK] Tondo, 1895

    (The card lifts on the same room. Macario stands at its head, where
    the Mabalasig stood, facing the door; the Mabalasig stands behind
    him and the Katipunero before him.)

    Katipunero: Pangulo, handa na ang mga polyeto para sa susunod na linggo.
    Macario: Hatiin sa tatlo. Iba't ibang daan, iba't ibang gabi.
    Macario: At walang dalawang kapatid na lalabas nang magkasama.
    Katipunero: Masusunod, Pangulo.

    (The Katipunero goes out by the door. The Kasama comes in by it.)

    Kasama: Pangulo. May tatlong gustong sumapi. Naghihintay sila sa kabilang silid.
    Macario: Sino ang nagdala sa kanila?
    Kasama: Ako. Kilala ko ang mga pamilya nila.
    Macario: Piringan sila. Ang Mabalasig ang tatanggap sa kanila, gaya ng pagtanggap niya sa akin.
    Mabalasig: Masusunod.
    Kasama: ...
    Kasama: May isa pa, Pangulo. Nasa pinto ang nanay mo. Hinahanap ka.
    Macario: ...

    (The door. Nanay stands in it. He goes to her, so she does not come
    in.)

    Nanay: Macario, anak. Gabi-gabi ka na lang wala sa bahay.
    Nanay: Sabi ng mga kapitbahay, may mga lihim na pulong daw dito sa Tondo. Hinuhuli raw ng guardia civil ang mga dumadalo.
    Nanay: Anak... hindi ka naman kasali sa mga 'yon, 'di ba?
    Macario: ...
    Macario: Hindi po, 'Nay. Nag-eensayo lang po kami ng bagong komedya.
    Nanay: ...
    Nanay: O siya. Umuwi ka bago mag-umaga, ha?
    Macario: Opo, 'Nay.

    (He turns his back on her and walks to his place. She is still in
    the doorway.)

    Mabalasig: Pangulo, handa na ang mga bagong kapatid.
    Macario: Simulan na natin.

    (The Kasama goes to the door.)

    Kasama: Pangulo.

    (He shuts the door on her. The sound of it, and the room is quiet.)

    [BLACK] Isang taon pa lamang mula nang sumapi siya,
    [BLACK] pinuno na si Macario ng kanyang balangay sa Katipunan.
    [BLACK] Wakas ng Unang Yugto

Completes: Bumalik sa pulungan at mag-ulat, the last task. Act I is
finished, and the post-test runs.

## Repeat lines

What each person says when talked to again, by where the story is.
One line each, on purpose (CLAUDE.md, Writing dialogue).

Nanay:

    Nanay: Mag-iingat ka sa trabaho, anak. At umuwi ka bago dumilim.
    (before the savings)
    Nanay: Ituloy mo lang 'yan, 'nak. Malayo ang mararating mo sa buhay.
    (after)
    Nanay: Lagi ka nang ginagabi, 'nak. Saan ka ba nanggagaling?
    (after he has joined the Katipunan; Scan S22)

Kutsero:

    Kutsero: Nariyan lang si Kabayo. Suklayin mo, may barya ka sa bawat linis.
    (before the first grooming)
    Kutsero: Ang ganda ng trabaho mo. Balik ka lang kung gusto mo pa ng dagdag na barya.
    (while there is more to earn)
    Kutsero: Sapat na 'yan sa ngayon, Macario. Malinis na malinis na si Kabayo.
    (paid all he will pay)

Barbero (Block 94):

    Barbero: Artista ka na raw, Macario. Pero hindi mo pa rin nakakalimutan ang gunting, ha?
    (four years on)
    Barbero: Nariyan ang silya, iho. Tandaan mo lang ang gusto ng suki.
    (while there is more to earn)

Mananahi:

    Mananahi: Ihatid mo na 'yung damit ng direktor, baka hinahanap na nila.
    (sent with the costumes, not yet delivered)
    Mananahi: Nariyan ang tahian, kung gusto mo pa ng dagdag na barya.
    (while there is sewing to do)
    Mananahi: Hinahanap ka raw ng direktor sa entablado. Bilisan mo!
    (delivered, the play not yet done; only an old save reaches this)
    Mananahi: Iuwi mo na 'yang naipon mo sa nanay mo. Matutuwa 'yon.
    (after the first talk outside the entablado)
    Mananahi: Nariyan pa rin ang tahian, iho, kung may oras ka.
    (four years on, while her sewing still pays; Scan S22)
    Mananahi: Kapag may tahi ulit, ipapatawag kita, ha?
    (afterwards, once the sewing has paid all it will)

Direktor, on the street:

    Direktor: Pasensya na, iho, abala kami. Mamayang gabi na ang palabas at ang dami pang kulang.
    (before the Mananahi has sent him)
    Direktor: Ikaw 'yung bata ng Mananahi, 'di ba? Dala mo na ba ang mga damit namin?
    (sent, with the costumes still on him)
    Direktor: O, ano pa'ng hinihintay natin? Tara na sa loob, naghihintay na ang mga tao!
    (Macario agreed but is still outside, after a reload; takes him in)
    Direktor: Hindi pa rin ako makapaniwala. Iniligtas mo ang palabas namin, iho.
    (after the play)
    Direktor: Apat na taon na, iho, at ikaw pa rin ang hinahanap ng mga manonood.
    (four years on)

Direktor and Maryam, in the entablado:

    Direktor: Huminga ka nang malalim, iho. Nandito lang ako sa gilid.
    (before the play)
    Direktor: Bumalik ka rito kahit kailan mo gusto. May puwesto ka sa amin.
    (after)
    Direktor: Magpahinga ka na, iho. May palabas ulit tayo sa Sabado.
    (four years on)
    Maryam: Kaya mo 'yan. Tumingin ka lang sa akin kapag nalito ka.
    (before the play)
    Maryam: Alam mo, mas bagay sa'yo si Don Rodrigo kaysa kay Julian. Huwag mo lang sasabihin sa kanya.
    (after)
    Maryam: Sino 'yung dalawang lalaking kausap mo kanina? Ang seryoso ng mga mukha.
    (four years on, after the two men)

Kasama, on the street:

    Kasama: Ano pa'ng hinihintay mo? Sumunod ka na.
    (the word said, after a reload before the oath; takes him in)
    Kasama: Huwag kang tumambay rito. Ipamigay mo na ang mga polyeto.
    (his last resort; since Block 102 he is off the street during the
    pamphlets, so it is not heard)
    Kasama: Sa pulungan na tayo mag-usap, Pangulo. Maraming mata ang kalye.
    (after the report, Block 95)

In the pulungan, after the oath:

    Kasama: Lumabas ka nang mag-isa. Hindi tayo dapat makitang magkasama.
    Mabalasig: Humayo ka na, kapatid. Naghihintay ang tatlo.
    Katipunero: Sa susunod na palabas mo, manonood ulit ako. Sa likod, gaya ng dati.

In the pulungan, a year on (Block 94):

    Kasama: Umuwi na ang nanay mo, Pangulo. Hindi ko siya pinapasok.
    Mabalasig: Nakapiring na ang tatlo sa kabilang silid, Pangulo.
    Katipunero: Naipadala na ang mga polyeto, Pangulo. Tatlong daan, gaya ng utos mo.

The three, before the pamphlet and after:

    Karpintero: Gabi na, iho. Sarado na ang talyer.
    Karpintero: Wala akong nakita, wala akong narinig. Ingat ka, iho.
    Tabakera: Pagod na ako, iho. Maghapon akong nagbalot ng tabako.
    Tabakera: Kumakalat na sa pagawaan ang ibinigay mo. Mag-ingat ka, ha.
    Mangingisda: Maaga pa ako bukas sa laot. Ano'ng kailangan mo?
    Mangingisda: Nabasa ko na. Ipinasa ko na rin sa kapitbahay.

## The Talaan

Block 70. The papers are the teacher's. Up to three, written on the
dashboard (Talaan Papers); what a teacher writes is not in this file
because it is not in the content. Block 94: the game has three of its
own, facts from the general histories, which lie wherever the teacher
has written nothing; a paper she writes replaces its own slot only.
They are ours, to be checked against the source book:

    [HINT] Si Macario Sakay: Ipinanganak si Macario Sakay sa Tondo, Maynila, noong 1870. Mahirap ang kanyang pamilya, kaya maaga siyang nagtrabaho: naging aprendis siya sa pagawaan ng kalesa, at naging barbero at mananahi.
    [HINT] Ang komedya: Mahilig sa teatro si Sakay. Umarte siya sa mga komedya o moro-moro, mga dula tungkol sa digmaan ng mga kaharian. Isa sa mga ginampanan niya ang Principe Baldovino.
    [HINT] Ang Katipunan: Itinatag ni Andres Bonifacio at ng kanyang mga kasama ang Katipunan noong Hulyo 7, 1892, sa Maynila. Lihim na samahan ito na naglalayong makamit ang kalayaan ng Pilipinas mula sa Espanya. Sumapi si Sakay noong 1894.

Where they lie is fixed:

    Paper 1   x 2500, on the road between Nanay and the Kutsero; every
              student walks into it on the way to the first job
    Paper 2   x 8200, past the Mananahi's sewing, at jump height
    Paper 3   x 12200, before the direktor, at jump height

A slot neither the teacher nor the game fills lays nothing; in Act I
the game fills all three, so the Talaan button is always there. A found paper opens a card over a stopped world:

    (card) Papel 1 / 3
    (under a paper) Naitala ito sa Talaan. Buksan ang Talaan sa pause para basahin ulit.
    (under the last) Nahanap mo na ang lahat ng papel!

and is listed on the pause screen under "Mga Papel". Act I declares no
words (Block 69).

## Act II, beat by beat

Block 113, from the proponent's plot (1896 to 1898), rebuilt the same
day at the proponent's word: it opens at the press, home comes second,
Isko's knock breaks in on Nanay's plea and his promise, nobody knows
the sweep has begun until he has the list, and it is a tragedy, not a
safe story ("we're presenting historical
shit, not wrapping children in a bubble"; CLAUDE.md, Writing dialogue).
Macario leaves his mother for a problem at the press, sets nobody to
watch her because nobody knows she needs it, understands only when he
has the list, and never gets back to her; nobody learns what became of
her. The Kasama dies at San Juan del Monte. Every line is ours, marked
+ here and PLACEHOLDER in content/act2.js, until the proponents accept
or replace it. Every flag starts with a2_.

Places, in order: imprenta (the Katipunan's press, behind a door at x
7900 of the street, 2600 wide), tondo (Act I's street, the same people
where they stood), bahay (home, one room), pugad-lawin, san-juan (the
field before the powder store, 4200 wide), nangka (the river, 2400),
balara (a camp at night) and laguna (Jacinto's camp). Every painting of
Act II is owed (ART.md): until drawn, each place is a dark wall with
its file name on it.

New people, all owed as placeholder boxes: Isko (one of the three
recruits sworn in at the end of Act I, now Macario's man), Jacinto,
Bonifacio (the Supremo), the Manlilimbag (a printer) and the
Tagapagbalita (a messenger). The Kasama, the Katipunero, Nanay and the
street are Act I's art. The soldiers are the bantay's art: the sundalo
of the enemy catalogue charges with the bayonet, and a bantay among them
fires.

Stealth is long in this act, at the proponent's word: four stretches
(the sweep's walk to the press, the press itself, the night's walk and
its chase, the retreat from San Juan del Monte), each a line of guards with cover,
and on each a catch puts Macario back at the last point he passed
(checkpoints that mark themselves, Block 113).

### 1. The first page

imprenta. Plays by itself the first time a student enters Act II.

  + [BLACK] Tondo, Agosto 1896

    (Macario walks to the press.)

  + Jacinto: Dahan-dahan sa diin, Macario. Hinihintay ng bayan ang ikalawang labas.

The press (palimbagan, x 210), its button "Gamitin": the work game (as
the horse in Act I), a sheet under the platen printed a line at each
stroke. The first thing a student does in Act II is print: the second
issue of Kalayaan, the one the histories say was in hand when the
Katipunan was found out.

  + (the game) Palimbagan / Diinan ang palimbagan kapag nasa berde ang guhit.
  + (a good stroke) Malinaw ang limbag!
  + (a missed one) Kumalat ang tinta!
  + (the end) n/5 ang malinaw na pahina.

Completes: Maglimbag ng Kalayaan. Then, by itself:

  + Jacinto: Heto. Ang ikalawang labas ng Kalayaan.
  + Macario: "Inilimbag sa Yokohama" pa rin po?
  + Jacinto: Doon pa rin. Hanggang ngayon, sa kabilang dagat nila hinahanap ang imprenta.
  + Jacinto: Hindi sa ilalim ng ilong nila.
  + Manlilimbag: Ginoo... may usap-usapan sa pagawaan. May kapatid daw na kinabahan, at nagpunta sa kura.
  + Jacinto: ...
  + Jacinto: Usap-usapan lang 'yan.
  + Manlilimbag: Saan ko po itatago ang talaan?
  + Jacinto: Sa ilalim ng palimbagan. Ang mga pangalan ng kasapi, at kung saan sila nakatira.
  + Macario (sa isip): Pati ang pangalan ko. Pati ang bahay namin.
  + Jacinto: Umuwi ka muna, Macario. Ilang gabi ka nang hindi umuuwi.

The rumour of the confession, and the list with where everyone lives,
are set up here. The others, talked to:

  + Jacinto: Pantay na diin, Macario. Ang malabong letra, hindi mababasa ng bayan.
    (before the first page)
  + Jacinto: Umuwi ka na. Hinihintay ka ng nanay mo.
    (after)
  + Manlilimbag: Yokohama, ha. Ni hindi ko alam kung saan 'yon.

### 2. The walk home

tondo, from the press door (x 7900) to Nanay's (x 2000), "Pumasok sa
bahay". No guards yet, but the neighbours are afraid of him already:
the hints, before the sweep. Each says one line; from the sweep on they
are indoors.

  + Kutsero: Hindi kita kilala, iho. Umalis ka na.
  + Mangingisda: Sinunog ko na 'yung ibinigay mo noon. Pasensya na.
  + Barbero: Sarado kami. May nagtanong tungkol sa'yo kaninang umaga. Hindi ko sinabi kung saan ka nakatira.
  + Mananahi (pabulong): May kura raw sa Tondo na may alam na. Umalis ka muna, iho, habang kaya mo pa.
  + Tabakera: Tatlo na ang hinuli sa pagawaan kahapon. Huwag kang lalapit sa akin.
  + Karpintero: Wala akong kilalang Macario. Wala.
  + Direktor: Sarado ang entablado hanggang sa susunod na abiso. Mag-ingat ka, iho.

Maryam (the question she asked in Act I, answered):

  + Maryam: May mga guardia sa entablado kanina. Hinahanap ka.
  + Maryam: Sino ba talaga 'yung dalawang lalaki noon, Macario?
  + Macario: Mas mabuti nang hindi mo alam.

### 3. Home, and the knock

bahay, plays by itself. At the proponent's word, the knock breaks in on
the promise itself: she asks him not to vanish like his father, he
swears to come back, and before he has finished answering her the door
is hammered. Nobody in the room knows the sweep has begun: Isko brings
a problem at the press, nothing more, and Macario goes thinking it will
take an hour.

  + Nanay: Anak! Akala ko kung napaano ka na.

    (He goes to her.)

  + Nanay: Halika, kumain ka.
  + Nanay: ...
  + Nanay: Ano 'to? Tinta?
  + Macario: Sa entablado po, 'Nay. Pinta sa—
  + Nanay: Hindi ganyang kulay ang pinta sa entablado, Macario.
  + Nanay: Noong gabing hinanap kita, may tumawag sa'yo sa pinto. "Pangulo".
  + Macario: 'Nay...
  + Nanay: Hindi ako bingi, anak. Hindi rin bulag ang mga kapitbahay.
  + Nanay: May hinuli na naman daw sa Trozo. Hindi na nakauwi sa pamilya nila.
  + Nanay: Huwag kang makisama sa mga 'yan, anak.
  + Nanay: Ganyan din ang tatay mo. Lumabas isang gabi, sabi babalik bago mag-umaga.
  + Nanay: Hindi ko na siya nakita.
  + Nanay: Hindi kita kayang mawala, Macario. Ikaw na lang ang natitira sa akin.
  + Macario: Hindi po ako mawawala, 'Nay.
  + Macario: Babalik po ako. Pangako.
  + Nanay: ...
  + Nanay: Magluluto ako ng sinigang sa Linggo. Umuwi ka.
  + Macario: Opo, 'Nay. Uuwi p—

    (The door, hammered, three times.)

  + Isko: Pangulo! Pangulo!
  + Nanay: ...

    (Isko comes in.)

  + Isko: Pasensya na po sa abala. May problema po sa imprenta.
  + Isko: Ayaw pong ibigay ng mga manlilimbag 'yung mga papel na ipinalimbag natin.
  + Isko: Kanina pa raw po sarado ang pinto. Walang sumasagot.
  + Macario: Hindi ganyan ang mga tao roon.
  + Macario: Pupuntahan ko.
  + Isko: Sasama po ako—
  + Macario: Hindi. Sabihan mo ang mga kapatid sa pulungan. Baka kailanganin ko sila.
  + Isko: Opo, Pangulo.

    (Isko runs out. Macario turns to her.)

  + Nanay: Macario...
  + Nanay: Kapapangako mo lang.
  + Macario: Sandali lang po ito, 'Nay. Babalik po ako agad.

    (He goes out of the door.)

Completes: Umuwi sa bahay. Nobody is left with her: nobody thinks she
needs anyone. If he goes back in before the press:

  + Nanay: Anak, huwag ka nang lumabas. Pakiusap.

### 4. The street, in the sweep

tondo, outside Nanay's door. He does not know it is a sweep, only that
the street is wrong:

  + Macario (sa isip): Bakit ang daming guardia sa kalye?
  + Macario (sa isip): ...Hindi ako dapat makita.

Nobody is out. Four guardia civil walk between home and the press
(2600 to 3000, 3700 to 4150, 5950 to 6300, 7330 to 7700), each with a
crate in his beat; they catch, not shoot, and a catch puts him back at
the last point he passed. The task: Bumalik sa imprenta.

### 5. The raid, and the list

imprenta, in the sweep. Plays by itself on arrival. Three guardia civil
search the room (1850 to 2200, 1100 to 1500, 400 to 800), each with
cover in his beat, and two high shelves (1580 and 860) stand above
their sight; they catch, not shoot.

  + Macario (sa isip): Bukas ang pinto...
  + Macario (sa isip): Mga guardia... nauna na sila.
  + Manlilimbag (pabulong): Pangulo... dito po.
  + Manlilimbag: Pumasok sila bago pa kami makatakbo. Dinampot nila ang iba.
  + Manlilimbag: Kinuha na nila ang mga resibo at ang mga sulat. Pero ang talaan... nasa ilalim pa ng palimbagan.
  + Macario: Kapag nakita nila 'yon...
  + Manlilimbag: Daan-daang pangalan, Pangulo. Pati ang sa inyo.
  + Macario: Kukunin ko. Lumabas ka na habang abala sila.

Completes: Bumalik sa imprenta. "The printers will not hand over the
papers" was the guards, not the printers. At the press, past
the guards:

  + Macario (sa isip): Nandito... ang talaan ng mga kasapi.
  + Macario (sa isip): ...
  + Macario (sa isip): "Macario Sakay. Tondo. Kasama ang ina."
  + Macario (sa isip): Ang mga resibong kinuha nila... nakasulat din doon ang tirahan namin.
  + Macario (sa isip): Si Nanay!
  + Macario (sa isip): Iniwan ko siyang mag-isa.

Completes: Kunin ang talaan ng mga kasapi ("Tumakas sa bintana at
balikan si Nanay!"). The front door is shut to him now; the back
window, at the left edge, "Tumakas sa bintana":

  + [BLACK] Gabi na nang makalabas siya sa imprenta.

Thoughts and lines around the press:

  + Macario (sa isip): Nasa akin na ang talaan. Sa bintana sa likod ako dadaan.
  + Macario (sa isip): Hindi ako aalis nang wala ang talaan.
  + Macario (sa isip): Bintana sa likod. Daan palabas, kung sakaling magkagulo.
  + Manlilimbag (pabulong): Bilisan n'yo po, Pangulo. Sa ilalim ng palimbagan.

### 6. The night: the chase

tondo, at night, behind the press (x 8050). The street is dark and
nobody is out. On arrival:

  + Macario (sa isip): Kailangan kong maunahan sila sa bahay.
  + Macario (sa isip): Wala akong pinabantay sa kanya. Wala ni isa.

The way home is past two patrols (6500 to 6950, 5000 to 5450), each with
cover. At x 4550, a long way short of her door, it plays by itself:

  + Macario (sa isip): Malapit na ang bahay...
  + Macario (sa isip): Konti na lang, 'Nay.

    (Two guardia civil come round the corner ahead, between him and
    the house.)

  + Bantay: Hoy, sino ka?!
  + Macario (sa isip): Hawak ko ang talaan. Hindi ako puwedeng mahuli.

    (He turns and runs, away from her.)

  + Bantay: Bumalik ka dito!

Completes: Balikan si Nanay. The chase: the two come after him firing,
and two more on the street ahead (7400 to 7750, 9300 to 9650) turn on
him when they see him; two hearts lie on the way, and a catch puts him
back at the last point of the chase he passed (6000, 8000, 10000). At
the end of the street (x 11300), the road out of Tondo, "Tumakas sa
bundok":

  + [BLACK] Tumakas si Macario patungo sa kabundukan.
  + [BLACK] Hindi na siya nakabalik kay Nanay.
  + [BLACK] Natuklasan ang Katipunan.
  + [BLACK] Sa loob ng ilang araw, daan-daan ang hinuli sa Tondo.
  + [BLACK] Agosto 23, 1896
  + [BLACK] Pugad Lawin, Kalookan

Completes: Tumakas papunta sa bundok. He never reaches her door, and
the game never shows what happened to her.

### 7. Pugad Lawin

pugad-lawin. Plays by itself on arrival.

  + Isko: Pangulo! Buhay kayo!
  + Macario: Isko. Si Nanay?
  + Isko: ...
  + Isko: Pumunta po ako sa bahay ninyo kinaumagahan. Wala nang tao. Sira ang pinto.
  + Isko: Walang nakakaalam kung saan siya dinala. O kung... dinala man.
  + Macario: ...
  + Macario: Hindi ko siya pinabantayan.
  + Macario: Inuna ko ang talaan. Ang pangalan ng iba.
  + Isko: Pangulo...
  + Bonifacio: Mga kapatid! Alam na ng mga Kastila ang lahat.
  + Bonifacio: Hinuhuli na nila tayo isa-isa. Kung maghihintay tayo, sa bilangguan tayo mamamatay.
  + Bonifacio: Kaya ngayon, wala nang atrasan.
  + Bonifacio: Ilabas ang inyong mga sedula!

    (Paper torn, twice.)

  + Katipunero: Punitin! Punitin!

The cedula is the student's to tear: Bonifacio's button, "Punitin ang
sedula".

  + Macario (sa isip): Ito ang papel na umubos sa pitaka ni Nanay.
  + Macario (sa isip): Kung nasaan ka man ngayon, 'Nay... para sa'yo ito.
  + Macario: Wala nang sedula. Wala nang alipin.
  + Mga Katipunero: Mabuhay ang Pilipinas!
  + Bonifacio: Ikaw si Sakay, 'di ba? 'Yung artista.
  + Macario: Opo, Supremo.
  + Bonifacio: Napanood kita bilang Baldovino. "Walang bayang mananatiling alipin..."
  + Bonifacio: Akala ko, linya lang. Ngayon, nakikita kong hindi.
  + Bonifacio: Sa makalawa, lulusob tayo sa San Juan del Monte. Sumama ka sa akin.
  + Macario: Opo.

  + [BLACK] Agosto 30, 1896
  + [BLACK] San Juan del Monte

Completes: Punitin ang sedula. The cedula is the one that emptied
Nanay's purse in Act I's opening; the line is the one Bonifacio heard
from the stage (Act I, beat 12). The others there:

  + Isko: Magtatanong-tanong po ako, Pangulo. May makakaalam din kung nasaan siya.
  + Katipunero: Wala nang sedula. Wala nang atrasan.
  + Kasama: Akala ko, nahuli ka na sa Tondo, Pangulo.
  + Bonifacio: Ilabas mo ang sedula mo, kapatid.
    (before)
  + Bonifacio: Sa makalawa, sa San Juan del Monte.
    (after)

### 8. San Juan del Monte

san-juan. Plays by itself on arrival.

  + Bonifacio: Ang polvorin. Doon nakatago ang pulbura at mga armas ng mga Kastila.
  + Bonifacio: Kapag nakuha natin 'yan, may baril na tayo.
  + Kasama: Bolo laban sa riple, Pangulo...
  + Macario: Mas marami tayo.
  + Bonifacio: Sugod!

The battle, at the proponent's word a big one: fifteen soldiers in
four waves, from both sides of the screen, with the fight music and
four hearts on the field. Most charge with the bayonet (sundalo); one
in each of the last two waves is a rifle that fires (bantay). Running
out of hearts starts the wave again, the fallen staying down. Between
waves:

  + Macario (sa isip): May kasunod pa...
  + Bonifacio: Huwag kayong titigil! Malapit na tayo sa polvorin!
  + Macario (sa isip): Ang dami nila...

Then a volley, from the right. The Kasama is beside him.

  + Kasama: Pangulo! Dumating ang mga sundalo mula sa Maynila!
  + Bonifacio: Masyado silang marami! Umatras! Sa ilog!

    (A shot. The Kasama is hit.)

  + Kasama: Ah—!
  + Macario: Kasama!
  + Kasama: Huwag kang lilingon, Pangulo.
  + Kasama: Gaya ng una nating lakad. Huwag kang lilingon.
  + Macario: Hindi kita iiwan—
  + Kasama: Tumakbo ka na!

  + [BLACK] Umatras ang mga Katipunero.

Completes: Lumusob sa San Juan del Monte. "Huwag kang lilingon" is what
the Kasama told him the night he led him in to the oath (Act I, beat
14).

### 9. The retreat

san-juan, from x 3600 back to the river at the left edge ("Umatras sa
ilog, sa kaliwa! Iwasan ang mga sundalo."). Five riflemen patrol the
field between (3000 to 3350, 2300 to 2650, 1600 to 1950, 1000 to 1350,
400 to 750), each with cover in his beat. Seen, a rifleman turns on
Macario and fires until he is punched down; out of hearts, Macario
starts again at the last line he passed. The river's button reads
"Tumawid sa ilog".

  + [BLACK] Mahigit isandaan at limampung Katipunero ang nasawi sa San Juan del Monte.
  + [BLACK] Isa sa kanila ang Kasama.
  + [BLACK] Nagkawatak-watak ang mga nakaligtas.
  + [BLACK] Nobyembre 1896
  + [BLACK] Kabundukan ng Morong

Completes: Umatras sa ilog.

### 10. The Nangka River

nangka. Plays by itself on arrival.

  + Bonifacio: Nakuha natin ang Montalban. Pero babalik sila, at mas marami.
  + Bonifacio: Kulang tayo sa tao. Kaya gagawa tayo ng tao.
  + Macario: Po?
  + Bonifacio: Dayami, Sakay. Dayami at sombrero.
  + Bonifacio: Artista ka, 'di ba? Ito ang pinakamalaki mong entablado.
  + Katipunero: Tatlong bigkis ng dayami ang nasa pampang. Itayo mo, at susuotan namin ng sombrero.
  + Macario (sa isip): Mga artistang hindi humihinga... Sana maniwala ang mga manonood.

Three bundles of straw on the bank (x 1000, 1400, 1800), each with a
button "Itayo": the bundle becomes a scarecrow in a Katipunan hat
("Naitayo ang panakot (n/3)"). Talked to, a scarecrow:

  + Macario (sa isip): Mukha talaga siyang Katipunero. Mas matapang pa nga.

Completes, with the third: Itayo ang mga panakot (3/3). Then, by itself:

  + Katipunero: Ayan na sila! Sa kabilang pampang!

    (Shots, four of them, at straw.)

  + Katipunero: Binabaril nila ang dayami!
  + Bonifacio: Habang abala sila sa mga panakot, sa gilid tayo lulusob. Sugod!

A fight of six, in two waves (the last with a rifle among them).

  + Katipunero: Hindi nila alam kung saan kami nanggaling!
  + Katipunero: Supremo! May dagdag na hukbo mula sa San Mateo!
  + Bonifacio: Hindi natin sila kaya ngayon. Umatras! Sa Balara!

  + [BLACK] Dumating ang dagdag na hukbo ng Espanya.
  + [BLACK] Umatras sina Macario at ang Supremo sa Balara.

Completes: Labanan ang mga Kastila sa ilog. The others there:

  + Katipunero: Tatlong bigkis sa pampang, Pangulo. Itayo mo na.
  + Katipunero: Mga sundalong hindi kumakain. Gusto ko ang ganyan.
  + Isko: Hindi ko pa rin matanggap, Pangulo. Ang Kasama...

### 11. Balara

balara, at night. Plays by itself on arrival: a messenger runs in.

  + Tagapagbalita: Supremo! Balita mula sa Cavite!
  + Tagapagbalita: Itinaboy ng mga tauhan ni Aguinaldo ang mga Kastila!
  + Katipunero: Sa Cavite, nananalo sila. Tayo rito, umaatras.
  + Bonifacio: ...
  + Bonifacio: Mabuti. Iisang Katipunan lang tayo.

Then free. Bonifacio, by the fire:

  + Bonifacio: Hindi ka pa natutulog, Sakay?
  + Macario: Hindi po ako makatulog, Supremo.
  + Bonifacio: Saan ka natutong lumaban?
  + Macario: Sa entablado po. Kahoy na espada.
  + Bonifacio: Ako rin, alam mo ba? Umarte rin ako sa mga komedya noon.
  + Bonifacio: Ang pinagkaiba lang, dito, hindi na bumabangon ang namamatay.
  + Macario: ...
  + Bonifacio: May naiwan ka ba sa Tondo, Sakay?
  + Macario: Ang nanay ko po. Hindi ko alam kung buhay pa siya.
  + Bonifacio: ...
  + Bonifacio: Lahat tayo may iniwan. Ang tanong lang, may babalikan pa ba tayo.
  + Bonifacio: Pupunta ako sa Cavite. Kailangang magkaisa ang Katipunan.
  + Bonifacio: Matulog ka na.

Completes: Kausapin ang Supremo. Bonifacio is recorded as having acted
in amateur theatre; Maryam's "kahoy lang ang mga espada" (Act I, the
play) and the Katipunero's "dito, hindi kahoy ang mga espada" come back
in it. He goes to Cavite, and does not come back.

  + [BLACK] Marso 1897, Tejeros.
  + [BLACK] Nahati ang himagsikan.
  + [BLACK] Mayo 10, 1897.
  + [BLACK] Pinatay si Andres Bonifacio ng sarili niyang mga kasama.
  + [BLACK] Laguna, 1897

The others there:

  + Katipunero: Kung tutulong lang sana ang Cavite...
  + Isko: Hindi po ako makatulog. Naririnig ko pa rin ang mga riple.
  + Bonifacio: Matulog ka na, Sakay.

### 12. Laguna

laguna. Plays by itself on arrival.

  + Macario: Ginoong Jacinto.
  + Jacinto: Macario. Buhay ka pa.
  + Macario: Totoo po ba? Ang Supremo...
  + Jacinto: Totoo.
  + Jacinto: Nilitis siya ng mga taga-Cavite, at ipinapatay.
  + Macario: ...
  + Jacinto: Sa kanila na ang pamahalaan nila. Pero sa atin pa rin ang Katipunan na itinatag niya.
  + Macario (sa isip): Hindi ako susunod sa pumatay sa Supremo.
  + Jacinto: Magpahinga ka muna. Mahaba pa ang laban.

Completes: Sumama kay Jacinto sa Laguna. The others there:

  + Katipunero: Hindi pa rin ako makapaniwala. Ang Supremo... sa kamay ng kapwa natin.
  + Isko: Nagtanong-tanong po ako sa mga galing Tondo. Wala pa ring nakakita kay Nanay ninyo.

### 13. The end of Act II

laguna. Jacinto, talked to again:

  + Jacinto: Kakaunti na lang tayo, Macario. Hindi kita pipigilan kung aalis ka.
  + Macario: Hindi po ako aalis.
  + Macario: Sa Katipunan ako nanumpa, sa harap ng Mabalasig. Hindi sa kanila.
  + Jacinto: Kung gayon, dito tayo. Hanggang dulo.

  + [BLACK] Disyembre 1897. Sa Biak-na-Bato, lumagda ng kasunduan ang mga pinuno ng himagsikan,
  + [BLACK] at naglayag sila patungong Hong Kong.
  + [BLACK] 1898. Dumating ang mga Amerikano.
  + [BLACK] Hunyo 12, 1898. Idineklara ang kalayaan sa Kawit.
  + [BLACK] Disyembre 1898. Ipinagbili ng Espanya ang Pilipinas sa Amerika
  + [BLACK] sa halagang dalawampung milyong dolyar.

    (The last card lifts on the camp.)

  + Macario (sa isip): Dati, isang sedula ang halaga ko sa mga Kastila.
  + Macario (sa isip): Ngayon, ipinagbili nila ang buong bayan, na para bang kanila.
  + Macario (sa isip): At si Nanay... hindi ko pa rin alam kung nasaan siya.
  + Macario (sa isip): Babalik po ako, 'Nay. Pangako.
  + Jacinto: Hindi pa tapos, Macario.
  + Macario: Hindi pa po.

  + [BLACK] Wakas ng Ikalawang Yugto

Completes: Kausapin si Jacinto, the last task. Act II is finished, and
the post-test runs. Afterwards:

  + Jacinto: Hanggang dulo, Macario.

### Act II's Talaan

Three papers of facts of the game's own, on the street (fixed: x 2600 on
the road; x 4500 and x 6100 at jump height); a teacher's paper replaces
its own slot.

  + [HINT] Ang Kalayaan: Kalayaan ang pahayagan ng Katipunan. Inilimbag ito noong Marso 1896, at si Emilio Jacinto ang patnugot nito. Nakasulat dito na sa Yokohama, Hapon, ito inilimbag, para linlangin ang mga Kastila. Matapos itong lumabas, libu-libo ang sumapi sa Katipunan.
  + [HINT] Ang pagkatuklas: Noong Agosto 19, 1896, ipinagtapat ng isang kasapi, si Teodoro Patiño, ang lihim ng Katipunan kay Padre Mariano Gil, ang kura ng Tondo. Hinalughog ng mga Kastila ang isang imprenta, at nagsimula ang malawakang paghuli.
  + [HINT] Ang Sigaw at ang San Juan del Monte: Noong huling linggo ng Agosto 1896, pinunit ng mga Katipunero ang kanilang mga sedula bilang tanda ng paghihimagsik. Noong Agosto 30, 1896, nilusob nila ang polvorin ng mga Kastila sa San Juan del Monte. Mahigit 150 Katipunero ang nasawi.

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
    Nanay. Does not know he has joined. A year on she asks him outright
      and he lies to her face; the door is shut on her (Block 94).
    The Katipunan. A year on, 1895, Macario heads his own council and
      gives its orders; three recruits wait to be sworn in. Act II starts
      from here, and from the lie.
    The barbershop. The Barbero, and the cut done in the order the
      customer asks, are the third job; nothing later returns to them.

    Act II's (Block 113), for Act III:

    Nanay. Her fate unknown: the door broken, the house empty, nobody
      in Tondo has seen her. "Babalik po ako, 'Nay. Pangako." "Sandali
      lang po ito." He left nobody with her, and he knows it.
    The father. Nanay names him: he went out one night and never came
      back. Still never answered; now the son has done the same.
    Isko. Macario's man since the raid; still asking after Nanay.
    The Kasama. Dead at San Juan del Monte.
    Jacinto. "Hanggang dulo." The Katipunan Bonifacio founded is still
      theirs, apart from Aguinaldo's government.
    The Americans. Arrived in 1898; the country sold to them in
      December. Act III starts from here.
    The cedula. Torn at Pugad Lawin, for her; set against the twenty
      million.

## Open questions for the proponents

Act I. The proponents accepted it on 4 Oct 2026 (Block 113): every line
of ours, the names ours gave (Julian, Don Rodrigo, the Sultan, the
Katipunero, the Kasama, the three and the Suki), the play and its
ending, the years (1890, 1894, 1895), the head of his council, the
barber's tools, the direktor's pay and the Talaan's three papers. Nothing
is open in Act I.

Act II (Block 113). Every + line: accept, rewrite or replace. Also:

    The names ours gave: Isko, the Manlilimbag, the Tagapagbalita.
    Bonifacio and Jacinto speak words of ours; check them against the
      source book, and Bonifacio's having acted (his amateur theatre).
    The press: the histories put Kalayaan's printing in early 1896 and
      the lithographic stone found at the Diario de Manila; the game's
      press is the Katipunan's own room, raided, so the list under it
      is ours, and so are the receipts with addresses.
    Pugad Lawin, 23 August, for the cedulas (the official date and
      place; Balintawak and 26 August are the older tradition).
    Nanay's fate, the Kasama's death at San Juan del Monte, and the
      chase short of her door: ours and the proponent's (a tragedy, not
      a safe story).
    The Talaan's three papers of Act II.

Act I's play (Block 113, the proponent's direction): the moro-moro now
ends with the Moorish kingdom's fall and the princess taking the
knight's faith; the four new lines are ours.
