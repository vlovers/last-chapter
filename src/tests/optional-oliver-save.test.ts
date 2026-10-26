import { describe, expect, it } from 'vitest';
import { selectOption, startDialogue } from '../game/dialogue';
import { oliverUnreadBook } from '../content/optional/oliver';
import {
  decodeOliverProgress,
  encodeOliverProgress,
  freshOliverProgress,
} from '../phaser/optional-oliver-state';

describe('optional Oliver save compatibility', () => {
  it('starts fresh without a save', () => {
    expect(decodeOliverProgress(null)).toEqual(freshOliverProgress());
  });

  it('restores the active dialogue node and choices', () => {
    const dialogue = selectOption(
      oliverUnreadBook,
      startDialogue(oliverUnreadBook),
      'oliver-unread-play',
    );
    const restored = decodeOliverProgress(encodeOliverProgress({ finished: false, dialogue }));
    expect(restored.dialogue.node).toBe('oliver-unread-game');
    expect(restored.dialogue.history).toEqual(['oliver-unread-play']);
  });

  it('reads the original completion marker', () => {
    expect(decodeOliverProgress('done').finished).toBe(true);
  });

  it.each(['{', 'null', '{}', '{"finished":false,"dialogue":{"node":"missing","flags":[],"history":[]}}'])(
    'rejects corrupt optional progress: %s',
    (raw) => {
      expect(decodeOliverProgress(raw)).toEqual(freshOliverProgress());
    },
  );
});
