"""
MACARIO - _dev/tools/make-shadow-tree.py

Draws the shadow trees that stand over every join between two backdrop
panels (CLAUDE.md, Blocks 43, 49 and 50). Four models in silhouette, two
coconut palms and two ordinary broadleaf trees, each in a box 440 by
1200 anchored at the road.

They are mostly trunk on purpose: the trunk is what hides the join, so
it is thick (about 130 world px at head height) and long, and the crown sits
high enough that a phone shows only the lowest leaves at the top of the
screen. Every model's trunk base is centred on the join, whatever way
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
DARK, LIGHT = "#0c1a0e", "#14301a"


def bez(p0, p1, p2, t):
    x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0]
    y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]
    return x, y


def poly(pts):
    return "M%.0f %.0f " % pts[0] + " ".join("L%.0f %.0f" % p for p in pts[1:]) + " Z"


# --- the trunk, which is most of the tree ---
def trunk(top, base_half, top_half, lean, flare=22, steps=26):
    """A fat trunk from the road up to top, leaning by lean at the crown."""
    base = (CX, BASE_Y)
    ctrl = (CX - lean * 0.45, BASE_Y - (BASE_Y - top[1]) * 0.55)
    left, right = [], []
    for i in range(steps + 1):
        t = i / steps
        x, y = bez(base, ctrl, top, t)
        half = top_half + (base_half - top_half) * (1 - t) ** 1.25 + flare * (1 - t) ** 7
        left.append((x - half, y))
        right.append((x + half, y))
    d = poly(left + right[::-1])
    # Roots flaring into the ground, so the trunk sits in the road rather
    # than on it. They stay inside the base's own width.
    for dx in (-1, 1):
        d += " " + poly([
            (CX + dx * (base_half + 34), BASE_Y),
            (CX + dx * (base_half + 8), BASE_Y - 30),
            (CX + dx * (base_half - 20), BASE_Y - 8),
            (CX, BASE_Y),
        ])
    return d


def trunk_rings(top, base_half, top_half, lean, count, steps=26):
    """Old leaf scars across a palm's trunk: a lighter tone, so a trunk
    this wide reads as bark rather than as a hole cut in the painting."""
    base = (CX, BASE_Y)
    ctrl = (CX - lean * 0.45, BASE_Y - (BASE_Y - top[1]) * 0.55)
    out = []
    for i in range(count):
        t = 0.08 + 0.80 * (i / max(1, count - 1))
        x, y = bez(base, ctrl, top, t)
        half = (top_half + (base_half - top_half) * (1 - t) ** 1.25) * 0.86
        h = 7
        out.append(poly([(x - half, y), (x + half, y - 5), (x + half, y - 5 + h), (x - half, y + h)]))
    return out


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


def svg(parts_dark, parts_light, circles_dark=(), circles_light=()):
    body = '<g fill="%s">' % DARK
    body += "".join('<path d="%s"/>' % p for p in parts_dark)
    body += "".join('<circle cx="%d" cy="%d" r="%d"/>' % c for c in circles_dark)
    body += "</g>"
    if parts_light or circles_light:
        body += '<g fill="%s">' % LIGHT
        body += "".join('<path d="%s"/>' % p for p in parts_light)
        body += "".join('<circle cx="%d" cy="%d" r="%d"/>' % c for c in circles_light)
        body += "</g>"
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d">' % (W, H)
            + body + "</svg>")


# --- model 1 and 2: coconut palms, leaning opposite ways ---
def palm(lean, crown_y, specs, nuts):
    top = (CX + lean, crown_y + 46)
    crown = (CX + lean, crown_y)
    dark = [trunk(top, 64, 34, lean)]
    dark += [frond(crown, a, l, d, w) for a, l, d, w in specs]
    light = trunk_rings(top, 64, 34, lean, 7)
    light += [frond(crown, a, l * 0.64, d * 0.5, w * 0.42) for a, l, d, w in specs[1:6:2]]
    circles = [(crown[0] + dx, crown[1] + dy, r) for dx, dy, r in nuts]
    return svg(dark, light, circles)


PALM_A = palm(
    26, 500,
    [(-172, 250, 160, 30), (-150, 268, 178, 34), (-126, 254, 196, 34),
     (-100, 230, 210, 32), (-74, 236, 206, 32), (-52, 262, 186, 34),
     (-28, 268, 166, 32), (-8, 244, 150, 28), (-192, 230, 140, 28)],
    [(-28, 36, 18), (2, 46, 17), (28, 32, 16)])

PALM_B = palm(
    -30, 560,
    [(-8, 246, 158, 30), (-30, 264, 176, 34), (-54, 250, 194, 34),
     (-80, 226, 208, 32), (-106, 232, 204, 32), (-128, 258, 184, 34),
     (-152, 264, 164, 32), (-172, 240, 148, 28), (12, 226, 138, 28)],
    [(26, 38, 18), (-4, 46, 17), (-30, 30, 16)])


# --- model 3 and 4: ordinary broadleaf trees ---
def bark(top, base_half, top_half, lean, streaks, steps=26):
    """Vertical bark streaks in the lighter tone, the broadleaf answer to
    the palm's rings: on a phone the trunk is most of what is on screen,
    so a flat shape that wide reads as a hole in the painting."""
    base = (CX, BASE_Y)
    ctrl = (CX - lean * 0.45, BASE_Y - (BASE_Y - top[1]) * 0.55)
    out = []
    for frac, t0, t1, w in streaks:
        pts_l, pts_r = [], []
        n = 10
        for i in range(n + 1):
            t = t0 + (t1 - t0) * i / n
            x, y = bez(base, ctrl, top, t)
            half = top_half + (base_half - top_half) * (1 - t) ** 1.25
            cx = x + half * frac
            taper = math.sin(math.pi * (i / n)) ** 0.5
            pts_l.append((cx - w * taper, y))
            pts_r.append((cx + w * taper, y))
        out.append(poly(pts_l + pts_r[::-1]))
    return out


def broadleaf(lean, crown_y, lobes, fringe, limbs, streaks):
    top = (CX + lean, crown_y + 40)
    dark = [trunk(top, 70, 42, lean, flare=26)]
    # Limbs leaving the trunk into the canopy. They sit high, above what a
    # phone shows, so on screen this is a trunk and the canopy's underside.
    for bx, by, ex, ey, w0, w1 in limbs:
        dark.append(poly([(CX + bx - w0, BASE_Y - by), (CX + ex - w1, BASE_Y - ey),
                          (CX + ex + w1, BASE_Y - ey), (CX + bx + w0, BASE_Y - by - 30)]))
    circles = [(CX + lean + dx, crown_y - dy, r) for dx, dy, r in lobes]
    # Leaves hanging below the canopy's edge, which is what a student
    # actually sees at the top of a phone screen.
    circles += [(CX + lean + dx, crown_y - dy, r) for dx, dy, r in fringe]
    light = bark(top, 70, 42, lean, streaks)
    lightc = [(CX + lean + dx + 14, crown_y - dy - 10, max(12, r - 16))
              for dx, dy, r in lobes[:4]]
    return svg(dark, light, circles, lightc)


BROAD_A = broadleaf(
    18, 400,
    [(-150, 40, 76), (-80, 96, 96), (10, 120, 104), (96, 84, 92), (156, 30, 72),
     (-40, 10, 78), (46, 6, 74), (-110, -22, 58), (110, -26, 56), (0, 176, 72),
     (-70, 160, 58), (74, 156, 56)],
    [(-124, -54, 40), (-46, -70, 44), (36, -72, 42), (116, -50, 38), (-4, -30, 50)],
    [(-38, 520, -112, 690, 32, 16), (32, 560, 104, 720, 30, 15)],
    [(-0.74, 0.03, 0.58, 6), (-0.42, 0.10, 0.66, 8), (0.04, 0.02, 0.72, 6),
     (0.46, 0.16, 0.60, 8), (0.78, 0.06, 0.50, 6)])

BROAD_B = broadleaf(
    -22, 460,
    [(140, 34, 74), (74, 92, 94), (-16, 118, 102), (-102, 80, 90), (-158, 26, 70),
     (34, 8, 76), (-52, 4, 72), (104, -24, 56), (-116, -28, 54), (-6, 170, 70),
     (64, 152, 56), (-80, 150, 54)],
    [(118, -52, 38), (40, -68, 42), (-42, -70, 40), (-120, -48, 36), (2, -28, 48)],
    [(36, 580, 108, 750, 32, 16), (-30, 620, -100, 780, 30, 15)],
    [(0.74, 0.03, 0.58, 6), (0.42, 0.10, 0.66, 8), (-0.04, 0.02, 0.72, 6),
     (-0.46, 0.16, 0.60, 8), (-0.78, 0.06, 0.50, 6)])


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
