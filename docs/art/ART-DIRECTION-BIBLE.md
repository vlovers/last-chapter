# Last Chapter — Art Direction Bible v1

Status: art-production specification, not a claim of implemented assets. Owner: art pipeline. Phaser gameplay code is owned by the parallel Codex vertical-slice task.

## Creative target
A lived-in, rainy autumn bookshop in Bellwick: warm amber light inside, blue-grey rain outside, walnut shelves, worn rugs, handwritten notes, uneven stacks of books. Quiet and intimate rather than grand or luxurious.

## Camera and grid
- Keep the current 640×360 logical Phaser scene for the first slice.
- Use a **top-down three-quarter room** rather than true isometric projection.
- Author props on a consistent **16px base grid**, with 32px furniture modules and 32×48 character frames as the *current prototype baseline*. Review character readability at 2×/3× display before locking the final sprite size.
- Use nearest-neighbor filtering and integer-positioned art where possible. No smooth scaling of pixel textures.
- Ground-contact anchor for characters: bottom-center. Furniture depth sorts by ground-contact Y, not top-left Y.
- The wall, window, shelves, rug, counter, table and door must share one perspective. Do not mix side-on furniture with 45-degree isometric tiles.

## Palette direction
These are proposed colors for a unified pass, not a requirement to recolor every asset blindly.

| Role | Hex | Usage |
|---|---|---|
| Ink | `#241b29` | Deep shadows and outlines |
| Walnut | `#684253` | Wood darks |
| Chestnut | `#955c51` | Wood midtones |
| Honey | `#d9a46a` | Furniture highlights |
| Lamplight | `#f5ce87` | Warm focal light |
| Paper | `#e9d5af` | Notes, books, UI |
| Rain blue | `#536e80` | Exterior and window |
| Moss | `#718b69` | Plants and cloth |
| Mauve | `#92718a` | Autumn accents |

Maintain legible contrast. Use fewer colors per individual sprite than the full scene palette.

## Art layers and naming
1. `bg-wall` — wall, trim, window backing.
2. `bg-floor` — planks, floor shadows.
3. `mid-rug` — rug and flat floor decals.
4. `object-*` — shelves, counter, table, chairs, plants; depth-sort by foot.
5. `actor-*` — player and visitors; depth-sort by feet.
6. `fx-*` — lamp bloom, rain clipped to window, dust motes.
7. `ui-*` — dialogues, portraits, choice indicators.

Preferred assets: local PNG spritesheets or atlases for runtime; Aseprite/source files may be kept in an editable art-source folder when licenses permit. Do not commit purchased source archives without redistribution permission.

## Minimum asset backlog (vertical slice)
| Priority | Asset | Suggested native size | Animation |
|---|---|---|---|
| P0 | Interior floor + wall tiles | 16×16 | none |
| P0 | Bookshelf variants (2–3) | 32×64 or larger modules | none |
| P0 | Counter, reading table, chair | 32px-grid aligned | none |
| P0 | Player | 32×48 frame baseline | idle + walk |
| P0 | Mara | 32×48 frame baseline | idle + walk |
| P0 | Rain window | 64×96 or scene-fit | 4–8 frame rain overlay |
| P1 | Lamp, plant, scattered books | 16–48px modules | lamp flicker |
| P1 | Mara portrait | 64×80 baseline | expression variants |
| P1 | Exterior silhouette | window-fit | subtle parallax |
| P2 | Seasonal decor, parcels, signs | variable | optional |

Native sizes are planning targets. Confirm with the chosen licensed pack before implementing atlas metadata.

## Acceptance checklist
- Characters are visibly readable at normal laptop viewport size.
- Sprites share one pixel density, perspective and outline style.
- Mara can stand in front of and behind appropriate furniture without clipping.
- Rain remains confined to the window.
- Warm interior and cold exterior are distinct even without animation.
- Scene does not look like a webpage with a decorative illustration.
- All dialogue and interactive UI text is Ukrainian.
- Every shipped asset has verified source, license and redistribution status.

## Coordination with Codex
Do not edit `public/phaser-prototype/scene.js`, `phaser-prototype/index.html`, or gameplay modules during the concurrent vertical-slice task. Treat this document as a production contract to review together after the agent finishes.
