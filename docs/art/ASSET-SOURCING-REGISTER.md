# Asset Sourcing Register — Last Chapter

This register tracks _candidates_, not imported or licensed-to-ship assets. Check each downloaded archive's license and redistribution restrictions before integrating.

| Candidate                                              | Link                                                              | Potential role                 | Status         | Risk / verification                                                                           |
| ------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------ | -------------- | --------------------------------------------------------------------------------------------- |
| PixelNestStudio.R — Bookshop & Library Pixel Art Props | https://pixelneststudior.itch.io/bookshop-library-pixel-art-props | Furniture, books, shop props   | Candidate only | Paid; confirm included LICENSE, repository visibility and whether source art can be committed |
| feyza5 — Cozy Library                                  | https://feyza5.itch.io/cozy-library                               | 32×32 library furniture        | Candidate only | Confirm license inside archive, perspective and tilesheet completeness                        |
| GegX — Cozy Starter                                    | https://gegx.itch.io/cozy-starter                                 | Cozy interiors and characters  | Candidate only | AI-assisted disclosure on listing; verify source terms, exact frames and stylistic fit        |
| Kenney — Roguelike/RPG Pack                            | https://kenney.nl/assets/roguelike-rpg-pack                       | CC0 fallback for generic props | Candidate only | Confirm downloaded pack license and visual compatibility                                      |

## Intake checklist

1. Save original source URL, creator, asset title, download date and version.
2. Read archive LICENSE/README. Record allowed commercial use, modifications, attribution, public GitHub redistribution, AI-assisted disclosure and any restrictions.
3. Record frame width/height, atlas rows/columns, native perspective and alpha transparency.
4. Preview **at native resolution** alongside the existing Mara/player sprite. Reject incompatible outline and perspective.
5. Import only selected local assets. Do not hotlink marketplace previews.
6. Add asset metadata to `public/assets/bookshop/manifest.json` **after** the asset exists and its license is confirmed.
7. Validate referenced files, frame bounds, and render in Phaser.
8. Store proof of terms in a project-local license note without copying copyrighted product descriptions.

## Immediate decisions

- **First:** choose one primary interior pack. Avoid mixing four different aesthetics.
- **Second:** find a matching 4-direction idle/walk character sheet; static portraits are not animation frames.
- **Third:** add rainy-window overlays and warm-light effects independently of tiles.
- **Fourth:** only after visual review, commission or draw missing bookstore-specific props.

## Coordination

Codex owns the live Phaser vertical slice. This register is documentation-only and intentionally does not change runtime code. Do not merge to main without explicit approval.

## V4 shipped original sources

No candidate pack above was imported. V4 uses original code-native room/actor art
and three original 64×80 Mara SVG expressions under `public/art/bookshop/`.
`public/phaser-prototype/assets.js` records their local paths, dimensions and
`project-original` provenance. See [source attribution](../../public/art/bookshop/ATTRIBUTION.md)
and [before/after report](v4/README.md). The synchronized four-frame rain source remains
unwired; the tested procedural weather layer is active.

## Gameplay polish V1 — original procedural art

`public/phaser-prototype/frank.js` authors Frank in native room pixels using
integer rectangles: grey Devon Rex proportions, wedge face, stepped oversized
ears, short wavy coat, directional facing, breathing/blink/tail frames and walk,
sit, sleep, stretch and groom poses. `frank-behavior.js` supplies the deterministic
ambient schedule. No external sprite, image-generation output, asset pack or
licensed character reference was imported. Rights/provenance: original project
art, under the repository's existing project terms.

`environment.js` adds original pixel geometry for a window book pedestal, returns
trolley, table easel and restrained rug weave. Their solids reuse the existing
furniture footprints. All remain on the 640×360 native grid. Existing original
visitor portraits and shared sprite palettes are reused without external artwork.
