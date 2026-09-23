"""
MACARIO - _dev/tools/draw-nanay-walk.py

Block 54. Nanay walking in profile, drawn from nothing with Pillow:
her head, long hair, cream blouse, blue tapis, dark skirt and sandals,
in the colours of her commissioned sheet, eight frames of a walk to the
right. The engine mirrors it for a walk to the left (faceMovement).

It replaces Block 53's walk, which moved her front-facing pixels and so
walked toward the camera while travelling sideways. A true side view
cannot be made from front-facing art, so this one is drawn: flat pixel
shading and a dark outline, the way the rest of the cast is outlined,
at a lower level of detail than the artist's painting. It is a
stand-in until the artist draws her walk.

Usage, from the repository root (needs Pillow, dev-time only):

    python3 _dev/tools/draw-nanay-walk.py

Writes assets/sprites/characters/nanay-walk.png: 8 frames of 160px on a
4 by 2 grid, measured with measure-sprite.js like any sheet.
"""
import math
from PIL import Image, ImageDraw

OUT = "assets/sprites/characters/nanay-walk.png"
CELL = 160
FRAMES = 8
COLUMNS = 4

# Sampled from nanay.png.
SKIN = (178, 108, 66)
SKIN_DARK = (140, 80, 48)
HAIR = (30, 24, 24)
HAIR_LIGHT = (58, 46, 44)
BLOUSE = (226, 214, 190)
BLOUSE_DARK = (186, 170, 146)
TAPIS = (44, 62, 110)
TAPIS_DARK = (30, 42, 78)
SKIRT = (54, 42, 36)
SKIRT_DARK = (38, 30, 26)
SANDAL = (96, 58, 34)
OUTLINE = (33, 22, 17)

FEET_Y = 150  # the soles, in the cell


def poly(d, pts, fill):
    d.polygon([(round(x), round(y)) for x, y in pts], fill=fill)


def arm(d, shoulder, angle, length, color, hand):
    """A sleeve-less forearm from the elbow down, swung by angle (radians,
    0 straight down, positive forward)."""
    sx, sy = shoulder
    ex = sx + math.sin(angle) * length * 0.5
    ey = sy + math.cos(angle) * length * 0.5
    hx = sx + math.sin(angle * 1.3) * length
    hy = sy + math.cos(angle * 1.3) * length
    d.line([(sx, sy), (ex, ey)], fill=color, width=5)
    d.line([(ex, ey), (hx, hy)], fill=color, width=4)
    d.ellipse([hx - 3, hy - 3, hx + 3, hy + 3], fill=hand)


