"""
MACARIO - _dev/key-black.py

Turns a sprite sheet delivered as a JPEG on a black background into a PNG
with a transparent one. A JPEG has no alpha channel, so drawn as it is the
character would stand inside a black rectangle.

Not a colour key over the whole image: the character's own hair, vest and
outlines are nearly black too. Instead the background is flood filled from
the edges of every cell, through pixels no brighter than THRESHOLD, so only
darkness that touches the edge of the cell goes. A dark pixel inside the
drawing, walled off by lighter ones, stays. The flood is per cell so a
sword that reaches a cell edge cannot let it leak into a neighbour.

Usage, from the repository root (needs Pillow, which the game itself never
does; this runs once per delivered sheet, not at play time):

    python3 _dev/key-black.py "Assets/Act 1/Muslim_Walk.jpg" --columns=4 --rows=3

writes Assets/Act 1/Muslim_Walk.png beside the original, which is kept.
Then measure the PNG with measure-sprite.js like any other sheet.

The better fix is a PNG export from the artist with transparency; this
exists so a JPEG delivery does not block the build while that is asked
for.
"""
import sys
from collections import deque
from PIL import Image

THRESHOLD = 32  # max(r, g, b) at or below this counts as background


def key(path, columns, rows):
    src = Image.open(path).convert("RGB")
    w, h = src.size
    cw, ch = w // columns, h // rows
    px = src.load()
    out = Image.new("RGBA", (w, h))
    op = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            op[x, y] = (r, g, b, 255)

    dark = lambda x, y: max(px[x, y]) <= THRESHOLD
    for cy in range(rows):
        for cx in range(columns):
            x0, y0 = cx * cw, cy * ch
            x1, y1 = x0 + cw - 1, y0 + ch - 1
            seen = set()
            queue = deque()
            for x in range(x0, x1 + 1):
                queue.extend([(x, y0), (x, y1)])
            for y in range(y0, y1 + 1):
                queue.extend([(x0, y), (x1, y)])
            while queue:
                x, y = queue.popleft()
                if (x, y) in seen or not (x0 <= x <= x1 and y0 <= y <= y1):
                    continue
                seen.add((x, y))
                if not dark(x, y):
                    continue
                op[x, y] = (0, 0, 0, 0)
                queue.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])
    target = path.rsplit(".", 1)[0] + ".png"
    out.save(target, optimize=True)
    print("wrote", target)


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    opts = dict(a[2:].split("=") for a in sys.argv[1:] if a.startswith("--"))
    key(args[0], int(opts["columns"]), int(opts["rows"]))
