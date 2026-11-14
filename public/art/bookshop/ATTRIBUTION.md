# Bookshop V4 — original project artwork

These files were authored for Last Chapter during the V4 art pass. No external
asset pack, traced game art, stock portrait, marketplace preview or downloaded
recording was used.

| Source                                             | Geometry / use                                               | Provenance                           |
| -------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------ |
| `mara.svg`                                         | 64×80, warm expression                                       | Original editable SVG pixel geometry |
| `mara-thoughtful.svg`                              | 64×80, thoughtful expression                                 | Original editable SVG pixel geometry |
| `mara-firm.svg`                                    | 64×80, firm expression                                       | Original editable SVG pixel geometry |
| `/phaser-prototype/character-art.js`               | Two generated 32×48 actor sheets, 24 frames each             | Original code-native pixel artwork   |
| `/phaser-prototype/environment.js`, `shelf-art.js` | 640×360 room, four authored shelf arrangements and furniture | Original code-native pixel artwork   |

Runtime metadata: `public/phaser-prototype/assets.js`, `source: original-project-art`,
`license: project-original`. This label describes artwork made for this project;
it does not assert that a third-party asset license was acquired. Character sheets
are regenerated on scene initialization. Portrait SVGs are their editable source.
The existing production portrait files under `/art/portraits/` were not modified.

See `docs/art/v4/README.md` for screenshot comparisons and validation.

## Mobile overhaul additions

The resized counter (128×42), reading table (72×32), armchair (36×36), Devon Rex
cat tree, cushion, cubby, bowl and actor hand/book gestures are original
code-native pixel geometry in `environment.js`, `frank.js` and `actor-actions.js`.
They use the room's existing palette and integer paint coordinates, without
external assets, textures or CSS sprite scaling. Frank's compact geometry is
rasterized directly onto the native grid. Rain, dust and reflections use small
reused graphics rather than third-party image assets.

# UX/UI catalog covers — 2026-11-05

`covers/{orchard,witnesses,station,roads,letters}.svg` are original code-authored
48 × 72 pixel geometric artwork created for Last Chapter in this repository.
The orchard, eye, station, map and envelope motifs use only integer SVG geometry,
the shared autumn palette and crisp-edge rendering. No external art, fonts,
photographs, trademarks or generated bitmap assets are included. The journal
reuses the existing deterministic `visitor-portraits.js` pixel portraits.

Living Story (#40): window sky/rooftop/sun/moon variations and speaking mouth/hand/nod
cues are original procedural extensions of the existing in-repository pixel art.
No external artwork, textures, fonts or animation sheets were imported.

## v0.2 candidate inventory and distribution review

The candidate retains the existing original-project room/visitor SVGs, eight portrait SVGs, Mara expressions, five catalog covers and procedural room/character/Frank art. Autumn arch/leaf accents are original code geometry recovered from PR #45 and painted into the existing cached background. No marketplace art, recordings, web fonts or remote asset requests were added. System fonts are referenced by family name and are not redistributed. Audio is synthesized in `public/phaser-prototype/audio.js`.

Installed runtime dependency notices for Phaser 3.90.0 and EventEmitter3 are copied verbatim to `/THIRD_PARTY_NOTICES.txt`, which Vite includes in the built site. Optional Spine plugins in node_modules are not imported into this build. The asset-sourcing register lists candidate packs, not distributed art.

**Pending:** the owner must approve distribution rights/terms for the game's original story/art and verify all provenance as part of #42. `project-original` identifies source; it does not grant an open-source license. The repository currently has no general project LICENSE. No public-release approval is inferred from this inventory.
