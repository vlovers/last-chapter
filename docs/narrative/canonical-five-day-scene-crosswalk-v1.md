# Last Chapter — Canonical five-day scene routing and state crosswalk

**Status:** integration specification only, not game code or tested runtime. **Date:** 2026-10-26. **Priority:** replaces the *plot routing* of `five-day-playable-story-map-v1.md`, which was written for an alternate missing-page/archive mystery. **Canonical source:** `docs/story/07-FIVE-DAY-DRAMATIC-MAP.md`. All identifiers below are **proposed aliases**, not verified engine IDs. Codex PR #23 already has three playable orders; preserve their actual state schema.

## Global design constraints

1. A day advances through existing shop progression, not by completing optional dialogue. All critical information must have a direct shop/environment route.
2. The undelivered letter, reservation card and closing log form the mystery spine. No stolen manuscript, archive break-in or invented culprit.
3. Privacy and evidence are separate dimensions. An unopened letter can still be traced through the shop's records.
4. Anna/Thomas/Nora rumor is an independent social story. Nora never confirms her clients. Do not conflate it with Iris/Leo.
5. Each character's optional conversation is interruptible, repeatable only where sensible and never grants an unseen clue.
6. Day 5 public event completes even when no mystery disclosure is made.
7. Game-facing text is Ukrainian. Draft labels here are for implementation planning.

## Scene registry — proposed IDs

| ID (proposed) | Day | Priority | Entry | Preconditions | State / result | Safe fallback |
|---|---:|---|---|---|---|---|
| `shop_open_d1` | 1 | Core | start day | none | shop initialized | default existing opening |
| `reservation_card_inspect` | 1–4 | Core | old reserved book | object available | reservation observed | retry at shelf |
| `sealed_letter_discover` | 1–4 | Core | inspect book | object available | sealed letter found | retry at shelf |
| `sealed_letter_privacy_choice` | 1–4 | Core choice | envelope action | letter found | open / keep sealed / postpone | default postpone, no auto-open |
| `order_miller_day1` | 1 | Existing PR #23 | customer | existing schedule | order receipt | order can be skipped |
| `order_mara_day1` | 1 | Existing PR #23 | customer | existing schedule | order receipt | order can be skipped |
| `town_departure_rumor` | 2 | Core | ordinary visitor | day 2 | Leo/Iris story heard as rumor | shop-counter fallback |
| `thomas_nora_rumor_intro` | 2 | Optional/social | Miller visit | day 2 | heard / challenged / amplified / declined | no player-blame if skipped |
| `order_anna_day2` | 2 | Existing PR #23 | customer | existing schedule | order receipt | order can be skipped |
| `iris_return_visit` | 2–4 | Character | ordinary shop visit | day >=2 | Iris encountered | optional short shop dialogue |
| `closing_log_inspect` | 3–5 | Core | shop ledger | day >=3 | leak log observed | retry from counter |
| `shelf_location_match` | 3–5 | Core investigation | compare card/log | both available | plausible displacement inference | text comparison if no UI |
| `eleanor_leak_account` | 3–5 | Core support | Eleanor short talk | day >=3 | testimony about moved books | log remains available |
| `anna_private_worry` | 3–4 | Optional/social | Anna visit | rumor state optional | branch-dependent tone | neutral opening |
| `nora_privacy_boundary` | 3–4 | Optional/social | Nora visit | none | no client disclosure | generic book talk |
| `thomas_work_account` | 4–5 | Optional/social | Thomas visit | none | self-disclosed stress only | never infer from Nora |
| `iris_letter_consent` | 4–5 | Core choice | Iris short encounter | letter known | return / consider / private delivery consent / refuse | consent never implied |
| `leo_letter_account` | 4–5 | Core support | Leo short encounter | day >=4 | testimony he didn't know letter | no forced contents reveal |
| `letter_transfer` | 4–5 | Conditional | direct exchange | Iris consent + recipient acceptance + possession | exactly one delivery event | deferred/declined without loss |
| `miller_public_retraction` | 4–5 | Optional/social | town conversation | player previously amplified | apology heard if present | no fake acknowledgment |
| `anna_thomas_private_talk` | 5 | Optional/social | shop window | both present | interpersonal afterbeat | offscreen life continues |
| `anna_bookclub_day5_callback` | 5 | Optional/cozy | Anna visit | none | receipt-dependent story | no-order branch |
| `reading_evening_d5` | 5 | Core | scheduled shop event | day 5 | event starts | default book reading |
| `public_record_statement` | 5 | Conditional core choice | reading evening | inspected facts | factual/uncertain statement | no invented records |
| `iris_public_speech` | 5 | Conditional | reading evening | explicit Iris consent + present | Iris speaks on her terms | no speech if absent |
| `private_letter_ending` | 5 | Core choice | reading evening | none | letter content withheld publicly | available even if player opened privately |
| `closing_epilogue` | 5 | Core | end of reading | event completed | ending persisted | neutral shop epilogue |

**Core** means the interaction route must exist; it does not mean the player must click it to advance every day. Avoid accidental softlocks if a user never inspects the book.

## State groups — proposed, map to real save schema

**Physical observation**: card seen; letter found; log seen; shelf match observed. Only these can support document facts.

**Privacy and custody**: letter unopened/opened; possession (shop/returned to Iris/delivered to Leo); Iris explicit delivery consent; Iris explicit public speech consent; privacy breach disclosed. Consent must have a provenance (actual dialogue choice), not a derived relationship threshold.

**Social rumor**: Miller sighting heard; player amplified/challenged/declined; player publicly retracted; Thomas personally heard retraction. Player route is mutually exclusive for a single Day 2 encounter.

