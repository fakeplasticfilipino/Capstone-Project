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
                  "One screen" is about 1680 by 940 pixels, the size of
                  the stage painting already in the game. Not tiled or
                  repeated: one painting, drawn once.

    Sprites       one person, one picture: the whole body, standing,
                  side on, facing right, on a transparent background
                  (PNG), about 500 pixels tall or more. One picture per
                  person is enough; the game makes the walk and the
                  fight from it. Someone who fights or walks needs his
                  arms hanging free of his body and his feet showing.
                  Someone who only stands and talks may face the front.

    Props         a thing, not a person: one picture on a transparent
                  background (PNG), drawn at any size. The size given is
                  how tall it is next to Macario.

Every picture is in the same painted pixel style as Macario and the
street, in the Philippines of the year given.

"Also wanted" under an act is extra: the game does not use those
pictures yet, but will once they are drawn.

For the team: node _dev/tools/missing-art.js lists what the game asks
for and does not have. prepare.js checks that every file listed in
Backgrounds, Sprites and Props (outside "Also wanted") is missing, and
that every missing one is listed; when a picture arrives, move its line
to COMPLETED. How a still is turned into sheets: CLAUDE.md, Animating a
character from one still.

## Backgrounds

### Act I

    assets/backgrounds/act1/pulungan.jpg
        The Katipunan's secret room in Tondo, 1894, where Macario takes
        the oath: a dim room hung with black curtains, a warning written
        on the wall, a table. One screen. (NOT STARTED)

### Act II

    assets/backgrounds/act2/bahay.jpg
        Macario and his mother's home in Tondo, 1896: one poor room, a
        table, the door on the right. One screen. (NOT STARTED)

    assets/backgrounds/act2/imprenta.jpg
        The Katipunan's hidden printing press, 1896: a room behind an
        ordinary door, stacks of paper, high shelves, a back window at
        the left edge. About 3700 by 940. (NOT STARTED)

    assets/backgrounds/act2/pugad-lawin.jpg
        Pugad Lawin, Kalookan, August 1896: a clearing in the hills, a
        yard and a hut, where the cedulas were torn. One screen.
        (NOT STARTED)

    assets/backgrounds/act2/san-juan.jpg
        San Juan del Monte, August 1896: open ground before the Spanish
        powder store (El Polvorin), a river behind. A battlefield, about
        6000 by 940. (NOT STARTED)

    assets/backgrounds/act2/nangka.jpg
        The Nangka River in the hills of Morong, November 1896: a
        riverbank, the far side where the Spanish come from. About 3400
        by 940. (NOT STARTED)

    assets/backgrounds/act2/balara.jpg
        The Katipunan's camp at Balara, 1897: a fire, tents or a hut.
        Drawn by day; the game makes it night. One screen. (NOT STARTED)

    assets/backgrounds/act2/laguna.jpg
        Emilio Jacinto's camp in Laguna, 1897: by day, among trees. One
        screen. (NOT STARTED)

### Act III

    assets/backgrounds/act3/burol.jpg
        Macario's camp in the hills outside Manila, February 1899: a
        slope, a lookout, the city far below. About 4500 by 940.
        (NOT STARTED)

    assets/backgrounds/act3/barberya.jpg
        The barbershop in Tondo, 1899: one room, a barber's chair, a
        mirror, the door on the right. Drawn by day; the game makes it
        night for the secret meetings. One screen. (NOT STARTED)

    assets/backgrounds/act3/bayan.jpg
        A town plaza, April 1901: a wall with a printed proclamation on
        it, and on the right an American officer's table where men line
        up to surrender. One screen. (NOT STARTED)

    assets/backgrounds/act3/calle-gunao.jpg
        A house on Calle Gunao, Quiapo, August 1901: a sala where the
        Partido Nacionalista meets, papers on a table. One screen.
        (NOT STARTED)

    assets/backgrounds/act3/morong.jpg
        The camp in the mountains of Morong, 1902: huts among trees on a
        slope. About 4500 by 940. Act IV opens here too. (NOT STARTED)

    assets/backgrounds/act4/selda.jpg
        A cell in Bilibid prison, 1902 (and again in 1906 to 1907, in
        Act IV): stone walls, bars, a small barred window on the right,
        a door out at the right edge. The game draws the stone floor.
        One screen. (NOT STARTED)

