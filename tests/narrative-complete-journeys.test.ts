import { describe, expect, it } from 'vitest';
import { bookClub } from '../src/content/book-club';
import { quietEvening } from '../src/content/quiet-evening';
import { annaVisit } from '../src/content/anna';
import { leoVisit } from '../src/content/leo';
import { irisVisit } from '../src/content/iris';
import { noraVisit } from '../src/content/nora';
import { thomasVisit } from '../src/content/thomas';
import { millerVisit } from '../src/content/first-day';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  validateDialogue,
  type DialogueStory,
  type DialogueState,
} from '../src/game/dialogue';

function follow(story: DialogueStory, path: readonly string[]) {
  let state = startDialogue(story);
  for (const id of path) {
    const options = availableOptions(story, state);
    expect(
      options.map((option) => option.id),
      `Missing ${id} at ${state.node}`,
    ).toContain(id);
    state = selectOption(story, state, id);
  }
  return state;
}

describe('complete optional narrative journeys', () => {
  it.each([
    [
      'book club: argument with Anna',
      bookClub,
      ['welcome', 'discuss-books', 'books-argument', 'argument-anna', 'argument-anna-back'],
      'welcome',
      'club_argued_about_characters',
    ],
    [
      'book club: disagreement with Mara',
      bookClub,
      ['welcome', 'ask-mara', 'mara-disagree', 'mara-disagree-push', 'mara-disagree-more-back'],
      'welcome',
      'club_mara_disagreed',
    ],
    [
      'book club: bad romance with Miller',
      bookClub,
      [
        'welcome',
        'discuss-books',
        'books-bad-review',
        'books-bad-review-miller',
        'books-bad-review-miller-back',
      ],
      'welcome',
      'club_bad_romance_debated',
    ],
    [
      'book club: reading recommendations',
      bookClub,
      [
        'welcome',
        'club-new-reader',
        'club-new-reader-mara',
        'club-new-reader-mara-back',
        'club-new-reader-mara-finish',
      ],
      'welcome',
      'club_recommended_easy_reading',
    ],
    [
      'Miller: bakery and Mara',
      millerVisit,
      ['greet', 'chat', 'miller-neighbors', 'miller-neighbors-mara', 'miller-neighbors-mara-back'],
      'topics',
      'miller_bakery_story_heard',
    ],
    [
      'Anna: dragon union',
      annaVisit,
      ['hello', 'anna-school-funny', 'anna-school-funny-work', 'anna-school-funny-work-back'],
      'hello',
      'anna_classroom_joke_heard',
    ],
    [
      'Leo: lost cardboard moon',
      leoVisit,
      ['greet', 'leo-station-funny', 'leo-station-funny-boss', 'leo-station-funny-boss-return'],
      'greet',
      'leo_station_moon_story_heard',
    ],
    [
      'Iris: fox illustration',
      irisVisit,
      ['welcome', 'iris-sketch-mishap', 'iris-sketch-mishap-fix', 'iris-sketch-mishap-fix-back'],
      'welcome',
      'iris_fox_story_heard',
    ],
    [
      'Nora: newspaper misprint',
      noraVisit,
      ['hello', 'nora-newspaper', 'nora-newspaper-letter', 'nora-newspaper-letter-back'],
      'hello',
      'nora_newspaper_story_heard',
    ],
    [
      'Thomas: music box',
      thomasVisit,
      ['greet', 'thomas-repair-funny', 'thomas-repair-funny-note', 'thomas-repair-funny-note-back'],
      'greet',
      'thomas_music_box_story_heard',
    ],
    [
      'quiet evening: Frank wins',
      quietEvening,
      ['sit-frank', 'frank-toy', 'frank-toy-play', 'frank-toy-win-books'],
      'manuscript',
      'quiet_evening_frank_played',
    ],
    [
      'quiet evening: Frank gets attention',
      quietEvening,
      ['sit-frank', 'frank-treat', 'frank-treat-pet', 'frank-treat-pet-books'],
      'manuscript',
      'quiet_evening_frank_company',
    ],
    [
      'quiet evening: lost book note',
      quietEvening,
      ['closing-leftovers', 'closing-leftovers-note', 'closing-leftovers-note-books'],
      'manuscript',
      'quiet_evening_mara_lost_book_note',
    ],
  ] as const)('%s can be played from its actual entry', (_name, story, path, destination, flag) => {
    const state = follow(story, path);
    expect(state.node).toBe(destination);
    expect(state.flags).toContain(flag);
    expect(currentNode(story, state).text.length).toBeGreaterThan(30);
  });

  it.each([
    ['book club', bookClub],
    ['quiet evening', quietEvening],
    ['Miller', millerVisit],
    ['Anna', annaVisit],
    ['Leo', leoVisit],
    ['Iris', irisVisit],
    ['Nora', noraVisit],
    ['Thomas', thomasVisit],
  ] as const)('%s has a valid dialogue graph', (_name, story) => {
    expect(validateDialogue(story)).toEqual([]);
  });
  it('Anna classroom story changes the later book club welcome through carried flags', () => {
    const visit = follow(annaVisit, [
      'hello',
      'anna-school-funny',
      'anna-school-funny-work',
      'anna-school-funny-work-back',
    ]);
    const clubState = { ...startDialogue(bookClub), flags: visit.flags };
    const greeting = selectOption(bookClub, clubState, 'welcome');
    expect(currentNode(bookClub, greeting).text).toContain('дракона');
    expect(
      availableOptions(bookClub, greeting).some((option) => option.id === 'discuss-books'),
    ).toBe(true);
  });

  it('Miller bakery gossip changes book club dialogue without spreading harmful rumors', () => {
    const visit = follow(millerVisit, [
      'greet',
      'chat',
      'miller-neighbors',
      'miller-neighbors-mara',
      'miller-neighbors-mara-back',
    ]);
    expect(visit.flags).not.toContain('rumor_amplified');
    const clubState = { ...startDialogue(bookClub), flags: visit.flags };
    const greeting = selectOption(bookClub, clubState, 'welcome');
    expect(currentNode(bookClub, greeting).text).toContain('кориці');
  });

  it('three independent conversations create the combined club opening', () => {
    const anna = follow(annaVisit, [
      'hello',
      'anna-school-funny',
      'anna-school-funny-work',
      'anna-school-funny-work-back',
    ]);
    const leo = follow(leoVisit, [
      'greet',
      'leo-station-funny',
      'leo-station-funny-boss',
      'leo-station-funny-boss-return',
    ]);
    const miller = follow(millerVisit, [
      'greet',
      'chat',
      'miller-neighbors',
      'miller-neighbors-mara',
      'miller-neighbors-mara-back',
    ]);
    const club = {
      ...startDialogue(bookClub),
      flags: [...new Set([...anna.flags, ...leo.flags, ...miller.flags])],
    };
    const greeting = selectOption(bookClub, club, 'welcome');
    const text = currentNode(bookClub, greeting).text;
    expect(text).toContain('дракона');
    expect(text).toContain('місяця');
    expect(text).toContain('корицю');
  });

  it('quiet evening Frank detours still allow the player to finish the manuscript scene', () => {
    for (const path of [
      ['sit-frank', 'frank-toy', 'frank-toy-play', 'frank-toy-win-books'],
      ['sit-frank', 'frank-treat', 'frank-treat-pet', 'frank-treat-pet-books'],
      ['closing-leftovers', 'closing-leftovers-note', 'closing-leftovers-note-books'],
    ]) {
      let state = follow(quietEvening, path);
      state = selectOption(quietEvening, state, 'read-margin');
      state = selectOption(quietEvening, state, 'margin-keep');
      expect(state.node).toBe('end');
      expect(state.flags).toContain('quiet_evening_page_found');
      expect(state.flags).toContain('quiet_evening_margin_warning_seen');
    }
  });

  it.each([
    [['book_club_started', 'club_bad_romance_debated'], 'весілля'],
    [['book_club_started', 'club_recommended_easy_reading'], 'коміксів'],
    [['book_club_started', 'club_argued_about_characters'], 'злодій'],
    [
      ['book_club_started', 'club_bad_romance_debated', 'club_recommended_easy_reading'],
      'рецептами',
    ],
  ] as const)('quiet evening remembers book club outcome %j', (flags, phrase) => {
    const scene = currentNode(quietEvening, { ...startDialogue(quietEvening), flags });
    expect(scene.text).toContain(phrase);
    expect(
      availableOptions(quietEvening, { ...startDialogue(quietEvening), flags }).some(
        (o) => o.id === 'sit-frank',
      ),
    ).toBe(true);
  });
  it.each([
    ['closing-cleanup-bookmarks', 'closing-cleanup-bookmarks-back', 'club_bookmarks_saved'],
    ['closing-cleanup-note', 'closing-cleanup-note-back', 'club_reading_list_joke_seen'],
    ['closing-cleanup-frank', 'closing-cleanup-frank-back', 'club_frank_cleaning_attempt'],
  ] as const)(
    'book club cleanup %s resolves once and leaves the evening open',
    (choice, finish, flag) => {
      let state: DialogueState = { ...startDialogue(quietEvening), flags: ['book_club_started'] };
      state = selectOption(quietEvening, state, 'closing-book-club-cleanup');
      state = selectOption(quietEvening, state, choice);
      state = selectOption(quietEvening, state, finish);
      expect(state.node).toBe('closing');
      expect(state.flags).toContain(flag);
      expect(availableOptions(quietEvening, state).map((option) => option.id)).not.toContain(
        'closing-book-club-cleanup',
      );
      state = selectOption(quietEvening, state, 'tidy-books');
      expect(state.node).toBe('manuscript');
    },
  );

  it('club cleanup is not offered if the club did not happen', () => {
    expect(
      availableOptions(quietEvening, startDialogue(quietEvening)).map((option) => option.id),
    ).not.toContain('closing-book-club-cleanup');
  });
  it('quiet evening never shows more than four actions, including after book club', () => {
    for (const flags of [
      [],
      ['book_club_started'],
      ['book_club_started', 'club_bad_romance_debated'],
      ['book_club_started', 'club_bookmarks_saved'],
    ]) {
      const state = { ...startDialogue(quietEvening), flags };
      const choices = availableOptions(quietEvening, state);
      expect(choices.length).toBeLessThanOrEqual(4);
      expect(new Set(choices.map((option) => option.id)).size).toBe(choices.length);
      expect(choices.some((option) => option.id === 'tidy-books')).toBe(true);
    }
  });
  it.each([
    ['miller-spoiler-apologize', 'miller-spoiler-rules-back', 'club_spoiler_rules_agreed'],
    ['miller-spoiler-tease', 'miller-spoiler-tease-back', 'club_miller_spoiler_teased'],
  ] as const)('Miller spoiler conversation %s returns to the club', (choice, finish, flag) => {
    const state = follow(bookClub, ['welcome', 'ask-miller', 'miller-spoiler', choice, finish]);
    expect(state.node).toBe('welcome');
    expect(state.flags).toContain(flag);
    expect(availableOptions(bookClub, state).some((option) => option.id === 'discuss-books')).toBe(
      true,
    );
  });
  it.each([
    ['club-letter-welcome', 'club-letter-welcome-back', 'club_open_invitation_posted'],
    ['club-letter-honest', 'club-letter-honest-back', 'club_reading_pressure_lifted'],
    ['club-letter-private', 'club-letter-private-back', 'club_letter_privacy_respected'],
  ] as const)('anonymous reader letter %s resolves from actual arrival', (choice, finish, flag) => {
    const state = follow(bookClub, ['welcome', 'club-reader-letter', choice, finish]);
    expect(state.node).toBe('welcome');
    expect(state.flags).toContain(flag);
    expect(availableOptions(bookClub, state).some((option) => option.id === 'close')).toBe(true);
  });
});
