/** A CSS media query may hide a toolbar button without a hidden attribute.
 * Such a button must not be a tab stop or receive restored focus. */
function isRendered(node: HTMLElement): boolean {
  const view = node.ownerDocument?.defaultView;
  if (!view) return true;
  for (let current: HTMLElement | null = node; current; current = current.parentElement) {
    const style = view.getComputedStyle(current);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.visibility === 'collapse'
    ) {
      return false;
    }
  }
  return true;
}

/** A summary can be visible inside its own closed <details> while the entire
 * nested group is still hidden by another closed <details> ancestor. */
function isHiddenByCollapsedDetails(node: HTMLElement): boolean {
  let collapsed = node.closest('details:not([open])');
  while (collapsed) {
    if (collapsed.querySelector(':scope > summary') !== node) return true;
    collapsed = collapsed.parentElement?.closest('details:not([open])') ?? null;
  }
  return false;
}

/** Share visibility rules between tab navigation and programmatic focus. */
function isVisiblePanelTarget(node: HTMLElement): boolean {
  return (
    !node.matches(':disabled') &&
    !node.closest('[hidden], [inert], [aria-hidden="true"]') &&
    !isHiddenByCollapsedDetails(node) &&
    isRendered(node)
  );
}

/** Keyboard navigation must ignore controls hidden by a closed <details>, inert
 * overlays, or disabled states; those controls are still found by querySelectorAll. */
export function panelTabStops(panel: HTMLElement): HTMLElement[] {
  return Array.from(
    panel.querySelectorAll<HTMLElement>(
      'button, input, textarea, select, summary, a[href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((node) => node.tabIndex >= 0 && isVisiblePanelTarget(node));
}

/** Announce a newly selected conversation rather than jumping to the close button. */
export function focusPanelUpdate(panel: HTMLElement, fallback: HTMLElement): void {
  const isUsable = (node: HTMLElement): boolean => node.isConnected && isVisiblePanelTarget(node);
  const exchange = Array.from(panel.querySelectorAll<HTMLElement>('.conversation-exchange')).find(
    isUsable,
  );
  const button = Array.from(panel.querySelectorAll<HTMLElement>('button')).find(
    (node) => node.tabIndex >= 0 && isUsable(node),
  );
  const target = exchange ?? button ?? fallback;
  target.focus({ preventScroll: true });
}

/** Return focus only to a still-visible, connected keyboard control. A story
 * transition may hide or disable the button that originally opened the dock. */
export function restorePanelFocus(preferred: HTMLElement | null, fallback: HTMLElement): void {
  const usable =
    preferred?.isConnected && preferred.tabIndex >= 0 && isVisiblePanelTarget(preferred);
  const target = usable && preferred ? preferred : fallback;
  target.focus({ preventScroll: true });
}
