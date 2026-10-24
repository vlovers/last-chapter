# Last Chapter — playtest direction (25 October 2026)

## Evidence from the target player's interview
Highest priorities: **twists > humor > mysteries > romance > friendship > drama**. Favorite character profile: morally ambiguous, guarded, smart, vulnerable over time, with behavior that challenges what they say. Preferred interaction: collect things, complete tasks, progress a shop, discuss characters deeply. Cozy presentation: warm light, silence, soft chairs, coffee and dark chocolate.

Avoid forcing slow-burn or friends-to-lovers romance, a forced possessive protector, or immediate melodrama. The player's preference for reading sealed letters must not be treated as proof that opening someone else's private letter is the right choice.

## Implemented slice
- Optional clue board under the existing journal
- Three gated collectible finds revealed by inspecting Frank, the counter, and shelves
- Fourth synthesis clue unlocked by collecting all three
- Clues persist within existing v1 save flags and don't gate the canonical story
- No copyrighted books, quotes, settings or proprietary character likenesses are imported

## Editorial roadmap (not implemented)
- Two competing interpretations of the shop's old reservation timeline; the player should have to distinguish an inference from evidence
- Character moments that reveal hidden vulnerability via earned trust, not a single conversation
- More shop-service tasks and collectible rewards tied to reading recommendations
- A properly foreshadowed day-five twist that preserves earlier player agency
- Mobile touch usability and physical-device accessibility checks

## QA checklist
Run `npm run check`, `npm run test:browser:v5` under the browser CI environment, verify the Frank hotspot, journal board, progressive evidence unlock, mid-task reload, and the 19-stage full playthrough. Human visual and editorial approval is still needed.
