import type { DialogueStory } from '../../game/dialogue';

/**
 * Optional Day 2 conversation. Deliberately separate from the chapter stage
 * machine until the existing character-presence and save systems are mapped.
 *
 * No book purchase, relationship mutation or mystery evidence.
 */
export const oliverUnreadBook: DialogueStory = {
  start: 'oliver-unread-opening',
  nodes: [
    {
      id: 'oliver-unread-opening',
      speaker: 'Олівер',
      text: 'У мене є пропозиція, яка може зіпсувати нам обом репутацію. Давай посперечаємося про книжку, якої жоден із нас не читав.',
      options: [
        { id: 'oliver-unread-play', label: 'Назви книжку.', next: 'oliver-unread-game' },
        {
          id: 'oliver-unread-joke',
          label: 'Це звучить жахливо.',
          next: 'oliver-unread-joke-reply',
        },
        { id: 'oliver-unread-decline', label: 'Сьогодні не можу.', next: 'oliver-unread-bye' },
      ],
    },
    {
      id: 'oliver-unread-joke-reply',
      speaker: 'Олівер',
      text: 'Дякую. Я довго працював над концепцією.',
      options: [
        {
          id: 'oliver-unread-joke-continue',
          label: 'То про що книжка?',
          next: 'oliver-unread-game',
        },
      ],
    },
    {
      id: 'oliver-unread-game',
      speaker: 'Олівер',
      text: 'Судячи з обкладинки, це історія про людину, яка не вміє паркувати човен. Твоя версія?',
      options: [
        {
          id: 'oliver-unread-sun',
          label: 'Маяк ревнує до сонця.',
          next: 'oliver-unread-sun-reply',
        },
        {
          id: 'oliver-unread-mail',
          label: 'Море вкрало всі листи.',
          next: 'oliver-unread-mail-reply',
        },
        {
          id: 'oliver-unread-accountant',
          label: 'Бухгалтер боїться води.',
          next: 'oliver-unread-accountant-reply',
        },
      ],
    },
    {
      id: 'oliver-unread-sun-reply',
      speaker: 'Олівер',
      text: 'Смілива інтерпретація. Мені вже шкода сонце.',
      options: [
        {
          id: 'oliver-unread-sun-finish',
          label: 'Це наш остаточний висновок.',
          next: 'oliver-unread-end',
        },
      ],
    },
    {
      id: 'oliver-unread-mail-reply',
      speaker: 'Олівер',
      text: 'Ага, і пошта нарешті знайшла винного.',
      options: [
        {
          id: 'oliver-unread-mail-finish',
          label: 'На цьому зійдемося.',
          next: 'oliver-unread-end',
        },
      ],
    },
    {
      id: 'oliver-unread-accountant-reply',
      speaker: 'Олівер',
      text: 'Це найкраща книжка, яку я не читав.',
      options: [
        {
          id: 'oliver-unread-accountant-finish',
          label: 'Нехай так і буде.',
          next: 'oliver-unread-end',
        },
      ],
    },
    {
      id: 'oliver-unread-bye',
      speaker: 'Олівер',
      text: 'Тоді я програю сам собі. Це вже традиція.',
      options: [],
    },
    {
      id: 'oliver-unread-end',
      speaker: 'Олівер',
      text: 'Якщо ми колись прочитаємо цю книжку, наші теорії доведеться перевірити. Але сьогодні я готовий програти літературі.',
      options: [],
    },
  ],
};
