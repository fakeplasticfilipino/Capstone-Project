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

    sierra-night-nature.jpg
        (Attach the file _dev/parallax-art/sierra-nature.png)
        Refer to the attached image. Redraw it exactly as it is, the
        same mountains in the same places, but at night: a deep blue
        night sky with stars and a bright full moon high on the left,
        the mountains dark blue with soft moonlit edges. No buildings,
        no people. Fill the whole picture edge to edge. Wide landscape,
        largest size.
        (NOT STARTED)

    cavite-dusk-nature.jpg
        (Attach the file _dev/parallax-art/tondo-nature.png)
        Refer to the attached image and use the same art style. Draw
        ONLY the far background of a town in Cavite at sunset in 1905:
        a sky going from deep orange at the horizon to purple above, a
        low sun on the left, long thin clouds lit from below, and along
        the bottom third a flat line of distant rice fields and coconut
        palms in dark silhouette, with low hills far away. No
        buildings, no people, no road. Fill the whole picture edge to
        edge. Wide landscape, largest size.
        (NOT STARTED)

    bilibid-sky-nature.jpg
        (Attach the file _dev/parallax-art/tondo-nature.png)
        Refer to the attached image and use the same art style. Draw
        ONLY the sky above a walled prison yard in Manila on an early
        morning in 1907: a pale clear sky, a few soft clouds, cold low
        light, and along the bottom quarter only the far tops of
        distant trees and red tile roofs. No walls, no buildings in
        front, no people. Fill the whole picture edge to edge. Wide
        landscape, largest size.
        (NOT STARTED)

    stone-ground.jpg
        (Attach the file _dev/parallax-art/tondo-nature.png)
        Refer to the attached image and use the same art style. Make a
        flat 2D ground strip for a side-scrolling game: the ground of
        a prison yard in Manila in 1907, seen exactly from the side.
        Along the top edge a level row of worn stone flags; below it,
        packed earth and rubble, getting a little darker toward the
        bottom. Draw it as a cross-section, like the ground in a
        classic 2D platformer: the top edge is the flat surface people
        walk on, a straight level line across the whole picture, and
        below it the earth is cut open and seen from the front. Do NOT
        show the road from above: no ruts, tracks or paths running
        into the distance, no perspective, no tilt. The left and right
        edges must continue into each other perfectly so it can
        repeat. Fill the whole picture edge to edge, no white or empty
        space. Wide landscape, short in height.
        (NOT STARTED)

## Sprites

### Act I

Nothing needed.

Also wanted (not in the game yet):

    _dev/player-lab/macario-entablado-still.png
        (Attach macario-still.png from the folder _dev/player-lab)
        Refer to the attached image. Redraw this exact man, same face,
        same hair, same height, the same pose side on facing right, his
        arms hanging the same way, standing in exactly the same place on
        a canvas of exactly the same size (1024 by 1536), changing only
        his clothes to the stage costume of a Christian prince in a
        Filipino moro-moro play of the 1890s, sewn by a village
        seamstress: a short fitted tunic of red cloth trimmed with gold
        braid and buttons, a short cape hanging from the shoulders down
        his back, a sash at the waist, close trousers and plain dark
        shoes. No hat, no sword. Transparent background.
        (For the team: the stage clothes, damit-entablado, worn from Don
        Rodrigo on. Then node _dev/tools/skeleton.js macario
        --still=_dev/player-lab/macario-entablado-still.png --ship, the
        item names the sheets, and its gold tint, the stand-in of Block
        85, comes off.)

### Act II

Nothing needed.

