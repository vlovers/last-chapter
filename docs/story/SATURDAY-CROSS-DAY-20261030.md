# Saturday at the counter — cross-day continuity (30 October 2026)

## Narrative purpose

The Saturday conversation is an **optional** fifth-day encounter between Mara and Leo. It only appears when the player has actually completed both earlier personal conversations:

- Mara's pear-roll recipe and the choice of recognition, a small bookshop trial, or keeping the recipe private.
- Leo's Greyford training plan and the choice of application, shift negotiation, or postponement.

It is not a new ending to the manuscript mystery. It gives two ordinary lives a shared space while preserving their separate decisions. No path may invent a confirmed course admission, a booked oven, a second shift agreed by June, or a scheduled public tasting.

## Nine cross-day combinations

| Mara's earlier decision | Leo's earlier decision | Final conversation                            |
| ----------------------- | ---------------------- | --------------------------------------------- |
| Bookshop trial          | Application            | Small batch possible, admission pending       |
| Bookshop trial          | Shift negotiation      | Oven and June's second shift unconfirmed      |
| Bookshop trial          | Postponement           | Two trial rolls, Leo's seaside rest           |
| Recipe credit           | Application            | Mara's printed name, Leo's pending answer     |
| Recipe credit           | Shift negotiation      | Bakery sign versus June's shift request       |
| Recipe credit           | Postponement           | Bakery sign and Leo's seaside postcard        |
| Private recipe          | Application            | Neither plan is announced publicly            |
| Private recipe          | Shift negotiation      | Private recipe, no unapproved shift           |
| Private recipe          | Postponement           | Mara's recipe and Leo's weekend remain theirs |

All nine variants use the same optional topic but different spoken text. The player can separately discuss Mara's recipe, Leo's timetable, and the bookshop's blank calendar. Finishing the conversation removes only this topic; the individual Mara and Leo callbacks remain available.

## Playable acceptance routes

1. Complete Mara's recipe conversation and Leo's training conversation on their respective earlier days. Save after day four, reload, and enter the fifth-day gathering. The Saturday topic must appear.
2. With **private recipe + postponed course**, talk to Mara. Only the private-recipe answer is available. Return, talk to Leo. Only the rest answer is available. Leave the table. The epilogue must not announce a tasting or enrolment.
3. With **bookshop trial + shift negotiation**, ask Mara about a trial batch, Leo about June, and Eleanor about the blank calendar. Offering a blank sheet must **not** book either person's time or announce an event.
4. With **recipe credit + application**, discuss both outcomes and finish. The epilogue may mention Mara's bakery credit and Leo's pending response, never a confirmed admission.
5. Start the fifth day without one of the two earlier conversations. The shared Saturday topic must be absent, while any individually earned callbacks remain available.
6. Finish the optional conversation, return to the gathering, save and reload. The shared topic must not reappear.
7. Confirm every new dialogue node has no more than four authored choices and all destinations resolve.

## Implementation and regression

- Content: `src/content/saturday-plans-final.ts`
- Fifth-day entry: `src/content/day-five.ts`
- Epilogue: `src/game/endings.ts`
- Automated tests: `tests/saturday-plans-cross-day.test.ts`

**Guardrails:** A suggestion is not consent. Mara's private recipe is never displayed or promised for sale; June's availability cannot be assigned by Leo or the player. The calendar remains blank until the characters choose to add themselves. No part of this subplot identifies the author of the missing manuscript.
