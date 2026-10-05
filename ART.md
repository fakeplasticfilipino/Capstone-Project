# ART.md

What art the game still needs. A picture the game asks for that does
not exist is drawn as the dashed placeholder box with its file name on
it, so nothing breaks, but someone on screen is still a box.

Check this file from time to time: when art arrives, when content
names a new picture, and before the pilot. The list does not have to be
kept by memory:

    node _dev/tools/missing-art.js

prints every picture the game asks for that is not on disk and who
uses it. verify_new_scene.js runs the same search and fails if the
Owed list below and the files on disk disagree, in either direction: a
missing picture not listed here, or one listed here that has arrived.

When a picture arrives: save it under the exact name below, measure it
(node _dev/tools/measure-sprite.js), look at it with the game's numbers
(node _dev/tools/preview-sheet.js), put the numbers into the content,
move its line out of Owed, and run node _dev/tools/prepare.js (Block
106), which shrinks it (a palette PNG a quarter of the size, looking
and measuring the same), puts it in the manifest with its fingerprint
(until then the game treats it as owed and never asks for it) and
stamps the content file.

Ask the artist for PNG exports with transparency, side on, facing
right, in the same painted style and at about the same size as
Macario's sheets (256px cells).

When the artist delivers one still rather than a sheet (Block 97), it
is animated by a tool: save it as <name>-still.png and follow CLAUDE.md,
Animating a character from one still (a rig per character in
_dev/rigs/, then node _dev/tools/animate-still.js <name>). The sheets it
writes are what the content names, and the character goes under
Stand-ins below, as the big siga is.

Status markers: (NOT STARTED), (IN PROGRESS), (COMPLETE).

Last updated: 5 Oct 2026, Block 119 (fifty owed: Act IV names sixteen
more, seven places and nine people, each a placeholder until drawn).
Before that, Block 118 (thirty-four owed: Act III revised
against the proponent's sources names the hills instead of Santa Mesa,
Pascual Poblete, the Katagalugan's flag, and its fighters' own pictures,
the American soldier and the Constabulary, each a placeholder; no art is
borrowed or made for what is not drawn). Before that, Block 117
(thirty-one owed: Act III named thirteen more). Before that, 4 Oct
2026, Block 113 (eighteen owed: Act II names
fifteen pictures, seven rooms and outdoor places, five people and three
things; none drawn yet, each a placeholder). Before that, 1 Oct 2026,
Block 102 (three owed: the proponent's
stills of the three who take the pamphlets arrived, used as they are,
facing the front). Before that, Block 101 (six owed: the proponent's own
stills of Nanay, the Mabalasig, the Barbero, the Kutsero, Maryam, the
Sultan and the kawal arrived; the side-on and three-quarter ones are
animated by animate-still.js, the front ones stand still; Nanay's walk
is made from her still). Before that, Block 98 (nine owed: the Mananahi, the
direktor, the Katipunero and the Kasama arrived, and the leader and the
small siga replaced the ones drawn in code; all but the Mananahi are
animated from their stills). Before that, Block 97 (no change to what
is owed; a delivered still is now animated by one tool and a rig, see
above).
Before that, Block 96 (still thirteen owed: the artist's
still of the big siga arrived and was animated by a tool, so he moved
from drawn in code to Stand-ins as the bantay is). Before that, Block 94
(thirteen owed: the Barbero and his chair, the third job, and Nanay
walking now also at the end, in the pulungan). Before that, Block 93 (eleven owed: Nanay's walk and
the Mananahi's sewing table are named now, so each shows as a
placeholder box until drawn). Before that, Block 91 (nine pictures owed: the death pose,
the night backdrop and Aling Rosa are gone with the things that named
them, and the unused Tindero file was deleted). Before that, Block 81
(the Pangulo became the Mabalasig) and Block 80 (the end of Act I: the
Katipunan's three people, the three who take the pamphlets, and the
pulungan).

## Owed

