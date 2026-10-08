# SHINIGAMI — a story in seven chapters

Zangetsu Studio's site tells one story top to bottom: Ichigo's arc from a borrowed blade to giving it back. Every scroll scene is a story beat; the studio pitch is the epilogue.

Two threads run through it. **The moon:** the prologue opens under one, Chapter 06 asks "remember the moon?", and Chapter 07 is 無月, *no moon*. **The blade:** in Chapter 02 Rukia gives Ichigo her power; in Chapter 07 he spends all of it and loses the ability to see her.

| # | Chapter | Section id | Art | Beat | Scroll moment |
|---|---|---|---|---|---|
| — | Prologue: Under the Moon | `hero` | ch311 Ulquiorra (inverted) | Long before the boy, something patient waits under the moon. | Moon swells and swallows the screen |
| 01 | Death & Strawberry | `descent` | ch336 Hollow | A boy who sees ghosts, a Hollow at the door, a borrowed blade. | Sword falls, impact, the Hollow surfaces, 死神 |
| 02 | The Borrowed Blade | `frame` | ch266 Rukia | She gives him her power and is sentenced to die for it. | Slash cuts the page in two |
| 03 | The Ryoka | `hit` | ch104 Kenpachi | He storms Soul Society; Kenpachi only came to fight. | FIGHT. slams in, impact-frame flashes, wipe |
| 04 | The Thirteen | `roster` | ch156…166 captains | Thirteen captains in his way. One planned all of it. | Deck fans out, each captain steps forward, Aizen gets stamped TRAITOR |
| 05 | The Scarmask | `hollow` | ch289 Scarmask | The power comes with a voice that wants the body back. | Torn red edge drags the inverted Hollow across |
| 06 | Hueco Mundo | `versus` | ch340 Ichigo vs Ulquiorra | The thing under the prologue's moon. | Halves slam together, flash, VS, shake |
| 07 | Mugetsu | `mugetsu` | ch415–423 panels: Aizen's fusion, Mugetsu, the pillar, Rukia fades | To stop Aizen he becomes the Getsuga, spends every strike he has, and loses the power to see her. | Three beats: a manga page slams together panel by panel; ink floods it and 無月 is brushed in over the pillar; the ink drains to paper and Rukia dissolves beside him: GOODBYE, RUKIA. |
| — | Storyboard | `frames` | gallery g1–g6 | Frames from the story. | Horizontal run |
| — | Epilogue: Who Drew It | `manifesto`, `work`, `contact` | p1–p4 | The studio behind it. "Let's draw the next chapter." | Line reveals, hover previews |
| — | From the Archive | `archive` | `assets/art/scatter/` (28 panels) | Loose panels from the desk. | A random handful every visit, also in the loader, marquees, gallery and footer |

Each story section carries `data-chapter` / `data-title`; the HUD under the nav reads them, so adding a chapter is: add a section with those attributes, give it a pinned timeline in `js/main.js`, and add a row here.
