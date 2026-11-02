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
    if (node.tagName !== 'SUMMARY' || node.parentElement !== collapsed) return true;
    collapsed = collapsed.parentElement?.closest('details:not([open])') ?? null;
  }
  return false;
}

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
      node.closest('[hidden], [inert], [aria-hidden="true"]') ||
      !isRendered(node)
    ) {
      return false;
    }
    return !isHiddenByCollapsedDetails(node);
  });
}

/** Announce a newly selected conversation rather than jumping to the close button. */
export function focusPanelUpdate(panel: HTMLElement, fallback: HTMLElement): void {
  const isUsable = (node: HTMLElement): boolean =>
    node.isConnected &&
    node.tabIndex >= 0 &&
    !node.matches(':disabled') &&
    !node.closest('[hidden], [inert], [aria-hidden="true"]') &&
    !isHiddenByCollapsedDetails(node) &&
    isRendered(node);
  const candidates = panel.querySelectorAll<HTMLElement>('.conversation-exchange, button');
  const target = Array.from(candidates).find(isUsable) ?? fallback;
  target.focus({ preventScroll: true });
}

/** Return focus only to a still-visible, connected keyboard control. A story
 * transition may hide or disable the button that originally opened the dock. */
export function restorePanelFocus(preferred: HTMLElement | null, fallback: HTMLElement): void {
  const usable =
    preferred?.isConnected &&
    preferred.tabIndex >= 0 &&
    !preferred.matches(':disabled') &&
    !preferred.closest('[hidden], [inert], [aria-hidden="true"]') &&
    !isHiddenByCollapsedDetails(preferred) &&
    isRendered(preferred);
  const target = usable && preferred ? preferred : fallback;
  target.focus({ preventScroll: true });
}
