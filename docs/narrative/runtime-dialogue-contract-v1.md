# Narrative runtime contract V1 — integration-ready, not integrated

**Scope:** proposal for a typed, declarative dialogue layer. This document does not change the current engine, scene registry or saves. Before implementation, compare this contract with the actual Phaser 5 scene manager, current dialogue state, catalog and migration system. Avoid building a second parallel dialogue engine.

## Design requirements

1. Narrative authored data stays separate from Phaser rendering.
2. Nodes are deterministic and replay-safe; choices only change explicitly declared flags.
3. The game may render dialogue as a stable overlay, with the world paused or running based on current UX.
4. Scene availability is computed from day, character presence, prior state and once-only completion.
5. Evidence has a provenance category and can only be recorded if the player actually heard/read it.
6. Every optional conversation can be exited immediately; all branches terminate.
7. No global morality score, automatic forgiveness, or hidden relationship reset.
8. Localization is Ukrainian; avoid creating untranslated English fallbacks.
9. Authored long dialogue is not proof of actual playtime.
10. If an existing engine already supports these semantics, adapt this data into it instead of rewriting runtime code.

## Suggested TypeScript model (illustrative)

```ts
type Day = 1 | 2 | 3 | 4 | 5;
type EvidenceKind = 'observation' | 'testimony' | 'record' | 'inference' | 'rumor';
type Condition =
  | { kind: 'day'; value: Day }
  | { kind: 'flag'; id: string; equals: boolean }
  | { kind: 'character_present'; id: string }
  | { kind: 'scene_completed'; id: string; equals: boolean };
type Effect =
  | { kind: 'set_flag'; id: string; value: boolean }
  | { kind: 'journal'; entryId: string; evidenceKind: EvidenceKind; sourceId: string }
  | { kind: 'complete_scene'; sceneId: string };
type Choice = { id: string; text: string; next: string; when?: Condition[]; effects?: Effect[] };
type Node =
  | { id: string; type: 'line'; speaker: string; text: string; next: string }
  | { id: string; type: 'choice'; choices: Choice[] }
  | { id: string; type: 'end'; effects?: Effect[] };
type DialogueScene = {
  id: string;
  day: Day;
  characterIds: string[];
  priority: 'required' | 'optional';
  when: Condition[];
  start: string;
  nodes: Node[];
  canExit: boolean;
};
```

All identifiers are examples until reconciled with existing code. A node's next must reference a node in the same scene; no implicit cross-scene jumps.

## Complete small example — Oliver's unread book

```json
{
  "id": "cozy_oliver_unread_day2",
  "day": 2,
  "characterIds": ["oliver"],
  "priority": "optional",
  "when": [
    { "kind": "day", "value": 2 },
    { "kind": "character_present", "id": "oliver" },
    { "kind": "scene_completed", "id": "cozy_oliver_unread_day2", "equals": false }
  ],
  "start": "opening",
  "canExit": true,
  "nodes": [
    {
      "id": "opening",
      "type": "line",
      "speaker": "oliver",
      "text": "Пропоную посперечатися про книжку, якої ми обоє не читали.",
      "next": "choice_open"
    },
    {
      "id": "choice_open",
      "type": "choice",
      "choices": [
        { "id": "play", "text": "Спробуймо.", "next": "game" },
        { "id": "decline", "text": "Не сьогодні.", "next": "bye" }
      ]
    },
    {
      "id": "game",
      "type": "line",
      "speaker": "oliver",
      "text": "Судячи з обкладинки, це історія про людину, яка не вміє паркувати човен.",
      "next": "guess"
    },
    {
      "id": "guess",
      "type": "choice",
      "choices": [
        { "id": "sun", "text": "Маяк ревнує до сонця.", "next": "sun_reaction" },
        { "id": "mail", "text": "Море вкрало всі листи.", "next": "mail_reaction" },
        { "id": "accountant", "text": "Бухгалтер боїться води.", "next": "accountant_reaction" }
      ]
    },
    {
      "id": "sun_reaction",
      "type": "line",
      "speaker": "oliver",
      "text": "Мені вже шкода сонце.",
      "next": "done"
    },
    {
      "id": "mail_reaction",
      "type": "line",
      "speaker": "oliver",
      "text": "І пошта нарешті знайшла винного.",
      "next": "done"
    },
    {
      "id": "accountant_reaction",
      "type": "line",
      "speaker": "oliver",
      "text": "Це найкраща книжка, яку я не читав.",
      "next": "done"
    },
    {
      "id": "bye",
      "type": "line",
      "speaker": "oliver",
      "text": "Тоді я програю сам собі. Це вже традиція.",
      "next": "done"
    },
    {
      "id": "done",
      "type": "end",
      "effects": [{ "kind": "complete_scene", "sceneId": "cozy_oliver_unread_day2" }]
    }
  ]
}
```

