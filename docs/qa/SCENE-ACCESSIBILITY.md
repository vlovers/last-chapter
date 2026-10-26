# Scene accessibility and lighting QA

## Fixed

The first pixel-stage integration used `aria-hidden="true"` on the **parent of the interactive hotspot buttons**. This incorrectly hid buttons from the accessibility tree, even though they remained clickable. The parent is no longer hidden; only the decorative image and weather/glow layers are hidden individually.

The pixel room now derives one of three lighting moods from the story stage: morning, daytime or evening. The mood is a deterministic presentation property and does not change save compatibility. The scene keeps the same four interactive buttons.

## Remaining checks

- Verify keyboard Tab/Shift+Tab and screen-reader announcement of all four hotspot buttons in a real browser.
- Check 320px mobile layout for overlapping buttons and 200% zoom.
- Confirm SVG pixel quality at non-integer zoom factors and compare screenshots.
- Run `npm run check`; commit presence is not proof of green CI.
- Replace the current prototype artwork with authored sprite sheets and portraits after the interaction baseline is validated.

## Accessibility reference

Decorative animation should be disabled when the user requests reduced motion. See MDN on `prefers-reduced-motion`. Pixel-art nearest-neighbor scaling is controlled with `image-rendering: pixelated`.
