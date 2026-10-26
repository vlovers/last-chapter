# Last Chapter — narrative coverage audit and integration gates

Date: 2026-10-26. Scope: authored narrative branch and PR #23. **Document audit only, not runtime verification.**

## Shipped vs authored

PR #23 reports playable Miller, Mara and Anna customer orders, catalog, journal, mobile overlays and interactive Frank. It is open and stacked on feat/gameplay-visual-polish-v1. At last check Browser QA failed while CI was running; do not merge without checking latest runs.

Authored on this narrative branch but **not verified playable**:
- customer-orders-v2: Thomas, Nora, Iris, Leo and Eleanor orders.
- mystery-clue-graph-v1: testimony/document/inference/rumor separation.
- character-conflicts-v1: five confrontation sketches.
- ordinary-lives-v1: six cozy scenes.
- deep-dialogue-nora/thomas/mara/iris/eleanor-v1: five optional long conversations.
- oliver-sophie-cozy-arcs-v1: six optional scenes featuring **proposed**, not approved, residents.
- five-day-playable-story-map-v1: placement, pacing and Day 1 vertical slice.

## Character audit

| Person | Authored | Gap to close |
|---|---|---|
| Miller | Order, rumor, conflict | Ordinary non-gossip beat and rumor retraction consequence |
| Mara | Order, long talk, cozy scene | Bakery timetable and independent identity |
| Anna | Order, conflict, cozy scene | Day 5 book-club payoff for chosen book |
| Thomas | Order, testimony, long talk | Distinguish carrying chairs from archive access |
| Nora | Order, date hint, long talk | Require inspection of original documents |
| Iris | Order, privacy reaction, long talk | Guarded alternative if letter was opened |
| Leo | Order, map recollection, conflict | Standalone non-mystery conversation |
| Eleanor | Order, long talk, conflict | Alternate entrance after public accusation |
| Frank | Ambient moments | Never a mandatory clue detector |
| Oliver/Sophie | Six warm optional drafts | Canon approval, schedule, assets, cat-safe décor |

## Contradiction prevention

1. Missing manuscript page, sealed letter and archive inventory are distinct until actual evidence links them.
2. Anna saw Thomas carrying chairs, not entering an archive or possessing a key.
3. Nora remembers mismatched dates; only inspection of **both** originals verifies a discrepancy.
4. Leo's interest in railway maps is not evidence of theft.
5. A disliked book suggestion cannot permanently block a day.
6. Public rumor changes reputation, not objective evidence.
7. Iris's privacy breach is not undone by buying a book.
8. Eleanor's Day 5 long talk precedes the final public decision.
9. Do not introduce nonexistent catalog IDs; PR #23 documents only five real catalog books.
10. New flags must be mapped to existing saves before runtime integration.

## QA scenarios

| Path | Expected |
|---|---|
| Skip all optional talks | Five-day spine remains playable |
| Decline to open letter | Its contents remain unknown |
| Inspect only one dated record | Discrepancy remains unverified |
| Spread Miller's rumor | Social consequences, no guilt proof |
| Reject first recommendation | Another suggestion possible |
| Reload after purchase | No duplicated receipt or reward |
| Breach Iris privacy | Guarded dialogue persists |
| Publicly accuse Eleanor | Later greeting acknowledges conflict |
| Skip proposed residents | No ending references to them |
| Never pet Frank | Story completion unaffected |

## Implementation order

**P0:** fix PR #23 Browser QA, check stacked PR parent, crosswalk story IDs, book IDs, day gates and save flags.

**P1:** integrate Thomas/Nora orders, independent Day 3 record comparison, Iris/Leo privacy variants, Eleanor order and finale.

**P2:** integrate deep conversations with early exits, ordinary-life scenes, Leo's independent cozy scene, Anna book-club payoff; consider Oliver/Sophie after canon approval.

## Duration warning

The stated 4–5h main and 7–9h expanded targets are not verified by authored word counts or measured playthroughs. Do not report them as implemented duration. Avoid padding the game with repeated narration; add actual conversations, shop activities and meaningful consequences.

## Explicit status

This file changes documentation only. No gameplay integration, test execution, QA success, PR merge or release is claimed.
