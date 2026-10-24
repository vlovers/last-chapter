# LAST CHAPTER — Character & Dialogue Bible v1.0 (editorial specification)
Date: 2026-10-25
Status: DESIGN ONLY. None of the conversations below is implemented or playtested.

## Creative promise
A Ukrainian-language narrative bookshop game, not a collection of unrelated mini-games. The player can complete a visit in two minutes or spend 15–25 optional minutes discussing books, characters, ethics, and personal experiences with one returning customer. Conversations must be entertaining without yielding a quest item. Canonical narrative remains authored and works offline. No compulsory romance, timers, or daily-grind systems.

## Natali interview → explicit writing requirements
This is a creative preference matrix, not an in-world biography or a character based on Natali.
- Favorite reading worlds: Harry Potter (comfort, belonging, magic); Fourth Wing / Empyrean (Xaden, Violet, adventure, loyalty); ACOTAR / Двір шипів і троянд (Tamlin, Rhysand, Feyre, Nesta, Cassian); darker thrillers and romance including Verity, Haunting Adeline, My Dark Romeo, and Я бачу, вас цікавить пітьма. Discuss real books as books, never import their characters into the game's fictional reality.
- Favorite complex men: Tamlin and Xaden. Distinguish attraction, empathy, defense of conduct, and real-life relationship standards. No NPC may declare a player's preference morally wrong.
- Favorite women and couples: Nesta, My Dark Romeo's heroine; Nesta/Cassian, Xaden/Violet, Rhys/Feyre, Damon/Winter. Use debates about agency, growth, chemistry, trust, and earned vulnerability.
- Enjoyed tropes: enemies-to-lovers, grumpy/sunshine, forced proximity, fake dating, morally grey characters. Critical of friends-to-lovers, slow burn, touch-her-and-die possessiveness, he-falls-first, second-chance romance. NPCs must disagree convincingly; do not engineer all plots around preferred tropes.
- Desired emotional ranking: surprising twists > humor > mystery > romance > friendship > drama. Each chapter needs a fair-play reveal and relief beats; never substitute shock for causality.
- Gameplay preference: explore, find meaningful objects, complete occasional book requests, then linger in conversation. Cozy warm light, coffee, chocolate, flowers, comfortable reading nook, Frank the small grey Devon Rex.
- Choices: curiosity about sealed letters is a temptation, not consent; distinguish privacy violations from evidence gathering. Moral ambiguity must have consequences, not a single 'good' option.
- Reader engagement: strong dialogue, credible contradictory people, actions versus words, secrets with rational motives; conversations may end without agreement.
- Other interview answers should be added as verified mappings before claiming complete 25/25 coverage. Do not invent quotes or ratings for unverified answers.

## Core interaction: the conversation hub
For each returning character, topics belong to four layers:
1. **Light:** shop gossip, Frank, books, funny incidents, reading rituals.
2. **Book club:** opinionated discussion of actual books and literary themes.
3. **Personal:** memories and values unlocked through attention and trust.
4. **Plot:** optional investigation and required dramatic turning points.
Each topic has a hook, 3–5 distinct argument beats, 2–4 response choices per beat, at least one genuine counterargument, optional digressions, and a graceful exit. Player can return later; NPC recalls at least one meaningful stance, not just a generic affinity score.

## Flag contract (proposed)
Use stable topic IDs, not dialogue text, as save keys:
- discussed:acotar_tamlin_rhysand
- stance:tamlin:empathy | stance:tamlin:accountability | stance:tamlin:undecided
- stance:rhysand:double_standard | stance:rhysand:distinct_context
- discussed:fourth_wing_xaden
- stance:fiction_vs_reality:separate | stance:fiction_vs_reality:aligned
- discussed:hp:belonging
- memory:mara:debate_recalled
Avoid writing any one of these to the existing production save until versioned compatibility and flag limits are checked. Do not make agreement a prerequisite for friendship.

