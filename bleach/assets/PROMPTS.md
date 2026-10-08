# Art

## Current art

`bleach/assets/art/*.webp` is Tite Kubo's chapter-cover artwork (sources in `bleach/assets/src/`, from the Bleach Wiki), run through one ink treatment so every piece reads as black/paper line art with red as the only colour:

```
python tools/ink.py bleach/assets/src/ch311.png bleach/assets/art/hero.webp --crop 0.05,0.01,0.97,0.9 --invert
```

`--invert` gives white ink on black (hero). Pick line-heavy art with a white background for it; art with big solid blacks turns into white blobs.

| File | Source | Section |
|---|---|---|
| hero | ch311 Ulquiorra, inverted | Hero, over the red moon |
| descent | ch336 Hollow | Rises behind the falling sword |
| frame | ch266 Rukia | The slash cut |
| hit | ch104 Kenpachi | OURS HIT. |
| p1–p4 | ch253, 199, 125, 236 | Work list hover previews |
| g1–g6 | ch346, 384, 388, 161, 401, 144 | Gallery |

To swap a piece, run `ink.py` with the same output name and reload the page.

## Generating original art


The site's motion is code. The characters must be real illustrations: generate a still per scene, optionally animate it with image-to-video, then drop it in.

## Style anchor (paste at the start of every image prompt)

> Tite Kubo Bleach manga style, black and white ink illustration, sharp confident brush lines, heavy solid blacks, screentone shading, high contrast, dramatic negative space, single crimson red accent, clean white or pure black background, full-body, cinematic composition, 16:9

Generate **16:9, 2K or larger**. Keep the same anchor and seed/style reference across scenes so the characters look like one set.

## Scenes

| Slot | Still prompt (after the anchor) | Motion prompt (image-to-video, 4–6s) |
|---|---|---|
| `hero` | Sōsuke Aizen seated on a tall white throne, legs crossed, chin on hand, white robes, background of hundreds of staring manga eyes on black | Eyes in the background open one by one, slow push-in on Aizen, robes ripple slightly |
| `descent` | Ichigo in Bankai, black shihakushō coat flaring, falling head-first through pure black void, Tensa Zangetsu pointed down, white spiritual pressure streaks | He falls toward camera and flips upright, coat whipping, ends in a landing crouch |
| `frame` | Byakuya Kuchiki mid-lunge across a solid crimson background, white captain haori and scarf trailing, sword drawn in a long horizontal slash | One fast slash left to right, a white cut line stays on screen, scarf follows through |
| `hit` | Kenpachi Zaraki in a wild fighting stance on crimson, torn haori, jagged sword, bells in hair, grinning | Charges at camera, impact frame flashes black/white, dust burst |
| `p1`..`p4` | One portrait each (3:4): Rukia, Ulquiorra, Yoruichi, Toshiro | — (stills) |
| `g1`..`g6` | Gallery frames (3:4): Bankai close-up, Getsuga Tenshō, Hollow mask, Seireitei rooftops, Senbonzakura petals, a sword stuck in the ground | — (stills) |

## Drop it in

```
node tools/make-frames.mjs path/to/hero.mp4 hero      # video  -> scroll-scrubbed frames
node tools/make-frames.mjs path/to/hero.png hero      # still  -> image with scroll zoom
node tools/make-frames.mjs path/to/rukia.png p1       # work-list hover preview
node tools/make-frames.mjs path/to/bankai.png g1      # gallery panel
```

Once a slot has art, its placeholder (code-drawn figure, eyes, kanji) hides automatically.
