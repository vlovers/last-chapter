# Localization policy — Ukrainian-first

**Product decision (2026-10-24):** The game ships **in Ukrainian only**. Its player-facing language is `uk-UA`. English may be used in code, engineering documentation and internal identifiers; it is not a promised game localization.

## Rules for contributors and agents
- Write **all player-visible content originally in natural Ukrainian**, not by literal translation from English.
- This includes dialogue, narration, descriptions, book titles, puzzles, clues, journal, menus, settings, tooltips, error messages, endings and accessibility labels.
- Set HTML `lang="uk"`; use Ukrainian typographic conventions, punctuation, names and forms of address.
- Do not add English fallback strings in player UI. Avoid hard-coded strings scattered across game logic; place future production copy in typed content resources.
- Narrative design notes in English are internal drafts only. Before implementation, author and review the actual Ukrainian scene script.
- Ukrainian editorial review must cover register, distinct character voices, idiomatic phrasing, continuity, inflections and clarity of clues.
- Test Ukrainian text for narrow screens, keyboard access, legibility and line wrapping. Do not force a decorative pixel font that lacks Ukrainian glyphs.
- English translation is out of scope unless the owner explicitly changes this decision.

## Current state
The initial prototype had English strings in `src/main.ts`. This decision requires translating them before treating the playable prototype as Ukrainian-complete. The opening fixture and HTML document language were updated first.
