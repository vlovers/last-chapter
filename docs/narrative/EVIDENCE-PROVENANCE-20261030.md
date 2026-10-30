# Evidence provenance and detective boundaries — 30 October 2026

This is a continuity contract for the five-day manuscript investigation. It is not an in-game document, and it must not be mistaken for a new canonical revelation. The purpose is to prevent future scenes, epilogues and tests from silently upgrading a guess into a proven fact.

## What the story establishes

| Source                         | Supported observation                                                                                     | What it **does not** establish                                                                                            |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Eleanor's bookshop ledger      | A box numbered 17 was used for drying papers after the flood. The recipient field was left blank.         | Who received the box, who placed a sheet inside a novel, or whether the pencilled 17 on a found page identifies that box. |
| Workshop photograph            | The workshop shelf bears a **7** with a nearby scratch; it is not evidence of a workshop box numbered 17. | Manuscript custody, theft, or authorship.                                                                                 |
| Iris's remembered illustration | The found page has two stars, while Iris remembers a three-star mark associated with her mother's work.   | A handwriting match, the identity of the writer, or consent to inspect Iris's private originals.                          |
| Thomas's flood account         | Thomas carried wet books during the flood.                                                                | That he witnessed the manuscript being placed in a novel or knows the box recipient.                                      |
| Two manuscript fragments       | The endings and paper edges differ.                                                                       | That they are alternate endings of one work or by the same writer.                                                        |
| Missing ledger recipient       | No recipient name was recorded.                                                                           | A deliberately concealed recipient, a crime, or the absence of a recipient.                                               |

The ledger can resolve **what the number of a bookshop box was** without resolving **what the same-looking number on the manuscript means**. Those are separate propositions. Likewise, a private recollection may be narratively meaningful without becoming publicly admissible evidence.

## Gameplay boundaries

1. The case review is available after the ledger scene and a manuscript-provenance decision. The optional crosscheck is entered from the authorship topic in `src/content/case-closure.ts`.
2. The new crosscheck in `src/content/case-evidence-audit.ts` distinguishes ledger, photograph, memory and inference. Checking the box is required before choosing an audit outcome; star and recipient checks require their earlier story flags.
3. The star comparison reads only the player's already-known observations. A breached letter never grants access to originals, an exhibition, or a new manuscript examination.
4. Publishing an unsupported “missing recipient” claim remains a consequential earlier choice. A later request to retract it is **a request**, not a confirmed retraction. Neither the editor's response nor the audience's reaction is invented.
5. An accusation can be attempted, but Nora refuses to publish it and Eleanor withdraws the ledger. A refusal to publish is not a retroactive erasure of the player's action.
6. The epilogue describes the recorded outcome without naming an author, restoring Iris's trust, inventing a witness, or assuming the contents of a private letter were shared.

## Integration and regression checks

- `tests/case-evidence-audit.test.ts`: source separation, access conditions, rumor follow-up, route completion, epilogue and structural constraints.
- `tests/case-closure.test.ts` and `tests/case-closure-ensemble.test.ts`: existing route and save compatibility.
- `tests/paper-study-custody.test.ts` and `tests/iris-evidence-final.test.ts`: independent consent and trust boundaries.
- `tests/manuscript-denouement-path.test.ts`: the bookshop box number remains verifiable even when manuscript authorship is unknown.

**Editorial rule:** if a future scene claims that the pencilled number proves the box's provenance, that the workshop photo says 17, that a blank ledger cell identifies a person, or that two stars establish authorship, it needs genuinely new on-screen evidence and explicit tests. Do not infer those conclusions from the existing flags.

The draft PR still needs normal integration and browser QA before merge; this document is not a release approval.
