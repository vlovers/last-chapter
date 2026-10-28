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
  return choices.reduce((state, choice) => selectOption(story, state, choice), startDialogue(story));
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
    const together = withFlags(finalReading, [
      'mara_own_morning_heard',
      'leo_honesty_discussed',
    ]);
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
});
