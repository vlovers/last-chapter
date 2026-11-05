import { describe, expect, it } from 'vitest';
import type { DialogueStory } from './dialogue';
import { analyzeDialogueReachability } from './dialogue-reachability';

describe('analyzeDialogueReachability', () => {
  const story: DialogueStory = {
    start: 'start',
    nodes: [
      {
        id: 'start', speaker: 'Narrator', text: 'Begin',
        options: [
          { id: 'grant', label: 'Learn', next: 'middle', grants: ['known'] },
          { id: 'skip', label: 'Skip', next: 'middle' },
        ],
      },
      {
        id: 'middle', speaker: 'Narrator', text: 'Middle',
        options: [
          { id: 'gated', label: 'Use knowledge', next: 'end', requires: ['known'] },
          { id: 'return', label: 'Return', next: 'start' },
        ],
      },
      { id: 'end', speaker: 'Narrator', text: 'End', options: [] },
    ],
  };

  it('revisits nodes after flags change and reaches gated edges', () => {
    const result = analyzeDialogueReachability(story);
    expect(result.truncated).toBe(false);
    expect(result.reachableNodes).toContain('end');
    expect(result.reachableEdges).toContain(JSON.stringify(['middle', 'gated', 'end']));
  });

  it('respects external initial facts', () => {
    const gated: DialogueStory = {
      start: 'start',
      nodes: [
        { id: 'start', speaker: 'A', text: 'A', options: [
          { id: 'external', label: 'Open', next: 'end', requires: ['other_story'] },
        ] },
        { id: 'end', speaker: 'B', text: 'B', options: [] },
      ],
    };
    expect(analyzeDialogueReachability(gated).unreachableNodes).toContain('end');
    expect(analyzeDialogueReachability(gated, ['other_story']).reachableNodes).toContain('end');
  });

  it('excludes contradictory conditions', () => {
    const impossible: DialogueStory = {
      start: 'start',
      nodes: [
        { id: 'start', speaker: 'A', text: 'A', options: [
          { id: 'impossible', label: 'No', next: 'end', requires: ['x'], unless: ['x'] },
        ] },
        { id: 'end', speaker: 'B', text: 'B', options: [] },
      ],
    };
    expect(analyzeDialogueReachability(impossible, ['x']).unreachableEdges).toContain(
      JSON.stringify(['start', 'impossible', 'end']),
    );
  });

  it('reports truncation rather than claiming full coverage', () => {
    const result = analyzeDialogueReachability(story, [], 1);
    expect(result.truncated).toBe(true);
    expect(result.exploredStates).toBe(1);
  });
});
