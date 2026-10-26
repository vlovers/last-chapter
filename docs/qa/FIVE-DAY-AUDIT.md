# Five-day scenario QA — working audit

The first-pass game is playable through the five-day chapter graph. This is **not** a certification of complete narrative continuity or a measured playtime.

## Automated checks

- Every playable stage is checked for dangling dialogue destinations.
- Each stage must have at least one reachable terminal scene under a permissive prerequisite set.
- Save payloads reject duplicate/empty/oversized flags and history entries.
- Prior Day 1–5 scenario tests cover selected consent, privacy, recommendations and epilogue callbacks.

## Known gaps

1. The graph walk is permissive about flags granted in _earlier_ chapters. It does not prove that a particular complete five-day choice sequence can obtain every gated option.
2. A reachable terminal does not prove all intended dialogue branches are reachable or narratively coherent.
3. The full five-day journey needs browser E2E coverage, save/resume across each stage, and a manual Ukrainian-language editorial review.
4. The narrative currently has far fewer scenes and books than the desired 4–5-hour main path.
5. GitHub Actions may report `action_required` due to repository permissions; this is not a passing CI result.
6. Original pixel-art production is pending. The art brief describes a target, not finished assets.

## Next release gates

- Expand a cross-day model-based test using only flags actually earned along reachable paths.
- Add browser tests for desktop, mobile and keyboard navigation.
- Verify a clean `npm ci && npm run check` on an authorized runner.
- Replace the CSS room only after an original pixel-art vertical slice has been reviewed.
