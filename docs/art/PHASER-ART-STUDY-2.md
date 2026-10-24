# Phaser art study 2 — visible room and accessible interactions

Replaced the flat wall-dominated prototype with a 640×360 top-down three-quarter composition: substantial plank floor, back wall, multiple bookshelves, reading carpet, lounge chair, entrance, reading table, checkout counter, parcels, and two visitors. Each foreground furniture piece has its own Phaser graphics object and Y depth. Added a keyboard-accessible HTML action row that mirrors pointer-only scene interactions. The dialogue engine and saves remain untouched.

All graphics are original placeholders drawn using Phaser primitives, **not third-party pixel-art tilesets**. This pass establishes composition and room geometry; it is not the final visual quality target. Next: select a licensed, cohesive sprite/tileset collection, import actual image textures and animations, and remove the placeholder renderer. No unverified asset licensing claims.

QA: run `npm run check` and manually inspect `/phaser-prototype/` on desktop and mobile. Verify five action buttons work by keyboard and pointer, rain stays inside window, and visitors do not disappear. Phaser remains CDN-loaded.

## Asset sourcing decision — next art pass

The current screenshot confirms the room composition is usable as a layout prototype, but it is still drawn with Phaser Graphics primitives. Do not treat it as final art.

Shortlist checked on 2026-10-24:

1. **GegX — [COZY STARTER](https://gegx.itch.io/cozy-starter)**. Strongest first candidate for the warm bookstore direction: the pack advertises a bookshelf, book pile, reading lamp, room tiles, townsfolk, and dialogue portraits. Its page permits commercial use and says not to resell the assets as a pack. The author marks it AI-assisted. Inspect the downloaded archive's included license and manifest before importing; keep the source/credit notes in the project.
2. **feyza5 — [Cozy Library](https://feyza5.itch.io/cozy-library)**. A bookstore/library-specific 32×32 tileset advertised as free for personal and commercial projects. It may fit the setting, but the listing describes a smaller prop collection; it will need character sprites and animation frames from a compatible source.
3. **Kenney — [Roguelike/RPG Pack](https://kenney.nl/assets/roguelike-rpg-pack)**. Broad 16×16 interior/furniture pack with CC0 licensing, suitable as a safe fallback, but its style may not match the current warm, detailed bookstore art.

### Implementation order

- Download and inspect the chosen pack locally; verify the archive's actual license file and sprite dimensions.
- Add the original files under `public/assets/bookshop/`, preserve the license and attribution/AI disclosure notes, and do not hotlink itch.io images in the shipped game.
- Replace the procedural bookshelf, window, floor, plant, and furniture one group at a time with image textures/tiles. Preserve the current 640×360 scene and interaction zones while swapping art.
- Use a compatible character sheet with real idle/walk frames. Do not imply that a static sprite is animated; keep rain and lamp effects separate from character animation.
- Add a small asset manifest and a check that referenced local files exist. Keep this Phaser experiment isolated from the story engine and save data until visual and interaction parity is confirmed.

No external asset files have been imported yet. These are candidates, not a claim that the licenses or archive contents have been independently inspected. Re-check the included license before shipping.

## Source comparison refresh (2026-10-24)

Public listing checks show a better-matched candidate than a generic RPG tileset:

- **PixelNestStudio.R — [Bookshop & Library Pixel Art Props](https://pixelneststudior.itch.io/bookshop-library-pixel-art-props)**: $1 minimum; listing describes 64 static transparent PNG states (48 kinds plus 16 states), a spritesheet atlas, coordinates and manifest, with a front three-quarter view. Commercial/non-commercial use in finished games is allowed per the listing; standalone redistribution, public source hosting, reusable-template distribution and AI-training use are prohibited. AI-assisted disclosure is present. This is the closest perspective/subject match, but it has no character animation or automatic tiling. Inspect the archive's LICENSE.txt before integrating.
- **GegX — [COZY STARTER](https://gegx.itch.io/cozy-starter)**: free/name-your-price sampler, with a machine-readable `assets.json` and import guide. The listing says commercial use is allowed and prohibits reselling the assets as a pack. AI-assisted disclosure is present. It is a sampler rather than a complete bookstore scene; verify whether the specific needed bookshelf/room props are actually in the archive.
- **feyza5 — [Cozy Interiors Asset Pack](https://feyza5.itch.io/cozy-library)**: free/name-your-price 32×32 bookstore interiors; the author explicitly permits commercial use and modifications in a finished project and prohibits repackaging/resale. It is an alternative if its top-down layout can be reconciled with the existing 3/4 room.
- **Kenney — [Roguelike/RPG Pack](https://kenney.nl/assets/roguelike-rpg-pack)**: CC0, 16×16 and broad coverage, but less specifically matched to the warm bookstore style.

### Practical decision

Prefer **PixelNestStudio.R** for furniture and bookstore props if the $1 purchase is acceptable; otherwise inspect the free Cozy Starter and feyza5 archives before deciding. Do not mix packs just because both are pixel art: compare camera angle, native pixel scale, outline weight and palette first. Characters/animation remain a separate asset decision. No pack has been downloaded or added to the repository in this pass; the source-page terms still need confirmation against the archive's included licence.
