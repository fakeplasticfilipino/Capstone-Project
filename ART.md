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

When a picture arrives: save it under the exact name below, run
node _dev/tools/make-asset-manifest.js (until it is in the manifest the
game treats it as owed and never asks for it), measure it
(node _dev/tools/measure-sprite.js), look at it with the game's numbers
(node _dev/tools/preview-sheet.js), put the numbers into the content,
bump ASSET_VERSION in js/game.js, and move its line out of Owed.

Ask the artist for PNG exports with transparency, side on, facing
right, in the same painted style and at about the same size as
Macario's sheets (256px cells).

Status markers: (NOT STARTED), (IN PROGRESS), (COMPLETE).

Last updated: 29 Sep 2026, Block 81 (the Pangulo became the
Mabalasig). Before that, Block 80 (the end of Act I: the Katipunan's
three people, the three who take the pamphlets, and the pulungan).

## Owed

Named by the game and missing. Each is a placeholder box today.

    assets/sprites/characters/mananahi.png
        The Mananahi, the seamstress. Act I, on the street at x 6400;
        Macario's second employer. Talks and gives; an idle sheet is
        enough. (NOT STARTED)

    assets/sprites/characters/direktor.png
        The direktor of the theatre company. Act I, at the far end of
        the street (x 13600) and in the wings of the entablado. Talks;
        an idle sheet is enough. (NOT STARTED)

    assets/sprites/characters/katipunero.png
        The Katipunero, the older of the two men who find Macario in the
        wings after Principe Baldovino (Block 80), and in the pulungan
        at the oath. Walks on and off the stage, then talks; an idle
        sheet and a walk sheet. (NOT STARTED)

    assets/sprites/characters/kasama.png
        The Kasama, the Katipunero's companion: in the wings beside him,
        then waiting on the street at x 12500, then by the door of the
        pulungan. Walks on and off the stage, then talks; an idle sheet
        and a walk sheet. (NOT STARTED)

    assets/sprites/characters/mabalasig.png
        The Mabalasig ("terrible brother"), who conducts Macario's rite
        in the pulungan and gives him the pamphlets (Block 81, replacing
        Block 80's Pangulo). Talks; an idle sheet is enough. The
        histories describe members at a rite in hoods; the Katipon's was
        black with a white triangle, which the proponents may want for
        him or for the Katipunero and the Kasama too. (NOT STARTED)

    assets/sprites/characters/karpintero.png
    assets/sprites/characters/tabakera.png
    assets/sprites/characters/mangingisda.png
        The three who take the pamphlets, on the street once Macario is
        sworn in: a carpenter (x 10600), a woman from the cigar factory
        (x 6900) and a fisherman (x 4800). Talk and take a pamphlet; an
        idle sheet each is enough. (NOT STARTED)

    assets/backgrounds/act1/pulungan.jpg
        The Katipunan's secret room, where the oath is taken (Block 80).
        The histories describe a dim room hung with black curtains, a
        warning written on the wall. One painting of a room at night, drawn once and not tiled, one
        phone screen wide like the entablado's (entablado-inside.jpg is
        the model for its shape); a floor of its own if the painting has
        one, and the content then sets ground: false. Until it arrives
        the room is a dark wall with the file name on it. (NOT STARTED)

    assets/sprites/player/macario-dead.png
        Macario's death pose, 5 frames, played once. Named by the
        engine; no shipped scene plays it yet, so nobody sees the box
        today. (NOT STARTED)

    assets/backgrounds/act1/tondo-night.png
        The night backdrop. Named by the engine and the stylesheet; no
        shipped scene turns to night, so nothing shows. (NOT STARTED)

## Stand-ins

Art that exists and is on screen, but is not the artist's final work
for that character. Not checked by the harness; kept here so it is not
forgotten.

    The three siga (siga-1..3.png and -walk.png). Drawn in code by
        _dev/tools/draw-siga.js (Block 72). The proponent judges them
        on the phone; the artist's own replaces them under the same
        names.
    The bantay's walk, shot and flinch (bantay-walk, -shoot, -hit).
        Made from the artist's one still by _dev/tools/animate-bantay.js
        (Blocks 73, 75); the still itself (bantay.png) is the artist's.
    Nanay's walk. She has a real idle sheet and slides on with it
        (Block 57); a side-view walk sheet from the artist is owed if
        she should walk.
    The Sultan. Walks on his soldiers' walk sheet (muslim-walk.png);
        a sheet of his own would set him apart from them.
    Item tiles. No item ships (content/items.js is empty); each item
        added later names its own tile picture.

## No picture, by design

Drawn by the game itself, not owed by anyone: the apple tree (the
silhouette tree over the join at 5800, Block 69), the shadow trees over
every join (_dev/tools/make-shadow-tree.py), platforms, crates, hazards,
heart pickups, bullets, the guard's sight cone, the dust, the Talaan's
papers, and every icon (inline SVG in index.html).

## Acts II to IV

No content yet, so nothing is named and nothing is owed. Their
characters and backdrops join the Owed list as the acts are written.
