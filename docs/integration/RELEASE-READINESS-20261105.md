# Five-day integration and release-readiness audit

This audit extends [PR #38](https://github.com/vlovers/last-chapter/pull/38).
It makes the integration reviewable; it does not authorize a merge or certify a
finished 40-minute release. Related work: issues #11, #17 and #34.

## Initial audit and isolation

Fetched all origin branches before modifying code. `origin/main` was
`4bbf4142b0bb991493df7ebd424eab12737c20bb`, the bootstrap baseline. The playable
PR base remains `feat/narrative-production-v1-20261025` at
`c5580f19495d11e82770ac9ed5054590915b279d` (PR #12). Retargeting the stacked
integration to `main` would introduce the entire production history; that is a
human integration-order decision.

| PR                                                     | Exact audited HEAD                         | Review / Actions at the start                                                | Integration treatment                                  |
| ------------------------------------------------------ | ------------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------ |
| [#33](https://github.com/vlovers/last-chapter/pull/33) | `062bcf9c4d5525531d0e53e1ae1c7de4bdde77e6` | No reviews; quality/browser failures                                         | Exact ancestor of #38; inherited once                  |
| [#35](https://github.com/vlovers/last-chapter/pull/35) | `131b6add0884746ce6f21f089efdf7a36b375a92` | No reviews; quality passed, UX/browser failed                                | Exact ancestor of #38; inherited once                  |
| [#36](https://github.com/vlovers/last-chapter/pull/36) | `e73ec77a0df63a6327b1871f59f87968039759b1` | No reviews; quality failed, browser suites passed                            | Exact ancestor of #38; no duplicate continuity PR      |
| [#38](https://github.com/vlovers/last-chapter/pull/38) | `3a888020dbf1f2ac464d2b227a04d54e35699399` | No reviews; quality and 13/14 CI browser suites passed; 390px core cancelled | Reused for this combined runtime/content/browser batch |

The consequence branch, PR #37 at
`a554fce3710a3638450f4eb2e5105838b69dfcbf`, is also an exact ancestor.
Merge `1eb62e5517804826e3f73116447f5f1e825479dd` joins that narrative lineage
with PR #35. Subsequent commits in #38 already repair the timing-dependent Enter
assertion and seed actual inference evidence in the journal browser fixture.
Diffs, ancestry, review records and Actions were inspected independently.

Work took place in `/private/tmp/last-chapter-release-readiness-20261105`, on
`fix/release-readiness-20261105`, based on #38. The unfinished
`integration/narrative-ux-20261105` checkout, `.idea` and `conflict-backup` were
not edited. No other repository, merge, force-push or release is part of this work.

Read the working agreement, contribution/localization policy, architecture, save
format, testing guide and prior narrative audits. Reviewed chapter transitions,
both dialogue engines, completion/suspension/variant rules, storage ownership,
endings, journal provenance, interaction presentation and browser runners.

## Reproduced defects and fixes

| Defect                                                                   | Reproduction                                                                                                                                            | Corrected behavior and regression                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A rejected save loses its only original record and sidecars              | A duplicate pending ledger makes real progress unreadable; constructor clears conversations/notes and the next `greet` replaces the chapter             | Preserve exact chapter/service/conversation/note strings in a local recovery archive before cleanup. Failed backup/readback protects originals and keeps the fallback unsaved. Twelve unit cases and browser export/reload checks cover this boundary |
| Iris denies a fact she has just learned                                  | Play from Day 1 through `ledger-tell-iris`, then `final-iris-evidence-topic` → `final-iris-evidence-rumor`                                              | Iris acknowledges the ledger's historical box record, while physical discovery, authorship and the pencil mark remain unproven. Keeping the ledger private does not grant Iris that knowledge                                                         |
| A completed optional topic starts another conversation without a request | In Mara's optional book debate, choose `leave` / “Повернімося до роботи”; the panel stays open, displays that goodbye, and switches to “Після закриття” | Completion returns to the shop and restores keyboard focus. Reopening deliberately offers remaining topics; completed progress survives reload and the goodbye is not replayed                                                                        |
| A successful narrative job still times out                               | [Run 42070187073](https://github.com/vlovers/last-chapter/actions/runs/42070187073), job 127395687660                                                   | Move `late-confession` and `concealed` from `core` to `daily`, balancing the six existing narrative jobs. All ten routes still run at both widths; no assertion or timeout was relaxed and no jobs were added                                         |

No authored option/node IDs, main save key/version, objective facts, source grants
or existing route assertions were removed. The prose change is one conditional
reply. Backup data remains outside the deterministic simulation and is never
treated as valid narrative state. See [the recovery contract](../SAVE-FORMAT.md#unreadable-save-recovery).

The new targeted unit regressions initially produced **7 failures / 5 passes**:
six missing data-protection behaviors and Iris's informed response. After the
fixes, all targeted cases pass. Additional coverage exercises failed/no-op backup
writes, unchanged-snapshot deduplication and five complete finale routes.

### Valid sidecar progress after a read failure

The deeper browser audit reproduced a second loss boundary with a valid chapter:
a transient denied notes read showed an empty editor and overwrote the old text;
a denied optional-conversation read restarted a completed topic. A separate unit
reproduction shows a valid recommendation-attempt history replaced with an empty
list after its initial read fails.

The fix loads optional sessions as a group and offers a read retry before accepting
replies. Notes remain protected until their read retry succeeds. Recommendation
history stays protected until reload, with a catalog notice; chapter choices and
receipts can still persist independently. Three browser regressions cover notes,
an active conversation and a completed conversation, including successful retries.
The recommendation regression failed before the fix and passes afterward.

## Historical failures and cancellations

- PR #33 quality job `126962096608` stops in Prettier on unescaped Ukrainian
  apostrophes in `eleanor.ts` and `first-day.ts`. Later test/build steps never ran.
- PR #36 quality job `127039151220` stops on formatting in nine files. The
  integrated baseline passes formatting; its old failure is not a current test
  failure.
- PR #35 UX job `126963465720` fails “Immediate Enter cannot consume the next
  node”. #38 already replaces that elapsed-time-dependent check with prose-focus
  isolation and deterministic stale-button activation. Both checks pass locally.
- The reported original seventeen integration test failures do **not** reproduce
  on the audited #38 HEAD: the untouched baseline passes **276 files / 2,917
  tests**, formatting, lint, TypeScript and build. The historical report does not
  identify all seventeen assertions; this audit does not invent their identities
  or claim that the user's unfinished checkout passes.
- GitHub explicitly annotates the cancelled 390px core job: “The job has exceeded
  the maximum execution time of 20m0s”. Its five routes nevertheless complete
  with empty error arrays: 155, 103, 101, 104 and 101 selections, with 26 reloads.
  The scenario step is recorded as successful and artifacts upload before the
  overall job finishes as cancelled. Cancellation is not counted as a CI pass.
- The same original five-route shard passes locally. The new assignment reduces
  core from five to three scenarios and expands daily from two to four. The
  existing coverage test still proves that each of the ten scenarios runs once
  at 360px and once at 390px. Historical job setup sometimes consumes several
  minutes; the 20-minute limit remains unchanged.

No workflow reruns or empty commits were requested. The final push should trigger
one consolidated set of checks; remote status belongs to that exact commit.

## Final narrative QA matrix

| Day | Audited gameplay and consequences                                                                                                                                                                                                                         | Save / regression evidence                                                                                                         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Miller's rumor/observation distinction, amplification and withdrawal; both orders; Mara's three book choices and greeting callbacks; opened/sealed letter                                                                                                 | Ten fixed journeys, 80 deterministic varied routes, existing rumor/greeting fixtures, active-conversation and boundary reloads     |
| 2   | Iris privacy boundaries, Anna's classroom/book decisions, Leo gift and consent callbacks; prior choices retained                                                                                                                                          | Full journeys and legacy replay; existing Day 2 order/continuity/knowledge tests                                                   |
| 3   | Eleanor's uncertain call versus dated records; Thomas accountability; Nora; optional book club and quiet manuscript discovery                                                                                                                             | Both evening routes and historical Day 3 checkpoint graphs; completed topics and transitions into Day 4                            |
| 4   | Three gift memories and no-purchase legacy fallback; Iris/Leo/Mara pressure versus respect; relationship choices and journal discoveries                                                                                                                  | Existing gift/consent/consequence fixtures; every-selection current/legacy reloads; progression through all three visitors         |
| 5   | Early/late/concealed letter breach, mutual conversation, secret kept, three public readings, public admission of rumor amplification, new false report with correction/deflection, Eleanor accusation versus unknown call, evidence custody and epilogues | Seven new earned-from-Day-1 finale journeys; ten existing fixed journeys; ending/custody matrices; final ending reload and restart |

The varied route matrix starts without injected story facts. It selects only
currently authored, available IDs via the production adapter, restores after
every selection, and alternates current saves with legacy saves lacking ledgers.
It checks stage, all flags, rendered text and available options across reloads;
each rendered choice page stays within four choices. This is a bounded simulation
matrix, not eighty pointer-only browser playthroughs or exhaustive graph proof.

Browser journeys separately use real touch choices and pagination at 360×780 and
390×844, checkpoint/branch reloads, all five completed timeline entries, ending
restoration and restart. UX QA covers nine viewports from 320×568 to 1440×900,
including 844×390 landscape, safe long Ukrainian text, transient player speech,
rapid activation, keyboard focus, journal navigation and reachable controls.

Recovery UI was visually checked at 320×568. These screenshots contain synthetic
QA progress only:

![Recovery notice on a small phone](../qa/release-readiness/320-recovery-notice.png)

![Local recovery archive download in the journal](../qa/release-readiness/320-recovery-download.png)

## Verification record

Use Node **22.23.4** and npm. Local optional browser tooling is
`/private/tmp/lc-v2-playwright/node_modules/playwright/index.mjs`; the game gains
no browser-test dependency. The in-app browser connection was unavailable, so the
existing repository Playwright runners were used. Artifacts are under
`/private/tmp/last-chapter-release-qa` and logs under
`/private/tmp/last-chapter-release-*.log`.

`BASE_URL=http://127.0.0.1:5198` denotes the isolated Vite server; production UX
and performance use `http://127.0.0.1:4198` and the built output. Browser commands
set `PLAYWRIGHT_MODULE=/private/tmp/lc-v2-playwright/node_modules/playwright/index.mjs`
and a separate `QA_OUTPUT` directory for each suite. All commands below passed;
no tests were disabled or skipped.

| Command                                                                | Observed result                                                                                              |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `npm ci --no-audit --no-fund`                                          | 141 packages installed using Node 22.23.4                                                                    |
| `npm run check`                                                        | Formatting, ESLint, TypeScript, **279 files / 2,938 tests**, production build passed                         |
| `npm run test:narrative`                                               | **7 files / 63 tests** passed, including all three new regression files                                      |
| `npm audit --audit-level=high --json`                                  | Exit 0; 0 high/critical, 7 moderate development-tool advisories                                              |
| `npm run test:browser`                                                 | **5/5** standard browser cases passed                                                                        |
| `npm run test:browser:v5`                                              | All five days completed; ending and timeline restored; no browser errors                                     |
| `npm run test:browser:mobile`                                          | **10/10** results, including eight viewports, focus/interaction checks and the five-day order route          |
| `node scripts/qa-frank-overhaul.mjs`                                   | **3/3** viewport interaction cases passed; no errors                                                         |
| `node scripts/qa-finale-matrix.mjs`                                    | **12/12** ending combinations and **3/3** UI result fixtures passed                                          |
| `QA_WIDTH=360 QA_GROUP=core node scripts/qa-narrative-v2.mjs`          | **3/3** complete journeys passed                                                                             |
| `QA_WIDTH=390 QA_GROUP=core node scripts/qa-narrative-v2.mjs`          | **3/3** complete journeys passed                                                                             |
| `QA_WIDTH=360 QA_GROUP=investigation node scripts/qa-narrative-v2.mjs` | **3/3** complete journeys passed                                                                             |
| `QA_WIDTH=390 QA_GROUP=investigation node scripts/qa-narrative-v2.mjs` | **3/3** complete journeys passed                                                                             |
| `QA_WIDTH=360 QA_GROUP=daily node scripts/qa-narrative-v2.mjs`         | **4/4** complete journeys passed                                                                             |
| `QA_WIDTH=390 QA_GROUP=daily node scripts/qa-narrative-v2.mjs`         | **4/4** complete journeys passed                                                                             |
| `npm run test:browser:save-recovery`                                   | **7/7** scenarios passed; actual downloaded bytes match the original archive                                 |
| `npm run test:browser:ux`                                              | **9/9** viewports passed on both dev and production builds, plus legacy/long-text/optional-completion checks |
| `npm run test:browser:polish`                                          | **5/5** result fixtures passed                                                                               |
| `npm run test:browser:stabilization`                                   | **17/17** cases passed on the clean rerun                                                                    |
| `npm run test:browser:performance`                                     | **2/2** production cases at 1×/4× CPU; median **59.85/59.91 FPS**, stable 31 scene objects, no errors        |
| `git diff --check`                                                     | Passed                                                                                                       |

The six final narrative shards contain **20 complete browser journeys, 2,682
touch selections and 112 reloads**, with no scenario errors. The earlier original
five-route 390px core reproduction is separate evidence and is not double-counted.
The new unit coverage adds **21 tests** to the audited 2,917-test baseline.

Some successful local runners used their existing five-second owned-browser
shutdown fallback and exited 0. Its dedicated regression verifies that an original
assertion failure still exits 1. An initial strengthened export test used the
unsupported remote `download.path()` API; it was corrected to `download.saveAs()`
while retaining the exact-content assertion, and the seven-case rerun passed.

The first stabilization attempt was interrupted by a Vite hot reload while
formatting source; its screenshot shows the opening veil back over the toolbar.
The clean rerun passes **17/17 cases**, including all fifteen customer/book pairs,
120 overlay cycles with stable listeners/objects, long text, rotation, reduced
motion and a larger compatible save. That interrupted attempt is retained in the
local log and is not represented as a passing run.

## Remaining risks and release blockers

- Human review and the integration order of PR #12/#38 remain required. The
  playable stack has not been merged into bootstrap `main`.
- Independent Ukrainian editorial/read-aloud review and an actual episode timing
  pass remain outstanding. A tested five-day route is not evidence of a finished
  40-minute experience.
- Two chronology-incompatible early Anna/Thomas routes remain loadable for legacy
  saves, as documented in the prior consequence audit. Canonical later callbacks
  are tested. Retiring historical nodes needs an explicit content migration.
- Bounded graph diagnostics still report truncated exploration. Unwitnessed
  scenes in a truncated traversal are not labelled proven unreachable. Tests
  cover representative histories, not every mutually dependent optional order.
- Recovery exports preserve data for manual repair; they do not automatically
  repair ambiguous corruption. Repeated incidents can fill browser storage;
  failure then protects existing data and warns about unsaved play.
- Chrome/Chromium browser QA does not establish Safari/Firefox, real-device,
  screen-reader or audio-listening acceptance. The in-app browser was unavailable.
- The existing Phaser production bundle remains about 2.21 MB uncompressed and
  produces Vite's size advisory. No size threshold was disabled.
- The locked development-tool chain reports seven moderate advisories involving
  `minimatch` and TypeScript ESLint packages. The existing high/critical audit gate
  passes; dependency upgrades are outside this narrative integration batch.
- Final GitHub Actions must be checked on the pushed SHA. Historical green checks
  and a locally passing cancelled shard do not substitute for that result.
