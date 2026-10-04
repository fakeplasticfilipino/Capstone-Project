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

Last updated: 4 Oct 2026, Block 113 (eighteen owed: Act II names
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
needle (CSS, Block 90), the barber's game (CSS and its icons, Block 94), the night on the pamphlet run (a tint over the
day's paintings, Block 85, so no night painting is owed), platforms,
crates, hazards, heart pickups, bullets, the guard's sight cone, the
dust, the Talaan's papers, and every icon (inline SVG in index.html).

## Acts III and IV

No content yet, so nothing is named and nothing is owed. Their
characters and backdrops join the Owed list as the acts are written.
