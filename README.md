# Zangetsu Studio

Fan-made anime universes, told as hand-inked, scroll-driven stories.

**Live:** https://sayandeep1013.github.io/ZangetsuStudio/

| Universe | Folder | Status |
|---|---|---|
| Bleach — *Shinigami*, a story in seven chapters | [`bleach/`](bleach/) | Live |
| Dragon Ball | [`dragonball/`](dragonball/) | In production |
| Naruto | [`naruto/`](naruto/) | In production |
| One Piece | [`onepiece/`](onepiece/) | In production |
| Jujutsu Kaisen | [`jujutsukaisen/`](jujutsukaisen/) | In production |

## Structure

```
index.html          universe picker (home)
shared/             GSAP + Lenis (vendor/), home + coming-soon styles
bleach/             a universe: index.html, css/, js/, assets/, STORY.md
<universe>/         other universes (coming-soon page until built)
tools/              asset pipeline shared by every universe
```

Each universe is self-contained static HTML/CSS/JS. Its `STORY.md` maps chapters to sections, art and scroll moments.

## Run locally

```
python -m http.server 5173
```

Then open http://localhost:5173. Any static server works; there's no build step.

## Asset tools

```
python tools/ink.py <src.png> <out.webp> [--crop l,t,r,b] [--invert]       # ink treatment
node tools/make-frames.mjs <clip.mp4|still.png> <scene> --universe bleach   # scroll-scrubbed clips / stills
```

`ink.py` needs Python with numpy + Pillow; `make-frames.mjs` needs Node and ffmpeg.

## Starting a new universe

1. Copy `bleach/` to `<universe>/` (it replaces the coming-soon page).
2. Write its `STORY.md`: prologue, chapters, the payoff.
3. Ink the art with `tools/ink.py`, swap the accent colour in `css/style.css`, rewrite the sections.
4. Flip its card on the home page from "In production" to live.

---

Non-commercial fan project. All characters and artwork belong to their creators (Bleach © Tite Kubo / Shueisha).
