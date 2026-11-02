# Release candidate verification

Starting remote: `57b0192d6a4727d7bfde85b3ab4b71abe06e668a`.
Stack: PR #9 → #10 → #12, unchanged. Isolated worktree; the original checkout's
untracked files are untouched. Earlier narrative V2 work is retained.

## Actual remaining inventory

- Focus: latest upstream already fixes programmatic conversation focus and nested
  closed details. A second direct summary with an explicit tabindex still bypasses
  the visibility test. Cover native DOM behavior as well as selector-aware mocks.
- Narrative: two manuscript edge descriptions disagree; early admitted letter
  breaches can bypass the late-breach paper-study boundary. A ledger reply asks
  a question without showing an answer and treats Eleanor's record as Iris's property.
- Mobile: add 320×568, 360×780 and 375×812 to the existing responsive suite;
  verify scene/dock dimensions through changing replies, not only on opening.
- Playthroughs: extend the existing shared journey fixture beyond its five letter
  variants, with cooperative/confrontational/minimal/maximal evidence and optional
  scenes; keep save restoration and noncontradictory endings checked.
- Release: execute required quality commands, browser suites, Frank and finale
  matrix on the integrated head. Record evidence and explicit readiness.

## A — Accessibility

Only the first direct summary of a collapsed details group is reachable. The
conversation section retains programmatic focus at tabindex -1 and remains out
of sequential keyboard navigation. A native DOM fixture in mobile Browser QA
checks selector matching, section focus, hidden sections, expanded/nested details
and restoration to a visible fallback.

Validation: Node 22.12.0, npm ci; baseline npm run check passed (247 files / 2317
cases). Package A check passed (247 / 2318); real Chrome mobile QA at 390×844
passed with no browser errors. Existing bounded owned-process teardown was used
when Chrome did not close gracefully after successful assertions.
