# Printed rumor — fifth-day continuity note

## What the player can actually establish

Seven years before the playable week, Eleanor used box 17 to dry loose manuscript
pages after the flood. The pencil mark in her ledger establishes storage
provenance, **not** the author of either excerpt or the warning. The workshop
photograph shows a scratched 7; it is not a second record of box 17. Iris's
letter to Leo was hidden separately in a book during the same flood.

The fifth-day printed program is a **new social consequence**, not a new clue.
Mrs Miller printed a claim that the final manuscript page was found. No one
has found that page. Even if she has already corrected her rumor aloud,
copies of the older program can still circulate.

## Character tensions

- **Miller** paid for the print run, resents being confronted and initially
  defends the attention the headline brought to the bookstore. She may
  correct herself, but a spoken correction is not automatic forgiveness.
- **Nora** wants a memorable headline and knows that temptation makes her
  particularly responsible for separating a correction from new speculation.
- **Mara** dislikes seeing another person's private life advertised as an
  evening attraction. She is allowed to be sharp and impatient.
- **Iris** may refuse to explain her feelings or appear as the spokesperson
  for a correction. A disclosed breach of her letter remains a breach.
- **Eleanor** offers paper and a marker, not access to the private ledger.

## Playable outcomes

The player can post a short anonymous factual correction, withdraw the
remaining programs, ask Miller to acknowledge the false claim herself,
or allow distribution to continue. The last option deliberately has a
negative consequence: more guests carry the false headline home.

No choice establishes manuscript authorship, reveals the private ledger
to the audience, forces Iris to speak, or instantly repairs trust. Some
programs have already left the bookstore, so even a careful correction
cannot reach every reader.

## Implementation and acceptance

- Entry: `src/content/rumor-program.ts`, from day five's `gathering` hub.
- Requires completed case closure, Iris having heard the ledger finding,
  and the earlier Miller rumor. Do not show after Iris declines the case
  conversation or after this scene is completed.
- All routes return to `gathering`; no node has more than four choices.
- `src/game/endings.ts` distinguishes all four outcomes.
- `tests/rumor-program.test.ts` covers route reachability, serialized
  progress, consent gates, earlier corrections and epilogue consequences.
