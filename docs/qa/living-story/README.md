# Living Story v0.2 — issue #40

Base: `origin/main` / `f8996ae638b72c7f31c2649fa7b258333ee6111c`. One review PR; no merge or deployment.

## Acceptance and implementation

1. **Dialogue:** a fixed responsive dock, measured word-boundary prose pages, complete answer rows on a separate pager, history, keyboard navigation, touch targets and safe-area padding. Short player turns share a page with the reply when both fit. The canvas does not resize with a reply. `scripts/qa-dialogue.mjs` exercises the real page controls.
2. **Acting:** existing character sheets retain idle/walk animation; authored moods drive restrained speaking mouth/hand/nod cues. Visitors face the bookseller. No new third-party artwork.
3. **Director:** typed authored movement, facing, gestures, cat poses, waits, exits and camera commands. A bounded deterministic timeline holds narration until its actions complete. Skip/reduced motion settle endpoints. Closing interrupts callbacks and settles the pose. Reload reconstructs the saved beat; presentation never changes story flags. Core visit entrances/departures and selected Leo/Frank beats are staged.
4. **Environment:** all saved chapter stages map to authored morning/day/dusk/night and clear/cloudy/rain conditions. The window sky, rooftops, sun/moon, rain and room grade visibly vary. The system uses neither wall-clock time nor randomness.
5. **Completion:** alternate phrasings of the Anna school, Eleanor shop and Thomas lamp topics share completion visibility. The Thomas lamp topic is one-shot. Existing edge IDs and completion keys remain valid. Legacy ledger reconstruction, suspension, evolving topics and intentional repeatability remain covered.
6. **Narrative:** Leo day two opens with the practical course/shift dilemma. Application, shift negotiation and rest have distinct decisions and day-four follow-through, preserving the existing day-five career callbacks. His Mara conversation becomes a specific failed conversation about her bakery table. Miller, Anna, Thomas, Iris and Eleanor openings establish immediate wants; day-four Leo and the final gathering retain the same continuity. Ukrainian prose and the school-reading timeline are tested.

## Visual evidence

The before images were captured from the exact base before edits. Both sides use the authored day-two Leo greeting at the same viewport; the old base still shows the departing previous visitor while the new authored entrance settles before narration.

| Viewport   | Before                        | After                       |
| ---------- | ----------------------------- | --------------------------- |
| 1440 × 900 | [before](before/1440-leo.png) | [after](after/1440-leo.png) |
| 360 × 800  | [before](before/360-leo.png)  | [after](after/360-leo.png)  |
| 390 × 844  | [before](before/390-leo.png)  | [after](after/390-leo.png)  |

Motion: [start](after/1440-movement-start.png), [mid-walk](after/1440-movement-mid.png), [settled](after/1440-movement-end.png), [speaking A](after/1440-speaking-a.png), [speaking B](after/1440-speaking-b.png). The browser assertions record positions and differing speaking angles, not merely screenshots of one pose.

Environment: [cloudy morning](after/weather-miller.png), [clear day](after/weather-anna.png), [rainy dusk](after/weather-mara.png), [rainy night](after/weather-evening.png), [clear night](after/weather-season-complete.png). [Staged Frank](after/390-frank-staged.png).

The dedicated browser matrix covers 1440×900, 360×800, 390×844, 320×568, 768×1024 and 844×390, including stable height across prose/choice pages, four authored options, reload, history, keyboard, catalog and journal. [Raw results](after/results.json).

## Remaining limitations

- The director is an extensible presentation system, not complete choreography for every incidental gesture in the large legacy script. The finale still presents one active visitor at a time; the prose names an ensemble, not simultaneously simulated actors. Core entrances/exits and selected Frank/Leo actions have explicit cues.
- Missing visual targets are skipped without blocking the conversation. Reload reconstructs a beat from its beginning rather than saving sub-frame animation progress.
- Transcript history contains the last 80 presentation entries of this browser session; it is not a separate durable save ledger. Reading-page position resets on reload, while narrative progress is preserved.
- Pixel artwork remains deliberately minimal. This is not a full new animation-sheet production pass.
- Chromium desktop emulation does not certify Safari, Firefox, physical phones, screen readers or audio listening. Independent Ukrainian editorial/read-aloud review and measured episode runtime remain release work.
- Existing production bundle-size advisory remains; no check is disabled to hide it.

Verification commands and exact results are recorded in [verification](VERIFICATION.md). Browser-plugin connection failed because its native bridge was unavailable; local Playwright/Chrome performed the actual browser checks.
