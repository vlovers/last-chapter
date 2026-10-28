import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, currentNode, selectOption, startDialogue } from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

function gathering(flags: string[]) {
  return selectOption(finalReading, { ...startDialogue(finalReading), flags }, 'open');
}

describe('Miller and the ledger rumor', () => {
  it('does not reveal the scene while Iris has not seen the ledger', () => {
    for (const flags of [
      [],
      ['final_ledger_scene_complete'],
      ['final_ledger_iris_told'],
      ['final_ledger_scene_complete', 'final_ledger_record_private'],
    ]) {
      const state = gathering(flags);
      expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
        'miller-ledger-gossip',
      );
    }
  });

  it('allows three distinct responses and closes the topic once', () => {
    const routes = [
      ['miller-ledger-boundary', 'final_miller_ledger_boundary', 'детектив'],
      ['miller-ledger-tease', 'final_miller_ledger_rumor_seeded', 'фінал'],
      ['miller-ledger-memory', 'final_miller_ledger_flood_memory', 'рушники'],
    ] as const;
    for (const [choice, flag, excerpt] of routes) {
      const opening = gathering(['final_ledger_scene_complete', 'final_ledger_iris_told']);
      const scene = selectOption(finalReading, opening, 'miller-ledger-gossip');
      expect(availableOptions(finalReading, scene)).toHaveLength(3);
      const answer = selectOption(finalReading, scene, choice);
      expect(answer.flags).toContain(flag);
      expect(currentNode(finalReading, answer).text).toContain(excerpt);
      const finished = selectOption(finalReading, answer, 'miller-ledger-back');
      expect(finished.flags).toContain('final_miller_ledger_conversation_done');
      expect(availableOptions(finalReading, finished).map((option) => option.id)).not.toContain(
        'miller-ledger-gossip',
      );
    }
  });

  it('makes leaking an unverified ending worse even after repairing earlier gossip', () => {
    const opening = gathering([
      'final_ledger_scene_complete',
      'final_ledger_iris_told',
      'final_repaired_rumor',
    ]);
    const scene = selectOption(finalReading, opening, 'miller-ledger-gossip');
    const rumor = selectOption(finalReading, scene, 'miller-ledger-tease');
    const finished = selectOption(finalReading, rumor, 'miller-ledger-back');
    const ending = seasonEnding({ flags: finished.flags });
    expect(ending.community).toContain('нову плітку');
    expect(ending.epilogue).toContain('перестала ділитися');
    expect(ending.community).not.toContain('не стали розвагою');
  });
});
