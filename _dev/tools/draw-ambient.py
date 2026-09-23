"""
MACARIO - _dev/tools/draw-ambient.py

Block 54. The small moving things that make a street feel alive:
drifting clouds, a flock of birds with a two-frame wingbeat, and a
falling leaf. Drawn from nothing with Pillow as tiny pixel-art images
and scaled up in the browser nearest-neighbour (image-rendering:
pixelated), so each file is a few hundred bytes and the look matches
the pixel theme rather than pretending to be part of the paintings.

Usage, from the repository root (needs Pillow, dev-time only):

    python3 _dev/tools/draw-ambient.py

Writes assets/sprites/ambient/: cloud-1.png, cloud-2.png, birds.png
(two frames side by side) and leaf.png. game.js (buildAmbient) and
css/style.css (.ambient-*) decide where they go and how they move.
"""
import os
from PIL import Image

OUT = "assets/sprites/ambient/"

WHITE = (250, 250, 252, 255)
LIGHT = (226, 234, 244, 255)
SHADE = (196, 212, 230, 255)
BIRD = (40, 36, 44, 255)
LEAF = (70, 112, 48, 255)
LEAF_LIGHT = (118, 158, 66, 255)
LEAF_DARK = (44, 74, 34, 255)


def from_rows(rows, palette):
    h = len(rows)
    w = max(len(r) for r in rows)
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = im.load()
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch in palette:
                px[x, y] = palette[ch]
    return im


CLOUD_PAL = {"w": WHITE, "l": LIGHT, "s": SHADE}

# Flat-bottomed cumulus, lit from above, shaded underneath.
CLOUD_1 = [
    "..............wwww..............",
    "...........wwwwwwwww............",
    "..........wwwwwwwwwww...www.....",
    "......www.wwwwwwwwwwwwwwwwwww...",
    "....wwwwwwwwwwwwwwwwwwwwwwwwww..",
    "...wwwwwwwwwwwwwwwwwwwwwwwwwwww.",
    "..wwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    ".lwwwwwwwwwwwwwwwwwwwwwwwwwwwwwl",
    "llllwwwwwwwwwwwwwwwwwwwwwwwlllll",
    "lllllllllllllllllllllllllllllll.",
    ".ssssssssssssssssssssssssssssss.",
    "...ssssssssssssssssssssssssss...",
]

CLOUD_2 = [
    ".........wwww.........",
    "......wwwwwwwww.......",
    "..www.wwwwwwwwww.ww...",
    ".wwwwwwwwwwwwwwwwwwww.",
    "wwwwwwwwwwwwwwwwwwwwww",
    "lwwwwwwwwwwwwwwwwwwwwl",
    "lllllllllllllllllllll.",
    ".sssssssssssssssssss..",
]

# One bird, wings up then wings down, 9 by 5. A flock is three of them.
BIRD_UP = [
    "b.......b",
    ".b.....b.",
    "..b.b.b..",
    "...bbb...",
    "....b....",
]
BIRD_DOWN = [
    ".........",
    "...bbb...",
    "..bbbbb..",
    ".b..b..b.",
    "b.......b",
]

LEAF_ROWS = [
    "...dd",
    ".dgGd",
    "dgGGd",
    "dgGd.",
    "dd...",
]


def flock(bird):
    """Three birds in a loose V, in a 30 by 14 frame."""
    im = Image.new("RGBA", (30, 14), (0, 0, 0, 0))
    b = from_rows(bird, {"b": BIRD})
    for x, y in ((0, 6), (10, 0), (21, 5)):
        im.alpha_composite(b, (x, y))
    return im


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    from_rows(CLOUD_1, CLOUD_PAL).save(OUT + "cloud-1.png", optimize=True)
    from_rows(CLOUD_2, CLOUD_PAL).save(OUT + "cloud-2.png", optimize=True)
    sheet = Image.new("RGBA", (60, 14), (0, 0, 0, 0))
    sheet.alpha_composite(flock(BIRD_UP), (0, 0))
    sheet.alpha_composite(flock(BIRD_DOWN), (30, 0))
    sheet.save(OUT + "birds.png", optimize=True)
    from_rows(LEAF_ROWS, {"d": LEAF_DARK, "g": LEAF, "G": LEAF_LIGHT}).save(OUT + "leaf.png", optimize=True)
    for f in sorted(os.listdir(OUT)):
        print("wrote", OUT + f, os.path.getsize(OUT + f), "bytes")
