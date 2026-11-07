export function createAtmosphere(scene, lights, reduced, lowQuality = () => false) {
  const rain = scene.add.graphics().setDepth(1);
  const drops = Array.from({ length: 42 }, (_, i) => ({
    x: 258 + ((i * 31) % 126),
    y: 30 + ((i * 47) % 95),
    speed: 1 + (i % 3),
  }));
  let mood;
  let environment = { time: 'dusk', weather: 'rain' };
  const sky = scene.add.graphics().setDepth(0.5);
  let lastDraw = null;
  const dust = scene.add.graphics().setDepth(2);
  const reflection = scene.add.graphics().setDepth(1.1);
  reflection.fillStyle(0xc5d6dd, 0.08).fillRect(273, 36, 2, 24).fillRect(275, 38, 1, 8);
  const draw = () => {
    rain.clear();
    if (environment.weather !== 'rain') return;
    rain.lineStyle(1, 0xc5d6dd, 0.6);
    for (const drop of lowQuality() ? drops.slice(0, 14) : drops) {
      // Keep wooden mullions in front of the weather.
      if (drop.x >= 316 && drop.x <= 325) continue;
      if (drop.y >= 69 && drop.y <= 80) continue;
      rain.lineBetween(drop.x, drop.y, drop.x - 1, Math.min(drop.y < 69 ? 73 : 131, drop.y + 5));
    }
  };
  // Subtle environmental grade sits behind furniture and characters.
  const dayGrade = scene.add.graphics().setDepth(1.25);
  const palettes = {
    morning: { sky: 0xa8b8c7, roof: 0x56677d, color: 0xffdca6, alpha: 0.055 },
    day: { sky: 0x8eacc9, roof: 0x53657c, color: 0xffe6b3, alpha: 0.06 },
    dusk: { sky: 0xa47caa, roof: 0x4f456a, color: 0xe5a87b, alpha: 0.065 },
    night: { sky: 0x202b52, roof: 0x252943, color: 0x7c78ae, alpha: 0.09 },
  };
  const drawSky = () => {
    sky.clear();
    const pane = (x, y, w, h, color, alpha = 1) => {
      // Paint only glass. Mullions and curtains are never tinted over.
      for (const [left, right] of [
        [255, 317],
        [324, 387],
      ])
        for (const [top, bottom] of [
          [28, 74],
          [80, 132],
        ]) {
          const px = Math.max(left, x),
            py = Math.max(top, y);
          const pw = Math.min(right, x + w) - px,
            ph = Math.min(bottom, y + h) - py;
          if (pw > 0 && ph > 0) sky.fillStyle(color, alpha).fillRect(px, py, pw, ph);
        }
    };
    pane(255, 28, 132, 104, mood.sky);
    if (environment.weather === 'cloudy' || environment.weather === 'rain') {
      pane(255, 28, 132, 104, 0x697e87, environment.weather === 'rain' ? 0.52 : 0.25);
      pane(263, 40, 48, 4, 0xd2d8cd, 0.45);
      pane(330, 51, 50, 3, 0xd2d8cd, 0.4);
    } else {
      pane(355, 36, 9, 9, environment.time === 'night' ? 0xf5e9c8 : 0xffe4a2);
      if (environment.time === 'night')
        for (const [x, y] of [
          [265, 38],
          [292, 51],
          [336, 34],
          [374, 60],
        ])
          pane(x, y, 1, 1, 0xf5e9c8);
    }
    for (const [x, w, h] of [
      [256, 18, 19],
      [279, 25, 27],
      [309, 19, 22],
      [335, 22, 32],
      [364, 21, 23],
    ]) {
      pane(x, 109 - h, w, h, mood.roof);
      pane(x + 3, 105 - h, w - 6, 4, mood.roof);
    }
    for (const [x, w, h] of [
      [255, 33, 23],
      [291, 26, 17],
      [326, 29, 22],
      [359, 28, 29],
    ]) {
      pane(x, 133 - h, w, h, mood.roof);
      pane(x + 4, 136 - h, 3, 6, environment.time === 'night' ? 0xecc18b : 0xa1b6ad);
    }
  };
  const applyEnvironment = (value) => {
    if (!value) return;
    // Merge partial updates: weather-only changes must not erase the current time.
    environment = { ...environment, ...value };
    mood = palettes[environment.time] ?? palettes.dusk;
    dayGrade.clear().fillStyle(mood.color, mood.alpha).fillRect(21, 18, 598, 320);
    lights.halo.setVisible(environment.time === 'dusk' || environment.time === 'night');
    lights.readingGlow.setAlpha(environment.time === 'day' || environment.time === 'morning' ? 0.35 : 0.85);
    drawSky();
    draw();
  };
  applyEnvironment(environment);
  return {
    setDay(day) {
      applyEnvironment({
        time: day === 1 ? 'dusk' : 'day',
        weather: day === 1 ? 'rain' : 'cloudy',
      });
    },
    setEnvironment: applyEnvironment,
    update(time, delta) {
      if (reduced()) {
        dust.clear();
        return;
      }
      // Weather needs only 30 updates/s; a degraded budget uses 15 and no dust.
      if (lastDraw !== null && time - lastDraw < (lowQuality() ? 66 : 33)) return;
      // On the first frame, advance by delta rather than by an infinite elapsed time.
      const elapsed = lastDraw === null ? delta : time - lastDraw;
      const step = Math.max(0, Math.min(100, elapsed));
      lastDraw = time;
      dust.clear();
      if (!lowQuality())
        for (let i = 0; i < 9; i++) {
          const x = 292 + ((i * 17 + Math.floor(time / 220)) % 58);
          const y = 78 + ((i * 23 + Math.floor(time / 500)) % 78);
          dust.fillStyle(0xffe3af, 0.14).fillRect(x, y, 1, 1);
        }
      reflection.setAlpha(0.7 + Math.sin(time / 3900) * 0.15);
      for (const drop of drops) {
        drop.y += step * 0.025 * drop.speed;
        if (drop.y > 130) drop.y = 30;
      }
      draw();
      lights.halo.setAlpha(0.8 + Math.sin(time / 1900) * 0.09);
      // Keep the time-of-day brightness when animating: daylight must not jump to night glow.
      const readingBase = environment.time === 'day' || environment.time === 'morning' ? 0.35 : 0.85;
      lights.readingGlow.setAlpha(readingBase + Math.sin(time / 2400) * 0.06);
      lights.steam
        .setY(-Math.floor((time % 3600) / 1200))
        .setAlpha(0.12 + Math.sin(time / 1200) * 0.07);
    },
    reset() {
      dust.clear();
      reflection.setAlpha(1);
      lights.halo.setAlpha(1);
      lights.halo.setVisible(environment.time === 'dusk' || environment.time === 'night');
      lastDraw = null;
      lights.readingGlow.setAlpha(environment.time === 'day' || environment.time === 'morning' ? 0.35 : 0.85);
      lights.steam.setY(0).setAlpha(0.15);
    },
  };
}
