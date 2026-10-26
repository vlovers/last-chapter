import { describe, expect, it } from 'vitest';
import { selectOption, startDialogue } from '../game/dialogue';
import { bellwickSchedule, bellwickStory } from '../phaser/bellwick-schedule';
import { decodeBellwickProgress, encodeBellwickProgress, freshBellwickProgress } from '../phaser/bellwick-progress';

describe('ten Bellwick encounters save and restore', () => {
  it.each(bellwickSchedule)('restores partial progress for $id', ({ id }) => {
    const story = bellwickStory(id);
    const first = selectOption(story, startDialogue(story), 'talk');
    const saved = encodeBellwickProgress({ finished: [], sessions: { [id]: first } });
    expect(decodeBellwickProgress(saved).sessions[id]).toEqual(first);
  });

  it('migrates old completion-only saves', () => {
    const restored = decodeBellwickProgress(JSON.stringify({ finished: ['mara', 'frank'] }));
    expect(restored.finished).toEqual(['mara', 'frank']);
    expect(restored.sessions).toEqual({});
  });

  it('rejects impossible histories without losing valid scenes', () => {
    const valid = selectOption(bellwickStory('mara'), startDialogue(bellwickStory('mara')), 'talk');
    const raw = JSON.stringify({ finished: [], sessions: {
      mara: valid,
      leo: { node: 'end', flags: ['invented'], history: ['unavailable'] },
    } });
    const restored = decodeBellwickProgress(raw);
    expect(restored.sessions.mara).toEqual(valid);
    expect(restored.sessions.leo).toBeUndefined();
  });

  it('rejects malformed saves', () => {
    expect(decodeBellwickProgress('{')).toEqual(freshBellwickProgress());
    expect(decodeBellwickProgress('[]')).toEqual(freshBellwickProgress());
  });

  it('does not resume already finished encounters', () => {
    const story = bellwickStory('mara');
    const state = selectOption(story, startDialogue(story), 'talk');
    const restored = decodeBellwickProgress(JSON.stringify({ finished: ['mara'], sessions: { mara: state } }));
    expect(restored.sessions.mara).toBeUndefined();
  });
});
