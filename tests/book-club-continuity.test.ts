import { describe, expect, it } from 'vitest';
import { bookClub } from '../src/content/book-club';
import {
  availableOptions,
  selectOption,
  startDialogue,
  validateDialogue,
} from '../src/game/dialogue';

describe('Book club remembers previous character choices', () => {
  const routes = [
    {
      flag: 'club_nora_privacy_respected',
      option: 'club-nora-book-return',
      endings: ['club-nora-return-private', 'club-nora-return-joke'],
    },
    {
      flag: 'mara_fantasy_captain_supported',
      option: 'club-mara-captain-rematch',
      endings: ['club-captain-defend', 'club-captain-reconsider'],
    },
    {
      flag: 'mara_fantasy_traveler_supported',
      option: 'club-mara-traveler-rematch',
      endings: ['club-traveler-map', 'club-traveler-own'],
    },
    {
      flag: 'anna_school_theater_hero_heard',
      option: 'club-school-play',
      endings: ['club-school-play-back'],
    },
    {
      flag: 'nora_umbrella_exhibit_heard',
      option: 'club-nora-umbrella',
      endings: ['club-nora-umbrella-back'],
    },
    {
      flag: 'leo_mara_platform_idea_heard',
      option: 'club-leo-concert',
      endings: ['club-leo-concert-encourage', 'club-leo-concert-tease'],
    },
  ] as const;
  it('validates all conditional scenes', () => expect(validateDialogue(bookClub)).toEqual([]));
  for (const { flag, option, endings } of routes) {
    it(`requires ${flag} and plays ${option}`, () => {
      const initial = selectOption(bookClub, startDialogue(bookClub), 'welcome');
      expect(availableOptions(bookClub, initial).map((choice) => choice.id)).not.toContain(option);
      const unlocked = { ...initial, flags: [...initial.flags, flag] };
      expect(availableOptions(bookClub, unlocked).map((choice) => choice.id)).toContain(option);
      const scene = selectOption(bookClub, unlocked, option);
      for (const ending of endings) {
        expect(availableOptions(bookClub, scene).map((choice) => choice.id)).toContain(ending);
      }
    });
  }
});
