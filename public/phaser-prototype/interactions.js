import { projectRect } from './viewport.js';
import { HOTSPOTS, nearestSpot, eligible } from './world.js';
import { visitorApproach } from './visitor-roaming.js';
export class Interactions {
  constructor(scene, onInteract, includePlant = false) {
    this.scene = scene;
    this.lifecycle = new AbortController();
    this.root = document.querySelector('#hotspots');
    this.hint = document.querySelector('#context-action');
    this.outline = scene.add.graphics().setDepth(900);
    this.outlineSignature = null;
    this.spots = [
      ...HOTSPOTS.filter(
        (spot) => includePlant || !['chair', 'cat-tree', 'bowl'].includes(spot.id),
      ),
      ...(includePlant
        ? [
            {
              id: 'frank',
              label: 'Побути з Френком',
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
        left: `${canvas.left - parent.left}px`,
        top: `${canvas.top - parent.top}px`,
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
      const projected = projectRect(rect, this.scene.cameras.main);
      const left = projected.x + (projected.w - Math.max(44, projected.w)) / 2;
      const top = projected.y + (projected.h - Math.max(44, projected.h)) / 2;
      const style = `${left}px;${top}px;${Math.max(44, projected.w)}px;${Math.max(44, projected.h)}px`;
      if (button.dataset.geometry !== style) {
        button.style.left = `${left}px`;
        button.style.top = `${top}px`;
        button.style.width = `${Math.max(44, projected.w)}px`;
        button.style.height = `${Math.max(44, projected.h)}px`;
        button.dataset.geometry = style;
      }
      const available =
        state.mode === 'explore' &&
        !(spot.id === 'mara' && (state.mara !== 'ready' || state.visitorVisible === false));
      if (button.dataset.available !== String(available))
        button.dataset.available = String(available);
      const hidden =
        projected.x + projected.w < 0 ||
        projected.y + projected.h < 0 ||
        projected.x > this.scene.scale.width ||
        projected.y > this.scene.scale.height ||
        !available;
      if (button.hidden !== hidden) button.hidden = hidden;
      const nearby = spot === this.nearest;
      const visited = state.inspected.includes(spot.id);
      if (button.classList.contains('nearby') !== nearby) button.classList.toggle('nearby', nearby);
      if (button.classList.contains('visited') !== visited)
        button.classList.toggle('visited', visited);
      const title = spot.label + (visited ? ' · Уже оглянуто' : '');
      if (button.title !== title) button.title = title;
    }
    // A visitor can leave while its hotspot is selected or hovered. Hidden
    // controls must not remain actionable through keyboard navigation or outlines.
    if (
      this.selected &&
      (this.buttons.get(this.selected.id)?.hidden ||
        this.buttons.get(this.selected.id)?.dataset.available !== 'true')
    )
      this.selected = null;
    if (this.hovered && this.buttons.get(this.hovered.id)?.hidden) this.hovered = null;
    const hintHidden = !this.nearest || state.mode !== 'explore';
    if (this.hint.hidden !== hintHidden) this.hint.hidden = hintHidden;
    if (this.nearest) {
      const label = `Е · ${this.nearest.label}`;
      if (this.hint.textContent !== label) this.hint.textContent = label;
    }
    const highlighted = this.hovered ?? this.selected ?? this.nearest;
    const active =
      highlighted &&
      state.mode === 'explore' &&
      (highlighted.id !== 'mara' || (state.mara === 'ready' && state.visitorVisible !== false));
    const rect = active ? highlighted.rect : null;
    const canInteract = active && eligible(player, highlighted, state);
    // The scene calls update every frame. Redrawing unchanged corners forces
    // Phaser graphics geometry work even while the player stands still.
    const signature = rect
      ? `${highlighted.id}:${rect.x}:${rect.y}:${rect.w}:${rect.h}:${canInteract}`
      : '';
    if (signature !== this.outlineSignature) {
      this.outlineSignature = signature;
      this.outline.clear();
      if (rect) {
        this.outline.lineStyle(1, 0xf0bd7e, canInteract ? 0.9 : 0.45);
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
  }
  cycle() {
    const spots = this.spots.filter((spot) => {
      const button = this.buttons.get(spot.id);
      return button && !button.hidden && button.dataset.available === 'true';
    });
    if (!spots.length) {
      this.selected = null;
      return null;
    }
    this.selected = spots[(spots.indexOf(this.selected) + 1) % spots.length];
    return this.selected;
  }
  destroy() {
    this.lifecycle.abort();
    this.scene.scale.off('resize', this.resize);
    this.root.replaceChildren();
  }
}
