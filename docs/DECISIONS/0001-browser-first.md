# ADR 0001: browser-first foundation

**Status:** accepted for engineering bootstrap; revisit on evidence.

**Context:** Dialogue, personal secrets, provenance and player decisions matter more than physics or animation. An early backend, monorepo or game engine would increase overhead before the narrative vertical slice is validated.

**Decision:** use one Vite/TypeScript application, a pure deterministic narrative model and authored content fixtures. Build a disposable DOM-based UI first. Add no API, database, React, cloud service or mobile wrapper without a documented need.

**Consequences:** small surface and testable rules, but rendering, content editing and pixel-asset production remain future decisions. Revisit if authored game requirements outgrow this architecture.
