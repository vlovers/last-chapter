import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { expect, it } from 'vitest';
const helper = new URL('../scripts/qa-browser.mjs', import.meta.url).href;
for (const fail of [false, true]) {
  it(`bounded browser transport cleanup preserves ${fail ? 'failed assertion' : 'successful'} exit status`, () => {
    const script = `
      import assert from 'node:assert/strict';
      const { launchQaBrowser } = await import(${JSON.stringify(helper)});
      const fixture = await launchQaBrowser({ launchServer: async () => ({ wsEndpoint: () => '', close: () => new Promise(() => {}), kill: () => new Promise(() => {}) }), connect: async () => ({ close: () => new Promise(() => {}) }) }, { shutdownMs: 10, exitGraceMs: 50 });
      setInterval(() => {}, 1000); // Simulate a stale owned transport handle.
      try { assert.equal(1, ${fail ? 2 : 1}, 'original assertion sentinel'); }
      finally { await fixture.close(); }
    `;
    const child = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
      timeout: 2000,
      encoding: 'utf8',
    });
    expect(child.error).toBeUndefined();
    expect(child.status).toBe(fail ? 1 : 0);
    if (fail) expect(child.stderr).toContain('original assertion sentinel');
  });
}
