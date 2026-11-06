import { describe, expect, it } from 'vitest';
import { maraVisit } from '../src/content/mara';
import { millerVisit } from '../src/content/first-day';
import {
  availableOptions,
  selectOption,
  startDialogue,
  type DialogueStory,
} from '../src/game/dialogue';
import { encodeSave, decodeSave } from '../src/game/save';
import { startChapter, chooseChapterOption } from '../src/game/chapter';
import {
  answerConversation,
  conversationAvailable,
  conversationView,
  restoreConversation,
  startConversation,
} from '../src/phaser/conversation-engine';
import { maraBookClub } from '../src/phaser/mara-book-club';

const hubStory: DialogueStory = {
  start: 'hub',
  nodes: [
    {
      id: 'hub',
      hub: true,
      speaker: 'Мара',
      text: 'Про що поговоримо?',
      options: [
        { id: 'once', label: 'Поговорити', next: 'reply', reopensWhen: ['new_day'] },
        { id: 'repeat', label: 'Подивитися на дощ', next: 'reply', repeatability: 'repeatable' },
        { id: 'continue', label: 'Обрати книжку', next: 'end', repeatability: 'repeatable' },
      ],
    },
    {
      id: 'reply',
      speaker: 'Мара',
      text: 'Дощить.',
      options: [{ id: 'back', label: 'Повернутися', next: 'hub', repeatability: 'repeatable' }],
    },
    { id: 'end', speaker: 'Мара', text: 'До зустрічі.', options: [] },
  ],
};
const ids = (story: DialogueStory, state: ReturnType<typeof startDialogue>) =>
  availableOptions(story, state).map((o) => o.id);

