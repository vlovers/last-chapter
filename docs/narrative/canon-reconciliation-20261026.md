# Last Chapter — Canon Reconciliation: the Letter, the Rumor, and the Missing Page

**Editorial status:** critical integration guard, 2026-10-26. **No runtime changes.** Read alongside `docs/story/07-FIVE-DAY-DRAMATIC-MAP.md`. This document identifies conflicts between the canonical five-day dramatic map and the optional narrative drafts; it does **not** silently rewrite canon.

## Editorial decision: canonical mystery spine

The current dramatic map centers on an **unreceived sealed letter from Iris**, an old book reservation, a date that undermines the town's account of Iris's departure, and the discovery that the reserved book was moved after a leak. The player decides whether to read or deliver a private letter and what to disclose at the public reading.

It also centers on a **separate rumor** about Thomas, Anna and Nora: Thomas's visits/financial shame and Nora's professional confidentiality must not be converted into an affair or an archive theft. Mara and Leo have their own relationship tensions. Eleanor is concerned with stewardship of the shop.

### Conflicting draft inventions — DO NOT IMPLEMENT as established facts

| Draft motif | Why it conflicts with the dramatic map | Editorial disposition |
|---|---|---|
| Missing manuscript page as the central mystery | Canon central object is a sealed letter in an old reserved book | **Quarantine** until author explicitly chooses a new central mystery |
| Stolen archive papers / identifying a thief | Canon does not establish theft or a culprit | **Remove as factual premise**; optional detective-fiction jokes only |
| Thomas carrying chairs outside archive | Canon rumor is about Thomas and Nora / financial stress; archive-access suspicion is unrelated | **Replace in implementation** with canon-consistent, privacy-safe observations |
| Nora verifying archive inventory vs event notice | Canon Nora protects confidentiality, not archive records | **Quarantine**; do not have Nora divulge clients or verify invented archive access |
| Leo's railway map as evidence | Canon Leo's key connection is an undelivered letter and uncertainty about Iris's departure | **Retain as hobby only**, never investigative proof |
| Iris's sealed letter treated as a clue about archive theft | Canon letter belongs to Iris's private history | **Retain letter and privacy choice**, never invent contents |
| Publicly accusing Thomas, Leo or Eleanor of stealing manuscript | No such crime established | **Replace** with canon-specific public choices about rumor, privacy and old town narrative |
| Day 3 'two original archive documents' required for verification | Canon investigation uses reservation card, closing log and Eleanor's account | **Map** to actual reservation/closing records; check runtime first |
| Day 5 ending cards implying page theft | No established stolen page | **Quarantine** and rewrite against the letter storyline |

**Important:** previous drafts remain in git as creative explorations. Their presence does not make them canon.

## What survives intact

- Order-writing technique: short book-buying path and optional deeper questions.
- Anna's Day 5 book-club callbacks to actual Day 2 book selection (provided the catalog mapping is real).
- Leo's ordinary-life scene, with no forced mystery clues.
- Cozy scenes and Frank's ambient behavior.
- Miller's curiosity, humor and defensiveness.
- Public retraction as a mechanic; **the subject of the rumor must change to canon**.
- Iris's privacy response if the player read her letter.
- Finale principle: distinguish confirmed facts, unverified interpretations and private material.
- The optional/mandatory distinction, save idempotency, accessible mobile dialogues.

## Corrected five-day investigative sequence

### Day 1 — reservation and letter
**Mandatory access:** inspect an old reservation card and find the sealed letter without opening it. Establish only the existence and apparent undelivered status. The card's date conflicts with the town's recollection of Iris's departure, but does not prove intent.

**Choices:** open the letter, keep sealed, postpone; document actual action. Never show contents on sealed route.

### Day 2 — stories people tell
**Mandatory access:** hear the town's claim that Leo ignored Iris and a separate, independently developing rumor about Thomas and Nora. A statement that someone was seen speaking to Nora is not proof of an affair or wrongdoing. Miller can repeat it; the player can question, amplify or decline.

**Choices:** preserve the distinction between observation and interpretation; meet Iris as an artist/person with her own reason to return.

### Day 3 — reconstruct what happened to the book
**Mandatory access:** inspect the **closing log** for a leak, inspect the **reservation record**, ask Eleanor what happened to the affected books. The records may support the plausible explanation that the book was moved and the letter not delivered. Do not claim it proves what Iris intended or what Leo would have done.

