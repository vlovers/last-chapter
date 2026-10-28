export function createAtmosphere(scene, lights, reduced, lowQuality = () => false) {
  const rain = scene.add.graphics().setDepth(1);
  const drops = Array.from({ length: 42 }, (_, i) => ({
    x: 258 + ((i * 31) % 126),
    y: 30 + ((i * 47) % 95),
    speed: 1 + (i % 3),
  }));
  let mood;
  let lastDraw = -Infinity;
  const dust = scene.add.graphics().setDepth(2);
  const reflection = scene.add.graphics().setDepth(1.1);
  reflection.fillStyle(0xc5d6dd, 0.08).fillRect(273, 36, 2, 24).fillRect(275, 38, 1, 8);
  const draw = () => {
    rain.clear().lineStyle(1, 0xc5d6dd, mood?.rain ?? 0.42);
    for (const drop of lowQuality() ? drops.slice(0, 14) : drops) {
      // Keep wooden mullions in front of the weather.
      if (drop.x >= 316 && drop.x <= 325) continue;
      if (drop.y >= 69 && drop.y <= 80) continue;
      rain.lineBetween(drop.x, drop.y, drop.x - 1, Math.min(drop.y < 69 ? 73 : 131, drop.y + 5));
    }
  };
  // Subtle environmental grade sits behind furniture and characters.
  const dayGrade = scene.add.graphics().setDepth(1.25);
  const moods = [
    { color: 0xe2b78c, alpha: 0.035, rain: 0.42 },
    { color: 0xa8b9b0, alpha: 0.055, rain: 0.57 },
    { color: 0xe4aa79, alpha: 0.07, rain: 0.3 },
    { color: 0x8599b4, alpha: 0.065, rain: 0.65 },
    { color: 0xf5c389, alpha: 0.085, rain: 0.22 },
  ];
  mood = moods[0];
  draw();
  const applyDay = (day) => {
    mood = moods[Math.max(0, Math.min(moods.length - 1, day - 1))];
    dayGrade.clear().fillStyle(mood.color, mood.alpha).fillRect(21, 18, 598, 320);
    draw();
  };
  return {
    setDay: applyDay,
    update(time, delta) {
      if (reduced()) {
        dust.clear();
        return;
      }
      // Weather needs only 30 updates/s; a degraded budget uses 15 and no dust.
      if (time - lastDraw < (lowQuality() ? 66 : 33)) return;
      const step = Math.min(100, time - lastDraw || delta);
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
      lights.readingGlow.setAlpha(0.85 + Math.sin(time / 2400) * 0.06);
      lights.steam
        .setY(-Math.floor((time % 3600) / 1200))
        .setAlpha(0.12 + Math.sin(time / 1200) * 0.07);
    },
    reset() {
      dust.clear();
      reflection.setAlpha(1);
      lights.halo.setAlpha(1);
      lights.readingGlow.setAlpha(1);
      lights.steam.setY(0).setAlpha(0.15);
    },
  };
}
