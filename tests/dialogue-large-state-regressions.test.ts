import { describe, expect, it, vi } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  type DialogueState,
  type DialogueStory,
} from '../src/game/dialogue';

const key = (node: string, option: string, reopen: readonly string[] = []) =>
  JSON.stringify([node, option, reopen]);

describe('large dialogue state regressions', () => {
  it('indexes large completion ledgers and world flags without per-option array scans', () => {
    const options = Array.from({ length: 96 }, (_, index) => ({
      id: `topic-${index}`,
      label: `Тема ${index}`,
      next: 'end',
      requires: ['met_guest'],
      unless: ['shop_closed'],
    }));
    const story: DialogueStory = {
      start: 'gathering',
      nodes: [
        {
          id: 'gathering',
          speaker: 'Оповідач',
          text: 'Вечір у книгарні.',
          options: [
            ...options,
            { id: 'repeat', label: 'Озирнутися', next: 'end', repeatability: 'repeatable' },
          ],
        },
        { id: 'end', speaker: 'Оповідач', text: 'До зустрічі.', options: [] },
      ],
    };
    const flags = ['met_guest', ...Array.from({ length: 1023 }, (_, i) => `memory_${i}`)];
    const completed = [
      ...Array.from({ length: 8190 }, (_, i) => `previous-${i}`),
      key('gathering', 'topic-0'),
      key('gathering', 'topic-47'),
    ];
    const flagsIncludes = vi.spyOn(flags, 'includes');
    const completedIncludes = vi.spyOn(completed, 'includes');
    const state: DialogueState = {
      node: 'gathering',
      flags,
      history: [],
      completed,
      pending: [],
    };

    const available = availableOptions(story, state).map((option) => option.id);
    expect(available).toHaveLength(95);
    expect(available).not.toContain('topic-0');
    expect(available).not.toContain('topic-47');
    expect(available).toContain('topic-95');
    expect(available).toContain('repeat');
    expect(flagsIncludes).not.toHaveBeenCalled();
    expect(completedIncludes).not.toHaveBeenCalled();
    expect(state.completed).toHaveLength(8192);
  });

  it('reopens a completed topic when a new fact changes its completion key', () => {
    const story: DialogueStory = {
      start: 'hub',
      nodes: [
        {
          id: 'hub',
          speaker: 'Оповідач',
          text: 'Вечір.',
          options: [{ id: 'talk', label: 'Поговорити', next: 'end', reopensWhen: ['new_fact'] }],
        },
        { id: 'end', speaker: 'Оповідач', text: 'Кінець.', options: [] },
      ],
    };
    const previous: DialogueState = {
      node: 'hub',
      flags: [],
      history: [],
      completed: [key('hub', 'talk')],
      pending: [],
    };
    expect(availableOptions(story, previous)).toHaveLength(0);
    expect(availableOptions(story, { ...previous, flags: ['new_fact'] })).toHaveLength(1);
    expect(
      availableOptions(story, {
        ...previous,
        flags: ['new_fact'],
        completed: [...previous.completed!, key('hub', 'talk', ['new_fact'])],
      }),
    ).toHaveLength(0);
  });

  it('preserves specific narration and ordered independent callbacks with many flags', () => {
    const story: DialogueStory = {
      start: 'hub',
      nodes: [
        {
          id: 'hub',
          speaker: 'Оповідач',
          text: 'Звичайний вечір.',
          textWhen: [
            { requires: ['met_guest'], text: 'Гість прийшов.' },
            { requires: ['met_guest', 'found_letter'], text: 'Гість приніс лист.' },
          ],
          afterwordWhen: [
            { requires: ['found_letter'], text: 'Лист лежить на столі.' },
            { requires: ['met_guest'], unless: ['shop_closed'], text: 'Книгарня відкрита.' },
            { requires: ['shop_closed'], text: 'Цей текст не має з’явитися.' },
          ],
          options: [],
        },
      ],
    };
    const flags = [
      'met_guest',
      'found_letter',
      ...Array.from({ length: 1022 }, (_, i) => `memory_${i}`),
    ];
    const includes = vi.spyOn(flags, 'includes');
    expect(currentNode(story, { node: 'hub', flags, history: [] }).text).toBe(
      'Гість приніс лист.\n\nЛист лежить на столі.\n\nКнигарня відкрита.',
    );
    expect(includes).not.toHaveBeenCalled();
  });

  it('retains the real finale close option and combined rumor/exhibition narration', () => {
    const state: DialogueState = {
      node: 'gathering',
      flags: ['final_repaired_rumor', 'final_iris_exhibition'],
      history: [],
      completed: [],
      pending: [],
    };
    expect(currentNode(finalReading, state).text).toContain('Пані Міллер зупиняється');
    expect(availableOptions(finalReading, state).map((option) => option.id)).toContain('close');
  });
});
