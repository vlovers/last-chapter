import { describe, expect, it } from 'vitest';
import { readerDebatesNodes } from '../src/content/reader-debates-final';
import { finalReading } from '../src/content/day-five';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueState,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

const routes = [
  ['reader-romance', 'romance-two-books', 'romance-two-back', 'final_reader_romance_two_books', 'два романи'],
  ['reader-romance', 'romance-defend', 'romance-defend-back', 'final_reader_romance_miller_heard', 'Артура й поїзди'],
  ['reader-romance', 'romance-furniture', 'romance-furniture-back', 'final_reader_romance_side_character', 'зниклий диван'],
  ['reader-audio', 'audio-choices', 'audio-choices-back', 'final_reader_audio_choices', 'аудіокнижок'],
  ['reader-audio', 'audio-ask-ruth', 'audio-ruth-back', 'final_reader_audio_ruth_story', 'морської збірки'],
  ['reader-audio', 'audio-ask-anna', 'audio-anna-back', 'final_reader_audio_class_idea', 'малювати човни'],
  ['reader-villain', 'villain-no-spoilers', 'villain-spoilers-back', 'final_reader_villain_no_spoilers', 'закладка без спойлерів'],
  ['reader-villain', 'villain-nora', 'villain-nora-back', 'final_reader_villain_nora_view', 'на серветці'],
  ['reader-villain', 'villain-iris', 'villain-iris-back', 'final_reader_villain_iris_sketch', 'не обіцяла малюнків'],
] as const;

const topics = ['reader-romance', 'reader-audio', 'reader-villain'] as const;

function atHub() {
  return selectOption(
    finalReading,
    selectOption(finalReading, startDialogue(finalReading), 'open'),
    'final-reader-debates',
  );
}

describe('final reader debates', () => {
  it('keeps the complete story valid and each debate node at four options or fewer', () => {
    expect(validateDialogue(finalReading)).toEqual([]);
    expect(readerDebatesNodes).toHaveLength(13);
    for (const node of readerDebatesNodes) {
      expect(node.options.length, node.id).toBeGreaterThan(0);
      expect(node.options.length, node.id).toBeLessThanOrEqual(4);
    }
  });

  it.each(routes)('remembers only the chosen %s / %s route', (topic, choice, back, flag, fragment) => {
    let state = atHub();
    for (const id of [topic, choice, back]) state = selectOption(finalReading, state, id);
    expect(state.node).toBe('final-reader-debates-hub');
    expect(state.flags).toContain(flag);
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(topic);
    const epilogue = seasonEnding({ flags: state.flags }).epilogue;
    expect(epilogue).toContain(fragment);
    expect(seasonEnding({ flags: [] }).epilogue).not.toContain(fragment);
    expect(state.flags.some((f) => f.includes('ledger') || f.includes('manuscript'))).toBe(false);
  });

  it('can finish all three topics in any order, with no repeatable completed topics', () => {
    let state = atHub();
    for (const id of [
      'reader-villain',
      'villain-no-spoilers',
      'villain-spoilers-back',
      'reader-romance',
      'romance-defend',
      'romance-defend-back',
      'reader-audio',
      'audio-ask-anna',
      'audio-anna-back',
    ]) state = selectOption(finalReading, state, id);
    expect(availableOptions(finalReading, state).map((o) => o.id)).toEqual([
      'reader-debates-close',
    ]);
    state = selectOption(finalReading, state, 'reader-debates-close');
    expect(state.node).toBe('gathering');
    expect(state.flags).toContain('final_reader_debates_done');
    expect(availableOptions(finalReading, state).map((o) => o.id)).not.toContain(
      'final-reader-debates',
    );
    expect(availableOptions(finalReading, state).map((o) => o.id)).toContain('close');
    const epilogue = seasonEnding({ flags: state.flags }).epilogue;
    expect(epilogue).toContain('Артура й поїзди');
    expect(epilogue).toContain('малювати човни');
    expect(epilogue).toContain('закладка без спойлерів');
  });

  it('can leave immediately without inventing any reading decisions', () => {
    const state = selectOption(finalReading, atHub(), 'reader-debates-close');
    expect(state.flags).toEqual(['final_reader_debates_done']);
    expect(seasonEnding({ flags: state.flags }).epilogue).not.toContain('Артура й поїзди');
  });

  it('restores progress from a saved mid-debate hub', () => {
    let state = atHub();
    for (const id of ['reader-romance', 'romance-two-books', 'romance-two-back']) {
      state = selectOption(finalReading, state, id);
    }
    const restored = JSON.parse(JSON.stringify(state)) as DialogueState;
    const choices = availableOptions(finalReading, restored).map((option) => option.id);
    expect(choices).not.toContain('reader-romance');
    expect(choices).toContain('reader-audio');
    expect(choices).toContain('reader-villain');
    const next = selectOption(finalReading, restored, 'reader-audio');
    expect(next.node).toBe('final-reader-audio');
    expect(next.flags).not.toContain('final_reader_audio_done');
  });

  it('shows earned hub callbacks without inventing unseen conversations', () => {
    const baseline = currentNode(finalReading, atHub()).text;
    expect(baseline).toContain('Френк');
    const seen = currentNode(finalReading, {
      node: 'final-reader-debates-hub',
      flags: [
        'final_reader_romance_two_books',
        'final_reader_audio_choices',
        'final_reader_villain_no_spoilers',
      ],
      history: [],
    }).text;
    expect(seen).toContain('Без спойлерів');
    expect(seen).not.toBe(baseline);
  });

  it.each(topics)('does not force %s to be played before leaving', (topic) => {
    let state = atHub();
    expect(availableOptions(finalReading, state).map((option) => option.id)).toContain(topic);
    state = selectOption(finalReading, state, 'reader-debates-close');
    expect(state.node).toBe('gathering');
  });
});
