import type { DialogueNode, DialogueOption } from '../game/dialogue';

/** A reachable day-five follow-up to Thomas's day-three missed school promise. */
export const schoolReadingFollowupOption: DialogueOption = {
  id: 'school-reading-followup',
  label: 'Запитати Анну й Томаса про шкільне читання',
  next: 'school-reading-followup',
  requires: ['thomas_chairs_discussed'],
  unless: ['final_school_chairs_followup_done'],
};

export const schoolReadingFollowupNodes: readonly DialogueNode[] = [
  {
    id: 'school-reading-followup',
    speaker: 'Анна',
    text: 'Анна показує фотографію класу: діти сидять із книжками просто на килимі. «Читання вдалося. Вони назвали це пікніком». Томас ставить чашку. «А я обіцяв стільці й не прийшов». Анна не відразу відповідає: «Мені довелося тягти їх самій. Хоча б дзвінка я чекала».',
    textWhen: [
      {
        requires: ['thomas_chairs_owned_mistake'],
        text: 'Анна показує фото книжкового пікніка на килимі. «Томас подзвонив того дня, поки був у вас. Сказав, що забув. Я вже сама перенесла стільці». Він киває. «Так і було». Анна гортає до наступного знімка: «Діти впоралися краще за нас».',
      },
      {
        requires: ['thomas_chairs_avoided_conversation'],
        text: 'Анна показує фотографію класу на килимі. «Читання вдалося. А Томас потім заговорив про нові стільці». Вона дивиться на нього. «У нас добрі стільці. Я хотіла знати, чи чекати на тебе». Він опускає чашку, не заперечуючи.',
      },
    ],
    options: [
      {
        id: 'school-chairs-defend',
        label: '«Томас намагався допомогти по-своєму»',
        next: 'school-chairs-anna',
        grants: ['final_school_chairs_defended'],
      },
      {
        id: 'school-chairs-listen',
        label: '«Ти розраховувала на допомогу, а лишилася сама»',
        next: 'school-chairs-anna',
        grants: ['final_school_chairs_listened'],
      },
      {
        id: 'school-chairs-reading',
        label: '«Не вирішуватиму за вас. Що діти читали на пікніку?»',
        next: 'school-chairs-anna',
        grants: ['final_school_chairs_reading'],
      },
    ],
  },
  {
    id: 'school-chairs-anna',
    speaker: 'Анна',
    text: 'Анна прибирає телефон. «Нам іще треба поговорити. Але читання діти вже просять повторити».',
    textWhen: [
      {
        requires: ['final_school_chairs_defended'],
        text: '«Я знаю, що він хотів допомогти». Анна закриває фото. «Але мені не потрібен його адвокат». Томас киває: «Анно, я теж зараз не шукаю виправдання».',
      },
      {
        requires: ['final_school_chairs_listened'],
        text: '«Саме так. Дякую, що почув». Анна кладе телефон на стіл. «Я не прошу сваритися з ним замість мене». Томас дивиться на знімок. «Мені теж треба це запам’ятати».',
      },
      {
        requires: ['final_school_chairs_reading'],
        text: '«Про острів. Джуліан переніс маяк на інший берег, а Емма сказала, що так нечесно». Анна сміється. «Поки вони сперечалися, Макс намалював дракона й забрав усіх героїв літати». Томас придивляється до фото: «Схоже, стільці їм справді заважали».',
      },
    ],
    options: [
      {
        id: 'school-chairs-thomas',
        label: '«Томасе, ви знайшли час поговорити?»',
        next: 'school-chairs-thomas',
        grants: ['anna_thomas_chairs_followup_discussed'],
      },
      {
        id: 'school-chairs-finish',
        label: 'Залишити їх біля книжкової полиці',
        next: 'gathering',
        grants: ['anna_thomas_chairs_followup_discussed', 'final_school_chairs_followup_done'],
      },
    ],
  },
  {
    id: 'school-chairs-thomas',
    speaker: 'Томас',
    text: '«Ще ні. Я весь час збираюся прийти з готовим рішенням. А потім знаходиться робота». Анна піднімає брову. «Можна прийти без рішення. Але треба прийти». Він посміхається: «Це я зрозумів».',
    options: [
      {
        id: 'school-chairs-plan',
        label: '«Може, домовитеся про час, поки обоє тут?»',
        next: 'school-chairs-outcome',
        grants: ['final_school_chairs_time_agreed'],
      },
      {
        id: 'school-chairs-space',
        label: '«Далі ви самі. Я повернуся до каси»',
        next: 'school-chairs-outcome',
        grants: ['final_school_chairs_space_kept'],
      },
    ],
  },
  {
    id: 'school-chairs-outcome',
    speaker: 'Оповідач',
    text: 'Анна й Томас залишаються поруч із полицею. Ви повертаєтеся до каси.',
    textWhen: [
      {
        requires: ['final_school_chairs_time_agreed'],
        text: '«Після читання? Вдома, за чаєм», — питає Томас. Анна трохи думає. «Добре. Тільки без дзвінків по роботі». Він дістає телефон і вимикає звук. Вони ще не помирилися, але цього разу домовленість чули обоє.',
      },
      {
        requires: ['final_school_chairs_space_kept'],
        text: '«Дякую», — каже Анна. Томас показує їй іншу книжку, і вона відкриває першу сторінку. Ви відходите. Розмову про стільці вони продовжать, якщо захочуть.',
      },
    ],
    options: [
      {
        id: 'school-chairs-outcome-back',
        label: 'Повернутися до вечора історій',
        next: 'gathering',
        grants: ['final_school_chairs_followup_done'],
      },
    ],
  },
];
