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
