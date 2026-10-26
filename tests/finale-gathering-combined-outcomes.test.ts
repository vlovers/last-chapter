import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { currentNode, type DialogueState } from '../src/game/dialogue';

function gatheringWith(...flags: string[]): string {
  const state: DialogueState = { node: 'gathering', flags, history: [] };
  return currentNode(finalReading, state).text;
}

describe('Final gathering acknowledges combined consequences', () => {
  it('recognizes repaired rumors and the Iris exhibition together', () => {
    const text = gatheringWith('final_repaired_rumor', 'final_iris_exhibition');
    expect(text).toContain('помилилася');
    expect(text).toContain('малюнків Айріс');
  });

  it('recognizes respected privacy and Iris autonomy together', () => {
    const text = gatheringWith('final_respected_privacy', 'final_supported_iris');
    expect(text).toContain('не запитує');
    expect(text).toContain('Айріс');
  });

  it('keeps individual outcomes when only one flag is present', () => {
    expect(gatheringWith('final_repaired_rumor')).toContain('сміливіше');
    expect(gatheringWith('final_iris_exhibition')).toContain('Вікна Беллвіка');
  });
});
