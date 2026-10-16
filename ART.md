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
pictures yet, but will once they are drawn.

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

Nothing needed.

### Act III

Nothing needed.

### Act IV

    assets/backgrounds/act4/himpilan.jpg
        A Constabulary post in a town below the mountains, 1903. About
        3700 by 940.
        What happens: Macario's men raid the post at night for guns and
        uniforms. He sneaks past the watchmen to the storeroom; a bell
        rings, and he fights his way back out to the fence where he
        came in.
        Mood: tense, a night raid. A yard with a fence on the right
        (the way in and out), crates to hide behind, the storeroom at
        the left end. Draw it by day; the game makes it night.
        (NOT STARTED)

    assets/backgrounds/act4/dimasalang.jpg
        Sakay's camp in the Di-Masalang mountains, Rizal, 1904 to 1906.
        About 4500 by 940.
        What happens: he drills three men in stolen Constabulary
        uniforms for the raid on Tanay. Later, the Americans herd the
        villagers into guarded camps, the food stops coming, and he
        shares out the last sack of rice. Dominador Gómez climbs up to
        the camp with the offer that brings him down from the
        mountains.
        Mood: at first busy, then hungry and worn. Huts among trees on a
        slope, poorer and thinner than Morong's, a path up the slope.
        (NOT STARTED)

    assets/backgrounds/act4/malabon.jpg
        San Francisco de Malabon, Cavite, 24 January 1905. About 4500
        by 940.
        What happens: his men march in at dusk disguised as government
        troops and rush the garrison for its guns. The player pushes
        through the town street by street to the plaza.
        Mood: a battle in a town, the Republic at its strongest. The
        edge of town on the left, the plaza with a church and the
        garrison's building on the right. (NOT STARTED)

    assets/backgrounds/act4/sala.jpg
        The hall in Cavite, 17 July 1906. One screen.
        What happens: after coming down from the mountains, Macario and
        his officers are guests at a reception given by an American
        colonel. At the toast, soldiers come in from both doors and
        arrest them. The party was a trap.
        Mood: polite and festive, until it is not. A large room, a
        table laid for a meal, a door at each end. (NOT STARTED)

    assets/backgrounds/act4/hukuman.jpg
        The Court of First Instance of Cavite, 1906. One screen.
        What happens: Macario is tried as a bandit under the Brigandage
        Act and sentenced to death with his officers.
        Mood: formal, cold, the outcome already decided. The judge's
        bench on the right, a rail, benches. (NOT STARTED)

    assets/backgrounds/act4/patyo.jpg
        The yard of Old Bilibid Prison, Manila, 13 September 1907,
        morning. About 3400 by 940.
        What happens: the last scene of the game. The player walks
        Macario across the yard to the scaffold, where he says that he
        and his men were never bandits.
        Mood: quiet, early light, dignified rather than gruesome. Stone
        walls, the scaffold toward the right end. (NOT STARTED)

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
        walks out. (The soldier delivered on 16 October as
        Act3_SundalongAmericano.png is standing with a rifle, so he is
        the fighter, amerikano, instead.) (NOT STARTED)

    assets/sprites/enemies/konstable.png
        A man of the Philippine Constabulary, 1902 to 1906: a Filipino
        serving the Americans' police force, sent against Macario's
        Republic. He attacks the camp at Morong, guards the post Macario
        raids, and defends Malabon. Armed with a rifle. Side on; he
        fights hand to hand and stands guard. In Acts III and IV.
        (NOT STARTED)

Also wanted (not in the game yet):

    assets/sprites/enemies/amerikano-still.png (a second version)
        The American soldier as delivered, redrawn for 1899 to 1902: the
        one in the game wears the round steel helmet, pack and puttees of
        1917, twenty years later. The Philippine-American War's
        soldiers wore a broad-brimmed campaign hat and a blue shirt. The
        same pose, so the game's animation fits him again.

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
        Act II    home (bahay), the press (imprenta), Pugad Lawin,
                  San Juan del Monte (san-juan-1 and 2), the Nangka
                  (nangka-1 and 2), Balara, Laguna
        Act III   the hill camp (burol-1 and 2), the barbershop, the
                  plaza (bayan), Calle Gunao, Morong (morong-1 and 2),
                  the cell in Bilibid (selda, Acts III and IV)

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
                  guard, the American soldier (amerikano)

    Props
        none yet
