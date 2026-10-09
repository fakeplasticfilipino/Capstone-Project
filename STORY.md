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

content/act1.js to act4.js are what ships. This file is their script,
and the two are changed together, in the same change, or the story is
wrong in one of them. prepare.js (and so the hook, CI and
verify_new_scene.js) checks that every line of dialogue and every black
card of every act appears here word for word, and fails if one does
not.

How to read the script:

    Speaker: line          the proponents' own line, as given
  + Speaker: line          ours, marked PLACEHOLDER in the content file,
                           until the proponents accept or replace it.
                           Act I's were accepted on 4 Oct 2026 (Block
                           113), Acts II to IV's on 9 Oct 2026, so the
                           + is gone from them; it marks only lines
                           written since (Act I's later additions)
    [BLACK] line           a black card (playIntertitle)
    [HINT] Title: text     a hint for the post-test, found on the road
    (stage direction)      what happens, not what is said

Lines of ours are written to the standard in CLAUDE.md, Conventions,
Writing dialogue. The proponents' lines are never rewritten to match
ours. Since Block 93 their spelling and grammar are corrected, at their
request, with the wording and the meaning kept (po rather than 'ho,
'Nay, rin and rito after a vowel, 'yung, no "Okay").

Last updated: 9 Oct 2026, Block 127 (Acts II to IV accepted by the
proponents: the + is out of their chapters and their open questions
closed). Before that, 5 Oct 2026, Block 120 (the pacing pass: Act II's press
door nearer home, the scarecrows in the fight, Paris read from a paper
in Laguna; Act III's Palanan told by Isko, the law in the middle of the
petition and the last name refused, an empty house, the cell in
Bilibid, the flag held; Act IV's bell heard, the fights out of the post
and into Malabon's plaza, the drill for Tanay, the crowd seen and the
Kutsero nearer; every new line +). Before that, Block 119 (Act IV,
1903 to 1907, beat by beat, every line +, each beat tagged). Before
that, Block 118 (Act III revised against the
proponent's labelled sources: Santa Mesa heard of, not shown; the
Partido Nacionalista's founding and Macario its Secretary-General, with
Poblete; the Sedition Law read from a notice; President and
Generalissimo, and the Republic's flag; each beat tagged [CONTEXT],
[MACARIO] or [INSERT]). Before that, Block 117 (Act III, 1899 to 1902,
beat by beat, every line +). Before that, 4 Oct 2026, Block 114 (each job done once; the barber's
game a haircut, with new lines for the Barbero and the customer, +; the
proponents' lines that promised pay for every round reworded, +, the
old wording beside them). Block 116 changes no story: a guest plays on
from Act I into Act II. Before that, Block 113 (Act II, 1896 to 1898,
beat by beat; Act I's lines accepted by the proponents, the + gone from
them). Before
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
is, grooming a kutsero's horse, cutting a customer's hair at a barber's
chair and helping a mananahi sew, a few barya each, until she stops him and sends him with the
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
sino ka?! Bumalik ka rito!") and chased the other way, out of Tondo, to
the mountains. He never gets back. Nobody learns what became of her. In
the hills he tears up his cedula for her, charges the powder store at
San Juan del Monte, where the Kasama dies telling him not to look back,
raises straw soldiers at the Nangka, and hears by a fire at Balara that
Bonifacio, too, left someone. In 1897 Bonifacio is killed by his own
side; Macario stays with Jacinto in Laguna. On black: Biak-na-Bato, the
Americans, Kawit; then a paper from Manila, read aloud in the camp:
Spain has sold the country for twenty million dollars, a price he sets
against the cedula, and his promise to Nanay still unkept.

Act III, Ang Republika sa Lilim (Blocks 117, 118), 1899 to 1902. Santa
Mesa reaches him in the hills as news, and he fights on. In Tondo under
American guard he learns Jacinto is dead, and Maryam dresses him as a
taho seller to reach the barbershop, where he cuts an American's hair
and teaches Bonifacio's creed to the three who once refused him. Isko
surrenders to go home to his child. Macario is at the founding of the
Partido Nacionalista and its Secretary-General, until the Sedition Law
makes asking for freedom a crime. Taken at an oath, released under the
amnesty, he founds the Republika ng Katagalugan at Morong, its President
and Generalissimo, raises its flag, and swears not to cut his hair until
the country is free. The Brigandage Act calls him a bandit.

Act IV, Ang Mapait na Ani (Block 119), 1903 to 1907. He governs from the
mountains, raids a post for guns and uniforms, prints a manifesto, and
plans one last performance: his men take Tanay in the Constabulary's
uniforms (whether he went, the record does not say). After Malabon the
Americans herd the villages into camps and his army starves. Dominador
Gómez brings the promise of an Assembly that can open only when the last
fighter comes down; Macario names his terms and comes down to a crowd
that knows him by his hair. At a reception in Cavite he is seized at the
toast. Tried for bandolerismo, sentenced to death, he hears the Assembly
elected through the bars of Bilibid. On 13 September 1907 he walks to
the scaffold and says that they were never bandits. The Assembly opens
thirty-three days later. Nobody ever learns what became of his mother.

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
  + Kutsero: Suklayin mo siya, at may bayad ka sa akin.

The last line was the proponents' "Bawat linis na matapos mo, may bayad
ka sa akin", reworded in Block 114 when the jobs became one round each.

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
one while he shies from a bad one. Since Block 114 it is played once,
at the proponent's word: the round pays 8 to 12 barya by the good
strokes (5 pay 12, none pay 8), and afterwards the horse gives a
thought instead of a game. A round cut short pays nothing and can be
started again.

    (the game) Kabayo / Suklayin siya kapag nasa berde ang guhit.
    (a good stroke) Hiiiii!
    (a missed one) Umiwas ang kabayo!
    (the end) n/5 ang maayos. +n barya
  + Macario (sa isip): Malinis na si Kabayo. Wala na akong gagawin dito.
    (the horse, afterwards)

Completes: Alagaan ang kabayo ng Kutsero.

### 4. The Kutsero, afterwards

    Kutsero: Sapat na 'yan sa ngayon, Macario. Malinis na malinis na si Kabayo.

Said, with no game, once the horse has been groomed. Before that, see
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
  + Barbero: O, siya. May suki sa silya, kanina pa naghihintay.
  + Barbero: Sundan mo lang ang guhit. Huwag mong lalampasan.
  + Macario: Opo.
  + Macario (sa isip): Gunting lang 'yan. Kaya ko 'to... siguro.

The chair's button reads Gupitin. Before he has been spoken to:

    Macario (sa isip): Silya ito ng Barbero. Kausapin ko muna siya.

The barber's game is his own (Block 114, game.js, playCutGame,
replacing Block 94's memory game of tools at the proponent's word): a
haircut. The customer sits in the chair, drawn in pixels, front on,
his hair grown out over his ears and down his forehead, a barber's
striped cape at his neck, and a dashed yellow line around the cut he
wants: close on top, short at the sides. Scissors follow the finger
(held a little above it), the mouse with its button down, or the arrow
keys. Hair past the line falls onto the cape; hair inside it is cut too
short. Once nearly all of it is gone the last strands fall by
themselves and the customer looks at himself. It cannot be failed: it
pays 8 to 12 barya by how little was cut too short. Leaving first pays
nothing, and the chair waits.

  + (the game) Barberya / Gupitin ang buhok na lampas sa guhit.
  + Suki: Maikli sa gilid, iho. Huwag mong uubusin sa ibabaw.
  + Suki: Aray! Ang ikli!
    (a cut inside the line)
  + Suki: Aba, parang bagong tao ako! +n barya
    (a clean cut)
  + Suki: Hmm... puwede na. +n barya
    (a rough one)
  + Barbero: Hindi masama para sa tagasuklay ng kabayo. Heto ang bayad mo.
  + Macario (sa isip): Wala nang nakaupo. Tapos na ako rito.
    (the chair, afterwards)

Completes: Magtrabaho sa barberya.

### 6. The Mananahi

tondo, x 6400. Talk. Before the barber's game she sends him there
(Block 94), so the jobs are met in the order the log gives them:

    Mananahi: Wala pa akong maipapatahi sa'yo ngayon, iho. Pero balita ko, naghahanap ng katulong ang Barbero. Puntahan mo muna siya.

After it:

    Macario: Mananahi, tumatanggap po ba kayo ng trabahador?
    Mananahi: Oo naman, Macario. Kumusta na ang inay mo?
    Macario: Ayos lang po. Nangangailangan lang po kami ng pera ngayon.
    Mananahi: O, sige, sige. Tara rito.
  + Mananahi: Nariyan ang tahian. Tulungan mo akong magtahi, may bayad ka pagkatapos.

The last line was the proponents' "...may bayad ang bawat matapos mo",
reworded in Block 114.

Completes: Kausapin ang Mananahi.

### 7. The sewing, and being stopped

tondo, x 6540, beside her, at her table (tahian.png, owed: a
placeholder box until it is drawn, Block 93). The same game as the horse with the sewing's
words, the button reading Manahi, played by holding the button to fill
the bar and letting go over the green (Block 90), a cloth that gains a
stitch at each stroke; the same pay, 8 to 12, once. Before she has
been spoken to:

    Macario (sa isip): Tahian ito ng Mananahi. Kausapin ko muna siya.

    (the game) Pananahi / Hawakan ang pindutan, bitawan kapag nasa berde.
    (a good stroke) Diretso ang tahi!
    (a missed one, or held too long) Baluktot ang tahi! / Napatid ang sinulid!

When the round is done she stops him, the one thing here that is
scripted (Block 114: after one round; it was two):

    Mananahi: Macario, teka! Ihinto mo muna 'yan.
    Macario: Po? May mali po ba sa tahi ko?
    Mananahi: Wala, wala. Nakalimutan ko lang ang mas mahalaga.
    Mananahi: 'Yung mga damit ng direktor para sa palabas mamayang gabi. Kanina pa dapat nakarating 'yon.
    Mananahi: Ikaw na ang magdala. Nasa dulo pa ng kalye ang entablado.
    Macario: Sige po, ihahatid ko na ngayon.
    Mananahi: Bilisan mo, ha. Huwag mong ibababa sa daan 'yan.

Completes: Tulungan ang Mananahi sa pananahi. With the costumes on
him the sewing waits:

    Macario (sa isip): May dala akong damit para sa direktor. Ihahatid ko muna.

