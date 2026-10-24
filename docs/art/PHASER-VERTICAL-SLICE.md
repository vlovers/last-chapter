# Playable bookshop vertical slice V1

Run Node 22 (22.13+ recommended), `npm ci`, then `npm run dev`. Open
`http://localhost:5173/phaser-prototype/`. The production five-day narrative stays at `/`.
This slice is a short, self-contained Ukrainian encounter, not the full episode.

## What is playable

Enter a rainy Bellwick bookshop, explore with arrow keys/WASD or click/tap a free
floor position, and inspect the shelves, window, counter and reading table. Furniture
has solid foot-level collision. Object selection routes around furniture to an
explicit approach point. Mara walks in, waits by the reading area, and discusses a
book for Leo. Two book recommendations produce different reactions and a wrapped
parcel. A question about asking Leo prompts an explicit consent boundary; it does
not inform him or create a rumor. The player can close and resume an unfinished
conversation, or revisit Mara after completing the gift.

The slice has **no save writer, production state imports, or story integration**.
Reloading resets only the slice. Existing saves, five-day flags and endings are
unchanged. Narrative copy is an authored fixture adapted from `src/content/mara.ts`;
it still needs a Ukrainian editor and narrative designer's review before promotion.

## Architecture

| Module                             | Responsibility                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `phaser-prototype/main.js`         | Vite entry; bundles pinned Phaser 3.90.0, loads the public scene module, catches entry-load failure    |
| `public/phaser-prototype/scene.js` | Scene lifecycle, orchestration, input, arrival, UI/state handoffs, shutdown and recovery message       |
| `config.js`                        | Base dimensions, palette, walking speed, direction order                                               |
| `environment.js`                   | Original code-native room art, furniture layers, props, light and completion parcel                    |
| `assets.js`                        | Runtime manifest validation, original sheet generation and portrait fallback                           |
| `characters.js`                    | Shared four-direction idle/walk definitions, sprites, foot shadows and depth                           |
| `world.js`                         | Pure room geometry, foot-body collision, substepped sliding, navigation and proximity gates            |
| `interactions.js`                  | In-scene semantic object buttons, contextual hint, focus/hover outlines and resized hit areas          |
| `dialogue-content.js`              | Authored Ukrainian encounter fixture and object descriptions                                           |
| `dialogue-state.js`, `state.js`    | Pure branching, validation and immutable slice state transitions                                       |
| `dialogue-ui.js`                   | Safe textContent rendering, portrait fallback, choices, focus trap, keyboard handling and repeat guard |
| `atmosphere.js`                    | Rain, lamp variation and tea steam; static presentation under reduced motion                           |
| `audio.js`                         | Gesture-gated Web Audio synthesis, rain, steps, book/choice cues, optional melody, mute and volume     |
| `phaser-prototype/style.css`       | Responsive game shell, integrated dialogue and settings                                                |

Public modules are served unchanged in development and copied unchanged to `dist`.
The Vite entry appends a module script after assigning the bundled Phaser engine;
importing a public module through Vite's import transformer is deliberately avoided.
No external CDN or remote asset request is needed after dependencies are installed.
Only the prototype entry imports Phaser; the production narrative bundle stays separate.

The pure helpers do not import Phaser, DOM or persistence. The main scene owns event
listeners and audio resources and releases them on shutdown. Missing portrait uses an
initials card; unsupported/rejected audio leaves play functional; manifest, scene, and
entry failures produce a Ukrainian recovery message. Dynamic prose is structurally
validated and rendered through `textContent`, never interpolated into HTML.

## Controls and accessibility

- Arrows/WASD: normalized four-direction movement, including diagonal input.
- Click/tap floor: move there; click/tap an object or Mara: approach and interact.
- E: use the nearest eligible object. The contextual button is also clickable.
- R: cycle objects; Enter while the game has focus: approach the selected object.
- Tab: reach the in-scene semantic object buttons, sound and help. Object buttons
  occupy their visible objects; there is no detached interaction toolbar.
