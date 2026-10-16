# ART.md

The art MACARIO still needs, for the artist. Four parts: Backgrounds,
Sprites, Props, and COMPLETED (what is already done; nothing there
needs drawing). Inside each part the pictures are sorted by act. Act I
comes first because it is the act students are tested on, so draw Act
I's pictures first, then Act II's, and so on.

Until a picture arrives the game shows a grey box with its file name
on it, so every file name below is exact: save the picture under that
name, in lowercase, with the hyphens as written.

How to draw them:

    Backgrounds   a painting of the whole place, as wide as the size
                  given, the floor or ground along the bottom. JPG.
                  "One screen" is about 1900 by 940 pixels. Draw the
                  place at the people's size: in a painting 940 tall, a
                  grown man standing at the front is about 215 pixels
                  tall (a quarter of the height), a door about 300, a
                  table top about 100 above the floor, and the people's
                  feet stand about 100 above the bottom edge, so the
                  floor or road fills the bottom 150 or more. A room
                  painted closer than that cannot be fixed by the game:
                  its furniture is too big for the people in it
                  (Block 138). Not tiled or
                  repeated: one painting, drawn once. Paintings meant to
                  stand side by side (a street, a field in two parts) are
                  all the same size and shape, the ground at the same
                  height in each, or they cannot be laid at one scale.

    Sprites       one person, one picture: the whole body, standing,
                  side on, facing right, on a transparent background
                  (PNG, not on black or white), about 500 pixels tall or
                  more. One picture per
                  person is enough; the game makes the walk and the
                  fight from it. Someone who fights or walks needs his
                  arms hanging free of his body and his feet showing.
                  Someone who only stands and talks may face the front.

    Props         a thing, not a person: one picture on a transparent
                  background (PNG), drawn at any size. The size given is
                  how tall it is next to Macario.

Every picture is in the same painted pixel style as Macario and the
street, in the Philippines of the year given.

Each entry says what the picture is, what happens there or what the
person does in the story, and the mood of the moment, so the picture
fits the scene it is for. Where a detail is needed for the game to
work (a door on the right, a window at the left edge), it is said.
For people, the entry says who they are and what they do, not how they
look: the proponent has the references for that.

"Also wanted" under an act is extra: the game does not use those
pictures yet, but will once they are drawn. A picture that came but did
not fit (drawn too close, the wrong year) is taken out of the game and
listed here as owed again, so what is missing is plain (Block 141).

For the team: node _dev/tools/missing-art.js lists what the game asks
for and does not have. prepare.js checks that every file listed in
Backgrounds, Sprites and Props (outside "Also wanted") is missing, and
that every missing one is listed; when a picture arrives, move its line
to COMPLETED. A still delivered on black: node _dev/tools/key-still.js;
a sheet on black: _dev/tools/key-black.py. How a still is turned into
sheets: CLAUDE.md, Animating a character from one still. Originals are
kept in docs-private/art-delivered/.

## Backgrounds

### Act I

Nothing needed.

