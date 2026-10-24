/* Original 2.5D bookstore art study. All pixels are drawn locally; no third-party assets. */
const status = document.querySelector('#status');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const W = 640;
const H = 360;
const C = {
  void: 0x201b27,
  wall: 0x3e303e,
  plaster: 0x624454,
  wood: 0x9b604c,
  woodLight: 0xc38a61,
  gold: 0xf0bd7e,
  dark: 0x302837,
  floor: 0x825646,
  floorLight: 0xa77455,
  teal: 0x4b7976,
  jade: 0x769a82,
  red: 0xb36a5f,
  cream: 0xe6c19a,
  ink: 0x43333c,
};
const palettes = [0x9a6565, 0xd7a06d, 0x698c88, 0x6d6884, 0xc6b28a, 0x9b775b, 0x738c70];
class Bookshop extends Phaser.Scene {
  constructor() {
    super('bookshop');
  }
  create() {
    this.cameras.main.setBackgroundColor('#201b27');
    const g = this.add.graphics().setDepth(0);
    const r = (x, y, w, h, c) => {
      g.fillStyle(c);
      g.fillRect(x, y, w, h);
    };
    // Orthographic three-quarter room: a visible walkable floor, not a flat facade.
    r(0, 0, W, H, C.void);
    r(13, 9, 614, 155, C.wall);
    r(21, 17, 598, 140, C.plaster);
    for (let y = 20; y < 157; y += 22) r(21, y, 598, 1, 0x70505b);
    for (let x = 24; x < 619; x += 35) r(x, 18, 2, 136, 0x6a4853);
    r(13, 149, 614, 11, C.wood);
    r(21, 159, 598, 184, C.floor);
    for (let y = 159, row = 0; y < 343; y += 22, row++) {
      r(21, y, 598, 3, C.floorLight);
      for (let x = 21 + (row % 2) * 38; x < 619; x += 76) r(x, y + 3, 2, 19, 0x67434a);
      for (let x = 34 + (row % 2) * 27; x < 600; x += 81) r(x, y + 11, 17, 1, 0x96624f);
    }
    r(12, 9, 9, 337, C.wood);
    r(619, 9, 9, 337, C.wood);
    r(12, 342, 616, 7, C.dark);
    // Window, weather and Bellwick's rooftops.
    r(249, 22, 144, 117, C.dark);
    r(255, 28, 132, 105, 0x5d7c89);
    r(255, 79, 132, 54, 0xa0787d);
    for (let i = 0; i < 8; i++) {
      const x = 255 + i * 17,
        h = 18 + ((i * 7) % 24);
      r(x, 133 - h, 19, h, 0x4c5068);
      r(x + 6, 125 - h, 3, 5, C.gold);
    }
    r(317, 28, 7, 105, C.woodLight);
    r(255, 74, 132, 6, C.woodLight);
    r(245, 18, 152, 9, C.wood);
    r(245, 133, 152, 9, C.wood);
    this.rain = this.add.graphics().setDepth(2);
    this.drops = Array.from({ length: 55 }, (_, i) => ({
      x: 258 + ((i * 31) % 127),
      y: 30 + ((i * 47) % 98),
      s: 1 + (i % 3),
    }));
    if (prefersReducedMotion) {
      this.rain.lineStyle(1, 0xc5d6dd, 0.5);
      for (const drop of this.drops) {
        this.rain.lineBetween(drop.x, drop.y, drop.x - 2, drop.y + 7);
      }
    }
    // Detailed wooden shelves, each with a footprint and visible side face.
    const shelf = (x, y, w, h, seed) => {
      r(x + 7, y + 8, w, h, C.dark);
      r(x, y, w, h, C.wood);
      r(x + 5, y + 5, w - 10, h - 10, 0x342b37);
      for (let level = 0; level < 3; level++) {
        const sy = y + 9 + level * ((h - 16) / 3);
        for (let i = 0; i < Math.floor((w - 15) / 7); i++) {
          const bh = 12 + ((i * 11 + seed * 7 + level * 5) % 12);
          const bx = x + 8 + i * 7,
            by = sy + 23 - bh;
          r(bx, by, 5, bh, palettes[(i + level + seed) % palettes.length]);
          if (i % 4 === 0) r(bx + 2, by + 4, 1, bh - 7, C.cream);
        }
        r(x + 3, sy + 23, w - 6, 5, C.woodLight);
      }
      r(x + w - 7, y + 5, 7, h - 10, 0x714651);
      r(x + 7, y + h, w - 7, 9, 0x543943);
    };
    shelf(29, 29, 94, 117, 1);
    shelf(129, 29, 94, 117, 3);
    shelf(409, 29, 93, 117, 5);
    shelf(509, 29, 94, 117, 2);
    // Back wall: a notice board, reading lamp, and framed landscape.
    r(230, 21, 12, 109, C.wood);
    r(230, 50, 12, 6, C.gold);
    r(230, 57, 12, 13, 0xceb084);
    r(376, 20, 22, 25, C.wood);
    r(380, 24, 14, 17, 0x688984);
    r(383, 29, 8, 8, C.gold);
    // Carpet creates an explicit navigable reading zone.
    r(265, 205, 285, 116, 0x5b3944);
    r(274, 214, 267, 98, 0xa65f56);
    r(281, 221, 253, 84, 0x713f4c);
    for (let i = 0; i < 9; i++) r(289 + i * 27, 225, 14, 3, C.gold);
    for (let i = 0; i < 9; i++) r(289 + i * 27, 300, 14, 3, C.gold);
    // Reusable pixel-art furniture is drawn as separate depth-sorted game objects.
    const piece = (x, y, draw) => {
      const p = this.add.graphics({ x, y }).setDepth(y);
      const f = (a, b, w, h, c) => {
        p.fillStyle(c);
        p.fillRect(a, b, w, h);
      };
      draw(f);
      return p;
    };
    piece(160, 261, (f) => {
      f(-89, -18, 178, 19, C.woodLight);
      f(-85, 1, 170, 50, C.wood);
      f(-79, 6, 158, 36, 0x75464b);
      for (let i = 0; i < 4; i++) f(-70 + i * 37, 11, 29, 24, 0x8f5750);
      f(-85, 48, 170, 7, C.dark);
      f(-63, -25, 46, 7, C.gold);
      f(-59, -33, 46, 8, C.teal);
      f(-54, -39, 43, 6, C.red);
      f(12, -24, 29, 8, C.cream);
      f(17, -30, 20, 6, C.gold);
      f(57, -24, 12, 11, 0x6f8d87);
      f(59, -28, 8, 5, C.cream);
    });
    piece(365, 261, (f) => {
      f(-49, -7, 98, 15, C.dark);
      f(-52, -17, 104, 24, C.wood);
      f(-46, -12, 92, 15, C.woodLight);
      f(-43, -8, 86, 9, 0x895754);
      f(-36, -13, 28, 12, C.teal);
      f(-33, -16, 28, 3, C.gold);
      f(6, -10, 24, 11, C.cream);
      f(8, -13, 21, 3, C.red);
      f(-43, 7, 9, 23, C.wood);
      f(34, 7, 9, 23, C.wood);
    });
    piece(484, 286, (f) => {
      f(-27, -43, 54, 47, C.dark);
      f(-22, -39, 44, 40, C.teal);
      f(-27, -15, 54, 24, 0x9c6d67);
      f(-19, -9, 38, 14, 0xc48b75);
      f(-13, -28, 25, 15, C.cream);
      f(-24, 9, 8, 10, C.wood);
      f(16, 9, 8, 10, C.wood);
    });
    piece(575, 314, (f) => {
      f(-29, -25, 58, 30, C.dark);
      f(-26, -22, 52, 25, C.wood);
      for (let i = 0; i < 7; i++) f(-22 + i * 7, -32 - (i % 3) * 4, 6, 19, palettes[i]);
      f(-24, -1, 48, 4, C.woodLight);
    });
    piece(55, 303, (f) => {
      f(-22, -20, 44, 24, C.dark);
      f(-18, -23, 36, 25, C.woodLight);
      f(-12, -16, 24, 16, C.cream);
      f(-7, -9, 14, 2, C.wood);
    });
    piece(556, 218, (f) => {
      f(-15, -3, 30, 23, C.wood);
      f(-12, -8, 24, 11, C.woodLight);
      f(-2, -44, 5, 38, C.jade);
      for (const [x, y] of [
        [-23, -41],
        [9, -50],
        [-19, -29],
        [7, -32],
        [-7, -56],
      ])
        f(x, y, 22, 13, C.jade);
    });
    // Door with a visible step and entrance rug.
    r(571, 147, 49, 72, C.dark);
    r(578, 154, 35, 58, C.wood);
    r(583, 161, 24, 44, 0x644453);
    r(602, 185, 4, 4, C.gold);
    r(560, 218, 60, 9, C.woodLight);
    r(548, 232, 72, 20, 0x523a42);
    // Warm lamp and ambient glow.
    r(318, 0, 4, 48, C.woodLight);
    r(298, 48, 44, 5, C.gold);
    g.fillStyle(C.gold);
    g.fillTriangle(306, 36, 335, 36, 346, 51);
    g.fillTriangle(306, 36, 295, 51, 346, 51);
    const halo = this.add
      .circle(320, 71, 58, 0xffc885, 0.07)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(3);
    if (!prefersReducedMotion) {
      this.tweens.add({
        targets: halo,
        alpha: { from: 0.6, to: 1 },
        duration: 1800,
        yoyo: true,
        repeat: -1,
      });
    }
    // Two original 16px-style characters with a shared sprite drawing function.
    const character = (x, y, coat, hair) => {
      const container = this.add.container(x, y).setDepth(y);
      const p = this.add.graphics();
      container.add(p);
      const draw = (step = false) => {
        p.clear();
        const f = (a, b, w, h, c) => {
          p.fillStyle(c);
          p.fillRect(a, b, w, h);
        };
        f(-7, 0, 6, 8, C.dark);
        f(2, step ? 2 : 0, 6, 8, C.dark);
        f(-9, -19, 18, 20, coat);
        f(-6, -36, 12, 17, 0xe8b58d);
        f(-8, -40, 16, 9, hair);
        f(-9, -33, 4, 12, hair);
        f(5, -33, 4, 12, hair);
        f(-4, -28, 2, 2, C.ink);
        f(3, -28, 2, 2, C.ink);
        f(-2, -22, 4, 2, C.red);
      };
      draw();
      return { container, draw };
    };
    const reader = character(100, 212, 0x81607e, 0x503842);
    if (!prefersReducedMotion) {
      this.tweens.add({
        targets: reader.container,
        y: 215,
        duration: 1400,
        yoyo: true,
        repeat: -1,
        onUpdate: () => reader.container.setDepth(reader.container.y),
      });
    }
    const mara = character(584, 237, 0x688e86, 0x513740);
    if (prefersReducedMotion) {
      mara.container.setPosition(403, 265).setDepth(265);
      mara.draw();
    } else {
      this.tweens.add({
        targets: mara.container,
        x: 403,
        y: 265,
        duration: 3900,
        ease: 'Sine.easeInOut',
        onUpdate: () => {
          mara.container.setDepth(mara.container.y);
          mara.draw(Math.floor(this.time.now / 170) % 2 === 0);
        },
        onComplete: () => {
          mara.draw();
          status.textContent = 'Мара підійшла до столика. «Тут так затишно, коли надворі дощить».';
        },
      });
    }
    // Native pointer targets plus keyboard-accessible HTML controls below the canvas.
    const spots = [
      {
        x: 29,
        y: 29,
        w: 195,
        h: 120,
        label: 'Книжкові полиці',
        text: 'На полицях стоять історії, які чекають на своїх читачів.',
      },
      {
        x: 249,
        y: 22,
        w: 144,
        h: 117,
        label: 'Дощове вікно',
        text: 'За вікном Беллвік повільно занурюється в осінній вечір.',
      },
      {
        x: 70,
        y: 235,
        w: 180,
        h: 79,
        label: 'Прилавок',
        text: 'Тут зберігаються замовлення, записки й теплий чай.',
      },
      {
        x: 541,
        y: 159,
        w: 34,
        h: 69,
        label: 'Рослина',
        text: 'Зелень оживляє навіть найпохмуріший день.',
      },
      {
        x: 305,
        y: 235,
        w: 120,
        h: 62,
        label: 'Читацький столик',
        text: 'Книжки відкриті на найцікавіших сторінках.',
      },
    ];
    for (const spot of spots) {
      const zone = this.add
        .zone(spot.x, spot.y, spot.w, spot.h)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });
      zone.on('pointerdown', () => {
        status.textContent = spot.text;
      });
    }
    const controls = document.querySelector('#interactions');
    controls.replaceChildren();
    for (const spot of spots) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = spot.label;
      button.addEventListener('click', () => {
        status.textContent = spot.text;
      });
      controls.append(button);
    }
    this.add
      .text(17, 344, 'БЕЛЛВІК · КНИГАРНЯ', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#efc390',
      })
      .setDepth(500);
  }
  update(_time, delta) {
    if (prefersReducedMotion) return;
    this.rain.clear();
    this.rain.lineStyle(1, 0xc5d6dd, 0.5);
    for (const drop of this.drops) {
      drop.y += delta * 0.055 * drop.s;
      if (drop.y > 131) drop.y = 30;
      this.rain.lineBetween(drop.x, drop.y, drop.x - 2, drop.y + 7);
    }
  }
}
new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#201b27',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Bookshop],
  render: { antialias: false },
});
