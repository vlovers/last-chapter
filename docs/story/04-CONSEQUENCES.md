# Consequence and knowledge matrix — draft

## Required data model (design only)
- `Fact`: stable event or relationship truth, optionally a seeded authored variant at new game.
- `Statement`: what speaker said, to whom, when, whether firsthand or hearsay.
- `Belief`: a specific NPC's interpretation, possibly wrong.
- `Observation`: a witnessed detail with source, time and context.
- `Disclosure`: who passed what to whom, whether permission was granted.
- `Promise`: optional player commitment to a person.
- `Relationship`: trust, tension, familiarity and history (do not expose as simplistic moral score).

## Major decision table
| Choice | Immediate | Later | Non-negotiable |
|---|---|---|---|
| Listen to Miller | Gains sighting note | Can ask about credibility | Never automatically proves affair |
| Repeat rumor to Anna | Anna worries | Thomas relationship strained; Miller may be confronted | Truth of Thomas's meetings unchanged |
| Tell Miller you cannot verify | Miller may tease player | Lower chance rumor spreads via player | Miller retains agency to gossip elsewhere |
| Ask Iris about old reservation | She may reveal her account | Unlocks delivery investigation | She can refuse personal details |
| Open sealed letter | Gains private content | Iris may feel betrayed if discovered | Reading cannot retroactively make letter delivered |
| Return letter to Iris | She chooses what to do | Possibility of future conversation | Player cannot force Iris to send it |
| Tell Leo without Iris's consent | Leo surprised; Iris may be hurt | Trust shifts, Mara may seek clarity | No forced relationship breakup |
| Hold letter securely | No public reveal | Future follow-up possible | Not a universal 'bad' ending |
| Recommend book after listening | Visitor feels understood | Later callback about book | Book never directly overrides free will |

## Tests that implementation must include
1. No NPC can mention a fact without a recorded source or explicit prior knowledge.
2. Repeating rumor never upgrades its epistemic status to confirmed.
3. Objective facts remain fixed across different player action sequences with same starting seed.
4. The letter's recipient can be deduced without opening the envelope.
5. Skipping optional personal topics never blocks basic book orders.
6. All end states show the actual disclosure history, not a hidden 'goodness' score.
7. An NPC's refusal to discuss confidential material never counts as incriminating evidence.

## Replay design
A new run can vary which side customers arrive, their reading preferences and order of optional encounters. Major episode truths (lost letter, no affair in this episode) stay stable in v1. Future variants must be separately authored and tested; do not randomize intimate secrets without a full consistency matrix.
