# Phaser bookstore — isolated vertical slice

Open `http://localhost:5173/phaser-prototype/` while Vite is running.

This is a **separate, reversible prototype**. It does not replace the existing narrative app, does not touch saves, and does not need a new npm dependency or lockfile. Phaser 3.90.0 loads from jsDelivr in the prototype page, so **an internet connection is required** for this spike.

What it demonstrates:

- Phaser game instance with a 640×360 pixel-art camera, scaled with nearest-neighbor rendering
- Original programmatically drawn bookshelves, furniture, floor, window, and decor
- A Phaser-native visitor sprite (graphics container) walking to the counter
- Animated rain in a window layer, lamp halo, hit-area interaction and feedback
- No copied or unlicensed artwork

What is intentionally missing:

- Licensed external tilesets, sprite sheets and character animations
- Integration with the current dialogue engine, saves, scene mood, and accessibility equivalent keyboard interactions
- Visual polish, depth-sorted sprites, responsive and accessibility QA

Next: compare visual direction with the user, choose one compatible tileset/character pack with a verified license, install Phaser as a pinned npm dependency, build a reusable `BookshopScene` module and bridge Phaser events to the existing story state. Do not replace the stable game until parity is tested.
