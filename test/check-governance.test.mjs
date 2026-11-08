import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { checkGovernance, required } from '../scripts/check-governance.mjs';

function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), 'last-chapter-policy-'));
  const outside = mkdtempSync(join(tmpdir(), 'last-chapter-policy-external-'));
  try {
    for (const path of required) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(
        join(root, path),
        '# Policy\n\nThis repository requires review and release evidence.\n',
      );
    }
    writeFileSync(
      join(root, 'AGENTS.md'),
      '# Agents\n\nReview [policy](docs/engineering/REVIEW_POLICY.md) and [release](docs/engineering/RELEASE_CHECKLIST.md).\n',
    );
    writeFileSync(
      join(root, '.github/PULL_REQUEST_TEMPLATE.md'),
      '# PR\n\nReview [policy](../docs/engineering/REVIEW_POLICY.md) and [workflow](../docs/engineering/MULTI_AGENT_WORKFLOW.md).\n',
    );
    writeFileSync(
      join(root, 'docs/engineering/MULTI_AGENT_WORKFLOW.md'),
      '# Workflow\n\nReview [policy](REVIEW_POLICY.md) and [release](RELEASE_CHECKLIST.md).\n',
    );
    run(root, outside);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  }
}

test('current governance baseline passes', () =>
  fixture((root) => {
    assert.deepEqual(checkGovernance(root), []);
  }),
);

test('missing policy fails', () =>
  fixture((root) => {
    rmSync(join(root, 'SECURITY.md'));
    assert.match(checkGovernance(root).join('\n'), /SECURITY.md/);
  }),
);

test('missing required reference fails', () =>
  fixture((root) => {
    writeFileSync(join(root, 'AGENTS.md'), '# Agents\n\nNo referenced review or release policies here.\n');
    assert.match(checkGovernance(root).join('\n'), /missing reference/);
  }),
);

test('broken relative link fails', () =>
  fixture((root) => {
    writeFileSync(join(root, 'SECURITY.md'), '# Security\n\n[missing](not-found.md)\n');
    assert.match(checkGovernance(root).join('\n'), /not-found.md/);
  }),
);

test('path traversal fails', () =>
  fixture((root) => {
    writeFileSync(join(root, 'SECURITY.md'), '# Security\n\n[unsafe](../../outside.md)\n');
    assert.match(checkGovernance(root).join('\n'), /outside.md/);
  }),
);

test('symlink escaping the repository fails', () =>
  fixture((root, outside) => {
    writeFileSync(join(outside, 'external.md'), 'outside');
    symlinkSync(join(outside, 'external.md'), join(root, 'external.md'));
    writeFileSync(join(root, 'SECURITY.md'), '# Security\n\n[unsafe](external.md)\n');
    assert.match(checkGovernance(root).join('\n'), /escapes repository/);
  }),
);
