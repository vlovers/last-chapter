import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { millerVisit } from '../src/content/first-day';
import { noraVisit } from '../src/content/nora';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueState,
  type DialogueStory,
} from '../src/game/dialogue';
import { seasonEnding } from '../src/game/endings';

function play(story: DialogueStory, route: readonly string[], flags: string[] = []) {
  let state: DialogueState = { ...startDialogue(story), flags };
  for (const id of route) {
    expect(
      availableOptions(story, state).map((option) => option.id),
      `Missing ${id} at ${state.node}`,
    ).toContain(id);
    state = selectOption(story, state, id);
  }
  return state;
}

const noraStart = ['hello', 'nora-tea', 'nora-tea-back', 'nora-reflection', 'nora-cinema-exhibit'];
const millerStart = ['greet', 'chat', 'detectives', 'miller-cinema-photo'];

const noraRoutes = [
  [
    'nora-cinema-facade',
    'nora-cinema-facade-detail',
    'nora-cinema-facade-back',
    'nora_cinema_exhibit_facade',
  ],
  [
    'nora-cinema-ask',
    'nora-cinema-ask-detail',
    'nora-cinema-ask-back',
    'nora_cinema_exhibit_consent_pending',
  ],
  [
    'nora-cinema-pause',
    'nora-cinema-pause-detail',
    'nora-cinema-pause-back',
    'nora_cinema_exhibit_paused',
  ],
] as const;

const millerRoutes = [
  [
    'miller-cinema-summer',
    'miller-cinema-summer-answer',
    'miller-cinema-summer-back',
    'miller_cinema_date_uncertain',
  ],
  [
    'miller-cinema-check',
    'miller-cinema-check-answer',
    'miller-cinema-check-back',
    'miller_cinema_description_offered',
  ],
  [
    'miller-cinema-brother',
    'miller-cinema-brother-answer',
    'miller-cinema-brother-back',
    'miller_cinema_family_story_private',
  ],
] as const;

function finalAtGathering(flags: string[]) {
  return { ...startDialogue(finalReading), node: 'gathering', flags };
}

