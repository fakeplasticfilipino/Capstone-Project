# ART.md

The art MACARIO still needs. For each picture: attach the files named,
paste the prompt into ChatGPT, and save what it makes under the file
name given (lowercase, hyphens as written). If the background comes out
white or checkered, say "make the background transparent".

For the team: the artist reads only the entries. Each one stands alone
(21 Oct 2026, the proponent: no shared instructions). Outdoor layers
are the new background system and the game does not ask for them yet,
so prepare.js does not check that part; it checks that every file in
Backgrounds, Sprites and Props (outside "Also wanted") is missing and
every missing one is listed. When a picture arrives, move its line to
COMPLETED. Sheets are cropped into pieces by the team; originals are
kept in docs-private/art-delivered/. node _dev/tools/missing-art.js
lists what the game asks for and does not have. A still delivered on
black: node _dev/tools/key-still.js; a sheet on black:
_dev/tools/key-black.py.

## Outdoor layers

Save these in _dev/parallax-art/ for now.

Which scene uses what (for the team):

    scene        nature            trees      buildings           ground
    tondo        tondo (done)      lowland    tondo (done) +      dirt
                                   (done)     tondo-doors
    san-juan     sierra            lowland    garrison            dirt
    nangka       sierra            lowland    rural + river       grass
    burol        manila-view       mountain   camp                grass
    morong       sierra            mountain   camp                grass
    himpilan     sierra-night      lowland    post                dirt
    dimasalang   sierra            mountain   camp                grass
    malabon      cavite-dusk       lowland    town                dirt
    patyo        bilibid-sky       none       bilibid             stone

Rooms and the places one screen wide (Pugad Lawin, Balara, Laguna, the
plaza) do not scroll, so they keep one painting each.

### Done

    tondo-nature.png, tondo-trees.png (the lowland trees),
    tondo-houses.png, tondo-props.png

