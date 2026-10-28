# Security policy

## Reporting a vulnerability

Please **do not** disclose exploitable vulnerabilities, credentials, private user information or proof-of-concept payloads in public issues or pull requests.

Use GitHub's **Report a vulnerability** / private vulnerability reporting flow for this repository **if enabled**. If private reporting is unavailable, contact the repository maintainer through a previously established private channel. Do not post sensitive details publicly merely to reach a maintainer.

Include affected version or commit, reproducible steps, impact, and a safe minimal reproduction. Never include live secrets or third-party personal information.

## Scope

This is a developing interactive narrative game. Treat client-side saves and narrative state as untrusted input. Report injection, data exposure, dependency vulnerabilities, and security-sensitive build/deployment issues.

## Response expectations

No response-time or remediation SLA is promised. Maintainers will assess reports as capacity allows and coordinate disclosure when a fix is available.

## Safe handling and verification

- Treat imported or restored save files as attacker-controlled input. Validate schema, bounds and narrative flags before applying state; never execute content from a save.
- Keep tokens and deployment credentials out of browser bundles, sample saves, screenshots, logs and CI artifacts.
- For dependency reports, include the package, affected version, reachable usage and a minimal non-destructive reproduction when possible.
- For reports involving a public deployment, coordinate reproduction privately; do not test against other players' data.

## Supported versions

Only the latest development state is considered for security fixes; no older release support is guaranteed.