Also wanted (not in the game yet):

    _dev/stills/characters/bonifacio-still.png (a second version)
        (Attach bonifacio-still.png from the folder
        _dev/stills/characters)
        Refer to the attached image. Redraw this exact man, same face,
        clothes, size and style, standing side on facing right, but
        with his sword drawn and held low in his near hand, the blade
        pointing forward and clear of his body. Transparent background.

    _dev/player-lab/macario-katipunero-still.png
        (Attach macario-still.png from the folder _dev/player-lab)
        Refer to the attached image. Redraw this exact man, same face,
        same hair, same height, the same pose side on facing right, his
        arms hanging the same way, standing in exactly the same place on
        a canvas of exactly the same size (1024 by 1536), changing only
        his clothes to a Katipunero's of 1896:
        a white camisa de chino, red trousers rolled at the shin, a red
        kerchief at the neck. Transparent background.
        (For the team: then node _dev/tools/skeleton.js macario
        --still=_dev/player-lab/macario-katipunero-still.png --ship writes every
        sheet of the skin, and the item names them as its sheets.)

### Act III

Nothing needed.

Also wanted (not in the game yet):

    _dev/player-lab/macario-magtataho-still.png
        (Attach macario-still.png from the folder _dev/player-lab)
        Refer to the attached image. Redraw this exact man, same face,
        same hair, same height, the same pose side on facing right, his
        arms hanging the same way, standing in exactly the same place on
        a canvas of exactly the same size (1024 by 1536), changing only
        his clothes to a poor taho seller's of Manila in 1899: a faded,
        patched loose shirt of rough cloth, plain trousers rolled to
        the shin, a cloth tied round the neck, bare feet or worn
        sandals. No hat, nothing in his hands. Transparent background.
        (For the team: the disguise, balatkayo, Maryam's from the trunk.
        Then node _dev/tools/skeleton.js macario
        --still=_dev/player-lab/macario-magtataho-still.png --ship, and
        the item names the sheets.)

### Act IV

    assets/sprites/characters/gomez.png
        (Attach isko-still.png from the folder
        _dev/stills/characters, and the proponent's picture of
        Dominador Gómez)
        Refer to the attached images and use the art style and size of
        the first. Draw Dominador Gómez, a Filipino labour leader of
        1906, from the second picture: the whole body, side on, facing
        right, walking, in a white suit and hat. Transparent background.
        (NOT STARTED)

    assets/sprites/characters/van-schaick.png
        (Attach isko-still.png from the folder
        _dev/stills/characters, and the proponent's picture of
        Louis Van Schaick)
        Refer to the attached images and use the art style and size of
        the first. Draw Colonel Louis Van Schaick, an American officer
        of 1906, from the second picture: the whole body, side on,
        facing right, standing straight in a dress uniform. Transparent
        background.
        (NOT STARTED)

    assets/sprites/characters/hukom.png
        (Attach isko-still.png from the folder _dev/stills/characters)
        Refer to the attached image and use the same art style and
        size. Draw an American judge of 1906 in a black robe, the whole
        body, seated side on and facing right on a chair. Transparent
        background.
        (NOT STARTED)

## Props

### Act I

Nothing needed.

### Act II

    act2-props-2.png
        (Attach the files _dev/parallax-art/tondo-props.png and
        _dev/player-lab/macario-still.png)
        Refer to the attached images and use the art style of the
        first. Make a sprite sheet of three separate things, each whole
        and seen exactly from the side, with wide empty space between
        them so none touch or overlap. (1) ONE small campfire of a rebel
        camp in the hills of the Philippines in 1896: a few split logs
        burning on a ring of stones, bright orange and yellow flames
        about knee high to a man, a little smoke, warm light on the
        stones, no pot. (2) ONE Filipino bolo (itak) of the 1890s, the
        kind a Katipunero carried, lying flat: a plain wooden handle at
        the LEFT end, a short metal collar, then a single-edged steel
        blade about three times as long as the handle, widening a
        little toward the end and pointing to the RIGHT, the cutting
        edge along the bottom, worn, not shiny, sized for the hand of
        the man in the second image (about 56 cm long on him). (3) ONE
        revolver of the 1890s, the kind a Filipino revolutionary
        carried: the grip at the LEFT end, angled down, wooden with a
        metal butt cap, the cylinder and trigger guard in the middle,
        and the barrel pointing straight to the RIGHT, dark worn steel,
        sized for the same hand (about 25 cm long on him). No people, no
        hands, no sheath, no holster, no smoke from the gun, no ground or
        shadows. Transparent background. Landscape, largest size.
        Cut into: assets/sprites/buildings/apoy.png (1); and, for the
        player (sprites/player, not yet named by the game), itak.png (2)
        and pistola.png (3). Until it comes, Balara has no fire, the bolo's slash is
        drawn without its blade (_dev/tools/skeleton.js) and the shot
        with an empty fist pointing where the pistol will be.
        (NOT STARTED)