**Orders and cozy callbacks**: use existing order receipts, selected **real** catalog book ID and completion day. No duplicate receipt or callback reward.

**Knowledge**: every journal claim has source and classification (observed record / testimony / rumor / inference). A plausible displacement inference is not a proved delivery history.

## Day-by-day mandatory path and alternate routes

### Day 1 — bookshop first, letter second

- Opening, Frank ambient, normal customer orders.
- Old reserved book remains interactable after orders and after reload.
- Player can leave letter unopened or defer investigation; no day-end requirement to open.
- Day-end ledger persists only observed items and completed orders.

**Minimal path:** open shop → interact with ordinary store → close day. If letter was missed, preserve it on Day 2+.

### Day 2 — two unrelated rumors

- Town's old belief that Leo ignored Iris can be heard from a visitor without Miller order.
- Miller's sighting of Thomas and Nora is a separate optional scene; do not tie it to Leo's letter.
- Iris appears for her own reason; player can discuss books without interrogating her.
- Anna's book order remains independent of her marriage worries.

**Minimal path:** ordinary visitor → optional encounters skipped → close day.

### Day 3 — inspect the shop's history

- Closing log available from a stable location.
- If card and log inspected, player may compare dates; location/shelf detail is required for stronger displacement inference.
- Eleanor's memory supplies context but does not establish intent.
- Nora's book visit does not function as an evidence gate.

**Minimal path:** inspect log (or skip and leave available later) → close day.

### Day 4 — personal agency

- Iris can choose whether the letter is returned, privately delivered or left untouched.
- Leo can report whether he knew about a letter, but cannot be forced to accept it.
- Mara speaks for herself; player cannot select who Leo should love.
- Thomas can disclose his financial worry on his own terms; not via Nora.
- Player may retract their own earlier gossip only if they spread it.

**Minimal path:** short Iris/Leo route remains available; day can still close if deferred.

### Day 5 — reading, not a trial

- Public event always starts. Player may state inspected public facts, withhold letter, invite Iris **only if she consented**, or simply listen to readings.
- A letter not opened must never be quoted; even an opened letter is not public property.
- Anna's book-club callback uses the actual Day 2 receipt or its no-order fallback.
- The epilogue is based on events the player witnessed or decisions they made.

**Minimal path:** reading evening → no mystery statement → closing epilogue.

## Edge cases / fallback rules

1. Letter left at shelf through Day 4: discoverable later; no phantom delivery.
2. Player opens letter then never tells Iris: privacy breach persists, but Iris does not magically know.
3. Player gives letter back to Iris: Leo delivery route disappears unless Iris herself explicitly initiates a new transfer.
4. Iris agrees to delivery but Leo declines: consent remains, delivery=false, letter custody unchanged.
5. Iris agrees to private delivery but not public speech: no public invitation choice.
6. Player hears Miller gossip but doesn't amplify: no public confession option.
7. Player misses Day 2 Miller scene: social arc can proceed offscreen, but game must not attribute rumor to player.
8. Player misses Day 3 log: Day 5 statement uses uncertainty, not an invented verified timeline.
9. Anna order skipped: Day 5 callback uses the no-order version.
10. Any NPC absent from a scene: no offscreen lines or magical knowledge.
11. Save migrated from earlier version: unknown new fields default to unknown/untouched, never opened/delivered/accused.
12. If existing runtime already owns the ending, route new scenes through explicit compatibility mapping; don't create competing finale triggers.

## Integration work packages

**P0 — source inventory:** extract actual game day gates, dialogue scene IDs, catalog IDs, save version/migrations and ending triggers from current branch including Codex PR #23; produce a verified mapping table.

**P1 — letter vertical slice:** card → sealed letter choice → closing log comparison → consent → optional private delivery; test sealed and opened paths.

**P2 — social parallel:** Miller/Anna/Thomas/Nora scenes with independent rumor state and Nora's confidentiality guard; never connect this to letter evidence.

**P3 — callbacks and finale:** Anna Day 5 receipt-dependent book club, public reading, privacy-aware ending, epilogue; verify no double triggering.

**P4 — playtest:** short path with all optional dialogue skipped; long path with conversations; save/reload at every day boundary; mobile overlays; physical phone and Safari remain unverified until tested.

## Acceptance matrix

| Scenario | Required outcome |
|---|---|
| Skip all optional orders | Five days finish, letter remains discoverable |
| Leave letter sealed | Contents never shown, investigation can still progress |
| Open letter secretly | Breach saved, Iris unaware until explicit disclosure |
| Inspect only log | No proven link to specific reserved book |
| Inspect card+log+shelf | Plausible displacement inference, not motive |
| Iris refuses transfer | Leo never receives letter |
| Leo refuses transfer | Delivery flag remains false |
| Amplify Miller rumor | Later social consequences, never an affair proof |
| Challenge Miller rumor | No false confession option |
| Ask Nora about Thomas | No client confirmation |
| Anna order completed | Day 5 callback matches actual selected book |
| Anna order skipped | Day 5 no-order callback |
| Iris not consenting to public speech | No public speech option |
| Reload after transfer | No duplicate letter or receipt |
| End without investigating | Cozy reading and ending still reachable |

## Editorial handoff

- Canonical letter scenes: `canonical-letter-investigation-v1.md`.
- Canonical gossip scenes: `canonical-miller-thomas-nora-v1.md`.
- Day 5 Anna callback: `anna-bookclub-day5-v1.md`.
- Canon reconciliation: `canon-reconciliation-20261026.md`.
- **Do not implement** the alternative archive theft logic in `mystery-clue-graph-v1.md`, `day5-finale-branches-v1.md`, or older scene-map drafts without author approval.
