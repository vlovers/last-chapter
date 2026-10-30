import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  selectOption,
  startDialogue,
  type DialogueState,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

const epilogueCases = [
  ['final_counter_ruth_preferences', 'трьома запитаннями'],
  ['final_counter_ruth_large_print_checked', 'великим шрифтом'],
  ['final_counter_ruth_shortlist', 'коротких історій про море'],
  ['final_counter_sam_dough', 'початкову книжку про тісто'],
  ['final_counter_sam_memoir', 'кумедні спогади пекаря'],
  ['final_counter_sam_asked_first', 'запитати Мару про навчання'],
  ['final_counter_reed_note', 'запечатав чужу записку'],
  ['final_counter_reed_book_kept', 'залишив стару книжку собі'],
  ['final_counter_reed_deferred', 'не поспішати із запискою'],
] as const;

describe('counter encounters epilogue and save restoration', () => {
  it.each(epilogueCases)('renders only an earned ordinary-life outcome for %s', (flag, fragment) => {
    const epilogue = seasonEnding({ flags: [flag] }).epilogue;
    expect(epilogue).toContain(fragment);
    expect(seasonEnding({ flags: [] }).epilogue).not.toContain(fragment);
  });

  it('restores unfinished counter visits without inventing completed choices', () => {
    let state = startDialogue(finalReading);
    for (const id of [
      'open',
      'final-counter-encounters',
      'counter-ruth',
      'ruth-short',
      'ruth-short-back',
    ]) {
      state = selectOption(finalReading, state, id);
    }

    const restored = JSON.parse(JSON.stringify(state)) as DialogueState;
    expect(restored.flags).toContain('final_counter_ruth_done');
    expect(availableOptions(finalReading, restored).map((option) => option.id)).toContain(
      'counter-sam',
    );
    expect(availableOptions(finalReading, restored).map((option) => option.id)).not.toContain(
      'counter-ruth',
    );

    const afterSave = selectOption(finalReading, restored, 'counter-sam');
    expect(afterSave.node).toBe('final-counter-sam');
    expect(afterSave.flags).not.toContain('final_counter_sam_done');
  });

  it('lets the player leave without taking responsibility for visitors they did not meet', () => {
    let state = startDialogue(finalReading);
    for (const id of ['open', 'final-counter-encounters', 'counter-close']) {
      state = selectOption(finalReading, state, id);
    }
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain('final_counter_evening_done');
    expect(state.flags.some((flag) => flag.startsWith('final_counter_ruth_'))).toBe(false);
    expect(state.flags.some((flag) => flag.startsWith('final_counter_sam_'))).toBe(false);
    expect(state.flags.some((flag) => flag.startsWith('final_counter_reed_'))).toBe(false);
  });
});
