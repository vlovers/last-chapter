## Purpose
<!-- Explain the user-facing or engineering problem and the intended result. -->

## Changes
<!-- Summarize the cohesive changes. -->

## Verification
<!-- List exact commands, test results and CI links. Mark unrun checks explicitly. -->

## Risk and rollback
<!-- Note save-game compatibility, narrative-state changes, privacy/security implications, and rollback. -->

## Narrative and UX review (if applicable)
<!-- Explain player-visible dialogue, choices, accessibility and localization changes. -->

## Test matrix (complete relevant rows or write N/A)

| Area | Evidence / result |
| --- | --- |
| Formatting, lint, typecheck, unit tests, build | Commands and results, or N/A with reason |
| Browser smoke / manual playthrough | Browser, scenario, outcome, or not run |
| New game, continue, save and reload | State transitions verified, or N/A |
| Choice consequences and dialogue continuity | Branches exercised, or N/A |
| Localization and keyboard accessibility | Languages and interactions checked, or N/A |
| Assets and attribution | Source, license, credits and publication status, or N/A |

## Release checklist
- [ ] Relevant automated tests passed (or failures explained).
- [ ] Manual playthrough performed where player-facing behavior changed (or marked untested).
- [ ] Dialogue options remain relevant to the current conversation, and choice counts fit the UX limit.
- [ ] State migrations, save compatibility and day-end progression checked when affected.
- [ ] No secrets, personal data or unlicensed media added.
- [ ] Independent review requested; do not self-approve.
- [ ] Merges and releases remain separate explicit decisions.
