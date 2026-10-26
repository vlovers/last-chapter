import { describe, expect, it, vi } from 'vitest';
import { FiveDayStory } from '../src/phaser/five-day-story';
import { decodeSave, SAVE_KEY } from '../src/game/save';
import { seasonEnding } from '../src/game/endings';

function play(route: 'first' | 'last') {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
    clear: () => { values.clear(); },
  });
  try {
    let story = new FiveDayStory();
    const visited = [story.stage];
    for (let step = 0; step < 1000 && story.stage !== 'season-complete'; step++) {
      const view = story.open();
      const advance = view.choices.find((choice) => choice.id === '__advance');
      const finish = view.choices.find((choice) => choice.id === 'finish');
      const dialogue = view.choices.filter((choice) => !choice.id.startsWith('__'));
      const choice = advance ?? finish ?? (route === 'first' ? dialogue[0] : dialogue[dialogue.length - 1]);
      if (!choice) throw new Error(`Route ${route} stuck at ${story.stage} after ${step} steps`);
      const previous = story.stage;
      story.choose(choice.id);
      const saved = decodeSave(values.get(SAVE_KEY) ?? '');
      expect(saved?.stage).toBe(story.stage);
      if (story.stage !== previous) visited.push(story.stage);
      story = new FiveDayStory();
      expect(story.stage).toBe(saved?.stage);
    }
    expect(story.stage).toBe('season-complete');
    const saved = decodeSave(values.get(SAVE_KEY) ?? '');
    expect(saved).not.toBeNull();
    const ending = seasonEnding(saved!);
    expect(story.open().text).toBe([ending.letter, ending.community, ending.epilogue].join('\n\n'));
    return { visited, flags: saved!.flags, ending };
  } finally {
    vi.unstubAllGlobals();
  }
}

describe('five-day alternative dialogue routes', () => {
  it('reaches the finale and restores every step using the earliest available option', () => {
    const result = play('first');
    expect(result.visited).toHaveLength(19);
  });

  it('reaches the finale and restores every step using the latest available option', () => {
    const result = play('last');
    expect(result.visited).toHaveLength(19);
  });
});
