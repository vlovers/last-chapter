# Pixel room v2 — interactive layout

The authored bookshop background is a 480×270 pixel-grid SVG. The scene container now uses the same 16:9 aspect ratio as the source. Its hotspot overlay is a child of the same coordinate space, so the buttons remain aligned with the pictured shelf, window, counter and plant.

## Implemented

- One original pixel-grid scene, without the old duplicated CSS room behind it.
- Non-interactive animated rain in the window and a soft lamp glow.
- Static motion fallback under `prefers-reduced-motion: reduce`.
- Existing semantic buttons, keyboard focus, book catalog and discovery flags remain unchanged.

## QA required

- Run `npm run check` and review screenshots at 320px, 375px, 768px and desktop.
- Check all four hotspots by mouse, touch and keyboard, especially the plant at phone width.
- Confirm contrast and pointer targets with zoom/enlarged text.
- Validate the art itself: SVG is a pixel-grid proof of concept, not a finished hand-authored sprite sheet.
- Check rainy overlay clipping and low-end mobile performance.

## Future

Replace the SVG with approved sprite art and preserve the 480×270 coordinate contract. Add character portraits and narrative-specific scene variations only after interaction QA.
