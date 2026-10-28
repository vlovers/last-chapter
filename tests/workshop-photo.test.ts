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

const prerequisites = [
  'final_ledger_scene_complete',
  'final_manuscript_provenance_decided',
];

function gathering(flags: string[] = [...prerequisites]) {
  return selectOption(finalReading, { ...startDialogue(finalReading), flags }, 'open');
}

function options(state: ReturnType<typeof startDialogue>) {
  return availableOptions(finalReading, state).map((option) => option.id);
}

describe('workshop photograph: a fair false lead, not a second revelation', () => {
  it('is gated behind the box-17 proof and the custody decision', () => {
    for (const flags of [[], [prerequisites[0]], [prerequisites[1]]]) {
      expect(options(gathering(flags))).not.toContain('workshop-photo');
    }
    expect(options(gathering())).toContain('workshop-photo');
  });

  it('recognizes the old photograph as a seven without identifying the author', () => {
    const scene = selectOption(finalReading, gathering(), 'workshop-photo');
    expect(currentNode(finalReading, scene).text).toContain('сімка');
    const compare = selectOption(finalReading, scene, 'photo-compare');
    expect(currentNode(finalReading, compare).text).toContain('не зробило б її авторкою');
  });

  it.each([
    ['photo-compare', 'photo-annotate', 'photo-result-finish', 'final_workshop_photo_sources_separated', 'два окремі факти'],
    ['photo-compare', 'photo-unmarked', 'photo-result-finish', 'final_workshop_photo_unmarked', 'без нових підписів'],
    ['photo-ask', 'photo-admit', 'photo-result-finish', 'final_workshop_photo_nora_corrected', 'виправила помилкову'],
    ['photo-ask', 'photo-keep-joke', 'photo-result-finish', 'final_workshop_photo_private_joke', 'між собою'],
    ['photo-leave', 'photo-leave-finish', '', 'final_workshop_photo_deferred', 'відклали до іншого дня'],
  ])('keeps the %s / %s outcome exclusive and permanent', (entry, choice, finish, flag, text) => {
    const scene = selectOption(finalReading, gathering(), 'workshop-photo');
    const branch = selectOption(finalReading, scene, entry);
    const answer = selectOption(finalReading, branch, choice);
    const done = finish ? selectOption(finalReading, answer, finish) : answer;
    expect(done.node).toBe('gathering');
    expect(done.flags).toContain(flag);
    expect(done.flags).toContain('final_workshop_photo_complete');
    expect(options(done)).not.toContain('workshop-photo');
    expect(seasonEnding({ flags: done.flags }).epilogue).toContain(text);
  });

  it('does not erase a rumor or grant public archive access', () => {
    const flags = [...prerequisites, 'final_miller_ledger_rumor_seeded'];
    const scene = selectOption(finalReading, gathering(flags), 'workshop-photo');
    expect(currentNode(finalReading, scene).text).toContain('Міллер');
    const compared = selectOption(finalReading, scene, 'photo-compare');
    const marked = selectOption(finalReading, compared, 'photo-annotate');
    const done = selectOption(finalReading, marked, 'photo-result-finish');
    expect(seasonEnding({ flags: done.flags }).community).toContain('чутка');
    expect(done.flags).not.toContain('final_archive_iris_boundaries');
  });

  it('persists a finished decision after a save/reload', () => {
    const scene = selectOption(finalReading, gathering(), 'workshop-photo');
    const asked = selectOption(finalReading, scene, 'photo-ask');
    const corrected = selectOption(finalReading, asked, 'photo-admit');
    const done = selectOption(finalReading, corrected, 'photo-result-finish');
    const restored = decodeSave(
      encodeSave({ stage: 'day5-reading', dialogue: done, flags: done.flags }),
    );
    expect(restored?.flags).toContain('final_workshop_photo_nora_corrected');
    expect(options(restored!.dialogue)).not.toContain('workshop-photo');
  });

  it('has valid graph links and no more than four choices per new node', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
    for (const node of finalReading.nodes.filter((node) => node.id.startsWith('workshop-photo'))) {
      expect(node.options.length, node.id).toBeLessThanOrEqual(4);
    }
  });
});
