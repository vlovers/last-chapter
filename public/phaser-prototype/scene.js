import { WIDTH, HEIGHT, SPEED } from './config.js';
import { validateManifest, ASSET_MANIFEST } from './assets.js';
import { drawEnvironment } from './environment.js';
import { createAtmosphere } from './atmosphere.js';
import { createCharacters, updateCharacter } from './characters.js';
import { canStand, moveWithCollision, findPath, distance, eligible } from './world.js';
import { initialState, transition } from './state.js';
import { openDialogue, dialogueNode, chooseDialogue, validateDialogue } from './dialogue-state.js';
import { DialogueUI } from './dialogue-ui.js';
import { Interactions } from './interactions.js';
import { BookshopAudio } from './audio.js';
import { VISITOR_IDS } from './visitor-art.js';
import { visitorEntrance } from './visitor-entrances.js';
import { browsingRoute, visitorApproach, browsingAction } from './visitor-roaming.js';
import { pauseVisitor, resumeVisitor, shouldBrowse } from './visitor-lifecycle.js';

const $ = (selector) => document.querySelector(selector);

class Bookshop extends Phaser.Scene {
  constructor() {
    super('bookshop');
  }
  create() {
    try {
      this.initialize();
    } catch (error) {
      this.fail(error);
    }
  }
  initialize() {
    validateManifest(ASSET_MANIFEST);
    validateDialogue();
    this.state = initialState();
    this.story = window.__lastChapterStory ?? null;
    this.started = false;
    this.failed = false;
    this.keys = new Set();
    this.path = [];
    this.arrival = [{ x: 440, y: 220 }];
    this.visitorPace = 0.7;
    this.roaming = { path: [], pause: 1800, step: 0, engaged: false, goal: null };
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.lifecycle = new AbortController();
    this.audio = new BookshopAudio();
    this.lights = drawEnvironment(this);
    this.atmosphere = createAtmosphere(this, this.lights, () => this.reduced);
    this.characters = createCharacters(this, this.story ? ['player', ...VISITOR_IDS] : undefined);
    this.lastStoryActor = this.story ? null : 'mara';
    this.lastStoryDay = null;
    this.dialogue = new DialogueUI(
      (id) => this.choose(id),
      () => this.closeDialogue(),
    );
    this.interactions = new Interactions(this, (spot) => this.approach(spot), Boolean(this.story));
    this.interactions.update(this.characters.player, this.characters.mara, this.state);
    this.refreshStory();
    this.bindControls();
    this.events.once('shutdown', () => this.cleanup());
    this.events.once('destroy', () => this.cleanup());
    $('#loading-message').textContent = 'Дощ залишиться за дверима. Книжки вже чекають.';
    $('#enter').disabled = false;
    $('#enter').focus();
  }
  refreshStory() {
    if (!this.story) return;
    const actor = this.story.actor;
    if (actor !== this.lastStoryActor) {
      const visitor = this.characters.mara;
      this.lastStoryActor = actor;
      if (actor) {
        visitor.name = actor;
        visitor.sprite.anims.stop();
        visitor.direction = 'left';
        visitor.sprite.setTexture(actor, 12);
        visitor.x = 590;
        visitor.y = 221;
        const entrance = visitorEntrance(actor);
        this.arrival = [{ x: entrance.x, y: entrance.y }];
        this.visitorPace = entrance.pace;
        this.state = { ...this.state, mara: 'arriving' };
        this.roaming = { path: [], pause: 1800, step: 0, engaged: false, goal: null };
      }
    }
    if (!actor && this.state.mara === 'arriving') {
      this.state = { ...this.state, mara: 'ready' };
    }
    if (this.lastStoryDay !== this.story.day) {
      this.lastStoryDay = this.story.day;
      this.atmosphere.setDay(this.story.day);
    }
    const visible = Boolean(actor);
    this.characters.mara.sprite.setVisible(visible);
    this.characters.mara.shadow.setVisible(visible);
    this.state = { ...this.state, visitorVisible: visible };
    const spot = this.interactions.spots.find((item) => item.id === 'mara');
    if (spot) {
      spot.label = `Поговорити · ${this.story.visitor}`;
      this.interactions.buttons.get('mara')?.setAttribute('aria-label', spot.label);
    }
    $('#objective').textContent =
      `День ${this.story.day} · ${this.story.visitor}. Ваші рішення зберігаються.`;
    const eyebrow = document.querySelector('.masthead .eyebrow');
    if (eyebrow) eyebrow.textContent = `Беллвік · День ${this.story.day}`;
    $('#stage').dataset.day = String(this.story.day);
    window.__lastChapterRefresh?.();
  }
  openStory() {
    if (!this.story || !this.canExplore()) return;
    this.roaming = pauseVisitor(this.roaming);
    this.activeDialogue = { kind: 'story' };
    this.state = transition(this.state, { type: 'open' });
    this.keys.clear();
    this.path = [];
    this.pending = null;
    this.audio.play('dialogue');
    this.showDialogue();
  }
  listen(target, event, handler) {
    target.addEventListener(event, handler, { signal: this.lifecycle.signal });
  }
  bindControls() {
    this.listen($('#enter'), 'click', () => {
      this.started = true;
      $('#loading').hidden = true;
      for (const selector of ['#game', '#hotspots', '.hud', '#context-action'])
        $(selector).inert = false;
      $('#game').focus();
      void this.audio.unlock();
      if (!this.reduced) this.cameras.main.fadeIn(500, 32, 27, 39);
      this.toast(
        this.story
          ? `Пахне папером і чаєм. День ${this.story.day}. На вас чекає ${this.story.visitor}.`
          : 'Пахне папером і чаєм. Мара щойно зайшла з дощу.',
      );
    });
    this.listen(window, 'keydown', (event) => {
      if (!this.started || this.failed || this.state.mode !== 'explore' || $('#settings').open)
        return;
      const inGame = [$('#game'), $('#context-action'), document.body].includes(
        document.activeElement,
      );
      if (!inGame) return;
      if (
        [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'KeyW',
          'KeyA',
          'KeyS',
          'KeyD',
        ].includes(event.code)
      ) {
        event.preventDefault();
        this.keys.add(event.code);
        this.path = [];
        this.pending = null;
      }
      if (event.repeat) return;
      if (event.code === 'KeyE') {
        event.preventDefault();
        if (this.interactions.nearest) this.interact(this.interactions.nearest);
      }
      if (event.code === 'KeyR') {
        event.preventDefault();
        const spot = this.interactions.cycle();
        if (spot) this.toast(`${spot.label}. Натисніть Enter, щоб підійти.`);
      }
      if (event.code === 'Enter' && document.activeElement === $('#game')) {
        event.preventDefault();
        const spot = this.interactions.selected ?? this.interactions.nearest;
        if (spot) this.approach(spot);
      }
      if (event.code === 'Escape') {
        this.path = [];
        this.pending = null;
        this.interactions.selected = null;
      }
    });
    this.listen(window, 'keyup', (event) => this.keys.delete(event.code));
    this.listen(window, 'blur', () => {
      this.keys.clear();
      this.audio.suspend();
    });
    this.listen(document, 'visibilitychange', () => {
      if (document.hidden) {
        this.keys.clear();
        this.audio.suspend();
      }
    });
    this.listen(document, 'pointerdown', () => {
      if (this.started) void this.audio.unlock();
    });
    this.listen(document, 'keydown', () => {
      if (this.started) void this.audio.unlock();
    });
    this.listen($('#mute'), 'click', async () => {
      const available = await this.audio.toggle();
      $('#mute').textContent = available
        ? this.audio.muted
          ? 'Увімкнути звук'
          : 'Вимкнути звук'
        : 'Звук недоступний';
      $('#mute').setAttribute('aria-pressed', String(this.audio.muted));
      $('#audio-status').textContent = !available
        ? 'Браузер не підтримує звук. Можна спокійно грати далі.'
        : this.audio.muted
          ? 'Звук вимкнено.'
          : 'Чути дощ, кроки й шелест сторінок.';
    });
    this.listen($('#volume'), 'input', (event) => {
      this.audio.setVolume(event.target.value / 100);
      $('#volume-value').textContent = `${event.target.value}%`;
    });
    this.listen($('#music'), 'change', (event) => {
      this.audio.music = event.target.checked;
    });
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    $('#reduced').checked = this.reduced;
    const setReduced = (value) => {
      this.reduced = value;
      $('#reduced').checked = value;
      document.body.classList.toggle('reduced', value);
      if (value) {
        this.cameras.main.resetFX();
        this.atmosphere.reset();
      }
    };
    setReduced(this.reduced);
    this.listen($('#reduced'), 'change', (event) => setReduced(event.target.checked));
    this.listen(motion, 'change', (event) => setReduced(event.matches));
    this.listen($('#help'), 'click', () => {
      this.keys.clear();
      $('#settings').showModal();
    });
    this.listen($('#settings'), 'close', () => $('#game').focus());
    if (this.story) {
      this.listen(window, 'last-chapter:continue', () => this.openStory());
    }
    this.input.on('pointerdown', (pointer) => {
      if (!this.canExplore()) return;
      $('#game').focus();
      const goal = { x: pointer.worldX, y: pointer.worldY };
      if (!canStand(goal)) {
        this.toast('Тут стоять меблі. Оберіть вільне місце поруч.');
        return;
      }
      this.pending = null;
      this.path = findPath(this.characters.player, goal);
      if (!this.path.length) this.toast('Сюди поки не пройти. Спробуйте підійти з іншого боку.');
    });
  }
  canExplore() {
    return this.started && !this.failed && this.state.mode === 'explore' && !$('#settings').open;
  }
  toast(text) {
    if ($('#toast').textContent !== text) $('#toast').textContent = text;
  }
  approach(spot) {
    if (!this.canExplore() || (spot.id === 'mara' && this.state.mara !== 'ready')) return;
    this.keys.clear();
    $('#game').focus();
    if (spot.id === 'mara' && this.story) {
      this.roaming = pauseVisitor(this.roaming);
      spot.approach = visitorApproach(this.characters.mara);
    }
    if (eligible(this.characters.player, spot, this.state)) {
      this.interact(spot);
      return;
    }
    this.path = findPath(this.characters.player, spot.approach);
    this.pending = this.path.length ? spot : null;
    if (!this.path.length) this.toast('Сюди поки не пройти. Спробуйте підійти з іншого боку.');
    else this.toast(`Прямуємо: ${spot.label.toLocaleLowerCase('uk-UA')}.`);
  }
  interact(spot) {
    if (!eligible(this.characters.player, spot, this.state)) return;
    if (this.story && spot.id === 'mara') {
      this.openStory();
      return;
    }
    const inspection = this.story ? this.story.inspect(spot.id) : null;
    this.activeDialogue = inspection
      ? { kind: 'story-object', note: inspection }
      : spot.id === 'mara'
        ? (this.savedConversation ?? openDialogue('mara', this.state.completed))
        : openDialogue(spot.id);
    if (!this.activeDialogue) return;
    if (spot.id !== 'mara') this.state = transition(this.state, { type: 'inspect', id: spot.id });
    this.state = transition(this.state, { type: 'open' });
    this.keys.clear();
    this.path = [];
    this.pending = null;
    this.audio.play(spot.id === 'mara' ? 'dialogue' : 'book');
    this.showDialogue();
  }
  showDialogue() {
    const node =
      this.activeDialogue?.kind === 'story'
        ? this.story.open()
        : this.activeDialogue?.kind === 'story-object'
          ? this.activeDialogue.note
          : dialogueNode(this.activeDialogue, this.state);
    if (!node) throw new Error('Missing dialogue node');
    for (const selector of ['#game', '#hotspots', '.hud', '#context-action'])
      $(selector).inert = true;
    $('#context-action').hidden = true;
    if (this.story) $('#story-tools').inert = true;
    this.dialogue.show(
      node,
      this.activeDialogue.kind === 'mara' ||
        (this.activeDialogue.kind === 'story' && Boolean(node.portrait)),
      this.state.completed,
      this.reduced,
    );
  }
  choose(id) {
    if (this.activeDialogue?.kind === 'story') {
      this.story.choose(id);
      this.audio.play('dialogue');
      this.refreshStory();
      this.showDialogue();
      return;
    }
    const result = chooseDialogue(this.activeDialogue, id);
    if (!result || this.state.mode !== 'dialogue') return;
    this.activeDialogue = result.dialogue;
    this.savedConversation = result.dialogue;
    this.state = transition(this.state, { type: 'choose', effect: result.effect });
    if (result.complete) {
      this.state = transition(this.state, { type: 'complete' });
      this.savedConversation = null;
      this.lights.parcel.setVisible(true);
      this.audio.play('book');
      $('#objective').textContent = 'Подарунок загорнуто. Дякуємо за цей вечір.';
    } else this.audio.play('dialogue');
    this.showDialogue();
  }
  closeDialogue() {
    if (this.state.mode !== 'dialogue') return;
    if (this.activeDialogue.kind === 'mara' && !this.state.completed)
      this.savedConversation = this.activeDialogue;
    this.activeDialogue = null;
    this.state = transition(this.state, { type: 'close' });
    this.dialogue.hide();
    if (this.story) $('#story-tools').inert = false;
    for (const selector of ['#game', '#hotspots', '.hud', '#context-action'])
      $(selector).inert = false;
    $('#game').focus();
    if (this.story) {
      this.refreshStory();
      this.roaming = resumeVisitor(this.roaming);
    }
    this.toast(
      this.story
        ? 'Книгарня знову тиха. Продовжуйте, коли будете готові.'
        : this.state.completed
          ? 'Мара усміхається. Подарунок обрано — можна ще трохи побути серед книжок.'
          : 'У книгарні тихо. До розмови можна повернутися.',
    );
  }
  follow(character, path, amount) {
    const goal = path[0];
    if (!goal) return { x: character.x, y: character.y };
    const remaining = distance(character, goal);
    const length = Math.min(amount, remaining);
    const next =
      remaining < 0.01
        ? { ...goal }
        : moveWithCollision(
            character,
            ((goal.x - character.x) / remaining) * length,
            ((goal.y - character.y) / remaining) * length,
          );
    if (distance(next, goal) < 0.1) path.shift();
    return next;
  }
  update(time, delta) {
    if (this.failed || !this.characters) return;
    try {
      this.atmosphere.update(time, Math.min(delta, 50));
      if (!this.started) return;
      const amount = (SPEED * Math.min(delta, 50)) / 1000;
      const { player, mara } = this.characters;
      if (this.canExplore()) {
        if (this.state.mara === 'arriving') {
          const next = this.reduced
            ? { ...this.arrival[0] }
            : this.follow(mara, this.arrival, amount * this.visitorPace);
          updateCharacter(mara, next, this.reduced);
          if (this.reduced || !this.arrival.length) {
            this.state = transition(this.state, { type: 'arrive' });
            if (this.story) {
              mara.direction = 'left';
              this.roaming.pause = 1200;
            }
            this.toast(
              this.story
                ? `До книгарні завітала ${this.story.visitor}.`
                : 'Мара зняла мокрий шарф. Підійдіть, щоб привітатися.',
            );
            if (!this.story)
              $('#objective').textContent = 'Допоможіть Марі обрати книжку на подарунок.';
          }
        } else if (this.story &&
          this.state.mara === 'ready' &&
          shouldBrowse(this.roaming, this.state.mode, this.state.visitorVisible !== false, this.reduced)) {
          if (this.reduced) {
            updateCharacter(mara, mara, true);
          } else if (this.roaming.path.length) {
            const next = this.follow(mara, this.roaming.path, amount * this.visitorPace);
            updateCharacter(mara, next, false);
            if (!this.roaming.path.length) {
              this.roaming.pause = 1700;
              mara.direction = this.roaming.goal?.facing ?? 'up';
              this.toast(this.story.visitor + ' ' + (this.roaming.goal?.label ?? 'оглядає книгарню') + '.');
            }
          } else {
            updateCharacter(mara, mara, false);
            this.roaming.pause -= Math.min(delta, 50);
            if (this.roaming.pause <= 0) {
              this.roaming.goal = browsingAction(this.story.actor, this.roaming.step);
              this.roaming.path = browsingRoute(mara, this.story.actor, this.roaming.step++);
              this.roaming.pause = 2000;
            }
          }
        } else updateCharacter(mara, mara, this.reduced, this.state.completed);
        const axis = (positive, negative) =>
          Number(positive.some((key) => this.keys.has(key))) -
          Number(negative.some((key) => this.keys.has(key)));
        const dx = axis(['ArrowRight', 'KeyD'], ['ArrowLeft', 'KeyA']);
        const dy = axis(['ArrowDown', 'KeyS'], ['ArrowUp', 'KeyW']);
        const scale = Math.hypot(dx, dy) || 1;
        const next =
          dx || dy
            ? moveWithCollision(player, (dx / scale) * amount, (dy / scale) * amount)
            : this.follow(player, this.path, amount);
        const walking = distance(player, next) > 0.01;
        updateCharacter(player, next, this.reduced);
        this.audio.update(time, walking);
        if (this.pending && !this.path.length) {
          const spot = this.pending;
          this.pending = null;
          this.interact(spot);
        }
      } else {
        updateCharacter(player, player, this.reduced);
        updateCharacter(
          mara,
          mara,
          this.reduced,
          this.activeDialogue?.kind === 'mara' &&
            dialogueNode(this.activeDialogue, this.state)?.mood === 'warm',
        );
      }
      this.interactions.update(player, mara, this.state);
    } catch (error) {
      this.fail(error);
    }
  }
  fail(error) {
    console.error('Bookshop scene failed', error);
    this.failed = true;
    this.keys?.clear();
    this.audio?.suspend();
    for (const selector of ['#game', '#hotspots', '.hud', '#context-action'])
      $(selector).inert = true;
    $('#loading').hidden = false;
    $('#loading-message').textContent =
      'Не вдалося відчинити книгарню. Оновіть сторінку, будь ласка.';
    $('#enter').hidden = true;
  }
  cleanup() {
    this.lifecycle?.abort();
    this.dialogue?.destroy();
    this.interactions?.destroy();
    void this.audio?.dispose();
  }
}

export const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: WIDTH,
  height: HEIGHT,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#201b27',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Bookshop],
  render: { antialias: false },
  audio: { noAudio: true },
  callbacks: {
    postBoot(game) {
      game.canvas.setAttribute('aria-hidden', 'true');
    },
  },
});
