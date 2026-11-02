import { afterEach, expect, it, vi } from 'vitest';
import { DialogueUI, shouldCompactDialogue } from '../public/phaser-prototype/dialogue-ui.js';

afterEach(() => vi.unstubAllGlobals());
for (const hasChoice of [false, true]) {
  it(`keeps focus inside dialogue when a focused typewriter control disappears (${hasChoice ? 'answer' : 'close'})`, () => {
    const skip = { hidden: false };
    const answer = { focus: vi.fn() },
      close = { focus: vi.fn() };
    vi.stubGlobal('document', { activeElement: skip });
    vi.stubGlobal('window', { clearInterval: vi.fn() });
    const ui = {
      skip,
      choices: { querySelector: () => (hasChoice ? answer : null) },
      close,
      visualText: {},
      fullText: 'Довга розмова',
      typing: 42,
    };
    DialogueUI.prototype.finishTyping.call(ui);
    expect(skip.hidden).toBe(true);
    expect(ui.typing).toBeNull();
    expect(ui.visualText.textContent).toBe(ui.fullText);
    expect((hasChoice ? answer : close).focus).toHaveBeenCalledWith({ preventScroll: true });
  });
}
it('does not move focus when typewriter completion did not hide the active control', () => {
  vi.stubGlobal('document', { activeElement: {} });
  vi.stubGlobal('window', { clearInterval: vi.fn() });
  const focus = vi.fn();
  DialogueUI.prototype.finishTyping.call({
    skip: {},
    choices: { querySelector: () => ({ focus }) },
    close: { focus },
  });
  expect(focus).not.toHaveBeenCalled();
});

it('keeps the conversation dock a stable size across short and long replies', () => {
  for (const choices of [[], [{ id: 'continue' }], [{ id: 'yes' }, { id: 'no' }]]) {
    const short = { text: 'Так.', choices };
    const long = { text: 'Розмова '.repeat(100), choices };
    expect(shouldCompactDialogue(short, true)).toBe(false);
    expect(shouldCompactDialogue(long, true)).toBe(false);
  }
});

it('allows compact object notes without shrinking character conversations', () => {
  expect(shouldCompactDialogue({ text: 'Книга на полиці.', choices: [] }, false)).toBe(true);
  expect(
    shouldCompactDialogue({ text: 'Опис '.repeat(200), choices: [] }, false),
  ).toBe(false);
  expect(
    shouldCompactDialogue(
      { text: 'Коротка нотатка.', choices: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
      false,
    ),
  ).toBe(false);
});
