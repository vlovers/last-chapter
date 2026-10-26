import { describe, expect, it } from 'vitest';
import { bellwickAvailable, bellwickSchedule, bellwickStory } from '../phaser/bellwick-schedule';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../game/dialogue';

describe('five-day Bellwick encounter orchestration', () => {
  it('schedules exactly two distinct encounters per day', () => {
    expect(bellwickSchedule).toHaveLength(10);
    expect(new Set(bellwickSchedule.map((scene) => scene.id)).size).toBe(10);
    for (const day of [1, 2, 3, 4, 5]) {
      expect(bellwickAvailable(day, [])).toHaveLength(2);
      expect(bellwickAvailable(day, []).every((scene) => scene.day === day)).toBe(true);
    }
    expect(bellwickAvailable(0, [])).toEqual([]);
    expect(bellwickAvailable(6, [])).toEqual([]);
  });

  it('does not reveal a future encounter or reopen a completed one', () => {
    for (const scene of bellwickSchedule) {
      expect(bellwickAvailable(scene.day - 1, []).some((item) => item.id === scene.id)).toBe(false);
      expect(bellwickAvailable(scene.day, [scene.id]).some((item) => item.id === scene.id)).toBe(
        false,
      );
    }
  });

  it.each(bellwickSchedule)('$id: supports short exit and all extended outcomes', ({ id }) => {
    const script = bellwickStory(id);
    expect(validateDialogue(script)).toEqual([]);
    const leave = selectOption(script, startDialogue(script), 'leave');
    expect(currentNode(script, leave).id).toBe('exit');
    for (const suffix of ['a', 'b', 'c']) {
      let state = startDialogue(script);
      for (const choice of [
        'talk',
        `choice-${suffix}`,
        `follow-${suffix}`,
        'afterthought-end',
      ]) {
        expect(availableOptions(script, state).some((option) => option.id === choice)).toBe(true);
        state = selectOption(script, state, choice);
      }
      expect(currentNode(script, state).id).toBe('end');
      expect(state.flags).toEqual([]);
    }
  });
});