**Choices:** compare dates and object movement; keep Nora's confidentiality intact. Thomas's financial troubles can be acknowledged by him, not exposed through Nora.

### Day 4 — ask, don't deliver someone else's life
**Mandatory access:** Leo can say he did not know of the letter, but only if reached through a credible route; Mara gets a distinct voice. Iris may decide whether the letter is delivered and to whom. If the player opened it, that breach can be admitted or concealed; the consequences differ.

**Choices:** seek consent, privately convey facts, press publicly, or refrain. No mandatory romance outcome.

### Day 5 — a public reading without a public trial
**Mandatory access:** players choose whether to share verified public facts about the reservation and leak, publicly correct an earlier rumor, withhold private correspondence, or invite Iris to speak **if she freely agreed**. The public event remains about books.

**Choices:** do not reveal letter contents without consent; no thief accusation unless a separate canon change has established a theft mystery. Relationships can remain unresolved.

## Source and knowledge ledger

| Fact/claim | How player learns it | Evidence category | What it does NOT establish |
|---|---|---|---|
| Reservation card exists | Inspect card | OBSERVATION/DOCUMENT | That letter reached Leo |
| Sealed letter exists | Inspect book/envelope | OBSERVATION | Contents or sender's current wishes |
| Letter was delivered | Requires delivery event | EVENT | Leo's feelings or Iris's wishes |
| Town says Leo ignored Iris | Hear resident say it | RUMOR/TESTIMONY | That Leo received anything |
| Leak affected books | Inspect closing log | DOCUMENT | That Eleanor intentionally hid letter |
| Eleanor recalls moving books | Speak to Eleanor | TESTIMONY | Malice or knowledge of envelope |
| Leo says he never received letter | Ask Leo (when accessible) | TESTIMONY | That he would have reciprocated |
| Iris wants letter returned | Iris explicitly consents | CONSENT | Consent to public reading |
| Thomas met Nora | Someone reports sighting | TESTIMONY | Affair, wrongdoing, consultation details |
| Thomas has financial troubles | Thomas volunteers it | TESTIMONY | Anything about Nora's clients |
| Nora declines to confirm client | Ask Nora | PROFESSIONAL BOUNDARY | Confirmation that Thomas was a client |

## Cross-document remediation backlog

**P0, before integration**
1. Mark `mystery-clue-graph-v1.md` and `day5-finale-branches-v1.md` as **alternate draft, noncanonical**. Their archive/manuscript logic must not enter game code.
2. Mark the archive-specific material in `character-conflicts-v1.md`, `customer-orders-v1.md`, `customer-orders-v2.md`, `miller-rumor-consequences-v1.md`, and `five-day-playable-story-map-v1.md` as requiring canon mapping.
3. Preserve all existing authored content; create canon-aligned replacement scenes, not destructive silent rewrites.
4. Compare the actual Story Bible, Character Bible and runtime flags before adopting this document's suggested state keys.

**P1, editorial implementation packs**
- `canonical-letter-investigation-v1.md`: playable reservation → leak log → Eleanor account → Iris consent → Leo's account sequence.
- `canonical-miller-rumor-v1.md`: gossip about Thomas and Nora, no client disclosure and no proof of affair.
- `canonical-day5-reading-v1.md`: public reading variants tied to consent and verified records.
- Map the Anna book-club callback and Leo ordinary-life scene to existing catalog and day availability.

**P2, acceptance**
- A player who never opens the letter can finish the investigation and never sees its contents.
- A player who opens the letter without consent has a persistent breach flag.
- The game never implies Nora confirms Thomas is her client.
- The leak log can explain movement of the book without implying a conspiracy.
- A public reading cannot quote Iris's letter unless she explicitly authorizes it.
- The Thomas rumor affects relationships but never becomes proof of infidelity.
- Player can skip all optional deep conversations and complete five days.
- Save/reload never duplicates a letter delivery or public disclosure.

## Required author confirmation

Before implementing a missing-page/archival-theft mystery, ask whether it **replaces** the established undelivered-letter mystery, becomes a carefully integrated secondary plot, or stays discarded. Until then, the existing five-day dramatic map takes precedence.

## Editorial quality bar

No forced moral speeches. No invented culprit. No perfect romance as a reward. Cozy bookshop interactions must stand on their own, and people can remain annoyed after apologies.