### Act IV

    assets/backgrounds/act4/himpilan.jpg
        A Constabulary post in a town below the mountains, 1903: a yard
        with a fence, a storeroom at the left end. Drawn by day; the
        game makes it night. About 3700 by 940. (NOT STARTED)

    assets/backgrounds/act4/dimasalang.jpg
        Sakay's camp in the Di-Masalang mountains, Rizal, 1904 to 1906:
        huts among trees on a slope, poorer and thinner than Morong's.
        About 4500 by 940. (NOT STARTED)

    assets/backgrounds/act4/malabon.jpg
        San Francisco de Malabon, Cavite, January 1905: a town plaza, a
        church, the garrison's building. A battlefield, about 4500 by
        940. (NOT STARTED)

    assets/backgrounds/act4/sala.jpg
        The hall in Cavite where the American colonel's reception was
        held, July 1906: a large room, a table laid for a meal, doors at
        both ends. One screen. (NOT STARTED)

    assets/backgrounds/act4/hukuman.jpg
        The Court of First Instance of Cavite, 1906: a judge's bench on
        the right, a rail, benches. One screen. (NOT STARTED)

    assets/backgrounds/act4/patyo.jpg
        The yard of Old Bilibid Prison, Manila, September 1907, morning:
        stone walls, the scaffold toward the right end. About 3400 by
        940. (NOT STARTED)

## Sprites

### Act I

Nothing needed.

### Act II

    assets/sprites/characters/isko.png
        Isko, a young Katipunero, Macario's friend and right-hand man:
        side on; he runs on and off. In Acts II to IV, older each act
        (1896 to 1906). (NOT STARTED)

    assets/sprites/characters/jacinto.png
        Emilio Jacinto, about twenty, the Katipunan's writer, 1897: side
        on, standing. (NOT STARTED)

    assets/sprites/characters/manlilimbag.png
        A printer, ink on his apron: side on; he walks. In Acts II to
        IV. (NOT STARTED)

    assets/sprites/characters/tagapagbalita.png
        A messenger: side on; he runs in. In Acts II to IV.
        (NOT STARTED)

Also wanted (not in the game yet):

    assets/sprites/characters/bonifacio-still.png (a second version)
        Andres Bonifacio exactly as already drawn, but with his sword
        drawn and held low in his near hand, the blade pointing forward
        and clear of his body. With it he swings his sword at the
        charges instead of raising his fist.

    assets/sprites/player/macario-katipunero-idle.png
    assets/sprites/player/macario-katipunero-walk.png
        Macario as a Katipunero of 1896, an outfit sold in the game's
        shop: white camisa de chino, red trousers rolled at the shin, a
        red kerchief at the neck, a bolo at the hip. The same poses,
        frame counts and cell sizes as macario-idle.png and
        macario-walk.png, so they fit.

### Act III

    assets/sprites/characters/alvarez.png
        Santiago Álvarez, a Katipunan general, about thirty, in a coat,
        1901: side on, standing. (NOT STARTED)

    assets/sprites/characters/carreon.png
        Francisco Carreón, an old Katipunero, Vice President of the
        Republika ng Katagalugan: side on, standing, long hair. In Acts
        III and IV. (NOT STARTED)

    assets/sprites/characters/montalan.png
        Julian Montalan, the Katagalugan's general: side on, standing,
        long hair, a bolo. In Acts III and IV. (NOT STARTED)

    assets/sprites/characters/poblete.png
        Pascual Poblete, a writer, founder of the Partido Nacionalista,
        1901, an older man in a coat: side on; he walks in.
        (NOT STARTED)

    assets/sprites/characters/guro.png
        A Filipino teacher, 1901, a man in a barong: standing; may face
        the front. (NOT STARTED)

    assets/sprites/characters/opisyal.png
        An American officer, 1901, in khaki with a campaign hat, seated
        at a table. (NOT STARTED)

    assets/sprites/characters/sundalong-amerikano.png
        An American private in a barber's chair, sandy hair, no hat, a
        barber's cape over him: side on, seated; he also walks out.
        (NOT STARTED)

    assets/sprites/characters/bagong-nakatira.png
        A woman, a stranger now living in Macario's mother's house,
        1899: standing; may face the front. (NOT STARTED)

    assets/sprites/characters/kawal-katagalugan.png
        A fighter of the Republika ng Katagalugan, 1902 to 1906: long
        hair tied back, poor clothes, a bolo: standing. In Acts III and
        IV. (NOT STARTED)

    assets/sprites/characters/bantay-bilibid.png
        A Filipino guard of Bilibid prison, 1902 to 1907, in a guard's
        uniform: side on; he walks to the cell. In Acts III and IV.
        (NOT STARTED)

    assets/sprites/enemies/amerikano.png
        An American soldier, 1899 to 1906: campaign hat, blue shirt,
        khaki trousers, a Krag rifle with a bayonet. Side on; he fights
        hand to hand and stands guard with the rifle. In Acts III and
        IV. (NOT STARTED)

    assets/sprites/enemies/konstable.png
        A man of the Philippine Constabulary, 1902 to 1906: a Filipino
        in the Americans' khaki uniform and hat, a rifle. Side on; he
        fights hand to hand and stands guard. In Acts III and IV.
        (NOT STARTED)