### Act III

    sala-kit.png
        (Attach the file _dev/parallax-art/tondo-props.png)
        Refer to the attached image and use the same art style and
        finish. Make a sprite sheet of the separate pieces of the sala
        of a respectable town house in the Philippines, 1901 to 1906.
        (1) A long dark wooden table, bare, its top at a man's hip. (2)
        The same long table covered with a white cloth and laid for a
        festive meal, with dishes, glasses and a candlestick. (3)
        Papers, a quill and an inkwell, to lie on a table. (4) A
        high-backed wooden chair seen from the side. (5) A tall window
        of small square capiz shell panes, its sliding shutters half
        open. (6) A tall panelled wooden double door. (7) The flag of
        the United States of 1906 (45 stars) hung flat on a wall. (8) A
        hanging oil lamp with a glass shade. (9) A framed painting of a
        landscape. (10) A potted palm on a stand. Each piece whole and
        seen straight on from the side (flat, no perspective), with wide
        empty space between them so none touch or overlap, all drawn in
        proportion to each other. No people, no walls, no floor, no
        shadows between pieces. Transparent background. Landscape,
        largest size.
        Cut into (assets/sprites/rooms/sala/): mesa.png (1),
        mesa-handaan.png (2), papeles.png (3), silya.png (4),
        bintana-capiz.png (5), pinto.png (6),
        bandila-amerikano.png (7), lampara.png (8), larawan.png
        (10), halaman.png (9) (cut-room-kit.py's numbers)
        Takes the place of (for the team):
        assets/backgrounds/act4/sala.jpg
        (DELIVERED 24 Oct 2026: cut for Calle Gunao, which is built
        from it; the sheet stays in _dev/parallax-art/ until Act IV's
        sala is built, mesa-handaan and bandila-amerikano being its)

    town.png
        (Attach the file _dev/parallax-art/tondo-houses.png)
        Refer to the attached image and use the same art style, size
        and finish. Make a sprite sheet of separate buildings of a
        Tagalog town of 1901 to 1905 around its plaza, drawn by day,
        arranged in a grid with wide empty space between them so none
        touch or overlap. Each building in straight-on front view (flat
        side elevation, no perspective), standing on its own flat ground
        line, its door at ground level. (1) A large stone church with a
        bell tower and a carved front. (2) A two-storey stone town hall
        (casa tribunal) with arches on the ground floor. (3) A square
        stone watchtower building. (4) A long stone wall with a wooden
        gate. (5) A nipa house. (6) A small wooden store with an
        awning. No people, no flags, no trees behind, no ground or
        shadows between buildings. Transparent background. Landscape,
        largest size.
        (For the team: the plaza, bayan, in Act III, and Malabon in
        Act IV)
        (DELIVERED 24 Oct 2026: the church, the town hall and the wall
        cut for the plaza (bayan-simbahan, bayan-munisipyo,
        bayan-pader); the sheet stays in _dev/parallax-art/ for
        Malabon's nipa house, store and tower)

### Act IV

    hukuman-kit.png
        (Attach the file _dev/parallax-art/tondo-props.png)
        Refer to the attached image and use the same art style and
        finish. Make a sprite sheet of the separate pieces of the Court
        of First Instance of Cavite, 1906, formal and cold. (1) A raised
        wooden judge's bench with a step up to it and a tall chair
        behind it. (2) A wooden rail with turned posts and a small
        swinging gate, waist high. (3) A long plain wooden bench. (4) A
        clerk's table with papers and a book. (5) A tall window with
        wooden shutters. (6) A tall panelled wooden door. (7) The flag
        of the United States of 1906 (45 stars) on a standing pole. (8)
        A round wall clock. Each piece whole and seen straight on from
        the side (flat, no perspective), with wide empty space between
        them so none touch or overlap, all drawn in proportion to each
        other. No people, no walls, no floor, no shadows between pieces.
        Transparent background. Landscape, largest size.
        Cut into (_dev/room-art/hukuman/): hukom-mesa.png (1),
        barandilya.png (2), bangko.png (3), mesa.png (4),
        bintana.png (5), pinto.png (6), bandila-amerikano.png
        (7), orasan.png (8)
        Takes the place of (for the team):
        assets/backgrounds/act4/hukuman.jpg
        (NOT STARTED)

    post.png
        (Attach the file _dev/parallax-art/tondo-houses.png)
        Refer to the attached image and use the same art style, size
        and finish. Make a sprite sheet of separate pieces of a
        Philippine Constabulary post in a town in 1904, drawn by day,
        arranged in a grid with wide empty space between them so none
        touch or overlap. Each piece in straight-on front view (flat
        side elevation, no perspective), standing on its own flat ground
        line. (1) A one-storey stucco barracks with a red tile roof, a
        lantern by the door and a heavy double door. (2) A long
        whitewashed stone wall section with square pillars. (3) A wall
        section with a heavy wooden gate. (4) A wooden watchtower. (5)
        An open shed with a canvas roof and crates under it. (6) A rack
        of rifles. (7) A stack of barrels and crates. No people, no
        flags, no trees behind, no ground or shadows between pieces.
        Transparent background. Landscape, largest size.
        (NOT STARTED)

    bilibid.png
        (Attach the file _dev/parallax-art/tondo-houses.png)
        Refer to the attached image and use the same art style, size
        and finish. Make a sprite sheet of separate pieces of the yard
        of Bilibid Prison, Manila, in 1907, arranged in a grid with wide
        empty space between them so none touch or overlap. Each piece in
        straight-on front view (flat side elevation, no perspective),
        standing on its own flat ground line. (1) A tall stone prison
        wall section with a walkway on top. (2) A square stone guard
        tower with a red tile roof. (3) A stone building front with an
        iron-barred arched gate. (4) A wooden gallows platform with
        steps up to it. (5) A plain wooden bench. No people, no trees,
        no ground or shadows between pieces. Transparent background.
        Landscape, largest size.
        (NOT STARTED)

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
    himpilan     sierra-night      lowland    post                dirt
    dimasalang   sierra            mountain   camp                grass
    malabon      cavite-dusk       lowland    town                dirt
    patyo        bilibid-sky       none       bilibid             stone

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
                  (street-01 to street-04), the road
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
        Act IV    the Constabulary's post (himpilan-1 and 2),
                  Di-Masalang (dimasalang-1 and 2), Malabon
                  (malabon-1 and 2), Bilibid's yard (patyo)

    Sprites
        Macario   his still in the NPCs' style (macario-still.png in
                  _dev/player-lab, 24 Oct 2026), from which
                  skeleton.js writes idle, walk, jump, punch, shot
                  and the bolo's slash; the general's uniform
                  (macario-heneral-still.png, 24 Oct 2026, Block 148),
                  every move of it shipped as macario-heneral-*.png
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
                  townspeople (taong-bayan), stills facing the front

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
                  the Katagalugan's flag (watawat-katagalugan, its
                  second delivery, Block 148)