### To make

    tondo-doors.png
        (Attach the file _dev/parallax-art/tondo-houses.png)
        Refer to the attached image and use the same art style, size
        and finish. Make a sprite sheet of five separate buildings of
        Tondo, Manila, in 1896, arranged in a grid with wide empty space
        between them so none touch or overlap. Each building in
        straight-on front view (flat side elevation, no perspective),
        standing on its own flat ground line, its door at ground level.
        (1) The front of a small wooden theatre (an entablado) with a
        painted sign board and wide double doors drawn OPEN with warm
        light inside. (2) A poor but cared-for one-storey wooden house
        with a nipa roof, its door drawn OPEN with warm light inside.
        (3) An ordinary narrow two-storey wooden house, its plain door
        drawn OPEN with warm light inside. (4) A small barbershop with a
        wooden front, a striped awning and a barber's chair seen through
        the window, its door drawn OPEN with warm light inside. (5) The
        back of a house on a narrow alley, a low back door drawn OPEN
        with warm light inside. No people, no flags, no trees, no
        ground or shadows between buildings. Transparent background.
        Landscape, largest size.

    dirt-ground.jpg
        (Attach the file _dev/parallax-art/tondo-nature.png)
        Refer to the attached image and use the same art style. Make a
        seamless, tileable strip of packed dirt road of the Philippines
        in 1896, seen from the side, for the ground of a 2D
        side-scrolling game: earth with small stones, wheel ruts and a
        few tufts of grass. The left and right edges must continue into
        each other perfectly. Flat side view, no perspective, no
        objects, no sky. Wide landscape, short in height.

    grass-ground.jpg
        (Attach the file _dev/parallax-art/tondo-nature.png)
        Refer to the attached image and use the same art style. Make a
        seamless, tileable strip of trodden earth and short grass at the
        edge of a forest in the Philippines, with a few roots and
        stones, seen from the side, for the ground of a 2D
        side-scrolling game. The left and right edges must continue into
        each other perfectly. Flat side view, no perspective, no
        objects, no sky. Wide landscape, short in height.

    stone-ground.jpg
        (Attach the file _dev/parallax-art/tondo-nature.png)
        Refer to the attached image and use the same art style. Make a
        seamless, tileable strip of worn stone flags and packed earth of
        a prison yard in Manila in 1907, seen from the side, for the
        ground of a 2D side-scrolling game. The left and right edges
        must continue into each other perfectly. Flat side view, no
        perspective, no objects, no sky. Wide landscape, short in
        height.

    sierra-nature.jpg
        (Attach the file _dev/parallax-art/tondo-nature.png)
        Refer to the attached image and use the same art style. Draw
        ONLY the far background of a landscape east of Manila in 1896: a
        clear blue sky with soft white clouds, and along the bottom
        third a long range of blue-green mountains (the Sierra Madre)
        fading into haze, with a few low forested hills in front of
        them. No buildings, no foreground trees, no people, no road, no
        water. Slightly lighter and hazier than the attached image so it
        feels far away. Fill the whole picture edge to edge. Wide
        landscape, largest size.

    sierra-night-nature.jpg
        (Attach the file _dev/parallax-art/sierra-nature.jpg)
        Refer to the attached image. Redraw it exactly as it is, the
        same mountains in the same places, but at night: a deep blue
        night sky with stars and a bright full moon high on the left,
        the mountains dark blue with soft moonlit edges. No buildings,
        no people. Fill the whole picture edge to edge. Wide landscape,
        largest size.

    manila-view-nature.jpg
        (Attach the file _dev/parallax-art/tondo-nature.png)
        Refer to the attached image and use the same art style. Draw
        ONLY the far background seen from a hill outside Manila in
        1899: a clear blue sky with soft clouds, and far below along the
        bottom third the city of Manila small in the distance (church
        domes and bell towers, red tile roofs) beside Manila Bay with a
        few distant sailing ships, and low mountains across the bay.
        Everything small and hazy, very far away. No foreground trees,
        no people, no road. Fill the whole picture edge to edge. Wide
        landscape, largest size.

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

    bilibid-sky-nature.jpg
        (Attach the file _dev/parallax-art/tondo-nature.png)
        Refer to the attached image and use the same art style. Draw
        ONLY the sky above a walled prison yard in Manila on an early
        morning in 1907: a pale clear sky, a few soft clouds, cold low
        light, and along the bottom quarter only the far tops of
        distant trees and red tile roofs. No walls, no buildings in
        front, no people. Fill the whole picture edge to edge. Wide
        landscape, largest size.

    mountain-trees.png
        (Attach the file _dev/parallax-art/tondo-trees.png)
        Refer to the attached image and use the same art style and
        softness. Make a continuous mountain forest tree line of the
        Philippines in 1902, seen from a little distance, for the layer
        behind a rebel camp in the hills: dense overlapping canopies of
        tall narra and dao trees, wild bamboo, tree ferns and a few
        palms, varying heights, no gaps between trees, rocks and
        undergrowth along the bottom edge. Muted greens. The left and
        right edges continue into each other so the picture can repeat.
        No buildings, no people, no sky. Transparent background. Wide
        landscape, largest size.

    garrison.png
        (Attach the file _dev/parallax-art/tondo-houses.png)
        Refer to the attached image and use the same art style, size
        and finish. Make a sprite sheet of separate pieces of the
        Spanish powder magazine (polvorín) at San Juan del Monte in
        1896, arranged in a grid with wide empty space between them so
        none touch or overlap. Each piece in straight-on front view
        (flat side elevation, no perspective), standing on its own flat
        ground line. (1) The polvorín: a squat building of thick
        whitewashed stone with a red tile roof and one heavy wooden
        door. (2) A flagpole with the flag of Spain of 1896 (red,
        yellow, red stripes). (3) A long wooden palisade section. (4) A
        short palisade section with a gate. (5) A stack of gunpowder
        kegs. (6) A stack of wooden crates. (7) A pile of sandbags. (8)
        A small stone guard post with a roof. No people, no trees, no
        ground or shadows between pieces. Transparent background.
        Landscape, largest size.

    rural.png
        (Attach the file _dev/parallax-art/tondo-houses.png)
        Refer to the attached image and use the same art style, size
        and finish. Make a sprite sheet of separate pieces of a farm by
        the Nangka River east of Manila in 1896, arranged in a grid with
        wide empty space between them so none touch or overlap. Each
        piece in straight-on front view (flat side elevation, no
        perspective), standing on its own flat ground line. (1) A small
        nipa hut on stilts. (2) A low bamboo granary on stilts. (3) A
        long bamboo fence. (4) A short bamboo fence. (5) A haystack.
        (6) A clump of banana plants. (7) A carabao cart without the
        animal. (8) A wooden footbridge on posts. No people, no trees
        behind, no ground or shadows between pieces. Transparent
        background. Landscape, largest size.

    river.png
        (Attach the file _dev/parallax-art/tondo-nature.png)
        Refer to the attached image and use the same art style. Make a
        seamless strip of a calm brown-green river in the Philippines
        in 1896, seen from the side, with low grassy banks on both sides
        and a few rocks, as wide as the picture and short in height, for
        the middle distance of a 2D side-scrolling game. The left and
        right edges continue into each other. No people, no boats, no
        sky: transparent above the far bank. Wide landscape.

    camp.png
        (Attach the file _dev/parallax-art/tondo-houses.png)
        Refer to the attached image and use the same art style, size
        and finish. Make a sprite sheet of separate pieces of a hidden
        rebel camp in the mountains of the Philippines in 1902, arranged
        in a grid with wide empty space between them so none touch or
        overlap. Each piece in straight-on front view (flat side
        elevation, no perspective), standing on its own flat ground
        line. (1) A wooden watchtower with a thatched roof and a ladder.
        (2) A nipa hut on tall stilts with a ladder. (3) An open lean-to
        with a thatched roof. (4) An open shelter with a canvas cloth
        roof and a table under it. (5) A long bamboo palisade. (6) A
        short rough log fence. (7) Stone steps going up, seen from the
        side. (8) A group of large rocks. (9) A cooking fire with a pot
        on three stones. (10) A rack of bamboo poles with drying cloth.
        No people, no flags, no trees behind, no ground or shadows
        between pieces. Transparent background. Landscape, largest
        size.

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

    town.png
        (Attach the file _dev/parallax-art/tondo-houses.png)
        Refer to the attached image and use the same art style, size
        and finish. Make a sprite sheet of separate buildings of the
        town of San Francisco de Malabon, Cavite, in 1905, drawn by day,
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

