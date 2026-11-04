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