Named by the game and missing. Each is a placeholder box today.

    assets/sprites/scenery/silya-barbero.png
        The Barbero's chair, beside him (x 5440), where Macario plays the
        barber's game (Block 94). A still is enough, drawn about 90px tall
        in the game (displayHeight), like the tahian. (NOT STARTED)

    assets/sprites/scenery/tahian.png
        The Mananahi's sewing table (tahian), beside her on the street
        (x 6540), where Macario sews (Block 89). A still is enough,
        about 90px tall in the game against Macario's 134; it is drawn
        at that height (displayHeight). (NOT STARTED)

    assets/backgrounds/act1/pulungan.jpg
        The Katipunan's secret room, where the oath is taken (Block 80).
        The histories describe a dim room hung with black curtains, a
        warning written on the wall. One painting of a dim room, drawn once
        and not tiled, one phone screen wide like the entablado's
        (entablado-inside.jpg is the model for its shape); a floor of its
        own if the painting has one, and the content then sets
        ground: false. Until it arrives the room is a dark wall with the
        file name on it. (NOT STARTED)

Act II (Block 113). The places are one painting each, drawn once and
not tiled (as entablado-inside.jpg), anchored at the bottom: the indoor
rooms one phone screen wide (bahay, pugad-lawin, balara, laguna, about
1180 in the game), the press wider (2600), and the two battlefields
wide (san-juan 4200, nangka 2400), which the game stretches to cover,
so a wide panorama suits them. Each is a dark wall with its name until
it arrives. The people are side on where they will walk, so
animate-still.js can move them; the things are stills.

    assets/backgrounds/act2/bahay.jpg
        Macario and Nanay's home in Tondo, 1896: one poor room, a table,
        the door on the right. (NOT STARTED)

    assets/backgrounds/act2/imprenta.jpg
        The Katipunan's hidden press: a room behind an ordinary door,
        stacks of paper, the press on the left, a back window at the
        left edge, and high shelves. Wide (2600). (NOT STARTED)

    assets/backgrounds/act2/pugad-lawin.jpg
        Pugad Lawin, Kalookan, 23 August 1896: a clearing in the hills,
        a yard and a hut, where the cedulas were torn. (NOT STARTED)

    assets/backgrounds/act2/san-juan.jpg
        San Juan del Monte, 30 August 1896: open ground before the
        Spanish powder store (El Polvorin), the river behind. Wide
        (4200). (NOT STARTED)

    assets/backgrounds/act2/nangka.jpg
        The Nangka River in the hills of Morong, November 1896: the
        bank, the far side where the Spanish come from. Wide (2400).
        (NOT STARTED)

    assets/backgrounds/act2/balara.jpg
        The camp at Balara, at night (the game darkens it): a fire,
        tents or a hut. (NOT STARTED)

    assets/backgrounds/act2/laguna.jpg
        Jacinto's camp in Laguna, 1897: by day, among trees.
        (NOT STARTED)

    assets/sprites/characters/bonifacio.png
        Andres Bonifacio, the Supremo, 1896: side on, standing; he walks
        (charges) at San Juan del Monte. (NOT STARTED)

    assets/sprites/characters/jacinto.png
        Emilio Jacinto, about twenty, the Katipunan's writer: side on,
        standing. (NOT STARTED)

    assets/sprites/characters/isko.png
        Isko, a young Katipunero, one of the recruits of Act I's end:
        side on; he runs on and off. (NOT STARTED)

    assets/sprites/characters/manlilimbag.png
        A printer, ink on his apron: side on, standing. (NOT STARTED)

    assets/sprites/characters/tagapagbalita.png
        A messenger from Cavite: side on; he runs in. (NOT STARTED)

    assets/sprites/scenery/palimbagan.png
        The hand press, used with E: a still, about 110px tall in the
        game. (NOT STARTED)

    assets/sprites/scenery/dayami.png
        A bundle of straw on the riverbank: a still, about 70px tall.
        (NOT STARTED)

    assets/sprites/scenery/panakot.png
        The bundle raised as a scarecrow in a Katipunan hat (a salakot
        and a red band), standing like a man: a still at full height.
        (NOT STARTED)