and afterwards the table gives a thought instead of a game:

  + Macario (sa isip): Tapos na ang tahi ko rito.

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

  + Kutsero: Nariyan lang si Kabayo. Suklayin mo, at babayaran kita.
    (before the grooming; the proponents' "...may barya ka sa bawat
    linis", reworded in Block 114)
    Kutsero: Sapat na 'yan sa ngayon, Macario. Malinis na malinis na si Kabayo.
    (after it)

Barbero (Block 94):

    Barbero: Artista ka na raw, Macario. Pero hindi mo pa rin nakakalimutan ang gunting, ha?
    (four years on)
  + Barbero: Nariyan ang suki, iho. Sundan mo lang ang guhit.
    (before the haircut)
  + Barbero: Wala nang suki ngayon, iho. Salamat sa tulong mo.
    (after it)

Mananahi:

    Mananahi: Ihatid mo na 'yung damit ng direktor, baka hinahanap na nila.
    (sent with the costumes, not yet delivered)
  + Mananahi: Nariyan ang tahian, iho. Simulan mo na.
    (before the sewing)
    Mananahi: Hinahanap ka raw ng direktor sa entablado. Bilisan mo!
    (delivered, the play not yet done; only an old save reaches this)
    Mananahi: Iuwi mo na 'yang naipon mo sa nanay mo. Matutuwa 'yon.
    (after the first talk outside the entablado)
    Mananahi: Kapag may tahi ulit, ipapatawag kita, ha?
    (four years on)

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
her. The Kasama dies at San Juan del Monte. Every line is ours,
accepted by the proponents on 9 Oct 2026. Every flag starts with a2_.

Places, in order: imprenta (the Katipunan's press, behind a door at x
6650 of the street since Block 120, between the Mananahi and the
tabakera, so the walk home and the walk back are a quarter shorter;
2600 wide), tondo (Act I's street, the same people
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

    [BLACK] Tondo, Agosto 1896

    (Macario walks to the press.)

    Jacinto: Dahan-dahan sa diin, Macario. Hinihintay ng bayan ang ikalawang labas.

The press (palimbagan, x 210), its button "Gamitin": the work game (as
the horse in Act I), a sheet under the platen printed a line at each
stroke. The first thing a student does in Act II is print: the second
issue of Kalayaan, the one the histories say was in hand when the
Katipunan was found out.

    (the game) Palimbagan / Diinan ang palimbagan kapag nasa berde ang guhit.
    (a good stroke) Malinaw ang limbag!
    (a missed one) Kumalat ang tinta!
    (the end) n/5 ang malinaw na pahina.

Played once (Block 114); the press afterwards, until the sweep:

    Macario (sa isip): Tapos na ang limbag ko. Sa iba na ang susunod na pahina.

Completes: Maglimbag ng Kalayaan. Then, by itself:

    Jacinto: Heto. Ang ikalawang labas ng Kalayaan.
    Macario: "Inilimbag sa Yokohama" pa rin po?
    Jacinto: Doon pa rin. Hanggang ngayon, sa kabilang dagat nila hinahanap ang imprenta.
    Jacinto: Hindi sa ilalim ng ilong nila.
    Manlilimbag: Ginoo... may usap-usapan sa pagawaan. May kapatid daw na kinabahan, at nagpunta sa kura.
    Jacinto: ...
    Jacinto: Usap-usapan lang 'yan.
    Manlilimbag: Saan ko po itatago ang talaan?
    Jacinto: Sa ilalim ng palimbagan. Ang mga pangalan ng kasapi, at kung saan sila nakatira.
    Macario (sa isip): Pati ang pangalan ko. Pati ang bahay namin.
    Jacinto: Umuwi ka muna, Macario. Ilang gabi ka nang hindi umuuwi.

The rumour of the confession, and the list with where everyone lives,
are set up here. The others, talked to:

    Jacinto: Pantay na diin, Macario. Ang malabong letra, hindi mababasa ng bayan.
    (before the first page)
    Jacinto: Umuwi ka na. Hinihintay ka ng nanay mo.
    (after)
    Manlilimbag: Yokohama, ha. Ni hindi ko alam kung saan 'yon.

### 2. The walk home

tondo, from the press door (x 6650) to Nanay's (x 2000), "Pumasok sa
bahay". No guards yet, but the neighbours are afraid of him already:
the hints, before the sweep. Each says one line; from the sweep on they
are indoors.

    Kutsero: Hindi kita kilala, iho. Umalis ka na.
    Mangingisda: Sinunog ko na 'yung ibinigay mo noon. Pasensya na.
    Barbero: Sarado kami. May nagtanong tungkol sa'yo kaninang umaga. Hindi ko sinabi kung saan ka nakatira.
    Mananahi (pabulong): May kura raw sa Tondo na may alam na. Umalis ka muna, iho, habang kaya mo pa.
    Tabakera: Tatlo na ang hinuli sa pagawaan kahapon. Huwag kang lalapit sa akin.
    Karpintero: Wala akong kilalang Macario. Wala.
    Direktor: Sarado ang entablado hanggang sa susunod na abiso. Mag-ingat ka, iho.

Maryam (the question she asked in Act I, answered):

    Maryam: May mga guardia sa entablado kanina. Hinahanap ka.
    Maryam: Sino ba talaga 'yung dalawang lalaki noon, Macario?
    Macario: Mas mabuti nang hindi mo alam.

### 3. Home, and the knock

bahay, plays by itself. At the proponent's word, the knock breaks in on
the promise itself: she asks him not to vanish like his father, he
swears to come back, and before he has finished answering her the door
is hammered. Nobody in the room knows the sweep has begun: Isko brings
a problem at the press, nothing more, and Macario goes thinking it will
take an hour.

    Nanay: Anak! Akala ko kung napaano ka na.

    (He goes to her.)

    Nanay: Halika, kumain ka.
    Nanay: ...
    Nanay: Ano 'to? Tinta?
    Macario: Sa entablado po, 'Nay. Pinta sa—
    Nanay: Hindi ganyang kulay ang pinta sa entablado, Macario.
    Nanay: Noong gabing hinanap kita, may tumawag sa'yo sa pinto. "Pangulo".
    Macario: 'Nay...
    Nanay: Hindi ako bingi, anak. Hindi rin bulag ang mga kapitbahay.
    Nanay: May hinuli na naman daw sa Trozo. Hindi na nakauwi sa pamilya nila.
    Nanay: Huwag kang makisama sa mga 'yan, anak.
    Nanay: Ganyan din ang tatay mo. Lumabas isang gabi, sabi babalik bago mag-umaga.
    Nanay: Hindi ko na siya nakita.
    Nanay: Hindi kita kayang mawala, Macario. Ikaw na lang ang natitira sa akin.
    Macario: Hindi po ako mawawala, 'Nay.
    Macario: Babalik po ako. Pangako.
    Nanay: ...
    Nanay: Magluluto ako ng sinigang sa Linggo. Umuwi ka.
    Macario: Opo, 'Nay. Uuwi p—

    (The door, hammered, three times.)

    Isko: Pangulo! Pangulo!
    Nanay: ...

    (Isko comes in.)

    Isko: Pasensya na po sa abala. May problema po sa imprenta.
    Isko: Ayaw pong ibigay ng mga manlilimbag 'yung mga papel na ipinalimbag natin.
    Isko: Kanina pa raw po sarado ang pinto. Walang sumasagot.
    Macario: Hindi ganyan ang mga tao roon.
    Macario: Pupuntahan ko.
    Isko: Sasama po ako—
    Macario: Hindi. Sabihan mo ang mga kapatid sa pulungan. Baka kailanganin ko sila.
    Isko: Opo, Pangulo.

    (Isko runs out. Macario turns to her.)

    Nanay: Macario...
    Nanay: Kapapangako mo lang.
    Macario: Sandali lang po ito, 'Nay. Babalik po ako agad.

    (He goes out of the door.)

Completes: Umuwi sa bahay. Nobody is left with her: nobody thinks she
needs anyone. If he goes back in before the press:

    Nanay: Anak, huwag ka nang lumabas. Pakiusap.

### 4. The street, in the sweep

tondo, outside Nanay's door. He does not know it is a sweep, only that
the street is wrong:

    Macario (sa isip): Bakit ang daming guardia sa kalye?
    Macario (sa isip): ...Hindi ako dapat makita.

Nobody is out. Four guardia civil walk between home and the press
(2600 to 3000, 3700 to 4150, 4900 to 5250, 5950 to 6300), each with a
crate in his beat; they catch, not shoot, and a catch puts him back at
the last point he passed. The task: Bumalik sa imprenta.

### 5. The raid, and the list

imprenta, in the sweep. Plays by itself on arrival. Three guardia civil
search the room (1850 to 2200, 1100 to 1500, 400 to 800), each with
cover in his beat, and two high shelves (1580 and 860) stand above
their sight; they catch, not shoot.

    Macario (sa isip): Bukas ang pinto...
    Macario (sa isip): Mga guardia... nauna na sila.
    Manlilimbag (pabulong): Pangulo... dito po.
    Manlilimbag: Pumasok sila bago pa kami makatakbo. Dinampot nila ang iba.
    Manlilimbag: Kinuha na nila ang mga resibo at ang mga sulat. Pero ang talaan... nasa ilalim pa ng palimbagan.
    Macario: Kapag nakita nila 'yon...
    Manlilimbag: Daan-daang pangalan, Pangulo. Pati ang sa inyo.
    Macario: Kukunin ko. Lumabas ka na habang abala sila.

Completes: Bumalik sa imprenta. "The printers will not hand over the
papers" was the guards, not the printers. At the press, past
the guards:

    Macario (sa isip): Nandito... ang talaan ng mga kasapi.
    Macario (sa isip): ...
    Macario (sa isip): "Macario Sakay. Tondo. Kasama ang ina."
    Macario (sa isip): Ang mga resibong kinuha nila... nakasulat din doon ang tirahan namin.
    Macario (sa isip): Si Nanay!
    Macario (sa isip): Iniwan ko siyang mag-isa.

Completes: Kunin ang talaan ng mga kasapi ("Tumakas sa bintana at
balikan si Nanay!"). The front door is shut to him now; the back
window, at the left edge, "Tumakas sa bintana":

    [BLACK] Gabi na nang makalabas siya sa imprenta.

Thoughts and lines around the press:

    Macario (sa isip): Nasa akin na ang talaan. Sa bintana sa likod ako dadaan.
    Macario (sa isip): Hindi ako aalis nang wala ang talaan.
    Macario (sa isip): Bintana sa likod. Daan palabas, kung sakaling magkagulo.
    Manlilimbag (pabulong): Bilisan n'yo po, Pangulo. Sa ilalim ng palimbagan.

### 6. The night: the chase

tondo, at night, behind the press (x 6800). The street is dark and
nobody is out. On arrival:

    Macario (sa isip): Kailangan kong maunahan sila sa bahay.
    Macario (sa isip): Wala akong pinabantay sa kanya. Wala ni isa.

The way home is past two patrols (5950 to 6350, 5000 to 5400), each with
cover. At x 4550, a long way short of her door, it plays by itself:

    Macario (sa isip): Malapit na ang bahay...
    Macario (sa isip): Konti na lang, 'Nay.

    (Two guardia civil come round the corner ahead, between him and
    the house.)

    Bantay: Hoy, sino ka?!
    Macario (sa isip): Hawak ko ang talaan. Hindi ako puwedeng mahuli.

    (He turns and runs, away from her.)

    Bantay: Bumalik ka rito!

Completes: Balikan si Nanay. The chase: the two come after him firing,
and two more on the street ahead (7400 to 7750, 9300 to 9650) turn on
him when they see him; two hearts lie on the way, and a catch puts him
back at the last point of the chase he passed (6000, 8000, 10000). At
the end of the street (x 11300), the road out of Tondo, "Tumakas sa
bundok":

    [BLACK] Tumakas si Macario patungo sa kabundukan.
    [BLACK] Hindi na siya nakabalik kay Nanay.
    [BLACK] Natuklasan ang Katipunan.
    [BLACK] Sa loob ng ilang araw, daan-daan ang hinuli sa Tondo.
    [BLACK] Agosto 23, 1896
    [BLACK] Pugad Lawin, Kalookan

Completes: Tumakas papunta sa bundok. He never reaches her door, and
the game never shows what happened to her.

### 7. Pugad Lawin

pugad-lawin. Plays by itself on arrival.

    Isko: Pangulo! Buhay kayo!
    Macario: Isko. Si Nanay?
    Isko: ...
    Isko: Pumunta po ako sa bahay ninyo kinaumagahan. Wala nang tao. Sira ang pinto.
    Isko: Walang nakakaalam kung saan siya dinala. O kung... dinala man.
    Macario: ...
    Macario: Hindi ko siya pinabantayan.
    Macario: Inuna ko ang talaan. Ang pangalan ng iba.
    Isko: Pangulo...
    Bonifacio: Mga kapatid! Alam na ng mga Kastila ang lahat.
    Bonifacio: Hinuhuli na nila tayo isa-isa. Kung maghihintay tayo, sa bilangguan tayo mamamatay.
    Bonifacio: Kaya ngayon, wala nang atrasan.
    Bonifacio: Ilabas ang inyong mga sedula!

    (Paper torn, twice.)

    Katipunero: Punitin! Punitin!

The cedula is the student's to tear: Bonifacio's button, "Punitin ang
sedula".

    Macario (sa isip): Ito ang papel na umubos sa pitaka ni Nanay.
    Macario (sa isip): Kung nasaan ka man ngayon, 'Nay... para sa'yo ito.
    Macario: Wala nang sedula. Wala nang alipin.
    Mga Katipunero: Mabuhay ang Pilipinas!
    Bonifacio: Ikaw si Sakay, 'di ba? 'Yung artista.
    Macario: Opo, Supremo.
    Bonifacio: Napanood kita bilang Baldovino. "Walang bayang mananatiling alipin..."
    Bonifacio: Akala ko, linya lang. Ngayon, nakikita kong hindi.
    Bonifacio: Sa susunod na linggo, lulusob tayo sa San Juan del Monte. Sumama ka sa akin.
    Macario: Opo.

    [BLACK] Agosto 30, 1896
    [BLACK] San Juan del Monte

Completes: Punitin ang sedula. The cedula is the one that emptied
Nanay's purse in Act I's opening; the line is the one Bonifacio heard
from the stage (Act I, beat 12). The others there:

    Isko: Magtatanong-tanong po ako, Pangulo. May makakaalam din kung nasaan siya.
    Katipunero: Wala nang sedula. Wala nang atrasan.
    Kasama: Akala ko, nahuli ka na sa Tondo, Pangulo.
    Bonifacio: Ilabas mo ang sedula mo, kapatid.
    (before)
    Bonifacio: Sa susunod na linggo, sa San Juan del Monte.
    (after)

### 8. San Juan del Monte

san-juan. Plays by itself on arrival.

    Bonifacio: Ang polvorin. Doon nakatago ang pulbura at mga armas ng mga Kastila.
    Bonifacio: Kapag nakuha natin 'yan, may baril na tayo.
    Kasama: Bolo laban sa riple, Pangulo...
    Macario: Mas marami tayo.
    Bonifacio: Sugod!

The battle, at the proponent's word a big one: fifteen soldiers in
four waves, from both sides of the screen, with the fight music and
four hearts on the field. Most charge with the bayonet (sundalo); one
in each of the last two waves is a rifle that fires (bantay). Running
out of hearts starts the wave again, the fallen staying down. Between
waves:

    Macario (sa isip): May kasunod pa...
    Bonifacio: Huwag kayong titigil! Malapit na tayo sa polvorin!
    Macario (sa isip): Ang dami nila...

Then a volley, from the right. The Kasama is beside him.

    Kasama: Pangulo! Dumating ang mga sundalo mula sa Maynila!
    Bonifacio: Masyado silang marami! Umatras! Sa ilog!

    (A shot. The Kasama is hit.)

    Kasama: Ah—!
    Macario: Kasama!
    Kasama: Huwag kang lilingon, Pangulo.
    Kasama: Gaya ng una nating lakad. Huwag kang lilingon.
    Macario: Hindi kita iiwan—
    Kasama: Tumakbo ka na!

    [BLACK] Umatras ang mga Katipunero.

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

    [BLACK] Mahigit isandaan at limampung Katipunero ang nasawi sa San Juan del Monte.
    [BLACK] Isa sa kanila ang Kasama.
    [BLACK] Nagkawatak-watak ang mga nakaligtas.
    [BLACK] Nobyembre 1896
    [BLACK] Kabundukan ng Morong

Completes: Umatras sa ilog.

### 10. The Nangka River

nangka. Plays by itself on arrival.

    Bonifacio: Nakuha natin ang Montalban. Pero babalik sila, at mas marami.
    Bonifacio: Kulang tayo sa tao. Kaya gagawa tayo ng tao.
    Macario: Po?
    Bonifacio: Dayami, Sakay. Dayami at sombrero.
    Bonifacio: Artista ka, 'di ba? Ito ang pinakamalaki mong entablado.
    Katipunero: Tatlong bigkis ng dayami ang nasa pampang. Itayo mo, at susuotan namin ng sombrero.
    Macario (sa isip): Mga artistang hindi humihinga... Sana maniwala ang mga manonood.

Three bundles of straw on the bank (x 1000, 1400, 1800), each with a
button "Itayo": the bundle becomes a scarecrow in a Katipunan hat
("Naitayo ang panakot (n/3)"). Talked to, a scarecrow:

    Macario (sa isip): Mukha talaga siyang Katipunero. Mas matapang pa nga.

Completes, with the third: Itayo ang mga panakot (3/3). Then, by itself:

    Katipunero: Ayan na sila! Sa kabilang pampang!

    (Shots, four of them, at straw.)

    Katipunero: Binabaril nila ang dayami!
    Bonifacio: Habang abala sila sa mga panakot, sa gilid tayo lulusob. Sugod!

A fight of six, in two waves (the last with a rifle among them). Since
Block 120 the straw is in the fight too: a soldier nearer a scarecrow
than Macario goes for it, and two blows bring one down, so while they
hack at straw he takes them from the side, as Bonifacio said.

    (a notice) Habang abala sila sa mga panakot, lusubin sila!
    Katipunero: Hindi nila alam kung saan kami nanggaling!
    Katipunero: Supremo! May dagdag na hukbo mula sa San Mateo!
    Bonifacio: Hindi natin sila kaya ngayon. Umatras! Sa Balara!

    [BLACK] Dumating ang dagdag na hukbo ng Espanya.
    [BLACK] Umatras sina Macario at ang Supremo sa Balara.

Completes: Labanan ang mga Kastila sa ilog. The others there:

    Katipunero: Tatlong bigkis sa pampang, Pangulo. Itayo mo na.
    Katipunero: Mga sundalong hindi kumakain. Gusto ko ang ganyan.
    Isko: Hindi ko pa rin matanggap, Pangulo. Ang Kasama...

### 11. Balara

balara, at night. Plays by itself on arrival: a messenger runs in.

    Tagapagbalita: Supremo! Balita mula sa Cavite!
    Tagapagbalita: Itinaboy ng mga tauhan ni Aguinaldo ang mga Kastila!
    Katipunero: Sa Cavite, nananalo sila. Tayo rito, umaatras.
    Bonifacio: ...
    Bonifacio: Mabuti. Iisang Katipunan lang tayo.

Then free. Bonifacio, by the fire:

    Bonifacio: Hindi ka pa natutulog, Sakay?
    Macario: Hindi po ako makatulog, Supremo.
    Bonifacio: Saan ka natutong lumaban?
    Macario: Sa entablado po. Kahoy na espada.
    Bonifacio: Ako rin, alam mo ba? Umarte rin ako sa mga komedya noon.
    Bonifacio: Ang pinagkaiba lang, dito, hindi na bumabangon ang namamatay.
    Macario: ...
    Bonifacio: May naiwan ka ba sa Tondo, Sakay?
    Macario: Ang nanay ko po. Hindi ko alam kung buhay pa siya.
    Bonifacio: ...
    Bonifacio: Lahat tayo may iniwan. Ang tanong lang, may babalikan pa ba tayo.
    Bonifacio: Pupunta ako sa Cavite. Kailangang magkaisa ang Katipunan.
    Bonifacio: Matulog ka na.

Completes: Kausapin ang Supremo. Bonifacio is recorded as having acted
in amateur theatre; Maryam's "kahoy lang ang mga espada" (Act I, the
play) and the Katipunero's "dito, hindi kahoy ang mga espada" come back
in it. He goes to Cavite, and does not come back.

    [BLACK] Marso 1897, Tejeros.
    [BLACK] Nahati ang himagsikan.
    [BLACK] Mayo 10, 1897.
    [BLACK] Pinatay si Andres Bonifacio ng sarili niyang mga kasama.
    [BLACK] Laguna, 1897

The others there:

    Katipunero: Kung tutulong lang sana ang Cavite...
    Isko: Hindi po ako makatulog. Naririnig ko pa rin ang mga riple.
    Bonifacio: Matulog ka na, Sakay.

### 12. Laguna

laguna. Plays by itself on arrival.

    Macario: Ginoong Jacinto.
    Jacinto: Macario. Buhay ka pa.
    Macario: Totoo po ba? Ang Supremo...
    Jacinto: Totoo.
    Jacinto: Nilitis siya ng mga taga-Cavite, at ipinapatay.
    Macario: ...
    Jacinto: Sa kanila na ang pamahalaan nila. Pero sa atin pa rin ang Katipunan na itinatag niya.
    Macario (sa isip): Hindi ako susunod sa pumatay sa Supremo.
    Jacinto: Magpahinga ka muna. Mahaba pa ang laban.

Completes: Sumama kay Jacinto sa Laguna. The others there:

    Katipunero: Hindi pa rin ako makapaniwala. Ang Supremo... sa kamay ng kapwa natin.
    Isko: Nagtanong-tanong po ako sa mga galing Tondo. Wala pa ring nakakita kay Nanay ninyo.

### 13. The end of Act II

laguna. Jacinto, talked to again:

    Jacinto: Kakaunti na lang tayo, Macario. Hindi kita pipigilan kung aalis ka.
    Macario: Hindi po ako aalis.
    Macario: Sa Katipunan ako nanumpa, sa harap ng Mabalasig. Hindi sa kanila.
    Jacinto: Kung gayon, dito tayo. Hanggang dulo.

    [BLACK] Disyembre 1897. Sa Biak-na-Bato, lumagda ng kasunduan ang mga pinuno ng himagsikan,
    [BLACK] at naglayag sila patungong Hong Kong.
    [BLACK] 1898. Dumating ang mga Amerikano.
    [BLACK] Hunyo 12, 1898. Idineklara ang kalayaan sa Kawit.
    [BLACK] Disyembre 1898

    (The last card lifts on the camp. Since Block 120 the treaty of
    Paris [CONTEXT] is not a card: the messenger runs in with a paper
    from Manila, and Jacinto reads it aloud.)

    Tagapagbalita: Ginoong Jacinto! Galing Maynila. Basahin n'yo po.
    Jacinto: ...
    Jacinto: "Sa Paris, nilagdaan ang kasunduan. Ipinagbili ng Espanya ang Pilipinas sa Amerika."
    Jacinto: "Sa halagang dalawampung milyong dolyar."
    Isko: Ipinagbili? Paano nila maipagbibili ang hindi naman sa kanila?

    (The messenger goes.)

    Macario (sa isip): Dati, isang sedula ang halaga ko sa mga Kastila.
    Macario (sa isip): Ngayon, ipinagbili nila ang buong bayan, na para bang kanila.
    Macario (sa isip): At si Nanay... hindi ko pa rin alam kung nasaan siya.
    Macario (sa isip): Babalik po ako, 'Nay. Pangako.
    Jacinto: Hindi pa tapos, Macario.
    Macario: Hindi pa po.

    [BLACK] Wakas ng Ikalawang Yugto

Completes: Kausapin si Jacinto, the last task. Act II is finished, and
the post-test runs. Afterwards:

    Jacinto: Hanggang dulo, Macario.

### Act II's Talaan

Three papers of facts of the game's own, on the street (fixed: x 2600 on
the road; x 4500 and x 6100 at jump height); a teacher's paper replaces
its own slot.

    [HINT] Ang Kalayaan: Kalayaan ang pahayagan ng Katipunan. Inilimbag ito noong Marso 1896, at si Emilio Jacinto ang patnugot nito. Nakasulat dito na sa Yokohama, Hapon, ito inilimbag, para linlangin ang mga Kastila. Matapos itong lumabas, libu-libo ang sumapi sa Katipunan.
    [HINT] Ang pagkatuklas: Noong Agosto 19, 1896, ipinagtapat ng isang kasapi, si Teodoro Patiño, ang lihim ng Katipunan kay Padre Mariano Gil, ang kura ng Tondo. Hinalughog ng mga Kastila ang isang imprenta, at nagsimula ang malawakang paghuli.
    [HINT] Ang Sigaw at ang San Juan del Monte: Noong huling linggo ng Agosto 1896, pinunit ng mga Katipunero ang kanilang mga sedula bilang tanda ng paghihimagsik. Noong Agosto 30, 1896, nilusob nila ang polvorin ng mga Kastila sa San Juan del Monte. Mahigit 150 Katipunero ang nasawi.

## Act III, beat by beat

Block 117, from the proponent's plot (1899 to 1902), revised in Block
118 against the proponent's labelled sources, which are the source of
truth. Each beat below is tagged: [CONTEXT] happened in the world without
Macario, who is never shown there and only hears of it secondhand (news,
a letter, a notice, a black card); [MACARIO] is his, from the sources
(reported where the sources only report it); [INSERT] is invented for the
story, plausible but not in the sources. Every line is ours,
accepted by the proponents on 9 Oct 2026. Every flag starts with a3_. At the proponent's
word: the Americans speak short, plain English, true to the history, and
what they say is given in Tagalog right after (Macario's thought, or an
interpreter), so no student is left out; Isko surrenders in 1901 to go
home to a child he has never seen; the informer in 1902 is unnamed, as
the record leaves him; all fourteen beats, with two big fights (fifteen
since Block 120, with the cell in Bilibid).

The spine: whoever controls the words controls the war. A law calls
asking for freedom sedition and a soldier a bandit; Macario answers by
naming his own republic. He begins the act hiding in a disguise, the
actor's trade turned to survival, and ends it swearing never to cut his
hair until the country is free, where anyone can see him. Hair is the
motif: the Barbero comes back, the haircut is played once more (on an
American), and the vow pays it off.

Places, in order: burol (his band's camp in the hills outside Manila,
February 1899, 3200 wide; Santa Mesa itself is never shown),
tondo (Act I's street, under American guard), barberya (the Barbero's
shop, one room), bayan (a town plaza, April 1901), calle-gunao (a house
in Quiapo), tondo again (January 1902, at night), barberya again,
selda (a cell in Bilibid, July 1902, Act IV's room and its stone
floor; Block 120) and morong (the camp in the mountains, 3200). Every
painting of Act III is owed (ART.md): until drawn, each is a dark wall
with its file name on it.

New people, owed as placeholder boxes: Santiago Álvarez, Pascual
Poblete, Francisco Carreón, Julian Montalan, a teacher (Guro), an
American officer (Opisyal), an American private in the barber's chair,
and the stranger in Nanay's house. Isko, the Barbero, Maryam, the
Mananahi, the direktor, the Manlilimbag, the messenger and the three who
took the pamphlets return. The fighters are the enemy catalogue's
amerikano, sentinela and konstable, their pictures owed: placeholder
boxes until drawn (no art is borrowed or made for them, at the
proponent's word).

### 1. The news of Santa Mesa

[CONTEXT] On 4 February 1899 an American sentry fires on Filipino
soldiers at Santa Mesa, and the war begins; Macario is not there.
[INSERT] He is with his band in the hills outside Manila (the sources do
not say where he was), and a runner brings the news. burol, plays by
itself the first time a student enters Act III.

    [BLACK] Pebrero 5, 1899
    [BLACK] Sa kabundukan, sa labas ng Maynila

    (The messenger of Act II runs in.)

    Tagapagbalita: Pangulo! Balita mula sa Maynila!
    Tagapagbalita: Kagabi, sa Santa Mesa, pinaputukan ng isang bantay na Amerikano ang ating mga sundalo.
    Tagapagbalita: Sa buong paligid ng Maynila, naglalaban na tayo at ang mga Amerikano.
    Isko: Pero kakampi raw natin sila, sabi ng mga heneral.
    Macario: Kakampi na bumili sa atin ng dalawampung milyong dolyar.
    Macario: ...
    Macario: Digmaan na naman, Isko. Bantayan natin ang kampo.

The lookout over the slope (x 2300), "Sumilip" [INSERT]:

    Macario (sa isip): May gumagalaw sa ibaba ng burol...
    Macario (sa isip): Mga Amerikano. Paakyat dito.
    Isko: Pangulo! Natagpuan nila tayo!
    Macario: Hindi tayo tatakbo nang hindi lumalaban.

Completes: Bantayan ang kampo. Before it, Isko:

    Isko: Ikaw ang sumilip, Pangulo. Dito lang ako.

### 2. The patrol

[MACARIO] He fights on against the Americans. [INSERT] The patrol and
the battle. burol, straight on.

    Isko: Ayan na sila!

The battle, at the proponent's word a big one: fifteen Americans in four
waves, from both sides of the screen (amerikano, hand to hand; a
sentinela, a rifle, in each of the last two), three hearts on the field.
Between waves:

    Macario (sa isip): Hindi sila tumitigil...
    Isko: May mga kanyon sila, Pangulo!
    Macario (sa isip): Mas marami pa sila kaysa sa mga Kastila...

Then:

    Isko: May dumarating pa sa ibaba, Pangulo!
    Macario: Umatras tayo. Mas kailangan ng bayan ang buhay natin kaysa sa burol na ito.

[CONTEXT] Manila under American guard, on black.

    [BLACK] Sa mga sumunod na buwan, bumagsak ang mga linya ng mga Pilipino sa paligid ng Maynila.
    [BLACK] Napasailalim sa bantay ng mga Amerikano ang Maynila.
    [BLACK] Nagtago si Macario.
    [BLACK] Mayo 1899
    [BLACK] Tondo

Completes: Labanan ang mga Amerikano.

### 3. Tondo under guard: the letter

[INSERT] Tondo, Isko and the letter. [CONTEXT] Jacinto's death in
Laguna, far from Macario, read in a letter.

tondo, from the east end (x 12500), by day. American sentries at the
corners. On arrival:

    Macario (sa isip): Mga Amerikano sa bawat kanto.
    Macario (sa isip): Dito ako lumaki. Ngayon, kailangan kong magtago rito.

Isko (x 12200) has a letter from Laguna: his button, "Basahin ang
sulat". Emilio Jacinto died at Majayjay, Laguna, on 16 April 1899, of
malaria, aged twenty-three; "Hanggang dulo" is what he said to Macario
at the end of Act II.

    Isko: Pangulo... may sulat po. Galing Laguna.
    Macario (sa isip): "Abril 16, 1899. Majayjay, Laguna."
    Macario (sa isip): "Pumanaw si Ginoong Emilio Jacinto. Malarya ang kumuha sa kanya."
    Macario (sa isip): "Dalawampu't tatlong taong gulang."
    Macario: ...
    Macario (sa isip): "Hanggang dulo," sabi niya.
    Isko: Pangulo...
    Macario: Hindi pa tapos, Isko. Hindi pa.

Completes: Basahin ang sulat ni Isko. Afterwards:

    Isko: Mag-ingat kayo, Pangulo. Hihintayin ko kayo.

### 4. Maryam's trunk

[INSERT] He travels in disguise, with his acting days' skills (the
proponent's insert); Maryam and the trunk are ours.

tondo, at the shut entablado (x 13250). Her question from Act I ("Sino
ba talaga 'yung dalawang lalaki noon?") is answered by the years.
Before the letter:

    Maryam: Macario? Buhay ka!

After it:

    Maryam: Macario? ...Ikaw nga!
    Maryam: Tatlong taon. Wala man lang sulat.
    Macario: Walang sulat na ligtas, Maryam.
    Maryam: Alam ko na ngayon kung sino 'yung dalawang lalaki noon.
    Maryam: Sarado na ang entablado. Binabantayan ng mga Amerikano ang bawat dula.
    Macario: Kailangan kong makarating sa barberya nang hindi nila ako nakikilala.
    Maryam: ...
    Maryam: Artista ka, 'di ba?
    Maryam: Nasa akin pa ang baul ng mga damit.
    Maryam: Ayan. Magtataho. Walang tumitingin nang dalawang beses sa tindero.
    Maryam: Yumuko ka, at huwag kang magmadali. Ang nagmamadali, may itinatago.
    Macario: Salamat, Maryam.
    Maryam: Huwag kang magpapahuli, ha. Wala na akong ibang kapareha sa entablado.

He puts on the disguise (the balatkayo, a taho seller's clothes from the
theatre's trunk, worn in place of the stage clothes): standing still in
it a sentry all but never notices him.

    (a notice) Suot mo ang balatkayo. Tumigil kapag nakatingin ang bantay.

Completes: Humingi ng tulong kay Maryam. Afterwards:

    Maryam: Yumuko ka, Macario. Huwag kang magmadali.

### 5. Past the sentries

[INSERT] The sentries, the Mananahi, the stranger in Nanay's house.

tondo, west to the barbershop's door (x 5260), "Pumasok sa barberya".
Four American sentries walk the street between (11300 to 11750, 9300 to
9750, 7500 to 7950, 5900 to 6300), each with cover in his beat; they
catch, not shoot, and a catch puts him back at the last point he passed.
On the way, not on the task's path but there to be found:

The Mananahi (x 6400), once:

    Mananahi: Macario? Iho...
    Mananahi: Hinintay ka ng nanay mo. Araw-araw, sa pinto.
    Mananahi: Isang umaga, wala na siya. Bukas ang pinto. Walang nakakita.
    Macario: ...
    Mananahi: Patawarin mo ako. Wala akong nagawa.
    Mananahi: Iba na ang nakatira sa bahay ninyo. Puntahan mo, kung kaya mo.

and then:

    Mananahi: Lampas sa barberya ang bahay ninyo, iho. Mag-ingat ka.

(Block 120. The house is on no task's way, so she sends him: without
her, most students would walk into the barbershop and never meet the
stranger.)

Past the barbershop, at Nanay's house (x 2000), a stranger, once:

    Bagong Nakatira: Sino'ng hinahanap mo?
    Macario: 'Yung dating nakatira rito. Isang babae, mag-isa.
    Bagong Nakatira: Wala nang tao rito nang lumipat kami. Sira pa ang pinto noon.
    Macario: ...
    Macario (sa isip): Babalik po ako, 'Nay. 'Yon ang sabi ko.

and then:

    Bagong Nakatira: Wala na siya rito, ginoo. Pasensya na.

Nanay's fate is not told, as Act II left it.

### 6. The barbershop

[INSERT] The barbershop and the American in the chair.

barberya, plays by itself on arrival.

    Barbero: Bukas pa kami, ginoo. Upo ka lang at—
    Barbero: ...Macario?
    Macario: Magandang araw po.
    Barbero: Tatlong taon. Akala ko, patay ka na.
    Macario: Muntik na po.
    Barbero: Hindi bagay sa'yo ang maging magtataho.
    Barbero: Kung magtatago ka, dito ka magtago. Walang naghahanap ng rebelde sa likod ng gunting.
    Sundalong Amerikano: Hey, old man. I've been waiting.
    Macario (sa isip): Kanina pa raw siya naghihintay.
    Barbero (pabulong): Amerikano. Linggo-linggo siyang pumupunta rito.
    Barbero: Marunong ka pang humawak ng gunting?
    Macario: Hindi kabayo ang mga suki n'yo, 'di po ba?
    Barbero: ...Naaalala mo pa.

"Hindi kabayo ang mga suki ko" is the Barbero's own line from Act I.

Completes: Makarating sa barberya nang hindi nakikilala. The chair
(x 470), "Gupitin": the barber's haircut once more (Block 114's game),
on the American, sandy-haired and clean-shaven.

    Sundalong Amerikano: Just a trim. Short on the sides.
    Macario (sa isip): Maikli raw sa gilid.
    (the game) Barberya / Gupitin ang buhok na lampas sa guhit.
    (a cut inside the line) Sundalong Amerikano: Hey! Easy there, pal! (Dahan-dahan daw!)
    (a clean cut) Sundalong Amerikano: Not bad, kid. Not bad at all.
    (a rough one) Sundalong Amerikano: Huh. It'll grow back.
    (after a clean cut) Macario (sa isip): Hindi raw masama. Hindi talaga masama.
    (after a rough one) Macario (sa isip): Tutubo rin naman daw ulit.
    Sundalong Amerikano: Say. They tell me the insurrectos are hiding right here in Tondo.
    Macario (sa isip): Nagtatago raw ang mga rebelde rito mismo sa Tondo.
    Macario: Dito po sa Tondo, ser?
    Sundalong Amerikano: Bandits, all of 'em. Here. Keep the change.
    Macario (sa isip): Mga bandido raw kaming lahat.
    Macario (sa isip): At sa akin na raw ang sukli.

    (He pays, +10 barya, and goes.)

    Barbero: Ginupitan mo ang kaaway, at nag-iwan pa siya ng sukli.
    Macario: Mamayang gabi po, may darating na iba. Hindi para magpagupit.
    Barbero: Alam ko. Ikakandado ko ang pinto.

Completes: Gupitan ang suki. "Bandits" is the word the Brigandage Act
will make law at the end of the act. The chair afterwards:

    Macario (sa isip): Wala nang nakaupo. Tapos na ako rito.

The Barbero, talked to:

    Barbero: Nandiyan ang silya, Macario. Huwag mo siyang sugatan.
    (before the cut)
    Barbero: Ingatan mo sila, Macario.
    (that night)

### 7. That night: the creed

[MACARIO, reported] Organizing Katipunan chapters and spreading
Bonifacio's ideals from town to town (one source). [INSERT] The three,
the barbershop and the precepts chosen.

barberya, by itself.

    [BLACK] Nang gabing iyon.

    Macario (sa isip): Tatlong mukhang kilala ko.
    Macario (sa isip): Ang tatlong tumanggap ng polyeto noon. At tumanggi sa akin pagkatapos.

The mangingisda, the tabakera and the karpintero: in Act I they took the
pamphlets, in Act II they would not know him. Each has a button, "Ituro
ang aral": a precept of Bonifacio's creed (Katungkulang Gagawin ng mga
Z.LL.B.), in today's spelling ("Naituro ang aral (n/3)").

    Mangingisda: Noon, sinunog ko ang polyetong ibinigay mo. Natakot ako.
    Macario: At ngayon?
    Mangingisda: Kinuha ng mga Amerikano ang bangka ko. Wala na akong ikatatakot.
    Macario: Ito ang unang aral ng Supremo.
    Macario: "Ang tunay na pag-ibig sa Diyos ay siya ring pag-ibig sa Tinubuang Lupa, at siya ring pag-ibig sa kapwa."

    Tabakera: Tatlo ang hinuli sa pagawaan noon. Ako ang hindi lumapit sa'yo.
    Tabakera: Ngayon, ako na ang lalapit.
    Macario: "Ang tunay na kapurihan at kaginhawahan ay ang mamatay sa pagliligtas at pagtatanggol sa Inang Bayan."
    Tabakera: ...Mabigat.
    Macario: Mabigat talaga.

    Karpintero: "Wala akong kilalang Macario," sabi ko noon.
    Karpintero: Patawarin mo ako.
    Macario: Ito ang huli. "Magtatagumpay ang lahat ng mabuting nais kung may hinahon, tiyaga, katuwiran at pag-asa."
    Karpintero: Pag-asa. Matagal ko nang hindi naririnig 'yan.

Talked to, before and after:

    Mangingisda: Handa na ako, Pangulo.
    Tabakera: Hindi na ako lalayo ngayon.
    Karpintero: Kilala na kita ngayon, Macario.

With the third, the oath, by itself. Now Macario is the one who swears
them in, as the Mabalasig swore him in Act I:

    Macario: Itaas ang inyong kanang kamay.
    Macario: Isinusumpa ba ninyong ipagtatanggol ang Inang Bayan, hanggang sa huling hininga?
    Mga Bagong Kasapi: Isinusumpa namin.
    Macario: Mula ngayon, mga kapatid na kayo.
    Barbero: Ang batang nagsuklay noon ng kabayo. Tingnan mo ngayon.

    [BLACK] Sa sumunod na dalawang taon, palipat-lipat si Macario ng bayan, nakabalatkayo.
    [BLACK] Nagtatag siya ng mga bagong balangay ng Katipunan.
    [BLACK] Abril 1901

Completes: Ituro ang aral ng Supremo (3/3). Aguinaldo's capture is no
longer a card (Block 120): Isko brings it to the town, below.

### 8. The proclamation, and Isko

[CONTEXT] Aguinaldo's capture in Palanan (March 1901) and his oath and
call to surrender (April): Macario only hears of them, on black and on a
wall. [MACARIO] He refuses to surrender. [INSERT] The town, the queue,
Isko's surrender.

bayan, a town plaza. Men queue at an American officer's table. Plays by
itself:

    Macario (sa isip): Bakit nakapila ang mga kawal sa harap ng mga Amerikano?

    (Isko comes up behind him. Since Block 120 Aguinaldo's capture at
    Palanan [CONTEXT] is his news, not a card: the soldiers who took him
    (Macabebe scouts) came disguised as revolutionaries, the disguise
    Macario lives by, turned on the Republic.)

    Isko: Pangulo... nahuli na raw ang Heneral sa Palanan.
    Isko: Mga sundalong nagpanggap na rebolusyonaryo ang humuli sa kanya.
    Macario (sa isip): Nagbalatkayo sila. Gaya ko.
    Isko: Basahin n'yo po. Sa pader.

The proclamation on the wall (x 480), "Basahin": Aguinaldo's of 19 April
1901, after his oath of allegiance on 1 April, in our words.

    Macario (sa isip): "Ako, si Emilio Aguinaldo..."
    Macario (sa isip): "...ay tumatanggap at kumikilala sa kapangyarihan ng Estados Unidos sa buong Pilipinas."
    Macario (sa isip): "...Hinihikayat ko ang lahat na ibaba na ang kanilang mga sandata."
    Macario: ...

Then, by itself:

    Isko: Totoo pala, Pangulo. Sumuko na ang Heneral.
    Isko: Sabi nila, ang manunumpa sa Amerika, makauuwi na. Walang kulong.
    Macario: At ikaw?
    Isko: ...
    Isko: May anak na po ako, Pangulo. Dalawang taon na. Hindi pa niya ako nakikilala.
    Macario: ...
    Macario: Umuwi ka.
    Isko: Sumama na po kayo. Tapos na.
    Macario: Tapos na para kay Aguinaldo. Hindi ako sa kanya nanumpa.
    Macario: Ilang beses na tayong pinangakuan ng kapayapaan. Ilang beses na tayong ipinagbili.
    Isko: Hahanapin ko pa rin po si Nanay ninyo. Pangako.
    Macario: Huwag kang mangako, Isko. Mabigat dalhin.

    (Isko walks to the officer's table.)

    Opisyal: Name?
    Isko: Francisco... Francisco Reyes.
    Opisyal: Raise your right hand.
    Macario (sa isip): Itaas daw ang kanang kamay.
    Macario (sa isip): Ang kamay na itinaas niya sa Katipunan.

    [BLACK] Libu-libo ang sumuko at nanumpa ng katapatan sa Amerika.
    [BLACK] Tumanggi si Macario.
    [BLACK] Agosto 1901
    [BLACK] Calle Gunao, Quiapo

Completes: Basahin ang proklama. Macario's own promise to Nanay ("Babalik
po ako. Pangako.", Act II) is the one he could not keep, which is why he
will not take Isko's. Read again:

    Macario (sa isip): Nabasa ko na. Ayoko nang basahin ulit.

### 9. Calle Gunao: the founding

[MACARIO] In August 1901, on Calle Gunao, Quiapo, Macario is at the
founding of the Partido Nacionalista and becomes its Secretary-General,
with Santiago Álvarez and Pascual Poblete; the party seeks independence
by legal means and petitions the American authorities. [INSERT] The
meeting is in a house on the street (the sources give only the street);
the words and the three who sign are ours. calle-gunao, plays by itself.

    Álvarez: Sakay. Ang sabi nila, ikaw ang huling Katipunerong ayaw bumaba ng bundok.
    Macario: At kayo, Heneral Álvarez? Bumaba na kayo?
    Álvarez: Sa ibang daan na kami lalaban.
    Poblete: Isang partido, nang hayagan. Hihingin natin sa mga Amerikano ang kalayaan, ayon sa sarili nilang batas.
    Macario: Papel laban sa riple.
    Álvarez: Papel din ang Kalayaan, 'di ba? Ilang libo ang sumapi dahil doon.
    Poblete: Partido Nacionalista. At kailangan namin ng Kalihim-Heneral na kilala ng taga-Tondo.
    Álvarez: Ikaw, Sakay.
    Macario: ...
    Macario (sa isip): Kung may daang walang mamamatay... susubukan ko.
    Macario: Tinatanggap ko.
    Poblete: Kung gayon, Kalihim-Heneral, kailangan ng petisyon ang mga pirma.

Two to sign, each a button, "Papirmahin" ("Pumirma (n/2)"); the third,
the Guro, means to and is overtaken by the law (Block 120):

The Manlilimbag, from Act II's press:

    Manlilimbag: Pangulo? ...Buhay pa pala tayong dalawa.
    Manlilimbag: Nakalabas ako noong gabi ng paghuli. Hindi lahat.
    Macario: Pipirma ka?
    Manlilimbag: Ako pa ang maglilimbag ng petisyon, kung papayagan nila.

The direktor, his theatre shut:

    Direktor: Isinara nila ang entablado ko. Bawal daw ang dulang may watawat.
    Direktor: Pipirma ako. Matanda na ako para matakot.
    Macario: Salamat po, Direktor.
    Direktor: "Walang bayang mananatiling alipin." Sa entablado ko mo 'yan unang sinabi.

A teacher (the Thomasites, American teachers, arrived on the transport
Thomas in August 1901), talked to before the law; he will sign
tomorrow:

    Guro: Ingles na raw ang ituturo sa mga bata. May mga gurong Amerikanong dumating sa barkong Thomas.
    Guro: Sa sariling bayan, dayuhan na ang wika natin.
    Guro: Pipirma ako. Bukas, pagkatapos ng klase.

Talked to, before and after:

    Álvarez: Kailangan natin ng mga pirma, Kalihim-Heneral.
    Álvarez: Kahit ang paghingi, Sakay. Kahit ang paghingi.
    Manlilimbag: Ako na ang maglilimbag nito, Pangulo, kung papayagan nila.
    Direktor: Matanda na ako para matakot, iho.
    Guro: Patawad, Kalihim-Heneral.

Completes, with the second name: Papirmahin ang petisyon (2/2), and
the law arrives at once.

### 10. The Sedition Law, read

[CONTEXT] On 4 November 1901 the Philippine Commission passes the
Sedition Law (Act No. 292): asking for independence, even peacefully,
and belonging to a secret society become crimes. Macario is not there
when it is passed; it reaches him as a printed notice Poblete brings
[INSERT], since Block 120 in the middle of the petition, two names in.
calle-gunao, by itself.

    [BLACK] Nobyembre 1901

    (Poblete comes in with a printed notice.)

    Poblete: Sakay. Heneral. Basahin ninyo ito. Nakapaskil na sa buong Maynila.
    Macario (sa isip): "Act Number 292. November 4, 1901."
    Macario (sa isip): "Any person who advocates independence, by word or in writing, even by peaceful means, shall be punished."
    Macario (sa isip): Ang sinumang magsulong ng kalayaan, sa salita man o sa sulat, kahit sa mapayapang paraan, ay paparusahan.
    Macario (sa isip): At krimen na rin ang pagsapi sa lihim na samahan.
    Álvarez: Kahit ang paghingi.
    Poblete: Ang petisyon natin... krimen na.
    Macario (sa isip): Noon, sedula ang pinunit namin.
    Macario (sa isip): Ngayon, krimen na ang bawat papel namin.
    Poblete: May isa pang pirmang kulang, Kalihim-Heneral. Ang guro.

The notice's English is the law's sense in our words, then the Tagalog;
Macario reads it himself. The task: Kunin ang huling pirma. The Guro,
"Papirmahin" [INSERT]:

    Guro: Nabasa ko ang nakapaskil, Kalihim-Heneral.
    Guro: Krimen na raw ang pumirma. May tatlo akong anak.
    Macario: Hindi kita pipilitin.
    Guro: ...Patawad.

Then, by itself:

    Macario (sa isip): Dalawang pirma. Isang batas lang ang kinailangan nila.
    Álvarez: Ano ngayon, Kalihim-Heneral?
    Macario: Wala nang ibang daan, Heneral.

    [BLACK] Enero 1902
    [BLACK] Tondo

Completes: Kunin ang huling pirma, a step that ends with the name
refused (Block 120: each step of the act's middle ends worse, not done).

### 11. January 1902: three houses

[MACARIO, reported] Organizing Katipunan chapters. [INSERT] The three
doors, the patrols, the stranger asking.

tondo, at night, from the east end (x 12600). On arrival:

    Macario (sa isip): Tatlong bahay. Tatlong pamilyang naghihintay ng balita.
    Macario (sa isip): Bawal na ang humingi. Bawal na ang magtipon. Kaya sa gabi kami magtitipon.

Four American patrols walk where the sentries stood, each with cover;
they catch, not shoot. Three doors (x 10900, 8300, 6700), "Kumatok"
("Kinatok (n/3)"). "Anak ng Bayan" is Act I's password. Since Block 120
the second does not answer: someone got there first, and who, and what
became of the family, is not said.

    Macario (pabulong): Anak ng Bayan.
    Tinig sa Loob: ...Pasok ang hudyat.
    Macario (pabulong): Bukas ng gabi, sa barberya. Tatlo kayo.
    Tinig sa Loob: Darating kami.

    Macario (pabulong): Anak ng Bayan.
    Macario (sa isip): ...
    Macario (sa isip): Walang sumasagot. Bukas ang bintana.
    Macario (sa isip): Nauna na sila rito.

    Tinig sa Loob: Akala ko, hindi ka na darating.
    Macario (pabulong): Bukas ng gabi. Sa barberya.
    Tinig sa Loob: May nagtanong tungkol sa'yo kanina. Isang lalaking hindi taga-rito.

A door knocked on again (the empty one, the second):

    Macario (sa isip): Naipaalam ko na rito. Sa susunod na bahay.
    Macario (sa isip): Wala nang tao rito.

    (a notice) Pumunta sa barberya.

Completes: Kumatok sa tatlong bahay (3/3).

### 12. The oath, broken in on

[MACARIO] In 1902, reported as January, he is arrested and imprisoned
for seditious activities. [INSERT] The oath in the barbershop, the raid,
the informer. The war declared over and the amnesty are the next beat,
in the cell (Block 120).

barberya, at night. On arrival:

    Barbero: Nandito na sila. Tatlo, may piring na.
    Barbero: Ikinandado ko ang pinto. Bilisan mo.

Three new members, blindfolded, talked to:

    Bagong Kasapi: Handa na po kami.

The table (x 620), "Simulan ang panunumpa". At the oath's height, as the
knock broke in on his promise to Nanay in Act II (the proponent's word:
the blow lands at the peak):

    Macario: Alisin ang piring.
    Macario: Sa labas ng pintong ito, krimen na ang pumasok dito.
    Macario: Kapag nahuli kayo, kulong. O higit pa.
    Macario: May aatras ba?
    Mga Bagong Kasapi: ...
    Macario: Itaas ang inyong kanang kamay.
    Macario: Isinusumpa ba ninyong—

    (The door, hammered, three times.)

    Sundalong Amerikano: Open up! U.S. Army!
    Konstable: Buksan n'yo! Konstabularya!
    Barbero: Sa likod, Macario! Tumakbo ka!

    (A soldier at the back door, too.)

    Sundalong Amerikano: Hands up! Don't move!
    Macario (sa isip): Itaas daw ang kamay. Huwag gagalaw.
    Macario (sa isip): Pati ang likod.
    Macario (sa isip): May nagturo.
    Barbero: Walang kinalaman dito ang mga batang 'yan!
    Konstable: Tumahimik ka, matanda.
    Macario: ...

    [BLACK] Enero 1902. Nahuli si Macario Sakay habang nagtatatag ng mga balangay ng Katipunan.
    [BLACK] Ikinulong siya sa Bilibid.
    [BLACK] Hulyo 4, 1902

Completes: Panumpain ang mga bagong kasapi. Who informed is not said:
the record does not say how he was found, and neither does the game.
What became of the Barbero is not said either.

### 13. Bilibid: the amnesty

Block 120. [MACARIO] Imprisoned in Bilibid; released under the amnesty
of 4 July 1902. [CONTEXT] The war declared over and the amnesty for
political prisoners: they reach him from a guard at the bars [INSERT],
not on cards. selda, Act IV's cell (the room he comes back to in 1906,
"Bilibid. Muli."), plays by itself.

    Macario (sa isip): Anim na buwan na sa Bilibid.

    (A guard comes to the bars.)

    Bantay: Sakay. May balita mula sa Maynila.
    Bantay: Idineklara raw ng mga Amerikano na tapos na ang digmaan.
    Bantay: Amnestiya sa mga bilanggong pulitikal. Kasama ka sa listahan.
    Macario: Tapos na raw ang digmaan.
    Bantay: Lumabas ka na, bago pa magbago ang isip nila.
    Macario (sa isip): Malaya raw ako. Pero ang bayan?

    (The guard goes. The way out at the top of the log, "Lumabas sa
    Bilibid: pumunta sa kanan"; the gate at the right edge,
    "Lumabas".)

    [BLACK] Lumabas si Macario sa bilangguan,
    [BLACK] at tumuloy sa kabundukan ng Morong.

Completes: Lumabas sa Bilibid. "Pero ang bayan?" is what the vow at
Morong answers.

### 14. Morong: the Republika ng Katagalugan

[MACARIO] After his release, in the Morong mountains (now Rizal),
Macario founds the Republika ng Katagalugan: he is its President and
Generalissimo, Francisco Carreón its Vice President, Julian Montalan
leads its army; its constitution is Bonifacio's Katipunan creed, and it
has its own flag. [MACARIO, reported] He and his men vow not to cut
their hair until the country is free. [INSERT] The words, and the young
fighter who offers to cut it. morong, plays by itself.

    Montalan: Sakay! Akala namin, nasa Bilibid ka pa.
    Macario: Pinalaya nila ako. Tapos na raw ang digmaan.
    Carreón: Tapos na raw. Pero nasa lupa pa rin natin sila.
    Montalan: May mga tauhan kami rito sa Morong. Kulang lang kami ng pinuno.
    Macario (sa isip): Isang Katipunang walang Supremo. Isang republikang walang pangalan.

Carreón, talked to:

    Carreón: Kung magtatayo tayo ng pamahalaan, kailangan natin ng saligang batas.
    Macario: Mayroon na tayo. Ang mga aral ng Supremo.
    Carreón: At ng pangalan.
    Macario: Republika ng Katagalugan.
    Macario: Hindi ng Amerika. Hindi ng Cavite. Atin.
    Carreón: Kung gayon, ikaw ang Pangulo at Heneralisimo. Ako ang Ikalawang Pangulo.
    Montalan: At ako ang hahawak sa hukbo.
    Carreón: May sarili na rin tayong watawat. Itaas mo, Pangulo.

    (a notice) Itaas ang watawat ng Republika.

The flag (x 1500), "Itaas ang watawat", the Republic's soldiers beside
it (three, owed, seen since Block 120; "Mga Kawal" speak from them):

    Macario (sa isip): Hindi watawat ng Kastila. Hindi ng Amerika.
    Mga Kawal: Mabuhay ang Republika ng Katagalugan!

Before the Republic is named, and after the flag is up:

    Macario (sa isip): Wala pang republikang magtataas nito.
    Macario (sa isip): Nakataas na. Sa amin.

Then, by itself: a young fighter comes up to him.

    Batang Kawal: Pangulo, ang haba na ng buhok n'yo. Gugupitan ko po kayo?
    Macario: Barbero ako dati, iho.
    Macario: Pero ito, hindi ko na gugupitin.
    Batang Kawal: Po?
    Macario: Hindi tayo magpapagupit hangga't hindi malaya ang bayan.
    Montalan: Hanggang sa paglaya!
    Mga Kawal: Hanggang sa paglaya!
    Macario (sa isip): Tatlong taon akong nagtago sa balatkayo.
    Macario (sa isip): Ngayon, makikilala nila ako kahit sa malayo.

He takes off the disguise and wears his own clothes again. Completes:
Itatag ang Republika. Talked to:

    Montalan: Kausapin mo si Carreón. Siya ang marunong sa mga papel.
    (before)
    Montalan: Hanggang sa paglaya, Pangulo.
    Carreón: Republika ng Katagalugan. Maganda pakinggan, Pangulo.

### 15. The bandits, and the end of Act III

[CONTEXT] On 12 November 1902 the Brigandage Act makes armed resistance
banditry, punishable by death; Macario is not there when it is passed,
and it is the law he will be tried under in 1906. On black.
[INSERT] The Constabulary's attack on the camp. morong, by itself.

    [BLACK] Nobyembre 12, 1902
    [BLACK] Ipinasa ng mga Amerikano ang Batas sa Bandolerismo.
    [BLACK] Ang sinumang patuloy na lumalaban ay hindi na sundalo.
    [BLACK] Isa na siyang bandido, at kamatayan ang parusa.

    Konstable: Mga bandido! Sumuko kayo!
    Montalan: Konstabularya. Mga Pilipino rin sila, Pangulo.
    Macario: Pilipinong naka-uniporme ng Amerikano.
    Macario: Ipagtanggol ang kampo!
    Montalan: Ang watawat, Pangulo! Doon sila papunta!

    (a notice) Ipagtanggol ang watawat!

The second big fight: fifteen of the Philippine Constabulary in four
waves (konstable, hand to hand; a sentinela, a rifle, in three of
them), three hearts on the field. Since Block 120 he holds the flag: he
stands by it when the card lifts, a Constable nearer the flag than him
goes for it, and if it takes eight blows and falls ("Bumagsak ang
watawat! Ulitin natin.") the wave starts again. Between waves:

    Carreón: Marami pa sa ibaba!
    Macario (sa isip): Kapwa Pilipino ang sinusuntok ko...
    Montalan: Huwag kayong aatras!

Then:

    Montalan: Umatras sila!
    Carreón: Babalik sila. Sa susunod, mas marami.
    Macario: Hayaan mo silang bumalik.
    Macario (sa isip): Noon, tinawag kaming insurekto.
    Macario (sa isip): Ngayon, bandido.
    Macario (sa isip): Pero kami ang nagbigay ng pangalan sa republikang ito. Hindi nila 'yon mababago.
    Macario (sa isip): 'Nay... humahaba na ang buhok ko. Kung makita mo ako, makikilala mo pa kaya ako?

    [BLACK] Wakas ng Ikatlong Yugto

Completes: Ipagtanggol ang kampo, the last task. Act III is finished,
and the post-test runs.

### Act III's Talaan

Three papers of facts of the game's own, on the street by day in 1899
(fixed: x 11200 on the road; x 9100 and x 7700 at jump height); a
teacher's paper replaces its own slot.

    [HINT] Ang Santa Mesa: Noong gabi ng Pebrero 4, 1899, pinaputukan ng isang bantay na Amerikano ang mga sundalong Pilipino sa Santa Mesa, Maynila. Kinabukasan, nagsimula ang Digmaang Pilipino-Amerikano. Napasailalim ang Maynila sa mga Amerikano.
    [HINT] Ang Batas sa Sedisyon: Noong Nobyembre 4, 1901, ipinasa ng Komisyon ng Pilipinas ang Batas Bilang 292. Ginawa nitong krimen ang pagsusulong ng kalayaan, sa salita man o sa sulat, kahit sa mapayapang paraan, at ang pagsapi sa mga lihim na samahan.
    [HINT] Ang Republika ng Katagalugan: Noong 1902, itinatag ni Macario Sakay ang Republika ng Katagalugan sa kabundukan ng Morong, at ginawang saligang batas ang mga aral ni Andres Bonifacio. Noong Nobyembre 12, 1902, ipinasa ng mga Amerikano ang Batas sa Bandolerismo: tinawag nilang bandido ang sinumang patuloy na lumalaban.

## Act IV, beat by beat

Block 119, from the proponent's labelled sources (1903 to 1907), which
are the source of truth. Each beat is tagged as Act III's are: [CONTEXT]
happened in the world without Macario, who only hears of it secondhand
(news, a guard, a black card); [MACARIO] is his, from the sources
(reported where the sources only report it); [INSERT] is invented for the
story. Every line is ours, accepted by the
proponents on 9 Oct 2026. Every flag
starts with a4_. The Americans speak English, each line given in Tagalog
after it, as in Act III.

The spine: who gets the last word. The law calls him a bandit; he
answers with orders, a manifesto and a republic, and at the end with his
last statement, the last line anyone speaks in the game. A tragedy: the
Republic at its height; the turn, when the people who feed it are
starved; the climax, his choice to come down for an Assembly; the
reversal, a reception that is a play staged for him (he lived by the
disguise, and now the enemy performs); the court, the cell, the morning;
and the Assembly opening thirty-three days after he dies. The threads
paid: the hair he swore not to cut is never cut; Tanay is his last
costume; Isko searched for Nanay and never found her, and her fate stays
unknown; the father who went out one night and never came back, the
first thing said in the game, is answered on his son's last night.

At the proponent's word (5 Oct 2026): the sources do not say whether
Macario was at Tanay, and the game does not either; whether Gómez knew
of the trap is left unsaid; Montalan's and Villafuerte's later fates are
left out. The title stays Ang Mapait na Ani.

Places, in order: morong (Act III's camp, 1903 and 1904, 3200 wide),
himpilan (a post of the Constabulary, at night, 2600), dimasalang (the
camp in the Di-Masalang mountains, 1904 to 1906, 3200), malabon (San
Francisco de Malabon, Cavite, 3200), tondo (Act I's street, July 1906),
sala (the hall in Cavite, one room), selda (a cell in Bilibid, one room,
1906 and 1907), hukuman (the court in Cavite, one room) and patyo (the
yard of Old Bilibid, 2400). Every painting of Act IV is owed (ART.md):
until drawn, each is a dark wall with its file name on it. Bilibid's
floor is stone, drawn by the engine.

New people, owed as placeholder boxes: Dominador Gómez, Colonel Louis
Van Schaick, León Villafuerte, Lucio de Vega, the judge (Hukom), a guard
of Bilibid (Bantay), a woman of Cavite (Taga-Cavite), Isko's son Andres,
the Katagalugan's fighters (Kawal), and since Block 120 the crowd in
Manila (two townspeople). Kabayo, Act I's horse, comes back with the
Kutsero. Carreón, Montalan, the
Manlilimbag, the messenger, the Batang Kawal, Isko, Maryam, the
Mananahi, the Kutsero and the three who took the pamphlets return. The
fighters are the enemy catalogue's konstable, bantay-konstable (the
Constabulary on guard with a rifle), amerikano and sentinela, their
pictures owed.

### 1. The first order

[MACARIO] On 18 March 1903 Presidential Order No. 1; on 5 May Military
Circular No. 1; his army organized. [INSERT] The words. morong, plays by
itself the first time a student enters Act IV.

    [BLACK] Marso 18, 1903
    [BLACK] Kabundukan ng Morong

    Carreón: Pangulo, handa na ang unang kautusan. Lagda n'yo na lang ang kulang.
    Macario (sa isip): "Kautusan ng Pangulo, Bilang 1."
    Macario (sa isip): Noon, ako ang tumatanggap ng utos. Ngayon, pangalan ko na ang nasa ibaba.

The table (x 640), "Lagdaan":

    Macario (sa isip): Macario Sakay, Pangulo ng Republika ng Katagalugan.

Completes: Lagdaan ang unang kautusan. Then, by itself:

    Montalan: Kalahati ng mga tauhan, walang baril, Pangulo.
    Macario: Kung gayon, kukuha tayo.
    Montalan: May himpilan ng Konstabularya sa bayan sa ibaba. Puno ng riple, at ng uniporme.
    Macario: Uniporme?
    Montalan: Para saan ang uniporme, Pangulo?
    Macario: Makikita mo rin.

    [BLACK] Mayo 5, 1903. Inilabas ni Sakay ang Sirkular Militar Bilang 1.
    [BLACK] Inayos niya ang kanyang hukbo.
    [BLACK] Isang himpilan ng Konstabularya, sa gabi.

"Makikita mo rin" is paid at Tanay. Talked to, before and after:

    Carreón: Ang lagda n'yo, Pangulo. Nasa mesa.
    Carreón: Isang republika, may sarili nang kautusan.
    Carreón: Papel laban sa batas nila. Gusto ko 'yan, Pangulo.
    Montalan: Kulang tayo sa baril, Pangulo.
    Montalan: May riple na tayo. At uniporme. Para saan pa rin, hindi ko alam.

### 2. The post

[MACARIO, reported] In 1903 his forces raid for guns and uniforms.
[INSERT] The post, the run and the fight. himpilan, at night, in from the
right. On arrival:

    Macario (sa isip): Tatlong bantay sa bakuran.
    Macario (sa isip): Nasa dulo ang bodega. Huwag akong makita.

Three of the Constabulary on watch, each with a crate in his beat; they
catch, not shoot, and a catch puts him back at the last point he passed.
The storeroom (x 150), "Kunin":

    Macario (sa isip): Mga riple. At mga uniporme ng Konstabularya.
    Macario (sa isip): Isang kasuotan pa para sa baul.

    (Block 120: the bell is heard, not put on a card. It rings; Montalan
    comes out of the storeroom behind him.)

    Montalan: Pangulo! Gising na ang buong himpilan!
    Macario: Dalhin ang mga riple. Lalaban tayo palabas!

    (The bell again. The three on watch turn on him where they stand.)

The first big fight, fought on the way out (Block 120): fifteen of the
Constabulary, the three watchmen and two more at the storeroom, then a
wave at each stretch of the yard (x 900, 1600, 2250), Montalan coming up
behind, and the fence where he came in (x 2450) is the end of it
("Lumaban palabas: pumunta sa kanan, sa bakod" at the top of the log).
Konstable hand to hand, a bantay-konstable with a rifle in each of the
last three waves, three hearts on the field; a lost wave starts again
at the last stretch reached. Between waves:

    Montalan: Marami pa sa loob!
    Macario (sa isip): Kapwa Pilipino na naman ang kaharap ko.
    Montalan: Malapit na ang bakod!

Then:

    Montalan: Nakalabas tayo! Dala ang lahat!
    Macario: Bukas, babasahin ng Maynila na ninakawan sila ng mga bandido.

    [BLACK] Abril 5, 1904
    [BLACK] Kabundukan ng Morong

Completes: Kunin ang mga baril at uniporme.

### 3. The manifesto

[MACARIO] On 5 April 1904 he issues a manifesto: Filipinos have every
right to fight for their independence. [INSERT] The Manlilimbag, from
Acts II and III, and the half a press he saved. morong, by itself.

    Manlilimbag: Pangulo! Dinala ko ang lumang palimbagan. Kalahati lang ang naisalba ko.
    Macario: Sapat na ang kalahati.
    Carreón: Ano ang ilalagay natin, Pangulo?
    Macario: Na may buong karapatan ang bawat Pilipino na ipaglaban ang kanyang kalayaan.
    Macario: Tinawag nila kaming bandido sa batas nila. Sasagutin namin sa papel namin.

The press (x 1500), "Ilimbag": the work game, once, as at Act II's press
(Palimbagan). Afterwards:

    Macario (sa isip): "...may buong karapatan ang mga Pilipino na ipaglaban ang kanilang kalayaan."
    Manlilimbag: Gaya ng Kalayaan noon, Pangulo. Sa sariling papel.

    [BLACK] Agosto 1904. Inilipat ni Sakay ang kanyang himpilan sa kabundukan ng Di-Masalang.

Completes: Ilimbag ang manipesto. Talked to, and the press again:

    Manlilimbag: Kalahating palimbagan, Pangulo. Pero buong salita.
    Macario (sa isip): Nailimbag na. Nasa mga bayan na ito.

### 4. The last performance

[MACARIO, reported] Late in 1904 his forces take the town of Tanay,
disguised in stolen Constabulary uniforms; the sources do not say
whether Macario was there. [INSERT] He plans the disguise himself: one
last performance from his stage days. dimasalang, by itself.

    Montalan: Tanay. May himpilan ng Konstabularya roon, at maraming baril.
    Montalan: Pero makikita nila tayong paakyat bago pa tayo makalapit.
    Macario: Kaya hindi tayo papasok bilang mga kawal ng Republika.
    Macario: Papasok tayo bilang Konstabularya.
    Montalan: ...Ang mga uniporme. Ito pala ang ibig mong sabihin.
    Montalan: Isang dula?
    Macario: Ang huli kong dula, siguro.

Three fighters in the stolen uniforms, drilled together (Block 120;
once three buttons, "Ituro", the seventh "three of something" in the
game): the line of three, "Sanayin", is the work game's drill, a row of
figures who salute smartly on a good stroke and fumble it on a bad one.

    (the game) Ensayo / Pindutin kapag nasa berde ang guhit: sabay-sabay ang saludo.
    (a good stroke) Sabay-sabay!
    (a missed one) Magulo ang hanay!
    (the end) n/5 ang malinis na saludo.

Then what each of them asks, as one scene:

    Kawal: Ganito po ba sumaludo ang Konstable?
    Macario: Masyadong mabagal.
    Macario: Sumasaludo ang Konstable na parang may utang sa kanya ang buong mundo.
    Kawal: ...Ganito?
    Macario: 'Yan.

    Kawal: Pangulo, ang buhok namin. Walang Konstable na ganito kahaba ang buhok.
    Macario: Itali, at itago sa ilalim ng sumbrero.
    Kawal: Hindi po namin gugupitin?
    Macario: Hindi. Sumumpa tayo.

The Batang Kawal of Act III, who offered to cut his hair:

    Batang Kawal: Paano po kung kausapin ako ng bantay?
    Macario: Huwag kang magpaliwanag. Ang nagpapaliwanag, may itinatago.
    Macario (sa isip): Kay Maryam ko natutunan 'yan.

"Ang nagmamadali, may itinatago" was Maryam's in Act III. The line,
used again:

    Macario (sa isip): Handa na sila. Wala na akong maituturo pa.

Then, by itself:

    Montalan: Handa na sila, Pangulo.
    Macario: Sa Tanay, walang palakpakan. Kung tama ang pagganap, walang makakapansin.

    [BLACK] Huling bahagi ng 1904
    [BLACK] Pumasok sa bayan ng Tanay ang mga tauhan ni Sakay, suot ang mga ninakaw na uniporme ng Konstabularya.
    [BLACK] Nakuha nila ang bayan.
    [BLACK] Hindi sinasabi ng mga tala kung kasama si Sakay.
    [BLACK] Enero 24, 1905
    [BLACK] San Francisco de Malabon, Cavite

Completes: Ihanda ang mga kawal. Talked to, before:

    Kawal: Pangulo, hindi pa po ako nakasuot ng uniporme kahit kailan.
    Kawal: Ang uniporme, Pangulo... masikip.
    Batang Kawal: Ano po ang sasabihin ko kung tanungin nila ako?
    Montalan: Turuan mo sila, Pangulo. Hindi sila artista.

### 5. San Francisco de Malabon

[MACARIO, reported] On 24 January 1905 his forces raid San Francisco de
Malabon, Cavite. [MACARIO, reported] They come in at dusk dressed as the
Constabulary and the Scouts, march in as government troops and rush the
barracks for its guns (the Constabulary's own report of 1905; added in
Block 123 at the proponent's word). [INSERT] The battle shown;
Villafuerte and de Vega beside him, so the sentence of beat 11 lands.
malabon, by itself.

    Montalan: Takipsilim na, Pangulo. Suot pa rin natin ang mga uniporme ng Konstabularya.
    Macario: Hanggang hindi tayo nakakalapit sa kuwartel, Konstabularya tayo sa mata nila.
    Montalan: Ang garison, Pangulo. Nasa plaza ang mga baril nila.
    Macario: Pasok!

The second big fight: fifteen in four waves (the Constabulary first,
Americans and a rifle among them in the last two), three hearts on the
field. Since Block 120 it is a push into the plaza: a wave at the edge
of town, then one at each stretch of road (x 1200, 2000, and the plaza
at 2700), Montalan, Villafuerte and de Vega coming up behind ("Sumulong
sa plaza: pumunta sa kanan" at the top of the log). Between waves:

    Villafuerte: Pangulo! Sa kaliwa!
    De Vega: Ako na rito!
    Montalan: Dumating ang mga Amerikano!
    Macario (sa isip): Isang bayan pa. Isang bayan pa na hindi nila hawak.

Then:

    De Vega: Kanila na naman ang plaza bukas, Pangulo.
    Macario: Pero ngayong gabi, atin.

    [BLACK] Kinabukasan, nabasa sa Maynila: sinalakay ng mga bandido ang San Francisco de Malabon.
    [BLACK] 1905
    [BLACK] Kabundukan ng Di-Masalang

Completes: Salakayin ang San Francisco de Malabon.

### 6. Hunger

[CONTEXT] In 1905 the Americans herd the villagers of Cavite and
Batangas into guarded camps (reconcentration); the people who fed and hid
his army go hungry. Macario is not in the camps: he hears of them from a
woman of Cavite [INSERT], and feels them as the food runs out.
dimasalang, by itself.

    Taga-Cavite: Ito na lang po ang naitakas ko, Pangulo.
    Macario: Nasaan ang iba? Ang mga dating nagdadala sa amin?
    Taga-Cavite: Inipon kami ng mga Amerikano. Lahat ng taga-baryo, sa loob ng bakod, may bantay.
    Taga-Cavite: Ang hindi pumasok, kalaban daw.
    Taga-Cavite: Wala nang magtatanim. Wala nang magdadala sa inyo.
    Macario: ...
    Macario (sa isip): Hindi kami ang tinamaan nila. Ang mga nagpapakain sa amin.
    Macario (sa isip): Isang sako. Tatlong kawal na hindi pa kumakain.

    (a notice) Hatiin ang bigas sa mga kawal.

The three fighters of Tanay, talked to ("Nabigyan ng bigas (n/3)"):

    Macario: Kunin mo ito.
    Kawal: Salamat, Pangulo.

    Kawal: Kayo po, Pangulo? Kumain na kayo?
    Macario: Mamaya na ako.

    Batang Kawal: Pangulo... hindi na kayo kumakain, 'di po ba?
    Macario: Kumain ka. Mas kailangan ka ng bayan nang may lakas.

Completes: Hatiin ang bigas (3/3). Talked to, between Tanay and the rice,
and after:

    Kawal: Sumasaludo pa rin po ako sa salamin ng ilog.
    Kawal: Nakatago pa rin po sa sumbrero ang buhok ko.
    Batang Kawal: Hindi na po ako nagpapaliwanag, Pangulo.
    Kawal: Salamat sa bigas, Pangulo.
    Kawal: Mamaya na raw kayo, Pangulo. Lagi n'yo 'yang sinasabi.
    Batang Kawal: Busog na po ako, Pangulo. Totoo.
    Montalan: Wala nang dumarating mula sa mga baryo, Pangulo.

### 7. Gómez

[CONTEXT] In 1906 the Governor-General, Henry Clay Ide, authorizes
Dominador Gómez, a labour leader, to negotiate; Macario hears it from
the messenger. [MACARIO] Gómez comes to the mountains: the Assembly the
Americans promised can open only once the fighting stops, and Macario is
the last thing in its way. He agrees to come down on terms: amnesty for
his men, the right to carry firearms, and leave for himself and his
officers to go abroad. dimasalang, by itself.

    [BLACK] 1906

    Tagapagbalita: Pangulo! May darating. Si Dominador Gómez, ang lider ng mga manggagawa sa Maynila.
    Tagapagbalita: Pinahintulutan daw siya ng Gobernador-Heneral na si Ide na makipag-usap sa inyo.
    Montalan: Sugo ng Amerikano.
    Macario: Pilipinong sugo ng Amerikano. Pakinggan natin.

    (Gómez walks up the slope. Talked to:)

    Gómez: Heneral Sakay. Malayo ang inakyat ko.
    Macario: Pangulo. Hindi Heneral. May Republika kami rito.
    Gómez: Pangulo, kung gayon.
    Gómez: Nangako ang mga Amerikano ng isang Asamblea. Mga Pilipinong boboto, mga Pilipinong gagawa ng batas.
    Gómez: Pero hindi nila ito bubuksan habang may lumalaban pa sa bundok.
    Gómez: Kayo na lang ang natitira, Pangulo.
    Macario: ...
    Montalan: At ang kapalit? Bitayan?
    Gómez: Amnestiya. Para sa lahat ng tauhan ninyo.
    Macario (sa isip): Isang Asamblea. Mga Pilipinong susulat ng batas sa sariling bayan.
    Macario (sa isip): Noon, batas nila ang tumawag sa amin na bandido.
    Macario: May mga kondisyon ako.
    Macario: Amnestiya sa lahat ng tauhan ko. Karapatang magdala ng baril.
    Macario: At pahintulot na makaalis ng bansa, ako at ang aking mga opisyal.
    Gómez: Dadalhin ko ang mga ito sa Gobernador-Heneral.
    Macario: ...
    Macario: Kung para sa Asamblea... bababa ako.

Completes: Harapin si Dominador Gómez. Then, by itself:

    Montalan: Hindi ako nagtitiwala sa kanila, Pangulo.
    Macario: Hindi rin ako. Pero kung ako na lang ang nakaharang, aalis ako sa daan.

    [BLACK] Hulyo 14, 1906
    [BLACK] Maynila

Talked to, after:

    Montalan: Sugo ng Amerikano, Pangulo. Mag-ingat ka sa sasabihin niya.
    Montalan: Kung bababa ka, bababa kami.
    Gómez: Dadalhin ko ang mga kondisyon ninyo, Pangulo.

Whether Gómez knew what would happen in Cavite is debated; the game does
not say.

### 8. Into Manila

[MACARIO] On 14 July 1906 he comes down from the mountains and enters
Manila. [INSERT] The crowd, and those who knew him. tondo, by day, from
the east end (x 12500). On arrival:

    Macario (sa isip): Apat na taon akong nasa bundok.
    Mga Tao: Si Sakay! Si Sakay 'yan!
    Mga Tao: Ang haba ng buhok!
    Macario (sa isip): Makikilala nila ako kahit sa malayo. 'Yon ang sinabi ko.

That last is his thought at Morong, paid. Since Block 120 the crowd is
seen: six townspeople (owed, two pictures) along the road from where he
comes in, "Mga Tao" speaking from the first. Isko (x 11000), with his son
Andres (owed), once:

    Isko: Pangulo!
    Macario: Isko. ...Francisco Reyes, 'di ba?
    Isko: Isko pa rin po, sa inyo.
    Isko: Ito po si Andres. Pitong taon na.
    Macario: Andres.
    Isko: Gaya ng Supremo.
    Isko: Hinanap ko po si Nanay ninyo. Sa Tondo, sa Malabon, sa mga ospital.
    Isko: Wala po. Walang nakaaalam.
    Macario: ...
    Macario: Sinabi ko sa'yong huwag kang mangako.
    Isko: Kaya nga po hindi ako tumigil.

and then:

    Isko: Mag-ingat po kayo sa Cavite, Pangulo.

Maryam (x 13250), once:

    Maryam: Macario! Ang haba ng buhok mo.
    Maryam: Para kang Sultan sa dula natin.
    Macario: Bumaba na ako, Maryam.
    Maryam: Tapos na ba ang dula?
    Macario: Ang huling eksena, sa Cavite. May salu-salo raw.
    Maryam: ...
    Maryam: Mag-ingat ka sa mga eksenang hindi mo isinulat.

and then:

    Maryam: Mag-ingat ka, Macario.

The three who took the pamphlets, in the crowd:

    Mangingisda: Pangulo! Bumaba na raw kayo!
    Tabakera: Kung ganyan kahaba ang buhok, ikaw nga 'yan.
    Karpintero: Sabi ko sa'yo, kilala na kita, Macario.

The Mananahi (x 6400), once, and then:

    Mananahi: Iho... nakita kita.
    Mananahi: Sana nakita ka rin niya.
    Mananahi: Nandito lang ako, iho.

The Kutsero (x 5950), his first employer, with Kabayo and the carriage,
waiting where the crowd thins out (Block 120; once at x 3300, where he
stood in Act I, a long empty walk further on):

    Kutsero: Ang batang nagsuklay ng kabayo ko. Tingnan mo ngayon.

His button, "Sumakay":

    Kutsero: Macario? Ikaw nga.
    Kutsero: Sumakay ka. Wala nang bayad.
    Macario: Salamat po.

    [BLACK] Hulyo 17, 1906
    [BLACK] Cavite

Completes: Bumaba sa Maynila.

### 9. The reception

[MACARIO] On 17 July 1906 he and his officers attend a reception in
Cavite hosted by Colonel Louis Van Schaick, and are seized and disarmed
there. [INSERT] The words, and the toast broken at its peak, as the knock
broke Nanay's plea in Act II and the raid the oath in Act III. sala, by
itself.

    Van Schaick: Mr. Sakay. Welcome to Cavite.
    Macario (sa isip): Maligayang pagdating daw sa Cavite.
    Van Schaick: Please. Enjoy the music. You are our guests.
    Macario (sa isip): Mga panauhin daw kami.
    Montalan (pabulong): Masyadong mabait, Pangulo.
    Macario (pabulong): Ngumiti ka. Dula ito para sa kanila.

    (a notice) Itaas ang baso sa mesa.

Talked to:

    Van Schaick: Relax, Mr. Sakay. The war is over.
    Macario (sa isip): Magpahinga raw ako. Tapos na raw ang digmaan.
    Montalan (pabulong): Hindi ko gusto ang dami ng sundalo sa labas, Pangulo.

The table (x 640), "Itaas ang baso":

    Van Schaick: A toast. To peace.
    Macario (sa isip): Sa kapayapaan daw.
    Macario: Sa kapayapaan... at sa Asamblea.
    Macario: At sa araw na—
    Van Schaick: Now!

    (Soldiers come in from both doors.)

    Sundalong Amerikano: Hands up! Drop your weapons!
    Macario (sa isip): Itaas daw ang kamay. Ibaba ang sandata.
    De Vega: Pangulo!
    Macario: Huwag! ...Huwag.
    Macario (sa isip): Ilang ulit akong nagbalatkayo para malusutan sila.
    Macario (sa isip): Ngayon, sila ang gumanap.

    [BLACK] Hulyo 17, 1906. Dinakip at dinisarmahan si Sakay at ang kanyang mga opisyal sa salu-salo.
    [BLACK] Hulyo 20, 1906. Dinala siya sa Maynila at ikinulong sa Bilibid.

Completes: Dumalo sa salu-salo. The soldiers who took Aguinaldo came as
revolutionaries (Act III); now the trap is a party.

### 10. Bilibid

[MACARIO, reported] Imprisoned at Bilibid. [INSERT] Montalan in the next
cell. selda, by itself.

    Macario (sa isip): Bilibid. Muli.
    Macario (sa isip): Amnestiya ang ipinangako. Rehas ang ibinigay.

Montalan, talked to:

    Montalan: Amnestiya raw, Sakay.
    Macario: Sa papel nila, amnestiya. Sa batas nila, bandido.
    Montalan: At ang Asamblea?
    Macario: Bubuksan nila. Wala na kasing nakaharang.

    [BLACK] Setyembre 17, 1906
    [BLACK] Hukuman ng Unang Dulugan, Cavite

Completes: Kausapin si Montalan. The window before 1907, and Montalan
after:

    Macario (sa isip): Sa labas, ang Maynila. Hindi ko na abot.
    Montalan: Hindi nila tayo mapapatahimik, Sakay. Kahit dito.

### 11. The court

[MACARIO] On 17 September 1906 he is arraigned in the Court of First
Instance of Cavite for bandolerismo and pleads not guilty; on 21
September he and his co-defendants change the plea to guilty; before the
end of 1906 the court sentences him to death, with Julian Montalan, León
Villafuerte and Lucio de Vega. Why the plea changed the record does not
say, and the game does not either. [INSERT] The judge's words. hukuman,
by itself.

    Hukom: Macario Sakay.
    Hukom: You are charged with bandolerismo. Brigandage.
    Macario (sa isip): Bandolerismo. Pagiging bandido.
    Hukom: How do you plead?
    Macario (sa isip): Ano raw ang sagot ko.

The judge (x 900), "Sumagot":

    Macario: Hindi ako nagkasala.
    Hukom: Not guilty. So noted.
    Macario (sa isip): Hindi raw nagkasala. Itinala.

    [BLACK] Setyembre 21, 1906
    [BLACK] Binago ni Sakay at ng kanyang mga kasama ang kanilang sagot: nagkasala.
    [BLACK] Hindi sinasabi ng mga tala kung bakit.
    [BLACK] Bago matapos ang 1906

    Hukom: The court finds the accused guilty of bandolerismo.
    Macario (sa isip): Nagkasala raw kami ng bandolerismo.
    Hukom: Macario Sakay. Julian Montalan. León Villafuerte. Lucio de Vega.
    Hukom: Sentenced to death by hanging.
    Macario (sa isip): Kamatayan. Bibitayin kaming apat.
    Macario: ...

    [BLACK] Hulyo 26, 1907
    [BLACK] Bilibid

Completes: Harapin ang hukuman. The Brigandage Act of Act III is the law
he is tried under.

### 12. The window

[CONTEXT] On 26 July 1907 the Supreme Court upholds the sentences; on 30
July the first elections for the Philippine Assembly. Macario is in his
cell for both and hears of them from a guard. [INSERT] The guard, the
hair, the last night. selda, by itself.

    Bantay: Sakay. Galing sa Korte Suprema.
    Bantay: Pinagtibay ang hatol. Bibitayin kayo.
    De Vega: Wala na palang tutubos.
    Macario: ...

De Vega, talked to:

    De Vega: Kasama mo ako hanggang dulo, Pangulo.

The window (x 1000), "Dumungaw":

    [BLACK] Hulyo 30, 1907

    Bantay: Bumoboto na raw sila sa labas. Ang unang halalan ng Asamblea.
    Macario (sa isip): Ang Asamblea. Para rito ako bumaba.
    Macario (sa isip): Bumoboto sila. At narito ako.
    De Vega: Sulit ba, Pangulo?
    Macario: Kung may Pilipinong susulat ng batas para sa sariling bayan... oo.
    Bantay: Ang haba ng buhok mo, Sakay.
    Macario: Sumumpa ako. Hindi ko ito gugupitin hangga't hindi malaya ang bayan.
    Bantay: Hindi pa malaya ang bayan.
    Macario: Hindi pa nga.

Completes: Dumungaw sa bintana. Then, by itself: the father, the first
thing said in the game ("inaantay mo pa din tatay mo?"), answered.

    [BLACK] Setyembre 12, 1907
    [BLACK] Ang huling gabi

    Macario (sa isip): 'Nay...
    Macario (sa isip): Umalis si Tatay isang gabi at hindi na bumalik. Hinintay mo siya.
    Macario (sa isip): Hinintay mo rin ako.
    Macario (sa isip): ...
    Macario (sa isip): Patawad po.

    [BLACK] Setyembre 13, 1907

### 13. The last morning

[MACARIO] On 13 September 1907, at about 8:30 in the morning, he is
hanged at Old Bilibid Prison in Santa Cruz, Manila, with Lucio de Vega.
In his final statement he says that he and his men were never bandits but
members of the revolutionary force that defended the Philippines: the
substance is documented, the wording varies by translation, and this
Tagalog is ours. [CONTEXT] On 16 October 1907, thirty-three days after,
the Philippine Assembly opens; on black. patyo, by itself.

    Macario (sa isip): Alas-otso y medya ng umaga.
    Bantay: Oras na, Sakay.
    Macario (sa isip): Ilang beses akong umakyat sa entablado.
    Macario (sa isip): Ito ang huli.

The student walks him across the yard to the scaffold (x 1750, reached);
nothing walks for him. Completes, at the end: Lumakad sa huling umaga.

    Macario: Darating ang kamatayan sa ating lahat, maaga man o huli.
    Macario: Kaya haharapin ko nang mahinahon ang Panginoong Maykapal.
    Macario: Ngunit nais kong sabihin sa inyo: hindi kami mga bandido at magnanakaw, gaya ng paratang sa amin ng mga Amerikano.
    Macario: Kami ay mga kasapi ng hukbong rebolusyonaryo na nagtanggol sa ating Inang Bayan, ang Pilipinas.
    Macario: Paalam! Mabuhay ang Republika, at nawa'y isilang ang ating kalayaan sa hinaharap!
    Macario: Paalam! Mabuhay ang Pilipinas!

    [BLACK] Setyembre 13, 1907. Alas-otso y medya ng umaga.
    [BLACK] Binitay si Macario Sakay sa Lumang Bilibid, Santa Cruz, Maynila, kasama si Lucio de Vega.
    [BLACK] Hindi niya ginupit ang kanyang buhok.
    [BLACK] Oktubre 16, 1907. Binuksan ang Asamblea ng Pilipinas.
    [BLACK] Tatlumpu't tatlong araw matapos siyang mamatay.
    [BLACK] Hindi nalaman kailanman kung ano ang nangyari sa kanyang ina.
    [BLACK] Wakas ng Ikaapat na Yugto

The screen stays black after the last card: Act IV is finished, and the
post-test runs (a guest goes back to the title).

### Act IV's Talaan

Three papers of facts of the game's own, on the street in July 1906
(fixed: x 11800 on the road; x 9600 and x 6900 at jump height); a
teacher's paper replaces its own slot.

    [HINT] Ang Manipesto ng 1904: Noong Abril 5, 1904, naglabas si Macario Sakay ng manipesto mula sa kabundukan. Ipinahayag nito na may buong karapatan ang mga Pilipino na ipaglaban ang kanilang kalayaan.
    [HINT] Ang Rekonsentrasyon: Noong 1905, inipon ng mga Amerikano ang mga taga-baryo ng Cavite at Batangas sa mga kampong may bantay. Nagutom ang mga taga-baryo, at naubos ang pagkain at tulong para sa mga lumalaban sa bundok.
    [HINT] Ang Asamblea ng Pilipinas: Noong Hulyo 30, 1907, bumoto ang mga Pilipino sa unang halalan para sa Asamblea ng Pilipinas. Binuksan ito noong Oktubre 16, 1907. Ito ang asambleang ipinangako nang pumayag si Sakay na bumaba mula sa bundok noong 1906.

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

    Act III's (Block 117), for Act IV:

    The hair. Sworn at Morong not to be cut until the country is free;
      he was a barber. "Kung makita mo ako, makikilala mo pa kaya ako?"
    Nanay. Still unknown. The Mananahi: she waited at the door every
      day, and one morning was gone; strangers live in the house.
    Isko. Surrendered in April 1901 as Francisco Reyes, to go home to a
      child he had never seen; promised to keep looking for Nanay.
    The Barbero. Taken in the raid of January 1902; his fate unknown.
    The informer. Someone told the Americans of the oath; a stranger had
      asked after Macario at the third door. Not named.
    The name. "Bandido" by law since November 1902; the Republika ng
      Katagalugan named by Macario. Carreón and Montalan with him.
    Maryam. Knows now who the two men were; the theatre shut; "Wala na
      akong ibang kapareha sa entablado."

    Act IV's (Block 119): the game's end. Paid: the hair (never cut),
      the disguise (Tanay; the reception turned on him), Isko's promise
      (he searched, and nobody knows), the father (answered on the last
      night), "bandido" (answered by the last statement). Left open on
      purpose: Nanay's fate, whether Sakay was at Tanay, whether Gómez
      knew, why the plea changed, Montalan's and Villafuerte's fates.

## Open questions for the proponents

Act I. The proponents accepted it on 4 Oct 2026 (Block 113): every line
of ours, the names ours gave (Julian, Don Rodrigo, the Sultan, the
Katipunero, the Kasama, the three and the Suki), the play and its
ending, the years (1890, 1894, 1895), the head of his council, the
barber's tools, the direktor's pay and the Talaan's three papers. Nothing
is open in Act I.

Acts II, III and IV (Blocks 113, 117 and 119). The proponents accepted
every line of ours on 9 Oct 2026, with the names ours gave, the words
given to the historical figures, the Americans' English, Sakay's last
statement in our Tagalog and each act's Talaan papers. Nothing is open
in Acts II to IV.

Act I's play (Block 113, the proponent's direction): the moro-moro now
ends with the Moorish kingdom's fall and the princess taking the
knight's faith; the four new lines are ours.
