export function dialogueTabStops(element: {
  querySelectorAll(
    selector: string,
  ): Iterable<{ disabled?: boolean; closest(selector: string): unknown }>;
}): unknown[];
