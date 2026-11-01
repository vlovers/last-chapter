# Narrative production V2

This pass continues PR #12 on its existing PR #10 → PR #9 dependency chain.
Starting head: `e20b7dc4e162b20ee328e566295fbdbec2fdb041`. Work is isolated in a
new worktree; the original checkout's untracked files are untouched.

## Playable continuity map

| Day | Required visits                                 | Optional life of the shop                                                      | Evidence and unresolved questions                                                                                           |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | Miller → Mara → old reservation box             | Book preferences, bakery, cinema memories, Frank                               | Envelope names Iris and Leo; reservation has no collection signature. Opening it is a separate breach.                      |
| 2   | Iris → Anna → Leo                               | Illustration commission, classroom books, railway training and music           | Iris remembers the closure; Leo describes his own assumptions. Neither can speak for the other's past intentions.           |
| 3   | Eleanor → Thomas → Nora → club or quiet evening | Lamp repair, school chairs, loaned books, club debates, cat and closing chores | Closure records and missing call confirmation; manuscript page, pencil 17 and workshop window are independent observations. |
| 4   | Iris → Mara → Leo                               | Exhibition, bakery shift and recipe, travel plans                              | Iris wrote the letter. Offering delivery is not permission. Stars, handwritten warning and box theory remain hypotheses.    |
| 5   | Reading gathering → closing → season epilogue   | Customer orders, reader debates, character callbacks, school and bakery plans  | Compare fragments/photo/journal; settle custody, public claims and private boundaries without inventing authorship.         |

The manuscript route remains optional whether the club was attended or skipped.
The letter, rumor, manuscript and ordinary bookshop outcomes are independent.
An end-of-conversation return does not advance the day or perform an offscreen
conversation. Morning/afternoon/evening changes are authored at stage boundaries.

## A — Critical corrections

- Removed same-visit reports of completed classroom activities, a new concert
  invitation, a conversation with Anna and a second umbrella exhibition.
- Anna's day-two reading is tomorrow; Thomas's day-three missed help is today.
- Iris's fear concerns rereading her own letter, not discovering another
  person's handwriting. Admitting opening it does not invent disclosure of its
  contents. A concealed breach is player knowledge, not automatic NPC knowledge.
- Day-four exits account for the envelope staying behind the counter and Leo
  carrying his parcel. The reservation card is not acquired on a skipped topic.
- The ledger proves that the bookshop used box 17; it does not authenticate the
  pencil mark on the loose page. This follows the later provenance contract in
  `EVIDENCE-PROVENANCE-20261030.md`, superseding the older case bible's claim of
  certain handwriting recognition.
- Miller adds her unsupported headline to prepared programs after hearing the
  player's suggestion, not before that evening's conversation exists.
- Selling Anna's reserved copy to Miller no longer assumes Miller was unaware
  of the competing order she had just discussed.

## B — Days one and two

Eleanor hands over the key through a practical opening action. Frank appears at
the counter before the mystery begins. Miller's empty jar is a reminder sample,
not simultaneously the jar she is trying to recover. Her memory anecdote ends
with a concrete errand rather than a repeated lesson.

Mara reacts separately to the door joke and thanks for the buns; the remembered
door joke brings a late wooden wedge on day four. Iris actually opens the
wordless book the player asked to see. Her art conversations concern a specific
sketch, publisher and caption. Anna's reflection now answers the question about
reading aloud and follows a concrete classroom mistake. Leo answers the shift
and town questions with work and local details before discussing uncertainty.
Existing return/decline choices remain valid throughout.

## C — Days three and four

Eleanor's responsibility now distinguishes the failed telephone during the flood
from her later failure to check the boxes. Her shelf conversation responds to
the new layout, and her reflection uses the morning routine, photographs and a
specific table. Thomas discusses uneven work and money in his own terms without
disclosing consultations. Nora does not claim knowledge of Thomas's conversation
with the player. Her photograph, private letters and publication work remain
separate objects.

Iris's completed exhibition choice cannot be reopened through the art detour to
acquire both mutually exclusive outcomes. Her marginal-note permission covers
her own recollection, not ownership of an unidentified found page. Mara answers
the question about the epistolary gift rather than discussing trains. Leo's tea
anecdote now accounts for the actual labeled containers.

Rechecked discovery order: reading Eleanor's note before the reservation no
longer assumes Leo's identity. Opening the letter and then comparing the card
records the card observation. Questions wait for Eleanor's actual third-day
visit. The workshop star has no invented prior-day observation or visible glue
side at night.

## D — Final gathering and epilogues

The final day now explicitly moves from morning preparation to evening guests.
The reading program offers three published books with different ensemble
responses and epilogues. It needs no investigation flags and can be deferred,
resumed and completed once. Neither the private letter nor manuscript is put in
the public program. Older saves can still close the evening directly.

The season summary now retains both concealed and admitted letter breaches and
the player's own rumor responsibility. A later good deed does not erase either.
Iris's one-picture decision survives the general exhibition scene and epilogue;
reading a manuscript passage no longer invents a publicly shelved copy. The
mutual conversation is not performed twice at closing. Eleanor catches her own
old ownership habit. Miller responds to the actual book sold on day one. The
shared-table discussion no longer reopens a letter decision already completed.

## Compatibility and validation

Existing stage, node, option and consequence flag identifiers are retained.
No save schema change or migration is required for prose corrections. A loaded
in-progress scene resolves revised narration from the same persisted facts.

Baseline on Node 22.12.0: `npm ci`, then `npm run check` passed (232 test files,
2148 tests). npm reported the existing eslint-visitor-keys engine range warning
(22.13+); it did not prevent installation or checks. Subsequent package results
and browser evidence are recorded at the end of this document when run.

Narrative review here is an authorial continuity/editing pass. Independent human
Ukrainian reader testing and a measured episode runtime are not implied.
