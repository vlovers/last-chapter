import { HOTSPOTS, nearestSpot, eligible } from './world.js';
import { visitorApproach } from './visitor-roaming.js';
export class Interactions {
  constructor(scene, onInteract, includePlant = false) {
    this.scene = scene;
    this.lifecycle = new AbortController();
    this.root = document.querySelector('#hotspots');
    this.hint = document.querySelector('#context-action');
    this.outline = scene.add.graphics().setDepth(900);
    this.spots = [
      ...HOTSPOTS,
      ...(includePlant
        ? [
            {
              id: 'frank',
              label: 'Погладити Френка',
              rect: { x: 463, y: 171, w: 34, h: 29 },
              approach: { x: 477, y: 216 },
            },
            {
              id: 'plant',
              label: 'Рослина біля вікна',
              rect: { x: 531, y: 168, w: 40, h: 40 },
              approach: { x: 520, y: 215 },
            },
          ]
        : []),
      {
        id: 'mara',
        label: 'Поговорити з Марою',
        rect: { x: 574, y: 175, w: 32, h: 48 },
        approach: { x: 415, y: 218 },
      },
    ];
    this.buttons = new Map();
    this.hovered = null;
    this.nearest = null;
    for (const spot of this.spots) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'hotspot';
      button.hidden = spot.id === 'mara';
      button.setAttribute('aria-label', spot.label);
      const label = document.createElement('span');
      label.textContent = spot.label;
      button.append(label);
      button.addEventListener('click', () => onInteract(spot));
      button.addEventListener('pointerenter', () => {
        this.hovered = spot;
      });
      button.addEventListener('pointerleave', () => {
        this.hovered = null;
      });
      button.addEventListener('focus', () => {
        this.hovered = spot;
      });
      button.addEventListener('blur', () => {
        this.hovered = null;
      });
      this.root.append(button);
      this.buttons.set(spot.id, button);
    }
    this.hint.addEventListener(
      'click',
      () => {
        if (this.nearest) onInteract(this.nearest);
      },
      { signal: this.lifecycle.signal },
    );
    this.resize = () => {
      const canvas = scene.game.canvas.getBoundingClientRect();
      const parent = document.querySelector('#stage').getBoundingClientRect();
      Object.assign(this.root.style, {
        left: `${canvas.left - parent.left - 3}px`,
        top: `${canvas.top - parent.top - 3}px`,
        width: `${canvas.width}px`,
        height: `${canvas.height}px`,
        right: 'auto',
        bottom: 'auto',
      });
    };
    scene.scale.on('resize', this.resize);
    this.resize();
  }
  update(player, mara, state) {
    const maraSpot = this.spots.find((spot) => spot.id === 'mara');
    maraSpot.rect = { x: mara.x - 16, y: mara.y - 47, w: 32, h: 48 };
    maraSpot.approach = visitorApproach(mara);
    this.nearest = nearestSpot(player, this.spots, state);
    for (const spot of this.spots) {
      const button = this.buttons.get(spot.id),
        rect = spot.rect;
      button.style.left = `${rect.x / 6.4}%`;
      button.style.top = `${rect.y / 3.6}%`;
      button.style.width = `${rect.w / 6.4}%`;
      button.style.height = `${rect.h / 3.6}%`;
      button.hidden =
        state.mode !== 'explore' ||
        (spot.id === 'mara' && (state.mara !== 'ready' || state.visitorVisible === false));
      button.classList.toggle('nearby', spot === this.nearest);
    }
    this.hint.hidden = !this.nearest || state.mode !== 'explore';
    if (this.nearest) this.hint.textContent = `Е · ${this.nearest.label}`;
    this.outline.clear();
    const highlighted = this.hovered ?? this.selected ?? this.nearest;
    if (
      highlighted &&
      state.mode === 'explore' &&
      (highlighted.id !== 'mara' || (state.mara === 'ready' && state.visitorVisible !== false))
    ) {
      const rect = highlighted.rect;
      this.outline.lineStyle(1, 0xf0bd7e, eligible(player, highlighted, state) ? 0.9 : 0.45);
      for (const [x, y, dx, dy] of [
        [rect.x - 2, rect.y - 2, 1, 1],
        [rect.x + rect.w + 2, rect.y - 2, -1, 1],
        [rect.x - 2, rect.y + rect.h + 2, 1, -1],
        [rect.x + rect.w + 2, rect.y + rect.h + 2, -1, -1],
      ]) {
        this.outline.lineBetween(x, y, x + dx * 5, y);
        this.outline.lineBetween(x, y, x, y + dy * 5);
      }
    }
  }
  cycle() {
    const spots = this.spots.filter((spot) => !this.buttons.get(spot.id).hidden);
    this.selected = spots[(spots.indexOf(this.selected) + 1) % spots.length];
    return this.selected;
  }
  destroy() {
    this.lifecycle.abort();
    this.scene.scale.off('resize', this.resize);
    this.root.replaceChildren();
  }
}
