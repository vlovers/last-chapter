import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

const workflow = readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');
const runner = readFileSync(new URL('../scripts/qa-narrative-v2.mjs', import.meta.url), 'utf8');
const journeys = JSON.parse(
  readFileSync(new URL('./fixtures/production-v2-journeys.json', import.meta.url), 'utf8'),
);

it('runs every narrative route at both mobile widths in separate CI jobs', () => {
  const shards = [
    ...workflow.matchAll(
      /- name: narrative-v2-(\d+)\r?\n\s+command: QA_WIDTH=(\d+) node scripts\/qa-narrative-v2\.mjs/g,
    ),
  ].map(([, name, width]) => [Number(name), Number(width)]);

  expect(shards).toEqual([
    [360, 360],
    [390, 390],
  ]);
  expect(journeys.scenarios.map((scenario) => scenario.id).sort()).toEqual([
    'admitted',
    'concealed',
    'late-confession',
    'mutual',
    'private-rumor',
  ]);
  expect(runner).toContain('matrix.scenarios');
  expect(runner).toContain('String(viewport.width) === process.env.QA_WIDTH');
  expect(workflow).not.toMatch(/command: QA_SCENARIO=/);
});

it('keeps separate evidence artifacts for both narrative viewport jobs', () => {
  expect(workflow).toContain("startsWith(matrix.suite.name, 'narrative-v2-')");
  expect(workflow).toContain('name: ${{ matrix.suite.name }}-mobile-journeys');
});

it('keeps the five narrative routes bounded and their final facts noncontradictory', () => {
  const seen = new Set();
  for (const scenario of journeys.scenarios) {
    expect(seen.has(scenario.id)).toBe(false);
    seen.add(scenario.id);
    expect(scenario.expected.length).toBeGreaterThan(0);
    expect(scenario.absent.length).toBeGreaterThan(0);
    for (const flag of scenario.expected) expect(scenario.absent).not.toContain(flag);
    for (const [stage, defaults] of Object.entries(journeys.common)) {
      const route = scenario.overrides[stage] ?? defaults;
      expect(route.length, `Empty narrative route at ${scenario.id}/${stage}`).toBeGreaterThan(0);
      expect(new Set(route).size, `Duplicate choices at ${scenario.id}/${stage}`).toBe(
        route.length,
      );
    }
    for (const [stage, route] of Object.entries(scenario.overrides)) {
      expect(route.length, `Empty override at ${scenario.id}/${stage}`).toBeGreaterThan(0);
    }
  }
});
