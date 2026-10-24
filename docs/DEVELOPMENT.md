# Development

Prerequisites: Node 22, npm. Run `npm ci` then `npm run dev` and open the local URL shown. `npm run check` runs the full code quality suite. `npm run build` writes `dist/`; deployment is not configured. No environment variables, Docker services or database migrations exist.

The committed `package-lock.json` was generated in GitHub Actions; CI installs dependencies with `npm ci`.
