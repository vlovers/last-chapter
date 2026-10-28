import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { availableOptions, selectOption, startDialogue, validateDialogue } from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

const ledger = 'final_ledger_scene_complete';
const custody = 'final_manuscript_provenance_decided';
const told = 'final_ledger_iris_told';
const rumor = 'final_miller_ledger_rumor_seeded';

function gathering(flags: string[]) {
  return selectOption(finalReading, { ...startDialogue(finalReading), flags }, 'open');
}

function optionIds(flags: string[]) {
  return availableOptions(finalReading, gathering(flags)).map((choice) => choice.id);
}

describe('lost pages ending acceptance: evidence, consent and chronology', () => {
  it('does not offer archive custody before the ledger and manuscript decisions', () => {
    for (const flags of [[], [ledger], [custody]]) {
      expect(optionIds(flags)).not.toContain('archive-handover');
    }
    expect(optionIds([ledger, custody])).toContain('archive-handover');
  });

  it('never assumes Iris saw a private ledger', () => {
    const handover = selectOption(
      finalReading,
      gathering([ledger, custody, 'final_ledger_record_private']),
      'archive-handover',
    );
    expect(availableOptions(finalReading, handover).map((choice) => choice.id))
      .not.toContain('archive-handover-iris');
  });

  it('does not treat correcting a rumor as permission to read the archive', () => {
    const handover = selectOption(
      finalReading,
      gathering([ledger, custody, told, rumor, 'final_miller_rumor_corrected_publicly']),
      'archive-handover',
    );
    const restricted = selectOption(finalReading, handover, 'archive-handover-iris');
    expect(restricted.flags).toContain('final_archive_iris_boundaries');
    expect(seasonEnding({ flags: restricted.flags }).epilogue).not.toContain(
      'Айріс дозволила читати опис лише собі',
    );
  });

  it('preserves rumor history after public correction', () => {
    const ending = seasonEnding({
      flags: [ledger, custody, told, rumor, 'final_miller_rumor_corrected_publicly'],
    });
    expect(ending.community).toContain('не почув виправлення');
  });

  it('keeps dialogue choices within the four-choice contract', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
    for (const node of finalReading.nodes) {
      expect(node.options.length, node.id).toBeLessThanOrEqual(4);
    }
  });
});
