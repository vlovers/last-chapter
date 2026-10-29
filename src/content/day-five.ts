import type { DialogueStory } from '../game/dialogue';
import { rumorProgramNodes, rumorProgramOption } from './rumor-program';
import { lastCopyNodes, lastCopyOption } from './last-copy';
import { afterCaseTeaNodes, afterCaseTeaOption } from './after-case-tea';
import { bookshopTomorrowNodes, bookshopTomorrowOption } from './bookshop-tomorrow';
import { caseClosureNodes, caseClosureOption } from './case-closure';
import { workshopPhotoNodes, workshopPhotoOption } from './workshop-photo';

/** Фінальний день першого сезону. Рішення людей важливіші за чужу цікавість. */
export const finalReading: DialogueStory = {
  start: 'morning',
  nodes: [
    {
      id: 'morning',
      speaker: 'Оповідач',
      text: 'П’ятий день починається запахом кориці. Мара приносить випічку, Анна — закладки, пані Міллер — власноруч написані запрошення. На дверях книгарні з’являється напис: «Вечір історій. Кожен може просто слухати».',
      options: [{ id: 'open', label: 'Відчинити двері для гостей', next: 'gathering' }],
    },
    {
      id: 'gathering',
      speaker: 'Елеонора',
      text: '«Пані Міллер уже встигла посваритися з Норою через фінал детективу, а Френк вкрав закладку. Якщо так піде далі, нам знадобиться ще один стіл». Вона усміхається, помітивши Міллер із трьома закладками.',
      textWhen: [
        {
          requires: ['final_repaired_rumor', 'final_iris_exhibition'],
          text: 'Пані Міллер зупиняється біля малюнків Айріс. «Я тоді наговорила про Томаса зайвого», — каже вона Норі. Айріс тим часом поправляє підпис під картиною, а Елеонора шукає другу кнопку для рамки.',
        },
        {
          requires: ['final_respected_privacy', 'final_supported_iris'],
          text: 'Пані Міллер довго роздивляється малюнки Айріс, але замість розпитувань питає, чи можна поставити біля них лампу. Айріс киває. Елеонора приносить подовжувач.',
        },
        {
          requires: ['final_repaired_rumor'],
          text: '«Пані Міллер сьогодні вибачилася перед Томасом, — шепоче Елеонора. — А він запропонував їй печиво». Біля столу вже сперечаються, який детектив читати наступним.',
        },
        {
          requires: ['final_respected_privacy'],
          text: 'Пані Міллер починає розповідати чергову чутку, але раптом замовкає. «А ви що читаєте?» — питає вона гостя. Елеонора здивовано піднімає брови.',
        },
        {
          requires: ['final_iris_exhibition'],
          text: 'Елеонора розглядає малюнки Айріс на стіні. «Вікна Беллвіка», — читає вона вголос. «Гарна назва. Тільки третій малюнок трохи нахилений». Айріс простягає їй рівень.',
        },
        {
          requires: ['final_anna_club_heard'],
          text: 'Анна розкладає дитячі закладки. На одній намальований дракон, на іншій — кіт у короні. Елеонора піднімає другу. «Це ж Френк?» Анна киває: «Діти сказали, що він тут головний».',
        },
      ],
      options: [
        {
          id: 'final-iris-eleanor-option',
          label: 'Подивитися, як Айріс та Елеонора облаштовують виставку',
          next: 'final-iris-eleanor',
          requires: ['iris_art_boundaries_discussed', 'eleanor_change_discussed'],
          unless: ['final_iris_eleanor_heard'],
        },
        {
          id: 'final-couple-anna-thomas-option',
          label: 'Побачити, як Анна й Томас обирають книжку',
          next: 'final-couple-anna-thomas',
          requires: ['anna_uncertainty_discussed', 'thomas_listening_discussed'],
          unless: ['final_anna_thomas_heard'],
        },
        {
          id: 'final-couple-conversation-option',
          label: 'Почути розмову Мари й Лео біля вікна',
          next: 'final-couple-conversation',
          requires: ['mara_own_morning_heard', 'leo_honesty_discussed'],
          unless: ['final_couple_conversation_heard'],
        },
        {
          id: 'final-v3-mara-option',
          label: '«Як минув ранок, який ти хотіла залишити собі?»',
          next: 'final-v3-mara',
          requires: ['mara_own_morning_heard'],
          unless: ['final_v3_mara_heard'],
        },
        {
          id: 'final-v3-leo-option',
          label: '«Ви з Марою нарешті домовилися про вихідні?»',
          next: 'final-v3-leo',
          requires: ['leo_honesty_discussed'],
          unless: ['final_v3_leo_heard'],
        },
        {
          id: 'final-v3-iris-option',
          label: '«Які малюнки ти все-таки повісила?»',
          next: 'final-v3-iris',
          requires: ['iris_art_boundaries_discussed'],
          unless: ['final_v3_iris_heard'],
        },
        {
          id: 'final-v3-anna-option',
          label: '«Як минула суперечка дітей про книжку?»',
          next: 'final-v3-anna',
          requires: ['anna_uncertainty_discussed'],
          unless: ['final_v3_anna_heard'],
        },
        {
          id: 'final-v3-thomas-option',
          label: '«Ти вже повернув Анні її книжку?»',
          next: 'final-v3-thomas',
          requires: ['thomas_listening_discussed'],
          unless: ['final_v3_thomas_heard'],
        },
        {
          id: 'final-v3-nora-option',
          label: '«Що ти вирішила залишити в архіві?»',
          next: 'final-v3-nora',
          requires: ['nora_archive_ethics_discussed'],
          unless: ['final_v3_nora_heard'],
        },
        {
          id: 'final-v3-eleanor-option',
          label: '«Ти звикла до нового місця столу?»',
          next: 'final-v3-eleanor',
          requires: ['eleanor_change_discussed'],
          unless: ['final_v3_eleanor_heard'],
        },
        {
          id: 'anna-classroom-callback',
          label: 'Дізнатися, чим закінчилася суперечка дітей про книжку',
          next: 'anna-classroom-callback',
          requires: ['anna_book_disagreement_discussed'],
          unless: ['final_anna_classroom_heard'],
        },
        {
          id: 'thomas-book-callback',
          label: 'Запитати Томаса про роман із човном',
          next: 'thomas-book-callback',
          requires: ['thomas_reading_challenge_discussed'],
          unless: ['final_thomas_book_heard'],
        },
        {
          id: 'anna',
          label: 'Послухати Анну про шкільний книжковий клуб',
          next: 'anna',
          unless: ['final_anna_club_heard'],
        },
        {
          id: 'rumor-player-accountability',
          label: 'Поговорити з Анною й Томасом про власні слова',
          next: 'rumor-player-accountability',
          requires: ['rumor_amplified'],
          unless: ['final_player_rumor_accountability'],
        },
        {
          id: 'rumor-miller-followup',
          label: 'Послухати, що пані Міллер скаже без сторонніх',
          next: 'rumor-miller-followup',
          requires: ['rumor_heard'],
          unless: ['final_miller_private_followup'],
        },
        {
          id: 'rumor',
          label: 'Запитати пані Міллер, чи поговорила вона з Томасом',
          next: 'rumor',
          unless: ['final_respected_privacy', 'final_repaired_rumor'],
        },
        {
          id: 'iris',
          label: 'Запитати Айріс про її малюнки',
          next: 'iris',
          unless: ['final_supported_iris', 'final_iris_exhibition'],
        },
        {
          id: 'letter',
          label: 'Повернутися до питання старого листа',
          next: 'letter',
          requires: ['saw_envelope'],
          unless: [
            'final_mutual_conversation',
            'final_accepted_consequences',
            'final_letter_kept_private',
          ],
        },
        {
          id: 'mara-callback',
          label: 'Згадати розмову з Марою',
          next: 'mara-callback',
          requires: ['mara_day_four_reflected'],
          unless: ['final_mara_heard'],
        },
        {
          id: 'eleanor-memory',
          label: 'Подякувати Елеонорі за історію книгарні',
          next: 'eleanor-memory',
          requires: ['eleanor_shared_shop_memory'],
          unless: ['final_eleanor_heard'],
        },
        {
          id: 'leo-memory',
          label: 'Поговорити з Лео про життя без розкладу',
          next: 'leo-memory',
          requires: ['leo_shared_future_plan'],
          unless: ['final_leo_heard'],
        },
        {
          id: 'miller-memory',
          label: 'Поговорити з пані Міллер про припущення',
          next: 'miller-memory',
          requires: ['miller_observation_distinguished'],
          unless: ['final_miller_heard'],
        },
        {
          id: 'leo-reflection-callback',
          label: 'Запитати Лео, чи навчився він залишати людям вибір',
          next: 'leo-reflection-callback',
          requires: ['leo_reflected_on_uncertainty'],
          unless: ['final_leo_reflection_heard'],
        },
        {
          id: 'iris-reflection-callback',
          label: 'Побачити, що Айріс вирішила показати на виставці',
          next: 'iris-reflection-callback',
          requires: ['iris_reflected_on_identity'],
          unless: ['final_iris_reflection_heard'],
        },
        {
          id: 'anna-reflection-callback',
          label: 'Дізнатися, як змінилися уроки Анни',
          next: 'anna-reflection-callback',
          requires: ['anna_reflected_on_care'],
          unless: ['final_anna_reflection_heard'],
        },
        {
          id: 'thomas-reflection-callback',
          label: 'Запитати Томаса, як минула відверта розмова',
          next: 'thomas-reflection-callback',
          requires: ['thomas_reflected_on_responsibility'],
          unless: ['final_thomas_reflection_heard'],
        },
        {
          id: 'nora-reflection-callback',
          label: 'Поговорити з Норою про межі архіву',
          next: 'nora-reflection-callback',
          requires: ['nora_reflected_on_uncertainty'],
          unless: ['final_nora_reflection_heard'],
        },
        {
          id: 'eleanor-reflection-callback',
          label: 'Дізнатися, що Елеонора вирішила змінити в книгарні',
          next: 'eleanor-reflection-callback',
          requires: ['eleanor_reflected_on_legacy'],
          unless: ['final_eleanor_reflection_heard'],
        },
        {
          id: 'chapter-evidence',
          label: 'Розглянути з Норою два уривки й запис у нотатнику',
          next: 'chapter-evidence',
          requires: ['final_missing_chapter_discussed'],
          unless: ['final_chapter_evidence_reviewed'],
        },
        {
          id: 'miller-rumor-aftermath',
          label: 'Поговорити з Айріс після чутки про фінал роману',
          next: 'miller-rumor-aftermath',
          requires: ['final_miller_ledger_rumor_seeded', 'final_miller_ledger_conversation_done'],
          unless: ['final_miller_rumor_aftermath_done'],
        },
        {
          id: 'miller-ledger-gossip',
          label: 'Поговорити з пані Міллер, яка помітила старий журнал',
          next: 'miller-ledger-gossip',
          requires: ['final_ledger_scene_complete', 'final_ledger_iris_told'],
          unless: ['final_miller_ledger_conversation_done'],
        },
        bookshopTomorrowOption,
        workshopPhotoOption,
        caseClosureOption,
        rumorProgramOption,
        afterCaseTeaOption,
        lastCopyOption,
        {
          id: 'archive-handover',
          label: 'Вирішити, як зберігати записи про коробку сімнадцять',
          next: 'archive-handover',
          requires: ['final_ledger_scene_complete', 'final_manuscript_provenance_decided'],
          unless: ['final_archive_handover_complete'],
        },
        {
          id: 'ledger-aftercare',
          label: 'Залишитися після розмови про коробку сімнадцять',
          next: 'ledger-aftercare',
          requires: ['final_ledger_scene_complete'],
          unless: ['final_ledger_aftercare_complete'],
        },
        {
          id: 'ledger-resolution',
          label: 'Зіставити число сімнадцять зі старим журналом Елеонори',
          next: 'ledger-resolution',
          requires: ['final_chapter_reconstruction_done'],
          unless: ['final_ledger_scene_complete'],
          grants: ['final_ledger_resolved_17'],
        },
        {
          id: 'chapter-reconstruction',
          label: 'Спробувати відновити порядок зниклих сторінок',
          next: 'chapter-reconstruction',
          requires: ['final_chapter_evidence_reviewed', 'final_workshop_evidence_reviewed'],
          unless: ['final_chapter_reconstruction_done'],
        },
        {
          id: 'manuscript-provenance',
          label: 'Запитати Айріс, кому тепер належать знайдені сторінки',
          next: 'manuscript-provenance',
          requires: ['final_workshop_evidence_reviewed'],
          unless: ['final_manuscript_provenance_decided'],
        },
        {
          id: 'workshop-evidence',
          label: 'Зіставити з Айріс фотографію майстерні та рукопис',
          next: 'workshop-evidence',
          requires: ['final_margin_followup_heard', 'final_missing_chapter_discussed'],
          unless: ['final_workshop_evidence_reviewed'],
        },
        {
          id: 'chapter-argument',
          label: 'Послухати суперечку Мари й Айріс про фінал рукопису',
          next: 'chapter-argument',
          requires: ['final_missing_chapter_discussed'],
          unless: ['final_chapter_argument_heard'],
        },
        {
          id: 'missing-chapter-choice',
          label: 'Попросити Айріс прочитати уривок із незакінченого рукопису',
          next: 'missing-chapter-choice',
          requires: ['iris_margin_note_discussed', 'iris_quiet_page_discussed'],
          unless: ['final_missing_chapter_discussed'],
        },
        {
          id: 'margin-followup',
          label: 'Повернутися з Айріс до загадкового числа на аркуші',
          next: 'margin-followup',
          requires: ['iris_margin_note_discussed'],
          unless: ['final_margin_followup_heard'],
        },
        {
          id: 'workshop-followup',
          label: 'Запитати Айріс, чи дізналася вона щось про стару майстерню',
          next: 'workshop-followup',
          requires: ['iris_paper_star_discussed'],
          unless: ['final_workshop_followup_heard'],
        },
        {
          id: 'quiet-manuscript-followup',
          label: 'Поговорити з Айріс про знайдену сторінку',
          next: 'quiet-manuscript-followup',
          requires: ['iris_quiet_page_discussed'],
          unless: ['final_quiet_manuscript_followup'],
        },
        {
          id: 'frank-evening',
          label: 'Побути з Френком біля вікна',
          next: 'frank-evening',
          unless: ['final_frank_evening_heard'],
        },
        {
          id: 'bookseller-reflection',
          label: 'Записати, чого навчила книгарня за ці п’ять днів',
          next: 'bookseller-reflection',
          unless: ['final_bookseller_reflection_heard'],
        },
        {
          id: 'day-four-iris-callback',
          label: 'Поговорити з Айріс про право обирати, де бути вдома',
          next: 'day-four-iris-callback',
          requires: ['iris_day_four_boundary_heard'],
          unless: ['final_day_four_iris_heard'],
        },
        {
          id: 'day-four-mara-callback',
          label: 'Запитати Мару про її власні плани',
          next: 'day-four-mara-callback',
          requires: ['mara_day_four_own_story_heard'],
          unless: ['final_day_four_mara_heard'],
        },
        {
          id: 'day-four-leo-callback',
          label: 'Повернутися до розмови з Лео про минуле',
          next: 'day-four-leo-callback',
          requires: ['leo_day_four_future_heard'],
          unless: ['final_day_four_leo_heard'],
        },
        {
          id: 'shared-table',
          label: 'Запросити гостей поговорити про те, кому належать історії',
          next: 'shared-table',
          unless: ['final_shared_table_heard'],
        },
        { id: 'close', label: 'Завершити вечір спільним читанням', next: 'end' },
      ],
    },
    {
      id: 'chapter-evidence',
      speaker: 'Нора',
      text: '«В обох уривках згадане те саме вікно, але чорнило різне». Нора кладе поруч свій блокнот. «І це ще не означає, що їх написали в різні роки. У мене теж три ручки в сумці».',
      options: [
        {
          id: 'chapter-evidence-order',
          label: '«А якщо це дві послідовні сцени?»',
          next: 'chapter-evidence-order',
          grants: ['final_chapter_order_hypothesis'],
        },
        {
          id: 'chapter-evidence-alternative',
          label: '«Може, авторка випробовувала різні фінали?»',
          next: 'chapter-evidence-alternative',
          grants: ['final_chapter_alternative_hypothesis'],
        },
        {
          id: 'chapter-evidence-hold',
          label: '«Доказів поки замало»',
          next: 'chapter-evidence-hold',
          grants: ['final_chapter_evidence_inconclusive'],
        },
      ],
    },
    {
      id: 'chapter-evidence-order',
      speaker: 'Нора',
      text: '«Тоді треба знайти перехід між ними. Бо поки в нас є дві сцени й жодної сторінки посередині». Вона обводить у блокноті слово «вікно». «Не поспішай ставити крапку».',
      options: [
        {
          id: 'chapter-evidence-order-back',
          label: '«Запишу це як версію»',
          next: 'chapter-evidence-result',
        },
      ],
    },
    {
      id: 'chapter-evidence-alternative',
      speaker: 'Нора',
      text: '«Цілком можливо. Я якось переписувала листа чотири рази, а потім узагалі не відправила». Нора всміхається. «Тільки не називаймо жоден варіант остаточним».',
      options: [
        {
          id: 'chapter-evidence-alternative-back',
          label: '«Поки обидва залишаються відкритими»',
          next: 'chapter-evidence-result',
        },
      ],
    },
    {
      id: 'chapter-evidence-hold',
      speaker: 'Нора',
      text: '«Нарешті хтось сказав це раніше за мене». Нора закриває блокнот. «Можемо перевірити папір іншим разом. Сьогодні Анна обіцяла читати щось про драконів».',
      options: [
        {
          id: 'chapter-evidence-hold-back',
          label: 'Повернутися до свята',
          next: 'chapter-evidence-result',
        },
      ],
    },
    {
      id: 'chapter-evidence-result',
      speaker: 'Оповідач',
      text: 'Нора повертає уривки Айріс. Та ховає їх у свій альбом. Біля вікна Мара вже сперечається з Анною, чи можна назвати дракона домашнім улюбленцем. Френк уважно слухає, ніби питання стосується особисто його.',
      options: [
        {
          id: 'chapter-evidence-result-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_chapter_evidence_reviewed'],
        },
      ],
    },
    {
      id: 'miller-rumor-aftermath',
      speaker: 'Айріс',
      text: '«Пані Міллер щойно запитала, який із маминих фіналів я збираюся видати». Айріс ставить чашку на підвіконня. «Вона навіть не читала тих сторінок. А я ще не знаю, чи обидві мамині». З-за столу долинає сміх: Анна вчить Френка не красти закладки. Айріс не усміхається. «Хто їй це сказав?»',
      options: [
        {
          id: 'rumor-own',
          label: '«Я. Сказав дурницю, і вона рознесла її далі»',
          next: 'miller-rumor-owned',
          grants: ['final_miller_rumor_owned'],
        },
        {
          id: 'rumor-deflect',
          label: '«Міллер сама все перекрутила»',
          next: 'miller-rumor-aftermath-response',
          grants: ['final_miller_rumor_deflected'],
        },
        {
          id: 'rumor-leave',
          label: 'Не відповідати й повернутися до прилавка',
          next: 'miller-rumor-aftermath-response',
          grants: ['final_miller_rumor_avoided'],
        },
      ],
    },
    {
      id: 'miller-rumor-owned',
      speaker: 'Айріс',
      text: '«Дякую, що хоч зараз сказав прямо». Вона забирає чашку з підвіконня. «Але я вже тричі почула про той фінал. Мені не хочеться проводити вечір, виправляючи чужі вигадки». З сусіднього столу Мара гукає, що чайник знову закипів. Айріс дивиться на тебе: «І що тепер?»',
      options: [
        {
          id: 'rumor-correct',
          label: 'Попросити Міллер виправити лише неправдиву новину',
          next: 'miller-rumor-aftermath-response',
          grants: ['final_miller_rumor_corrected_publicly'],
        },
        {
          id: 'rumor-ask-iris',
          label: '«Я не говоритиму за тебе. Як ти хочеш вчинити?»',
          next: 'miller-rumor-aftermath-response',
          grants: ['final_miller_rumor_iris_choice'],
        },
      ],
    },
    {
      id: 'miller-rumor-aftermath-response',
      speaker: 'Айріс',
      text: 'Айріс чекає відповіді ще мить, тоді відходить до Анни. Ти повертаєшся до прилавка, де Френк саме намагається залізти в порожню коробку з-під печива.',
      textWhen: [
        {
          requires: ['final_miller_rumor_corrected_publicly'],
          text: 'Ти просиш пані Міллер сказати гостям лише те, що вона переплутала припущення з фактом. «Отже, фіналу ніхто не знайшов?» — перепитує вона й неохоче повторює це біля столу. Айріс чує виправлення. «Дякую. Але ті, хто вже пішов, його не почують», — каже вона й повертається до Анни.',
        },
        {
          requires: ['final_miller_rumor_iris_choice'],
          text: '«Сьогодні — ніяк», — відповідає Айріс. «Я прийшла послухати книжки, а не захищати мамині чернетки». Вона киває на двері: «Якщо Міллер знову запитає, скажи тільки, що ти помилився. Без подробиць». Ти погоджуєшся. Айріс бере тарілку для Анни, але більше про рукопис не говорить.',
        },
        {
          requires: ['final_miller_rumor_deflected'],
          text: '«Нора чула, що саме ти сказав», — тихо відповідає Айріс. «Не треба робити з Міллер єдину винну». Вона бере свою чашку й сідає поруч з Анною. Та підсуває їй книжку, не ставлячи запитань.',
        },
        {
          requires: ['final_miller_rumor_avoided'],
          text: 'Ти мовчки повертаєшся до прилавка. Айріс не йде за тобою. Мара простягає їй чай і питає, чи потрібна ще одна тарілка. «Ні, дякую», — відповідає Айріс. Розмова про рукопис на цьому закінчується, але чутка залишається.',
        },
      ],
      options: [
        {
          id: 'rumor-aftermath-finish',
          label: 'Повернутися до вечора читання',
          next: 'gathering',
          grants: ['final_miller_rumor_aftermath_done'],
        },
      ],
    },
    {
      id: 'miller-ledger-gossip',
      speaker: 'Пані Міллер',
      text: '«Я не підслуховувала», — каже пані Міллер, навіть не привітавшись. «Просто бачила, як Елеонора принесла журнал, а Айріс пішла до вікна. І раптом усі зробили вигляд, що говорять про погоду». Вона ставить чашку на прилавок. «Щось знайшли?»',
      options: [
        {
          id: 'miller-ledger-boundary',
          label: '«Це справа Айріс. Запитайте її, якщо вона сама захоче»',
          next: 'miller-ledger-response',
          grants: ['final_miller_ledger_boundary'],
        },
        {
          id: 'miller-ledger-tease',
          label: '«Може, знайшли зниклий фінал. Тільки це між нами»',
          next: 'miller-ledger-response',
          grants: ['final_miller_ledger_rumor_seeded'],
        },
        {
          id: 'miller-ledger-memory',
          label: '«Ви пам’ятаєте, як книгарню затопило?»',
          next: 'miller-ledger-response',
          grants: ['final_miller_ledger_flood_memory'],
        },
      ],
    },
    {
      id: 'miller-ledger-response',
      speaker: 'Пані Міллер',
      text: '«То й не треба було загадково перешіптуватися біля каси». Вона поправляє шарф. «Добре, не питатиму. Але книжку, яку я принесла, ви мені все одно запишіть».',
      textWhen: [
        {
          requires: ['final_miller_ledger_boundary'],
          text: '«Могли б просто сказати, що не хочете говорити». Пані Міллер ображено випрямляє спину. За мить додає: «Тоді порадьте хоч нормальний детектив. Без тих фіналів, де винен садівник».',
        },
        {
          requires: ['final_miller_ledger_rumor_seeded'],
          text: '«Між нами, звісно». Пані Міллер вже повертається до Нори: «Уявляєте, у них, здається, знайшовся фінал старого роману!» Нора піднімає голову. «Ви самі його читали?» — «Ні, але мені сказали». Ти розумієш, що зупинити цю розмову буде непросто.',
        },
        {
          requires: ['final_miller_ledger_flood_memory'],
          text: '«Ще б пак. Я тоді принесла відро й дві ковдри. А Елеонора сказала, що відра в нас уже є, зате потрібні сухі рушники». Пані Міллер знизує плечима. «Хто куди клав сторінки, не пам’ятаю. Я більше рятувала чайник».',
        },
      ],
      options: [
        {
          id: 'miller-ledger-back',
          label: 'Повернутися до вечора читання',
          next: 'gathering',
          grants: ['final_miller_ledger_conversation_done'],
        },
      ],
    },
    {
      id: 'archive-handover',
      speaker: 'Нора',
      text: 'Після читання Нора знаходить для журналу суху папку. «Нам потрібен опис, а не ще одна легенда. Коробка сімнадцять — факт. Автор другого уривка — питання». Елеонора обережно витягає з-під папки закладку, яку туди встиг засунути Френк. «А що писати про те, кому це показувати?»',
      textWhen: [
        {
          requires: ['final_ledger_record_private'],
          text: 'Елеонора ховає журнал за прилавком. «Айріс ще не знає про цей запис. Не робімо вигляд, ніби вона погодилася на наш архів». Нора киває: «Можемо зафіксувати, що перевірили, але не виставляти це на вітрину». Френк намагається сісти на порожню папку.',
        },
        {
          requires: ['final_ledger_eleanor_to_tell'],
          text: 'Елеонора розгладжує зім’ятий кутик журналу. «Я обіцяла поговорити з Айріс після свята. Спершу це, а вже потім будь-які рішення про доступ». Нора кладе поруч чистий аркуш: «Тоді поки лише опис для нас».',
        },
        {
          requires: ['final_ledger_iris_told', 'final_miller_ledger_rumor_seeded'],
          text: 'Айріс бачить, як Нора прибирає журнал у папку. «Міллер уже розповіла половині кімнати, що ви знайшли мамин фінал. А тепер хочете ще й підписати коробку?» Нора відповідає: «Хочу записати тільки те, що ми перевірили. Не виставляти твої сторінки». Айріс лишається поруч, але не сідає.',
        },
        {
          requires: ['final_ledger_iris_told'],
          text: 'Айріс стоїть біля каси, поки Нора прибирає журнал у суху папку. «Сімнадцять ми з’ясували, — каже вона. — А про мамині тексти ще не все». Елеонора простягає їй чистий аркуш: «Тоді підкажи, що нам дозволено записати».',
        },
      ],
      options: [
        {
          id: 'archive-handover-index',
          label: 'Зробити приватний опис лише перевірених фактів',
          next: 'archive-handover-result',
          grants: ['final_archive_index_sealed'],
        },
        {
          id: 'archive-handover-iris',
          label: 'Запитати Айріс, хто може читати опис',
          next: 'archive-handover-result',
          requires: ['final_ledger_iris_told'],
          grants: ['final_archive_iris_boundaries'],
        },
        {
          id: 'archive-handover-defer',
          label: 'Прибрати папку й повернутися до книжок',
          next: 'archive-handover-result',
          grants: ['final_archive_deferred'],
        },
      ],
    },
    {
      id: 'archive-handover-result',
      speaker: 'Оповідач',
      text: 'Елеонора ставить папку на суху полицю за касою. Нора забирає ручку, а Френк нарешті вмощується на стільці, який ніхто не встиг зайняти.',
      textWhen: [
        {
          requires: ['final_archive_index_sealed', 'final_provenance_consent_archive'],
          text: 'Нора записує: «Коробка № 17 — книгарня, після затоплення; авторство другого аркуша невідоме». Копії, які дозволила залишити Айріс, лежать окремо від журналу. На полиці немає ні афіші, ні імені автора: дозвіл зберігати не означає дозвіл показувати всім.',
        },
        {
          requires: ['final_archive_index_sealed'],
          text: 'Нора записує: «Коробка № 17 — книгарня, після затоплення; авторство другого аркуша невідоме». Елеонора кладе опис у закриту папку. Жодних нових підписів до рукопису вони не додають.',
        },
        {
          requires: ['final_archive_iris_boundaries', 'final_miller_ledger_rumor_seeded'],
          text: '«Після того, що ви сказали Міллер, сьогодні цей опис ніхто не читатиме», — відповідає Айріс. Нора не сперечається й закриває папку. «Коли захочеш, повернемося до цього», — каже вона. Айріс йде до Анни обирати книжку.',
        },
        {
          requires: ['final_archive_iris_boundaries'],
          text: '«Поки тільки я та Елеонора», — каже Айріс. «І без копій на загальному столі». Нора ставить на папці маленьку позначку для себе. Айріс залишається допомогти Анні розкласти закладки, не пояснюючи гостям свого рішення.',
        },
        {
          requires: ['final_archive_deferred'],
          text: '«Сьогодні ми й так забагато говорили про папір», — каже Елеонора й прибирає журнал у шухляду. Мара гукає, що залишилася одна булочка. Френк дивиться на неї так, ніби питання вже вирішене.',
        },
      ],
      options: [
        {
          id: 'archive-handover-finish',
          label: 'Повернутися до вечора історій',
          next: 'gathering',
          grants: ['final_archive_handover_complete'],
        },
      ],
    },
    {
      id: 'ledger-aftercare',
      speaker: 'Нора',
      text: 'Нора складає чашки біля мийки. «То що робимо з журналом? Я б не клала його під Френка. Він чудовий кіт, але жахливий архіваріус». Елеонора знімає зі столу мокру підставку й мовчки підсуває тобі чистий аркуш.',
      textWhen: [
        {
          requires: ['final_ledger_iris_joke_hurt'],
          text: 'Айріс стоїть біля вікна й розмовляє з Анною. Нора ставить біля тебе чашку. «Ти хотів розрядити обстановку. Вийшло погано». Вона киває на журнал. «Із записами ми розберемося. А от із людьми доведеться говорити».',
        },
        {
          requires: ['final_ledger_record_private'],
          text: 'Елеонора прибирає журнал подалі від гостей. Нора тихо питає: «Айріс поки не знає?» Ти киваєш. «Тоді не залишаймо відкритий журнал на столі, де кожен може його прочитати». Френк обнюхує порожню коробку з-під печива.',
        },
      ],
      options: [
        {
          id: 'aftercare-inventory',
          label: 'Записати, що відомо, а що досі лишається загадкою',
          next: 'ledger-aftercare-inventory',
          grants: ['final_ledger_aftercare_inventory'],
        },
        {
          id: 'aftercare-apologize',
          label: 'Спробувати вибачитися перед Айріс за невдалий жарт',
          next: 'ledger-aftercare-apology',
          requires: ['final_ledger_iris_joke_hurt'],
          grants: ['final_ledger_aftercare_apology'],
        },
        {
          id: 'aftercare-cleanup',
          label: 'Відкласти журнал і допомогти прибрати після читання',
          next: 'ledger-aftercare-cleanup',
          grants: ['final_ledger_aftercare_cleanup'],
        },
      ],
    },
    {
      id: 'ledger-aftercare-inventory',
      speaker: 'Нора',
      text: 'Ти записуєш три речі: «17 — коробка книгарні після затоплення»; «аркуші сушили окремо»; «автор другого уривка та попередження не встановлені». Нора читає через плече. «Ось це вже схоже на справу. Не на красиву версію, а на те, що можна перевірити».',
      textWhen: [
        {
          requires: ['final_ledger_record_private'],
          text: 'Ти записуєш лише перевірені факти: коробка сімнадцять, затоплення, розрізнені аркуші. Поруч ставиш два знаки питання — біля авторства та попередження. Нора закриває нотатник. «Це залишиться між нами, доки Айріс сама не дізнається про журнал».',
        },
      ],
      options: [
        {
          id: 'aftercare-inventory-back',
          label: 'Покласти нотатник до шухляди',
          next: 'ledger-aftercare-end',
        },
      ],
    },
    {
      id: 'ledger-aftercare-apology',
      speaker: 'Айріс',
      text: '«Я знаю, що ти не хотів образити». Айріс не відходить від вікна. «Але коли хтось говорить про мамині речі, мені не смішно». Вона дивиться на твою простягнуту чашку. «Дякую за чай. Поговоримо іншим разом».',
      options: [
        {
          id: 'aftercare-apology-back',
          label: 'Не вимагати негайного прощення',
          next: 'ledger-aftercare-end',
        },
      ],
    },
    {
      id: 'ledger-aftercare-cleanup',
      speaker: 'Мара',
      text: '«О, нарешті людина, яка бачить цілу гору чашок!» Мара вручає тобі рушник. Френк сідає просто в порожню коробку з-під печива. «Тільки не віддавай йому ще й касу, — сміється вона. — Він і так поводиться як власник».',
      textWhen: [
        {
          requires: ['final_ledger_iris_joke_hurt'],
          text: 'Мара мовчки подає тобі рушник. «Айріс треба трохи часу», — каже вона, не дивлячись у бік вікна. Френк забирається в порожню коробку з-під печива. «А цьому часу не треба. Він уже пробачив усіх, хто давав йому їсти».',
        },
      ],
      options: [
        {
          id: 'aftercare-cleanup-back',
          label: 'Завершити прибирання',
          next: 'ledger-aftercare-end',
        },
      ],
    },
    {
      id: 'ledger-aftercare-end',
      speaker: 'Оповідач',
      text: 'За вікном дощ майже вщух. Нора нарешті знаходить свою закладку під лапою Френка, а Елеонора ставить журнал на суху полицю. У книгарні ще пахне чаєм і папером. На сьогодні цього досить.',
      options: [
        {
          id: 'aftercare-finish',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_ledger_aftercare_complete'],
        },
      ],
    },
    {
      id: 'ledger-resolution',
      speaker: 'Елеонора',
      text: 'Елеонора приносить старий журнал ремонту з шухляди під прилавком. Папір пахне пилом, а кутик однієї сторінки злипся від води. «Ось. Коробка сімнадцять. Не майстерня — наша книгарня». Під номером написано: «Розрізнені аркуші. Сушити окремо. Не передавати до друку без згоди авторки». Елеонора торкається олівцевої сімнадцятки на знайденому аркуші. «Ці цифри ставила я».',
      options: [
        {
          id: 'ledger-ask-warning',
          label: '«Тоді хто написав попередження на звороті?»',
          next: 'ledger-evidence',
          grants: ['final_ledger_warning_questioned'],
        },
        {
          id: 'ledger-ask-missing',
          label: '«Як аркуш опинився між романами?»',
          next: 'ledger-evidence',
          grants: ['final_ledger_misfiling_questioned'],
        },
        {
          id: 'ledger-ask-iris',
          label: '«Чому ви не розповіли про це Айріс раніше?»',
          next: 'ledger-evidence',
          grants: ['final_ledger_eleanor_accountability'],
        },
      ],
    },
    {
      id: 'ledger-evidence',
      speaker: 'Елеонора',
      text: '«Я складала врятоване після потопу по коробках. Не всі речі повернулися на свої місця. Не пам’ятаю, хто залишив запис на аркуші, але у журналі прохання авторки: нічого не віддавати до друку без її дозволу». Елеонора відсуває чашку. «Мені слід було зберегти список краще».',
      textWhen: [
        {
          requires: ['final_ledger_warning_questioned'],
          text: '«Ці слова на звороті — не мій почерк», — каже Елеонора. «Але в журналі є прохання авторки: не віддавати матеріали до друку без її дозволу. Можливо, йшлося саме про останню сторінку. Можливо, ні. Я не буду вигадувати».',
        },
        {
          requires: ['final_ledger_misfiling_questioned'],
          text: '«Коли книгарню відчинили після потопу, ми поспішали повернути книжки на полиці». Елеонора крутить олівець. «Сторінка могла застрягти між романами тоді. Але я не бачила, як це сталося. Я лише знаю, що коробка сімнадцять була тут, а не в майстерні».',
        },
        {
          requires: ['final_ledger_eleanor_accountability'],
          text: '«Я думала, все, що висохло, повернулося до власників». Елеонора не відводить очей. «Потім минуло сім років. Це не виправдання. Якщо Айріс захоче почути, я розповім їй сама. Але не проси її пробачити мене за твоїм розкладом».',
        },
      ],
      options: [
        {
          id: 'ledger-letter-connection',
          label: '«Це те саме затоплення, через яке зник лист?»',
          next: 'ledger-letter-connection',
          requires: ['saw_envelope'],
          unless: ['final_ledger_letter_connection_heard'],
        },
        {
          id: 'ledger-tell-iris',
          label: '«Айріс має побачити цей запис сьогодні»',
          next: 'ledger-outcome',
          grants: ['final_ledger_iris_told'],
        },
        {
          id: 'ledger-ask-eleanor',
          label: '«Поговоріть з Айріс самі, коли будете готові»',
          next: 'ledger-outcome',
          grants: ['final_ledger_eleanor_to_tell'],
        },
        {
          id: 'ledger-private',
          label: '«Поки залишмо журнал у книгарні»',
          next: 'ledger-outcome',
          grants: ['final_ledger_record_private'],
        },
      ],
    },
    {
      id: 'ledger-letter-connection',
      speaker: 'Елеонора',
      text: '«Те саме», — каже Елеонора. «Лист залишився в книжці, яку ми сховали від води. А аркуші сушили окремо, і я не повернула їх до папки». Вона дивиться на старий журнал. «Тоді здавалося: головне — врятувати папір. А кому він був потрібен, я навіть не запитала».',
      options: [
        {
          id: 'ledger-letter-connection-back',
          label: '«Два різні сліди одного вечора»',
          next: 'ledger-evidence',
          grants: ['final_ledger_letter_connection_heard'],
        },
      ],
    },
    {
      id: 'ledger-iris-confrontation',
      speaker: 'Айріс',
      text: '«Ти ж казала, що підписала кожну коробку», — Айріс дивиться на Елеонору. «І сім років ніхто не перевірив, що в них?» Елеонора стискає обкладинку журналу. «Я боялася побачити, скільки всього переплутала». «Отже, ти боялася, а ми чекали», — відповідає Айріс. З сусіднього столу долинає сміх Мари, і від цього тиша між ними здається ще довшою.',
      options: [
        {
          id: 'ledger-confrontation-listen',
          label: 'Не перебивати їхню розмову',
          next: 'ledger-iris-response',
          grants: ['final_ledger_iris_listened'],
        },
        {
          id: 'ledger-confrontation-demand',
          label: '«Елеоноро, покажіть Айріс усі записи»',
          next: 'ledger-iris-response',
          grants: ['final_ledger_eleanor_pressed'],
        },
        {
          id: 'ledger-confrontation-joke',
          label: '«Може, Френк просто сховав усі кінцівки?»',
          next: 'ledger-iris-response',
          grants: ['final_ledger_iris_joke_hurt'],
        },
      ],
    },
    {
      id: 'ledger-iris-response',
      speaker: 'Оповідач',
      text: 'Елеонора обережно закриває журнал. «Я принесу решту записів завтра. Якщо ти захочеш». Айріс не відповідає відразу. Потім каже: «Спершу я поговорю з мамою».',
      textWhen: [
        {
          requires: ['final_ledger_iris_listened'],
          text: 'Ти залишаєшся біля вікна. «Я принесу решту записів, якщо захочеш», — каже Елеонора. Айріс довго мовчить. «Спершу поговорю з мамою. А потім, можливо, з тобою». Елеонора киває, не намагаючись її зупинити.',
        },
        {
          requires: ['final_ledger_eleanor_pressed'],
          text: 'Елеонора відсуває журнал до Айріс. «Можеш забрати його зараз». Айріс повертає його назад. «Я не просила влаштовувати мені перевірку посеред свята». Вона звертається вже до тебе: «Наступного разу дай мені самій попросити».',
        },
        {
          requires: ['final_ledger_iris_joke_hurt'],
          text: 'Айріс дивиться на тебе так, що жарт застрягає в горлі. «Це не кумедно». Вона бере альбом і відходить до вікна. Елеонора не поспішає за нею. Френк, ні про що не здогадуючись, намагається вкрасти крихту з тарілки Мари.',
        },
      ],
      options: [
        {
          id: 'ledger-iris-response-back',
          label: 'Дати розмові завершитися',
          next: 'ledger-outcome',
          grants: ['final_ledger_confrontation_heard'],
        },
      ],
    },
    {
      id: 'ledger-outcome',
      speaker: 'Оповідач',
      text: 'Айріс повільно читає запис. «Отже, сімнадцять — не дата й не номер коробки палітурника». Вона піднімає очі на Елеонору. «Мені потрібно подумати. І поговорити з мамою, коли їй стане легше. І ні, зараз я не хочу, щоб усі дивилися на мене». Елеонора мовчки киває. Мара відсуває від них стільці, звільняючи трохи місця.',
      textWhen: [
        {
          requires: ['final_ledger_confrontation_heard'],
          text: 'Айріс повертається до свого альбому. Елеонора ставить журнал поруч із касою, де він не заважатиме гостям. Мара питає, чи хтось ще хоче чаю. Френк уже відповів за всіх.',
        },
        {
          requires: ['final_ledger_eleanor_to_tell'],
          text: 'Елеонора обережно закриває журнал. «Я сама поговорю з Айріс. Не посеред свята». Вона дивиться на двері, за якими чути сміх Мари. «Сімнадцять — це номер нашої коробки. Принаймні тепер ми знаємо, де шукати решту».',
        },
        {
          requires: ['final_ledger_record_private'],
          text: 'Елеонора ховає журнал до шухляди. «Не називаймо це кінцем справи. Я ще маю поговорити з Айріс». З іншого кінця кімнати Нора просить передати їй чай. Френк уже вмостився на журналі, наче охороняє знахідку.',
        },
      ],
      options: [
        {
          id: 'ledger-iris-confrontation',
          label: 'Почути розмову Айріс та Елеонори наодинці',
          next: 'ledger-iris-confrontation',
          requires: ['final_ledger_iris_told'],
          unless: ['final_ledger_confrontation_heard'],
        },
        {
          id: 'ledger-finish',
          label: 'Повернутися до спільного читання',
          next: 'gathering',
          grants: ['final_ledger_scene_complete'],
        },
      ],
    },
    {
      id: 'chapter-reconstruction',
      speaker: 'Нора',
      text: '«У нас є два уривки, різне чорнило, різні краї паперу й коробка, яку ніхто ще не перевірив». Нора розкладає аркуші на чистому столі. «Який висновок ти готовий записати без слова “можливо”?»',
      options: [
        {
          id: 'reconstruction-same',
          label: '«Це дві версії одного фіналу»',
          next: 'chapter-reconstruction-check',
          grants: ['final_reconstruction_alternative_claim'],
        },
        {
          id: 'reconstruction-order',
          label: '«Це послідовні сцени однієї історії»',
          next: 'chapter-reconstruction-check',
          grants: ['final_reconstruction_sequence_claim'],
        },
        {
          id: 'reconstruction-unknown',
          label: '«Ми ще не знаємо, чи обидва аркуші належать їй»',
          next: 'chapter-reconstruction-check',
          grants: ['final_reconstruction_authorship_open'],
        },
      ],
    },
    {
      id: 'chapter-reconstruction-check',
      speaker: 'Нора',
      text: '«Це гарна версія. Але версія — не доказ». Нора показує на другий аркуш. «Поки не побачимо коробку й не звіримо почерк, ми не можемо чесно поставити ці сторінки поруч як оригінальний фінал».',
      textWhen: [
        {
          requires: ['final_reconstruction_alternative_claim'],
          text: '«Може бути», — каже Нора. «Та різний папір не доводить, що це дві версії. А однакове вікно не доводить, що обидві сцени писала та сама людина».',
        },
        {
          requires: ['final_reconstruction_sequence_claim'],
          text: '«Тоді між ними бракує переходу», — каже Нора. «Ми можемо його уявити. Але не маємо права підкладати вигаданий аркуш до справжніх».',
        },
        {
          requires: ['final_reconstruction_authorship_open'],
          text: '«Саме це й можемо сказати напевно: авторство другого аркуша не встановлено». Нора закриває блокнот. «Мені теж хочеться відповіді. Але не такої, яку ми самі домалювали».',
        },
      ],
      options: [
        {
          id: 'reconstruction-tell-iris',
          label: 'Розповісти Айріс про всі сумніви',
          next: 'chapter-reconstruction-result',
          grants: ['final_reconstruction_disclosed_uncertainty'],
        },
        {
          id: 'reconstruction-keep-note',
          label: 'Залишити припущення в особистих нотатках',
          next: 'chapter-reconstruction-result',
          grants: ['final_reconstruction_notes_private'],
        },
      ],
    },
    {
      id: 'chapter-reconstruction-result',
      speaker: 'Айріс',
      text: '«Дякую, що не назвав припущення відповіддю». Айріс дивиться на аркуші. «Завтра я спробую з’ясувати, хто їх писав. А сьогодні хочу, щоб книжка хоча б трохи залишилася книжкою».',
      textWhen: [
        {
          requires: ['final_reconstruction_notes_private'],
          text: 'Айріс помічає, як ти закриваєш нотатник. «Знову розгадуєте щось із Норою?» — усміхається вона. «Залиште хоч одну загадку для наступної зустрічі».',
        },
      ],
      options: [
        {
          id: 'reconstruction-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_chapter_reconstruction_done'],
        },
      ],
    },
    {
      id: 'manuscript-provenance',
      speaker: 'Айріс',
      text: '«Я пригадала, що в майстерні могла залишитися коробка з чернетками. Але ми ще не знаємо, що всередині». Айріс дивиться на аркуші. «На звороті одного стоїть мамин підпис, а на другому — тільки ініціали. Я не хочу називати їх одним рукописом, поки не перевірю».',
      textWhen: [
        {
          requires: ['final_workshop_permission_requested'],
          text: '«Я написала реставраторці, як ми домовлялися. Відповіді ще немає — вечір тільки почався». Айріс дивиться на аркуші. «Один підписаний мамою, інший — тільки ініціалами. Нам ще є що перевірити».',
        },
        {
          requires: ['final_workshop_search_deferred'],
          text: '«Я вирішила не відкривати коробки сьогодні. Вони можуть зачекати». Айріс торкається краю аркуша. «Один підписаний мамою, інший — лише ініціалами. Не хочу вдавати, ніби знаю більше, ніж знаю».',
        },
      ],
      options: [
        {
          id: 'provenance-return',
          label: '«Віддаймо обидва аркуші тобі»',
          next: 'manuscript-provenance-result',
          grants: ['final_provenance_iris_custody'],
        },
        {
          id: 'provenance-archive',
          label: '«Залишимо копії в книгарні, якщо ти не проти»',
          next: 'manuscript-provenance-result',
          grants: ['final_provenance_consent_archive'],
        },
        {
          id: 'provenance-wait',
          label: '«Не вирішуймо, доки не перевіриш коробку»',
          next: 'manuscript-provenance-result',
          grants: ['final_provenance_wait_for_evidence'],
        },
      ],
    },
    {
      id: 'manuscript-provenance-result',
      speaker: 'Айріс',
      text: '«Гаразд. Але оригінали залишаться в мене, доки не з’ясуємо, кому вони належать». Айріс прибирає аркуші до альбому. «А тепер я хочу послухати, що Нора каже про книжку, яку всі так хвалять».',
      textWhen: [
        {
          requires: ['final_provenance_iris_custody'],
          text: '«Дякую». Айріс обережно вкладає обидва аркуші до альбому. «Я покажу їх реставраторці, але рішення про публікацію — не сьогодні».',
        },
        {
          requires: ['final_provenance_consent_archive'],
          text: '«Копії — можна. Тільки без мого імені на табличці, поки ми не впевнені». Айріс усміхається. «І сховай їх від Френка. Він уже пробував з’їсти одну закладку».',
        },
        {
          requires: ['final_provenance_wait_for_evidence'],
          text: '«Саме так». Айріс повертає фотографію в альбом. «Колись перевіримо, чи взагалі є та коробка. Сьогодні я нарешті хочу просто послухати Нору».',
        },
      ],
      options: [
        {
          id: 'provenance-finish',
          label: 'Повернутися до вечора історій',
          next: 'gathering',
          grants: ['final_manuscript_provenance_decided'],
        },
      ],
    },
    {
      id: 'workshop-evidence',
      speaker: 'Айріс',
      text: '«Я збільшила фотографію. Поруч із сімкою видно ще одну риску. Це може бути одиниця, а може — подряпина на коробці». Айріс кладе поряд сторінку. «Ми шукаємо сімнадцять так старанно, що скоро побачимо його навіть у візерунку на чашці».',
      options: [
        {
          id: 'workshop-evidence-compare',
          label: '«Порівняймо папір, а не цифри»',
          next: 'workshop-evidence-paper',
          grants: ['final_workshop_paper_compared'],
        },
        {
          id: 'workshop-evidence-ask',
          label: '«Можна запитати реставраторку про коробки?»',
          next: 'workshop-evidence-owner',
          grants: ['final_workshop_permission_requested'],
        },
        {
          id: 'workshop-evidence-keep',
          label: '«Не чіпаймо мамині речі сьогодні»',
          next: 'workshop-evidence-rest',
          grants: ['final_workshop_search_deferred'],
        },
      ],
    },
    {
      id: 'workshop-evidence-paper',
      speaker: 'Айріс',
      text: '«Ось цей край обрізаний вручну. А в другому уривку — рівний, машинний». Вона піднімає обидва аркуші до світла. «Це не доводить, хто їх написав. Але, можливо, їх навіть не друкували разом».',
      options: [
        {
          id: 'workshop-evidence-paper-back',
          label: '«Запишімо різницю»',
          next: 'workshop-evidence-end',
        },
      ],
    },
    {
      id: 'workshop-evidence-owner',
      speaker: 'Айріс',
      text: '«Запитати можна. Але не заходити туди без дозволу й не нишпорити в чужих речах». Вона ховає фотографію в альбом. «Я сама напишу реставраторці після вечора».',
      options: [
        {
          id: 'workshop-evidence-owner-back',
          label: '«Домовилися»',
          next: 'workshop-evidence-end',
        },
      ],
    },
    {
      id: 'workshop-evidence-rest',
      speaker: 'Айріс',
      text: '«Дякую». Айріс підсуває тобі тарілку. «Тоді допоможи мені вирішити складніше питання: кому дістанеться остання булочка?»',
      options: [
        {
          id: 'workshop-evidence-rest-back',
          label: '«Френкові точно не можна»',
          next: 'workshop-evidence-end',
        },
      ],
    },
    {
      id: 'workshop-evidence-end',
      speaker: 'Айріс',
      text: '«Завтра я подивлюся на все свіжими очима. А зараз хочу послухати, як Нора сперечається з пані Міллер про детективи».',
      options: [
        {
          id: 'workshop-evidence-finish',
          label: 'Повернутися до вечора історій',
          next: 'gathering',
          grants: ['final_workshop_evidence_reviewed'],
        },
      ],
    },
    {
      id: 'chapter-argument',
      speaker: 'Мара',
      text: '«Я б залишила ту, де вона йде», — каже Мара, повертаючи Айріс сторінку. «Не тому, що йти завжди правильно. Просто вона нарешті сама замовляє сніданок». Айріс пирхає: «Ти обираєш фінал за булочкою?»',
      options: [
        {
          id: 'chapter-argument-mara',
          label: '«Мені теж цікавіший другий уривок»',
          next: 'chapter-argument-response',
          grants: ['final_chapter_mara_supported'],
        },
        {
          id: 'chapter-argument-iris',
          label: '«Повернення теж може бути сміливим»',
          next: 'chapter-argument-response',
          grants: ['final_chapter_iris_supported'],
        },
        {
          id: 'chapter-argument-neither',
          label: '«А може, вони обидві помиляються щодо фіналу?»',
          next: 'chapter-argument-response',
          grants: ['final_chapter_versions_questioned'],
        },
      ],
    },
    {
      id: 'chapter-argument-response',
      speaker: 'Айріс',
      text: '«Я не знаю, який із них справжній», — каже Айріс. Мара вже відламала половину булочки й простягає їй. «Тоді поки не вибирай. Ти ж не на конкурсі». Айріс бере булочку, хоча ще хвилину тому казала, що не голодна.',
      textWhen: [
        {
          requires: ['final_chapter_mara_supported'],
          text: '«О, тепер вас двоє», — каже Айріс. Мара задоволено киває. «Команда сніданку». Айріс сміється й нарешті бере запропоновану булочку.',
        },
        {
          requires: ['final_chapter_iris_supported'],
          text: '«От бачиш», — Айріс піднімає брови. Мара відламує шматок булочки. «Гаразд. Але повертатися треба туди, де тебе справді чекають, а не просто залишили світло».',
        },
        {
          requires: ['final_chapter_versions_questioned'],
          text: '«Може, це взагалі не фінал», — каже Айріс. Мара дивиться на два аркуші. «Тоді ми сперечалися через середину книжки. Чудово». Обидві сміються.',
        },
      ],
      options: [
        {
          id: 'chapter-argument-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_chapter_argument_heard'],
        },
      ],
    },
    {
      id: 'missing-chapter-choice',
      speaker: 'Айріс',
      text: '«Я принесла два уривки. В одному героїня повертається додому й знаходить на столі дві чашки. В іншому вона бачить ті самі чашки, але йде далі. Я завжди думала, що один із них — чернетка». Айріс дивиться на Френка, який спить на стосі книжок. «Тепер не впевнена».',
      options: [
        {
          id: 'missing-chapter-read-home',
          label: '«Прочитай той, де вона повертається»',
          next: 'missing-chapter-home',
          grants: ['final_chapter_home_version_read'],
        },
        {
          id: 'missing-chapter-read-leave',
          label: '«А що в другому уривку?»',
          next: 'missing-chapter-leave',
          grants: ['final_chapter_departure_version_read'],
        },
        {
          id: 'missing-chapter-no-read',
          label: '«Можеш залишити обидва для себе»',
          next: 'missing-chapter-after',
          grants: ['final_chapter_reading_declined'],
        },
      ],
    },
    {
      id: 'missing-chapter-home',
      speaker: 'Айріс',
      text: '«Вона торкнулася холодної чашки. Хтось чекав її до самого ранку, а потім пішов на роботу. Вона зняла пальто й поставила чайник». Айріс складає аркуш. «Мені подобався цей фінал. Але мама закреслила останній рядок».',
      options: [
        {
          id: 'missing-chapter-home-ask',
          label: '«Може, це не фінал, а лише одна з можливостей?»',
          next: 'missing-chapter-after',
          grants: ['final_chapter_multiple_endings_considered'],
        },
      ],
    },
    {
      id: 'missing-chapter-leave',
      speaker: 'Айріс',
      text: '«Вона побачила у вікні світло, але не постукала. За рогом була пекарня, де вже місили тісто. Вона зайшла туди й уперше за багато років замовила сніданок лише для себе». Айріс зітхає. «Цей уривок мама не закреслила. Просто не підписала».',
      options: [
        {
          id: 'missing-chapter-leave-ask',
          label: '«А якщо обидва уривки належать одній історії?»',
          next: 'missing-chapter-after',
          grants: ['final_chapter_sequence_theory'],
        },
      ],
    },
    {
      id: 'missing-chapter-after',
      speaker: 'Айріс',
      text: '«Я поки не знаю, що мама хотіла надрукувати. Може, вона й сама не знала». Айріс прибирає аркуші до альбому. «Але тепер це схоже на її голос, а не на чиюсь розповідь про неї».',
      options: [
        {
          id: 'missing-chapter-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_missing_chapter_discussed'],
        },
      ],
    },
    {
      id: 'margin-followup',
      speaker: 'Айріс',
      text: 'Айріс дістає з альбому стару фотографію. На ній — стелаж із коробками, а поруч її мати сміється, тримаючи величезні ножиці. «Я знайшла це вранці. Бачиш? На коробці написано сім, не сімнадцять. Я вчора помилилася».',
      textWhen: [
        {
          requires: ['iris_margin_box_theory'],
          text: '«Ти питав про коробки. Я знайшла фото майстерні: там справді стояли чернетки. Але номер на найближчій коробці — сім, а не сімнадцять». Айріс підсуває фотографію. «Здається, ми надто хотіли побачити відповідь».',
        },
        {
          requires: ['iris_margin_date_theory'],
          text: '«Ти припустив, що це дата. Я перевірила мамин календар: сімнадцятого там нічого немає. Зате знайшла фотографію майстерні. На коробці видно сім, а не сімнадцять». Айріс знизує плечима. «Поки жодна версія не виграла».',
        },
      ],
      options: [
        {
          id: 'margin-followup-compare',
          label: '«Порівняймо почерк на фото й на аркуші»',
          next: 'margin-followup-result',
          grants: ['final_margin_handwriting_compared'],
        },
        {
          id: 'margin-followup-rest',
          label: '«Залишимо це до завтра. Зараз твоє свято»',
          next: 'margin-followup-result',
          grants: ['final_margin_inquiry_paused'],
        },
      ],
    },
    {
      id: 'margin-followup-result',
      speaker: 'Айріс',
      text: '«Гаразд. Але фотографію я заберу собі». Айріс складає її в альбом. «Мама на ній така щаслива. Не хочу, щоб вона стала просто доказом у чиїйсь справі».',
      options: [
        {
          id: 'margin-followup-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_margin_followup_heard'],
        },
      ],
    },
    {
      id: 'workshop-followup',
      speaker: 'Айріс',
      text: '«У майстерні тепер ремонтують старі книжки. Виявляється, сестра палітурника здавала ключі одному студенту». Айріс крутить у пальцях закладку. «Я не впевнена, що хочу знайомитися з ним посеред свята».',
      textWhen: [
        {
          requires: ['iris_workshop_discreet_inquiry'],
          text: '«Ти запитав про майстерню, як і обіцяв, без мого імені. Там тепер ремонтують старі книжки. Один студент орендує приміщення в сестри палітурника». Айріс ховає закладку в альбом. «Дивно знати, що місце не стояло порожнім».',
        },
        {
          requires: ['iris_workshop_left_uninvestigated'],
          text: '«Я все-таки пройшла повз майстерню. На дверях висить оголошення про ремонт книжок. Не заходила». Айріс усміхається. «Може, іншим разом. Сьогодні я прийшла послухати історії».',
        },
      ],
      options: [
        {
          id: 'workshop-visit-later',
          label: '«Якщо захочеш, підемо туди разом після свята»',
          next: 'workshop-result',
          grants: ['final_workshop_visit_offered'],
        },
        {
          id: 'workshop-leave-alone',
          label: '«Тоді сьогодні просто побудь тут»',
          next: 'workshop-result',
          grants: ['final_workshop_visit_deferred'],
        },
      ],
    },
    {
      id: 'workshop-result',
      speaker: 'Айріс',
      text: '«Домовилися». Айріс ставить альбом біля стіни й дивиться на людей, які сперечаються про книжки. «Знаєш, я скучила навіть за цими суперечками».',
      options: [
        {
          id: 'workshop-result-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_workshop_followup_heard'],
        },
      ],
    },
    {
      id: 'quiet-manuscript-followup',
      speaker: 'Айріс',
      text: '«Я ще думаю про той аркуш. Не знаю, чи він мамин. Але хочу сама вирішити, що з ним робити». Френк сідає на її альбом.',
      textWhen: [
        {
          requires: ['iris_quiet_page_stars_compared'],
          text: '«На листівці три зірочки, а на аркуші дві. Я порівняла їх ще раз. Можливо, почерк інший. Не хочу вигадувати відповідь».',
        },
        {
          requires: ['iris_quiet_page_window_theory'],
          text: '«Я перечитала уривок про відчинене вікно. Мама часто писала про очікування. Але це ще не доводить, що сторінка її».',
        },
      ],
      options: [
        {
          id: 'quiet-manuscript-archive',
          label: 'Зберегти аркуш у книгарні до нових відомостей',
          next: 'quiet-manuscript-result',
          grants: ['final_quiet_manuscript_archived'],
        },
        {
          id: 'quiet-manuscript-return',
          label: 'Передати аркуш Айріс',
          next: 'quiet-manuscript-result',
          grants: ['final_quiet_manuscript_returned'],
        },
      ],
    },
    {
      id: 'quiet-manuscript-result',
      speaker: 'Айріс',
      text: '«Дякую, що не зробив із цього виставу». Вона відсуває альбом від Френка.',
      textWhen: [
        {
          requires: ['final_quiet_manuscript_archived'],
          text: '«Покладемо аркуш у конверт і запишемо лише дату знахідки». Айріс бере ручку.',
        },
        {
          requires: ['final_quiet_manuscript_returned'],
          text: 'Айріс ховає аркуш між сторінками альбому. «Якщо захочу продовжити пошуки, я прийду».',
        },
      ],
      options: [
        {
          id: 'quiet-manuscript-result-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_quiet_manuscript_followup'],
        },
      ],
    },
    {
      id: 'shared-table',
      speaker: 'Анна',
      text: 'Анна кладе на стіл книжку без обкладинки. «Мої учні сперечалися, чи можна розповідати історію друга, якщо вона здається повчальною. Один сказав: якщо історія правдива, значить, можна. Інша відповіла: правда не робить її твоєю». Мара відсуває чашку. «А якщо мовчання теж когось ранить?»',
      options: [
        {
          id: 'shared-table-consent',
          label: '«Спершу запитати людину, чи хоче вона цієї розмови»',
          next: 'shared-table-answer',
          grants: ['final_shared_table_consent'],
        },
        {
          id: 'shared-table-accountability',
          label: '«Визнати власну помилку, не розкриваючи чужої таємниці»',
          next: 'shared-table-answer',
          grants: ['final_shared_table_accountability'],
        },
        {
          id: 'shared-table-uncertainty',
          label: '«Іноді чесно сказати, що ми знаємо не все»',
          next: 'shared-table-answer',
          grants: ['final_shared_table_uncertainty'],
        },
      ],
    },
    {
      id: 'shared-table-answer',
      speaker: 'Нора',
      text: '«Я працюю з архівами, але жоден документ не дає мені права вирішувати за живу людину», — каже Нора. Елеонора підсуває до столу ще один стілець. Ніхто не оголошує переможця суперечки.',
      textWhen: [
        {
          requires: ['final_shared_table_consent'],
          text: '«Я ще не вирішила, чи показувати лист», — каже Айріс. Лео відкриває рота, але зупиняється. «Гаразд. Тоді не сьогодні». Мара підсуває їм тарілку: «Хоч булочку візьміть, поки не охолола».',
        },
        {
          requires: ['final_shared_table_accountability'],
          text: 'Пані Міллер повільно закриває книжку. «Я можу сказати, що помилилася, не називаючи тих, про кого пліткувала». Томас відповідає: «Вибачення не стирає наслідків. Але принаймні не створює нових».',
        },
        {
          requires: ['final_shared_table_uncertainty'],
          text: '«У мене досі немає афіші старого кінотеатру», — каже Нора. Анна згадує, що в шкільній комірчині лежить коробка з газетами. Елеонора підсуває їм олівець: «Запишіть, бо завтра забудете».',
        },
      ],
      options: [
        {
          id: 'shared-table-return',
          label: 'Повернутися до спільного читання',
          next: 'gathering',
          grants: ['final_shared_table_heard'],
        },
      ],
    },
    {
      id: 'mara-callback',
      speaker: 'Мара',
      text: '«Сьогодні я вперше закрила пекарню вчасно. І знаєш що? Ніхто не помер без останнього круасана». Мара підморгує. «Тільки начальниці не кажи, що мені сподобалося».',
      options: [
        {
          id: 'mara-callback-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_mara_heard'],
        },
      ],
    },
    {
      id: 'eleanor-memory',
      speaker: 'Елеонора',
      text: '«Хтось переставив мої книжки за кольором обкладинок», — бурчить Елеонора. «Якщо це була пані Міллер, передай їй: у мене детективи стоять за авторами. І так буде, поки я тут господиня».',
      options: [
        {
          id: 'eleanor-memory-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_eleanor_heard'],
        },
      ],
    },
    {
      id: 'leo-memory',
      speaker: 'Лео',
      text: '«Мара принесла карту узбережжя. Я досі не купив квитки». Лео розгортає її просто на столі. «Можеш сміятися, але ми вже посварилися, де краще снідати. До моря ще навіть не доїхали».',
      options: [
        {
          id: 'leo-memory-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_leo_heard'],
        },
      ],
    },
    {
      id: 'miller-memory',
      speaker: 'Пані Міллер',
      text: '«Я сьогодні нікого не розпитувала про чужі листи», — гордо оголошує пані Міллер. «Зате Анна сама розповіла, де підстриглася. Я записала адресу».',
      options: [
        {
          id: 'miller-memory-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_miller_heard'],
        },
      ],
    },
    {
      id: 'anna',
      speaker: 'Анна',
      text: '«Учні вигадали назву для нашої полиці: “Історії, які не поспішають”. І попросили залишити місце для книжок, які їм не сподобалися. Кажуть, про них теж цікаво сперечатися».',
      options: [
        {
          id: 'anna-maps',
          label: '«Мапи справді допомогли їм шукати власні дороги»',
          next: 'anna-maps',
          requires: ['anna_chose_maps'],
        },
        {
          id: 'anna-mystery',
          label: '«Детектив навчив їх перевіряти здогади»',
          next: 'anna-mystery',
          requires: ['anna_chose_mystery'],
        },
        {
          id: 'anna-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_anna_club_heard'],
        },
      ],
    },
    {
      id: 'anna-maps',
      speaker: 'Анна',
      text: '«Так! Один учень намалював маршрут до бібліотеки, а поруч підписав: “Тут можна передумати”. Мені здається, він зрозумів книжку краще за мене».',
      options: [
        {
          id: 'maps-back',
          label: 'Посміхнутися й повернутися до гостей',
          next: 'gathering',
          grants: ['final_anna_club_heard'],
        },
      ],
    },
    {
      id: 'anna-mystery',
      speaker: 'Анна',
      text: '«Вони навіть склали правила: не називати людину винною, доки не вислухали її. Пані Міллер запропонувала додати це до правил клубу».',
      options: [
        {
          id: 'mystery-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_anna_club_heard'],
        },
      ],
    },
    {
      id: 'anna-classroom-callback',
      speaker: 'Анна',
      text: '«У класі досі сперечаються про острів. Я вже перестала рахувати, хто за кого. Зате сьогодні вперше почула, як Джуліан сказав Еммі: “Я не згоден, але покажи, де ти це прочитала”». Анна підсовує вам закладку з намальованим маяком.',
      textWhen: [
        {
          requires: ['anna_classroom_debate_encouraged'],
          text: '«Ми влаштували дебати. Емма говорила про корабель, Джуліан — про маяк. Вони не помирилися в поглядах, зате вперше дослухали один одного до кінця. А тепер просять наступну книжку — ще суперечливішу».',
        },
        {
          requires: ['anna_classroom_alternate_endings'],
          text: '«Емма намалювала втечу з острова, Джуліан — ціле місто навколо маяка. Потім вони помінялися аркушами й почали домальовувати деталі. Ніхто не відмовився від своєї кінцівки. Мені це подобається».',
        },
      ],
      options: [
        {
          id: 'anna-classroom-callback-back',
          label: 'Повернутися до вечора читань',
          next: 'gathering',
          grants: ['final_anna_classroom_heard'],
        },
      ],
    },
    {
      id: 'thomas-book-callback',
      speaker: 'Томас',
      text: '«Я повернув Анні роман. Не сказав, що полюбив його. Сказав, що він мене розсердив». Томас бере зі столу закладку. «Вона відповіла: “Нарешті ми можемо посперечатися не через список справ”».',
      textWhen: [
        {
          requires: ['thomas_book_ambiguity_accepted'],
          text: '«Я перечитав останню сторінку. Човен так і не відплив, а я вже не впевнений, що автор винен мені іншу кінцівку. Анна каже, це найкраща рецензія, яку я міг написати».',
        },
        {
          requires: ['thomas_book_ending_disputed'],
          text: '«Я й досі вважаю, що герой мав відплисти. Анна не погоджується. Учора ми сперечалися цілу вечерю, а потім вона попросила мене вибрати нашу наступну книжку. Небезпечна пропозиція».',
        },
      ],
      options: [
        {
          id: 'thomas-book-callback-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_thomas_book_heard'],
        },
      ],
    },
    {
      id: 'rumor',
      speaker: 'Пані Міллер',
      text: '«Я тоді бачила Томаса біля центру, — каже пані Міллер. — І вже встигла всім розповісти, з ким він нібито зустрічається». Нора мовчки ставить перед нею чашку. Міллер зітхає: «Так, знаю. Я наговорила зайвого».',
      textWhen: [
        {
          requires: ['rumor_challenged'],
          text: 'Пані Міллер помічає вас і ніяково поправляє окуляри. «Пам’ятаєте, ви сказали мені, що я нічого не довела? Тоді я образилася. Тепер думаю, що ви просто попросили мене відрізнити те, що я бачила, від того, що собі уявила. Я ще маю виправити шкоду, але хоча б не хочу повторювати цю історію». Нора киває: «Почати з цього — вже чесніше, ніж удавати, ніби нічого не сталося».',
        },
      ],
      options: [
        {
          id: 'rumor-respect',
          label: '«Не повторюймо історію — зупинімо її поширення»',
          next: 'rumor-respect',
        },
        {
          id: 'rumor-apology',
          label: '«Визнаймо помилку перед тими, кому ти її переказала»',
          next: 'rumor-apology',
        },
      ],
    },
    {
      id: 'rumor-respect',
      speaker: 'Пані Міллер',
      text: '«Норі я вже сказала, що переплутала свої здогади з фактами». Пані Міллер мнеться біля дверей. «А Томасу ще ні. Він сьогодні тут? Може, хоч не доведеться дзвонити йому додому».',
      options: [
        {
          id: 'rumor-respect-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_respected_privacy'],
        },
      ],
    },
    {
      id: 'rumor-apology',
      speaker: 'Пані Міллер',
      text: '«Я вже сказала двом сусідам, що помилилася. Одна лише знизала плечима, а другий запитав, чому я не перевірила раніше». Пані Міллер кривиться. «Тепер ще Томасу пояснювати. Він має повне право розсердитися».',
      options: [
        {
          id: 'rumor-apology-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_repaired_rumor'],
        },
      ],
    },
    {
      id: 'rumor-player-accountability',
      speaker: 'Оповідач',
      text: 'Анна ставить на стіл коробку із закладками. Томас допомагає їй, але не намагається говорити за неї. Ви підходите, коли поруч немає інших гостей.',
      textWhen: [
        {
          requires: ['anna_heard_rumor_admission', 'thomas_heard_rumor_apology'],
          text: 'Анна й Томас уже чули ваші вибачення окремо. Тепер ви зустрічаєтеся біля столу з дитячими закладками. Ніхто не пропонує почати все з чистого аркуша.',
        },
        {
          requires: ['anna_heard_rumor_admission'],
          text: 'Анна вже знає, що ви підтримали плітку. Томас мовчки допомагає їй розкладати закладки. Він не знає, про що ви говорили з Анною.',
        },
        {
          requires: ['thomas_heard_rumor_apology'],
          text: 'Томас уже почув ваше вибачення. Анна розкладає дитячі закладки й не знає, що саме ви йому сказали.',
        },
      ],
      options: [
        {
          id: 'rumor-own-public',
          label: '«Я підтримав чутку. Не прошу вас мене заспокоювати»',
          next: 'rumor-player-own-public',
          unless: ['final_player_rumor_owned'],
          grants: ['final_player_rumor_owned'],
        },
        {
          id: 'rumor-ask-boundary',
          label: '«Не хочу знову говорити за вас. Чи варто мені піти?»',
          next: 'rumor-player-boundary',
          grants: ['final_player_rumor_respected_distance'],
        },
        {
          id: 'rumor-player-step-away',
          label: 'Не переривати їхню розмову',
          next: 'gathering',
          grants: ['final_player_rumor_accountability'],
        },
      ],
    },
    {
      id: 'rumor-player-own-public',
      speaker: 'Анна',
      text: '«Я чула, що ви сказали. Мені не потрібна нова історія про те, як гарно хтось вибачився». Томас кладе останню закладку на стіл. «І не треба доводити, що ми щасливі, — додає він. — Ми самі розберемося, як нам бути».',
      textWhen: [
        {
          requires: ['anna_heard_rumor_admission', 'thomas_heard_rumor_apology'],
          text: '«Ви вже вибачилися перед нами обома, — каже Анна. — Це не робить вас нашим посередником». Томас киває. «Ми можемо поговорити без свідків. Це все, чого я зараз хочу».',
        },
        {
          requires: ['anna_rumor_pressed'],
          text: '«Ви вже наполягали, що знаєте, що мені потрібно, — каже Анна. — Будь ласка, не робіть цього знову». Томас мовчить; його мовчання не означає згоди з жодною версією чутки.',
        },
      ],
      options: [
        {
          id: 'rumor-player-own-return',
          label: 'Відійти й залишити їм право на власну розмову',
          next: 'gathering',
          grants: ['final_player_rumor_accountability'],
        },
      ],
    },
    {
      id: 'rumor-player-boundary',
      speaker: 'Анна',
      text: '«Так, зараз краще дати нам трохи місця». Вона говорить без злості. Томас запитує, чи принести ще чаю; Анна відповідає, що спершу хоче закінчити розкладати книжки. Невелика, звичайна розмова, яка належить тільки їм.',
      options: [
        {
          id: 'rumor-player-boundary-return',
          label: 'Повернутися до інших гостей',
          next: 'gathering',
          grants: ['final_player_rumor_accountability'],
        },
      ],
    },
    {
      id: 'rumor-miller-followup',
      speaker: 'Пані Міллер',
      text: '«Знаєте, що найдурніше? Я ж справді бачила Томаса з жінкою. Тільки от я не знаю ні її імені, ні про що вони говорили. А переповідала так, ніби сиділа між ними». Вона розгортає загорнуту в серветку цукерку. «Хочете? Не купувала їх для спокути. Просто люблю м’ятні».',
      textWhen: [
        {
          requires: ['rumor_amplified'],
          text: '«Ми тоді обоє добре попрацювали язиками, правда?» — пані Міллер простягає м’ятну цукерку. «Я бачила Томаса з жінкою. Не знаю, хто вона. А тепер половина міста має власну версію. І не кожен слухатиме, коли я скажу, що помилилася».',
        },
        {
          requires: ['rumor_challenged'],
          text: '«Ви ще тоді сказали, що я нічого не довела. Я злилася, бо думала, що ви називаєте мене брехухою». Міллер відгортає край серветки. «А я ж справді бачила двох людей. Просто не знала, що відбувалося між ними».',
        },
      ],
      options: [
        {
          id: 'rumor-miller-listen',
          label: '«А якщо пані Міллер знову почне розповідати це сусідам?»',
          next: 'rumor-miller-answer',
        },
        {
          id: 'rumor-miller-candy',
          label: 'Взяти цукерку й поговорити про книжки',
          next: 'rumor-miller-books',
        },
      ],
    },
    {
      id: 'rumor-miller-answer',
      speaker: 'Пані Міллер',
      text: '«Скажу: я бачила, як вони вийшли з будівлі. Решта — мої здогади». Вона зітхає. «А якщо мене не послухають, то принаймні не підкидатиму їм нових подробиць. До речі, ви вже читали той детектив, де вбивця виявився бібліотекарем? Ні? Тоді я мовчу».',
      options: [
        {
          id: 'rumor-miller-answer-return',
          label: 'Повернутися до вечора читань',
          next: 'gathering',
          grants: ['final_miller_private_followup'],
        },
      ],
    },
    {
      id: 'rumor-miller-books',
      speaker: 'Пані Міллер',
      text: '«От бачите, книжки — безпечніші. Хоча я б посперечалася». Вона дістає з торби «Ніхто не знає кінцівки» й постукує пальцем по обкладинці. «Тут кожен свідок певен, що має рацію. Я сміялася, доки не впізнала себе».',
      options: [
        {
          id: 'rumor-miller-books-return',
          label: 'Запропонувати їй місце біля столу',
          next: 'gathering',
          grants: ['final_miller_private_followup'],
        },
      ],
    },
    {
      id: 'iris',
      speaker: 'Айріс',
      text: '«Я принесла п’ять малюнків, але місця на стіні вистачить тільки для трьох». Айріс розгортає папку. «Пані Міллер уже попросила один для себе. Навіть не запитала, чи продаю я їх».',
      options: [
        {
          id: 'iris-exhibit',
          label: '«Влаштуймо маленьку виставку»',
          next: 'exhibit',
          requires: ['iris_offered_exhibition'],
        },
        {
          id: 'iris-choice',
          label: '«Може, залишиш кілька малюнків у книгарні?»',
          next: 'gathering',
          grants: ['final_supported_iris'],
        },
      ],
    },
    {
      id: 'exhibit',
      speaker: 'Айріс',
      text: '«Тоді повісимо ось ці три. Назву “Вікна Беллвіка” напишу сама». Айріс відступає на крок. «Тільки рівень знайдіть, будь ласка. Минулого разу все висіло криво».',
      options: [
        {
          id: 'exhibit-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_iris_exhibition'],
        },
      ],
    },
    {
      id: 'letter',
      variantSelection: 'authored',
      speaker: 'Оповідач',
      text: 'На прилавку лежить старий конверт. Айріс дивиться на нього, але не бере. Лео біля вікна розмовляє з Марою. «Поклади поки за касу», — тихо просить Айріс.',
      textWhen: [
        {
          requires: ['opened_private_letter', 'iris_letter_breach_admitted'],
          text: 'На конверті видно порушену печатку. Айріс знає, хто його відкрив. Вона переставляє конверт подалі від гостей і коротко каже: «Не зараз». Лео не підходить.',
        },
        {
          requires: ['opened_private_letter'],
          text: 'Печатка на конверті порушена. Айріс помічає зім’ятий край і питає: «Що з ним сталося?» Поруч гості сперечаються про детектив, але її цікавить тільки відповідь.',
        },
        {
          requires: ['leo_day_four_chose_honesty', 'mara_day_four_named_own_needs'],
          text: 'Старий конверт лежить на прилавку. Лео й Мара тихо сперечаються, хто забув квитки. Айріс торкається конверта пальцем і просить не передавати його нікому без неї.',
        },
        {
          requires: ['saw_envelope'],
          text: 'Старий лист досі запечатаний. Айріс і Лео стоять біля вікна, але ніхто не поспішає передавати конверт без її згоди. Поруч Мара обирає книжку для наступного читання.',
        },
      ],
      options: [
        {
          id: 'mutual',
          label: 'Запропонувати приватну розмову, якщо обоє згодні',
          next: 'mutual',
          requires: ['iris_letter_choice_respected', 'leo_open_to_conversation'],
          unless: ['opened_private_letter'],
        },
        {
          id: 'admit-breach-now',
          label: '«Айріс, я відкрив конверт без твого дозволу»',
          next: 'admit-breach-now',
          requires: ['opened_private_letter'],
          unless: ['iris_letter_breach_admitted', 'final_letter_breach_disclosed'],
        },
        {
          id: 'repair-trust',
          label: 'Визнати порушення довіри й залишити рішення Айріс',
          next: 'repair-trust',
          requires: ['iris_letter_breach_admitted'],
        },
        { id: 'wait', label: 'Залишити конверт Айріс і не квапити нікого', next: 'wait' },
        {
          suspend: true,
          repeatability: 'repeatable',
          id: 'letter-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
        },
      ],
    },
    {
      id: 'mutual',
      speaker: 'Оповідач',
      text: 'Айріс і Лео виходять у тихий внутрішній дворик. Мара знає, що вони вирішили поговорити, і не просить переказувати їй чужі слова. Коли вони повертаються, ніхто не ставить запитань. Деякі розмови важливі саме тому, що залишаються приватними.',
      options: [
        {
          id: 'mutual-back',
          label: 'Дати їм простір і повернутися до гостей',
          next: 'gathering',
          grants: ['final_mutual_conversation'],
        },
      ],
    },
    {
      id: 'admit-breach-now',
      speaker: 'Айріс',
      text: 'Айріс дивиться на зім’яту печатку. «Ти мав сказати раніше. Я не знаю, чи змогла б знову довірити тобі щось особисте». Лео робить крок до них, але вона зупиняє його поглядом. «Це розмова між мною й тобою. Я сама вирішу, що робити далі».',
      options: [
        {
          id: 'admit-breach-now-back',
          label: '«Я не вимагатиму пробачення. Конверт залишиться тобі»',
          next: 'gathering',
          grants: ['final_letter_breach_disclosed', 'final_accepted_consequences'],
        },
      ],
    },
    {
      id: 'repair-trust',
      speaker: 'Айріс',
      text: '«Я почула твої вибачення», — каже Айріс, не дивлячись на вас. «Але більше не бери мої речі без дозволу. Конверт залиш мені».',
      options: [
        {
          id: 'repair-trust-back',
          label: '«Я розумію. Не вимагатиму відповіді»',
          next: 'gathering',
          grants: ['final_accepted_consequences'],
        },
      ],
    },
    {
      id: 'wait',
      speaker: 'Айріс',
      text: '«Поклади його в шухляду за касою, будь ласка», — просить Айріс. «Я заберу після вечора. Зараз не хочу, щоб Лео побачив мене з ним».',
      options: [
        {
          id: 'wait-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_letter_kept_private'],
        },
      ],
    },
    {
      id: 'leo-reflection-callback',
      speaker: 'Лео',
      text: '«Я перевірив розклад двічі. Потім Мара сказала, що ми все одно йдемо пішки». Лео знизує плечима. «Мабуть, так навіть швидше».',
      textWhen: [
        {
          requires: ['leo_chose_listening'],
          text: '«Я нарешті запитав, що потрібно іншій людині, а не склав за неї план. Відповідь була несподівана: просто послухати». Лео ніяково усміхається.',
        },
        {
          requires: ['leo_accepted_silence'],
          text: '«Учора ми мовчали поруч майже годину. І вперше я не сприйняв це як запізнення, яке треба надолужити». Лео дивиться на вікно.',
        },
      ],
      options: [
        {
          id: 'leo-reflection-back',
          label: 'Повернутися до спільного читання',
          next: 'gathering',
          grants: ['final_leo_reflection_heard'],
        },
      ],
    },
    {
      id: 'iris-reflection-callback',
      speaker: 'Айріс',
      text: '«Я принесла ще три малюнки. Тільки, будь ласка, не ставте їх біля батареї — минулого разу папір скрутився».',
      textWhen: [
        {
          requires: ['iris_chose_open_art'],
          text: '«Я не встигла домалювати дах на останньому малюнку. Пані Міллер вже запитала, чи це новий стиль». Айріс усміхається. «Сказала, що просто закінчилася синя фарба».',
        },
        {
          requires: ['iris_chose_private_art'],
          text: '«Мої малюнки сьогодні тут, а моя біографія — ні. Дивно приємно, коли люди питають про колір, а не про причини від’їзду».',
        },
      ],
      options: [
        {
          id: 'iris-reflection-back',
          label: 'Повернутися до спільного читання',
          next: 'gathering',
          grants: ['final_iris_reflection_heard'],
        },
      ],
    },
    {
      id: 'anna-reflection-callback',
      speaker: 'Анна',
      text: '«Сьогодні книжки для клубу розклали без мене. Виявляється, іншим теж можна довіряти».',
      textWhen: [
        {
          requires: ['anna_will_apologize_to_student'],
          text: '«Я вибачилася перед ученицею. Вона сказала, що їй досі не подобається фінал. І це була наша перша по-справжньому чесна розмова про книжку».',
        },
        {
          requires: ['anna_will_invite_disagreement'],
          text: '«Сьогодні діти посварилися через фінал роману. Половина класу хотіла, щоб героїня залишилася з принцом, решта — щоб поїхала на драконі». Анна сміється. «Я за дракона».',
        },
      ],
      options: [
        {
          id: 'anna-reflection-back',
          label: 'Повернутися до спільного читання',
          next: 'gathering',
          grants: ['final_anna_reflection_heard'],
        },
      ],
    },
    {
      id: 'thomas-reflection-callback',
      speaker: 'Томас',
      text: '«Я запитав, чи потрібна допомога, замість того щоб одразу щось лагодити. Це виявилося складніше».',
      textWhen: [
        {
          requires: ['thomas_will_ask_before_helping'],
          text: '«Я запитав Анну, чого вона хоче. Вона попросила мене просто посидіти поруч. Я вперше нічого не лагодив — і не відчув, що підвів її».',
        },
        {
          requires: ['thomas_admitted_fear_of_rejection'],
          text: '«Я сказав Анні, що іноді боюся стати непотрібним. Вона не пообіцяла, що все буде легко. Але ми нарешті говорили не про зламані речі».',
        },
      ],
      options: [
        {
          id: 'thomas-reflection-back',
          label: 'Повернутися до спільного читання',
          next: 'gathering',
          grants: ['final_thomas_reflection_heard'],
        },
      ],
    },
    {
      id: 'nora-reflection-callback',
      speaker: 'Нора',
      text: '«Якщо знайдете афішу кінотеатру, занесіть до центру. І бажано не о шостій ранку — минулого разу мене розбудили дзвінком».',
      textWhen: [
        {
          requires: ['nora_will_preserve_uncertainty'],
          text: '«У каталозі тепер три різні дати відкриття кінотеатру». Нора хитає головою. «Пані Міллер принесла четверту. Каже, що точно пам’ятає, бо тоді купила нові туфлі».',
        },
        {
          requires: ['nora_will_seek_consent'],
          text: '«Я запитала, чи можна виставити старі записи. Дехто відмовив. І знаєш, після цього архів не став біднішим — він став чеснішим».',
        },
      ],
      options: [
        {
          id: 'nora-reflection-back',
          label: 'Повернутися до спільного читання',
          next: 'gathering',
          grants: ['final_nora_reflection_heard'],
        },
      ],
    },
    {
      id: 'eleanor-reflection-callback',
      speaker: 'Елеонора',
      text: '«Полицю переставили без мене. І знаєш, світ не завалився. Навіть стало затишніше».',
      textWhen: [
        {
          requires: ['eleanor_will_keep_shared_memory'],
          text: '«Ми зробили одну полицю пам’яті. На ній стоять книжки, яких я ніколи не читала. Мені подобається, що вона вже не тільки моя».',
        },
        {
          requires: ['eleanor_will_allow_change'],
          text: '«Я допомогла переставити улюблений куточок. Тепер там сидять люди, які не знали мене молодою. Мабуть, це і є майбутнє книгарні».',
        },
      ],
      options: [
        {
          id: 'eleanor-reflection-back',
          label: 'Повернутися до спільного читання',
          next: 'gathering',
          grants: ['final_eleanor_reflection_heard'],
        },
      ],
    },
    {
      id: 'frank-evening',
      speaker: 'Оповідач',
      text: 'Френк, маленький сірий девон-рекс, сидить на підвіконні й стежить за краплями. Коли Мара ставить поряд тарілку з булочками, він негайно втрачає інтерес до дощу.',
      options: [
        {
          id: 'frank-sit',
          label: 'Сісти поруч і нічого не пояснювати',
          next: 'frank-silence',
        },
        {
          id: 'frank-pet',
          label: 'Почухати Френка за вухом',
          next: 'frank-trust',
        },
      ],
    },
    {
      id: 'frank-silence',
      speaker: 'Оповідач',
      text: 'Френк вмощується ближче й кладе лапу просто на розгорнуту сторінку. За вікном дощ, у кімнаті сперечаються про книжки. Спроба перегорнути сторінку закінчується обуреним нявканням.',
      options: [
        {
          id: 'frank-silence-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_frank_evening_heard', 'bookseller_chose_silence'],
        },
      ],
    },
    {
      id: 'frank-trust',
      speaker: 'Оповідач',
      text: 'Кіт мружиться й довірливо підставляє голову. Йому не потрібні обіцянки назавжди — лише тепла долоня зараз. Ти згадуєш, скільки разів за ці дні люди просили саме цього: не рішення, а присутності.',
      options: [
        {
          id: 'frank-trust-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_frank_evening_heard', 'bookseller_chose_presence'],
        },
      ],
    },
    {
      id: 'bookseller-reflection',
      speaker: 'Оповідач',
      text: 'У старому зошиті для замовлень залишилася чиста сторінка. На попередній — три замовлення, одне закреслене й пляма від кави. Френк уже намагається вмоститися просто на зошиті.',
      options: [
        {
          id: 'bookseller-truth',
          label: '«А Томас знає, що про нього розповідали?»',
          next: 'bookseller-truth',
        },
        {
          id: 'bookseller-care',
          label: '«Мара вже поговорила з Лео про той квиток?»',
          next: 'bookseller-care',
        },
        {
          id: 'bookseller-change',
          label: '«Елеонора вже бачила нові полиці біля вікна?»',
          next: 'bookseller-change',
        },
      ],
    },
    {
      id: 'bookseller-truth',
      speaker: 'Оповідач',
      text: 'Ти записуєш: «Замовити нові закладки. Повернути Норі каталог. Купити корм Френку». Останній пункт доводиться підкреслити двічі: Френк голосно нагадує про вечерю.',
      options: [
        {
          id: 'bookseller-truth-back',
          label: 'Закрити зошит',
          next: 'gathering',
          grants: ['final_bookseller_reflection_heard', 'bookseller_values_consent'],
        },
      ],
    },
    {
      id: 'bookseller-care',
      speaker: 'Оповідач',
      text: 'Ти пишеш: «Турбота починається із запитання, а не з готового плану». Це не обіцянка ніколи не помилятися. Лише нагадування слухати, перш ніж допомагати.',
      options: [
        {
          id: 'bookseller-care-back',
          label: 'Закрити зошит',
          next: 'gathering',
          grants: ['final_bookseller_reflection_heard', 'bookseller_values_agency'],
        },
      ],
    },
    {
      id: 'bookseller-change',
      speaker: 'Оповідач',
      text: 'Ти пишеш: «Місце залишається живим, доки в ньому є місце для нових людей». І раптом розумієш, що це стосується не тільки книгарні.',
      options: [
        {
          id: 'bookseller-change-back',
          label: 'Закрити зошит',
          next: 'gathering',
          grants: ['final_bookseller_reflection_heard', 'bookseller_values_change'],
        },
      ],
    },
    {
      id: 'day-four-iris-callback',
      speaker: 'Айріс',
      text: '«Я залишила чисту сторінку в альбомі. Не знаю, де намалюю наступне вікно, але більше не соромлюся цього».',
      textWhen: [
        {
          requires: ['iris_day_four_respected_freedom'],
          text: '«Я подала заявку на виставку в іншому місті. Можливо, поїду. І цього разу не називатиму від’їзд втечею».',
        },
        {
          requires: ['iris_day_four_supported_belonging'],
          text: '«Я залишила три малюнки. Один ще заберу додому — там пляма від кави, а я її не помітила». Айріс хитає головою.',
        },
      ],
      options: [
        {
          id: 'day-four-iris-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_day_four_iris_heard'],
        },
      ],
    },
    {
      id: 'day-four-mara-callback',
      speaker: 'Мара',
      text: '«Сьогодні я вперше прийшла не тому, що мене попросили. Просто хотіла бути тут».',
      textWhen: [
        {
          requires: ['mara_day_four_named_own_needs', 'leo_day_four_chose_honesty'],
          text: '«Ми з Лео нарешті поговорили про той квиток. Виявилося, він зберігав його в книжці й забув, де саме». Мара сміється. «Учора ми перевернули половину квартири».',
        },
        {
          requires: ['mara_day_four_chose_own_time'],
          text: '«Завтра пекарня працюватиме без мене. Я взяла вихідний і купила книжку для себе. Можеш уявити?»',
        },
        {
          requires: ['mara_day_four_named_own_needs'],
          text: '«Я сказала Лео, що мені потрібна не обіцянка ідеального майбутнього, а чесна розмова зараз. Він вислухав. Це вже багато».',
        },
      ],
      options: [
        {
          id: 'day-four-mara-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_day_four_mara_heard'],
        },
      ],
    },
    {
      id: 'day-four-leo-callback',
      speaker: 'Лео',
      text: '«Я знайшла стару фотографію нашого подвір’я. Там ще стоїть лавка, яку потім прибрали». Айріс усміхається. «Може, намалюю її з пам’яті».',
      textWhen: [
        {
          requires: ['leo_day_four_chose_honesty', 'mara_day_four_named_own_needs'],
          text: '«Мара сказала, що в неділю не працює. Я хотів одразу придумати нам маршрут, але вона попросила просто поснідати вдома». Лео всміхається. «Мабуть, зроблю млинці».',
        },
        {
          requires: ['leo_day_four_chose_honesty'],
          text: '«Ми з Марою поговорили. Я сказав, що іноді боюся власних спогадів. Вона не вимагала звіту. Ми просто залишилися поруч».',
        },
        {
          requires: ['leo_day_four_respected_privacy'],
          text: '«Я залишив старий квиток у книжці. Не як таємницю і не як обіцянку повернутися. Просто як частину свого життя».',
        },
      ],
      options: [
        {
          id: 'day-four-leo-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_day_four_leo_heard'],
        },
      ],
    },
    {
      id: 'final-v3-mara',
      speaker: 'Мара',
      text: '«Я відмовилася від ранкового замовлення й нарешті дочитала книжку». Мара сміється. «Щоправда, останній розділ мене так розлютив, що я мало не пішла скаржитися вам о восьмій ранку».',
      textWhen: [
        {
          requires: ['mara_discussed_forgiveness'],
          text: '«У четвер я не вийшла на додаткову зміну. Сем сам відкрив пекарню й навіть нічого не спалив». Мара сміється. «Я проспала до дев’ятої».',
        },
        {
          requires: ['mara_discussed_change'],
          text: '«У четвер я не відкрила пекарню. Сем надіслав фото першого дека — булочки кривуваті, зате цілі». Мара сміється. «Я відповіла тільки після сніданку».',
        },
      ],
      options: [
        {
          id: 'final-v3-mara-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_v3_mara_heard'],
        },
      ],
    },
    {
      id: 'final-v3-leo',
      speaker: 'Лео',
      text: '«Я три рази переписував повідомлення Марі, а потім просто подзвонив». Лео знизує плечима. «Виявилося, вона хотіла знати, чи я купив хліб».',
      textWhen: [
        {
          requires: ['leo_chose_listening'],
          text: '«Я приніс Марі список ресторанів. Вона сказала, що хоче піцу на виніс». Лео усміхається. «Ми нарешті замовили піцу, а не сперечалися про відгуки».',
        },
        {
          requires: ['leo_accepted_silence'],
          text: '«Ми сиділи на кухні й мовчали хвилин десять. Я вже хотів спитати, чи все гаразд, але Мара сама заговорила про подарунок». Лео всміхається. «Книжку я ще не дочитав».',
        },
      ],
      options: [
        {
          id: 'final-v3-leo-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_v3_leo_heard'],
        },
      ],
    },
    {
      id: 'final-v3-iris',
      speaker: 'Айріс',
      text: '«Я так хвилювалася перед виставкою, що двічі переплутала підписи». Айріс сміється. «Добре, що Анна помітила це до відкриття».',
      textWhen: [
        {
          requires: ['iris_exhibition_artist_controls'],
          text: '«Я вибрала три малюнки. Пані Міллер хотіла знати, чий будинок на другому, але потім десять хвилин розпитувала, як я малюю світло у вікнах». Айріс усміхається.',
        },
        {
          requires: ['iris_exhibition_private_choice'],
          text: '«Я повісила тільки один малюнок. Пані Міллер обійшла його тричі, перш ніж запитати, де я купила рамку». Айріс усміхається.',
        },
        {
          requires: ['iris_chose_open_art'],
          text: '«Один малюнок я не підписала. Пані Міллер вирішила, що там її будинок». Айріс сміється. «Це зовсім інша вулиця, але я не стала її засмучувати».',
        },
        {
          requires: ['iris_chose_private_art'],
          text: '«Я принесла п’ять малюнків, а повісила два. Решту забрала додому — один ще мокрий від фарби». Айріс поправляє рукав.',
        },
      ],
      options: [
        {
          id: 'final-v3-iris-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_v3_iris_heard'],
        },
      ],
    },
    {
      id: 'final-v3-anna',
      speaker: 'Анна',
      text: '«Спочатку обурилися. Потім принесли три різні книжки й почали сперечатися. Я не підсумувала за них. Здається, це був найкращий урок за місяць».',
      textWhen: [
        {
          requires: ['anna_will_apologize_to_student'],
          text: '«Я вибачилася перед ученицею, що поспішила відповісти замість неї. Вона сказала, що теж іноді боїться помилитися».',
        },
        {
          requires: ['anna_will_invite_disagreement'],
          text: '«Я попросила клас не погодитися зі мною. Спочатку всі мовчали, а потім ми ледве встигли до дзвінка».',
        },
      ],
      options: [
        {
          id: 'final-v3-anna-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_v3_anna_heard'],
        },
      ],
    },
    {
      id: 'final-v3-thomas',
      speaker: 'Томас',
      text: '«Я запитав Анну, чи потрібна допомога. Вона сказала: посиди зі мною. Я сидів. Незвично важка робота. Але вперше за довгий час не поспішав її закінчити».',
      textWhen: [
        {
          requires: ['thomas_will_ask_before_helping'],
          text: '«Я запитав Анну, чи потрібна їй допомога. Вона попросила просто побути поруч. Я не шукав іншого завдання».',
        },
        {
          requires: ['thomas_admitted_fear_of_rejection'],
          text: '«Я сказав Анні, що боюся бути зайвим. Вона не обіцяла, що все буде просто. Але ми нарешті говорили про нас».',
        },
      ],
      options: [
        {
          id: 'final-v3-thomas-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_v3_thomas_heard'],
        },
      ],
    },
    {
      id: 'final-v3-nora',
      speaker: 'Нора',
      text: '«У каталозі тепер три дати відкриття кінотеатру. Жодна поки не підтвердилася». Нора поправляє окуляри. «А приватні листи я повернула власниці».',
      textWhen: [
        {
          requires: ['nora_will_preserve_uncertainty'],
          text: '«Я записала всі три дати відкриття кінотеатру. Пані Міллер принесла четверту — каже, тоді купила червоні туфлі». Нора усміхається. «Тепер шукаємо старі фотографії».',
        },
        {
          requires: ['nora_will_seek_consent'],
          text: '«Я подзвонила власниці листів. Вона сказала, що показувати їх не хоче». Нора прибирає теку до сумки. «Зате пообіцяла пошукати стару афішу кінотеатру».',
        },
      ],
      options: [
        {
          id: 'final-v3-nora-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_v3_nora_heard'],
        },
      ],
    },
    {
      id: 'final-v3-eleanor',
      speaker: 'Елеонора',
      text: '«Ні, я досі чіпляюся за край столу, коли проходжу повз». Елеонора сміється. «Але сьогодні там цілу годину читала дівчинка, тож поки залишимо».',
      textWhen: [
        {
          requires: ['eleanor_will_keep_shared_memory'],
          text: '«Поставили нову полицю біля вікна. Уже лежать три книжки й чийсь забутий шарф». Елеонора дивиться на Френка. «Тільки не роби з неї лежанку».',
        },
        {
          requires: ['eleanor_will_allow_change'],
          text: '«Я сама запропонувала пересунути стіл до вікна. Спершу думала, що там буде протяг, а потім принесла лампу». Елеонора усміхається.',
        },
      ],
      options: [
        {
          id: 'final-v3-eleanor-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_v3_eleanor_heard'],
        },
      ],
    },
    {
      id: 'final-couple-conversation',
      speaker: 'Мара',
      text: '«Завтра я хочу виспатися й поснідати сама, — каже Мара. — Без будильника і без твоїх маршрутів». Лео біля вікна складає карту навпіл.',
      options: [
        { id: 'final-couple-ask', label: '«І що ти відповів, Лео?»', next: 'final-couple-leo' },
        { id: 'final-couple-respect', label: 'Залишити їм простір', next: 'final-couple-close' },
      ],
    },
    {
      id: 'final-couple-leo',
      speaker: 'Лео',
      text: '«Я вже хотів спитати, о котрій їй зручно прокинутися». Лео ніяково усміхається. «Але це ж безглуздо, правда? Маро, може, зустрінемося після обіду?»',
      options: [
        { id: 'final-couple-mara', label: 'Послухати Мару', next: 'final-couple-mara' },
        { id: 'final-couple-pause', label: 'Не втручатися далі', next: 'final-couple-close' },
      ],
    },
    {
      id: 'final-couple-mara',
      speaker: 'Мара',
      text: '«Після обіду — добре. Тільки не бронюй нічого до мого дзвінка». Мара підморгує. Лео прибирає телефон у кишеню.',
      options: [
        {
          id: 'final-couple-finish',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_couple_conversation_heard'],
        },
      ],
    },
    {
      id: 'final-couple-close',
      speaker: 'Оповідач',
      text: 'Ти відходиш до полиці з детективами. За спиною Мара сміється: «Ні, Лео, на сніданок нам точно не потрібна таблиця!»',
      options: [
        {
          id: 'final-couple-close-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_couple_conversation_heard'],
        },
      ],
    },
    {
      id: 'final-couple-anna-thomas',
      speaker: 'Анна',
      text: '«Томас обіцяв занести стільці до класу, але запізнився». Анна зітхає. «Діти сиділи на підлозі й удавали, що це пікнік. Вони, здається, були щасливіші за мене».',
      textWhen: [
        {
          requires: ['thomas_chairs_owned_mistake'],
          text: 'Анна поправляє стопку книжок. «Томас подзвонив і сказав про стільці. Я досі серджуся: мені довелося самій тягти їх на третій поверх. Але цього разу він не виправдовувався замовленнями. Запитав, що зробити, щоб наступного разу не залишити мене саму».',
        },
        {
          requires: ['thomas_chairs_avoided_conversation'],
          text: 'Анна дивиться на Томаса через край книжки. «Він пропонував купити нові стільці. А я хотіла, щоб він просто попередив, що не прийде. Ми ще не поговорили про це до кінця». Томас не сперечається, але й не знаходить відповіді.',
        },
      ],
      options: [
        { id: 'final-at-listen', label: '«А що сказав Томас?»', next: 'final-couple-thomas' },
        {
          id: 'final-at-leave',
          label: 'Дати їм поговорити наодинці',
          next: 'final-couple-at-close',
        },
      ],
    },
    {
      id: 'final-couple-thomas',
      speaker: 'Томас',
      text: '«Я неправильно записав час доставки, — каже Томас. — Хотів усе виправити новими стільцями, але Анна попросила просто попереджати заздалегідь». Анна киває. «Оце вже ближче».',
      options: [
        { id: 'final-at-more', label: '«І яку книжку ви обрали?»', next: 'final-couple-at-book' },
        { id: 'final-at-done', label: 'Повернутися до гостей', next: 'final-couple-at-close' },
      ],
    },
    {
      id: 'final-couple-at-book',
      speaker: 'Анна',
      text: '«Ту, де герої сперечаються і все одно залишаються друзями. Я не знаю, чи ми погодимося з фіналом». Томас знизує плечима: «Зате прочитаємо разом».',
      options: [
        {
          id: 'final-at-book-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_anna_thomas_heard'],
        },
      ],
    },
    {
      id: 'final-couple-at-close',
      speaker: 'Оповідач',
      text: 'Вони залишаються біля полиці, сперечаючись про обкладинку. Цього разу ніхто не поспішає перемогти в суперечці.',
      options: [
        {
          id: 'final-at-close-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_anna_thomas_heard'],
        },
      ],
    },
    {
      id: 'final-iris-eleanor',
      speaker: 'Елеонора',
      text: '«Раніше тут висіли портрети засновників. Я знала кожне ім’я. Тепер Айріс принесла малюнки вікон, і я не знаю, кому вони належать». Вона трохи відступає, щоб побачити всю стіну.',
      options: [
        {
          id: 'final-ie-ask',
          label: '«Вам бракує старих портретів?»',
          next: 'final-iris-eleanor-answer',
        },
        {
          id: 'final-ie-space',
          label: 'Залишити їх облаштовувати виставку',
          next: 'final-ie-close',
        },
      ],
    },
    {
      id: 'final-iris-eleanor-answer',
      speaker: 'Елеонора',
      text: '«Так. Раніше тут висіла стара карта. Я до неї звикла». Елеонора торкається стіни. «А нові малюнки теж гарні. Треба тільки рівніше повісити крайній».',
      options: [{ id: 'final-ie-iris', label: 'Послухати Айріс', next: 'final-iris-eleanor-iris' }],
    },
    {
      id: 'final-iris-eleanor-iris',
      speaker: 'Айріс',
      text: '«Підпишу назви й роки, — каже Айріс. — Але адресу другого будинку не вказуватиму». Елеонора відходить на крок. «Добре. Тільки рамку трохи лівіше, будь ласка».',
      options: [
        {
          id: 'final-ie-done',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_iris_eleanor_heard'],
        },
      ],
    },
    {
      id: 'final-ie-close',
      speaker: 'Оповідач',
      text: 'Ти відходиш до столу з книжками. Елеонора ще раз поправляє стару фотографію книгарні поруч із малюнками Айріс. Рамка вперто висить криво.',
      options: [
        {
          id: 'final-ie-close-back',
          label: 'Повернутися до гостей',
          next: 'gathering',
          grants: ['final_iris_eleanor_heard'],
        },
      ],
    },
    ...bookshopTomorrowNodes,
    ...workshopPhotoNodes,
    ...caseClosureNodes,
    ...rumorProgramNodes,
    ...afterCaseTeaNodes,
    ...lastCopyNodes,
    {
      id: 'end',
      variantSelection: 'authored',
      speaker: 'Оповідач',
      text: 'Мара гасить свічку на столі, Елеонора зачиняє стару касу, а Анна залишає записку з датою наступної зустрічі. За вікном дощ розмиває світло ліхтарів. Френк застрибує на прилавок і зіштовхує на підлогу останню закладку.',
      textWhen: [
        {
          requires: ['final_letter_breach_disclosed'],
          text: 'Айріс забирає конверт і виходить раніше за інших. Вона почула правду, але не обіцяла пробачення. Лео не йде за нею: це не його рішення. Мара збирає чашки, Анна залишає записку про наступну зустріч, а Френк займає тепле місце біля каси. Завтра книгарня знову відчиниться, навіть якщо деякі розмови ще не завершені.',
        },
        {
          requires: ['final_mutual_conversation'],
          text: 'Мара гасить свічку, а Айріс і Лео повертаються з подвір’я. Ніхто не питає, про що вони говорили: довіра не потребує публічного звіту. Елеонора зачиняє касу, Анна залишає дату наступної зустрічі. У книгарні є майбутнє, бо люди самі вирішують, які історії розповідати.',
        },
        {
          requires: ['final_accepted_consequences'],
          text: 'Айріс іде додому з листом, не обіцяючи пробачення. Ви не намагаєтеся наздогнати її з поясненнями. Мара гасить свічку, Елеонора зачиняє касу. Книгарня залишиться відкритою завтра, але деякі стосунки відновлюються довше, ніж за п’ять днів.',
        },
        {
          requires: ['final_letter_kept_private'],
          text: 'Айріс забирає лист, не розгортаючи його при гостях. Лео не просить пояснень. Мара гасить свічку, Елеонора зачиняє касу, а Анна залишає дату наступної зустрічі. Історія книгарні триває: не кожна таємниця має стати відомою, щоб люди змогли рухатися далі.',
        },
        {
          requires: ['bookseller_values_consent', 'bookseller_chose_silence'],
          text: 'Після читання ти повертаєшся до зошита й дописуєш одне речення: «Мовчання теж може бути відповіддю». Френк спить на підвіконні, а за дверима стихають голоси. Ти не дізнався всіх чужих таємниць — і вперше не відчуваєш, що чогось бракує.',
        },
        {
          requires: ['bookseller_values_agency', 'bookseller_chose_presence'],
          text: 'Френк обережно торкається лапою твоєї долоні. Ти згадуєш, скільки разів хотів виправити чуже життя одним влучним рішенням. Тепер знаєш: іноді найкраща допомога — залишитися поруч і запитати, чого людина потребує. Завтра книгарня відчиниться знову.',
        },
        {
          requires: ['bookseller_values_change'],
          text: 'У зошиті лишається запис: «Не можна берегти місце, забороняючи йому змінюватися». Елеонора переставляє стілець для нового гостя, Анна забирає книжки до школи. Френк позіхає на підвіконні. Книгарня залишається собою саме тому, що в ній з’являється щось нове.',
        },
        {
          requires: ['final_repaired_rumor', 'final_iris_exhibition'],
          text: 'Пані Міллер першою вибачається за чутки, які розносила. Айріс тим часом поправляє табличку біля своїх малюнків: на ній лише назва виставки, без чужих пояснень. Елеонора гасить світло. У Беллвіку ще будуть помилки, але тепер є люди, готові їх визнавати.',
        },
        {
          requires: ['final_respected_privacy', 'final_supported_iris'],
          text: 'Пані Міллер стримує запитання, яке колись неодмінно поставила б уголос. Айріс забирає малюнки додому, і ніхто не називає це відмовою від друзів. Елеонора зачиняє касу. Книгарня стала місцем, де можна бути разом, не віддаючи іншим право вирішувати за себе.',
        },
      ],
      options: [],
    },
  ],
};
