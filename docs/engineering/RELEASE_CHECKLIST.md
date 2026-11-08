# v0.2 release acceptance checklist

This checklist governs the **current Phaser Living Story implementation** in `main`. It is an evidence log, **not** authorization to tag, deploy or publish. PR #41 was merged as `46bfb96`; its [PR-head CI #2547](https://github.com/vlovers/last-chapter/actions/runs/42440820434) passed 15/15, but that does not establish release-head CI or physical-device acceptance. Keep the authoritative acceptance record in [issue #42](https://github.com/vlovers/last-chapter/issues/42).

## Exact-build and automated gates

- [ ] Identify candidate commit SHA, package version, target environment and intended release/tag; do not silently promote `0.1.0` to v0.2.
- [ ] Record a successful CI run on the **exact candidate SHA** (format, lint, types, unit tests, build, audit and relevant browser suites). For each failure/cancellation, record status; do not borrow success from an earlier SHA.
- [ ] Exercise missing, corrupt and old-version saves, temporary storage denial, future-version save protection, restart, Frank state and journal sidecars. Attach browser evidence and versions.
- [ ] Review known bundle-size/performance warnings, dependency audit findings and rollback/recovery instructions.

## Manual game and device acceptance

- [ ] Physical iPhone/Safari and Android/Chrome: all five days, an ending and replay; record OS/browser, 320/360/390/430px, landscape, safe-area, dialogue dock, four-choice layout, `#story-continue` touch targets and screenshots.
- [ ] Desktop Safari and Firefox; keyboard-only, 200% zoom, reduced motion, focus and accessible names. Record limitations and blockers rather than inferring accessibility from Chromium tests.
- [ ] Independent Ukrainian editorial review: all key characters, consent, provenance versus inference, repeated topics, continuity, player agency and ending consequences. Record reviewer, route and defects.
- [ ] Measure actual first-playthrough and replay duration; do not publish unmeasured 40-minute or 4–9-hour claims.
- [ ] Confirm rights and attribution for every distributed image, font, music, sound and other third-party asset.

## Release decision

- [ ] Reconcile README, roadmap, changelog, release notes, version, screenshots, deployment instructions and known limitations against the candidate SHA.
- [ ] Record independent diff review and maintainer's explicit release decision in #42, including any accepted limitations.
- [ ] Only after approval: tag/deploy, verify the deployed origin, and record URL, version, commit SHA, checks and rollback path.

**Reporting rule:** mark unperformed checks **NOT RUN**, unverified assertions **NOT VERIFIED**, and failed checks **FAILED**. No checklist entry is satisfied by an agent's assertion without supporting evidence. Historical QA remains in [release candidate record](../release/RELEASE-CANDIDATE.md).
