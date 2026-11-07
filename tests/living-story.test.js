import { describe, expect, it, vi } from 'vitest';
import { createSceneDirector } from '../public/phaser-prototype/scene-director.js';
import { paginateText, paginateAnswers } from '../public/phaser-prototype/dialogue-pages.js';

describe('Living Story presentation timeline', () => {
  function fixture() {
    const endpoints = [],
      frames = [];
    const done = vi.fn();
    const director = createSceneDirector({
      begin(command) {
        if (command.kind === 'missing') return null;
        return {
          duration: 100,
          update: (p) => frames.push([command.kind, p]),
          finish: () => endpoints.push(command.kind),
        };
      },
    });
    const commands = ['move', 'face', 'gesture', 'cat', 'wait', 'exit', 'camera'].map((kind) => ({
      kind,
    }));
    return { director, endpoints, frames, done, commands };
  }
  it('does not release narration until every visible action has finished', () => {
    const { director, endpoints, done, commands } = fixture();
    director.play('leo:arrival:0', commands, done);
    expect(done).not.toHaveBeenCalled();
    for (let i = 0; i < 14; i++) director.update(50);
    expect(endpoints).toEqual(commands.map((c) => c.kind));
    expect(done).toHaveBeenCalledOnce();
    expect(director.active).toBe(false);
  });
  it('skip and reduced motion settle the same pose, without replaying effects', () => {
    for (const reduced of [false, true]) {
      const { director, endpoints, done, commands } = fixture();
      director.play('beat', commands, done);
      if (reduced) director.update(16, true);
      else director.finish();
      director.finish();
      director.play('beat', commands, done);
      expect(endpoints).toEqual(commands.map((c) => c.kind));
      expect(done).toHaveBeenCalledTimes(2);
    }
  });
  it('interruption cancels the old callback and safely settles its final pose', () => {
    const { director, endpoints, done } = fixture();
    director.play('old', [{ kind: 'move' }, { kind: 'exit' }], done);
    director.update(30);
    const next = vi.fn();
    director.play('new', [{ kind: 'face' }], next);
    expect(done).not.toHaveBeenCalled();
    director.finish();
    expect(endpoints).toEqual(['move', 'exit', 'face']);
    expect(next).toHaveBeenCalledOnce();
  });
  it('missing targets cannot block the line or create stale callbacks on reset', () => {
    const { director, done, endpoints } = fixture();
    director.play('missing', [{ kind: 'missing' }, { kind: 'face' }], done);
    director.reset();
    director.update(5000);
    expect(endpoints).toEqual(['face']);
    expect(done).not.toHaveBeenCalled();
    expect(director.key).toBeNull();
  });
});

describe('readable pages', () => {
  it('retains Ukrainian words, punctuation and paragraph breaks', () => {
    const text = '«Їжачок і ґанок».\n\nЦе — ще одна репліка. Нічого не зникає.';
    const pages = paginateText(text, (value) => value.length <= 24);
    expect(pages.every((page) => page.length <= 24)).toBe(true);
    expect(pages.join(' ').replace(/\s+/g, ' ')).toBe(text.replace(/\s+/g, ' '));
    expect(pages.some((page) => page.includes('«Їжачок'))).toBe(true);
  });
  it('preserves every Unicode character in an unbroken imported word', () => {
    const text = 'їґ🙂'.repeat(40);
    expect(paginateText(text, (value) => Array.from(value).length <= 10).join('')).toBe(text);
  });
  it('puts full answer labels on separate pages without dropping the fourth choice', () => {
    expect(paginateAnswers([64, 64, 64, 64], 188)).toEqual([
      [0, 1],
      [2, 3],
    ]);
    expect(paginateAnswers([44, 44, 44, 44], 208)).toEqual([[0, 1, 2, 3]]);
  });
});
