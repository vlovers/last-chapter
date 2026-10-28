import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, currentNode, selectOption, startDialogue } from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';
import { decodeSave, encodeSave } from '../src/game/save';

function openWith(flags: string[]) {
  return selectOption(finalReading, { ...startDialogue(finalReading), flags }, 'open');
}

describe('ledger aftermath', () => {
  it('only opens after the ledger scene is finished', () => {
    const before = openWith(['final_ledger_resolved_17']);
    expect(availableOptions(finalReading, before).map((option) => option.id)).not.toContain(
      'ledger-aftercare',
    );
    const after = openWith(['final_ledger_scene_complete']);
    expect(availableOptions(finalReading, after).map((option) => option.id)).toContain(
      'ledger-aftercare',
    );
  });

  it('keeps the private discovery private while recording facts', () => {
    const gathering = openWith(['final_ledger_scene_complete', 'final_ledger_record_private']);
    const aftercare = selectOption(finalReading, gathering, 'ledger-aftercare');
    expect(currentNode(finalReading, aftercare).text).toContain('Айріс поки не знає');
    const inventory = selectOption(finalReading, aftercare, 'aftercare-inventory');
    expect(currentNode(finalReading, inventory).text).toContain('між нами');
    const ending = selectOption(finalReading, inventory, 'aftercare-inventory-back');
    const finished = selectOption(finalReading, ending, 'aftercare-finish');
    expect(finished.flags).toContain('final_ledger_aftercare_inventory');
    expect(finished.flags).toContain('final_ledger_aftercare_complete');
    expect(finished.flags).not.toContain('final_ledger_iris_told');
    expect(seasonEnding({ flags: finished.flags }).epilogue).toContain('перевірених фактів');
    expect(availableOptions(finalReading, finished).map((option) => option.id)).not.toContain(
      'ledger-aftercare',
    );
  });

  it('allows an apology only when the joke hurt Iris without forcing forgiveness', () => {
    const ordinary = selectOption(
      finalReading,
      openWith(['final_ledger_scene_complete']),
      'ledger-aftercare',
    );
    expect(availableOptions(finalReading, ordinary).map((option) => option.id)).not.toContain(
      'aftercare-apologize',
    );
    const gathering = openWith(['final_ledger_scene_complete', 'final_ledger_iris_joke_hurt']);
    const aftercare = selectOption(finalReading, gathering, 'ledger-aftercare');
    const apology = selectOption(finalReading, aftercare, 'aftercare-apologize');
    expect(currentNode(finalReading, apology).text).toContain('Поговоримо іншим разом');
    const ending = selectOption(finalReading, apology, 'aftercare-apology-back');
    const finished = selectOption(finalReading, ending, 'aftercare-finish');
    expect(finished.flags).toContain('final_ledger_aftercare_apology');
    expect(seasonEnding({ flags: finished.flags }).epilogue).toContain('потрібен час');
  });

  it('allows a quiet evening without making the investigation mandatory', () => {
    const gathering = openWith(['final_ledger_scene_complete']);
    const aftercare = selectOption(finalReading, gathering, 'ledger-aftercare');
    const cleanup = selectOption(finalReading, aftercare, 'aftercare-cleanup');
    expect(currentNode(finalReading, cleanup).text).toContain('Френк');
    const ending = selectOption(finalReading, cleanup, 'aftercare-cleanup-back');
    const finished = selectOption(finalReading, ending, 'aftercare-finish');
    expect(finished.flags).toContain('final_ledger_aftercare_cleanup');
    expect(finished.flags).not.toContain('final_ledger_aftercare_inventory');
    expect(seasonEnding({ flags: finished.flags }).epilogue).toContain('коробку з-під печива');
  });
  it('survives a save/reload without reopening the aftercare scene', () => {
    const gathering = openWith(['final_ledger_scene_complete']);
    const aftercare = selectOption(finalReading, gathering, 'ledger-aftercare');
    const cleanup = selectOption(finalReading, aftercare, 'aftercare-cleanup');
    const end = selectOption(finalReading, cleanup, 'aftercare-cleanup-back');
    const finished = selectOption(finalReading, end, 'aftercare-finish');
    const restored = decodeSave(
      encodeSave({ stage: 'day5-reading', dialogue: finished, flags: finished.flags }),
    );
    expect(restored).not.toBeNull();
    expect(restored?.flags).toContain('final_ledger_aftercare_cleanup');
    expect(restored?.dialogue.completed).toEqual(finished.completed);
    expect(
      availableOptions(finalReading, restored!.dialogue).map((option) => option.id),
    ).not.toContain('ledger-aftercare');
  });
});
