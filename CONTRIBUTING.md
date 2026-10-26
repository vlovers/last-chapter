# Contributing — Last Chapter

Last Chapter is a Ukrainian-language narrative browser game. Keep changes scoped, preserve deterministic story progression, and treat dialogue, character knowledge, and player-facing prose as product behavior.

## Development environment

Use Node.js and npm versions supported by the repository's CI. The active game branch currently defines these scripts:

```sh
npm ci
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:browser
npm run check
```

Run the checks relevant to the change and record exact commands and outcomes in the PR. Do not claim a check passed unless it was actually run. Browser QA scripts may require a local browser/runtime; report unavailable checks explicitly.

## Narrative and architecture requirements

- Keep deterministic narrative simulation/state transitions separate from DOM and persistence; follow the architecture documented in `AGENTS.md` and `docs/`.
- Distinguish rumor, observation, and confirmed truth. Characters may act only on information they plausibly know; player choices must not rewrite objective facts retroactively.
- Player-facing text must be natural Ukrainian (`uk-UA`). Update localization, story, character, and dialogue documentation when canon or consequences change.
- Add deterministic regression tests for dialogue branches, knowledge, trust, event order, and consequential state changes where relevant.
- Do not add unlicensed assets. Document provenance and render imported/dynamic text safely.

## Pull requests and safety

Open a scoped PR with linked issue, acceptance criteria, summary, verification evidence, risks, documentation impact, and rollback/recovery notes where applicable. Obtain independent review and required CI checks before merge. An AI review is not an authorized GitHub approval.

Never commit credentials or private personal information, weaken failed checks, or merge/deploy/publish/change security settings without explicit maintainer authorization. Do not modify unrelated repositories or claim unfinished features are implemented.

See [agent agreement](AGENTS.md), [review policy](docs/engineering/REVIEW_POLICY.md), and [release checklist](docs/engineering/RELEASE_CHECKLIST.md).
