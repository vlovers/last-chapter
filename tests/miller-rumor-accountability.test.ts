import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, currentNode, selectOption, startDialogue } from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';
import { decodeSave, encodeSave } from '../src/game/save';

const choiceIds = (state: ReturnType<typeof startDialogue>) =>
  availableOptions(finalReading, state).map((choice) => choice.id);

function opening(flags: string[] = ['final_ledger_scene_complete', 'final_ledger_iris_told']) {
  return selectOption(finalReading, { ...startDialogue(finalReading), flags }, 'open');
}

function spreadRumor() {
  const miller = selectOption(finalReading, opening(), 'miller-ledger-gossip');
  const rumor = selectOption(finalReading, miller, 'miller-ledger-tease');
  return selectOption(finalReading, rumor, 'miller-ledger-back');
}

describe('Miller rumor: Iris holds the bookseller accountable', () => {
  it('requires the rumor to be spoken and the Miller conversation to finish', () => {
    for (const flags of [
      [],
      ['final_ledger_scene_complete', 'final_ledger_iris_told'],
      ['final_miller_ledger_rumor_seeded'],
      ['final_miller_ledger_conversation_done'],
    ]) {
      expect(choiceIds(opening(flags))).not.toContain('miller-rumor-aftermath');
    }
    const state = spreadRumor();
    expect(choiceIds(state)).toContain('miller-rumor-aftermath');
  });

  it('lets the player own the mistake and correct only the false claim', () => {
    const scene = selectOption(finalReading, spreadRumor(), 'miller-rumor-aftermath');
    expect(currentNode(finalReading, scene).text).toContain('Хто їй це сказав?');
    const admitted = selectOption(finalReading, scene, 'rumor-own');
    expect(admitted.flags).toContain('final_miller_rumor_owned');
    const corrected = selectOption(finalReading, admitted, 'rumor-correct');
    expect(currentNode(finalReading, corrected).text).toContain('ті, хто вже пішов');
    const finished = selectOption(finalReading, corrected, 'rumor-aftermath-finish');
    expect(finished.flags).toContain('final_miller_rumor_corrected_publicly');
    expect(choiceIds(finished)).not.toContain('miller-rumor-aftermath');
    const ending = seasonEnding({ flags: finished.flags });
    expect(ending.community).toContain('не почув виправлення');
    expect(ending.epilogue).toContain('не пообіцяла знову довіряти');
    expect(ending.community).toContain('авторство сторінок так і не встановили');
  });

  it('can ask Iris what she wants without forcing her to explain herself', () => {
    const scene = selectOption(finalReading, spreadRumor(), 'miller-rumor-aftermath');
    const admitted = selectOption(finalReading, scene, 'rumor-own');
    const privateChoice = selectOption(finalReading, admitted, 'rumor-ask-iris');
    expect(currentNode(finalReading, privateChoice).text).toContain('Сьогодні — ніяк');
    const finished = selectOption(finalReading, privateChoice, 'rumor-aftermath-finish');
    const ending = seasonEnding({ flags: finished.flags });
    expect(finished.flags).toContain('final_miller_rumor_iris_choice');
    expect(finished.flags).not.toContain('final_miller_rumor_corrected_publicly');
    expect(ending.community).toContain('нову плітку');
    expect(ending.epilogue).toContain('право вирішувати');
  });

  it('remembers deflection and silence as distinct choices without excusing the rumor', () => {
    for (const [choice, flag, dialogue, epilogue] of [
      ['rumor-deflect', 'final_miller_rumor_deflected', 'Нора чула', 'перекласти провину'],
      ['rumor-leave', 'final_miller_rumor_avoided', 'чутка залишається', 'не відповів Айріс'],
    ] as const) {
      const scene = selectOption(finalReading, spreadRumor(), 'miller-rumor-aftermath');
      const result = selectOption(finalReading, scene, choice);
      expect(currentNode(finalReading, result).text).toContain(dialogue);
      const finished = selectOption(finalReading, result, 'rumor-aftermath-finish');
      expect(finished.flags).toContain(flag);
      expect(seasonEnding({ flags: finished.flags }).epilogue).toContain(epilogue);
      expect(seasonEnding({ flags: finished.flags }).community).toContain('нову плітку');
    }
  });

  it('preserves the completed consequence across a save and reload', () => {
    const scene = selectOption(finalReading, spreadRumor(), 'miller-rumor-aftermath');
    const result = selectOption(finalReading, scene, 'rumor-deflect');
    const finished = selectOption(finalReading, result, 'rumor-aftermath-finish');
    const restored = decodeSave(
      encodeSave({ stage: 'day5-reading', dialogue: finished, flags: finished.flags }),
    );
    expect(restored).not.toBeNull();
    expect(restored?.flags).toContain('final_miller_rumor_aftermath_done');
    expect(choiceIds(restored!.dialogue)).not.toContain('miller-rumor-aftermath');
  });

  it('keeps every new dialogue node to at most four choices', () => {
    for (const id of [
      'miller-rumor-aftermath',
      'miller-rumor-owned',
      'miller-rumor-aftermath-response',
    ]) {
      const node = finalReading.nodes.find((entry) => entry.id === id);
      expect(node).toBeDefined();
      expect(node!.options.length).toBeLessThanOrEqual(4);
    }
  });
});