This example deliberately has **no mystery flags** and **no book sale**. If Oliver's actual NPC ID differs, adapt it. If the game lacks Oliver sprites, do not silently substitute another character.

## Journal provenance and gate example

A question asked during Anna's order may record testimony:

- entryId: anna_saw_thomas_chairs
- evidenceKind: testimony
- sourceId: anna
- precondition: player explicitly selected the optional question
- wording: «Анна бачила Томаса зі стільцями біля архіву; не знає, чи він заходив усередину».

A direct inspection of an original document may record:

- entryId: archive_inventory_date
- evidenceKind: record
- sourceId: archive_inventory_original
- precondition: successful inspection of that actual document in current game world

**Forbidden:** converting the first into proof that Thomas entered the archive, or using Nora's memory of a date as if the original record had been inspected.

## Scheduler semantics

- First show required shop interactions that are actually available.
- Surface no more than 2–3 optional invitations per day, at most one long-form invitation by default.
- This is a **soft surfacing limit**, not a ban on actively initiating another conversation.
- Do not spawn a character just because their authored scene is available.
- Optional prompts expire naturally when a character leaves; their scene can be rescheduled only if continuity allows.
- Day transitions must never wait for an optional scene to finish.
- If the player chooses exit, record the visit only when current design wants to avoid repeating the greeting; do not mark it as completed unless the dialogue reached an end.
- Every scene has one clear entry and explicit end nodes.

## Safe save strategy

Persist only durable state:

- completed scene IDs (unique set)
- per-order chosen catalog ID and completed stage (reuse current engine)
- canonical relationship/letter-privacy flags (reuse current engine)
- journal entry IDs with provenance (reuse current engine if present)

Avoid persisting entire node trees or arbitrary effect scripts. For old saves, default unknown optional scene IDs to not completed; never change existing ending flags. Schema migration must be versioned and covered by tests.

## Static content validation

A pre-integration validator should reject:

- duplicate scene IDs or node IDs
- missing start or broken next references
- unreachable end nodes
- choices with zero options
- cycles with no exit
- unsupported effect kinds
- unknown character IDs, book IDs, or flag IDs after registry mapping
- evidenceKind=record with no direct-inspection source
- required scenes gated behind optional completion
- dialogue longer than UI limits without pagination

## Test scenarios

1. Oliver game reaches done from all five terminal routes (three guesses, decline, and external exit).
2. Scene completion survives reload and does not replay automatically.
3. Decline has no relationship penalty.
4. Unknown node ID fails validation rather than crashing during play.
5. A rumor never mutates a document record flag.
6. Day 5 can complete without any optional long dialogue.
7. A character absent from the scene cannot trigger a conversation.
8. Previously breached Iris privacy cannot be reset by purchasing a book.
9. All choices render on narrow mobile viewports without scaling the Phaser world.
10. Save migration preserves preexisting day, inventory and endings.

## Integration sequence

**Phase 0:** inspect existing dialogue/scene engine and map identifiers; do not implement from this document blindly.

**Phase 1:** integrate one tiny optional Oliver scene and its static validator into the existing engine. Verify on desktop and mobile.

**Phase 2:** wire one order (Anna), including book recommendation and journal provenance. Verify save/reload and wrong-book handling.

**Phase 3:** integrate Nora's deep scene with proper skip and completion state. Measure actual duration.

**Phase 4:** integrate remaining packs, deduplicate overlapping openings, and run five-day regression tests.

**Definition of done:** playable in the existing Phaser build, every authored branch reachable, no duplicate scenes on reload, mobile overlay stable, CI green, and narrative QA approved. None of these are claimed as complete by this document.