### Act II

    assets/backgrounds/act2/imprenta.jpg
        The Katipunan's hidden printing press in Tondo, 1896. About
        2900 by 940.
        What happens: Act II opens here, Macario printing the second
        issue of the Katipunan's newspaper, Kalayaan. Later the same
        day the Spanish guards raid it; he sneaks between them, hiding
        behind cover and on high shelves, to reach the list of members,
        finds his own name and his mother's address on it, and escapes
        through the back window.
        Mood: busy and hopeful at first, then searched and dangerous.
        The press at the left, stacks of paper, crates, two high shelves
        a person could climb, the back window at the left edge, the door
        out at the right edge. As first delivered: the table reaches Macario's chest and
        the press is two and a half times his height (about twice too
        big).
        Scale: the room as the game's people see it, from further
        back than the painting first delivered. A grown man standing on
        the floor at the front is about 215 pixels tall (a quarter of
        the picture's height), a door about 300, a table top about 100
        above the floor; the floor runs along the bottom 150 pixels or
        more, and the people's feet stand about 100 above the bottom
        edge.
        (NOT STARTED)

    assets/backgrounds/act2/bahay.jpg
        Macario and his mother's home in Tondo, August 1896. One screen.
        What happens: his mother sees ink on his hands and begs him not
        to disappear the way his father did. He promises to come back,
        and before he has finished, the door is hammered: a friend
        calling him to the printing press. He leaves her there, and he
        never sees her again.
        Mood: poor but cared for, quiet, the last safe place in the
        game. One room, a table, the door on the right. As first delivered: the table
        at his waist, the door twice his height (about 1.6 times too
        big).
        Scale: the room as the game's people see it, from further
        back than the painting in the game now. A grown man standing on
        the floor at the front is about 215 pixels tall (a quarter of
        the picture's height), a door about 300, a table top about 100
        above the floor; the floor runs along the bottom 150 pixels or
        more, and the people's feet stand about 100 above the bottom
        edge.
        (NOT STARTED)

### Act III

    assets/backgrounds/act3/barberya.jpg
        The Barbero's shop in Tondo, 1899 to 1902. One screen.
        What happens: Macario, in disguise, cuts an American soldier's
        hair in the barber's chair. At night the shop becomes a secret
        meeting place: he teaches Bonifacio's creed to three old
        friends and swears in new members. During an oath in 1902 the
        door is hammered and he is arrested.
        Mood: an ordinary shop by day, a hiding place by night. One
        room, the barber's chair, a mirror, a table, the door on the
        right. By day; the game makes it night. As first delivered: the counter as tall
        as he is (about 1.8 times too big).
        Scale: the room as the game's people see it, from further
        back than the painting in the game now. A grown man standing on
        the floor at the front is about 215 pixels tall (a quarter of
        the picture's height), a door about 300, a table top about 100
        above the floor; the floor runs along the bottom 150 pixels or
        more, and the people's feet stand about 100 above the bottom
        edge.
        (NOT STARTED)

    assets/backgrounds/act3/calle-gunao.jpg
        A house on Calle Gunao, Quiapo, August to November 1901. One
        screen.
        What happens: the founding of the Partido Nacionalista, which
        asks the Americans for independence by peaceful means; Macario
        becomes its Secretary-General and gathers signatures for a
        petition. Then a new law, the Sedition Law, makes even asking
        for freedom a crime, and the last man refuses to sign.
        Mood: hopeful and respectable at first, then the hope taken
        away. A sala, papers on a table. As first delivered: the table near his waist
        (about 1.5 times too big).
        Scale: the room as the game's people see it, from further
        back than the painting in the game now. A grown man standing on
        the floor at the front is about 215 pixels tall (a quarter of
        the picture's height), a door about 300, a table top about 100
        above the floor; the floor runs along the bottom 150 pixels or
        more, and the people's feet stand about 100 above the bottom
        edge.
        (NOT STARTED)

### Act IV

    assets/backgrounds/act4/sala.jpg
        The hall in Cavite, 17 July 1906. One screen.
        What happens: after coming down from the mountains, Macario and
        his officers are guests at a reception given by an American
        colonel. At the toast, soldiers come in from both doors and
        arrest them. The party was a trap.
        Mood: polite and festive, until it is not. A large room, a
        table laid for a meal, a door at each end. The flags of 1906 (the
        American one; not Spain's). As first delivered: the chairs as tall as he is
        (about 1.5 times too big).
        Scale: the room as the game's people see it, from further
        back than the painting in the game now. A grown man standing on
        the floor at the front is about 215 pixels tall (a quarter of
        the picture's height), a door about 300, a table top about 100
        above the floor; the floor runs along the bottom 150 pixels or
        more, and the people's feet stand about 100 above the bottom
        edge.
        (NOT STARTED)

    assets/backgrounds/act4/hukuman.jpg
        The Court of First Instance of Cavite, 1906. One screen.
        What happens: Macario is tried as a bandit under the Brigandage
        Act and sentenced to death with his officers.
        Mood: formal, cold, the outcome already decided. The judge's
        bench on the right, a rail, benches. As first delivered: the rail at his chest
        (about 1.4 times too big).
        Scale: the room as the game's people see it, from further
        back than the painting in the game now. A grown man standing on
        the floor at the front is about 215 pixels tall (a quarter of
        the picture's height), a door about 300, a table top about 100
        above the floor; the floor runs along the bottom 150 pixels or
        more, and the people's feet stand about 100 above the bottom
        edge.
        (NOT STARTED)

## Sprites

### Act I

Nothing needed.

### Act II

Nothing needed.

Also wanted (not in the game yet):

    assets/sprites/characters/bonifacio-still.png (a second version)
        Andres Bonifacio, the Supremo of the Katipunan, exactly as
        already drawn, but with his sword drawn and held low in his
        near hand, the blade pointing forward and clear of his body.
        With it he swings his sword at the charges (San Juan del Monte,
        the Nangka River) instead of raising his fist.

    assets/sprites/player/macario-katipunero-idle.png
    assets/sprites/player/macario-katipunero-walk.png
        Macario dressed as a Katipunero of 1896, an outfit a student
        can buy in the game's shop as a reward: white camisa de chino,
        red trousers rolled at the shin, a red kerchief at the neck, a
        bolo at the hip. The same poses, frame counts and cell sizes as
        macario-idle.png and macario-walk.png, so they fit.

### Act III

    assets/sprites/characters/sundalong-amerikano.png
        An American private, a customer at the barbershop, whose hair
        Macario cuts while in disguise. He calls the rebels hiding in
        Tondo "bandits", not knowing who is holding the scissors. Side on, seated
        in the barber's chair with a barber's cape over him; he also
        walks out. (NOT STARTED)

    assets/sprites/enemies/amerikano.png
        An American soldier of the Philippine-American War, 1899 to
        1906: the enemy in Act III's first battle, the sentries Macario
        sneaks past in Tondo, and the soldiers at Malabon. Armed with a
        rifle and bayonet. Side on; he fights hand to hand and stands
        guard with the rifle. In Acts III and IV. The kit of 1899: a
        broad-brimmed campaign hat and a blue shirt (the soldier
        delivered on 16 October wore the steel helmet, pack and puttees
        of 1917 and was taken out; the same pose is welcome, so the
        game's animation fits him). (NOT STARTED)

    assets/sprites/enemies/konstable.png
        A man of the Philippine Constabulary, 1902 to 1906: a Filipino
        serving the Americans' police force, sent against Macario's
        Republic. He attacks the camp at Morong, guards the post Macario
        raids, and defends Malabon. Armed with a rifle. Side on; he
        fights hand to hand and stands guard. In Acts III and IV.
        (NOT STARTED)

Also wanted (not in the game yet):

    assets/sprites/player/macario-heneral-idle.png
    assets/sprites/player/macario-heneral-walk.png
        Macario as President and Generalissimo of the Republika ng
        Katagalugan, 1902 to 1906, an outfit a student can buy in the
        shop: a dark buttoned uniform, a sash, long hair worn loose (the
        hair he swore not to cut). The same poses, frame counts and
        cell sizes as macario-idle.png and macario-walk.png.

### Act IV

    assets/sprites/characters/gomez.png
        Dominador Gómez: a labour leader sent by the American governor
        to talk Macario down from the mountains. He promises that the
        Philippine Assembly can open once the last fighter surrenders,
        and Macario agrees on terms. Whether Gómez knew of the trap
        that followed is still debated. Side on; he walks up a slope.
        (NOT STARTED)

    assets/sprites/characters/van-schaick.png
        Colonel Louis Van Schaick: the American officer who hosts the
        reception in Cavite in 1906, where Macario and his officers are
        arrested at the toast. Standing. (NOT STARTED)

    assets/sprites/characters/villafuerte.png
        León Villafuerte: one of Macario's officers, beside him at
        Malabon and at the reception, and sentenced with him. Side on,
        standing. (NOT STARTED)

    assets/sprites/characters/de-vega.png
        Lucio de Vega: one of Macario's officers, sentenced with him and
        hanged beside him on the last morning; he speaks to Macario in
        the cell. Side on; he walks. (NOT STARTED)

    assets/sprites/characters/hukom.png
        The Hukom: the American judge of the Court of First Instance of
        Cavite, who tries Macario as a bandit and sentences him to death.
        Seated at the bench. (NOT STARTED)

    assets/sprites/characters/taga-cavite.png
        The Taga-Cavite: a woman of Cavite who escapes the American
        camps where the villagers have been herded, and brings Macario's
        starving army the little rice she could carry. Through her the
        player learns what the camps are doing to the people. Side on;
        she walks into the camp. (NOT STARTED)

    assets/sprites/characters/anak-ni-isko.png
        Andres: Isko's son, about seven years old, 1906, the child Isko
        surrendered to go home to. He stands
        beside his father in the crowd in Manila. (NOT STARTED)

    assets/sprites/characters/taong-bayan-1.png
    assets/sprites/characters/taong-bayan-2.png
        The crowd in Manila, July 1906: ordinary people of Tondo who
        line the street to see Macario come down from the mountains,
        and who know him by his long hair. A man (1) and a woman (2),
        standing; may face the front. Each is repeated along the street.
        (NOT STARTED)

## Props

### Act I

    assets/sprites/scenery/tahian.png
        The Mananahi's sewing table, on the street beside her: where
        Macario, a boy looking for work, helps her sew for a few coins
        before she sends him to the theatre with the costumes. About
        two thirds of Macario's height. (NOT STARTED)

    assets/sprites/scenery/silya-barbero.png
        The Barbero's chair, set out on the street beside him: where
        Macario, as a boy, cuts his first customer's hair. In Act III
        the same chair is inside the barbershop. About two thirds of
        Macario's height. (NOT STARTED)

Also wanted (not in the game yet):

    assets/sprites/scenery/entablado-harap.png
        The front of the theatre (the entablado) on the street, a
        building seen from the front, where Macario first goes on stage
        and later becomes the company's lead actor. Its door drawn open
        with warm light inside, so it reads as a way in.

### Act II

    assets/sprites/scenery/palimbagan.png
        The Katipunan's hand printing press, on which Macario prints the
        newspaper Kalayaan at the start of Act II, and in Act IV prints
        his manifesto in the mountains. A little shorter than Macario.
        (NOT STARTED)

    assets/sprites/scenery/dayami.png
        A bundle of straw on the bank of the Nangka River, before
        Macario raises it as a scarecrow to fool the Spanish. About half
        Macario's height. (NOT STARTED)

    assets/sprites/scenery/panakot.png
        The same straw bundle raised as a scarecrow, standing like a
        Katipunero, wearing a salakot with a red band, so that from the
        far bank the Spanish take it for a man and attack it. Macario's
        height. (NOT STARTED)

Also wanted (not in the game yet):

    assets/sprites/scenery/bahay-nanay.png
    assets/sprites/scenery/imprenta.png
        Two buildings on the street, each seen from the front, its door
        drawn open with warm light inside so it reads as a way in:
        Macario's mother's house (bahay-nanay), where Act II's promise
        is made, and the ordinary-looking house that hides the
        Katipunan's printing press (imprenta).

### Act III

    assets/sprites/scenery/watawat-katagalugan.png
        The flag of the Republika ng Katagalugan on its pole, raised by
        Macario at Morong when he founds the Republic, and the flag he
        defends when the Constabulary attacks the camp. Taller than
        Macario. (NOT STARTED)

Also wanted (not in the game yet):

    assets/sprites/scenery/barberya.png
        The barbershop on the street, seen from the front: the shop
        where Macario hides in plain sight and holds secret meetings.
        Its door drawn open with warm light inside, so it reads as a
        way in.

### Act IV

Nothing needed.

## COMPLETED

Done and in the game. Nothing here needs drawing.

    Backgrounds
        Act I     the street (street-01 to street-04), the road
                  (ground-lupa), the inside of the theatre
                  (entablado-inside), the Katipunan's secret room
                  (pulungan)
        Act II    Pugad Lawin,
                  San Juan del Monte (san-juan-1 and 2), the Nangka
                  (nangka-1 and 2), Balara, Laguna
        Act III   the hill camp (burol-1 and 2), the plaza (bayan),
                  Morong (morong-1 and 2),
                  the cell in Bilibid (selda, Acts III and IV)
        Act IV    the Constabulary's post (himpilan-1 and 2),
                  Di-Masalang (dimasalang-1 and 2), Malabon
                  (malabon-1 and 2), Bilibid's yard (patyo)

    Sprites
        Macario   idle, walk, jump, punch, shot
        Act I     Nanay, the Kutsero and his horse (Kabayo), the
                  Barbero, the Mananahi, the three siga, the direktor,
                  Maryam, the Sultan, the kawal, the Katipunero, the
                  Kasama, the Mabalasig, the three who take the
                  pamphlets (the mangingisda, the tabakera, the
                  karpintero), the guardia civil (bantay)
        Act II    Bonifacio, Isko, Jacinto, the Manlilimbag, the
                  Tagapagbalita
        Act III   Álvarez, Carreón, Montalan, Poblete (standing, since
                  Block 135), the Guro, the Opisyal, the Bagong
                  Nakatira, the Katagalugan's fighter, the Bilibid
                  guard

    Props
        none yet
