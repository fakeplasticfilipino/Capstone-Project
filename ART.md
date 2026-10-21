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

The art is made with ChatGPT (since 21 Oct 2026). Every entry below
has a Prompt: paste it as written, with the files it names attached,
and change only what is in [square brackets]. Each prompt begins with
one of these sentences, written out once here:

    STYLE    Same art style as the attached image: painted pixel art,
             warm earthy colours, clean dark outlines, soft daylight,
             the Philippines of [YEAR]. Straight-on side view: flat, no
             perspective, no camera angle.
             (Attach _dev/parallax-art/tondo-nature.png.)

    ROOM     One painting of the whole room seen straight on from the
             side, like a stage set, with the camera far back: a grown
             man standing at the front would be about a quarter of the
             picture's height, a door about a third of it, a table top
             at his hip. The floor fills the bottom sixth of the
             picture. No people. Wide landscape.

    PERSON   One person, the whole body, standing side on and facing
             right, arms hanging free of the body, feet showing, on a
             transparent background. Same style and finish as the
             attached character. (Attach
             assets/sprites/characters/isko-still.png, and the
             proponent's reference for the person.)

    THING    One object, side view, whole, on a transparent background,
             nothing else in the picture.

If ChatGPT gives a white or checkered background instead of a
transparent one, ask: "make the background transparent". A room that
comes out too close (the furniture big next to the door) is made again
with: "move the camera further back; the room smaller in the frame".

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

## Outdoor layers

The new background system (21 Oct 2026, the proponent's choice: every
outdoor scene that scrolls). Instead of one long painting, an outdoor
scene is a stack of layers that slide at different speeds as Macario
walks, which gives the scene depth:

    nature      sky and the far distance (mountains, the bay)    barely moves
    trees       a tree line behind the place, used twice:        drifts
                a small pale copy far back, a big one near
    buildings   the houses, walls, towers and props, each its    moves with the road
                own picture, placed along the road by the game
    ground      the road or earth the people stand on            moves with the road
    foreground  the shadow trees and grass, drawn by the game    passes fastest
                (nothing to make)

The game does not ask for these files yet: the engine work that reads
them comes first (planned, not built yet), and until then prepare.js
does not check this part. The test page, _dev/parallax-test.html, shows Tondo built
this way from the first set (in _dev/parallax-art/).

The scenes that change, and what each one uses. One kit serves several
scenes, so a picture is made once:

    scene        act    nature            trees      buildings kit       ground
    tondo        I-IV   tondo (done)      lowland    tondo (done) +      dirt
                                          (done)     tondo doors
    san-juan     II     sierra            lowland    garrison            dirt
    nangka       II     sierra            lowland    rural + river       grass
    burol        III    manila-view       mountain   camp                grass
    morong       III-IV sierra            mountain   camp                grass
    himpilan     IV     sierra-night      lowland    post                dirt
    dimasalang   IV     sierra            mountain   camp                grass
    malabon      IV     cavite-dusk       lowland    town                dirt
    patyo        IV     bilibid-sky       none       bilibid             stone

Rooms and the outdoor places one screen wide (Pugad Lawin, Balara,
Laguna, the plaza) do not scroll, so they gain nothing from layers and
keep one painting each.

### Making them with ChatGPT

1. Attach the style reference to every prompt:
   _dev/parallax-art/tondo-nature.png (the Tondo sky and bay). For a
   kit, also attach the tondo buildings sheet
   (_dev/parallax-art/tondo-houses.png), so the new buildings come out
   the same size and finish.
2. Paste the prompt as written. Change nothing but what is in [square
   brackets].
3. Ask for the largest landscape size. If the background comes out
   white or checkered instead of transparent, ask again: "make the
   background transparent". If it still will not, ask for "a flat solid
   magenta (#FF00FF) background" and say so when you hand it over.
4. Save it under the file name given, in _dev/parallax-art/ for now.
   The game's team crops the sheets, scales everything to Macario and
   lays out the scene; the artist never needs to measure anything.
5. If one picture in a set looks wrong (a building in perspective, a
   person in it, a tree line with gaps), make that one again; the rest
   of the set stays.

Every prompt starts with the same style sentence, so the whole game
matches:

    STYLE: Same art style as the attached image: painted pixel art,
    warm earthy colours, clean dark outlines, soft daylight, the
    Philippines of [YEAR]. Straight-on side view: flat, no perspective,
    no camera angle.

### Nature (sky and far distance)

Each is a JPG, filled edge to edge, no transparency. Nothing in it is
reached by Macario, so no doors, roads or people.

    sierra-nature.jpg                                  for san-juan, nangka, morong, dimasalang
        STYLE (YEAR 1896). Draw ONLY the far background of a
        landscape near Manila: a clear blue sky with soft white clouds,
        and along the bottom third a long range of blue-green mountains
        (the Sierra Madre) fading into haze, with a few low forested
        hills in front of them. No buildings, no trees in the
        foreground, no people, no road, no water in the foreground.
        Make it slightly lighter and hazier than the reference so it
        feels far away. Wide landscape format.

    sierra-night-nature.jpg                            for himpilan
        Attach sierra-nature.jpg as well as the style reference.
        Redraw the attached mountain landscape exactly as it is, at
        night: a deep blue night sky with stars and a bright full moon
        high on the left, the mountains dark blue with soft moonlit
        edges. Same mountains, same layout. No buildings, no people.

    manila-view-nature.jpg                             for burol
        STYLE (YEAR 1899). Draw ONLY the far background seen from a
        hill outside Manila: a clear blue sky with soft clouds, and far
        below along the bottom third, the city of Manila small in the
        distance (church domes and bell towers, red tile roofs) beside
        Manila Bay with a few distant ships, and low mountains across
        the bay. Everything small and hazy, very far away. No trees in
        the foreground, no people, no road. Wide landscape format.

    cavite-dusk-nature.jpg                             for malabon
        STYLE (YEAR 1905). Draw ONLY the far background of a Cavite
        town at sunset: a sky going from deep orange at the horizon to
        purple above, a low sun on the left, long thin clouds lit from
        below, and along the bottom third a flat line of distant rice
        fields and coconut palms in dark silhouette, with low hills far
        away. No buildings, no people, no road. Wide landscape format.

    bilibid-sky-nature.jpg                             for patyo
        STYLE (YEAR 1907). Draw ONLY the sky above a walled prison yard
        in Manila on an early morning: a pale clear sky, a few soft
        clouds, the light low and cold, and along the bottom quarter
        only the far tops of distant trees and red tile roofs. No walls,
        no buildings in front, no people. Wide landscape format.

### Tree lines

Each is a PNG on a transparent background, seamless at its left and
right edges, so it can repeat. The game uses each one twice, small and
pale far back, large near.

    lowland-trees.png                                  done (tondo-trees.png)

    mountain-trees.png                                 for burol, morong, dimasalang
        STYLE (YEAR 1902). A continuous mountain forest tree line seen
        from a little distance, used as the layer behind a rebel camp
        in the hills: dense overlapping canopies of tall narra and
        dao trees, wild bamboo, tree ferns and a few palms, varying
        heights, no gaps between trees, the ground under them rising
        slightly with rocks and undergrowth along the bottom edge.
        Slightly softer and less detailed than foreground art, muted
        greens. The left and right edges continue into each other so
        the image can repeat. No buildings, no people, no sky.
        Transparent background. Wide landscape, largest size.

### Building kits

Each kit is ONE sprite sheet: all its pieces in one picture, so they
match. Every kit uses this sentence after the style sentence:

    SHEET: A sprite sheet of separate pieces arranged in a grid, with
    wide empty space between them so none touch or overlap. Each piece
    in straight-on front view (flat side elevation, no perspective),
    standing on its own flat ground line, any door clearly visible at
    ground level. No people, no flags unless asked, no trees behind,
    no ground or shadows between pieces. Transparent background.
    Landscape, largest size.

    tondo-houses.png                                   done: bahay kubo, bahay na bato,
                                                       simbahan, tienda, palengke,
                                                       bahay with balcony
    tondo-props.png                                    done: three fences, barrels,
                                                       palayok, basket, plant, bush,
                                                       kariton, bench, crates,
                                                       sampayan, lamp post

    tondo-doors.png                                    the buildings Macario goes into
        STYLE (YEAR 1896). SHEET. Five buildings of Tondo, Manila:
        (1) the front of a small wooden theatre, an entablado, with a
        painted sign board, a raised front and wide double doors drawn
        OPEN with warm light inside; (2) a poor but cared-for one-storey
        wooden house of a mother and son, nipa roof, a door drawn OPEN
        with warm light inside; (3) an ordinary narrow two-storey
        wooden house, a plain door drawn OPEN with warm light inside (a
        secret printing press hides behind it); (4) a small barbershop,
        a wooden front with a striped awning and a chair visible
        through the window, the door drawn OPEN with warm light inside;
        (5) the back of a house on a narrow alley, a low back door
        drawn OPEN with warm light inside.

    garrison.png                                       for san-juan
        STYLE (YEAR 1896). SHEET. Pieces of the Spanish powder
        magazine (polvorín) at San Juan del Monte: (1) the polvorín, a
        squat building of thick whitewashed stone with a red tile roof
        and one heavy wooden door; (2) a Spanish flagpole with the
        flag of Spain of 1896 (red, yellow, red stripes); (3) a long
        wooden palisade section; (4) a short palisade section with a
        gate; (5) a stack of gunpowder kegs; (6) a stack of wooden
        crates; (7) a pile of sandbags; (8) a stone guard post with a
        small roof.

    rural.png                                          for nangka
        STYLE (YEAR 1896). SHEET. Pieces of a farm by the Nangka
        River, east of Manila: (1) a small nipa hut on stilts; (2) a
        low bamboo granary on stilts; (3) a long bamboo fence; (4) a
        short bamboo fence; (5) a haystack; (6) a clump of banana
        plants; (7) a carabao cart without the animal; (8) a wooden
        footbridge plank on posts.

    river.png                                          for nangka
        STYLE (YEAR 1896). A seamless strip of a calm brown-green river
        seen from the side, with low grassy banks on both sides and a
        few rocks, as wide as the image and short in height, for the
        middle distance of a 2D side-scrolling game. The left and right
        edges continue into each other. No people, no boats, no sky.
        Transparent above the far bank. Wide landscape.

    camp.png                                           for burol, morong, dimasalang
        STYLE (YEAR 1902). SHEET. Pieces of a hidden rebel camp in the
        mountains: (1) a wooden watchtower with a thatched roof and a
        ladder; (2) a nipa hut on tall stilts with a ladder; (3) an
        open lean-to shelter with a thatched roof; (4) an open shelter
        with a canvas cloth roof and a table under it; (5) a long
        bamboo palisade; (6) a short rough log fence; (7) a stack of
        stone steps going up, as seen from the side; (8) a group of
        large rocks; (9) a cooking fire with a pot on three stones;
        (10) a rack of bamboo poles and drying cloth. No flags.

    post.png                                           for himpilan
        STYLE (YEAR 1904). SHEET. Pieces of a Philippine Constabulary
        post in a town: (1) a one-storey stucco barracks with a red
        tile roof, a lantern by the door and a heavy double door; (2) a
        long whitewashed stone wall section with square pillars; (3) a
        wall section with a heavy wooden gate; (4) a wooden
        watchtower; (5) an open shed with a canvas roof and crates
        under it; (6) a rack of rifles against a wall; (7) a stack of
        barrels and crates. No flags. Drawn by day; the game makes it
        night.

    town.png                                           for malabon
        STYLE (YEAR 1905). SHEET. Pieces of the town of San Francisco
        de Malabon, Cavite: (1) a large stone church with a bell tower
        and a carved facade; (2) a two-storey stone town hall (casa
        tribunal) with arches on the ground floor; (3) a square stone
        watchtower building; (4) a long stone wall with a wooden gate;
        (5) a nipa house; (6) a small wooden store with an awning. No
        flags. Drawn by day; the game colours it for sunset.

    bilibid.png                                        for patyo
        STYLE (YEAR 1907). SHEET. Pieces of the yard of Bilibid Prison,
        Manila: (1) a tall stone prison wall section with a walkway on
        top; (2) a square stone guard tower with a red tile roof; (3) a
        stone building front with an iron-barred arched gate; (4) a
        wooden gallows platform with steps up to it; (5) a plain
        wooden bench. No people.

### Ground strips

Each is a JPG, seamless at its left and right edges, short and wide.

    dirt-ground.jpg                                    for tondo, san-juan, himpilan, malabon
        STYLE (YEAR 1896). A seamless, tileable strip of packed dirt
        road seen from the side, for the ground of a 2D side-scrolling
        street: earth with small stones, wheel ruts and a few tufts of
        grass. The left and right edges continue into each other
        perfectly. Flat side view, no objects, no sky. Wide landscape,
        short in height.

    grass-ground.jpg                                   for nangka, burol, morong, dimasalang
        The same prompt, with: "a strip of trodden earth and short
        grass at the edge of a forest, a few roots and stones".

    stone-ground.jpg                                   for patyo
        The same prompt, with: "a strip of worn stone flags and packed
        earth of a prison yard".

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
        Prompt: STYLE (YEAR 1896). ROOM. The Katipunan's hidden printing press
        in a Tondo house: a wooden hand press at the left, stacks of
        paper and type cases, crates, two tall wooden shelves a person
        could climb, a small back window at the left edge, the door out
        at the right edge. Busy and hopeful. The room is wide: make the
        left half first, then ask "continue this room to the right as a
        second picture whose left edge matches this one's right edge".
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
        Prompt: STYLE (YEAR 1896). ROOM. A poor but cared-for one-room
        house in Tondo: bamboo floor, a low wooden table and two stools
        in the middle, a small home altar, a woven mat rolled by the
        wall, a window with capiz shells, the door on the right. Quiet
        and warm, the last safe place.
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
        Prompt: STYLE (YEAR 1900). ROOM. A small barbershop in Tondo by day:
        one barber's chair facing a mirror on the wall, a narrow shelf of
        razors and bottles, a small table, a bench for waiting customers,
        the door on the right. Ordinary and tidy.
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
        Prompt: STYLE (YEAR 1901). ROOM. The sala of a respectable house on
        Calle Gunao, Quiapo: polished wooden floor, capiz windows, a
        long table with papers and an inkwell in the middle, chairs
        around it, a door at each end. Hopeful and respectable.
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
        Prompt: STYLE (YEAR 1906). ROOM. A large reception hall in a house in
        Cavite: a long table laid for a festive meal in the middle,
        chairs along it, lamps, an American flag of 1906 on the back
        wall, a door at each end. Polite and festive.
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
        Prompt: STYLE (YEAR 1906). ROOM. The Court of First Instance of
        Cavite: a raised judge's bench on the right, a wooden rail
        across the room, plain benches on the left, tall windows, a door
        on the left. Formal and cold.
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
        walks out.
        Prompt: PERSON, seated: an American private of 1900, short hair,
        sitting side on in a barber's chair with a white barber's cape
        over him. Then a second picture: the same man standing and
        walking, in a blue shirt and khaki trousers.
        (NOT STARTED)

    assets/sprites/enemies/amerikano.png
        An American soldier of the Philippine-American War, 1899 to
        1906: the enemy in Act III's first battle, the sentries Macario
        sneaks past in Tondo, and the soldiers at Malabon. Armed with a
        rifle and bayonet. Side on; he fights hand to hand and stands
        guard with the rifle. In Acts III and IV. The kit of 1899: a
        broad-brimmed campaign hat and a blue shirt (the soldier
        delivered on 16 October wore the steel helmet, pack and puttees
        of 1917 and was taken out; the same pose is welcome, so the
        game's animation fits him).
        Prompt: PERSON: an American soldier of 1899 to 1906, broad-brimmed
        campaign hat, blue flannel shirt, khaki trousers, canvas
        leggings, holding a rifle with bayonet across his body. Not
        the steel helmet of 1917.
        (NOT STARTED)

    assets/sprites/enemies/konstable.png
        A man of the Philippine Constabulary, 1902 to 1906: a Filipino
        serving the Americans' police force, sent against Macario's
        Republic. He attacks the camp at Morong, guards the post Macario
        raids, and defends Malabon. Armed with a rifle. Side on; he
        fights hand to hand and stands guard. In Acts III and IV.
        Prompt: PERSON: a Filipino of the Philippine Constabulary, 1905,
        khaki uniform, a campaign hat, a cartridge belt, holding a
        rifle across his body.
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
        Prompt: PERSON: Dominador Gómez, a Filipino labour leader of 1906,
        middle-aged, in a white suit and hat, walking.
        (NOT STARTED)

    assets/sprites/characters/van-schaick.png
        Colonel Louis Van Schaick: the American officer who hosts the
        reception in Cavite in 1906, where Macario and his officers are
        arrested at the toast. Standing.
        Prompt: PERSON: Colonel Louis Van Schaick, an American officer of
        1906, in a dress uniform, standing straight.
        (NOT STARTED)

    assets/sprites/characters/villafuerte.png
        León Villafuerte: one of Macario's officers, beside him at
        Malabon and at the reception, and sentenced with him. Side on,
        standing.
        Prompt: PERSON: León Villafuerte, a Filipino rebel officer of 1906,
        in a plain dark uniform with a sash, standing.
        (NOT STARTED)

    assets/sprites/characters/de-vega.png
        Lucio de Vega: one of Macario's officers, sentenced with him and
        hanged beside him on the last morning; he speaks to Macario in
        the cell. Side on; he walks.
        Prompt: PERSON: Lucio de Vega, a Filipino rebel officer of 1906, in a
        worn plain uniform, walking.
        (NOT STARTED)

    assets/sprites/characters/hukom.png
        The Hukom: the American judge of the Court of First Instance of
        Cavite, who tries Macario as a bandit and sentences him to death.
        Seated at the bench.
        Prompt: PERSON, seated: an American judge of 1906 in a black robe,
        seated side on at a bench.
        (NOT STARTED)

    assets/sprites/characters/taga-cavite.png
        The Taga-Cavite: a woman of Cavite who escapes the American
        camps where the villagers have been herded, and brings Macario's
        starving army the little rice she could carry. Through her the
        player learns what the camps are doing to the people. Side on;
        she walks into the camp.
        Prompt: PERSON: a thin Filipino village woman of Cavite, 1905, in a
        faded baro't saya, carrying a small cloth bundle of rice,
        walking.
        (NOT STARTED)

    assets/sprites/characters/anak-ni-isko.png
        Andres: Isko's son, about seven years old, 1906, the child Isko
        surrendered to go home to. He stands
        beside his father in the crowd in Manila.
        Prompt: PERSON: a Filipino boy of about seven, 1906, in a simple
        camisa and short trousers, barefoot, standing.
        (NOT STARTED)

    assets/sprites/characters/taong-bayan-1.png
    assets/sprites/characters/taong-bayan-2.png
        The crowd in Manila, July 1906: ordinary people of Tondo who
        line the street to see Macario come down from the mountains,
        and who know him by his long hair. A man (1) and a woman (2),
        standing; may face the front. Each is repeated along the street.
        Prompt: PERSON: (1) an ordinary man of Tondo, 1906, camisa de chino
        and trousers, a salakot; (2) an ordinary woman of Tondo, 1906,
        baro't saya and a tapis. Make each as its own picture; they may
        face the front.
        (NOT STARTED)

## Props

### Act I

    assets/sprites/scenery/tahian.png
        The Mananahi's sewing table, on the street beside her: where
        Macario, a boy looking for work, helps her sew for a few coins
        before she sends him to the theatre with the costumes. About
        two thirds of Macario's height.
        Prompt: THING (STYLE, YEAR 1890): a small wooden sewing table with
        cloth, thread, scissors and a pincushion on it.
        (NOT STARTED)

    assets/sprites/scenery/silya-barbero.png
        The Barbero's chair, set out on the street beside him: where
        Macario, as a boy, cuts his first customer's hair. In Act III
        the same chair is inside the barbershop. About two thirds of
        Macario's height.
        Prompt: THING (STYLE, YEAR 1890): a simple wooden barber's chair
        with a high back and armrests.
        (NOT STARTED)

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
        Prompt: THING (STYLE, YEAR 1896): a wooden hand printing press, a
        little shorter than a man, with a sheet of paper on it.
        (NOT STARTED)

    assets/sprites/scenery/dayami.png
        A bundle of straw on the bank of the Nangka River, before
        Macario raises it as a scarecrow to fool the Spanish. About half
        Macario's height.
        Prompt: THING (STYLE, YEAR 1896): a bundle of dry rice straw tied
        with a cord, lying on the ground.
        (NOT STARTED)

    assets/sprites/scenery/panakot.png
        The same straw bundle raised as a scarecrow, standing like a
        Katipunero, wearing a salakot with a red band, so that from the
        far bank the Spanish take it for a man and attack it. Macario's
        height.
        Prompt: THING (STYLE, YEAR 1896): the same straw bundle raised on a
        pole as a scarecrow shaped like a standing man, wearing a
        salakot with a red band, arms of straw held out.
        (NOT STARTED)

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
        Macario.
        Prompt: THING (STYLE, YEAR 1902): the flag of the Republika ng
        Katagalugan on a tall bamboo pole: [describe the flag from the
        proponent's reference], flying.
        (NOT STARTED)

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
