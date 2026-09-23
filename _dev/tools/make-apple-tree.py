"""
MACARIO - _dev/tools/make-apple-tree.py

The apple tree on the street (Block 57), a piece of scenery Macario
picks from. There is no commissioned tree, so this draws one: flat
pixel art at 64 by 80 in the cast's one-pixel dark outline, which the
engine draws about three and a half times its size, pixelated. It is
scenery, the kind of code-drawn picture CLAUDE.md (Block 54) says
stands; a character is not. Replace it by dropping the artist's tree
over the same file name and remeasuring with measure-sprite.js.

Usage, from the repository root (needs Pillow, dev-time only):

    python3 _dev/tools/make-apple-tree.py
"""
import math
from PIL import Image, ImageDraw

OUT = "assets/sprites/scenery/puno-mansanas.png"
W, H = 64, 80

INK = (34, 26, 18, 255)
BARK = (110, 72, 40, 255)
BARK_LIT = (140, 96, 56, 255)
LEAF_DARK = (47, 94, 37, 255)
LEAF = (69, 128, 52, 255)
LEAF_LIT = (104, 160, 70, 255)
APPLE = (208, 44, 36, 255)
APPLE_LIT = (255, 122, 107, 255)

im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(im)

# Trunk: a tapering column with two roots, drawn before the crown so the
# crown sits over its top.
d.polygon([(27, 79), (24, 79), (28, 72), (28, 44), (36, 44), (36, 72),
           (40, 79), (37, 79), (34, 75), (30, 75)], fill=BARK)
d.line([(33, 46), (33, 72)], fill=BARK_LIT)
# Two limbs into the crown.
d.line([(30, 50), (22, 40)], fill=BARK, width=3)
d.line([(35, 48), (43, 38)], fill=BARK, width=3)

# Crown: overlapping round clumps, dark first, lit on the upper left.
clumps = [(32, 22, 17), (18, 30, 12), (46, 30, 12), (24, 16, 11),
          (41, 15, 11), (32, 34, 12), (12, 38, 8), (52, 38, 8)]
for x, y, r in clumps:
    d.ellipse([x - r, y - r, x + r, y + r], fill=LEAF_DARK)
for x, y, r in clumps:
    d.ellipse([x - r + 1, y - r + 1, x + r - 2, y + r - 2], fill=LEAF)
for x, y, r in clumps:
    d.ellipse([x - r + 3, y - r + 2, x + r // 3, y - r // 4], fill=LEAF_LIT)

# Apples hanging in the crown.
for x, y in [(20, 26), (40, 22), (30, 36), (48, 34), (14, 38), (27, 14), (44, 42)]:
    d.rectangle([x - 2, y - 2, x + 2, y + 2], fill=APPLE)
    d.point([(x - 1, y - 1)], fill=APPLE_LIT)
    d.point([(x, y - 3)], fill=BARK)

# The one-pixel outline: every transparent pixel next to a drawn one.
src = im.copy()
px = src.load()
out = im.load()
for y in range(H):
    for x in range(W):
        if px[x, y][3]:
            continue
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < W and 0 <= ny < H and px[nx, ny][3]:
                out[x, y] = INK
                break

im.save(OUT)
print("wrote", OUT, im.size)
