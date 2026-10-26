import { describe, expect, it } from 'vitest';
import {
  advanceToDayFourMara,
  chooseChapterOption,
  finishSeason,
  stageStory,
  startFifthDay,
  type ChapterState,
} from '../src/game/chapter';
import { availableOptions, currentNode, startDialogue } from '../src/game/dialogue';
import { decodeSave, encodeSave } from '../src/game/save';

function at(stage: ChapterState['stage'], flags: readonly string[]): ChapterState {
  return { stage, flags, dialogue: { ...startDialogue(stageStory(stage)), flags } };
}

function choose(state: ChapterState, ...options: readonly string[]) {
  return options.reduce((current, option) => chooseChapterOption(current, option), state);
}

describe('Narrative decisions survive chapter transitions and save/load', () => {
  it('keeps Iris privacy decisions after a save and when advancing to Mara', () => {
    const iris = choose(
      at('day4-iris', ['saw_envelope', 'opened_private_letter']),
      'welcome',
      'letter',
      'admit-opened',
      'breach-back',
      'leave',
    );
    const loaded = decodeSave(encodeSave(iris));
    expect(loaded).not.toBeNull();
    expect(loaded?.flags).toContain('iris_letter_breach_admitted');
    expect(loaded?.flags).toContain('opened_private_letter');
    const mara = advanceToDayFourMara(loaded!);
    expect(mara.dialogue.flags).toContain('iris_letter_breach_admitted');
    expect(mara.flags).toContain('opened_private_letter');
  });

  it('preserves the late confession and its unique ending through a saved Day 5', () => {
    const dayFive = startFifthDay(at('day4-complete', ['saw_envelope', 'opened_private_letter']));
    const confessed = choose(
      dayFive,
      'open',
      'letter',
      'admit-breach-now',
      'admit-breach-now-back',
    );
    const restored = decodeSave(encodeSave(confessed));
    expect(restored?.flags).toContain('final_letter_breach_disclosed');
    expect(restored?.dialogue.node).toBe('gathering');
    const completed = choose(restored!, 'close');
    expect(currentNode(stageStory(completed.stage), completed.dialogue).text).toContain(
      'Вона почула правду',
    );
    expect(finishSeason(completed).stage).toBe('season-complete');
  });

  it('does not turn hearing a rumor into amplification after saving', () => {
    const heard = choose(at('miller', []), 'greet', 'town', 'gossip', 'what-saw', 'acknowledge');
    const loaded = decodeSave(encodeSave(heard));
    expect(loaded?.flags).toContain('rumor_heard');
    expect(loaded?.flags).not.toContain('rumor_amplified');
    const anna = at('anna', loaded!.flags);
    const talk = choose(anna, 'hello', 'rumor');
    const options = availableOptions(stageStory(talk.stage), talk.dialogue);
    expect(options.map((option) => option.id)).not.toContain('rumor-own-amplification');
  });

  it('carries a Day 1 rumor into a Day 3 apology to Thomas after reload', () => {
    const miller = choose(
      at('miller', []),
      'greet',
      'town',
      'gossip',
      'what-saw',
      'speculate',
      'speculation-move-on',
    );
    const thomas = at('thomas', decodeSave(encodeSave(miller))!.flags);
    const apologized = choose(
      thomas,
      'greet',
      'rumor',
      'rumor-own-words',
      'rumor-own-words-back',
      'finish',
    );
    const loaded = decodeSave(encodeSave(apologized));
    expect(loaded?.flags).toContain('rumor_amplified');
    expect(loaded?.flags).toContain('thomas_heard_rumor_apology');
    expect(loaded?.flags).not.toContain('thomas_privacy_pressed');
    expect(loaded?.dialogue.node).toBe('end');
  });

  it('keeps late confession distinct from an unearned mutual finale after reload', () => {
    const state = startFifthDay(
      at('day4-complete', [
        'saw_envelope',
        'opened_private_letter',
        'iris_letter_choice_respected',
        'leo_open_to_conversation',
      ]),
    );
    const atLetter = choose(state, 'open', 'letter');
    const loaded = decodeSave(encodeSave(atLetter))!;
    expect(
      availableOptions(stageStory(loaded.stage), loaded.dialogue).map((option) => option.id),
    ).not.toContain('mutual');
    const confessed = choose(loaded, 'admit-breach-now', 'admit-breach-now-back', 'close');
    expect(currentNode(stageStory(confessed.stage), confessed.dialogue).text).toContain(
      'Вона почула правду',
    );
  });

  it('does not offer Thomas a false apology for a rumor the player only heard', () => {
    const miller = choose(
      at('miller', []),
      'greet',
      'town',
      'gossip',
      'what-saw',
      'acknowledge',
    );
    const thomas = at('thomas', decodeSave(encodeSave(miller))!.flags);
    const conversation = choose(thomas, 'greet', 'rumor');
    const options = availableOptions(
      stageStory(conversation.stage),
      conversation.dialogue,
    ).map((option) => option.id);
    expect(options).not.toContain('rumor-own-words');
    expect(options).toContain('rumor-boundary');
  });

  it('persists amplification and allows a Day 2 admission without losing a book sale', () => {
    const miller = choose(
      at('miller', []),
      'greet',
      'town',
      'gossip',
      'what-saw',
      'speculate',
      'speculation-reconsider',
    );
    const anna = at('anna', decodeSave(encodeSave(miller))!.flags);
    const admitted = choose(
      anna,
      'hello',
      'rumor',
      'rumor-own-amplification',
      'rumor-own-amplification-books',
      'maps',
      'purchase-end',
    );
    const loaded = decodeSave(encodeSave(admitted));
    expect(loaded?.flags).toContain('rumor_amplified');
    expect(loaded?.flags).toContain('rumor_amplification_reconsidered');
    expect(loaded?.flags).toContain('anna_heard_rumor_admission');
    expect(loaded?.flags).toContain('anna_chose_maps');
  });
});
