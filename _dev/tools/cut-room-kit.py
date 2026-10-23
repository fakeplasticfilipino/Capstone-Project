"""
MACARIO - _dev/tools/cut-room-kit.py

Cuts the room kits of ART.md (room-walls.png, room-floors.png and a room's
<room>-kit.png, delivered into _dev/parallax-art/) into the pictures the
rooms are built from. Needs Pillow and numpy, as key-black.py needs
Pillow; it runs once per delivered sheet, never at play time.

    python3 _dev/tools/cut-room-kit.py --list _dev/parallax-art/pulungan-kit.png
        prints the sheet's pieces, numbered left to right within rows
        from the top, with their boxes

    python3 _dev/tools/cut-room-kit.py piece <sheet> <out-dir> <height> 3=mesa 5=pinto ...
        writes each numbered piece, cropped to its own pixels (a
        neighbour's corner inside its box is left out), as <name>.png,
        <height> pixels tall (1.5 times the height the room draws it)

    python3 _dev/tools/cut-room-kit.py wall <sheet> <n> <out.png>
        the nth wall bay cut so copies set side by side meet in one post:
        its left post is dropped and its right one kept

    python3 _dev/tools/cut-room-kit.py floor <sheet> <n> <out.png>
        the nth floor strip with its ragged ends cut off and its right end
        faded into its left, so it repeats without a seam

Then node _dev/tools/prepare.js shrinks what landed in assets/.
"""
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

ALPHA = 24     # at or below this a pixel counts as background
GROW = 9       # pixels joined across this gap belong to one piece (a flame and its candle)
MIN_AREA = 2000


def pieces(path):
    im = Image.open(path).convert("RGBA")
    seen = np.array(im)[:, :, 3] > ALPHA
    mask = np.array(Image.fromarray((seen * 255).astype("uint8")).filter(ImageFilter.MaxFilter(GROW))) > 0
    h, w = mask.shape
    label = np.zeros((h, w), np.int32)
    found = []
    for y in range(h):
        for x in range(w):
            if not mask[y, x] or label[y, x]:
                continue
            n = len(found) + 1
            label[y, x] = n
            queue = deque([(y, x)])
            x0 = x1 = x
            y0 = y1 = y
            area = 0
            while queue:
                cy, cx = queue.popleft()
                area += 1
                x0, x1, y0, y1 = min(x0, cx), max(x1, cx), min(y0, cy), max(y1, cy)
                for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not label[ny, nx]:
                        label[ny, nx] = n
                        queue.append((ny, nx))
            found.append({"n": n, "box": (x0, y0, x1 + 1, y1 + 1), "area": area})
    found = [p for p in found if p["area"] >= MIN_AREA]
    # Rows: a piece whose top is above the bottom of the row's first piece
    # joins that row. Then left to right.
    found.sort(key=lambda p: p["box"][1])
    rows = []
    for p in found:
        if rows and p["box"][1] < rows[-1][0]["box"][3] - 40:
            rows[-1].append(p)
        else:
            rows.append([p])
    ordered = [p for row in rows for p in sorted(row, key=lambda p: p["box"][0])]
    return im, label, seen, ordered


def cut(im, label, seen, piece):
    x0, y0, x1, y1 = piece["box"]
    own = (label[y0:y1, x0:x1] == piece["n"]) & seen[y0:y1, x0:x1]
    rgba = np.array(im)[y0:y1, x0:x1].copy()
    rgba[:, :, 3] = np.where(own, rgba[:, :, 3], 0)
    ys, xs = np.nonzero(rgba[:, :, 3] > ALPHA)
    return Image.fromarray(rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1])


def resized(img, height):
    w = max(1, round(img.width * height / img.height))
    return img.resize((w, height), Image.LANCZOS)


def wall(img):
    a = np.array(img).astype(float)
    h, w = a.shape[:2]
    # The left post's inner edge: the darkest column at least 20 pixels in
    # from where the wall begins (its outline is dark too).
    band = a[int(h * 0.3):int(h * 0.8)]
    lum = band[:, :, :3].mean(axis=(0, 2))
    start = int(np.argmax(band[:, :, 3].mean(axis=0) > 200)) + 20
    left = int(np.argmin(lum[start:w // 6])) + start
    return img.crop((left + 1, 0, w, h))


def floor(img, fade=60):
    w = img.width
    strip = np.array(img.crop((int(w * 0.03), 0, int(w * 0.97), img.height))).astype(float)
    t = np.linspace(0, 1, fade)[None, :, None]
    head = strip[:, :fade].copy()
    strip[:, -fade:] = strip[:, -fade:] * (1 - t) + head * t
    return Image.fromarray(strip[:, :-fade].round().astype("uint8"))


def main(args):
    if args[0] == "--list":
        _, _, _, ordered = pieces(args[1])
        for i, p in enumerate(ordered, 1):
            print(i, p["box"], p["area"])
        return
    kind, sheet = args[0], args[1]
    im, label, seen, ordered = pieces(sheet)
    if kind == "piece":
        out, height = args[2], int(args[3])
        for spec in args[4:]:
            i, name = spec.split("=")
            resized(cut(im, label, seen, ordered[int(i) - 1]), height).save(f"{out}/{name}.png")
    elif kind in ("wall", "floor"):
        img = cut(im, label, seen, ordered[int(args[2]) - 1])
        (wall if kind == "wall" else floor)(img).save(args[3])


if __name__ == "__main__":
    main(sys.argv[1:])