Also wanted (not in the game yet):

    assets/sprites/player/macario-heneral-idle.png
    assets/sprites/player/macario-heneral-walk.png
        Macario as President of the Republika ng Katagalugan, 1902 to
        1906, an outfit sold in the shop: a dark buttoned uniform, a
        sash, long hair worn loose. The same poses, frame counts and
        cell sizes as macario-idle.png and macario-walk.png.

### Act IV

    assets/sprites/characters/gomez.png
        Dominador Gómez, a labour leader, 1906: a man in his forties in
        a coat and hat, side on; he walks up a slope. (NOT STARTED)

    assets/sprites/characters/van-schaick.png
        Colonel Louis Van Schaick, an American officer, 1906, in dress
        uniform: standing. (NOT STARTED)

    assets/sprites/characters/villafuerte.png
        León Villafuerte, one of Sakay's officers: side on, standing,
        long hair. (NOT STARTED)

    assets/sprites/characters/de-vega.png
        Lucio de Vega, one of Sakay's officers: side on, long hair; he
        walks. (NOT STARTED)

    assets/sprites/characters/hukom.png
        The judge of the Court of First Instance of Cavite, 1906, an
        American in a dark suit, seated at the bench. (NOT STARTED)

    assets/sprites/characters/taga-cavite.png
        A woman of Cavite, 1905, thin, a small sack of rice on her hip:
        side on; she walks into the camp. (NOT STARTED)

    assets/sprites/characters/anak-ni-isko.png
        Andres, Isko's son, about seven years old, 1906: standing beside
        his father. (NOT STARTED)

    assets/sprites/characters/taong-bayan-1.png
    assets/sprites/characters/taong-bayan-2.png
        The crowd in Manila, July 1906: two townspeople of Tondo, a man
        (1) and a woman (2), plain clothes, standing; may face the front.
        Each is repeated along the street. (NOT STARTED)

## Props

### Act I

    assets/sprites/scenery/tahian.png
        The seamstress's sewing table, on the street beside her.
        About two thirds of Macario's height. (NOT STARTED)

    assets/sprites/scenery/silya-barbero.png
        The barber's chair, on the street beside him. About two thirds
        of Macario's height. Seen in Act III too. (NOT STARTED)

Also wanted (not in the game yet):

    assets/sprites/scenery/entablado-harap.png
        The front of the theatre (the entablado) on the street, a
        building seen from the front, its door drawn open with warm
        light inside so it reads as a way in.

### Act II

    assets/sprites/scenery/palimbagan.png
        The Katipunan's hand printing press. A little shorter than
        Macario. Seen in Act IV too. (NOT STARTED)

    assets/sprites/scenery/dayami.png
        A bundle of straw on a riverbank. About half Macario's height.
        (NOT STARTED)

    assets/sprites/scenery/panakot.png
        The same straw bundle raised as a scarecrow, standing like a man,
        wearing a salakot with a red band. Macario's height.
        (NOT STARTED)

Also wanted (not in the game yet):

    assets/sprites/scenery/bahay-nanay.png
    assets/sprites/scenery/imprenta.png
        Two buildings on the street, each seen from the front, its door
        drawn open with warm light inside so it reads as a way in:
        Macario's mother's house (bahay-nanay) and the house that hides
        the printing press (imprenta).

### Act III

    assets/sprites/scenery/watawat-katagalugan.png
        The flag of the Republika ng Katagalugan on its pole. Taller
        than Macario. (NOT STARTED)

Also wanted (not in the game yet):

    assets/sprites/scenery/barberya.png
        The barbershop on the street, seen from the front, its door
        drawn open with warm light inside so it reads as a way in.

### Act IV

Nothing needed.

## COMPLETED

Done and in the game. Nothing here needs drawing.

    Backgrounds
        Act I     the street (street-01 to street-04), the road
                  (ground-lupa), the inside of the theatre
                  (entablado-inside)

    Sprites
        Macario   idle, walk, jump, punch, shot
        Act I     Nanay, the Kutsero and his horse (Kabayo), the
                  Barbero, the Mananahi, the three siga, the direktor,
                  Maryam, the Sultan, the kawal, the Katipunero, the
                  Kasama, the Mabalasig, the three who take the
                  pamphlets (the mangingisda, the tabakera, the
                  karpintero), the guardia civil (bantay)
        Act II    Bonifacio

    Props
        none yet
