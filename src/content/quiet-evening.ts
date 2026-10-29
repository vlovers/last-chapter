import type { DialogueStory } from '../game/dialogue';

export const quietEvening: DialogueStory = {
  start: 'closing',
  nodes: [
    {
      id: 'closing',
      speaker: 'Оповідач',
      text: 'Останній відвідувач виходить, і дзвіночок над дверима стихає. Стільці для книжкового клубу залишилися складеними. Френк стрибає на підвіконня, де дощ малює тонкі доріжки на склі.',
      textWhen: [
        {
          requires: [
            'book_club_started',
            'club_bad_romance_debated',
            'club_recommended_easy_reading',
          ],
          text: 'Гості книжкового клубу розходяться, усе ще сперечаючись про невдалий роман і книжки для тих, хто давно не читав. Міллер забирає останню булочку «для дороги», Анна залишає список дитячих коміксів, а Мара просить не судити її випічку за рецептами з художньої літератури. Френк уже спить на складеному стільці.',
        },
        {
          requires: ['book_club_started', 'club_bad_romance_debated'],
          text: 'Міллер виходить останньою. «Я все одно вважаю, що герой мав право втекти з весілля». Мара з порога відповідає: «Чотири рази?» — «Особливо четвертий!» Дзвіночок стихає. Френк обнюхує порожню тарілку й стрибає на підвіконня.',
        },
        {
          requires: ['book_club_started', 'club_recommended_easy_reading'],
          text: 'Анна залишає на прилавку список коротких книжок для нових читачів. Мара дописує внизу: «І щось про пекарню, але без рецептів». Гості розходяться, а Френк сідає просто на список. За вікном починається дощ.',
        },
        {
          requires: ['book_club_started', 'club_argued_about_characters'],
          text: 'Після книжкового клубу на столі лишається записка Анни: «Можна любити книжку й сперечатися з героєм». Міллер приписала збоку: «Особливо якщо герой — злодій». Френк намагається зім’яти записку лапою, поки ти складаєш стільці.',
        },
        {
          requires: ['book_club_started'],
          text: 'Останні гості книжкового клубу нарешті розходяться. На столі залишилися крихти від Мариних булочок, чашки й список наступних читань. Френк розлігся на одному зі стільців. За вікном дощ, а попереду ще кілька хвилин тиші, перш ніж замкнути книгарню.',
        },
      ],
      options: [
        { id: 'sit-frank', label: 'Посидіти поруч із Френком', next: 'frank' },
        {
          id: 'listen-rain',
          label: 'Перевірити, хто залишив світло у вікні навпроти',
          next: 'window',
        },
        { id: 'tidy-books', label: 'Розібрати книжки на столі', next: 'manuscript' },
        {
          id: 'closing-club-followups',
          label: 'Переглянути записки, які гості залишили після розмов',
          next: 'closing-club-followups',
          requires: ['book_club_started'],
          unless: ['club_followups_evening_done'],
        },
        {
          id: 'closing-book-club-cleanup',
          label: 'Розібрати записки й чашки після книжкового клубу',
          next: 'closing-book-club-cleanup',
          requires: ['book_club_started'],
          unless: [
            'club_bookmarks_saved',
            'club_reading_list_joke_seen',
            'club_frank_cleaning_attempt',
          ],
        },
      ],
    },
    {
      id: 'closing-book-club-cleanup',
      speaker: 'Оповідач',
      text: 'Під порожніми чашками знайшлися три закладки, одна серветка з намальованим драконом і список книжок, у якому хтось дописав: «Не брати нічого, де всі помирають». Френк обнюхує крихти, але до роботи не долучається.',
      options: [
        {
          id: 'closing-cleanup-bookmarks',
          label: 'Розкласти забуті закладки біля каси',
          next: 'closing-cleanup-bookmarks',
        },
        {
          id: 'closing-cleanup-note',
          label: 'Прочитати, що ще написали на списку',
          next: 'closing-cleanup-note',
        },
        {
          id: 'closing-cleanup-frank',
          label: 'Попросити Френка допомогти з прибиранням',
          next: 'closing-cleanup-frank',
        },
      ],
    },
    {
      id: 'closing-cleanup-bookmarks',
      speaker: 'Оповідач',
      text: 'На першій закладці — намальована чайка, на другій — адреса кав’ярні, на третій — слова «повернути Анні». Ти кладеш усі три біля каси й залишаєш коротку записку для гостей. Френк одразу сідає на неї.',
      options: [
        {
          id: 'closing-cleanup-bookmarks-back',
          label: 'Повернутися до вечірніх справ',
          next: 'closing',
          grants: ['club_bookmarks_saved'],
        },
      ],
    },
    {
      id: 'closing-cleanup-note',
      speaker: 'Оповідач',
      text: 'Під списком хтось дрібним почерком дописав: «Але якщо помирає лише дворецький, можна». Нижче Мара відповіла: «Тоді хай хоч перед тим поїсть». Анна намалювала поруч маленьку булочку. У Беллвіку навіть списки читання перетворюються на розмову.',
      options: [
        {
          id: 'closing-cleanup-note-back',
          label: 'Залишити список на завтра',
          next: 'closing',
          grants: ['club_reading_list_joke_seen'],
        },
      ],
    },
    {
      id: 'closing-cleanup-frank',
      speaker: 'Оповідач',
      text: 'Френк піднімає голову, повільно підходить до стосу серветок і скидає одну на підлогу. Після цього повертається на стілець. «Дякую, колего», — кажеш ти. Кіт навіть не озирається.',
      options: [
        {
          id: 'closing-cleanup-frank-back',
          label: 'Самостійно завершити прибирання',
          next: 'closing',
          grants: ['club_frank_cleaning_attempt'],
        },
      ],
    },
    {
      id: 'frank',
      speaker: 'Оповідач',
      text: 'Френк торкається лапою твоєї руки, ніби перевіряє, чи ти справді залишаєшся. Потім вмощується поряд. Тут нарешті можна нікуди не поспішати.',
      options: [
        { id: 'frank-books', label: 'Повернутися до книжок', next: 'manuscript' },
        {
          id: 'closing-leftovers',
          label: 'Знайти, хто забув на столі книжку',
          next: 'closing-leftovers',
        },
        { id: 'frank-toy', label: 'Дістати Френкову іграшку з-під прилавка', next: 'frank-toy' },
        {
          id: 'frank-treat',
          label: 'Перевірити, чому Френк сидить біля шафки',
          next: 'frank-treat',
        },
      ],
    },
    {
      id: 'frank-toy',
      speaker: 'Оповідач',
      text: 'Під прилавком знаходиться пошарпана мишка на мотузці. Френк удає, що її не бачить. Щойно ти повертаєшся до столу, він кидається з-за коробки, промахується й ображено дивиться на мишку. Доводиться повторити виставу.',
      options: [
        {
          id: 'frank-toy-play',
          label: 'Пограти ще хвилину, поки Френк не переможе',
          next: 'frank-toy-win',
        },
        {
          id: 'frank-toy-books',
          label: 'Залишити мишку біля коробки й повернутися до книжок',
          next: 'manuscript',
          grants: ['quiet_evening_frank_played'],
        },
      ],
    },
    {
      id: 'frank-toy-win',
      speaker: 'Оповідач',
      text: 'Нарешті Френк ловить мишку, притискає її лапами й переможно нявкає. За хвилину він забуває про здобич і сідає на відкритий роман. У книгарні знову тихо — якщо не рахувати муркотіння.',
      options: [
        {
          id: 'frank-toy-win-books',
          label: 'Обережно забрати роман і продовжити прибирання',
          next: 'manuscript',
          grants: ['quiet_evening_frank_played'],
        },
      ],
    },
    {
      id: 'frank-treat',
      speaker: 'Оповідач',
      text: 'Френк сидить перед шафкою з кормом так нерухомо, ніби охороняє важливі документи. Коли ти відкриваєш дверцята, він підводиться й тихо нявкає. Миска вже повна. Схоже, справа не в голоді, а в бажанні отримати щось цікавіше.',
      options: [
        {
          id: 'frank-treat-pet',
          label: 'Почухати Френка за вухом замість додаткової порції',
          next: 'frank-treat-pet',
        },
        {
          id: 'frank-treat-books',
          label: 'Закрити шафку й повернутися до столу',
          next: 'manuscript',
        },
      ],
    },
    {
      id: 'frank-treat-pet',
      speaker: 'Оповідач',
      text: 'Френк спочатку дивиться на тебе з докором, але за кілька секунд підставляє голову під долоню. Потім сам веде тебе до стосу книжок, які давно час розкласти. Можливо, він просто перевіряв, чи ти ще тут.',
      options: [
        {
          id: 'frank-treat-pet-books',
          label: 'Піти за Френком до столу',
          next: 'manuscript',
          grants: ['quiet_evening_frank_company'],
        },
      ],
    },
    {
      id: 'closing-leftovers',
      speaker: 'Оповідач',
      text: 'На столі лежить роман із закладкою з кав’ярні Мари. Усередині олівцем написано: «Поверну в четвер. Якщо забуду — нагадати про корицю». Підпису немає. Френк намагається витягти закладку зубами.',
      options: [
        {
          id: 'closing-leftovers-save',
          label: 'Покласти книжку на полицю забутих речей',
          next: 'closing-leftovers-save',
        },
        {
          id: 'closing-leftovers-note',
          label: 'Залишити Марі записку про знайдену книжку',
          next: 'closing-leftovers-note',
        },
      ],
    },
    {
      id: 'closing-leftovers-save',
      speaker: 'Оповідач',
      text: 'Книжка стає поруч із загубленою рукавичкою й порожнім футляром для окулярів. Тут є місце для чужих речей, поки їх не згадають. Ти повертаєшся до стосу романів на столі.',
      options: [
        {
          id: 'closing-leftovers-save-books',
          label: 'Продовжити прибирати книжки',
          next: 'manuscript',
          grants: ['quiet_evening_lost_book_shelved'],
        },
      ],
    },
    {
      id: 'closing-leftovers-note',
      speaker: 'Оповідач',
      text: 'На маленькому аркуші ти пишеш: «Маро, хтось залишив роман і згадував корицю». Френк сідає просто на записку. Доводиться переписати її ще раз і приклеїти вище, ніж дістають котячі лапи.',
      options: [
        {
          id: 'closing-leftovers-note-books',
          label: 'Повернутися до столу',
          next: 'manuscript',
          grants: ['quiet_evening_mara_lost_book_note'],
        },
      ],
    },
    {
      id: 'window',
      speaker: 'Оповідач',
      text: 'Навпроти книгарні світиться вікно старої майстерні. На склі хтось залишив паперову зірку. Учора її точно не було. Френк зістрибує з підвіконня і веде тебе до столу зі старими книжками.',
      options: [
        {
          id: 'window-watch',
          label: 'Запам’ятати паперову зірку',
          next: 'window-memory',
          grants: ['quiet_evening_paper_star_seen'],
        },
        {
          id: 'window-ignore',
          label: 'Не розглядати вікно й повернутися до книжок',
          next: 'manuscript',
        },
      ],
    },
    {
      id: 'window-memory',
      speaker: 'Оповідач',
      text: 'Зірка вирізана з газетного паперу: видно темні смужки друку, але слів із книгарні не розібрати. Коли ти підходиш ближче до свого вікна, світло в майстерні гасне. Можливо, там просто закінчили роботу. Але хто прикріпив зірку ззовні скла?',
      options: [
        {
          id: 'window-note',
          label: 'Записати деталь у нотатник і повернутися до столу',
          next: 'manuscript',
          grants: ['quiet_evening_window_clue_recorded'],
        },
        { id: 'window-leave', label: 'Закрити нотатник і розібратися завтра', next: 'manuscript' },
      ],
    },
    {
      id: 'manuscript',
      speaker: 'Оповідач',
      text: 'Між двома старими романами лежить тонкий аркуш без обкладинки. На полях — маленькі зірочки біля виправлених речень. У тексті згадується вікно, яке хтось навмисно залишив незачиненим.',
      options: [
        {
          id: 'keep-page',
          label: 'Покласти аркуш до нотатника',
          next: 'end',
          grants: ['quiet_evening_page_found'],
        },
        { id: 'leave-page', label: 'Залишити аркуш на місці', next: 'end' },
        { id: 'read-margin', label: 'Роздивитися запис на звороті', next: 'margin' },
      ],
    },
    {
      id: 'margin',
      speaker: 'Оповідач',
      text: 'На звороті олівцем написано: «Не віддавай їм останню сторінку». Нижче — маленька пляма від кави й число 17 без місяця та року. Це схоже на поспішну записку, але ти не знаєш, кому вона адресована.',
      options: [
        {
          id: 'margin-keep',
          label: 'Зберегти сторінку разом із записом',
          next: 'end',
          grants: ['quiet_evening_page_found', 'quiet_evening_margin_warning_seen'],
        },
        {
          id: 'margin-leave',
          label: 'Повернути сторінку між книжками',
          next: 'end',
          grants: ['quiet_evening_margin_warning_seen'],
        },
      ],
    },
    {
      id: 'closing-club-followups',
      speaker: 'Оповідач',
      text: 'На столі лежать чужі нотатки, загублена закладка й порожній пакет із-під булочок. Ти збираєш усе докупи. На звороті програми книжкового клубу хтось написав: «Наступного разу не забути сказати те, що не наважився сьогодні».',
      options: [
        { id: 'closing-followups-nora', label: 'Залишити Норі чисту закладку', next: 'closing-followups-nora', requires: ['club_nora_trust_deepened'] },
        { id: 'closing-followups-leo', label: 'Приготувати два місця біля вікна', next: 'closing-followups-leo', requires: ['club_mara_leo_concert_supported'] },
        { id: 'closing-followups-anna', label: 'Знайти коробку для шкільних декорацій', next: 'closing-followups-anna', requires: ['club_school_play_sequel_invited'] },
        { id: 'closing-followups-everyone', label: 'Залишити записку для наступного клубу', next: 'closing-followups-everyone' },
      ],
    },
    {
      id: 'closing-followups-nora',
      speaker: 'Оповідач',
      text: 'Ти кладеш між сторінками чисту закладку й підписуєш лише ім’я Нори. Без запитань і натяків. Френк обнюхує папір і йде далі: цього разу йому нічого скидати зі столу.',
      options: [{ id: 'closing-followups-nora-back', label: 'Повернутися до вечірніх справ', next: 'closing', grants: ['club_followups_evening_done', 'club_nora_bookmark_left'] }],
    },
    {
      id: 'closing-followups-leo',
      speaker: 'Оповідач',
      text: 'Ти ставиш два стільці біля вікна, де зазвичай сидить Френк. Кіт негайно займає один. Доведеться пояснити Лео й Марі, що на їхньому побаченні буде третій гість.',
      options: [{ id: 'closing-followups-leo-back', label: 'Залишити Френку його місце', next: 'closing', grants: ['club_followups_evening_done', 'club_mara_leo_window_seats_ready'] }],
    },
    {
      id: 'closing-followups-anna',
      speaker: 'Оповідач',
      text: 'Під прилавком знаходиться велика коробка. На ній ти пишеш: «Для дракона, який був деревом». Френк пробує залізти всередину ще до того, як ти встигаєш покласти туди кольоровий папір.',
      options: [{ id: 'closing-followups-anna-back', label: 'Закрити коробку, залишивши щілину для Френка', next: 'closing', grants: ['club_followups_evening_done', 'club_anna_stage_box_prepared'] }],
    },
    {
      id: 'closing-followups-everyone',
      speaker: 'Оповідач',
      text: 'Ти пишеш на дошці: «Наступна зустріч — наступного четверга. Можна прийти без прочитаної книжки». Підписувати не доводиться. Усі й так знають, чия це книгарня.',
      options: [{ id: 'closing-followups-everyone-back', label: 'Вимкнути лампу над дошкою', next: 'closing', grants: ['club_followups_evening_done', 'club_next_meeting_posted'] }],
    },
    {
      id: 'end',
      speaker: 'Оповідач',
      text: 'Ти вимикаєш світло над прилавком. Френк сонно кліпає, перш ніж піти за тобою. Цей вечір виявився тихішим, ніж ти планував, але зовсім не порожнім.',
      options: [],
    },
  ],
};
