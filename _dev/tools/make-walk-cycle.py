"""
MACARIO - _dev/tools/make-walk-cycle.py

Block 53. A walk cycle made from one still frame of a commissioned
sheet, for a character the artist drew standing but not walking. It is
not a new drawing: every pixel is the artist's, moved. Per frame:

  - the feet are cut from the frame and stepped in turn, the swinging
    foot lifted and carried forward while the planted one slides back,
    so the walk reads under a long skirt;
  - the body leans a little the way she walks, more at the head than at
    the hem;
  - the skirt's hem kicks forward as each leg swings through;
  - the whole body dips a pixel or two as each foot lands, drawn over
    the feet so the ankles never show a gap under the hem.

SUPERSEDED for Nanay by Block 54 (draw-nanay-walk.py): a front-facing
walk reads as walking toward the camera, not sideways, which is what the
proponent rejected. Kept for a character who should step in place while
facing the viewer; it writes <name>-walk-front.png so it can never
overwrite a real side-view walk.

The art is front-facing, so the result is a front-facing walk that leans
and steps toward the right. The engine mirrors it for a walk to the left
(faceMovement), which is why everything here moves toward +x.

Usage, from the repository root (needs Pillow, dev-time only):

    python3 _dev/tools/make-walk-cycle.py nanay

Each character is one entry in CHARACTERS: which sheet and frame to start
from, where the feet are, where the skirt or trousers begin, and where
the body splits between the two feet, all in the cell's own pixels. The
output is <name>-walk-front.png beside the source, 8 frames on a 4 by 2 grid
of the same cell size, which measure-sprite.js measures like any sheet.
"""
import math
import sys
from PIL import Image

CHARS = "assets/sprites/characters/"
CELL = 256
FRAMES = 8
COLUMNS = 4

CHARACTERS = {
    # Nanay's sheet: 5 columns, frame 0. Measured from her alpha rows:
    # the ankles start at 191 and the soles end at 210; the skirt runs
    # from the sash's lower edge (141) to its hem (190); the feet part
    # at x 128.
    "nanay": {
        "src": "nanay.png", "columns": 5, "frame": 0,
        "feet_top": 191, "feet_bottom": 211, "split_x": 128,
        "skirt_top": 141, "hem": 190, "head_top": 45,
        "stride": 5,   # px each foot travels either side of its rest
        "lift": 6,     # px the swinging foot rises
        "lean": 2,     # px the head leans ahead of the hem
        "kick": 3,     # px the hem swings forward with a passing leg
        "bob": 2,      # px the body dips on each landing
    },
}


def cell(sheet, columns, index):
    col, row = index % columns, index // columns
    return sheet.crop((col * CELL, row * CELL, col * CELL + CELL, row * CELL + CELL))


def shift_rows(layer, offset_for_row, top, bottom):
    """Moves each row in [top, bottom) sideways by offset_for_row(y)."""
    out = layer.copy()
    for y in range(top, bottom):
        dx = offset_for_row(y)
        if not dx:
            continue
        strip = layer.crop((0, y, CELL, y + 1))
        out.paste((0, 0, 0, 0), (0, y, CELL, y + 1))
        out.paste(strip, (dx, y))
    return out


def walk_frames(c):
    sheet = Image.open(CHARS + c["src"]).convert("RGBA")
    base = cell(sheet, c["columns"], c["frame"])

    # Two layers: everything above the ankles, and each foot on its own.
    body = base.copy()
    body.paste((0, 0, 0, 0), (0, c["feet_top"], CELL, CELL))
    feet = base.crop((0, c["feet_top"], CELL, CELL))
    left = feet.copy()
    left.paste((0, 0, 0, 0), (c["split_x"], 0, CELL, feet.height))
    right = feet.copy()
    right.paste((0, 0, 0, 0), (0, 0, c["split_x"], feet.height))

    frames = []
    for i in range(FRAMES):
        t = 2 * math.pi * i / FRAMES
        # The left foot swings forward while sin t > 0 and is planted,
        # sliding back, while it is negative; the right foot is the
        # opposite half of the cycle.
        lx = round(-c["stride"] * math.cos(t))
        rx = round(c["stride"] * math.cos(t))
        ly = -round(c["lift"] * max(0.0, math.sin(t)))
        ry = -round(c["lift"] * max(0.0, -math.sin(t)))

        span = c["hem"] - c["head_top"]
        kick = c["kick"] * abs(math.sin(t))
        skirt_span = max(1, c["hem"] - c["skirt_top"])

        def offset(y):
            lean = c["lean"] * (c["hem"] - y) / span if y <= c["hem"] else 0
            hem = kick * (y - c["skirt_top"]) / skirt_span if y >= c["skirt_top"] else 0
            return round(lean + hem)

        moved = shift_rows(body, offset, 0, c["feet_top"])
        dip = round(c["bob"] * abs(math.cos(t)))

        frame = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
        frame.alpha_composite(left, (lx, c["feet_top"] + ly))
        frame.alpha_composite(right, (rx, c["feet_top"] + ry))
        # Over the feet, so a dip hides the ankles rather than opening a
        # gap between the hem and the feet.
        frame.alpha_composite(moved, (0, dip))
        frames.append(frame)
    return frames


def build(name):
    c = CHARACTERS[name]
    frames = walk_frames(c)
    rows = math.ceil(FRAMES / COLUMNS)
    sheet = Image.new("RGBA", (COLUMNS * CELL, rows * CELL), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        sheet.paste(f, ((i % COLUMNS) * CELL, (i // COLUMNS) * CELL))
    path = CHARS + name + "-walk-front.png"
    sheet.save(path, optimize=True)
    print("wrote", path, "(%d frames, %d columns)" % (FRAMES, COLUMNS))


if __name__ == "__main__":
    for name in sys.argv[1:] or CHARACTERS:
        build(name)
