# =============================================================
# MACARIO — _dev/tools/fit-skin.py
#
# Puts a skin's still exactly where Macario's template still stands
# (Block 154). skeleton.js reads every skin with the template's own
# bones and outlines (_dev/player-lab/macario.js), so a skin must stand
# on the template to within a pixel or two: the general's uniform did.
# The ChatGPT redraws of 9 Nov 2026 came back 6 to 32 px off and a
# little larger or smaller. This moves and scales the picture, and
# nothing else: not one pixel of the drawing is changed (CLAUDE.md, no
# art that is not the artist's), the way key-still.js crops and shrinks.
#
# Three marks, read from the alpha alone: the top of the head, the
# soles, and the tip of the nose (the furthest point forward in the
# head's rows). Height sets the scale, the head's top and the nose set
# where he stands. The toes are printed as a check: on a good fit they
# land within a few px of the template's.
#
# Run (Python 3.12 and Pillow; -I so nothing beside the picture loads):
#   python -I _dev/tools/fit-skin.py <delivered.png> <out.png>
# =============================================================

import sys
from PIL import Image

TEMPLATE = "_dev/player-lab/macario-still.png"
CANVAS = (1024, 1536)


def marks(im):
    a = im.split()[3].point(lambda v: 255 if v > 8 else 0)
    l, t, r, b = a.getbbox()
    h = b - t
    px = a.load()

    def right(y0, y1):
        best = 0
        for y in range(y0, y1):
            for x in range(r - 1, l - 1, -1):
                if px[x, y]:
                    best = max(best, x)
                    break
        return best
    # The nose: the head's rows, a tenth of his height below the crown.
    nose = right(t + int(h * 0.06), t + int(h * 0.12))
    toe = right(b - int(h * 0.02), b)
    return {"top": t, "sole": b, "nose": nose, "toe": toe}


def main():
    src, out = sys.argv[1], sys.argv[2]
    tm = marks(Image.open(TEMPLATE).convert("RGBA"))
    im = Image.open(src).convert("RGBA")
    sm = marks(im)
    s = (tm["sole"] - tm["top"]) / (sm["sole"] - sm["top"])
    big = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    dx = round(tm["nose"] - sm["nose"] * s)
    dy = round(tm["top"] - sm["top"] * s)
    canvas = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    canvas.alpha_composite(big, (max(dx, 0), max(dy, 0)),
                           (max(-dx, 0), max(-dy, 0)))
    canvas.save(out)
    fm = marks(canvas)
    print(f"{src}: scale {s:.4f}, moved {dx}, {dy}")
    for k in ("top", "sole", "nose", "toe"):
        print(f"  {k:5} template {tm[k]:5}  fitted {fm[k]:5}  off {fm[k] - tm[k]:+d}")


if __name__ == "__main__":
    main()
