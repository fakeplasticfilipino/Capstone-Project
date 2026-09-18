"""
MACARIO - _dev/make-placeholder-sprites.py

Stand-in art for the characters and item tiles the artist has not drawn
yet. They are not new drawings: each character is one frame of an
existing commissioned sprite, recoloured and given a small prop, so the
painted pixel style, the outline, the proportions and the lighting are the
artist's own. The two item tiles are drawn here at 32px and scaled up
nearest-neighbour, the same chunky look as the rest.

Every output is a single still frame in a 256px cell, like the sheets it
comes from, so measure-sprite.js measures them the same way. They are
meant to be replaced: when real art arrives, drop it over the same file
name, remeasure, and paste the new numbers.

Usage, from the repository root (needs Pillow, dev-time only):

    python3 _dev/make-placeholder-sprites.py
"""
import colorsys
from PIL import Image, ImageDraw

ACT = "Assets/Act 1/"


def frame0(name):
    """First 256px cell of an existing 5-column sheet."""
    return Image.open(ACT + name).convert("RGBA").crop((0, 0, 256, 256))


def hsv(px):
    r, g, b, a = px
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    return h * 360, s, v, a


def recolor(im, rows, test, hue, sat, vscale, vadd=0.0, cols=(0, 256)):
    """Recolours the pixels in rows [a, b) of the cell that pass test(h, s, v),
    keeping each pixel's own brightness (scaled) so the painted shading and
    the outline survive. rows are cell coordinates, not cropped ones."""
    px = im.load()
    a, b = rows
    for y in range(a, b):
        for x in range(*cols):
            h, s, v, al = hsv(px[x, y])
            if al < 8 or not test(h, s, v):
                continue
            nv = max(0.0, min(1.0, v * vscale + vadd))
            r, g, bl = colorsys.hsv_to_rgb(hue / 360, sat, nv)
            px[x, y] = (int(r * 255), int(g * 255), int(bl * 255), al)


def rect(im, box, color):
    ImageDraw.Draw(im).rectangle(box, fill=color)


OUTLINE = (33, 22, 17, 255)

# Tindero's frame: body box x 104..153, y 69..190 in the cell.
# Kutsero's: x 105..150, y 74..191. Nanay's: x 96..158, y 45..212.
cream = lambda h, s, v: s < 0.38 and v > 0.58
skin = lambda h, s, v: s >= 0.45 and v > 0.45


def bonifacio():
    # White camisa kept; trousers and sash red, the colours he is usually
    # drawn in. Built on the Tindero.
    im = frame0("Tindero.png")
    recolor(im, (133, 182), lambda h, s, v: 0.2 < s < 0.55 and v < 0.6, 355, 0.62, 1.25,
            cols=(113, 146))
    recolor(im, (119, 128), lambda h, s, v: v < 0.35, 355, 0.7, 1.9, 0.05)
    return im


def katipunero():
    # The Kutsero's straw hat and build, in a red shirt and dark trousers.
    im = frame0("Kutsero.png")
    recolor(im, (98, 144), cream, 356, 0.74, 0.66)
    recolor(im, (143, 180), lambda h, s, v: v < 0.45 and s < 0.45, 25, 0.25, 0.8)
    return im


def mamamayan():
    # A townsman: the Kutsero in a faded blue shirt and brown trousers, so
    # he does not read as the Katipunero beside him.
    im = frame0("Kutsero.png")
    recolor(im, (98, 144), cream, 208, 0.28, 0.85)
    recolor(im, (143, 180), lambda h, s, v: v < 0.45 and s < 0.45, 28, 0.45, 1.1)
    return im


def bantay():
    # A guardia civil: the Tindero in a navy uniform and cap, with a rifle
    # at his side. Shirt and trousers navy, belt left black.
    im = frame0("Tindero.png")
    recolor(im, (91, 133), cream, 222, 0.55, 0.42)
    # The sleeves' pale edges, below the chin so the face is left alone.
    recolor(im, (100, 133), lambda h, s, v: 30 < h < 60 and s < 0.46 and v > 0.5, 222, 0.55, 0.42)
    recolor(im, (133, 182), lambda h, s, v: 0.2 < s < 0.55 and v < 0.6, 224, 0.5, 0.75,
            cols=(113, 146))
    # The pouch becomes a leather cartridge box, darker.
    recolor(im, (122, 136), lambda h, s, v: s >= 0.45 and v < 0.62 and h < 40, 20, 0.55, 0.7)
    # Cap: a navy kepi over the hair, with a black visor.
    d = ImageDraw.Draw(im)
    d.polygon([(120, 69), (137, 69), (139, 77), (118, 77)], fill=OUTLINE)
    d.polygon([(121, 70), (136, 70), (138, 76), (119, 76)], fill=(38, 52, 92, 255))
    d.line((121, 70, 136, 70), fill=(62, 80, 134, 255))
    d.rectangle((126, 72, 131, 73), fill=(200, 164, 60, 255))  # cap badge
    d.rectangle((116, 77, 141, 79), fill=OUTLINE)
    d.rectangle((117, 77, 140, 78), fill=(24, 24, 30, 255))
    # Rifle, butt down beside his left hand, barrel up past the shoulder.
    d.rectangle((151, 92, 153, 162), fill=OUTLINE)
    d.rectangle((152, 93, 152, 140), fill=(120, 124, 130, 255))
    d.rectangle((150, 140, 154, 166), fill=OUTLINE)
    d.rectangle((151, 141, 153, 165), fill=(112, 70, 38, 255))
    return im


