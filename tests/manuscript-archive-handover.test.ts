import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';
import { decodeSave, encodeSave } from '../src/game/save';

const ledgerDone = 'final_ledger_scene_complete';
const custodyDone = 'final_manuscript_provenance_decided';

function openWith(flags: string[]) {
  return selectOption(finalReading, { ...startDialogue(finalReading), flags }, 'open');
}

function choices(state: ReturnType<typeof startDialogue>) {
  return availableOptions(finalReading, state).map((option) => option.id);
}

describe('lost pages: archive handover', () => {
  it('requires both the box-17 resolution and the manuscript custody decision', () => {
    for (const flags of [[], [ledgerDone], [custodyDone]]) {
      expect(choices(openWith(flags))).not.toContain('archive-handover');
    }
    expect(choices(openWith([ledgerDone, custodyDone]))).toContain('archive-handover');
  });

  it('does not let a private ledger become a conversation with an uninformed Iris', () => {
    const state = selectOption(
      finalReading,
      openWith([ledgerDone, custodyDone, 'final_ledger_record_private']),
      'archive-handover',
    );
    expect(currentNode(finalReading, state).text).toContain('Айріс ще не знає');
    expect(choices(state)).not.toContain('archive-handover-iris');
    const indexed = selectOption(finalReading, state, 'archive-handover-index');
    expect(currentNode(finalReading, indexed).text).toContain('закриту папку');
    const finished = selectOption(finalReading, indexed, 'archive-handover-finish');
    expect(finished.flags).not.toContain('final_ledger_iris_told');
    expect(seasonEnding({ flags: finished.flags }).epilogue).toContain('не стало оголошенням');
  });

  it('keeps Eleanor’s promise separate from telling Iris now', () => {
    const state = selectOption(
      finalReading,
      openWith([ledgerDone, custodyDone, 'final_ledger_eleanor_to_tell']),
      'archive-handover',
    );
    expect(currentNode(finalReading, state).text).toContain('після свята');
    expect(choices(state)).not.toContain('archive-handover-iris');
  });

  it('remembers three exclusive handover decisions and closes the topic', () => {
    const scenarios = [
      ['archive-handover-index', 'final_archive_index_sealed', 'закритій папці'],
      ['archive-handover-iris', 'final_archive_iris_boundaries', 'лише собі та Елеонорі'],
      ['archive-handover-defer', 'final_archive_deferred', 'оформити пізніше'],
    ] as const;
    for (const [choice, flag, ending] of scenarios) {
      const gathering = openWith([ledgerDone, custodyDone, 'final_ledger_iris_told']);
      const handover = selectOption(finalReading, gathering, 'archive-handover');
      const response = selectOption(finalReading, handover, choice);
      expect(response.flags).toContain(flag);
      const finished = selectOption(finalReading, response, 'archive-handover-finish');
      expect(finished.flags).toContain('final_archive_handover_complete');
      expect(
        finished.flags.filter(
          (entry) =>
            entry.startsWith('final_archive_') && entry !== 'final_archive_handover_complete',
        ),
      ).toEqual([flag]);
      expect(choices(finished)).not.toContain('archive-handover');
      expect(seasonEnding({ flags: finished.flags }).epilogue).toContain(ending);
    }
  });

  it('does not confuse permission to store copies with permission to exhibit them', () => {
    const handover = selectOption(
      finalReading,
      openWith([
        ledgerDone,
        custodyDone,
        'final_ledger_iris_told',
        'final_provenance_consent_archive',
      ]),
      'archive-handover',
    );
    const indexed = selectOption(finalReading, handover, 'archive-handover-index');
    const text = currentNode(finalReading, indexed).text;
    expect(text).toContain('Копії');
    expect(text).toContain('дозвіл зберігати не означає дозвіл показувати');
    expect(text).not.toContain('підтверджене авторство');
  });

  it('lets Iris withhold access after a rumor without magically restoring trust', () => {
    const handover = selectOption(
      finalReading,
      openWith([
        ledgerDone,
        custodyDone,
        'final_ledger_iris_told',
        'final_miller_ledger_rumor_seeded',
      ]),
      'archive-handover',
    );
    expect(currentNode(finalReading, handover).text).toContain('Міллер');
    const answer = selectOption(finalReading, handover, 'archive-handover-iris');
    expect(currentNode(finalReading, answer).text).toContain('ніхто не читатиме');
    const finished = selectOption(finalReading, answer, 'archive-handover-finish');
    expect(seasonEnding({ flags: finished.flags }).epilogue).toContain('Після чутки');
  });

  it('does not restore archive access just because Miller corrected the rumor', () => {
    const handover = selectOption(
      finalReading,
      openWith([
        ledgerDone,
        custodyDone,
        'final_ledger_iris_told',
        'final_miller_ledger_rumor_seeded',
        'final_miller_rumor_corrected_publicly',
      ]),
      'archive-handover',
    );
    const answer = selectOption(finalReading, handover, 'archive-handover-iris');
    expect(currentNode(finalReading, answer).text).toContain('ніхто не читатиме');
    const finished = selectOption(finalReading, answer, 'archive-handover-finish');
    const epilogue = seasonEnding({ flags: finished.flags }).epilogue;
    expect(epilogue).toContain('Після чутки');
    expect(epilogue).not.toContain('Айріс дозволила читати опис лише собі');
  });

  it('preserves a handover after save/reload and does not replay it', () => {
    const handover = selectOption(
      finalReading,
      openWith([ledgerDone, custodyDone, 'final_ledger_iris_told']),
      'archive-handover',
    );
    const answer = selectOption(finalReading, handover, 'archive-handover-defer');
    const finished = selectOption(finalReading, answer, 'archive-handover-finish');
    const restored = decodeSave(
      encodeSave({ stage: 'day5-reading', dialogue: finished, flags: finished.flags }),
    );
    expect(restored).not.toBeNull();
    expect(restored?.dialogue.completed).toEqual(finished.completed);
    expect(restored?.flags).toContain('final_archive_deferred');
    expect(choices(restored!.dialogue)).not.toContain('archive-handover');
  });

  it('keeps new scenes within four choices and the dialogue graph valid', () => {
    for (const id of ['archive-handover', 'archive-handover-result']) {
      const node = finalReading.nodes.find((entry) => entry.id === id);
      expect(node).toBeDefined();
      expect(node!.options.length).toBeLessThanOrEqual(4);
    }
    expect(validateDialogue(finalReading)).toEqual([]);
  });
});
