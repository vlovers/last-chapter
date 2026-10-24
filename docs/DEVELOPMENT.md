# Development

Prerequisites: Node 22, npm. Run `npm install` then `npm run dev` and open the local URL shown. `npm run check` runs the full code quality suite. `npm run build` writes `dist/`; deployment is not configured. No environment variables, Docker services or database migrations exist.

**Known blocker:** the bootstrap environment could not resolve the npm registry, so `package-lock.json` could not be generated or dependency install tested. Generate lockfile using `npm install --package-lock-only` with registry access; commit it and replace development/CI install steps with `npm ci`. Only then declare clean-install reproducibility verified.
