"""
MACARIO - _dev/tools/make-shadow-tree.py

Draws the shadow trees that stand over every join between two backdrop
panels (CLAUDE.md, Blocks 43, 49 and 50). Four models in silhouette, two
coconut palms and two ordinary broadleaf trees, each in a box 440 by
1200 anchored at the road.

The trunk is what hides the join, so it is thick (about 130 world px at
head height). The crowns sit low enough to be inside a sideways phone's
screen, which shows only about the lowest 590 of the 1200 (Block 70;
Block 50 hung them higher, and on a phone the four looked the same),
each at its own height, and still well over every head. Every model's trunk base is centred on the join, whatever way
the tree leans above it, because the road is where a student looks.

The output is pasted into js/game.js as SHADOW_TREE_URLS rather than
shipped as files, so a slow connection cannot leave a join bare. Rerun
this to change the trees, then paste trees.js back into that constant.

Usage, from the repository root (needs nothing but Python):

    python3 _dev/tools/make-shadow-tree.py [outdir]
"""
import math, sys, os

W, H = 440, 1200
CX = 220
BASE_Y = H                      # the road
INK = "#0c1a0e"  # one flat tone: these are silhouettes, not drawings


def bez(p0, p1, p2, t):
    x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0]
    y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
    return x, y


def poly(pts):
    return "M%.0f %.0f " % pts[0] + " ".join("L%.0f %.0f" % p for p in pts[1:]) + " Z"


# --- the trunk, which is most of the tree ---
def trunk(top, base_half, top_half, lean, flare=22, wobble=(4.0, 3.1, 0.0), neck=0, steps=40):
    """A thick trunk from the road up to top, leaning by lean at the crown.

    The width tapers, and a slow wobble is added on top of the taper: in a
    flat silhouette a perfectly straight edge reads as a cut-out, and this
    is the whole of what a phone shows, so the outline has to carry it."""
    amp, freq, phase = wobble
    base = (CX, BASE_Y)
    ctrl = (CX - lean * 0.45, BASE_Y - (BASE_Y - top[1]) * 0.55)
    left, right = [], []
    for i in range(steps + 1):
        t = i / steps
        x, y = bez(base, ctrl, top, t)
        half = top_half + (base_half - top_half) * (1 - t) ** 1.25 + flare * (1 - t) ** 7
        half += neck * math.exp(-((t - 0.90) ** 2) / (2 * 0.06 ** 2))
        left.append((x - half - amp * math.sin(freq * t + phase), y))
        right.append((x + half + amp * math.sin(freq * t * 1.3 + phase + 1.7), y))
    d = poly(left + right[::-1])
    # Roots flaring into the ground, so the trunk sits in the road rather
    # than on it: three of them, uneven, none reaching past the base's own
    # width by more than half again.
    #
    # Block 93. Every root is wound the same way round as the trunk. They
    # share one path, whose fill is nonzero, so a root wound the other way
    # cancelled the trunk where they overlapped and cut a triangle out of
    # the base: the right-hand two did, on every tree, until this.
    for side, reach, rise in ((-1, 1.52, 30), (1, 1.34, 24), (1, 1.72, 16)):
        pts = [
            (CX + side * base_half * reach, BASE_Y),
            (CX + side * base_half * (reach * 0.66), BASE_Y - rise),
            (CX + side * base_half * 0.34, BASE_Y - rise * 0.35),
            (CX, BASE_Y),
        ]
        d += " " + poly(pts if side < 0 else pts[::-1])
    return d