Act III (Block 117). As Act II's: the places one painting each, drawn
once and not tiled, anchored at the bottom; the rooms one phone screen
wide (barberya, bayan, calle-gunao, about 1180 in the game) and the two
battlefields wide (burol and morong, 3200). The people side on
where they walk on. Each is a dark wall or a dashed box until it
arrives.

    assets/backgrounds/act3/burol.jpg
        Macario's band's camp in the hills outside Manila, February 1899:
        a slope, a lookout, the city far below. Wide (3200). The game
        does not show Santa Mesa itself: Macario was not there.
        (NOT STARTED)

    assets/backgrounds/act3/barberya.jpg
        The Barbero's shop in Tondo, 1899: one room, a barber's chair, a
        mirror, the door on the right; by night (the game darkens it) a
        meeting place. (NOT STARTED)

    assets/backgrounds/act3/bayan.jpg
        A town plaza, April 1901: a wall with a printed proclamation, and
        on the right an American officer's table where men queue to
        surrender. (NOT STARTED)

    assets/backgrounds/act3/calle-gunao.jpg
        A house on Calle Gunao, Quiapo, August 1901: a sala where the
        Partido Nacionalista meets, papers on a table. (NOT STARTED)

    assets/backgrounds/act3/morong.jpg
        The camp in the mountains of Morong, 1902: huts among trees on a
        slope, the Republika ng Katagalugan's flag. Wide (3200).
        (NOT STARTED)

    assets/sprites/characters/alvarez.png
        Santiago Álvarez, a Katipunan general turned to the Partido
        Nacionalista, about thirty, in a coat: side on, standing.
        (NOT STARTED)

    assets/sprites/characters/carreon.png
        Francisco Carreón, an old Katipunero, Vice President of the
        Katagalugan: side on, standing, long hair. (NOT STARTED)

    assets/sprites/characters/montalan.png
        Julian Montalan, the Katagalugan's general: side on, standing,
        long hair, a bolo. (NOT STARTED)

    assets/sprites/characters/guro.png
        A Filipino teacher, 1901, a man in a barong: standing.
        (NOT STARTED)

    assets/sprites/characters/opisyal.png
        An American officer, 1901, in khaki with a campaign hat, seated at
        a table where men surrender. (NOT STARTED)

    assets/sprites/characters/poblete.png
        Pascual Poblete, writer and founder of the Partido Nacionalista,
        1901, an older man in a coat: side on; he walks in.
        (NOT STARTED)

    assets/sprites/scenery/watawat-katagalugan.png
        The flag of the Republika ng Katagalugan on its pole, raised at
        Morong: a still at full height. (NOT STARTED)

    assets/sprites/enemies/amerikano.png
        An American soldier, 1899 to 1902: campaign hat, blue shirt,
        khaki trousers, a Krag rifle with a bayonet. Side on. He fights
        hand to hand and stands sentry with the rifle, so a walk, a
        strike, a shot and a flinch are wanted in time (as the bantay
        has); one still is a start. (NOT STARTED)

    assets/sprites/enemies/konstable.png
        A man of the Philippine Constabulary, 1902: a Filipino in the
        Americans' khaki uniform and hat. Side on; he fights hand to
        hand. (NOT STARTED)

    assets/sprites/characters/sundalong-amerikano.png
        An American private in a barber's chair, sandy hair, no hat, a
        barber's cape: side on, seated, and he walks out after. (NOT
        STARTED)

    assets/sprites/characters/bagong-nakatira.png
        A woman living now in Nanay's house, a stranger: standing.
        (NOT STARTED)

