# STORY.md

The plot of MACARIO: what happens, where, to whom, and every line that
is said. A session that is about to write or change story reads this
file first; a proponent who wants to know what a student sees reads it
instead of the code.

Three files carry context, and they do not overlap:

    CLAUDE.md     how the thing is built. Architecture, conventions
                  (including how dialogue is written), data formats,
                  decisions on record. Changes rarely.
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
Writing dialogue. The proponents' lines are kept exactly as given,
misspellings included, and are never rewritten to match ours.

Last updated: 28 Sep 2026, Block 73 (a work-in-progress room of guards
after the opening, recorded under its own heading; the plot itself is
unchanged). Before that, 25 Sep 2026, Block 70 (the Talaan's papers are the
teacher's, at three fixed places on the street). Before that, Block 69
(the Talaan's words and hints removed, the apple tree now the
silhouette tree at 5800, and no guide: the student finds each person
unaided).

## The story in brief

Act I, Ang Pinagmulan ni Macario. Tondo, 1880. A boy teased about the
father who never came back learns that his mother spent the last of
their money on her cedula, and goes out to earn. He tends a kutsero's
horse, runs a mananahi's deliveries, and on the last delivery walks
into a theatre company's crisis: their lead actor is sick and the
house is full. The costume he carried fits him. He goes on, forgets his
first line, adds one of his own, wins the stage fight, and walks off to
a standing crowd and an offer to join the company. He brings the money
home to his mother. The act is held open there; what comes next is not
written yet.

Acts II to IV are not written. Their content files are registered stubs
(content/act2.js to act4.js) and hold no story.

## Places

Act I has two.

tondo, the street. One long road, 14500 wide, ten paintings of the town
end to end (street-01 to 04 in order, twice, then 01 and 02), a palm or
a tree in silhouette over each join between two paintings. Everyone in
Act I lives on it, left to right:

    x 900      where Macario stands when the game opens
    x 2000     Nanay, where she and Macario walk to in the opening
    x 3300     the Kutsero
    x 3560     his white horse, Kabayo
    x 5800     the apple tree (Puno ng mansanas): the silhouette tree
               over that join, with no picture of its own
    x 6400     the Mananahi
    x 7800     Aling Rosa, a customer
    x 9300     Mang Tomas, a customer
    x 13600    the direktor, at the far end, by the entablado

The siga are not on the street after the opening: they walk on behind
Macario at the very start and are gone when he walks off with Nanay.

entablado, inside the theatre. One painting of a stage (curtains, a
painted backdrop of a Moorish city by the sea), one phone screen wide,
1180. The direktor stands in the left wing (x 60), Maryam on the stage
(x 300); the Sultan and his soldiers come from the right wing; the way
out, Lumabas, is at the right edge and leads back to the street beside
the direktor. It is reached only with the direktor, once.

## Cast

    Macario        the boy, the player. Real art (idle, walk, jump,
                   punch, shooting).
    Nanay          his mother. Real art; slides rather than walks.
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
    Aling Rosa     her customer; a baro for tomorrow's fiesta.
                   Placeholder box (aling-rosa.png).
    Mang Tomas     her customer; a pair of trousers. Wears the
                   Tindero's real art.
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

Names and roles marked as ours: Aling Rosa, Mang Tomas, Julian, Don
Rodrigo (the part Macario plays), the Sultan. The proponents may rename
any of them.

## Act I, beat by beat

The quest log shows one task at a time; the task each beat completes
is named at its end. Barya is Macario's money; the savings count
toward 100.

### 1. The opening

tondo, x 900. Plays by itself the first time a student enters Act I.

    [BLACK] Tondo, 1880
    [BLACK] Kung saan nagsimula ang buhay ni Macario

    (Macario stands alone, facing right. The three siga walk up
    behind him from the left. He turns to face them.)

    Siga: Ano Macario, inaantay mo pa din tatay mo?
    Mga Siga: BAHAHAHAHAHAHA!
    Macario: Isarado mo 'yang bunganga mo!

    (Nanay comes in from the right. He turns to her.)

    Nanay: Macario, uwi na, may kailangan akong sabihin sayo
    Mga Siga: HAHAHAHHHHA! NAGSUMBONG SA NANAY!
    Nanay: Wag mo pansinin yung mga yan
    Macario: Tsk

    (He and Nanay walk off together to the right, to x 2000, and the
    siga are left behind. There, outside:)

    Macario: Nay, ano po ba yung sasabihin niyo?
    Nanay: Macario, anak, naubos na yung pera natin sa pagbili ko ng Cedula...
    Nanay: Wala na tayong pambili ng bigas, humingi ako ng ulam sa kapitbahay para sa hapunan natin ngayon...
    Nanay: Pasensya ka na anak ha?
    Macario: Okay lang 'Nay, magta-trabaho na po ako para makatulong sainyo
    Nanay: Sigurado ka ba diyan 'nak?
    Macario: Opo inay, ako na po ang bahala

    Macario (sa isip): Kailangan ko ng pera para matulungan si Nanay, saan kaya ako makakahanap ng trabaho?

Completes: Umuwi kasama si Nanay. Nanay stays at x 2000 for the rest of
the act. A reload during the opening plays it again from the black
card; a reload after the talk plays only the thought.

### 2. The Kutsero

tondo, x 3300. Walk up and talk (Usap).

    Macario: Kutsero, maaari po ba akong magtrabaho dito?
    Kutsero: Macario? Buti naman at naisipan mo magtrabaho
    Macario: Kailangan na 'ho eh, nangangailangan si Nanay
    Kutsero: O sige, magsimula ka na kaagad, alagaan mo yung puting kabayo kuwadra
  + Kutsero: Gutom na 'yon. May puno ng mansanas diyan sa unahan. Kumuha ka ng tatlo, tapos ipakain mo sa kanya.

Completes: Maghanap ng trabaho: kausapin ang Kutsero.

### 3. The apples and the horse

tondo, the apple tree, which is the silhouette tree over the join at
x 5800 (walking up to it, the button reads Pumitas), then the horse at
x 3560. Nothing points the way: the Kutsero's "diyan sa unahan" is the
whole of the direction.

The tree opens a mini-game, "Puno ng mansanas": apples shake in the
leaves and fall one at a time, and a basket moved left and right
catches them. Three are needed; a miss costs nothing but the wait for
the next. Stopping early keeps what was caught. Macario's thoughts at
the tree, when it is not the task or the three are already in hand:

  + Macario (sa isip): Ang daming bunga ng punong ito.
  + Macario (sa isip): Tatlo na ang hawak ko. Dalhin ko na sa kabayo.

With three, the horse's button reads Ipakain ang mansanas:

  + Macario: Heto na, kaibigan. Dahan-dahan lang, ha.
  + Kabayo: Hiiiii!

Completes: Kumuha ng tatlong mansanas at ipakain sa kabayo (n/3).

After the horse is fed, the tree is a game of its own (Block 65, ours):
thirty seconds to catch as many as he can, every fifth apple golden and
worth three, three in a row a streak. Nothing is paid and nothing waits
on it; his best is kept.

  + (the window) Ilan ang masasalo mo sa loob ng 30 segundo? Rekord mo: n.
  + (a streak) Sunod-sunod! xn
  + (a golden apple) Ginintuang mansanas! +3
  + (a miss) Sayang!
  + (the end) Nakasalo ka ng n! / Bagong rekord: n! / Nakasalo ka ng n. Rekord mo: n.

### 4. The Kutsero pays

tondo, x 3300. The button reads Kunin ang bayad. +50 barya.

  + Kutsero: Heto ang limampung barya. Pinaghirapan mo 'yan.
  + Macario: Maraming salamat po!

Completes: Kunin ang bayad sa Kutsero.

### 5. The Mananahi

tondo, x 6400. Talk, once the Kutsero has paid.

    Macario: Mananahi, tumatanggap ba kayo ng trabahador?
    Mananahi: Oo naman Macario, kamusta na ang inay mo?
    Macario: Okay lang 'ho, nangangailangan kami ng pera ngayon
    Mananahi: O sige sige, tara dito
  + Mananahi: May tatlong tahi akong tapos na. 'Yung baro ni Aling Rosa, 'yung pantalon ni Mang Tomas, at 'yung mga damit ng direktor para sa palabas mamayang gabi.
  + Mananahi: Kina Aling Rosa at Mang Tomas ka muna, madadaanan mo naman sila. Nasa dulo pa ng kalye 'yung entablado, kaya sa direktor ka na huling pumunta.
  + Macario: Sige po, ihahatid ko na ngayon.

Completes: Kausapin ang Mananahi.

### 6. The deliveries

tondo. Aling Rosa (x 7800) and Mang Tomas (x 9300) in either order,
then the direktor (x 13600). Each button reads Iabot ang damit.

Aling Rosa:

  + Macario: Magandang araw po! Padala po ng Mananahi.
  + Aling Rosa: Ay, salamat, iho! Pakisabi sa Mananahi, ang ganda ng pagkakatahi.

Mang Tomas:

  + Macario: Magandang araw po! Padala po ng Mananahi.
  + Mang Tomas: Aba, sakto 'to sa akin. Salamat, bata.

The direktor will not take his until both are done (his line for that
is under Repeat lines). Then:

  + Macario: Magandang hapon po. Padala po ng Mananahi, 'yung mga damit para sa palabas.
  + Direktor: Salamat sa Diyos, dumating din! Akin na, iho.

The deliveries count (n/3); the step is finished by the next beat.

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

    (The Sultan comes back to a stage of fallen soldiers.)

  + Sultan: Natalo... ang lahat ng aking kawal?
  + Sultan: Kung ganyan katapang ang pag-ibig mo sa aking anak, sino ako para humadlang?
  + Maryam: Ama!
  + Sultan: Sa inyo na ang aking basbas.
  + Mga Manonood: Mabuhay! Mabuhay!

  + [BLACK] Nagsara ang telon.
  + [BLACK] Tumayo at pumalakpak ang mga manonood.

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
Lumabas at the right edge leads back to the street. A reload before the
pay plays the play again from backstage.

The play's ending is a blessing, not the moro-moro's traditional
conversion of the princess, and its kingdoms are not named by
religion: a choice made for a Grade 8 classroom that the proponents
may reverse.

### 9. The Mananahi pays

tondo, x 6400. Talk, then the button reads Kunin ang bayad. +50 barya.

  + Mananahi: Macario! Totoo ba 'yung ibinalita sa akin? Ikaw raw ang bumida sa entablado?
  + Macario: Nawala po kasi 'yung artista nila. Ako na lang po ang pinagsuot ng damit.
  + Mananahi: Aba, e 'di ikaw pala ang unang nagsuot ng tinahi ko! Kasya ba?
  + Macario: Kasyang-kasya po.
  + Mananahi: Sabi ko na nga ba. Halika, kunin mo na ang bayad mo.

  + Mananahi: Heto ang limampung barya. Salamat, Macario, malaking tulong ka.
  + Macario: Salamat din po!

Completes: Kunin ang bayad sa Mananahi.

### 10. The savings

tondo, x 2000. The button reads Ibigay ang ipon. 100 barya go to Nanay;
Macario keeps what the play paid beyond that.

    Macario: Nay, nakapag-ipon na ako ng pera para makatulong
    Nanay: Maraming salamat anak ko! Napakahusay mo! Ginalingan mo ba sa trabaho?
    Macario: Opo Nay, nagtrabaho ako para sa Kutsero at mananahi
  + Macario: Tapos, Nay... umarte pa po ako sa entablado.
  + Nanay: Ikaw? Sa entablado?
  + Macario: Nagkasakit po kasi 'yung bida nila. Ako na lang po ang ipinalit ng direktor.
  + Nanay: Kaya pala hindi mawala-wala 'yang ngiti mo.
    Nanay: Tuloy mo lang yan Nak, malayo ang mararating mo sa buhay
    Macario: Maraming salamat nay!

Completes: Ibigay kay Nanay ang naipon (n/100). Every task is done and
Act I is held open here: the post-test waits for the rest of the story.

## Work in progress (not the plot)

Block 73, at the proponent's request, while the official plot is still
being written. It changes nothing above and is not part of the story;
it is here because every black card in content/act1.js must be.

After Macario's thought at the end of beat 1, a black card:

    [BLACK] <WIP>

and he is in the guards' room (bantayan): three paintings of the town,
4350 wide, with three bantay (guardia civil, real art walking and
shooting) who see, turn hostile, level their rifles and fire, a
platform above their sight with a heart on it, and a crate to hide
behind. Nobody speaks. The door at the far end (Lumabas) leads back to
the street beside Nanay, and beat 2 carries on from there. It plays
once; the Kutsero is already the task in hand while he is in the room.

## Repeat lines

What each person says when talked to again, by where the story is.
One line each, on purpose (CLAUDE.md, Writing dialogue).

Nanay:

  + Nanay: Mag-iingat ka sa trabaho, anak. At umuwi ka bago dumilim.
    (before the savings)
    Nanay: Tuloy mo lang yan Nak, malayo ang mararating mo sa buhay
    (after)

Kutsero:

  + Kutsero: Nasa unahan lang ang puno. Tatlong mansanas, ha.
    (while the apples are the task)
  + Kutsero: Aba, busog na busog na siya! Halika, may bayad ka sa akin.
    (the horse fed, not yet paid)
  + Kutsero: Salamat, Macario. Balik ka lang kung kailangan mo pa ng trabaho.
    (afterwards)

Kabayo:

  + Kabayo: Hiiiii!

Mananahi:

  + Mananahi: O, Macario. Naghahanap ka raw ng trabaho? Unahin mo muna 'yung sa Kutsero, tapos balikan mo ako. Baka may maipagawa ako sa'yo.
    (before the Kutsero has paid)
  + Mananahi: O, may bitbit ka pa? Ihatid mo na, baka hinahanap na nila.
    (deliveries still to make)
  + Mananahi: Hinahanap ka raw ng direktor sa entablado. Bilisan mo!
    (delivered, the play not yet done; only an old save reaches this)
  + Mananahi: Iuwi mo na 'yan sa nanay mo. Matutuwa 'yon.
    (paid, before the savings)
  + Mananahi: Kapag may tahi ulit, ipapatawag kita, ha?
    (afterwards)

Aling Rosa:

  + Aling Rosa: Hay naku, ang tagal naman ng baro ko. Pista pa naman bukas.
    (waiting)
  + Aling Rosa: Isusuot ko 'to bukas sa pista. Abangan mo ako, ha!
    (afterwards)

Mang Tomas:

  + Mang Tomas: Galing ka ba sa Mananahi? Kanina ko pa hinihintay 'yung pantalon ko.
    (waiting)
  + Mang Tomas: Salamat ulit, bata. Ingat ka sa daan.
    (afterwards)

Direktor, on the street:

  + Direktor: Pasensya na, iho, abala kami. Mamayang gabi na ang palabas at ang dami pang kulang.
    (before the Mananahi's errand)
  + Direktor: Galing ka sa Mananahi? Mamaya ko pa kailangan 'yang mga damit namin, iho. Ihatid mo muna 'yung sa iba, baka sila ang naiinip na.
    (the errand, the other two not yet delivered)
  + Direktor: Ikaw 'yung bata ng Mananahi, 'di ba? Dala mo na ba ang mga damit namin?
    (ready for his)
  + Direktor: O, ano pa'ng hinihintay natin? Tara na sa loob, naghihintay na ang mga tao!
    (Macario agreed but is still outside, after a reload; takes him in)
  + Direktor: Hindi pa rin ako makapaniwala. Iniligtas mo ang palabas namin, iho.
    (after the play)

Direktor and Maryam, in the entablado:

  + Direktor: Huminga ka nang malalim, iho. Nandito lang ako sa gilid.
    (before the play)
  + Direktor: Bumalik ka rito kahit kailan mo gusto. May puwesto ka sa amin.
    (after)
  + Maryam: Kaya mo 'yan. Tumingin ka lang sa akin kapag nalito ka.
    (before the play)
  + Maryam: Alam mo, mas bagay sa'yo si Don Rodrigo kaysa kay Julian. Huwag mo lang sasabihin sa kanya.
    (after)

## The Talaan

Block 70. The papers are the teacher's. Up to three, written on the
dashboard (Talaan Papers); what they say is not in this file because
it is not in the content, and it changes whenever the teacher saves.
Where they lie is fixed:

    Paper 1   x 2500, on the road between Nanay and the Kutsero; every
              student walks into it on the way to the first job
    Paper 2   x 8200, past Aling Rosa, at jump height
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
    The company. The direktor has offered Macario a place ("may
      puwesto ka sa kompanya namin"). Sakay's life on the stage is a
      real thread worth following against the source book.
    Maryam. Teases him twice and prefers him to Julian.
    Julian. Sick tonight; he will want his part back.
    The money. Nanay has her 100; Macario kept what the play paid.

## Open questions for the proponents

    Every + line above: accept, rewrite or replace.
    The names ours gave: Aling Rosa, Mang Tomas, Julian, Don Rodrigo,
      the Sultan.
    The play's ending (a blessing, not a conversion) and its kingdoms
      not named by religion.
    Check the play against the source book, and the year on the
      opening card against Sakay's birth year in it.
    What the direktor pays (79 to 110 at random, the proponents' own
      numbers from Block 56).
    The Talaan: whether Act I should have words a student earns
      (empty since Block 69), and the wording of the two + lines under
      a found paper. The papers themselves are the teacher's.