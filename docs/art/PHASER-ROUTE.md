# Phaser prototype route

Run `npm run dev`, then visit **http://localhost:5173/phaser-prototype/**.

The prototype HTML entry is now in the Vite project root at `phaser-prototype/index.html`. Vite serves that route as an HTML entry rather than falling back to the story app. The separate, original Phaser scene script remains at `public/phaser-prototype/scene.js`, reachable via `/phaser-prototype/scene.js`.

This prototype currently uses Phaser 3.90.0 from jsDelivr and requires internet access. The main game at `/` is unchanged. Run `npm run check` and visually verify the route after pulling.
