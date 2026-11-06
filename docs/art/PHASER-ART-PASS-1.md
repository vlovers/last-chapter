# Bookshop Art Pass 1 — Phaser scene

The prototype now includes separate Phaser GameObjects for a reading table with books, an upholstered chair, a book crate, a parcel, and a second idle visitor. The moving visitor uses Y-based depth, and a subtle tween animates the lamp's ambient glow.

All props are independent Graphics objects, making replacement with sprite textures straightforward. No external assets were copied or downloaded. This is still **programmatic placeholder art**, not a licensed pixel-art tileset. The next milestone is importing a cohesive, legally usable tileset and character sprite sheets after reviewing their licenses.

Run `npm run check` and open `http://localhost:5173/phaser-prototype/`. Compare before and after visually and test interaction zones. The main narrative and saves are untouched.
