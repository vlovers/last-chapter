/** Keyboard navigation must ignore controls hidden by a closed <details>, inert
 * overlays, or disabled states; those controls are still found by querySelectorAll. */
export function panelTabStops(panel: HTMLElement): HTMLElement[] {
  return Array.from(
    panel.querySelectorAll<HTMLElement>(
      'button, input, textarea, select, summary, a[href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((node) => {
    if (node.tabIndex < 0 || node.matches(':disabled') || node.closest('[hidden], [inert]')) {
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