# --- one frond: a drooping spine with leaflets down both sides ---
def frond(origin, angle, length, droop, leaflet, steps=16):
    a = math.radians(angle)
    tip = (origin[0] + math.cos(a) * length, origin[1] + math.sin(a) * length + droop)
    ctrl = (origin[0] + math.cos(a) * length * 0.55,
            origin[1] + math.sin(a) * length * 0.55 - droop * 0.35)
    spine = [bez(origin, ctrl, tip, i / steps) for i in range(steps + 1)]
    side = []
    for s in (1, -1):
        pts = []
        for i, (x, y) in enumerate(spine):
            t = i / (len(spine) - 1)
            if i == 0 or i == len(spine) - 1:
                pts.append((x, y))
                continue
            dx = spine[i + 1][0] - spine[i - 1][0]
            dy = spine[i + 1][1] - spine[i - 1][1]
            n = math.hypot(dx, dy) or 1
            w = leaflet * math.sin(math.pi * min(1, t * 1.15)) ** 0.7
            w *= 0.78 + 0.32 * (i % 2)
            pts.append((x - dy / n * w * s, y + dx / n * w * s))
        side.append(pts if s == 1 else pts[::-1])
    return poly(side[0] + side[1])


def svg(paths, circles=()):
    """One group, one colour. A silhouette is read by its outline, so the
    shapes below carry the detail (a frond's saw edge, a canopy's lobes,
    the wobble down a trunk) rather than a second tone inside it."""
    body = '<g fill="%s">' % INK
    body += "".join('<path d="%s"/>' % p for p in paths)
    body += "".join('<circle cx="%d" cy="%d" r="%d"/>' % c for c in circles)
    body += "</g>"
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d">' % (W, H)
            + body + "</svg>")


# --- model 1 and 2: coconut palms, leaning opposite ways ---
def palm(lean, crown_y, specs, nuts, wobble):
    top = (CX + lean, crown_y + 46)
    crown = (CX + lean, crown_y)
    paths = [trunk(top, 64, 34, lean, wobble=wobble, neck=13)]
    paths += [frond(crown, a, l, d, w) for a, l, d, w in specs]
    # The fronds all leave one point and the sky showed through between
    # them; this closes the middle of the crown.
    circles = [(crown[0], crown[1] + 6, 44), (crown[0], crown[1] - 26, 32),
               (crown[0], crown[1] - 56, 24), (crown[0], crown[1] - 84, 16)]
    circles += [(crown[0] + dx, crown[1] + dy, r) for dx, dy, r in nuts]
    return svg(paths, circles)


# Each frond is angle, length, droop and leaflet width. The last two of
# each list are old fronds hanging down the crownshaft, which is what
# breaks the fan into a tree rather than a parasol.
PALM_A = palm(
    26, 720,
    [(-176, 244, 150, 27), (-154, 266, 176, 32), (-130, 252, 198, 33),
     (-104, 226, 214, 31), (-78, 232, 210, 31), (-56, 260, 188, 33),
     (-32, 270, 168, 31), (-10, 246, 146, 26), (-196, 226, 136, 25),
     (-158, 150, 206, 17), (-26, 138, 192, 15)],
    [(-20, 42, 12), (0, 50, 12), (20, 38, 11)],
    (4.5, 3.4, 0.6))

PALM_B = palm(
    -30, 770,
    [(-4, 240, 148, 27), (-26, 262, 174, 32), (-50, 250, 196, 33),
     (-76, 222, 212, 31), (-102, 228, 208, 31), (-124, 256, 186, 33),
     (-148, 266, 166, 31), (-170, 242, 144, 26), (16, 222, 134, 25),
     (-22, 146, 202, 17), (-154, 134, 188, 15)],
    [(18, 44, 12), (-2, 50, 12), (-20, 36, 11)],
    (3.6, 4.2, 2.3))


# --- model 3 and 4: ordinary broadleaf trees ---
def tuft(cx, cy, angle, length, width):
    """A spray of leaves off the edge of a canopy. Circles alone make a
    smooth arc, which reads as a cloud; these are what make it foliage."""
    a = math.radians(angle)
    tip = (cx + math.cos(a) * length, cy + math.sin(a) * length)
    nx, ny = -math.sin(a), math.cos(a)
    pts = [tip]
    n = 5
    for side in (1, -1):
        for i in range(n, 0, -1) if side == 1 else range(1, n + 1):
            t = i / (n + 1)
            w = width * math.sin(math.pi * t) * (0.7 + 0.3 * (i % 2))
            pts.append((cx + math.cos(a) * length * t + nx * w * side,
                        cy + math.sin(a) * length * t + ny * w * side))
    return poly(pts)