## Backgrounds

### Act I

Nothing needed.

### Act II

    assets/backgrounds/act2/imprenta.jpg
        (Attach pulungan.jpg from the folder assets/backgrounds/act1)
        Refer to the attached image and use the same art style. Paint
        the Katipunan's hidden printing press inside a house in Tondo,
        1896, as one wide room seen straight on from the side like a
        stage set, the camera far back: a grown man standing at the
        front would be a quarter of the picture's height, a door a
        third of it, a table top at his hip, and the floor fills the
        bottom sixth. A wooden hand press at the left, stacks of paper
        and type cases, crates, two tall wooden shelves a person could
        climb, a small back window at the left edge, the door out at the
        right edge. Busy and hopeful. No people. Wide landscape. Then
        ask: "continue this room to the right as a second picture whose
        left edge matches this one's right edge" (the room is two
        pictures wide).
        (NOT STARTED)

    assets/backgrounds/act2/bahay.jpg
        (Attach pulungan.jpg from the folder assets/backgrounds/act1)
        Refer to the attached image and use the same art style. Paint a
        poor but cared-for one-room house in Tondo, 1896, seen straight
        on from the side like a stage set, the camera far back: a grown
        man standing at the front would be a quarter of the picture's
        height, a door a third of it, a table top at his hip, and the
        floor fills the bottom sixth. A bamboo floor, a low wooden table
        and two stools in the middle, a small home altar, a rolled
        woven mat by the wall, a capiz window, the door on the right.
        Quiet and warm. No people. Wide landscape.
        (NOT STARTED)

