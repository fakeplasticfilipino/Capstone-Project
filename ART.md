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

Last updated: 28 Sep 2026, Block 77.

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

    assets/sprites/characters/aling-rosa.png
        Aling Rosa, a customer. Act I, on the street at x 7800. Talks
        and takes a delivery; an idle sheet is enough. (NOT STARTED)

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
    Mang Tomas. Wears the Tindero's real sheet; a customer of his own
        would replace it.
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
