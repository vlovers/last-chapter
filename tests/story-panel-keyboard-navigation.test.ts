import { describe, expect, it, vi } from 'vitest';
import { focusPanelUpdate, panelTabStops, restorePanelFocus } from '../src/phaser/panel-focus';

interface StopOptions {
  tag?: string;
  disabled?: boolean;
  hidden?: boolean;
  inert?: boolean;
  ariaHidden?: boolean;
  cssHidden?: boolean;
  cssInvisible?: boolean;
  connected?: boolean;
  collapsed?: boolean;
  directSummary?: boolean;
  nestedCollapsed?: boolean;
  tabIndex?: number;
}

function stop(options: StopOptions = {}): HTMLElement {
  const outerDetails = {} as HTMLElement;
  Object.assign(outerDetails, {
    closest: (selector: string) => (selector === 'details:not([open])' ? outerDetails : null),
    parentElement: null,
  });
  const closedDetails = {
    parentElement: options.nestedCollapsed ? outerDetails : null,
  } as HTMLElement;
  return {
    tagName: options.tag ?? 'BUTTON',
    tabIndex: options.tabIndex ?? 0,
    isConnected: options.connected ?? true,
    ownerDocument:
      options.cssHidden || options.cssInvisible
        ? {
            defaultView: {
              getComputedStyle: () => ({
                display: options.cssHidden ? 'none' : 'block',
                visibility: options.cssInvisible ? 'hidden' : 'visible',
              }),
            },
          }
        : undefined,
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

  it('excludes controls hidden by responsive CSS, even without hidden attributes', () => {
    const visible = stop();
    const displayNone = stop({ cssHidden: true });
    const invisible = stop({ cssInvisible: true });
    expect(panelTabStops(panel([visible, displayNone, invisible]))).toEqual([visible]);
  });

  it('does not restore focus to a CSS-hidden opener or its hidden ancestor', () => {
    const fallback = stop();
    const hidden = stop({ cssHidden: true });
    restorePanelFocus(hidden, fallback);
    expect(hidden.focus).not.toHaveBeenCalled();
    expect(fallback.focus).toHaveBeenCalledTimes(1);

    const parent = {} as HTMLElement;
    const child = stop();
    Object.defineProperty(child, 'parentElement', { value: parent });
    Object.defineProperty(parent, 'parentElement', { value: null });
    Object.defineProperty(child, 'ownerDocument', {
      value: {
        defaultView: {
          getComputedStyle: (element: HTMLElement) => ({
            display: element === parent ? 'none' : 'block',
            visibility: 'visible',
          }),
        },
      },
    });
    restorePanelFocus(child, fallback);
    expect(child.focus).not.toHaveBeenCalled();
    expect(fallback.focus).toHaveBeenCalledTimes(2);
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

  it('excludes a nested summary when an outer details group is still collapsed', () => {
    const close = stop();
    const outerSummary = stop({ tag: 'SUMMARY', collapsed: true, directSummary: true });
    const nestedSummary = stop({
      tag: 'SUMMARY',
      collapsed: true,
      directSummary: true,
      nestedCollapsed: true,
    });
    expect(panelTabStops(panel([close, outerSummary, nestedSummary]))).toEqual([
      close,
      outerSummary,
    ]);
  });

  it('never restores focus to a nested summary hidden by a closed outer group', () => {
    const nestedSummary = stop({
      tag: 'SUMMARY',
      collapsed: true,
      directSummary: true,
      nestedCollapsed: true,
    });
    const fallback = stop();
    restorePanelFocus(nestedSummary, fallback);
    expect(nestedSummary.focus).not.toHaveBeenCalled();
    expect(fallback.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('still restores focus to the summary of a single collapsed group', () => {
    const summary = stop({ tag: 'SUMMARY', collapsed: true, directSummary: true });
    const fallback = stop();
    restorePanelFocus(summary, fallback);
    expect(summary.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(fallback.focus).not.toHaveBeenCalled();
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
    const exchange = stop();
    const close = stop();
    const fallback = stop();
    const root = panel([exchange, close]);
    focusPanelUpdate(root, fallback);
    expect(exchange.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(close.focus).not.toHaveBeenCalled();
    expect(fallback.focus).not.toHaveBeenCalled();
  });

  it('skips hidden and disabled exchanges when updating conversation focus', () => {
    const hiddenExchange = stop({ hidden: true });
    const disabledExchange = stop({ disabled: true });
    const collapsedExchange = stop({ collapsed: true });
    const close = stop();
    const fallback = stop();
    focusPanelUpdate(panel([hiddenExchange, disabledExchange, collapsedExchange, close]), fallback);
    for (const exchange of [hiddenExchange, disabledExchange, collapsedExchange]) {
      expect(exchange.focus).not.toHaveBeenCalled();
    }
    expect(close.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(fallback.focus).not.toHaveBeenCalled();
  });

  it('falls back to opener when all conversation controls are hidden', () => {
    const hidden = stop({ cssHidden: true });
    const fallback = stop();
    focusPanelUpdate(panel([hidden]), fallback);
    expect(hidden.focus).not.toHaveBeenCalled();
    expect(fallback.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('falls back to opener when no conversation remains', () => {
    const fallback = stop();
    focusPanelUpdate(panel([]), fallback);
    expect(fallback.focus).toHaveBeenCalledWith({ preventScroll: true });
  });
});
