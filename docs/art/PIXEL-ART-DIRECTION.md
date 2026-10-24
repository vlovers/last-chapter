# Pixel-art direction — LAST CHAPTER

Status: **art direction proposal; no production sprite sheets or original pixel-art backgrounds committed yet**.

## Decision

Use original, detailed 2D pixel art for the bookshop and Bellwick, with a modern readable Ukrainian interface. Inspiration may include cozy conversational games and richly lit pixel-art adventures, but do not copy their assets, compositions or distinctive characters.

## First vertical slice

One original bookshop interior at an internal design resolution of **480 × 270** pixels (16:9), displayed with integer nearest-neighbor scaling where possible. Do not stretch the background to fill arbitrarily tall viewports; letterbox or crop intentionally. The current CSS scene remains a fallback until an actual approved sprite exists.

**Layers (back to front):**
1. Rainy Bellwick skyline and moving leaves outside the window.
2. Interior walls, sign and fixed architecture.
3. Shelves, book spines, clock, lamp and plants.
4. Foreground counter, cup, paper and letters.
5. Characters and dialogue portraits, rendered separately from the scenery.
6. Semantic HTML buttons for interactive hotspots and dialogue, aligned to the art but never baked into a sprite.

## Palette and lighting

Deep plum and warm walnut shadows; amber and honey highlights; muted sage accents; desaturated rainy blue outside. One warm practical lamp and a cooler window light create depth. Avoid blur filters on sprite pixels; simulate glow in a separate smooth overlay. Make time-of-day states from shared layers: daylight, dusk, rainy evening.

## Asset contract

- Source PNG or lossless spritesheet, plus editable source files under a documented license.
- Use a fixed pixel grid; nearest-neighbor for sprite scaling.
- Separate animated elements from static scenery.
- Store authored scene hotspot rectangles in normalized coordinates so pointer and keyboard controls agree.
- Every meaningful interaction must retain an HTML label, keyboard focus and visible focus state.
- Respect reduced motion; provide static rain and no flicker in that mode.
- Never bake Ukrainian text into a sprite unless it is a deliberate environmental sign.

## Characters

Eight recurring characters: Iris, Leo, Mara, Beatrice, Eleanor, Thomas, Anna and Nora. Start with one neutral standing sprite and three readable portrait expressions per character. Keep their proportions and palettes consistent. Emotional differences should be visible without relying on color alone.

## Acceptance criteria

- Scene feels like a bookshop, not a generic café.
- Bookshelves and counter are recognizable at 1× design resolution.
- Character portraits remain legible at phone width.
- All current hotspots work on touch and keyboard.
- Performance, responsive layout and reduced-motion modes are checked.
- Ukrainian dialogue is readable at normal and enlarged text sizes.
- Art provenance is documented; no borrowed commercial game assets.

## Order of execution

1. Validate five-day story continuity and all automated checks.
2. Produce one approved bookshop background and a simple character portrait.
3. Replace CSS scene behind a feature flag; compare before/after.
4. Expand into lighting, rain and all character portraits after review.

Do **not** mark pixel-art production complete based on this document or CSS styling alone.
