# Last Chapter v0.3 — Visual Refresh

## Direction

Match the supplied preview's **visual language**: dark indigo, restrained violet accents, readable light dialogue, framed portraits and warm lighting inside a crisp pixel-art world. The preview is conceptual, not an existing scene or a source of production-ready sprites.

## Dependency and safety

This work is based on PR #41 head `42ace816c358dd82d77943d104996a3636c09d86`, not `main`. PR #41 must pass its blocked browser QA before any integration. Do not modify the user's local worktree or merge this design branch before #41. Keep Actions runs minimal.

## Token palette

| Role | Hex |
| --- | --- |
| Background | `#0b1020` |
| Dialogue surface | `#151329` |
| Elevated choice | `#211d3a` |
| Border violet | `#9668e0` |
| Highlight | `#b79aff` |
| Primary text | `#eeeaff` |
| Secondary text | `#b4b0d0` |

## UI hierarchy

1. World scene remains the primary visual: characters, weather, interactive bookshop.
2. Quiet top HUD: day, location, objective, journal/catalog/settings.
3. Stable dialogue dock: portrait, speaker, short paged text, history, up to four complete answers. Never hide text or options.
4. Secondary screens: catalog, notes, journal, settings, endings; all use the same tokens.
5. Mobile: retain safe-area support, minimum 44px tap targets and enough visible game scene.

## Work packages

### A. Foundation — started

Apply tokens and dark surfaces to header, HUD, dialogue, portrait frame, choices, buttons, focus, welcome overlay. **Presentation-only:** preserve existing dimensions, stacking, pointer events, DOM order, save schema and narrative state.

### B. Full UI

Audit all remaining parchment/wood styles; build consistent panels for catalog, journal, notes, settings and endings. Check focus contrast, 320/360/390 widths, 1280/1440 desktop and landscape.

### C. Pixel-art production

Produce original sprites and portraits at defined pixel density, with provenance and licensing. Add expression states, richer staging and atmospheric lighting. Do not substitute generated mockups for playable assets.

### D. QA and release

Run `npm run check`, browser polish, mobile, UX and five-day journeys. Test real pointer clicks at Miller and Iris continuation checkpoints to prevent the PR #41 interception regression. Compare before/after screenshots at 360×800, 390×844, 1280×900 and 1440×900. Test keyboard, reduced motion, saved games, dialogue pagination and all endings.

## Current limits

The first commit is a CSS-only visual foundation and this specification. It does **not** add an isometric bedroom, sprite sheets, new portraits, new gameplay, or fix PR #41 CI. Browser QA and screenshot acceptance are pending; do not label the design production-ready.

## Slice 2 — secondary UI and portrait backdrop (implemented, pending QA)

- Catalog book cards, search, filters and cover frames use the shared indigo/violet palette.
- Journal tabs, evidence cards, people entries, notes paper and receipts now have coherent dark surfaces with differentiated rumor/inference accents.
- Settings and modal backdrops use the same contrast and focus colors.
- The deterministic 64×80 canvas portraits use a new indigo/violet stage and a warm bookshop sidelight. Face silhouettes, character-specific hair/clothes and mood geometry remain intact; this is **not** a full character redraw or new animation set.
- Browser theme-color updated to match the new surround.
- No changes to save state, story data, scene commands, viewport geometry or hit targets.

### QA still required

Inspect actual rendered portrait legibility, color contrast and text overflow on all named screens. In particular, check long book descriptions, notes textarea, journal tabs and 360×800 choices. Run `npm run check` and browser suites after PR #41's click-interception fix. The design branch is intentionally not a release candidate.

## Slice 3 — environment color pass (implemented, pending QA)

The existing native 640×360 bookshop painting has a controlled palette update: blue-black camera surround, indigo plaster and window reveal, violet-shadowed wainscot, floor base and reading rug. The original shelf positions, furniture geometry, world collision footprints, door, window panes, character pathfinding and interactive hotspot coordinates are unchanged. Warm wood, honey and lamp colors remain in place to retain the bookshop's human atmosphere instead of applying a flat purple filter.

This is **not** the isometric room from the concept image; converting the scene to isometric projection would require new art, navigation and hit-testing and must be scoped separately. The next visual QA should compare the same story checkpoint across day/night and weather, with characters and dialogue both visible, and assess text/world contrast.

No runtime browser validation or visual screenshot review has been performed for this commit. The PR #41 pointer-interception blocker still prevents release approval.

## Slice 4 — day/night atmosphere consistency

- Morning, daylight, dusk and night now use distinct indigo-family sky/rooftop palettes in the existing window panes; the warm bookshop lamp remains a contrasting in-world light.
- Fixed a real atmosphere bug: the per-frame reading-lamp flicker previously forced brightness back to the evening baseline after `setEnvironment({time:'day'})`. It now preserves the selected daylight/night baseline through animation and `reset()`.
- Added focused Vitest coverage for light intensity across update/reset and for four distinct sky palettes. These are source changes only until CI or local tests confirm execution.

No new geometry, weather schedule, story state, sprites or DOM interactions were changed. PR #41 still needs browser QA repaired before integration.
