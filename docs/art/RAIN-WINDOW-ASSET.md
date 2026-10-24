# Rain window overlay — original project art

- File: `/assets/bookshop/rain-window.svg`
- Origin: original project art, authored for Last Chapter; no third-party asset dependency.
- Frame dimensions: 64×96; horizontal sprite strip 256×96; four frames.
- Intended runtime: load as a sprite sheet with `frameWidth: 64`, `frameHeight: 96`; animate at approximately 5–7 fps; scale and clip strictly to the window glass.
- This asset is **not yet wired into the Phaser scene**; Codex owns the parallel runtime task. The current procedural rain remains the fallback.
- Rendering: transparent background, diagonal pale-blue streaks. Keep nearest-neighbor filtering and never stretch disproportionately.
- Reduced motion: display one static frame, no frame cycling.
- Verification: compare this sprite at actual game scale and check that rain never appears on the wooden frame or interior wall.