def mananahi():
    # The tailor: Nanay's frame, tapis and skirt recoloured so she is
    # plainly someone else, and a yellow tape measure over her shoulders.
    im = frame0("Nanay.png")
    recolor(im, (112, 148), lambda h, s, v: 190 < h < 250 and s > 0.35, 140, 0.45, 0.9)
    recolor(im, (140, 196), lambda h, s, v: v < 0.35 and not skin(h, s, v), 345, 0.45, 1.6, 0.04)
    d = ImageDraw.Draw(im)
    for (x, y0, y1) in ((117, 80, 104), (137, 80, 104)):
        d.rectangle((x - 1, y0, x + 1, y1), fill=OUTLINE)
        d.rectangle((x, y0 + 1, x, y1 - 1), fill=(236, 196, 72, 255))
        for y in range(y0 + 3, y1 - 1, 4):
            d.point((x, y), fill=(120, 84, 30, 255))
    return im


def icon(pixels, palette, size=32, scale=2):
    """Draws a small icon from a list of strings, one char per pixel."""
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = im.load()
    h = len(pixels)
    top = (size - h) // 2
    for y, row in enumerate(pixels):
        left = (size - len(row)) // 2
        for x, ch in enumerate(row):
            if ch in palette:
                px[left + x, top + y] = palette[ch]
    return im.resize((size * scale, size * scale), Image.NEAREST)


APPLE = [
    "..........oo..........",
    ".........o#o..........",
    "........o#o.oooo......",
    "....oooo#oo.oggGo.....",
    "..oorrrrRoRRoggo......",
    ".orrrrrrrrRRRoo.......",
    "orrwwrrrrrrRRRRo......",
    "orwwrrrrrrrrRRRo......",
    "orwrrrrrrrrrRRRdo.....",
    "orrrrrrrrrrrRRRdo.....",
    "orrrrrrrrrrrRRRdo.....",
    "orrrrrrrrrrRRRRdo.....",
    ".orrrrrrrrRRRRddo.....",
    ".orrrrrrrRRRRRddo.....",
    "..orRRRRRRRRRddo......",
    "...oddRRRRRdddo.......",
    "....ooddddddoo........",
    "......oooooo..........",
]
APPLE_PAL = {
    "o": OUTLINE, "#": (92, 58, 30, 255), "g": (86, 150, 64, 255),
    "G": (140, 196, 92, 255), "r": (206, 52, 44, 255), "R": (164, 32, 34, 255),
    "d": (112, 20, 26, 255), "w": (250, 214, 196, 255),
}

SHIRT = [
    ".....oooo....oooo.....",
    "...ooyyyoo..ooyyyoo...",
    "..orrrryyoooyyrrrrro..",
    ".orrrrrrryyyyrrrrrrro.",
    "orrrrrrrrrYyrrrrrrrrro",
    "orrRrrrrrryYrrrrrrRrro",
    "orRRorrrrrYyrrrrroRRro",
    ".ooo.orrrryYrrrro.ooo.",
    ".....orrrrYyrrrro.....",
    ".....orrrryYrrrro.....",
    ".....oyyyyyyyyyyo.....",
    ".....orrrryYrrrro.....",
    ".....orrrrYyrrrro.....",
    ".....orRrryYrrRro.....",
    ".....orRRrYyrRRro.....",
    ".....oyyyyyyyyyyo.....",
    ".....oooooooooooo.....",
]
SHIRT_PAL = {
    "o": OUTLINE, "r": (168, 36, 40, 255), "R": (120, 22, 30, 255),
    "y": (226, 178, 58, 255), "Y": (250, 214, 110, 255),
}


if __name__ == "__main__":
    for name, fn in (("Bonifacio", bonifacio), ("Katipunero", katipunero),
                     ("Mamamayan", mamamayan), ("Bantay", bantay),
                     ("Mananahi", mananahi)):
        fn().save(ACT + name + ".png", optimize=True)
        print("wrote", ACT + name + ".png")
    icon(APPLE, APPLE_PAL).save("Assets/Mansanas.png", optimize=True)
    icon(SHIRT, SHIRT_PAL).save(ACT + "Damit_Entablado.png", optimize=True)
    print("wrote Assets/Mansanas.png and", ACT + "Damit_Entablado.png")