## Featured 15–20 minute conversation: Tamlin vs Rhysand
**Topic ID:** books.acotar.tamlin-rhysand
**Speaker:** Mara, bookseller's regular; sharp, funny, initially critical of Tamlin, also willing to critique Rhysand.
**Entry:** She sees an ACOTAR book and asks whether liking a fictional character is the same as approving their behavior.
**Beat A — Definitions (2–3 min):** Sympathy vs justification. Choices: 'He deserves understanding', 'His actions had consequences', 'Both'. Mara responds substantively to each.
**Beat B — The comparison (3–4 min):** Player raises Rhysand's choices and whether charisma biases readers. Mara distinguishes motives, autonomy, power, and consequences; she concedes one strong point without capitulating.
**Beat C — Why readers choose favorites (3 min):** Player can defend Tamlin, defend Rhysand, or reject the binary. Ask what people forgive in fiction versus life. Neither character is a quiz answer.
**Beat D — Other books (3–4 min):** Bridge to Xaden's guarded loyalty and the price of secrecy; optional contrast with Nesta's anger and growth. Player can also discuss why Harry Potter feels like home. This branch must be available without forcing the plot.
**Beat E — The personal mirror (3–4 min):** Mara admits she once confused being protected with being trusted. Do not reveal who or how yet. If player challenged her respectfully, she admits the question stayed with her; if not, she asks why they are so certain.
**Beat F — Return hook (1 min):** Two in-game days later she returns with a changed or reinforced argument and asks whether the player remembers their earlier position. This recall is authored and conditional, never fabricated by an LLM.
**Exit at every beat:** 'Повернімося до книжки, яку ти шукала' / 'Продовжимо іншим разом'. No missed reward or friendship penalty.

## Sample original Ukrainian lines (not a full scene)
МАРА: «Можна співчувати Тамліну й водночас не хотіти опинитися на місці людини, за яку він усе вирішує».
ГРАВЕЦЬ: «А Різанду читачі не пробачають схожі речі лише тому, що він харизматичний?»
МАРА: «Іноді пробачають. Але подвійні стандарти не роблять два вчинки однаковими. Давай розберемося, де саме вони схожі».
ГРАВЕЦЬ: «Мені подобаються складні герої. Це не означає, що я схвалюю їхні рішення».
МАРА: «Тоді ми вже сперечаємося не про те, кого любити, а про те, як читати. Це значно цікавіше».
[Later, conditional]
МАРА: «Пам’ятаєш нашу суперечку? Я тоді сказала, що захист і контроль легко переплутати. Мені довелося перевірити це не лише на сторінках».

## Other long-form debate topics
- Xaden vs 'trust requires full disclosure' (Fourth Wing); loyalty, secrets, context.
- Nesta vs 'unlikable heroine'; anger, trauma, responsibility, earned change.
- Rhys/Feyre vs Nesta/Cassian; chemistry, partnership, personal agency.
- Harry Potter as a comfort reread; chosen family, belonging, imperfect mentors.
- Fake dating vs friends-to-lovers; what makes a trope feel earned rather than predictable.
- Enemies-to-lovers and forced proximity; tension versus consent.
- Verity: unreliable narration, reading ethics, what counts as proof; avoid plot spoilers by default.
- Book-club spoiler consent: spoiler-free until the player explicitly opts in per title.
- Disliked tropes: characters may love second chances or slow burn and articulate why.

## Character ensemble — working placeholders, not locked canon
Mara: funny and opinionated; publicly confident, privately uneasy about a past relationship. Debates Tamlin/Rhysand.
Adrian: reserved collector; fiercely protective, conflates secrecy with responsibility. Discusses Xaden and trust.
Solomiia: warm and perceptive; gives others good advice, avoids asking for help. Discusses Nesta and agency.
Lev: acerbic author; says uncomfortable truths in fiction, lies by omission in life. Discusses Verity and unreliable narrators.
Eva: quiet, returns books; remembers tiny details, hides an important timeline discrepancy. Discusses mystery endings and reader assumptions.
Every character needs: public want, private need, flaw, self-deception, contradiction, personal boundaries, relationships with other NPCs, five-day arc, three independent life events, and at least one scene unrelated to the central mystery.

## Production quality gates
- Script and UI are Ukrainian; localization later only if commissioned.
- No copied passages, distinctive fictional scenes, cover art, or proprietary character designs from referenced books. Names and original critical discussion are acceptable editorial references; check spoilers and publication rights before release.
- No forced agreement, fake choice, hidden affinity punishment, or abrupt 'quest complete' after a serious conversation.
- Test short route (2 minutes) and deep route (15+ minutes) separately with word counts, choice-state coverage, return dialogue, spoiler toggles, accessibility, and save/reload.
- Target overall first-season time: 4–5h main, 7–9h optional deep reading, 10+h for replays. These are targets, not measured playtime.
- **Do not mark this feature implemented** until the dialogue engine, authored scene, localization review, and playtests are complete.

## Next implementation slice
1. Implement reusable topic hub and resume/exit navigation without altering mandatory 19-stage progression.
2. Author the full Tamlin/Rhysand scene at the above beat count, including distinct answers, counterarguments, and optional branches.
3. Persist selected opinions and topic completion in a versioned compatible save model.
4. Add return-visit callback and a spoiler opt-in control.
5. Run CI, test the 2-minute exit route and 15-minute discussion route on mobile, and editorial-review the Ukrainian.