Act IV (Block 119). As Acts II and III: the places one painting each,
drawn once and not tiled, anchored at the bottom; the rooms one phone
screen wide (sala, selda, hukuman, about 1180 in the game), the post 2600,
the yard 2400, and the camp and the battlefield wide (dimasalang and
malabon, 3200). Act IV's first scene reuses Act III's morong.jpg. The
people side on where they walk on. Each is a dark wall or a dashed box
until it arrives.

    assets/backgrounds/act4/himpilan.jpg
        A post of the Philippine Constabulary in a town below the
        mountains, 1903, a yard with a fence and a storeroom at the left
        end; the game darkens it to night. Wide (2600). (NOT STARTED)

    assets/backgrounds/act4/dimasalang.jpg
        Sakay's camp in the Di-Masalang mountains, Rizal, 1904 to 1906:
        huts among trees on a slope, thinner and poorer than Morong's.
        Wide (3200). (NOT STARTED)

    assets/backgrounds/act4/malabon.jpg
        San Francisco de Malabon, Cavite, January 1905: a town plaza, a
        church and the garrison's building. Wide (3200). (NOT STARTED)

    assets/backgrounds/act4/sala.jpg
        The hall in Cavite where Colonel Van Schaick's reception was held,
        July 1906: a large room, a table laid, doors at both ends.
        (NOT STARTED)

    assets/backgrounds/act4/selda.jpg
        A cell in Bilibid, 1906 to 1907: stone walls, bars, a small barred
        window on the right. The floor is drawn by the game (stone).
        (NOT STARTED)

    assets/backgrounds/act4/hukuman.jpg
        The Court of First Instance of Cavite, 1906: a judge's bench on
        the right, a rail, benches. (NOT STARTED)

    assets/backgrounds/act4/patyo.jpg
        The yard of Old Bilibid Prison, Santa Cruz, Manila, September
        1907, morning: stone walls and the scaffold toward the right end
        (about x 1900 of 2400). Wide. (NOT STARTED)

    assets/sprites/characters/gomez.png
        Dominador Gómez, labour leader, 1906: a man in his forties in a
        coat and hat, side on; he walks up the slope. (NOT STARTED)

    assets/sprites/characters/van-schaick.png
        Colonel Louis Van Schaick, American officer, 1906, in a dress
        uniform: standing. (NOT STARTED)

    assets/sprites/characters/villafuerte.png
        León Villafuerte, one of Sakay's officers: side on, standing,
        long hair. (NOT STARTED)

    assets/sprites/characters/de-vega.png
        Lucio de Vega, one of Sakay's officers, hanged with him: side on,
        long hair; he walks across the yard at the end. (NOT STARTED)

    assets/sprites/characters/hukom.png
        The judge of the Court of First Instance of Cavite, 1906, an
        American in a dark suit, seated at the bench. (NOT STARTED)

    assets/sprites/characters/bantay-bilibid.png
        A Filipino guard of Bilibid, 1907, in a guard's uniform: side on;
        he walks to the cell. (NOT STARTED)

    assets/sprites/characters/taga-cavite.png
        A woman of Cavite, 1905, thin, a small sack of rice on her hip:
        side on; she walks into the camp. (NOT STARTED)

    assets/sprites/characters/anak-ni-isko.png
        Andres, Isko's son, about seven, 1906: standing beside his
        father, drawn about 80px tall in the game. (NOT STARTED)

    assets/sprites/characters/kawal-katagalugan.png
        A fighter of the Republika ng Katagalugan, 1904: long hair tied
        back, poor clothes, a bolo: standing. Two of them stand in the
        camp. (NOT STARTED)

## Stand-ins

Art that exists and is on screen, but is not the artist's final work
for that character. Not checked by the harness; kept here so it is not
forgotten.

    The motion of everyone delivered as one still: the three siga
        (siga-N, -walk, -attack, -hit; Blocks 96, 98), the direktor
        (direktor.png, breathing only, Block 98), the Katipunero and
        the Kasama (their idle and -walk, Block 98), Nanay (her idle and
        walk), the Mabalasig (idle), the Sultan (idle and a march) and
        the kawal (march, a thrust and a flinch; Block 101, from the
        proponent's stills). Made from the
        artist's stills (<name>-still.png) by _dev/tools/animate-still.js
        and a rig each in _dev/rigs/, as the bantay's are by
        animate-bantay.js; the stills themselves are the artist's.
        Where an arm or a sash moved off something, that is filled in
        from the colours around it. A sheet drawn by the artist would
        replace any of them under the same name.
    Kabayo's head and tail (kabayo.png, Block 100). Made from the
        proponent's still of a saddled bay (kabayo-still.png) by
        _dev/tools/animate-kabayo.js: the head dips and the tail tucks
        in, the rest is the still. It replaced the old 32px white horse.
    The bantay's walk, shot and flinch (bantay-walk, -shoot, -hit).
        Made from the artist's one still by _dev/tools/animate-bantay.js
        (Blocks 73, 75); the still itself (bantay.png) is the artist's.
    The Spanish soldier of Act II's battles (the catalogue's sundalo,
        Block 113) is the bantay's art: his walk, his flinch, and the
        first frames of his shot as a bayonet lunge. A soldier's own
        sheets would replace them.
    Item tiles. No item ships (content/items.js is empty); each item
        added later names its own tile picture.

## No picture, by design

Drawn by the game itself, not owed by anyone: the shadow trees over
every join (_dev/tools/make-shadow-tree.py), the work game's brush, cloth and
needle (CSS, Block 90), the barber's haircut and its customers (pixels
drawn by game.js, Block 114; the American's hair, Block 117), the night on the pamphlet run (a tint over the
day's paintings, Block 85, so no night painting is owed), platforms,
crates, hazards, heart pickups, bullets, the guard's sight cone, the
dust, the Talaan's papers, and every icon (inline SVG in index.html).

