# Game Screen V2 — scene-first layout

## Intent

The previous two-column layout constrained the pixel room to a small rectangle beside a large web-style dialogue card. The new layout makes the **16:9 bookstore stage full width** and places narrative controls beneath it, closer to cozy narrative games.

## Delivered

- Full-width pixel room; no sticky side art and no large blank column below it.
- Dialogue and choices below the stage, with responsive choice columns on wider screens.
- Native keyboard-accessible `details/summary` journal drawer, closed by default, retaining all notes and customer receipts.
- Mobile single-column stacking, compact hotspot labels, and reduced-motion support.
- All existing dialogue, exploration, order, and save mechanics remain intact.

## Known limitations

This is a composition change, **not final pixel art**. The room image is still the original 480×270 SVG, and the scene lacks character sprites, animated expressions, and richly layered assets. Manual QA should check 320px hotspot collisions, 200% zoom, keyboard focus, the journal toggle, and dialogue scrolling. Run `npm run check` before merging.
