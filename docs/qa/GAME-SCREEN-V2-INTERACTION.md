# Game Screen V2 interaction follow-up

The journal uses native `details` so it works with keyboard and screen readers. Because the app replaces the scene DOM after dialogue and hotspot actions, the drawer's open state is now held in session memory and reapplied on render. Restart closes the journal.

A small scene instruction is visible on larger screens and hotspot focus receives a strong outline. The hint is hidden on narrow screens to avoid obscuring the room.

This is a functional UX follow-up; no narrative or save format changes. The original 480×270 room art remains a placeholder for a richer asset pass.
