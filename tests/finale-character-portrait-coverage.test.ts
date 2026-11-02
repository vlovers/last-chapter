import { describe, expect, it } from 'vitest';
import { finalReading } from '../src/content/day-five';
import { castMember } from '../src/game/cast';
import { currentNode, startDialogue } from '../src/game/dialogue';

const portraitScenes = {
  Анна: [
    'after-case-anna-new',
    'after-case-anna-story-new',
    'after-case-anna-books-new',
    'after-case-anna-rest-new',
  ],
  Лео: [
    'after-case-leo-new',
    'after-case-leo-music-new',
    'after-case-leo-walk-new',
    'after-case-leo-schedule-new',
  ],
  Елеонора: [
    'after-case-eleanor-new',
    'after-case-eleanor-stock-new',
    'after-case-eleanor-story-new',
    'after-case-eleanor-change-new',
  ],
  'Пані Міллер': [
    'after-case-miller-new',
    'after-case-miller-apology-new',
    'after-case-miller-cups-new',
    'after-case-miller-cake-new',
    'bookshop-tomorrow-miller-new',
    'bookshop-tomorrow-miller-soft-new',
    'bookshop-tomorrow-miller-fun-new',
    'bookshop-tomorrow-miller-privacy-new',
  ],
  Айріс: [
    'after-case-iris-new',
    'after-case-iris-weather-new',
    'after-case-iris-book-new',
    'after-case-iris-silence-new',
    'bookshop-tomorrow-iris-new',
    'bookshop-tomorrow-iris-choose-new',
    'bookshop-tomorrow-iris-tea-new',
    'bookshop-tomorrow-iris-leave-new',
  ],
} as const;

describe('finale character identity and portrait coverage', () => {
  for (const [speaker, ids] of Object.entries(portraitScenes)) {
    it(`keeps ${speaker} visible throughout the optional conversations`, () => {
      const portrait = castMember(speaker);
      expect(portrait?.portrait).toMatch(/^\/art\/portraits\/.+\.svg$/);
      for (const id of ids) {
        const node = finalReading.nodes.find((item) => item.id === id);
        expect(node, `Missing scene ${id}`).toBeDefined();
        expect(node?.speaker, `Wrong portrait at ${id}`).toBe(speaker);
        expect(node?.options.length, `Too many replies at ${id}`).toBeLessThanOrEqual(4);
        const resolved = currentNode(finalReading, {
          ...startDialogue(finalReading),
          node: id,
          flags: ['final_miller_ledger_rumor_seeded', 'final_miller_rumor_corrected_publicly'],
        });
        expect(resolved.speaker).toBe(speaker);
      }
    });
  }

  it('keeps the quiet Frank interaction narrated rather than inventing a speaking cat', () => {
    for (const id of ['after-case-frank', 'bookshop-tomorrow-frank-new']) {
      const node = finalReading.nodes.find((item) => item.id === id);
      expect(node?.speaker).toBe('Оповідач');
    }
  });
});
