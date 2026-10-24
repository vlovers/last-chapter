export function createAtmosphere(scene, lights, reduced) {
  const rain = scene.add.graphics().setDepth(1);
  const drops = Array.from({ length: 42 }, (_, i) => ({
    x: 258 + ((i * 31) % 126),
    y: 30 + ((i * 47) % 95),
    speed: 1 + (i % 3),
  }));
  const draw = () => {
    rain.clear().lineStyle(1, 0xc5d6dd, 0.42);
    for (const drop of drops)
      rain.lineBetween(drop.x, drop.y, drop.x - 1, Math.min(131, drop.y + 5));
  };
  draw();
  return {
    update(time, delta) {
      if (reduced()) return;
      for (const drop of drops) {
        drop.y += delta * 0.025 * drop.speed;
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
      lights.halo.setAlpha(1);
      lights.readingGlow.setAlpha(1);
      lights.steam.setY(0).setAlpha(0.15);
    },
  };
}
