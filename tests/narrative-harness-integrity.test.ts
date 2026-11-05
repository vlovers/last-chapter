import { describe, expect, it } from 'vitest';
import type { DialogueStory } from '../src/game/dialogue';
import { stageStory } from '../src/game/chapter';
import { auditChronology, auditRuntime } from './helpers/narrative-harness';

const fixture = (options: DialogueStory['nodes'][number]['options']): DialogueStory => ({
  start: 'start',
  nodes: [
    { id: 'start', speaker: 'Оповідач', text: 'Початок.', options },
    { id: 'end', speaker: 'Оповідач', text: 'Кінець.', options: [] },
  ],
});

describe('deterministic narrative harness diagnostics', () => {
  it('detects missing targets and duplicate identifiers without executing broken edges', () => {
    const result = auditRuntime(
      fixture([
        { id: 'go', label: 'Далі', next: 'missing' },
        { id: 'go', label: 'Інакше', next: 'end' },
      ]),
    );
    expect(result.structuralErrors).toContain('Duplicate option: start/go');
    expect(result.structuralErrors.some((error) => error.includes('missing'))).toBe(true);
  });

  it('detects a blocked prerequisite and witnesses the resulting dead end', () => {
    const result = auditRuntime(
      fixture([{ id: 'go', label: 'Далі', next: 'end', requires: ['not_earned'] }]),
    );
    expect(result.deadEnds).toEqual([{ node: 'start', path: [] }]);
    expect(result.terminals).toEqual([]);
    expect(result.unwitnessedNodes).toEqual(['end']);
    expect(result.truncated).toBe(false);
  });

  it('detects a no-progress loop using runtime state, not growing history', () => {
    const result = auditRuntime(
      fixture([{ id: 'loop', label: 'Ще раз', next: 'start', repeatability: 'repeatable' }]),
    );
    expect(result.noProgressLoops).toEqual([{ node: 'start', option: 'loop', path: [] }]);
    expect(result.terminals).toEqual([]);
  });

  it('does not confuse an unexplored ending with an impossible ending', () => {
    const result = auditRuntime(fixture([{ id: 'go', label: 'Далі', next: 'end' }]), [], 1);
    expect(result.truncated).toBe(true);
    expect(result.terminals).toEqual([]);
    expect(result.unwitnessedNodes).toEqual(['end']);
  });

  it('detects a closed multi-scene loop while allowing a loop with an exit', () => {
    const loop: DialogueStory = {
      start: 'a',
      nodes: [
        {
          id: 'a',
          speaker: 'Анна',
          text: 'Розмова.',
          options: [{ id: 'go', label: 'Далі', next: 'b', repeatability: 'repeatable' }],
        },
        {
          id: 'b',
          speaker: 'Томас',
          text: 'Відповідь.',
          options: [{ id: 'back', label: 'Назад', next: 'a', repeatability: 'repeatable' }],
        },
        { id: 'end', speaker: 'Оповідач', text: 'Кінець.', options: [] },
      ],
    };
    expect(auditRuntime(loop).closedCycles).toEqual([{ nodes: ['a', 'b'], path: [] }]);
    const withExit = {
      ...loop,
      nodes: loop.nodes.map((node) =>
        node.id === 'b'
          ? {
              ...node,
              options: [...node.options, { id: 'finish', label: 'Завершити', next: 'end' }],
            }
          : node,
      ),
    };
    expect(auditRuntime(withExit).closedCycles).toEqual([]);
    expect(auditRuntime(withExit).terminals).toEqual(['end']);
  });

  it('finds future-only prerequisites without injecting future facts', () => {
    const early = fixture([{ id: 'go', label: 'Далі', next: 'end', requires: ['later'] }]);
    const late = fixture([{ id: 'go', label: 'Далі', next: 'end', grants: ['later'] }]);
    expect(
      auditChronology([
        { day: 1, story: early },
        { day: 3, story: late },
      ]),
    ).toEqual([{ day: 1, node: 'start', option: 'go', flag: 'later', earliest: 3 }]);
  });

  it('inventories all fifteen playable graphs with explicit exploration limits', () => {
    const stages = [
      'miller',
      'mara',
      'evening',
      'iris',
      'anna',
      'leo',
      'eleanor',
      'thomas',
      'nora',
      'book-club',
      'quiet-evening',
      'day4-iris',
      'day4-mara',
      'day4-leo',
      'day5-reading',
    ] as const;
    const reports = stages.map((stage) => ({ stage, ...auditRuntime(stageStory(stage), [], 200) }));
    for (const report of reports) {
      expect(report.structuralErrors, report.stage).toEqual([]);
      expect(report.deadEnds, report.stage).toEqual([]);
      expect(report.noProgressLoops, report.stage).toEqual([]);
      expect(report.closedCycles, report.stage).toEqual([]);
    }
    const chronology = auditChronology(
      stages.map((stage, index) => ({
        day: index < 3 ? 1 : index < 6 ? 2 : index < 11 ? 3 : index < 14 ? 4 : 5,
        story: stageStory(stage),
      })),
    );
    // Retained for old saved positions, with canonical payoffs now reachable on Day 5.
    expect(chronology).toEqual([
      {
        day: 2,
        node: 'hello',
        option: 'anna-thomas-chairs-followup',
        flag: 'thomas_chairs_discussed',
        earliest: 3,
      },
      {
        day: 3,
        node: 'greet',
        option: 'thomas-anna-chairs-reaction',
        flag: 'anna_thomas_chairs_followup_discussed',
        earliest: 5,
      },
    ]);
    console.info(
      'Bounded narrative runtime inventory',
      JSON.stringify(
        reports.map((report) => ({
          stage: report.stage,
          states: report.exploredStates,
          reached: Object.keys(report.witnesses).length,
          terminals: report.terminals,
          truncated: report.truncated,
        })),
      ),
    );
  });
});
