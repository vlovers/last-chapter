import { describe, expect, it } from 'vitest';
import type { DialogueStory } from './dialogue';
import { analyzeDialogueReachability } from './dialogue-reachability';
import { annaVisit } from '../content/anna';
import { thomasVisit } from '../content/thomas';
import { irisVisit } from '../content/iris';
import { maraDecision } from '../content/day-four-mara';

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
  it('covers real authored stories without losing the start node', () => {
    for (const authored of [annaVisit, thomasVisit, irisVisit, maraDecision]) {
      const result = analyzeDialogueReachability(authored, [], 10000);
      expect(result.reachableNodes).toContain(authored.start);
      expect(result.exploredStates).toBeGreaterThan(0);
      expect(result.exploredStates).toBeLessThanOrEqual(10000);
    }
  });

  it('distinguishes multiple choices with the same destination', () => {
    const parallel: DialogueStory = {
      start: 'start',
      nodes: [
        { id: 'start', speaker: 'A', text: 'A', options: [
          { id: 'first', label: 'First', next: 'end' },
          { id: 'second', label: 'Second', next: 'end' },
        ] },
        { id: 'end', speaker: 'B', text: 'B', options: [] },
      ],
    };
    expect(analyzeDialogueReachability(parallel).reachableEdges).toHaveLength(2);
  });

  it('accumulates facts across a loop before unlocking a joint gate', () => {
    const accumulating: DialogueStory = {
      start: 'hub',
      nodes: [
        { id: 'hub', speaker: 'A', text: 'A', options: [
          { id: 'a', label: 'A', next: 'hub', grants: ['a'] },
          { id: 'b', label: 'B', next: 'hub', grants: ['b'] },
          { id: 'both', label: 'Both', next: 'end', requires: ['a', 'b'] },
        ] },
        { id: 'end', speaker: 'B', text: 'B', options: [] },
      ],
    };
    expect(analyzeDialogueReachability(accumulating).reachableNodes).toContain('end');
  });

  it('does not multiply queued identical states in a loop', () => {
    const loop: DialogueStory = {
      start: 'hub',
      nodes: [
        { id: 'hub', speaker: 'A', text: 'A', options: [
          { id: 'again', label: 'Again', next: 'hub' },
          { id: 'also', label: 'Also', next: 'hub' },
        ] },
      ],
    };
    const result = analyzeDialogueReachability(loop);
    expect(result.exploredStates).toBe(1);
    expect(result.truncated).toBe(false);
  });

});