def frame(i):
    t = 2 * math.pi * i / FRAMES
    im = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    bob = round(abs(math.sin(t)) * -1.5)  # up a little between steps
    cx = 78  # the body's middle

    # Far arm, behind everything, swinging opposite the near one.
    arm(d, (cx - 1, 64 + bob), -0.45 * math.sin(t), 30, SKIN_DARK, SKIN_DARK)

    # Hair falling down her back, behind the body.
    poly(d, [(cx - 6, 34 + bob), (cx - 14, 50 + bob), (cx - 15, 80 + bob),
             (cx - 9, 92 + bob), (cx - 3, 80 + bob), (cx, 50 + bob)], HAIR)

    # Feet: each steps forward and back under the hem. Walking right, the
    # one in front is the far foot on the first half of the cycle.
    for phase, col in ((t, SANDAL), (t + math.pi, SANDAL)):
        fx = cx + 9 * math.cos(phase)
        lift = max(0.0, math.sin(phase)) * 3
        fy = FEET_Y - lift
        poly(d, [(fx - 5, fy - 5), (fx + 7, fy - 4), (fx + 9, fy), (fx - 5, fy)], SKIN)
        d.line([(fx - 5, fy), (fx + 9, fy)], fill=col, width=2)
        d.line([(fx - 1, fy - 5), (fx + 3, fy - 2)], fill=col, width=1)

    # Skirt: narrow at the waist, full at the hem, the hem swinging with
    # the stride so it reads as legs moving under it.
    sway = 5 * math.cos(t)
    kick = 3 * abs(math.sin(t))
    top = 98 + bob
    hem = 146
    poly(d, [(cx - 12, top), (cx + 12, top), (cx + 17 + kick + sway * 0.4, hem),
             (cx + 4, hem + 1), (cx - 17 + sway * 0.4, hem)], SKIRT)
    # Folds.
    for k, off in enumerate((-8, -1, 6)):
        x0 = cx + off
        d.line([(x0, top + 8), (x0 + sway * 0.3 + off * 0.35, hem - 2)], fill=SKIRT_DARK, width=1)

    # Blouse: shoulders to waist, loose.
    poly(d, [(cx - 11, 60 + bob), (cx + 9, 58 + bob), (cx + 13, 72 + bob),
             (cx + 12, 98 + bob), (cx - 12, 98 + bob), (cx - 13, 72 + bob)], BLOUSE)
    d.line([(cx - 11, 70 + bob), (cx - 11, 96 + bob)], fill=BLOUSE_DARK, width=2)
    # Short puffed sleeve over the near shoulder.
    d.ellipse([cx - 4, 58 + bob, cx + 10, 74 + bob], fill=BLOUSE)
    d.arc([cx - 4, 58 + bob, cx + 10, 74 + bob], 90, 200, fill=BLOUSE_DARK, width=1)

    # Tapis: the blue wrap over the hips, tied at the front with a tail.
    poly(d, [(cx - 13, 92 + bob), (cx + 13, 90 + bob), (cx + 15, 110 + bob),
             (cx + 2, 116 + bob), (cx - 14, 108 + bob)], TAPIS)
    d.line([(cx - 13, 106 + bob), (cx + 14, 104 + bob)], fill=TAPIS_DARK, width=1)
    poly(d, [(cx + 11, 96 + bob), (cx + 16, 98 + bob), (cx + 16 + sway * 0.3, 118 + bob),
             (cx + 12, 118 + bob)], TAPIS_DARK)

    # Neck and head, facing right.
    d.rectangle([cx - 2, 50 + bob, cx + 4, 60 + bob], fill=SKIN)
    d.ellipse([cx - 10, 29 + bob, cx + 10, 53 + bob], fill=SKIN)
    # Nose and chin in profile.
    poly(d, [(cx + 8, 39 + bob), (cx + 11, 43 + bob), (cx + 8, 45 + bob)], SKIN)
    poly(d, [(cx + 6, 48 + bob), (cx + 7, 51 + bob), (cx + 2, 53 + bob)], SKIN)
    # Hair over the crown and the back of the head, parted to show the
    # face, with a lighter streak.
    poly(d, [(cx - 10, 42 + bob), (cx - 9, 32 + bob), (cx - 2, 28 + bob), (cx + 6, 29 + bob),
             (cx + 10, 35 + bob), (cx + 4, 35 + bob), (cx - 1, 38 + bob), (cx - 3, 50 + bob),
             (cx - 9, 52 + bob)], HAIR)
    d.line([(cx - 5, 31 + bob), (cx + 4, 31 + bob)], fill=HAIR_LIGHT, width=1)
    # Eye, brow and mouth.
    d.point((cx + 5, 40 + bob), fill=HAIR)
    d.line([(cx + 3, 38 + bob), (cx + 7, 38 + bob)], fill=HAIR, width=1)
    d.point((cx + 6, 48 + bob), fill=SKIN_DARK)
    # Ear.
    d.point((cx - 1, 42 + bob), fill=SKIN_DARK)

    # Near arm, in front of the body.
    arm(d, (cx + 3, 68 + bob), 0.45 * math.sin(t), 28, SKIN, SKIN)
    # The sleeve over the top of the near arm.
    d.ellipse([cx - 3, 59 + bob, cx + 9, 73 + bob], fill=BLOUSE)
    d.arc([cx - 3, 59 + bob, cx + 9, 73 + bob], 60, 200, fill=BLOUSE_DARK, width=1)

    return outline(im)


def outline(im):
    """A one-pixel dark outline around everything drawn, like the
    commissioned sheets'."""
    a = im.getchannel("A")
    px = a.load()
    w, h = im.size
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    op = out.load()
    for y in range(h):
        for x in range(w):
            if px[x, y]:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and px[nx, ny]:
                    op[x, y] = OUTLINE + (255,)
                    break
    out.alpha_composite(im)
    return out


if __name__ == "__main__":
    rows = math.ceil(FRAMES / COLUMNS)
    sheet = Image.new("RGBA", (COLUMNS * CELL, rows * CELL), (0, 0, 0, 0))
    for i in range(FRAMES):
        sheet.paste(frame(i), ((i % COLUMNS) * CELL, (i // COLUMNS) * CELL))
    sheet.save(OUT, optimize=True)
    print("wrote", OUT)
