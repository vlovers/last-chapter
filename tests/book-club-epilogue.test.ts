import { describe, expect, it } from 'vitest';
import { seasonEnding } from '../src/game/endings';

describe('book club epilogue', () => {
  it('does not claim a meeting was scheduled without attendance', () => {
    const ending = seasonEnding({ flags: [] });
    expect(ending.epilogue).not.toContain('нове оголошення про книжковий клуб');
    expect(ending.epilogue).toContain('чистий аркуш');
  });

  it('mentions the next meeting after the book club has started', () => {
    const ending = seasonEnding({ flags: ['book_club_started'] });
    expect(ending.epilogue).toContain('нове оголошення про книжковий клуб');
    expect(ending.epilogue).not.toContain('чистий аркуш');
  });

  it('remembers the quiet bookstore evening when the club was skipped', () => {
    const ending = seasonEnding({ flags: ['book_club_skipped', 'evening_shop_kept_open'] });
    expect(ending.epilogue).toContain('Френк заснув біля вікна');
    expect(ending.epilogue).not.toContain('нове оголошення про книжковий клуб');
  });

  it('keeps the manuscript clue unresolved when Iris has not discussed it', () => {
    const ending = seasonEnding({ flags: ['quiet_evening_page_found'] });
    expect(ending.epilogue).toContain('запитанням, на яке ще немає відповіді');
  });

  it('respects Iris privacy in the manuscript follow-up', () => {
    const ending = seasonEnding({
      flags: ['quiet_evening_page_found', 'iris_quiet_page_privacy_respected'],
    });
    expect(ending.epilogue).toContain('таємницю розгадано');
  });

  it('reflects the choice to investigate without public accusations', () => {
    const ending = seasonEnding({
      flags: ['quiet_evening_page_found', 'iris_quiet_page_identity_questioned'],
    });
    expect(ending.epilogue).toContain('без публічних звинувачень');
  });

  it('preserves independent character outcomes alongside the club', () => {
    const ending = seasonEnding({
      flags: ['book_club_started', 'final_iris_exhibition', 'mara_future_supported'],
    });
    expect(ending.epilogue).toContain('Вікна Беллвіка');
    expect(ending.epilogue).toContain('Мара почала шукати');
    expect(ending.epilogue).toContain('книжковий клуб');
  });
});
