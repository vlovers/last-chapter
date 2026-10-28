import { afterEach, expect, it, vi } from 'vitest';
import { DialogueUI } from '../public/phaser-prototype/dialogue-ui.js';

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