### Act III

    assets/backgrounds/act3/barberya.jpg
        (Attach pulungan.jpg from the folder assets/backgrounds/act1)
        Refer to the attached image and use the same art style. Paint a
        small barbershop in Tondo by day, 1900, seen straight on from the
        side like a stage set, the camera far back: a grown man standing
        at the front would be a quarter of the picture's height, a door a
        third of it, a table top at his hip, and the floor fills the
        bottom sixth. One barber's chair facing a mirror on the wall, a
        narrow shelf of razors and bottles, a small table, a bench for
        waiting customers, the door on the right. Ordinary and tidy. No
        people. Wide landscape.
        (NOT STARTED)

    assets/backgrounds/act3/calle-gunao.jpg
        (Attach pulungan.jpg from the folder assets/backgrounds/act1)
        Refer to the attached image and use the same art style. Paint
        the sala of a respectable house on Calle Gunao, Quiapo, 1901,
        seen straight on from the side like a stage set, the camera far
        back: a grown man standing at the front would be a quarter of the
        picture's height, a door a third of it, a table top at his hip,
        and the floor fills the bottom sixth. A polished wooden floor,
        capiz windows, a long table with papers and an inkwell in the
        middle, chairs around it, a door at each end. Hopeful and
        respectable. No people. Wide landscape.
        (NOT STARTED)

### Act IV

    assets/backgrounds/act4/sala.jpg
        (Attach pulungan.jpg from the folder assets/backgrounds/act1)
        Refer to the attached image and use the same art style. Paint a
        large reception hall in a house in Cavite, 1906, seen straight on
        from the side like a stage set, the camera far back: a grown man
        standing at the front would be a quarter of the picture's
        height, a door a third of it, a table top at his hip, and the
        floor fills the bottom sixth. A long table laid for a festive
        meal in the middle, chairs along it, lamps, the American flag of
        1906 on the back wall, a door at each end. Polite and festive.
        No people. Wide landscape.
        (NOT STARTED)

    assets/backgrounds/act4/hukuman.jpg
        (Attach pulungan.jpg from the folder assets/backgrounds/act1)
        Refer to the attached image and use the same art style. Paint
        the Court of First Instance of Cavite, 1906, seen straight on
        from the side like a stage set, the camera far back: a grown man
        standing at the front would be a quarter of the picture's
        height, a door a third of it, a table top at his hip, and the
        floor fills the bottom sixth. A raised judge's bench on the
        right, a wooden rail across the room, plain benches on the
        left, tall windows, a door on the left. Formal and cold. No
        people. Wide landscape.
        (NOT STARTED)

## Sprites

### Act I

Nothing needed.

### Act II

Nothing needed.

Also wanted (not in the game yet):

    assets/sprites/characters/bonifacio-still.png (a second version)
        (Attach bonifacio-still.png from the folder
        assets/sprites/characters)
        Refer to the attached image. Redraw this exact man, same face,
        clothes, size and style, standing side on facing right, but
        with his sword drawn and held low in his near hand, the blade
        pointing forward and clear of his body. Transparent background.

    assets/sprites/player/macario-katipunero-idle.png
        (Attach macario-idle.png from the folder assets/sprites/player)
        Refer to the attached sprite sheet. Redraw it exactly, every
        frame in the same place and the same pose, changing only his
        clothes to a Katipunero's of 1896: a white camisa de chino, red
        trousers rolled at the shin, a red kerchief at the neck, a bolo
        at the hip. Transparent background.

    assets/sprites/player/macario-katipunero-walk.png
        (Attach macario-walk.png from the folder assets/sprites/player)
        Refer to the attached sprite sheet. Redraw it exactly, every
        frame in the same place and the same pose, changing only his
        clothes to a Katipunero's of 1896: a white camisa de chino, red
        trousers rolled at the shin, a red kerchief at the neck, a bolo
        at the hip. Transparent background.