- Dialogue: mouse/touch, Tab/Shift+Tab or up/down arrows, Enter to choose, Esc to
  close. Focus stays inside and returns to the game. Closing preserves the current
  Mara node. Held keys and a 220 ms response guard prevent accidental skipping.
- `?`: controls, volume, optional music, reduced motion. Settings pause movement.
- Sound starts muted and no audio context is created before entering through a user
  gesture. The sound button enables/disables it; volume ranges from 0 to 100%.
- Reduced motion follows the OS preference and can be changed in settings: static
  rain, no lamp/steam/idle animation or scene fade. Essential traversal remains usable.

Semantic object controls and spoken status/dialogue text provide keyboard and assistive
technology affordances. Full screen-reader usability has not been independently audited.
The canvas is decorative to assistive technology; Ukrainian prose uses system fonts.

## Art direction, scale and provenance

640×360 native pixels, integer room geometry, nearest-neighbor scaling, orthographic
three-quarter view. Character sheets use 32×48 frames, 24 frames per character:
four directions × (two idle + four walk). A 14×8 feet body determines collision;
character sprites sort by feet Y, furniture by its bottom footprint. Shadows sit
below the owning sprite, floor light below characters, and foreground trim above.
V4 uses warm walnut, olive plaster, paper cream, teal and restrained gold. See the
[V4 before/after report](v4/README.md) for the current artwork and dialogue presentation.

The room includes varied book spines and gilding, plank joints and wear, a patterned
rug, register, ledger, wrapping supplies, tea, reading chair/lamp, plants, curtains,
window-seat cushions and rainy town silhouettes. Light and steam remain subtle.
Rain is restricted to glass and skips wooden mullions.

All active room pixels, character sheets and synthesized sounds are original project
work, recorded in `assets.js` as `project-original`. V4 adds three original 64×80 Mara SVG expressions under `/art/bookshop/`; their
[provenance](../../public/art/bookshop/ATTRIBUTION.md) is separate from the unchanged
production portraits. `character-art.js` and `shelf-art.js` contain the editable
code-native actor and shelf artwork. No artwork or audio
from reference games is included. The legacy `public/assets/bookshop/visitors.svg`
and its manifest remain for provenance/regression compatibility; V1 does not load them.
Phaser is an MIT-licensed engine dependency, not an art asset.

To add assets: record local path, geometry, author/source and license in the manifest,
validate it, add a failure fallback, keep pixel scale coherent, and test at native and
scaled sizes. Generated sheets need no binary export step. See `tests/phaser-slice.test.js`.

## Validation and limitations

See [V1 QA report](../qa/PHASER-VERTICAL-SLICE-V1.md) for actual check results and
screenshots. `npm run check` covers formatting, lint, TypeScript, deterministic tests
and both Vite entries. Prototype runtime modules are JavaScript; TypeScript does not
statically check them. Browser smoke checks exercise their integration.

Known limits: one small room and one encounter; temporary state; no narrative bridge,
shop economy, multi-NPC scheduling, frame-animated portrait sequences, or authored recorded
soundtrack. The soundscape is synthesized and needs listening/mixing review. Original
programmatic sprites still need a dedicated pixel artist's polish. Responsive desktop
and tablet are targets; very narrow phones use a scrollable dialogue panel. Other browser
engines, actual tablet hardware and full assistive-technology QA remain future work.
Phaser's isolated engine bundle is about 1.21 MB (333 KB gzip); Vite reports its chunk-size
warning. The production narrative does not pay this cost unless the slice is opened.

Next milestones: (1) human Ukrainian narrative and art review, (2) artist-authored
expressions/sprites and audio mixing, (3) broader device/accessibility testing before an
explicitly approved bridge to production narrative state.

V4 dialogue uses a compact parchment dock below the canvas, with distinct warm,
thoughtful and firm portraits. It never covers room pixels; long text scrolls inside
the dock. Desktop choices share a row when space permits, with stacked tablet choices.
