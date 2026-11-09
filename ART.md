# ART.md

The art MACARIO still needs. For each picture: attach the files named,
paste the prompt into ChatGPT, and save what it makes under the file
name given (lowercase, hyphens as written). If the background comes out
white or checkered, say "make the background transparent".

For the team: the artist reads only the entries. Each one stands alone
(21 Oct 2026, the proponent: no shared instructions), and things one
picture can carry are asked for in one picture (22 Oct 2026, the
proponent): a sheet of several pieces, cropped by the team into the
files each entry's "Cut into" names. An entry named without a folder
(dirt-ground.jpg, garrison.png) is Block 142's outdoor layers, saved in
_dev/parallax-art/, or a room kit (room-walls.png, bahay-kit.png), cut
into _dev/room-art/; both wait there until the game is built to use
them, so prepare.js does not count them. A kit entry's "Takes the place
of" line names the room painting the game still asks for, which keeps
prepare.js's count right until the room is built from the kit; it checks
that every assets/ file in Backgrounds, Sprites and Props (outside "Also
wanted") is missing and every missing one is listed. Which scene uses
which layers: the table at the end. When a picture arrives, move its
line to COMPLETED; once it is cut and in the game, its sheet moves to
docs-private/art-delivered/, where originals are kept. _dev/parallax-art/
keeps only the pictures the prompts attach as a style to follow
(tondo-props, tondo-houses, tondo-nature, tondo-trees, dirt-ground,
sierra-nature) and
sheets not yet cut. node _dev/tools/missing-art.js lists what the game asks for and does not
have. A still delivered on black: node _dev/tools/key-still.js; a sheet
on black: _dev/tools/key-black.py.

## Backgrounds

### Act I

Nothing needed.

### Act II

Nothing needed.

### Act III

Nothing needed.

### Act IV

Nothing needed.

## Sprites

### Act I

Nothing needed.

### Act II

Nothing needed.

### Act III

Nothing needed.

### Act IV

Nothing needed.

## Props

### Act I

Nothing needed.

### Act II

Nothing needed.

### Act III

Nothing needed.

### Act IV

Nothing needed.

## Which scene uses which layers (for the team)

    scene        nature            trees      buildings           ground
    tondo        tondo (done)      lowland    tondo (done) +      dirt
      (Acts I to III)              (done)     tondo-doors
    san-juan     sierra (done)     lowland    garrison (done)     dirt
    nangka       sierra (done)     lowland    rural + river       grass
                                              (done)              (done)
    burol        manila-view       mountain   camp (done)         grass
                 (done)            (done)
    bayan        sierra (done)     lowland    town + bayan-props  dirt
                                              (done)
    morong       sierra (done)     mountain   camp (done)         grass
                                   (done)
    himpilan     sierra-night      lowland    post (done)         dirt
                 (done)            (done)
    dimasalang   sierra (done)     mountain   camp (done)         grass
                                   (done)
    malabon      cavite-dusk       lowland    town (done)         dirt
                 (done)            (done)
    patyo        bilibid-sky       none       bilibid (done)      stone
                 (done)                                           (done)

The places one screen wide do not scroll but are drawn in layers all the
same, so every act matches: Act II's three (Pugad Lawin, Balara,
Laguna) since 24 Oct 2026 (the Sierra sky, the lowland trees, the
grass, the farm's pieces; the Nangka's water for Laguna's lake), and
Act III's plaza (bayan) by the proponent's word the same day. The rooms are built from
kits instead (22 Oct 2026, the proponent, all nine): a wall from
room-walls.png repeated along the room, a floor from room-floors.png,
and the room's own pieces placed by x on the hotspots (doors, windows,
the press's shelves and hiding places). The entablado and the pulungan
are built so (Block 143), Act II's imprenta and bahay (Block 142,
24 Oct 2026), and Act III's barberya, selda (Act IV's too) and
calle-gunao (24 Oct 2026), every wall and floor now in
assets/backgrounds/rooms/. Until a room is built from its kit (the
sala and the hukuman, Act IV), the game draws the owed dark wall. Cut a sheet with _dev/tools/cut-room-kit.py.

    room          wall       floor       pieces
    entablado     tabla      entablado   entablado-kit
    pulungan      tabla      tabla       pulungan-kit
    imprenta      tabla      tabla       imprenta-kit + palimbagan
    bahay         sawali     kawayan     bahay-kit
    barberya      tabla      tabla       barberya-kit + silya-barbero
    selda         bato       bato        selda-kit
    calle-gunao   palitada   narra       sala-kit
    sala          palitada   narra       sala-kit
    hukuman       palitada   narra       hukuman-kit tondo-doors.png's
five pieces are the doors Macario goes through on the Tondo street:
the entablado (1), Nanay's house (2), the press's house (3), the
barberya (4), the pulungan's back door (5).

## COMPLETED

