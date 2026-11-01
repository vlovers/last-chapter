import { describe, expect, it } from 'vitest';
import { counterEncountersNodes } from '../src/content/counter-encounters';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  restoreDialogueProgress,
  selectOption,
  startDialogue,
  type DialogueNode,
  type DialogueState,
  type DialogueStory,
} from '../src/game/dialogue';

function storyWithReopening(): DialogueStory {
  return {
    start: 'hub',
    nodes: [
      {
        id: 'hub',
        hub: true,
        speaker: 'Мара',
        text: 'Про що поговоримо?',
        options: [
          { id: 'topic', label: 'Розмова', next: 'topic', reopensWhen: ['new_day'] },
          {
            id: 'new-day',
            label: 'Наступний день',
            next: 'hub',
            grants: ['new_day'],
            repeatability: 'repeatable',
          },
          { id: 'finish', label: 'Закінчити', next: 'end' },
        ],
      },
      {
        id: 'topic',
        speaker: 'Лео',
        text: 'Поговорімо пізніше.',
        options: [
          { id: 'back', label: 'Повернутися', next: 'hub' },
          { id: 'defer', label: 'Відкласти', next: 'hub', suspend: true },
        ],
      },
      { id: 'end', speaker: 'Оповідач', text: 'До зустрічі.', options: [] },
    ],
  };
}

function play(story: DialogueStory, route: readonly string[]): DialogueState {
  let state = startDialogue(story);
  for (const option of route) state = selectOption(story, state, option);
  return state;
}

describe('Legacy dialogue replay: linear completion and narrative continuity', () => {
  it('restores a twelve-thousand-edge unfinished route without losing pending topics', () => {
    const length = 12_000;
    const nodes: DialogueNode[] = Array.from({ length: length + 1 }, (_, index) => ({
      id: `scene-${index}`,
      speaker: 'Оповідач',
      text: 'Ще одна сторінка.',
      options: [{ id: 'next', label: 'Далі', next: index === length ? 'end' : `scene-${index + 1}` }],
    }));
    nodes.push({ id: 'end', speaker: 'Оповідач', text: 'Кінець.', options: [] });
    const story: DialogueStory = { start: 'scene-0', nodes };
    const legacy: DialogueState = {
      node: `scene-${length}`,
      flags: [],
      history: Array<string>(length).fill('next'),
    };
    const restored = restoreDialogueProgress(story, legacy);
    expect(restored.pending).toHaveLength(length);
    expect(restored.completed).toEqual([]);
    expect(restoreDialogueProgress(story, legacy)).toBe(restored);
    expect(availableOptions(story, legacy).map((option) => option.id)).toEqual(['next']);
  });

  it.each([
    ['ordinary completion', ['topic', 'back', 'finish']],
    ['suspension and retry', ['topic', 'defer', 'topic', 'back', 'finish']],
    ['reopened topic', ['topic', 'back', 'new-day', 'topic', 'back', 'finish']],
  ] as const)('matches modern completion for %s', (_name, route) => {
    const story = storyWithReopening();
    const modern = play(story, route);
    const legacy: DialogueState = {
      node: modern.node,
      flags: modern.flags,
      history: modern.history,
    };
    const restored = restoreDialogueProgress(story, legacy);
    expect(restored.completed).toEqual(modern.completed);
    expect(restored.pending).toEqual(modern.pending);
    expect(availableOptions(story, legacy)).toEqual(availableOptions(story, modern));
  });

  it('replays a real fifth-day book debate and keeps its return-to-gathering state', () => {
    const route = [
      'open',
      'final-reader-debates',
      'reader-romance',
      'romance-two-books',
      'romance-two-back',
      'reader-debates-close',
    ];
    const modern = play(finalReading, route);
    const legacy: DialogueState = {
      node: modern.node,
      flags: modern.flags,
      history: modern.history,
    };
    const restored = restoreDialogueProgress(finalReading, legacy);
    expect(restored.completed).toEqual(modern.completed);
    expect(restored.pending).toEqual(modern.pending);
    expect(availableOptions(finalReading, legacy)).toEqual(availableOptions(finalReading, modern));
  });

  it('ignores a removed historical choice after replaying valid progress', () => {
    const story = storyWithReopening();
    const legacy: DialogueState = {
      node: 'hub',
      flags: [],
      history: ['topic', 'back', 'old-removed-choice'],
    };
    const restored = restoreDialogueProgress(story, legacy);
    expect(restored.completed).toContain(JSON.stringify(['hub', 'topic', []]));
    expect(restored.pending).toEqual([]);
  });

  it('does not call non-buying visitors customers or wish Ruth another night shift', () => {
    const hub = counterEncountersNodes.find((node) => node.id === 'final-counter-hub');
    const ruth = counterEncountersNodes.find((node) => node.id === 'final-counter-ruth-short');
    expect(hub?.text).toContain('троє відвідувачів');
    expect(hub?.text).not.toContain('три справжні покупці');
    expect(ruth?.options[0]?.label).toContain('відпочити після нічної зміни');
  });
});
