import { describe, expect, it, vi } from 'vitest';
import { Interactions } from '../public/phaser-prototype/interactions.js';
import { HOTSPOTS } from '../public/phaser-prototype/world.js';
import { initialState } from '../public/phaser-prototype/state.js';

function fixture() {
  const counter = structuredClone(HOTSPOTS.find((spot) => spot.id === 'counter'));
  const visitor = {
    id: 'mara',
    label: 'Поговорити з Марою',
    rect: { x: 574, y: 175, w: 32, h: 48 },
    approach: { x: 415, y: 218 },
  };
  const spots = [counter, visitor];
  const buttons = new Map(
    spots.map((spot) => {
      const classes = new Set();
      const toggle = vi.fn((name, enabled) => {
        if (enabled) classes.add(name);
        else classes.delete(name);
      });
      return [
        spot.id,
        {
          dataset: {},
          style: {},
          hidden: false,
          title: '',
          classList: { contains: (name) => classes.has(name), toggle },
        },
      ];
    }),
  );
  const outline = {
    clear: vi.fn(),
    lineStyle: vi.fn(),
    lineBetween: vi.fn(),
  };
  let hintWrites = 0;
  let hintText = '';
  const hint = {
    hidden: true,
    get textContent() {
      return hintText;
    },
    set textContent(value) {
      hintWrites++;
      hintText = value;
    },
  };
  const interaction = {
    spots,
    buttons,
    outline,
    outlineSignature: null,
    hint,
    hovered: null,
    selected: null,
    nearest: null,
    scene: {
      cameras: { main: { scrollX: 0, scrollY: 0, zoom: 1 } },
      scale: { width: 640, height: 360 },
    },
  };
  const update = (player, visitorPosition, state) =>
    Interactions.prototype.update.call(interaction, player, visitorPosition, state);
  return { interaction, buttons, outline, hint, get hintWrites() { return hintWrites; }, update };
}

const ready = () => ({ ...initialState(), mara: 'ready', visitorVisible: true });
const player = { x: 160, y: 222 };
const visitor = { x: 590, y: 221 };

describe('hotspot rendering on the Phaser animation loop', () => {
  it('does not rewrite unchanged DOM classes, hint text, or outline on idle frames', () => {
    const f = fixture();
    f.update(player, visitor, ready());
    const toggles = [...f.buttons.values()].map((button) => button.classList.toggle.mock.calls.length);
    const geometry = [...f.buttons.values()].map((button) => button.dataset.geometry);
    const initialHintWrites = f.hintWrites;
    expect(f.outline.clear).toHaveBeenCalledTimes(1);
    expect(f.outline.lineBetween).toHaveBeenCalledTimes(8);
    expect(f.hint.textContent).toContain('Прилавок');

    for (let frame = 0; frame < 120; frame++) f.update(player, visitor, ready());

    expect(f.outline.clear).toHaveBeenCalledTimes(1);
    expect(f.outline.lineBetween).toHaveBeenCalledTimes(8);
    expect(f.hintWrites).toBe(initialHintWrites);
    expect([...f.buttons.values()].map((button) => button.classList.toggle.mock.calls.length)).toEqual(toggles);
    expect([...f.buttons.values()].map((button) => button.dataset.geometry)).toEqual(geometry);
  });

  it('updates projected hit targets after camera movement without redrawing world-space corners', () => {
    const f = fixture();
    f.update(player, visitor, ready());
    const before = f.buttons.get('counter').dataset.geometry;
    f.interaction.scene.cameras.main.scrollX = 12;
    f.update(player, visitor, ready());
    expect(f.buttons.get('counter').dataset.geometry).not.toBe(before);
    expect(f.outline.clear).toHaveBeenCalledTimes(1);
    expect(f.hintWrites).toBe(1);
  });

  it('redraws on target movement and clears the outline exactly once when dialogue opens', () => {
    const f = fixture();
    f.interaction.hovered = f.interaction.spots.find((spot) => spot.id === 'mara');
    f.update(player, visitor, ready());
    const original = f.outline.clear.mock.calls.length;
    f.update(player, { x: 570, y: 221 }, ready());
    expect(f.outline.clear).toHaveBeenCalledTimes(original + 1);

    const talking = { ...ready(), mode: 'dialogue' };
    f.update(player, { x: 570, y: 221 }, talking);
    expect(f.outline.clear).toHaveBeenCalledTimes(original + 2);
    expect(f.hint.hidden).toBe(true);
    for (let frame = 0; frame < 30; frame++)
      f.update(player, { x: 570, y: 221 }, talking);
    expect(f.outline.clear).toHaveBeenCalledTimes(original + 2);

    f.update(player, { x: 570, y: 221 }, ready());
    expect(f.outline.clear).toHaveBeenCalledTimes(original + 3);
  });
});