Done and in the game. Nothing here needs drawing.

    Backgrounds
        Act I     Tondo's sky over the bay (tondo-nature-1), its eight
                  trees (tondo-palms), and dirt-ground cut from
                  tondo-road (the sheets in docs-private/art-delivered/;
                  the first sky and
                  the forest, tondo-nature and tondo-trees, set aside
                  on 22 Oct 2026), the street
                  (street-01 to street-04, retired on 7 Nov 2026), the road
                  (ground-lupa), the rooms' walls and floors
                  (room-walls, room-floors; the sheets in
                  docs-private/art-delivered/)
        Act II    every place in layers (24 Oct 2026): the Sierra
                  Madre's sky (sierra-nature, as layers/sierra-sky.jpg),
                  the river and the grass ground (their checkerboard
                  and sky taken off); the paintings they replace
                  (san-juan-1 and 2, nangka-1 and 2, pugad-lawin,
                  balara, laguna) and the delivered sheets in
                  docs-private/art-delivered/
        Act III   every place in layers or from a kit (24 Oct 2026):
                  Manila's sky from the hills (manila-view-nature, as
                  layers/manila-sky.jpg), the mountain trees (cut into
                  assets/sprites/trees/); the paintings they replace
                  (burol-1 and 2, bayan, and the selda of Acts III and
                  IV) and the delivered sheets in
                  docs-private/art-delivered/2026-10-24-act3/; Morong's
                  paintings (morong-1 and 2) stay, Act IV's camp
                  drawing them
        Act IV    every outdoor place in layers (7 Nov 2026): the
                  night over the Sierra (sierra-night), the dusk over
                  Cavite (cavite-dusk), the sky over Bilibid
                  (bilibid-sky), the stone ground; the post's, the
                  town's and Bilibid's pieces (post, town, bilibid,
                  the artist's of 28 Oct); the paintings they replace
                  (himpilan, dimasalang, malabon, patyo, and Morong's)
                  taken out, in docs-private/art-delivered/

    Sprites
        Macario   his still in the NPCs' style (macario-still.png in
                  _dev/player-lab, 24 Oct 2026), from which
                  skeleton.js writes idle, walk, jump, punch, shot
                  and the bolo's slash; the general's uniform
                  (macario-heneral-still.png, 24 Oct 2026, Block 148),
                  every move of it shipped as macario-heneral-*.png;
                  the stage clothes, the Katipunero's clothes and the
                  taho seller's disguise (macario-entablado,
                  macario-katipunero, macario-magtataho, 9 Nov 2026,
                  Block 154), fitted to the template by fit-skin.py,
                  the originals in docs-private/art-delivered/2026-11-09/
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
                  guard; the American soldier (amerikano) and the
                  Constabulary (konstable), animated from their stills
                  (24 Oct 2026, rigs amerikano.js and konstable.js),
                  and the American in the barber's chair
                  (sundalong-amerikano)
        Act IV    Villafuerte (from mga-opisyal) and Isko's son (from
                  mag-ina), De Vega and the woman from Cavite (from
                  de-vega-at-taga-cavite, drawn standing after the first
                  pair came mid-stride), 25 Oct 2026, Block 149, animated
                  from their pictures (rigs villafuerte.js,
                  anak-ni-isko.js, de-vega.js, taga-cavite.js); the two
                  townspeople (taong-bayan), stills facing the front; Gómez and Van Schaick
                  (animated, rigs gomez.js, van-schaick.js) and the
                  judge at his bench (a still), the artist's, from the
                  Drive, 25 Oct 2026, Block 151; the sala and the court
                  built from their kits (sala-kit, hukuman-kit). The
                  judge was taken out on 26 Oct; the judge seated on a
                  plain chair (hukom, a still facing the front), 9 Nov
                  2026, Block 154, raised behind the bench and dais cut
                  then from hukuman-kit (luklukan)

    Props
        Act I     Tondo's houses, street props and doors
                  (tondo-houses, tondo-props, tondo-doors, in
                  _dev/parallax-art/), the Mananahi's sewing table
                  (tahian) and the Barbero's chair (silya-barbero),
                  cut from tondo-props-1, the stage and the pulungan's
                  furniture (entablado-kit, pulungan-kit; cut into
                  assets/sprites/rooms/, the sheets in
                  docs-private/art-delivered/)
        Act II    San Juan del Monte's works (garrison) and the farm by
                  the Nangka (rural), cut into assets/sprites/buildings/;
                  the press's and the house's furniture (imprenta-kit,
                  bahay-kit), cut into assets/sprites/rooms/; the
                  press, the straw and the scarecrow (act2-props:
                  palimbagan, dayami, panakot)
        Act III   the camp (camp), the plaza (bayan-props, and town's
                  church, town hall and wall), cut into
                  assets/sprites/buildings/; the barbershop's, the
                  cell's and the sala's furniture (barberya-kit,
                  selda-kit, sala-kit), cut into assets/sprites/rooms/;
                  the campfire, the itak and the pistol (act2-props-2,
                  the artist's of 28 Oct since 7 Nov; Block 151: Balara's fire, the blade in the slash, the
                  revolver in the shot);
                  the Katagalugan's flag (watawat-katagalugan, its
                  second delivery, Block 148)