### Act III

    assets/sprites/characters/sundalong-amerikano.png
        (Attach isko-still.png from the folder assets/sprites/characters)
        Refer to the attached image and use the same art style and
        size. Draw an American private of 1900 with short hair, the
        whole body, sitting side on and facing right in a wooden
        barber's chair with a white barber's cape over him. Transparent
        background.
        (NOT STARTED)

    assets/sprites/enemies/amerikano.png
        (Attach isko-still.png from the folder assets/sprites/characters)
        Refer to the attached image and use the same art style and
        size. Draw an American soldier of 1899 to 1906, the whole body,
        standing side on and facing right, arms free of the body, feet
        showing: a broad-brimmed campaign hat, a blue flannel shirt,
        khaki trousers, canvas leggings, a rifle with bayonet held
        across his body. Not the steel helmet of 1917. Transparent
        background.
        (NOT STARTED)

    assets/sprites/enemies/konstable.png
        (Attach isko-still.png from the folder assets/sprites/characters)
        Refer to the attached image and use the same art style and
        size. Draw a Filipino of the Philippine Constabulary in 1905,
        the whole body, standing side on and facing right, arms free of
        the body, feet showing: a khaki uniform, a campaign hat, a
        cartridge belt, a rifle held across his body. Transparent
        background.
        (NOT STARTED)

Also wanted (not in the game yet):

    assets/sprites/player/macario-heneral-idle.png
        (Attach macario-idle.png from the folder assets/sprites/player)
        Refer to the attached sprite sheet. Redraw it exactly, every
        frame in the same place and the same pose, changing only his
        clothes and hair: a dark buttoned general's uniform of 1902 with
        a sash, and long hair worn loose. Transparent background.

    assets/sprites/player/macario-heneral-walk.png
        (Attach macario-walk.png from the folder assets/sprites/player)
        Refer to the attached sprite sheet. Redraw it exactly, every
        frame in the same place and the same pose, changing only his
        clothes and hair: a dark buttoned general's uniform of 1902 with
        a sash, and long hair worn loose. Transparent background.

### Act IV

    assets/sprites/characters/gomez.png
        (Attach isko-still.png from the folder
        assets/sprites/characters, and the proponent's picture of
        Dominador Gómez)
        Refer to the attached images and use the art style and size of
        the first. Draw Dominador Gómez, a Filipino labour leader of
        1906, from the second picture: the whole body, side on, facing
        right, walking, in a white suit and hat. Transparent background.
        (NOT STARTED)

    assets/sprites/characters/van-schaick.png
        (Attach isko-still.png from the folder
        assets/sprites/characters, and the proponent's picture of
        Louis Van Schaick)
        Refer to the attached images and use the art style and size of
        the first. Draw Colonel Louis Van Schaick, an American officer
        of 1906, from the second picture: the whole body, side on,
        facing right, standing straight in a dress uniform. Transparent
        background.
        (NOT STARTED)

    assets/sprites/characters/villafuerte.png
        (Attach isko-still.png from the folder assets/sprites/characters)
        Refer to the attached image and use the same art style and
        size. Draw León Villafuerte, a Filipino rebel officer of 1906:
        the whole body, side on, facing right, standing, arms free of
        the body, in a plain dark uniform with a sash. Transparent
        background.
        (NOT STARTED)

    assets/sprites/characters/de-vega.png
        (Attach isko-still.png from the folder assets/sprites/characters)
        Refer to the attached image and use the same art style and
        size. Draw Lucio de Vega, a Filipino rebel officer of 1906: the
        whole body, side on, facing right, walking, arms free of the
        body, in a worn plain uniform. Transparent background.
        (NOT STARTED)

    assets/sprites/characters/hukom.png
        (Attach isko-still.png from the folder assets/sprites/characters)
        Refer to the attached image and use the same art style and
        size. Draw an American judge of 1906 in a black robe, the whole
        body, seated side on and facing right on a chair. Transparent
        background.
        (NOT STARTED)

    assets/sprites/characters/taga-cavite.png
        (Attach isko-still.png from the folder assets/sprites/characters)
        Refer to the attached image and use the same art style and
        size. Draw a thin Filipino village woman of Cavite in 1905: the
        whole body, side on, facing right, walking, in a faded baro't
        saya, carrying a small cloth bundle of rice. Transparent
        background.
        (NOT STARTED)

    assets/sprites/characters/anak-ni-isko.png
        (Attach isko-still.png from the folder assets/sprites/characters)
        Refer to the attached image (his father) and use the same art
        style. Draw a Filipino boy of about seven in 1906, about half
        the man's height: the whole body, side on, facing right,
        standing, barefoot, in a simple camisa and short trousers.
        Transparent background.
        (NOT STARTED)

    assets/sprites/characters/taong-bayan-1.png
        (Attach isko-still.png from the folder assets/sprites/characters)
        Refer to the attached image and use the same art style and
        size. Draw an ordinary man of Tondo in 1906: the whole body,
        standing, facing the front, in a camisa de chino, trousers and
        a salakot. Transparent background.
        (NOT STARTED)

    assets/sprites/characters/taong-bayan-2.png
        (Attach isko-still.png from the folder assets/sprites/characters)
        Refer to the attached image and use the same art style and
        size. Draw an ordinary woman of Tondo in 1906: the whole body,
        standing, facing the front, in a baro't saya and a tapis.
        Transparent background.
        (NOT STARTED)

