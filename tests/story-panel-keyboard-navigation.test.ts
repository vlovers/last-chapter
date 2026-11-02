import { describe, expect, it, vi } from 'vitest';
import { focusPanelUpdate, panelTabStops, restorePanelFocus } from '../src/phaser/panel-focus';

interface StopOptions {
  tag?: string;
  disabled?: boolean;
  hidden?: boolean;
  inert?: boolean;
  ariaHidden?: boolean;
  connected?: boolean;
  collapsed?: boolean;
  directSummary?: boolean;
  tabIndex?: number;
}

function stop(options: StopOptions = {}): HTMLElement {
  const closedDetails = {} as HTMLElement;
  return {
    tagName: options.tag ?? 'BUTTON',
    tabIndex: options.tabIndex ?? 0,
    isConnected: options.connected ?? true,
    focus: vi.fn(),
    parentElement: options.directSummary ? closedDetails : null,
    matches: (selector: string) => selector === ':disabled' && Boolean(options.disabled),
    closest: (selector: string) =>
      selector === '[hidden], [inert]' || selector === '[hidden], [inert], [aria-hidden="true"]'
        ? options.hidden || options.inert || options.ariaHidden
          ? ({} as HTMLElement)
          : null
        : selector === 'details:not([open])' && options.collapsed
          ? closedDetails
          : null,
  } as unknown as HTMLElement;
}

function panel(stops: HTMLElement[]): HTMLElement {
  return { querySelectorAll: () => stops } as unknown as HTMLElement;
}

describe('story panel keyboard navigation', () => {
  it('skips disabled, inert, hidden and programmatically focused controls', () => {
    const close = stop();
    const disabled = stop({ disabled: true });
    const inert = stop({ inert: true });
    const hidden = stop({ hidden: true });
    const ariaHidden = stop({ ariaHidden: true });
    const exchange = stop({ tabIndex: -1 });
    const notes = stop({ tag: 'TEXTAREA' });
    expect(
      panelTabStops(panel([close, disabled, inert, hidden, ariaHidden, exchange, notes])),
    ).toEqual([close, notes]);
  });

  it('keeps a collapsed topic summary reachable but not its invisible choices', () => {
    const close = stop();
    const summary = stop({ tag: 'SUMMARY', collapsed: true, directSummary: true });
    const topic = stop({ collapsed: true });
    const nestedSummary = stop({ tag: 'SUMMARY', collapsed: true });
    const next = stop();
    expect(panelTabStops(panel([close, summary, topic, nestedSummary, next]))).toEqual([
      close,
      summary,
      next,
    ]);
  });

  it('keeps controls inside an expanded topic available', () => {
    const summary = stop({ tag: 'SUMMARY' });
    const choice = stop();
    expect(panelTabStops(panel([summary, choice]))).toEqual([summary, choice]);
  });

  it('restores focus to a connected and enabled opener', () => {
    const opener = stop();
    const fallback = stop();
    restorePanelFocus(opener, fallback);
    expect(opener.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(fallback.focus).not.toHaveBeenCalled();
  });

  it.each([
    ['removed', { connected: false }],
    ['disabled', { disabled: true }],
    ['hidden', { hidden: true }],
    ['inert', { inert: true }],
    ['aria-hidden', { ariaHidden: true }],
    ['not keyboard reachable', { tabIndex: -1 }],
  ] as const)('falls back when the original opener is %s', (_reason, options) => {
    const opener = stop(options);
    const fallback = stop();
    restorePanelFocus(opener, fallback);
    expect(opener.focus).not.toHaveBeenCalled();
    expect(fallback.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('falls back when there was no opener', () => {
    const fallback = stop();
    restorePanelFocus(null, fallback);
    expect(fallback.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('focuses a newly rendered conversation before the close button', () => {
    const exchange = { focus: vi.fn() };
    const close = { focus: vi.fn() };
    const fallback = { focus: vi.fn() };
    const root = {
      querySelector: (selector: string) =>
        selector === '.conversation-exchange' ? exchange : close,
    } as unknown as HTMLElement;
    focusPanelUpdate(root, fallback as unknown as HTMLElement);
    expect(exchange.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(close.focus).not.toHaveBeenCalled();
    expect(fallback.focus).not.toHaveBeenCalled();
  });

  it('falls back to close or opener when no conversation remains', () => {
    const close = { focus: vi.fn() };
    const fallback = { focus: vi.fn() };
    const root = {
      querySelector: (selector: string) => (selector === 'button' ? close : null),
    } as unknown as HTMLElement;
    focusPanelUpdate(root, fallback as unknown as HTMLElement);
    expect(close.focus).toHaveBeenCalledWith({ preventScroll: true });

    focusPanelUpdate(
      { querySelector: () => null } as unknown as HTMLElement,
      fallback as unknown as HTMLElement,
    );
    expect(fallback.focus).toHaveBeenCalledWith({ preventScroll: true });
  });
});
