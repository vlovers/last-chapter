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