## Props

### Act I

    assets/sprites/scenery/tahian.png
        (Attach the file _dev/parallax-art/tondo-props.png)
        Refer to the attached image and use the same art style. Draw
        one small wooden sewing table of 1890, seen from the side, with
        cloth, thread, scissors and a pincushion on it, nothing else in
        the picture. Transparent background.
        (NOT STARTED)

    assets/sprites/scenery/silya-barbero.png
        (Attach the file _dev/parallax-art/tondo-props.png)
        Refer to the attached image and use the same art style. Draw
        one simple wooden barber's chair of 1890 with a high back and
        armrests, seen from the side, nothing else in the picture.
        Transparent background.
        (NOT STARTED)

Also wanted (not in the game yet):

    assets/sprites/scenery/entablado-harap.png
        Made with tondo-doors.png (Outdoor layers): its piece 1.

### Act II

    assets/sprites/scenery/palimbagan.png
        (Attach the file _dev/parallax-art/tondo-props.png)
        Refer to the attached image and use the same art style. Draw
        one wooden hand printing press of 1896, a little shorter than a
        man, with a sheet of paper on it, seen from the side, nothing
        else in the picture. Transparent background.
        (NOT STARTED)

    assets/sprites/scenery/dayami.png
        (Attach the file _dev/parallax-art/tondo-props.png)
        Refer to the attached image and use the same art style. Draw
        one bundle of dry rice straw tied with a cord, lying on the
        ground, seen from the side, nothing else in the picture.
        Transparent background.
        (NOT STARTED)

    assets/sprites/scenery/panakot.png
        (Attach the file _dev/parallax-art/tondo-props.png)
        Refer to the attached image and use the same art style. Draw a
        straw bundle raised on a pole as a scarecrow shaped like a
        standing man, as tall as a man, wearing a salakot with a red
        band, arms of straw held out, seen from the side, nothing else
        in the picture. Transparent background.
        (NOT STARTED)

Also wanted (not in the game yet):

    assets/sprites/scenery/bahay-nanay.png
        Made with tondo-doors.png (Outdoor layers): its piece 2.

    assets/sprites/scenery/imprenta.png
        Made with tondo-doors.png (Outdoor layers): its piece 3.

### Act III

    assets/sprites/scenery/watawat-katagalugan.png
        (Attach the file _dev/parallax-art/tondo-props.png, and the
        proponent's picture of the flag)
        Refer to the attached images and use the art style of the
        first. Draw the flag of the Republika ng Katagalugan, exactly as
        in the second picture, flying on a tall bamboo pole taller than
        a man, seen from the side, nothing else in the picture.
        Transparent background.
        (NOT STARTED)

Also wanted (not in the game yet):

    assets/sprites/scenery/barberya.png
        Made with tondo-doors.png (Outdoor layers): its piece 4.

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
