import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { millerVisit } from '../src/content/first-day';
import { currentNode, type DialogueState, validateDialogue } from '../src/game/dialogue';

function render(story: typeof millerVisit | typeof finalReading, node: string, flags: string[]) {
  const state: DialogueState = { node, flags, history: [] };
  return currentNode(story, state).text;
}

describe('Miller rumor accountability callback', () => {
  it('keeps the first-day response neutral when the player has not challenged the rumor', () => {
    const node = millerVisit.nodes.find((entry) => entry.id === 'boundary');
    expect(node).toBeDefined();
    expect(render(millerVisit, 'boundary', [])).toBe(node?.text);
  });

  it('acknowledges the player challenge immediately instead of pretending the conversation did not happen', () => {
    const text = render(millerVisit, 'boundary', ['rumor_challenged']);
    expect(text).toContain('я бачила, як вони виходили');
    expect(text).toContain('не називатиму здогад фактом');
    expect(text).not.toBe(millerVisit.nodes.find((entry) => entry.id === 'boundary')?.text);
  });

  it('carries the earlier challenge into the final day as an imperfect attempt at accountability', () => {
    const baseline = render(finalReading, 'rumor', []);
    const callback = render(finalReading, 'rumor', ['rumor_challenged']);
    expect(callback).toContain('ви сказали мені');
    expect(callback).toContain('ще маю виправити шкоду');
    expect(callback).not.toBe(baseline);
  });

  it('preserves valid dialogue graphs after the callback was added', () => {
    expect(validateDialogue(millerVisit)).toEqual([]);
    expect(validateDialogue(finalReading)).toEqual([]);
  });
});
