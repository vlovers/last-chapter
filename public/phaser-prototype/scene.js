/* Original Phaser proof of concept; no third-party art assets. */
const status = document.querySelector('#status');
const W = 640,
  H = 360;
const palette = {
  wall: 0x4b3443,
  trim: 0x91614f,
  floor: 0x654550,
  floorLine: 0x92635a,
  dark: 0x292333,
  wood: 0xb27a57,
  light: 0xf3bf81,
  teal: 0x71928b,
  leaf: 0x78926b,
  rose: 0xbd786b,
};
class Bookshop extends Phaser.Scene {
  constructor() {
    super('bookshop');
  }
  create() {
    this.cameras.main.setBackgroundColor('#241c2b');
    const g = this.add.graphics();
    const rect = (x, y, w, h, color) => {
      g.fillStyle(color);
      g.fillRect(x, y, w, h);
    };
    rect(0, 0, W, H, palette.wall);
    rect(0, 235, W, 125, palette.floor);
    for (let y = 235; y < H; y += 22) {
      rect(0, y, W, 3, palette.floorLine);
      for (let x = (((y / 22) | 0) % 2) * 35; x < W; x += 70) rect(x, y + 4, 2, 18, 0x4c3644);
    }
    rect(0, 0, W, 12, 0x352635);
    rect(0, 228, W, 8, palette.trim);
    // Tall shelves, stocked with varied book spines.
    for (const sx of [28, 158, 502]) {
      rect(sx, 38, 104, 200, palette.trim);
      rect(sx + 8, 45, 88, 184, palette.dark);
      for (let row = 0; row < 3; row++) {
        const sy = 49 + row * 57;
        for (let i = 0; i < 11; i++) {
          const colors = [palette.rose, palette.teal, palette.light, 0x8a7789, 0xc18e73];
          const height = 27 + ((i * 7 + row * 11) % 17);
          rect(sx + 10 + i * 8, sy + 44 - height, 6, height, colors[(i + row) % colors.length]);
          if (i % 3 === 0)
            rect(sx + 12 + i * 8, sy + 48 - height, 1, Math.max(4, height - 8), 0xe7cda4);
        }
        rect(sx + 5, sy + 44, 94, 6, 0xc28c66);
      }
    }
    // Rainy window with silhouette rooftops.
    rect(286, 30, 190, 168, palette.trim);
    rect(294, 38, 174, 152, 0x526879);
    rect(294, 130, 174, 60, 0x9a7886);
    for (let i = 0; i < 9; i++) {
      const x = 294 + i * 20;
      rect(x, 155 + (i % 3) * 8, 20, 40, 0x4b465e);
      rect(x + 7, 172 + (i % 2) * 8, 4, 7, 0xf0bc75);
    }
    rect(377, 38, 7, 152, palette.wood);
    rect(294, 113, 174, 7, palette.wood);
    this.rain = this.add.graphics().setDepth(2);
    this.drops = Array.from({ length: 45 }, (_, i) => ({
      x: 296 + ((i * 47) % 168),
      y: 40 + ((i * 23) % 145),
      s: 1 + (i % 3),
    }));
    // Pendant lamp and cozy halo.
    rect(241, 0, 5, 61, palette.trim);
    rect(216, 60, 54, 7, palette.light);
    g.fillStyle(palette.light);
    g.fillTriangle(228, 44, 258, 44, 274, 63);
    g.fillTriangle(228, 44, 216, 63, 274, 63);
    this.add.circle(244, 75, 68, 0xffc785, 0.085).setBlendMode(Phaser.BlendModes.ADD);
    // Rug and reading nook.
    rect(278, 273, 220, 68, 0x9c605b);
    rect(286, 281, 204, 52, 0x704452);
    rect(299, 286, 178, 4, 0xe4a86e);
    rect(299, 327, 178, 4, 0xe4a86e);
    rect(454, 210, 35, 34, 0x765a64);
    rect(460, 218, 25, 25, 0xb78571);
    rect(453, 240, 45, 10, 0xd29d74);
    // Checkout counter, objects and book stacks.
    rect(108, 218, 182, 20, 0xc48b61);
    rect(110, 237, 180, 78, 0x885454);
    rect(121, 249, 158, 57, 0x6c414a);
    rect(123, 202, 62, 15, 0x9e7374);
    rect(130, 193, 61, 9, 0xc89473);
    rect(135, 185, 56, 8, 0x6b8d8a);
    rect(205, 204, 32, 14, 0xd5bb96);
    rect(209, 198, 24, 6, 0xe8d4b0);
    rect(251, 208, 17, 10, 0xf2d0a3);
    // Indoor greenery.
    rect(470, 204, 27, 26, 0xbb7959);
    rect(480, 158, 5, 48, 0x71926b);
    for (const [x, y] of [
      [463, 160],
      [489, 151],
      [467, 179],
      [491, 175],
      [478, 143],
    ])
      rect(x, y, 18, 13, palette.leaf);
    // Door on the right, with a brass handle.
    rect(564, 218, 58, 121, 0x372a36);
    rect(571, 225, 45, 107, 0x8b574e);
    rect(580, 235, 27, 71, 0x5c4350);
    rect(600, 279, 5, 5, palette.light);
    // Art Pass 1: foreground objects drawn in their own Phaser layers.
    // These independent GameObjects can later be replaced with licensed sprite sheets.
    const prop = (x, y, draw, depth = y) => {
      const art = this.add.graphics({ x, y }).setDepth(depth);
      draw(art);
      return art;
    };
    const fill = (g, x, y, w, h, color) => {
      g.fillStyle(color);
      g.fillRect(x, y, w, h);
    };
    // A low table with a patterned runner, scattered books and a reading lamp.
    prop(335, 279, (p) => {
      fill(p, -38, -9, 76, 34, 0x3c2936);
      fill(p, -42, -17, 84, 32, 0x9f6855);
      fill(p, -37, -12, 74, 22, 0xc28b65);
      fill(p, -32, -7, 64, 12, 0x744953);
      fill(p, -28, -4, 56, 7, 0x9d6d60);
      fill(p, -23, -11, 18, 10, 0x638c8b);
      fill(p, -21, -13, 18, 3, 0xf0c38c);
      fill(p, 3, -9, 21, 10, 0xe0b582);
      fill(p, 6, -12, 17, 3, 0x9c6862);
      fill(p, 29, -12, 6, 8, 0xeacba2);
    });
    // Upholstered armchair and a small cushion.
    prop(426, 296, (p) => {
      fill(p, -19, -25, 38, 38, 0x473442);
      fill(p, -15, -23, 30, 30, 0x64867c);
      fill(p, -20, -4, 40, 18, 0x9d6d68);
      fill(p, -14, -1, 28, 11, 0xb98779);
      fill(p, -8, -13, 15, 10, 0xd9ae84);
      fill(p, -18, 13, 5, 6, 0x4e3541);
      fill(p, 13, 13, 5, 6, 0x4e3541);
    });
    // Book crate, its contents, and loose parcels near the entrance.
    prop(548, 314, (p) => {
      fill(p, -21, -17, 42, 27, 0x70434b);
      fill(p, -24, -20, 48, 7, 0xb7825f);
      fill(p, -18, -15, 36, 20, 0x9d6c55);
      for (let i = 0; i < 6; i++) {
        fill(
          p,
          -15 + i * 6,
          -24 - (i % 3) * 3,
          5,
          15 + (i % 3) * 3,
          [0x668982, 0xe2ae77, 0xb67870][i % 3],
        );
      }
      fill(p, -19, 1, 38, 3, 0xc3936e);
    });
    // Detailed floor clutter makes the room feel lived-in rather than a showroom.
    prop(54, 292, (p) => {
      fill(p, -17, -14, 34, 24, 0xa77357);
      fill(p, -13, -11, 26, 17, 0xc69670);
      fill(p, -9, -8, 18, 11, 0xe0b98c);
      fill(p, -5, -6, 10, 2, 0x91675d);
      fill(p, -5, -2, 8, 2, 0x91675d);
    });
    // A second visitor stays near the shelves.
    const visitor2 = this.add.container(82, 251).setDepth(251);
    const visitorArt = this.add.graphics();
    visitor2.add(visitorArt);
    fill(visitorArt, -8, -17, 16, 15, 0x6e4d70);
    fill(visitorArt, -6, -30, 12, 15, 0xe2b18c);
    fill(visitorArt, -8, -33, 16, 9, 0x5b404a);
    fill(visitorArt, -5, -22, 2, 2, 0x352935);
    fill(visitorArt, 3, -22, 2, 2, 0x352935);
    fill(visitorArt, -6, -2, 5, 8, 0x41303d);
    fill(visitorArt, 2, -2, 5, 8, 0x41303d);
    this.tweens.add({
      targets: visitor2,
      y: 254,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    // Subtle lamp flicker, without flashing the whole screen.
    const lampLight = this.add
      .circle(245, 79, 52, 0xffd29b, 0.035)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(3);
    this.tweens.add({
      targets: lampLight,
      alpha: { from: 0.55, to: 0.95 },
      duration: 1700,
      yoyo: true,
      repeat: -1,
    });
    // Phaser-native character: animated walk, idle and depth ordering.
    this.visitor = this.add.container(590, 287).setDepth(290);
    const vg = this.add.graphics();
    this.visitor.add(vg);
    const drawVisitor = (walking) => {
      vg.clear();
      vg.fillStyle(0x342b38);
      vg.fillRect(-7, 13, 5, 9);
      vg.fillRect(2, 13 + (walking ? 2 : 0), 5, 9);
      vg.fillStyle(0x77918b);
      vg.fillRect(-9, -3, 18, 18);
      vg.fillStyle(0xe6b28e);
      vg.fillRect(-7, -20, 14, 17);
      vg.fillStyle(0x51353e);
      vg.fillRect(-9, -24, 18, 8);
      vg.fillRect(-9, -18, 4, 11);
      vg.fillRect(5, -18, 4, 11);
      vg.fillStyle(0x302733);
      vg.fillRect(-4, -11, 2, 2);
      vg.fillRect(3, -11, 2, 2);
      vg.fillStyle(0xc77c74);
      vg.fillRect(-2, -5, 4, 2);
    };
    drawVisitor(false);
    this.tweens.add({
      targets: this.visitor,
      x: 333,
      y: 260,
      duration: 3500,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        this.visitor.setDepth(this.visitor.y);
        drawVisitor(Math.floor(this.time.now / 160) % 2 === 0);
      },
      onComplete: () => {
        drawVisitor(false);
        status.textContent = 'Мара завітала до книгарні. «Може, знайдемо щось цікаве для читання?»';
      },
    });
    // Phaser-native hit areas: no permanent HTML hotspot labels.
    const interact = (x, y, w, h, label, description) => {
      const area = this.add.zone(x, y, w, h).setOrigin(0).setInteractive({ useHandCursor: true });
      area.on('pointerover', () => {
        this.input.setDefaultCursor('pointer');
        status.textContent = label;
      });
      area.on('pointerout', () => this.input.setDefaultCursor('default'));
      area.on('pointerdown', () => {
        status.textContent = description;
        this.cameras.main.flash(120, 255, 209, 158, false);
      });
    };
    interact(
      28,
      38,
      238,
      200,
      'Книжкові полиці',
      'На полицях — старі видання, листівки та забуті історії.',
    );
    interact(286, 30, 190, 168, 'Дощове вікно', 'Беллвік ховається за осіннім дощем.');
    interact(
      108,
      195,
      182,
      122,
      'Робоче місце',
      'На прилавку лежать книги, чашка чаю та замовлення.',
    );
    interact(
      458,
      140,
      54,
      100,
      'Кімнатна рослина',
      'Рослина пережила не одну осінь у цій книгарні.',
    );
    this.add
      .text(16, 340, 'PHASER · ЕКСПЕРИМЕНТАЛЬНА СЦЕНА', {
        fontFamily: 'monospace',
        fontSize: '9px',
        color: '#f2c995',
      })
      .setDepth(20);
  }
  update(_time, delta) {
    this.rain.clear();
    this.rain.lineStyle(1, 0xc8d9e7, 0.45);
    for (const d of this.drops) {
      d.y += delta * 0.075 * d.s;
      if (d.y > 189) d.y = 40;
      this.rain.lineBetween(d.x, d.y, d.x - 3, d.y + 9);
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
  backgroundColor: '#241c2b',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [Bookshop],
  render: { antialias: false },
});
