import { describe, expect, it } from 'vitest';
import { maraVisit } from '../src/content/mara';
import { noraVisit } from '../src/content/nora';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueState,
  type DialogueStory,
} from '../src/game/dialogue';

function walk(story: DialogueStory, choices: readonly string[]) {
  return choices.reduce(
    (state, choice) => selectOption(story, state, choice),
    startDialogue(story),
  );
}

function withFlags(story: DialogueStory, flags: readonly string[]): DialogueState {
  return { ...startDialogue(story), flags: [...flags] };
}

describe('narrative conversation regression', () => {
  it.each([
    ['Mara day one', maraVisit],
    ['Nora day three', noraVisit],
    ['final reading', finalReading],
  ])('%s has no broken links or unreachable nodes', (_name, story) => {
    expect(validateDialogue(story)).toEqual([]);
  });

  it('keeps Nora on the cinema photograph until the archive choice is recorded', () => {
    const state = walk(noraVisit, [
      'hello',
      'nora-reflection',
      'nora-reflect-question',
      'nora-reflect-continue',
      'nora-record-uncertain',
      'nora-uncertain-back',
      'nora-reflect-finish',
    ]);
    expect(state.node).toBe('hello');
    expect(state.flags).toContain('nora_will_preserve_uncertainty');
    expect(state.flags).toContain('nora_reflected_on_uncertainty');
    expect(availableOptions(noraVisit, state).map((option) => option.id)).not.toContain(
      'nora-reflection',
    );
  });

  it('records distinct reactions to Mara’s book debate', () => {
    const question: DialogueState = {
      ...startDialogue(maraVisit),
      node: 'trust-question',
    };
    const forgiveness = selectOption(maraVisit, question, 'trust-forgive');
    const change = selectOption(maraVisit, question, 'trust-change');
    expect(forgiveness.flags).toContain('mara_discussed_forgiveness');
    expect(forgiveness.flags).not.toContain('mara_discussed_change');
    expect(change.flags).toContain('mara_discussed_change');
    expect(change.flags).not.toContain('mara_discussed_forgiveness');
  });

  it('does not offer final callbacks without their earlier conversation flags', () => {
    const gathering: DialogueState = { ...startDialogue(finalReading), node: 'gathering' };
    const ids = availableOptions(finalReading, gathering).map((option) => option.id);
    expect(ids).not.toContain('final-couple-conversation-option');
    expect(ids).not.toContain('final-couple-anna-thomas-option');
    expect(ids).not.toContain('final-iris-eleanor-option');
    expect(ids).not.toContain('final-v3-mara-option');
  });

  it('unlocks the Mara and Leo scene only after both prerequisite conversations', () => {
    const alone = withFlags(finalReading, ['mara_own_morning_heard']);
    const together = withFlags(finalReading, ['mara_own_morning_heard', 'leo_honesty_discussed']);
    const atGathering = (state: DialogueState): DialogueState => ({
      ...state,
      node: 'gathering',
    });
    expect(
      availableOptions(finalReading, atGathering(alone)).some(
        (option) => option.id === 'final-couple-conversation-option',
      ),
    ).toBe(false);
    expect(
      availableOptions(finalReading, atGathering(together)).some(
        (option) => option.id === 'final-couple-conversation-option',
      ),
    ).toBe(true);
  });

  it('shows the matching finale callback for each distinct Nora choice', () => {
    const node = 'final-v3-nora';
    const uncertainty = currentNode(finalReading, {
      ...withFlags(finalReading, ['nora_will_preserve_uncertainty']),
      node,
    });
    const consent = currentNode(finalReading, {
      ...withFlags(finalReading, ['nora_will_seek_consent']),
      node,
    });
    expect(uncertainty.text).toContain('дати');
    expect(consent.text).toContain('власниці');
    expect(uncertainty.text).not.toBe(consent.text);
  });

  it('keeps the letter-related and rumor-related endings gated by player history', () => {
    const state: DialogueState = { ...startDialogue(finalReading), node: 'gathering' };
    const ids = availableOptions(finalReading, state).map((option) => option.id);
    expect(ids).not.toContain('letter');
    expect(ids).not.toContain('rumor-player-accountability');
    const exposed = availableOptions(finalReading, {
      ...state,
      flags: ['saw_envelope', 'rumor_amplified'],
    }).map((option) => option.id);
    expect(exposed).toContain('letter');
    expect(exposed).toContain('rumor-player-accountability');
  });
  it('keeps the sealed and opened letter versions separate', () => {
    const sealed = currentNode(finalReading, {
      ...withFlags(finalReading, ['saw_envelope']),
      node: 'letter',
    });
    const opened = currentNode(finalReading, {
      ...withFlags(finalReading, ['saw_envelope', 'opened_private_letter']),
      node: 'letter',
    });
    const admitted = currentNode(finalReading, {
      ...withFlags(finalReading, [
        'saw_envelope',
        'opened_private_letter',
        'iris_letter_breach_admitted',
      ]),
      node: 'letter',
    });
    expect(sealed.text).toContain('запечатаний');
    expect(opened.text).toContain('порушена');
    expect(admitted.text).toContain('Айріс знає');
    expect(new Set([sealed.text, opened.text, admitted.text]).size).toBe(3);
  });

  it('never offers mutual letter conversation after a privacy breach', () => {
    const base: DialogueState = {
      ...withFlags(finalReading, [
        'saw_envelope',
        'iris_letter_choice_respected',
        'leo_open_to_conversation',
      ]),
      node: 'letter',
    };
    expect(availableOptions(finalReading, base).map((option) => option.id)).toContain('mutual');
    expect(
      availableOptions(finalReading, {
        ...base,
        flags: [...base.flags, 'opened_private_letter'],
      }).map((option) => option.id),
    ).not.toContain('mutual');
  });

  it('requires the player to own the opened letter before offering trust repair', () => {
    const base: DialogueState = {
      ...withFlags(finalReading, ['saw_envelope', 'opened_private_letter']),
      node: 'letter',
    };
    const before = availableOptions(finalReading, base).map((option) => option.id);
    expect(before).toContain('admit-breach-now');
    expect(before).not.toContain('repair-trust');
    const admitted = {
      ...base,
      flags: [...base.flags, 'iris_letter_breach_admitted'],
    };
    const after = availableOptions(finalReading, admitted).map((option) => option.id);
    expect(after).not.toContain('admit-breach-now');
    expect(after).toContain('repair-trust');
  });

  it('keeps the rumor accountability route separate from a rumor merely heard', () => {
    const base: DialogueState = { ...startDialogue(finalReading), node: 'gathering' };
    const heard = availableOptions(finalReading, {
      ...base,
      flags: ['rumor_heard'],
    }).map((option) => option.id);
    const amplified = availableOptions(finalReading, {
      ...base,
      flags: ['rumor_heard', 'rumor_amplified'],
    }).map((option) => option.id);
    expect(heard).toContain('rumor-miller-followup');
    expect(heard).not.toContain('rumor-player-accountability');
    expect(amplified).toContain('rumor-player-accountability');
  });

  it('shows distinct Iris exhibition outcomes for a private and an open choice', () => {
    const privateVersion = currentNode(finalReading, {
      ...withFlags(finalReading, ['iris_exhibition_private_choice']),
      node: 'final-v3-iris',
    });
    const openVersion = currentNode(finalReading, {
      ...withFlags(finalReading, ['iris_exhibition_artist_controls']),
      node: 'final-v3-iris',
    });
    expect(privateVersion.text).toContain('один малюнок');
    expect(openVersion.text).toContain('три малюнки');
    expect(privateVersion.text).not.toBe(openVersion.text);
  });

  it('prioritizes the combined gathering callback over a single-condition callback', () => {
    const node = 'gathering';
    const both = currentNode(finalReading, {
      ...withFlags(finalReading, ['final_repaired_rumor', 'final_iris_exhibition']),
      node,
    });
    const onlyRumor = currentNode(finalReading, {
      ...withFlags(finalReading, ['final_repaired_rumor']),
      node,
    });
    expect(both.text).toContain('малюнків');
    expect(onlyRumor.text).toContain('Томасом');
    expect(both.text).not.toBe(onlyRumor.text);
  });

});