describe('conversation completion ledger', () => {
  it.each([
    {
      story: maraVisit,
      stage: 'mara' as const,
      route: ['hello', 'thank', 'talk', 'bakery', 'bakery-tired', 'tired-ask', 'silence-return'],
      consumed: 'bakery',
      exit: 'gift-now',
    },
    {
      story: millerVisit,
      stage: 'miller' as const,
      route: ['greet', 'chat', 'jam', 'jam-kind', 'jam-kind-return'],
      consumed: 'jam',
      exit: 'miller-order',
    },
  ])(
    'completes $stage topics on return, persists and migrates legacy history',
    ({ story, stage, route, consumed, exit }) => {
      let dialogue = startDialogue(story);
      for (const choice of route) dialogue = selectOption(story, dialogue, choice);
      expect(ids(story, dialogue)).not.toContain(consumed);
      expect(ids(story, dialogue)).toContain(exit);
      expect(() => selectOption(story, dialogue, consumed)).toThrow('Option unavailable');
      const chapter = { stage, flags: dialogue.flags, dialogue };
      const restored = decodeSave(encodeSave(chapter))!;
      expect(restored).toEqual(chapter);
      expect(ids(story, restored.dialogue)).not.toContain(consumed);
      const legacy = JSON.parse(encodeSave(chapter));
      delete legacy.completed;
      delete legacy.pending;
      const migrated = decodeSave(JSON.stringify(legacy))!;
      expect(ids(story, migrated.dialogue)).not.toContain(consumed);
      expect(ids(story, migrated.dialogue)).toContain(exit);
    },
  );

  it('preserves a pending topic across save, close and resume', () => {
    let chapter = startChapter();
    for (const choice of ['greet', 'chat', 'jam']) chapter = chooseChapterOption(chapter, choice);
    expect(chapter.dialogue.completed).toEqual([]);
    const restored = decodeSave(encodeSave(chapter))!;
    expect(restored.dialogue.pending?.some((p) => p.hub === 'topics')).toBe(true);
    expect(restored.dialogue.node).toBe('jam');
    const done = chooseChapterOption(chooseChapterOption(restored, 'jam-kind'), 'jam-kind-return');
    expect(ids(millerVisit, done.dialogue)).not.toContain('jam');
  });

  it('also consumes nested optional answers when they return to their local hub', () => {
    let state = startDialogue(maraVisit);
    for (const id of ['hello', 'thank', 'talk', 'fiction', 'fiction-boundary', 'boundary-return'])
      state = selectOption(maraVisit, state, id);
    expect(ids(maraVisit, state)).not.toContain('fiction-boundary');
    expect(ids(maraVisit, state)).toContain('fiction-ask');
    expect(ids(maraVisit, state)).toContain('fiction-back');
  });

  it('allows explicitly repeatable interactions and conditional reappearance', () => {
    let state = startDialogue(hubStory);
    state = selectOption(hubStory, selectOption(hubStory, state, 'once'), 'back');
    expect(ids(hubStory, state)).not.toContain('once');
    for (let i = 0; i < 3; i++)
      state = selectOption(hubStory, selectOption(hubStory, state, 'repeat'), 'back');
    expect(ids(hubStory, state)).toContain('repeat');
    expect(ids(hubStory, { ...state, flags: ['new_day'] })).toContain('once');
    expect(selectOption(hubStory, state, 'continue').node).toBe('end');
  });

  it('keeps closing navigation available in legacy saves stopped inside a repeated topic', () => {
    const story: DialogueStory = {
      ...hubStory,
      nodes: hubStory.nodes.map((n) =>
        n.id === 'reply'
          ? { ...n, options: [{ id: 'back', label: 'Повернутися', next: 'hub' }] }
          : n,
      ),
    };
    const legacy = { node: 'reply', flags: [], history: ['once', 'back', 'once', 'back', 'once'] };
    expect(ids(story, legacy)).toContain('back');
    const returned = selectOption(story, legacy, 'back');
    expect(ids(story, returned)).not.toContain('once');
    expect(ids(story, returned)).toContain('continue');
  });

  it('does not consume a conversation just for entering it', () => {
    const state = selectOption(hubStory, startDialogue(hubStory), 'once');
    expect(state.completed).toEqual([]);
    expect(state.pending).toHaveLength(1);
  });

  it('hides completed optional topics after restore and keeps suspended topics available', () => {
    const start = startConversation(maraBookClub);
    const done = answerConversation(maraBookClub, start, 'leave');
    expect(
      conversationAvailable(maraBookClub, restoreConversation(maraBookClub, JSON.stringify(done))!),
    ).toBe(false);
    expect(conversationAvailable({ ...maraBookClub, repeatability: 'repeatable' }, done)).toBe(
      true,
    );
    const pending = answerConversation(
      maraBookClub,
      answerConversation(maraBookClub, start, 'rhys'),
      'exit',
    );
    const restored = restoreConversation(maraBookClub, JSON.stringify(pending))!;
    expect(restored.finished).toBe(false);
    expect(conversationAvailable(maraBookClub, restored)).toBe(true);
    expect(conversationView(maraBookClub, restored).id).toBe('rhys');
  });

  it('prevents repeated outcomes within the optional graph without hiding exits', () => {
    let session = startConversation(maraBookClub);
    for (const id of ['empathy', 'fiction', 'back'])
      session = answerConversation(maraBookClub, session, id);
    const view = conversationView(maraBookClub, session);
    expect(view.choices.map((c) => c.id)).not.toContain('fiction');
    expect(view.choices.map((c) => c.id)).toContain('exit');
    expect(() => answerConversation(maraBookClub, session, 'fiction')).toThrow();
  });

  it('rejects malformed completion ledgers at save boundaries', () => {
    const raw = JSON.parse(encodeSave(startChapter()));
    expect(decodeSave(JSON.stringify({ ...raw, completed: {}, pending: [] }))).toBeNull();
    expect(decodeSave(JSON.stringify({ ...raw, completed: [], pending: [null] }))).toBeNull();
    expect(
      restoreConversation(
        maraBookClub,
        JSON.stringify({ ...startConversation(maraBookClub), completed: [null], pending: [] }),
      ),
    ).toBeNull();
  });
});