describe('Nora and Miller: cinema photo and private memories', () => {
  it('keeps all three dialogue graphs structurally valid', () => {
    expect(validateDialogue(noraVisit)).toEqual([]);
    expect(validateDialogue(millerVisit)).toEqual([]);
    expect(validateDialogue(finalReading)).toEqual([]);
  });

  it.each(noraRoutes)(
    'Nora can finish the %s route and preserve the choice',
    (choice, detail, back, flag) => {
      const state = play(noraVisit, [...noraStart, choice, detail, back]);
      expect(state.node).toBe('hello');
      expect(state.flags).toContain('nora_cinema_exhibit_discussed');
      expect(state.flags).toContain(flag);
      expect(state.flags).not.toContain('final_nora_miller_cinema_done');
    },
  );

  it.each(millerRoutes)(
    'Miller can finish the %s route without publishing the postcard',
    (choice, detail, back, flag) => {
      const state = play(millerVisit, [...millerStart, choice, detail, back]);
      expect(state.node).toBe('topics');
      expect(state.flags).toContain('miller_cinema_photo_discussed');
      expect(state.flags).toContain(flag);
      expect(state.flags).not.toContain('rumor_amplified');
    },
  );

  it('Nora-only route opens the finale without requiring Miller gossip', () => {
    const state = finalAtGathering(['nora_cinema_exhibit_discussed', 'nora_cinema_exhibit_paused']);
    const options = availableOptions(finalReading, state).map((option) => option.id);
    expect(options).toContain('final-nora-miller-cinema-topic');
    expect(options).not.toContain('final-miller-cinema-topic');
    const opened = selectOption(finalReading, state, 'final-nora-miller-cinema-topic');
    expect(currentNode(finalReading, opened).text).toContain('не вирішила');
  });

  it('Miller-only route opens the same finale without inventing Nora consent', () => {
    const state = finalAtGathering([
      'miller_cinema_photo_discussed',
      'miller_cinema_family_story_private',
    ]);
    const options = availableOptions(finalReading, state).map((option) => option.id);
    expect(options).toContain('final-miller-cinema-topic');
    expect(options).not.toContain('final-nora-miller-cinema-topic');
    const opened = selectOption(finalReading, state, 'final-miller-cinema-topic');
    expect(currentNode(finalReading, opened).text).toContain('залишу вдома');
  });

  it('joint follow-up respects Nora pending consent and Miller private family story', () => {
    const state = finalAtGathering([
      'nora_cinema_exhibit_discussed',
      'nora_cinema_exhibit_consent_pending',
      'miller_cinema_photo_discussed',
      'miller_cinema_family_story_private',
    ]);
    const opened = selectOption(finalReading, state, 'final-nora-miller-cinema-topic');
    expect(currentNode(finalReading, opened).text).toContain('Відповіді досі немає');
    expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
      'final-miller-cinema-topic',
    );
  });

  it.each([
    [
      'final-nora-miller-compare',
      'final-nora-miller-compare-detail',
      'final-nora-miller-compare-back',
      'final_nora_miller_notes_compared',
      'окремо від перевірених дат',
    ],
    [
      'final-nora-miller-caption',
      'final-nora-miller-caption-detail',
      'final-nora-miller-caption-back',
      'final_nora_miller_caption_drafted',
      'чернетку підпису',
    ],
    [
      'final-nora-miller-defer',
      'final-nora-miller-defer-detail',
      'final-nora-miller-defer-back',
      'final_nora_miller_exhibit_deferred',
      'відклала світлини',
    ],
  ])(
    'finishes %s, records an epilogue and never reopens the topic',
    (choice, detail, back, flag, endingText) => {
      let state = finalAtGathering([
        'nora_cinema_exhibit_discussed',
        'miller_cinema_photo_discussed',
      ]);
      for (const id of ['final-nora-miller-cinema-topic', choice, detail, back]) {
        state = selectOption(finalReading, state, id);
      }
      expect(state.node).toBe('gathering');
      expect(state.flags).toContain(flag);
      expect(state.flags).toContain('final_nora_miller_cinema_done');
      expect(seasonEnding({ flags: state.flags }).epilogue).toContain(endingText);
      expect(availableOptions(finalReading, state).map((option) => option.id)).not.toContain(
        'final-nora-miller-cinema-topic',
      );
      expect(state.flags).not.toContain('final_paper_iris_lent_originals');
    },
  );

  it('invitation is optional and does not promise an event was scheduled', () => {
    let state = finalAtGathering(['miller_cinema_photo_discussed']);
    for (const id of [
      'final-miller-cinema-topic',
      'final-nora-miller-compare',
      'final-nora-miller-compare-detail',
      'final-nora-miller-compare-invite',
      'final-nora-miller-invite-back',
    ]) {
      state = selectOption(finalReading, state, id);
    }
    expect(state.flags).toContain('final_nora_miller_reading_invited');
    expect(state.flags).toContain('final_nora_miller_cinema_done');
    expect(seasonEnding({ flags: state.flags }).epilogue).toContain(
      'дату нової зустрічі ще не призначили',
    );
  });

  it('carries all nine combinations of first-day memories into the final evening', () => {
    for (const noraRoute of noraRoutes) {
      for (const millerRoute of millerRoutes) {
        const nora = play(noraVisit, [...noraStart, ...noraRoute.slice(0, 3)]);
        const miller = play(millerVisit, [...millerStart, ...millerRoute.slice(0, 3)]);
        const flags = [...new Set([...nora.flags, ...miller.flags])];
        let finale = finalAtGathering(flags);
        for (const id of [
          'final-nora-miller-cinema-topic',
          'final-nora-miller-compare',
          'final-nora-miller-compare-detail',
          'final-nora-miller-compare-back',
        ]) {
          expect(availableOptions(finalReading, finale).map((option) => option.id)).toContain(id);
          finale = selectOption(finalReading, finale, id);
        }
        expect(finale.node).toBe('gathering');
        expect(finale.flags).toContain(noraRoute[3]);
        expect(finale.flags).toContain(millerRoute[3]);
        expect(finale.flags).toContain('final_nora_miller_cinema_done');
        expect(seasonEnding({ flags: finale.flags }).epilogue).toContain(
          'невідомий рік так і не перетворився на факт',
        );
      }
    }
  });

  it('keeps all newly introduced choice lists at four options or fewer', () => {
    const newNodes = [
      ...noraVisit.nodes.filter((node) => node.id.startsWith('nora-cinema-')),
      ...millerVisit.nodes.filter((node) => node.id.startsWith('miller-cinema-')),
      ...finalReading.nodes.filter((node) => node.id.startsWith('final-nora-miller-')),
    ];
    expect(newNodes.length).toBeGreaterThanOrEqual(20);
    for (const node of newNodes) {
      expect(node.options.length).toBeLessThanOrEqual(4);
      for (const option of node.options) {
        expect(
          finalReading.nodes.some((target) => target.id === option.next) ||
            noraVisit.nodes.some((target) => target.id === option.next) ||
            millerVisit.nodes.some((target) => target.id === option.next),
        ).toBe(true);
      }
    }
  });
});
