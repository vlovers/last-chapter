import { createActorActions, cueActor } from './actor-actions.js';
import { createFrameBudget } from './performance.js';
import { viewportPlan, frameWorld } from './viewport.js';
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
import { createVisitorBook } from './visitor-book.js';
import { visitorReaction, facingToward } from './visitor-reactions.js';
import { createFrank } from './frank.js';
import { FRANK_ACTIONS, frankApproach } from './frank-behavior.js';

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
    this.frank = this.story ? createFrank(this) : null;
    this.frameBudget = createFrameBudget((navigator.hardwareConcurrency ?? 8) <= 4);
    this.atmosphere = createAtmosphere(
      this,
      this.lights,
      () => this.reduced,
      () => this.frameBudget.reduced,
    );
    this.characters = createCharacters(this, this.story ? ['player', ...VISITOR_IDS] : undefined);
    this.visitorBook = createVisitorBook(this);
    this.actorActions = createActorActions(this);
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
    this.viewportObserver = new ResizeObserver(() => this.resizeViewport());
    this.resizeViewport();
    this.viewportObserver.observe($('#game'));
    this.events.once('shutdown', () => this.cleanup());
    this.events.once('destroy', () => this.cleanup());
    $('#loading-message').textContent = 'Дощ залишиться за дверима. Книжки вже чекають.';
    $('#enter').disabled = false;
    $('#enter').focus();
  }
  resizeViewport() {
    const host = $('#game');
    const width = Math.floor(host.clientWidth),
      height = Math.floor(host.clientHeight);
    if (!width || !height) return;
    this.scale.resize(width, height);
    const plan = viewportPlan(width, height);
    this.cameras.main.setOrigin(0, 0).setZoom(plan.zoom).removeBounds();
    this.frameCamera();
    this.interactions.resize();
  }
  frameCamera() {
    const camera = this.cameras.main,
      player = this.characters.player;
    const width = camera.width / camera.zoom,
      height = camera.height / camera.zoom;
    const targetX = this.cameraLook?.x ?? player.x;
    const frame = frameWorld({ x: targetX, y: player.y }, width, height);
    camera.scrollX = frame.x;
    const sheet = this.state.mode === 'dialogue' ? $('#dialogue').offsetHeight || 0 : 0;
    // Reading is a camera composition change only: viewport size and zoom stay fixed.
    camera.scrollY = Math.round(
      sheet ? player.y - Math.max(65, (camera.height - sheet - 24) * 0.7) / camera.zoom : frame.y,
    );
  }
  refreshStory() {
    if (!this.story) return;
    this.state = {
      ...this.state,
      inspected: [...new Set([...this.state.inspected, ...this.story.inspectedSpots])],
    };
    const actor = this.story.actor;
    if (actor !== this.lastStoryActor) {
      const visitor = this.characters.mara;
      if (this.lastStoryActor && visitor.sprite.visible) {
        this.departing?.sprite.destroy();
        this.departing?.shadow.destroy();
        this.departing = {
          name: visitor.name,
          x: visitor.x,
          y: visitor.y,
          direction: 'right',
          sprite: this.add.sprite(visitor.x, visitor.y + 1, visitor.name, 12).setOrigin(0.5, 1),
          shadow: this.add.ellipse(visitor.x, visitor.y - 1, 23, 7, 0x201b27, 0.25),
          path: findPath(visitor, { x: 590, y: 221 }),
        };
      }
      this.lastStoryActor = actor;
      if (actor) {
        visitor.name = actor;
        visitor.sprite.anims.stop();
        visitor.direction = 'left';
        visitor.sprite.setTexture(actor, 12);
        visitor.x = 590;
        visitor.y = 221;
        const entrance = visitorEntrance(actor);
        // Visitors enter through the door, then walk into the shop before dialogue.
        // Keep the per-character entrance as a safe fallback if pathfinding fails.
        const welcomePath = findPath(visitor, { x: 240, y: 235 });
        this.arrival = welcomePath.length ? welcomePath : [{ x: entrance.x, y: entrance.y }];
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
      const target = this.interactions.buttons.get('mara');
      target?.setAttribute('aria-label', spot.label);
      const label = target?.querySelector('span');
      if (label) label.textContent = spot.label;
    }
    $('#objective').textContent = `День ${this.story.day} · ${this.story.guidance.text}`;
    const eyebrow = document.querySelector('.masthead .eyebrow');
    if (eyebrow) eyebrow.textContent = `Беллвік · День ${this.story.day}`;
    $('#stage').dataset.day = String(this.story.day);
    window.__lastChapterRefresh?.();
  }
  openStory() {
    if (!this.story || !this.canExplore()) return;
    this.roaming = pauseVisitor(this.roaming);
    if (this.story.actor && distance(this.characters.mara, this.characters.player) > 80) {
      this.roaming.path = findPath(this.characters.mara, { x: 240, y: 235 });
      this.orderApproach = true;
    }
    this.characters.player.direction = facingToward(this.characters.player, this.characters.mara);
    cueActor(this.characters.mara, 'greet', this.time.now);
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
      window.__lastChapterRefresh?.();
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
      $('#mute').setAttribute('aria-label', $('#mute').textContent);
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
      this.listen(window, 'last-chapter:order-catalog', () => {
        this.closeDialogue();
        window.dispatchEvent(new Event('last-chapter:catalog-open'));
      });
      this.listen(window, 'last-chapter:recommendation', (event) => {
        const { accepted, text } = event.detail;
        this.keys.clear();
        this.path = [];
        this.pending = null;
        this.roaming = pauseVisitor(this.roaming);
        this.roaming.path = findPath(this.characters.mara, { x: 240, y: 235 });
        this.orderApproach = true;
        this.lights.parcel.setVisible(true);
        this.handoffUntil = this.time.now + 7000;
        cueActor(this.characters.player, 'give', this.time.now, 4000);
        cueActor(this.characters.mara, 'receive', this.time.now, 6000);
        this.toast(text);
        this.audio.play('book');
        if (accepted) this.refreshStory();
      });
    }
    this.input.on('pointerdown', (pointer) => {
      if (!this.canExplore()) return;
      $('#game').focus();
      this.cameraLook = null;
      const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const goal = { x: world.x, y: world.y };
      if (!canStand(goal)) {
        this.toast('Тут стоять меблі. Оберіть вільне місце поруч.');
        return;
      }
      this.cameraLook = null;
      this.pending = null;
      this.path = findPath(this.characters.player, goal);
      if (!this.path.length) this.toast('Сюди поки не пройти. Спробуйте підійти з іншого боку.');
    });
  }
  canExplore() {
    return (
      this.started &&
      !this.failed &&
      this.state.mode === 'explore' &&
      !$('#settings').open &&
      !document.body.classList.contains('reading')
    );
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
    this.cameraLook = null;
    this.path = findPath(this.characters.player, spot.approach);
    this.pending = this.path.length ? spot : null;
    if (!this.path.length) this.toast('Сюди поки не пройти. Спробуйте підійти з іншого боку.');
    else this.toast(`Прямуємо: ${spot.label.toLocaleLowerCase('uk-UA')}.`);
  }
  interact(spot) {
    if (!eligible(this.characters.player, spot, this.state)) return;
    if (spot.id === 'chair') {
      cueActor(this.characters.player, 'sit', this.time.now, 60000);
      this.characters.player.direction = 'down';
      this.toast('Можна побути з книжкою. Торкніться підлоги, щоб підвестися.');
      return;
    }
    if (this.story && spot.id === 'mara') {
      this.openStory();
      return;
    }
    if (['frank', 'bowl', 'cat-tree'].includes(spot.id) && this.frank) {
      this.story?.inspect('frank');
      this.state = transition(this.state, { type: 'inspect', id: 'frank' });
      this.activeDialogue = {
        kind: 'frank',
        note: {
          speaker: 'Френк',
          text:
            this.frank.state.activity === 'sleeping'
              ? 'Френк згорнувся клубочком. Великі вуха ледь здригаються уві сні.'
              : 'Маленький сірий девон-рекс повертає до вас великі вуха. Він нікуди не поспішає.',
          choices:
            spot.id === 'bowl'
              ? FRANK_ACTIONS.filter((a) => ['feed', 'leave'].includes(a.id))
              : spot.id === 'cat-tree'
                ? FRANK_ACTIONS.filter((a) => ['tree', 'leave'].includes(a.id))
                : FRANK_ACTIONS,
        },
      };
      this.state = transition(this.state, { type: 'open' });
      this.keys.clear();
      this.path = [];
      this.pending = null;
      this.showDialogue();
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
        : ['story-object', 'frank'].includes(this.activeDialogue?.kind)
          ? this.activeDialogue.note
          : dialogueNode(this.activeDialogue, this.state);
    if (!node) throw new Error('Missing dialogue node');
    for (const selector of ['#game', '#hotspots', '.hud', '#context-action'])
      $(selector).inert = true;
    $('#context-action').hidden = true;
    if (this.story) $('#story-tools').inert = true;
    this.dialogue.show(
      node,
      this.activeDialogue.kind === 'mara' || this.activeDialogue.kind === 'story',
      this.state.completed,
      this.reduced,
      this.activeDialogue.kind === 'story' ? this.story.actor : null,
    );
  }
  choose(id) {
    if (this.activeDialogue?.kind === 'frank') {
      const text = this.frank.react(id, this.characters.player);
      if (!text) return;
      if (id === 'leave') {
        this.closeDialogue();
        return;
      }
      this.activeDialogue.note = { speaker: 'Френк', text, choices: [] };
      if (['pet', 'play'].includes(id)) {
        this.characters.player.direction =
          this.frank.state.x > this.characters.player.x ? 'right' : 'left';
        cueActor(this.characters.player, 'pet', this.time.now, 2000);
      }
      this.audio.play(id === 'feed' ? 'book' : 'dialogue');
      this.showDialogue();
      return;
    }
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
    if (this.failed || !this.characters || document.hidden) return;
    try {
      this.frameBudget.sample(delta);
      this.atmosphere.update(time, Math.min(delta, 50));
      if (!this.started) return;
      const amount = (SPEED * Math.min(delta, 50)) / 1000;
      const { player, mara } = this.characters;
      if (this.departing) {
        updateCharacter(
          this.departing,
          this.follow(this.departing, this.departing.path, amount * 0.8),
          this.reduced,
        );
        if (!this.departing.path.length) {
          this.departing.sprite.destroy();
          this.departing.shadow.destroy();
          this.departing = null;
        }
      }
      if (document.body.classList.contains('reading')) {
        this.keys.clear();
        this.path = [];
        this.pending = null;
      }
      if (this.frank) {
        this.frank.state.held = this.pending?.id === 'frank';
        this.frank.update(delta, player, {
          paused:
            !this.canExplore() &&
            !(
              this.activeDialogue?.kind === 'frank' && this.activeDialogue.note.choices.length === 0
            ),
          reduced: this.reduced,
        });
        const spot = this.interactions.spots.find((s) => s.id === 'frank');
        spot.rect = {
          x: this.frank.state.x - 21,
          y: this.frank.state.y - this.frank.state.elevation - 34,
          w: 42,
          h: 35,
        };
        spot.approach = frankApproach(this.frank.state);
      }
      if (this.orderApproach && this.roaming.path.length && !document.hidden) {
        updateCharacter(mara, this.follow(mara, this.roaming.path, amount * 0.7), this.reduced);
        if (!this.roaming.path.length) {
          this.orderApproach = false;
          mara.direction = 'left';
        }
      }
      if (this.handoffUntil && time > this.handoffUntil) {
        this.lights.parcel.setVisible(false);
        this.handoffUntil = null;
      }
      if (this.canExplore()) {
        if (this.orderApproach) {
          /* counter handoff owns visitor movement */
        } else if (this.state.mara === 'arriving') {
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
        } else if (
          this.story &&
          this.state.mara === 'ready' &&
          shouldBrowse(
            this.roaming,
            this.state.mode,
            this.state.visitorVisible !== false,
            this.reduced,
          )
        ) {
          if (this.reduced) {
            updateCharacter(mara, mara, true);
          } else if (this.roaming.path.length) {
            const next = this.follow(mara, this.roaming.path, amount * this.visitorPace);
            updateCharacter(mara, next, false);
            if (!this.roaming.path.length) {
              this.roaming.pause = 4800;
              mara.direction = this.roaming.goal?.facing ?? 'up';
              this.toast(
                this.story.visitor + ' ' + (this.roaming.goal?.label ?? 'оглядає книгарню') + '.',
              );
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
        if (walking) player.cue = null;
        updateCharacter(player, next, this.reduced);
        this.audio.update(time, walking);
        if (this.pending && !this.path.length) {
          const spot = this.pending;
          this.pending = null;
          this.interact(spot);
        }
      } else {
        updateCharacter(player, player, this.reduced);
        if (!this.orderApproach)
          updateCharacter(
            mara,
            mara,
            this.reduced,
            this.activeDialogue?.kind === 'mara' &&
              dialogueNode(this.activeDialogue, this.state)?.mood === 'warm',
          );
      }
      const speaking =
        this.story && this.state.mode === 'dialogue' && this.activeDialogue?.kind === 'story';
      const stationary = this.state.mara === 'ready' && !this.roaming.path.length;
      if (this.story && stationary && this.state.visitorVisible !== false) {
        const reaction = visitorReaction(mara, player, speaking, time, this.reduced);
        if (reaction.facing && (speaking || this.roaming.engaged)) {
          mara.direction = reaction.facing;
          updateCharacter(mara, mara, this.reduced);
        }
        mara.sprite.y = Math.round(mara.y + 1 - reaction.lift);
        if (speaking) mara.sprite.setTint(reaction.glow);
      }
      this.visitorBook.update(
        mara,
        Boolean(
          this.story &&
          this.state.mode === 'explore' &&
          !this.roaming.engaged &&
          this.state.mara === 'ready' &&
          this.roaming.path.length === 0 &&
          this.roaming.goal?.prop === 'book' &&
          this.roaming.pause > 0,
        ),
        time,
        this.reduced,
      );
      this.actorActions.update([player, mara], time, this.reduced, speaking ? mara : null);
      this.frameCamera();
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
    this.departing?.sprite.destroy();
    this.departing?.shadow.destroy();
    this.departing = null;
    this.viewportObserver?.disconnect();
    this.lifecycle?.abort();
    this.frank?.destroy();
    this.visitorBook?.destroy();
    this.actorActions?.destroy();
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
  scale: { mode: Phaser.Scale.NONE },
  scene: [Bookshop],
  render: { antialias: false },
  audio: { noAudio: true },
  callbacks: {
    postBoot(game) {
      game.canvas.setAttribute('aria-hidden', 'true');
    },
  },
});
