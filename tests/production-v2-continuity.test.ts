import { describe, expect, it } from 'vitest';
import { annaVisit } from '../src/content/anna';
import { irisDecision } from '../src/content/day-four-iris';
import { leoDecision } from '../src/content/day-four-leo';
import { maraDecision } from '../src/content/day-four-mara';
import { firstEvening } from '../src/content/evening';
import { finalReading } from '../src/content/day-five';
import { leoVisit } from '../src/content/leo';
import { maraVisit } from '../src/content/mara';
import { noraVisit } from '../src/content/nora';
import { thomasVisit } from '../src/content/thomas';
import {
  availableOptions,
  currentNode,
  selectOption,
  startDialogue,
  type DialogueState,
  type DialogueStory,
} from '../src/game/dialogue';

function follow(story: DialogueStory, path: string[], flags: string[] = []) {
  let state: DialogueState = { ...startDialogue(story), flags };
  for (const id of path) state = selectOption(story, state, id);
  return { state, text: currentNode(story, state).text };
}

describe('Production V2: chronology, letter authorship and evidence boundaries', () => {
  it('introduces the found letter to Iris even if her day-two letter topic was skipped', () => {
    const visit = follow(irisDecision, ['welcome'], ['saw_envelope']);
    expect(visit.text).toContain('Ви кладете перед Айріс знайдений конверт');
    expect(visit.text).toContain('Я писала це Лео');
    const fear = selectOption(irisDecision, visit.state, 'iris-letter-ask');
    expect(currentNode(irisDecision, fear).text).toContain('перечитаю');
    expect(currentNode(irisDecision, fear).text).not.toContain('впізнаю почерк');
  });

  it('keeps the letter at the counter until Iris actually authorizes another outcome', () => {
    const visit = follow(
      irisDecision,
      ['welcome', 'letter', 'offer', 'offer-back', 'leave'],
      ['saw_envelope'],
    );
    expect(visit.text).toContain('Конверт залишається за касою');
    expect(visit.state.flags).not.toContain('iris_letter_delivery_consented');
    expect(visit.state.flags).toContain('iris_letter_delivery_offered');
  });

  it('an admission concerns opening the letter, not an invented earlier disclosure', () => {
    const visit = follow(
      irisDecision,
      ['welcome', 'letter', 'admit-opened', 'breach-back'],
      ['saw_envelope', 'opened_private_letter'],
    );
    expect(visit.text).toContain('ти відкрив лист');
    expect(visit.text).not.toContain('Ти вже розповів');
  });

  it.each([
    [
      maraVisit,
      [
        'hello',
        'thank',
        'talk',
        'mara-fantasy-couples',
        'mara-couples-captain',
        'mara-couples-captain-back',
      ],
      'переказуватиму',
      'я переказала',
    ],
    [
      annaVisit,
      ['hello', 'anna-book-disagreement', 'anna-disagreement-debate', 'anna-disagreement-back'],
      'Завтра дам',
      'Емма вже написала',
    ],
    [
      leoVisit,
      ['greet', 'leo-platform-music', 'leo-music-mara', 'leo-music-mara-back'],
      'покликати Мару',
      'Я таки запросив',
    ],
    [
      noraVisit,
      ['hello', 'nora-lost-umbrella', 'nora-umbrella-exhibit', 'nora-umbrella-exhibit-back'],
      'Двоє людей',
      'Прийшли троє',
    ],
  ] as const)(
    'returning within a single visit does not advance offscreen time',
    (story, path, present, future) => {
      const visit = follow(story, [...path]);
      expect(visit.text).toContain(present);
      expect(visit.text).not.toContain(future);
    },
  );

  it('school reading is tomorrow on day two and today when Thomas misses it on day three', () => {
    expect(follow(annaVisit, ['hello']).text).toContain('завтра читання');
    expect(follow(thomasVisit, ['greet', 'thomas-chairs']).text).toContain('сьогоднішнє читання');
    expect(follow(thomasVisit, ['greet', 'anna']).text).toContain('сьогодні було читання');
  });

  it('Leo leaves with his own parcel even when the evidence topic was never selected', () => {
    const visit = follow(leoDecision, ['welcome', 'finish']);
    expect(visit.text).toContain('пакунком');
    expect(visit.text).not.toContain('картку бронювання');
  });

  it('the journal establishes a box number without identifying the pencil mark', () => {
    const visit = follow(
      finalReading,
      ['open', 'ledger-resolution'],
      ['final_chapter_reconstruction_done'],
    );
    expect(visit.text).toContain('У журналі цифри мої');
    expect(visit.text).toContain('чи на аркуші позначено саме цю коробку');
    expect(visit.text).not.toContain('Ці цифри ставила я');
    expect(visit.state.flags).toContain('final_ledger_resolved_17');
  });

  it('a secret breach does not become knowledge held by Iris or Nora', () => {
    const flags = [
      'opened_private_letter',
      'iris_quiet_page_discussed',
      'iris_margin_note_discussed',
    ];
    const visit = follow(finalReading, ['open', 'final-iris-evidence-topic'], flags);
    expect(visit.text).toContain('вона досі не чула від вас');
    expect(availableOptions(finalReading, visit.state).map((o) => o.id)).not.toContain(
      'final-iris-evidence-accountability',
    );
    const audit = currentNode(finalReading, {
      ...startDialogue(finalReading),
      node: 'case-evidence-stars',
      flags,
    }).text;
    expect(audit).not.toContain('Ти вже порушив межу');
    expect(audit).toContain('з його змісту тут нічого не записуєш');
  });

  it('the printed rumor is added after the player starts it, not that morning', () => {
    const visit = follow(
      finalReading,
      ['open', 'rumor-program'],
      ['final_case_closure_complete', 'final_ledger_iris_told', 'final_miller_ledger_rumor_seeded'],
    );
    expect(visit.text).toContain('щойно дописала');
    expect(visit.text).not.toContain('Я надрукувала це зранку');
  });

  it('Mara answers the chosen greeting and remembers the door joke on day four', () => {
    const joke = follow(maraVisit, ['hello', 'joke']);
    const thanks = follow(maraVisit, ['hello', 'thank']);
    expect(joke.text).toContain('клинець');
    expect(thanks.text).toContain('із корицею');
    expect(joke.text).not.toBe(thanks.text);
    const arrival = currentNode(maraDecision, {
      ...startDialogue(maraDecision),
      flags: joke.state.flags,
    });
    expect(arrival.text).toContain('дістає дерев’яний клинець');
    expect(currentNode(maraDecision, startDialogue(maraDecision)).text).not.toContain('клинець');
  });

  it('notes inspected before the reservation do not assume the player has read Leo’s name', () => {
    const note = follow(firstEvening, ['eleanor-notes', 'eleanor-memory']);
    expect(note.text).not.toContain('Лео');
    const ledger = follow(firstEvening, ['eleanor-notes', 'eleanor-history']);
    expect(ledger.text).not.toContain('бронювання Лео');
    const opened = follow(firstEvening, ['letter', 'letter-open', 'opened-conclude']);
    expect(opened.state.flags).toContain('saw_receipt');
    expect(opened.text).toContain('картку');
  });

  it.each(['iris-exhibition-open', 'iris-exhibition-private'])(
    'art cannot reopen the completed exhibition decision: %s',
    (choice) => {
      const visit = follow(irisDecision, [
        'welcome',
        'iris-exhibition-plan',
        choice,
        'iris-exhibition-result-back',
        'art',
      ]);
      const options = availableOptions(irisDecision, visit.state).map((o) => o.id);
      expect(options).not.toContain('art-back');
      expect(options).toContain('art-done-back');
      const returned = selectOption(irisDecision, visit.state, 'art-done-back');
      expect(
        returned.flags.filter((f) =>
          ['iris_exhibition_artist_controls', 'iris_exhibition_private_choice'].includes(f),
        ),
      ).toHaveLength(1);
      expect(availableOptions(irisDecision, returned).map((o) => o.id)).toContain('leave');
    },
  );
});