def canopy_tufts(lobes, count):
    out = []
    for dx, dy, r in lobes[:count]:
        a = math.degrees(math.atan2(-dy, dx))
        out.append((dx, dy, a, r * 0.95 + 26, r * 0.30))
    return out


def broadleaf(lean, crown_y, lobes, fringe, limbs, wobble):
    top = (CX + lean, crown_y + 40)
    paths = [trunk(top, 70, 42, lean, flare=26, wobble=wobble)]
    # Limbs leaving the trunk into the canopy, forking where a phone shows
    # them, under the canopy's edge.
    for bx, by, ex, ey, w0, w1 in limbs:
        paths.append(poly([(CX + bx - w0, BASE_Y - by), (CX + ex - w1, BASE_Y - ey),
                           (CX + ex + w1, BASE_Y - ey), (CX + bx + w0, BASE_Y - by - 30)]))
    paths += [tuft(CX + lean + dx, crown_y - dy, a, l, w)
              for dx, dy, a, l, w in canopy_tufts(lobes, 7)]
    # A lobe sitting on the trunk's top, so no sky shows in the fork
    # between the trunk, the limbs and the canopy above them.
    circles = [(CX + lean, crown_y + 74, 92)]
    circles += [(CX + lean + dx, crown_y - dy, r) for dx, dy, r in lobes]
    # Leaves hanging below the canopy's edge, which is what a student
    # actually sees at the top of a phone screen.
    circles += [(CX + lean + dx, crown_y - dy, r) for dx, dy, r in fringe]
    return svg(paths, circles)


BROAD_A = broadleaf(
    18, 640,
    [(-150, 40, 74), (-80, 96, 96), (10, 122, 104), (96, 84, 90), (156, 30, 70),
     (-40, 10, 78), (46, 6, 74), (-110, -22, 56), (110, -26, 54), (0, 176, 70),
     (-70, 158, 56), (74, 154, 54)],
    [(-124, -54, 38), (-46, -70, 44), (36, -72, 40), (116, -50, 36), (-4, -30, 48)],
    [(-18, 380, -96, 560, 22, 17), (16, 420, 90, 590, 20, 16)],
    (5.0, 2.7, 1.2))

BROAD_B = broadleaf(
    -22, 690,
    [(140, 34, 72), (74, 92, 94), (-16, 120, 102), (-102, 80, 88), (-158, 26, 68),
     (34, 8, 76), (-52, 4, 72), (104, -24, 54), (-116, -28, 52), (-6, 170, 68),
     (64, 150, 56), (-80, 148, 52)],
    [(118, -52, 36), (40, -68, 42), (-42, -70, 38), (-120, -48, 34), (2, -28, 46)],
    [(16, 330, 94, 520, 22, 17), (-18, 370, -88, 550, 20, 16)],
    (4.2, 3.6, 0.3))


TREES = [("palm-a", PALM_A), ("broad-a", BROAD_A), ("palm-b", PALM_B), ("broad-b", BROAD_B)]

outdir = sys.argv[1] if len(sys.argv) > 1 else "."
os.makedirs(outdir, exist_ok=True)
lines = []
for name, s in TREES:
    open(os.path.join(outdir, name + ".svg"), "w").write(s)
    lines.append('  "%s",' % s.replace('"', '\\"'))
    print(name, len(s))
open(os.path.join(outdir, "trees.js"), "w").write(
    "const SHADOW_TREE_SVGS = [\n" + "\n".join(lines) + "\n];\n")
