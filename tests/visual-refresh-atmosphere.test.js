import { describe, expect, it, vi } from 'vitest';
import { createAtmosphere } from '../public/phaser-prototype/atmosphere.js';

function setup() {
  const graphics = [];
  const scene = {
    add: {
      graphics: () => {
        const g = {
          setDepth: vi.fn().mockReturnThis(),
          fillStyle: vi.fn().mockReturnThis(),
          fillRect: vi.fn().mockReturnThis(),
          lineStyle: vi.fn().mockReturnThis(),
          lineBetween: vi.fn().mockReturnThis(),
          clear: vi.fn().mockReturnThis(),
          setAlpha: vi.fn().mockReturnThis(),
        };
        graphics.push(g);
        return g;
      },
    },
  };
  const light = () => ({
    setVisible: vi.fn().mockReturnThis(),
    setAlpha: vi.fn().mockReturnThis(),
    setY: vi.fn().mockReturnThis(),
  });
  const lights = { halo: light(), readingGlow: light(), steam: light() };
  return { scene, lights, graphics };
}

describe('visual refresh atmosphere', () => {
  it('preserves day brightness while animated and after reset', () => {
    const { scene, lights } = setup();
    const atmosphere = createAtmosphere(scene, lights, () => false);
    atmosphere.setEnvironment({ time: 'day', weather: 'clear' });
    expect(lights.readingGlow.setAlpha).toHaveBeenLastCalledWith(0.35);
    atmosphere.update(1000, 16);
    const animated = lights.readingGlow.setAlpha.mock.lastCall[0];
    expect(animated).toBeGreaterThanOrEqual(0.29);
    expect(animated).toBeLessThanOrEqual(0.41);
    atmosphere.reset();
    expect(lights.readingGlow.setAlpha).toHaveBeenLastCalledWith(0.35);
  });

  it('keeps dusk/night glow distinct from daylight through animation and reset', () => {
    const { scene, lights } = setup();
    const atmosphere = createAtmosphere(scene, lights, () => false);
    for (const time of ['dusk', 'night']) {
      atmosphere.setEnvironment({ time, weather: 'cloudy' });
      expect(lights.readingGlow.setAlpha).toHaveBeenLastCalledWith(0.85);
      atmosphere.update(time === 'dusk' ? 1000 : 1100, 16);
      const animated = lights.readingGlow.setAlpha.mock.lastCall[0];
      expect(animated).toBeGreaterThanOrEqual(0.79);
      expect(animated).toBeLessThanOrEqual(0.91);
      atmosphere.reset();
      expect(lights.readingGlow.setAlpha).toHaveBeenLastCalledWith(0.85);
    }
  });

  it('uses distinct window palettes for morning, day, dusk and night', () => {
    const { scene, graphics } = setup();
    const lights = { halo: { setVisible: vi.fn(), setAlpha: vi.fn() }, readingGlow: { setAlpha: vi.fn() }, steam: { setY: () => ({ setAlpha: vi.fn() }), setAlpha: vi.fn() } };
    const atmosphere = createAtmosphere(scene, lights, () => true);
    const sky = graphics[1];
    const colors = [];
    for (const time of ['morning', 'day', 'dusk', 'night']) {
      sky.fillStyle.mockClear();
      atmosphere.setEnvironment({ time, weather: 'clear' });
      colors.push(sky.fillStyle.mock.calls[0][0]);
    }
    expect(new Set(colors).size).toBe(4);
  });
  it('resets halo visibility according to the current time of day', () => {
    const { scene, lights } = setup();
    const atmosphere = createAtmosphere(scene, lights, () => false);
    atmosphere.setEnvironment({ time: 'day', weather: 'clear' });
    atmosphere.reset();
    expect(lights.halo.setVisible).toHaveBeenLastCalledWith(false);
    atmosphere.setEnvironment({ time: 'night', weather: 'rain' });
    atmosphere.reset();
    expect(lights.halo.setVisible).toHaveBeenLastCalledWith(true);
  });

  it('does not advance rain by a huge amount on the first frame or after reset', () => {
    const { scene, graphics } = setup();
    const atmosphere = createAtmosphere(scene, {
      halo: { setVisible: vi.fn(), setAlpha: vi.fn() },
      readingGlow: { setAlpha: vi.fn() },
      steam: { setY: () => ({ setAlpha: vi.fn() }), setAlpha: vi.fn() },
    }, () => false);
    atmosphere.setEnvironment({ time: 'dusk', weather: 'rain' });
    const rain = graphics[0];
    rain.lineBetween.mockClear();
    atmosphere.update(100000, 16);
    const first = rain.lineBetween.mock.calls[0];
    expect(first[1]).toBeGreaterThan(30);
    expect(first[1]).toBeLessThan(34);
    atmosphere.reset();
    rain.lineBetween.mockClear();
    atmosphere.update(200000, 16);
    const second = rain.lineBetween.mock.calls[0];
    expect(second[1] - first[1]).toBeLessThan(2);
  });
});
