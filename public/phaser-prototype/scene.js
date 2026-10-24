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
    // Phaser-native character: animated walk, idle and depth ordering.
    this.visitor = this.add.container(590, 287).setDepth(8);
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
      onUpdate: () => drawVisitor(Math.floor(this.time.now / 160) % 2 === 0),
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
