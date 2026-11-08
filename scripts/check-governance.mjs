#!/usr/bin/env node
import { readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const required = [
  'AGENTS.md',
  'SECURITY.md',
  '.github/PULL_REQUEST_TEMPLATE.md',
  'docs/engineering/MULTI_AGENT_WORKFLOW.md',
  'docs/engineering/REVIEW_POLICY.md',
  'docs/engineering/RELEASE_CHECKLIST.md',
];

const references = {
  'AGENTS.md': ['docs/engineering/REVIEW_POLICY.md', 'docs/engineering/RELEASE_CHECKLIST.md'],
  '.github/PULL_REQUEST_TEMPLATE.md': ['REVIEW_POLICY.md', 'MULTI_AGENT_WORKFLOW.md'],
  'docs/engineering/MULTI_AGENT_WORKFLOW.md': ['REVIEW_POLICY.md', 'RELEASE_CHECKLIST.md'],
};

function within(root, target) {
  const path = relative(root, target);
  return path !== '..' && !path.startsWith('..' + sep) && !isAbsolute(path);
}

export function checkGovernance(directory) {
  const errors = [];
  const root = realpathSync(resolve(directory));
  for (const name of required) {
    const file = resolve(root, name);
    let content;
    try {
      if (!within(root, realpathSync(file)) || !statSync(file).isFile()) throw Error('unsafe file');
      content = readFileSync(file, 'utf8');
    } catch {
      errors.push(name + ': missing, unreadable or outside repository');
      continue;
    }
    if (content.trim().length < 40) errors.push(name + ': unexpectedly empty');
    for (const marker of references[name] ?? []) {
      if (!content.includes(marker)) errors.push(name + ': missing reference ' + marker);
    }
    for (const match of content.matchAll(/(?<!!)\[[^\]\n]+\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
      const link = match[1];
      if (/^(?:[a-z][\da-z+.-]*:|\/|#|\{|<)/i.test(link)) continue;
      try {
        const decoded = decodeURIComponent(link.split('#')[0].split('?')[0]);
        if (!decoded) continue;
        const target = resolve(root, dirname(name), decoded);
        if (!within(root, target) || !within(root, realpathSync(target))) {
          errors.push(name + ': link escapes repository: ' + link);
          continue;
        }
        const stat = statSync(target);
        if (!stat.isFile() && !stat.isDirectory()) throw Error('not file/dir');
      } catch {
        errors.push(name + ': broken or unsafe local link: ' + link);
      }
    }
  }
  return errors.sort();
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const errors = checkGovernance(process.argv[2] ?? process.cwd());
  if (errors.length) {
    console.error('Governance FAILED:\n' + errors.map((error) => '- ' + error).join('\n'));
    process.exitCode = 1;
  } else {
    console.log('Governance: PASS');
  }
}
