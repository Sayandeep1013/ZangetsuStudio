"""Turn source art into the site's ink look: black/paper line art with red kept as the only colour.

    python tools/ink.py <src> <out.webp> [--crop l,t,r,b] [--invert] [--width 1400] [--gamma 1.0]

--crop     fractions of the source to keep, e.g. 0,0.08,1,0.9
--invert   white ink on black (for the dark sections)
"""
import argparse
import numpy as np
from PIL import Image

PAPER = np.array([242, 239, 232], float)
INK = np.array([5, 5, 5], float)
RED = np.array([200, 16, 46], float)

ap = argparse.ArgumentParser()
ap.add_argument("src")
ap.add_argument("out")
ap.add_argument("--crop", default="0,0,1,1")
ap.add_argument("--invert", action="store_true")
ap.add_argument("--width", type=int, default=1400)
ap.add_argument("--gamma", type=float, default=1.0)
ap.add_argument("--black", type=float, default=0.18, help="luma at or below this becomes solid ink")
ap.add_argument("--white", type=float, default=0.82, help="luma at or above this becomes paper")
a = ap.parse_args()

im = Image.open(a.src).convert("RGB")
l, t, r, b = (float(v) for v in a.crop.split(","))
W, H = im.size
im = im.crop((int(l * W), int(t * H), int(r * W), int(b * H)))
if im.width > a.width:
    im = im.resize((a.width, round(im.height * a.width / im.width)), Image.LANCZOS)

px = np.asarray(im, float) / 255
luma = px @ [0.299, 0.587, 0.114]
v = np.clip((luma - a.black) / (a.white - a.black), 0, 1) ** a.gamma  # 0 = ink, 1 = paper

# red accent: strongly saturated reds survive as the brand red
mx, mn = px.max(2), px.min(2)
sat = (mx - mn) / (mx + 1e-6)
red = (px[..., 0] > 0.45) & (px[..., 0] > px[..., 1] * 1.8) & (px[..., 0] > px[..., 2] * 1.6) & (sat > 0.5)

lo, hi = (PAPER, INK) if a.invert else (INK, PAPER)
out = lo + (hi - lo) * v[..., None]
out[red] = RED
Image.fromarray(out.astype(np.uint8)).save(a.out, quality=82, method=6)
print(a.out, Image.open(a.out).size)
