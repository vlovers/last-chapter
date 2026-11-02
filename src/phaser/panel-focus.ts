/** Keyboard navigation must ignore controls hidden by a closed <details>, inert
 * overlays, or disabled states; those controls are still found by querySelectorAll. */
export function panelTabStops(panel: HTMLElement): HTMLElement[] {
  return Array.from(
    panel.querySelectorAll<HTMLElement>(
      'button, input, textarea, select, summary, a[href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((node) => {
    if (
      node.tabIndex < 0 ||
      node.matches(':disabled') ||
      node.closest('[hidden], [inert], [aria-hidden="true"]')
    ) {
      return false;
    }
    const collapsed = node.closest('details:not([open])');
    return !collapsed || (node.tagName === 'SUMMARY' && node.parentElement === collapsed);
  });
}

/** Announce a newly selected conversation rather than jumping to the close button. */
export function focusPanelUpdate(panel: HTMLElement, fallback: HTMLElement): void {
  const target =
    panel.querySelector<HTMLElement>('.conversation-exchange') ??
    panel.querySelector<HTMLElement>('button') ??
    fallback;
  target.focus({ preventScroll: true });
}

/** Return focus only to a still-visible, connected keyboard control. A story
 * transition may hide or disable the button that originally opened the dock. */
export function restorePanelFocus(preferred: HTMLElement | null, fallback: HTMLElement): void {
  const usable =
    preferred?.isConnected &&
    preferred.tabIndex >= 0 &&
    !preferred.matches(':disabled') &&
    !preferred.closest('[hidden], [inert], [aria-hidden="true"]');
  (usable ? preferred : fallback).focus({ preventScroll: true });
}
