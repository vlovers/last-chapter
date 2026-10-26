import { describe, expect, it } from 'vitest';
import { allowedMaraTopic, availableMaraTopics } from '../src/phaser/mara-topic-availability';
import { maraBookClub } from '../src/phaser/mara-book-club';
import { maraReturnVisit } from '../src/phaser/mara-return-visit';
import { maraLetterDecision } from '../src/phaser/mara-letter-decision';

describe('Mara conversation unlocks', () => {
  it('keeps later meetings locked on days one and two', () => {
    for (const day of [1, 2]) {
      expect(availableMaraTopics(day)).toHaveLength(2);
      expect(allowedMaraTopic(day, maraReturnVisit)).toBe(maraBookClub);
      expect(allowedMaraTopic(day, maraLetterDecision)).toBe(maraBookClub);
    }
  });
  it('unlocks the return visit on day three', () => {
    expect(availableMaraTopics(3).map((topic) => topic.id)).toContain(maraReturnVisit.id);
    expect(availableMaraTopics(3).map((topic) => topic.id)).not.toContain(maraLetterDecision.id);
  });
  it('unlocks the letter resolution on day four', () => {
    expect(availableMaraTopics(4).map((topic) => topic.id)).toContain(maraLetterDecision.id);
    expect(allowedMaraTopic(4, maraLetterDecision)).toBe(maraLetterDecision);
  });
  it('relocks a selected topic if the story day rolls back', () => {
    expect(allowedMaraTopic(2, maraLetterDecision)).toBe(maraBookClub);
  });
});
