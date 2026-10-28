# Phaser prototype — direct entry and lint fixes

The first route was in `public/`, where Vite's SPA fallback served the main game. The prototype is now available through two direct entries:

- `/phaser-prototype/index.html`: explicit Vite HTML entry (most reliable during development).
- `/phaser-prototype/`: directory route, enabled by `appType: 'mpa'` in Vite configuration.

The prototype is listed as a build input so production output includes it. Only the standalone prototype script receives a read-only Phaser global for ESLint; ordinary game scripts remain unchanged. Browser-extension warnings from `evmAsk.js` / `contentscript.js` are unrelated to the prototype.

Run `npm run check` and then open the **explicit** `http://localhost:5173/phaser-prototype/index.html` route. The page heading must contain `Phaser prototype`, and the main story UI must not appear. Phaser is loaded from CDN for this experiment; offline access is not supported. No changes to saves or current story implementation.
