import { WIDTH, HEIGHT, COLORS, BOOK_COLORS } from './config.js';
import { drawShelf } from './shelf-art.js';

// Original V4 room painting. Furniture footprints match world.js exactly.
// Every raised new prop sits on an existing solid object or on the back wall.
export function drawEnvironment(scene) {
  scene.cameras.main.setBackgroundColor('#1c2026');
  const ink = COLORS.dark,
    wood = COLORS.wood,
    honey = COLORS.woodLight,
    paper = COLORS.cream;
  const g = scene.add.graphics().setDepth(0);
  const painter =
    (graphics) =>
    (x, y, w, h, color, alpha = 1) => {
      graphics.fillStyle(color, alpha);
      graphics.fillRect(x, y, w, h);
    };
  const r = painter(g);
  r(0, 0, WIDTH, HEIGHT, 0x1c2026);
  // Aged olive plaster and walnut wainscot. Quiet contrast to the amber wood.
  r(13, 9, 614, 151, 0x363b36);
  r(21, 18, 598, 130, 0x6b7060);
  r(21, 18, 598, 9, 0x535c50);
  for (const [x, y, w] of [
    [37, 24, 64],
    [252, 20, 77],
    [415, 23, 45],
    [521, 25, 51],
    [360, 128, 36],
  ]) {
    r(x, y, w, 1, 0x777a66);
    r(x + 5, y + 3, Math.floor(w / 2), 1, 0x636c5b);
  }
  r(21, 145, 598, 15, 0x604435);
  r(21, 147, 598, 2, honey);
  r(21, 151, 598, 3, 0x402f2c);
  // Individual staggered floorboards: grain clusters, joinery and a few authored knots.
  const plankColors = [0x90674c, 0x986e50, 0x8b6046, 0x9d7353, 0x896248];
  r(21, 159, 598, 184, 0x483a32);
  for (let row = 0, y = 159; y < 343; row++, y += 18) {
    for (let col = -1, x = 21 - (row % 3) * 33; x < 619; col++, x += 101) {
      const left = Math.max(21, x),
        right = Math.min(619, x + 100);
      r(left, y + 1, right - left, Math.min(16, 342 - y), plankColors[(row * 3 + col + 9) % 5]);
      r(left + 1, y + 1, Math.max(0, right - left - 2), 1, 0xb08a62);
      if (x > 25 && x + 82 < 619 && y + 16 <= 343) {
        r(x + 3, y + 5, 1, 1, 0x5f4939);
        r(x + 3, y + 13, 1, 1, 0x5f4939);
        r(x + 16, y + 7, 29 + (row % 3) * 6, 1, 0x7e593f);
        r(x + 22, y + 9, 12, 1, 0xa77d55);
        if ((row + col) % 4 === 0) {
          r(x + 69, y + 12, 8, 1, 0x6d513c);
          r(x + 72, y + 11, 3, 1, 0x6d513c);
        }
      }
    }
  }
  r(21, 159, 598, 3, ink, 0.45);
  r(21, 162, 598, 4, ink, 0.15);
  // Deep window reveal; cold glass with three layers of Bellwick roofs.
  r(243, 16, 156, 130, 0x3a302c);
  r(248, 21, 146, 117, 0x22333e);
  for (let i = 0; i < 10; i++)
    r(
      255,
      28 + i * 10,
      132,
      10,
      [0x344b5c, 0x3a5465, 0x405d6c, 0x496b79, 0x537681][Math.min(4, Math.floor(i / 2))],
    );
  const outside = (x, base, w, h, color) => {
    r(x, base - h, w, h, color);
    for (let step = 0; step < 4; step++)
      r(x + step * 2, base - h - step * 2, w - step * 4, 2, color);
  };
  for (const [x, w, h] of [
    [256, 18, 19],
    [279, 25, 27],
    [309, 19, 22],
    [335, 22, 32],
    [364, 21, 23],
  ])
    outside(x, 109, w, h, 0x3d5667);
  for (const [x, w, h] of [
    [255, 33, 23],
    [291, 26, 17],
    [326, 29, 22],
    [359, 28, 29],
  ]) {
    outside(x, 133, w, h, 0x293e50);
    r(x + 4, 136 - h, 3, 6, 0xd6af78);
    r(x + 12, 136 - h, 3, 6, 0x9d9b82);
    r(x + 1, 130, w - 2, 1, 0x77949b);
  }
  // Interior frame remains in front of rain, using the same glass/mullion coordinates.
  r(249, 22, 6, 117, wood);
  r(387, 22, 6, 117, 0x49382f);
  r(317, 28, 7, 105, 0x9b754e);
  r(317, 28, 2, 105, honey);
  r(255, 74, 132, 6, 0x9b754e);
  r(255, 74, 132, 1, paper);
  r(245, 18, 152, 6, honey);
  r(245, 24, 152, 2, 0x4b392f);
  r(241, 133, 160, 6, honey);
  r(246, 139, 150, 8, 0x684632);
  r(249, 141, 145, 1, 0x3e332c);
  r(245, 147, 152, 8, 0x47382e);
  // Heavy sage curtains, gathered below the top rail.
  for (const x of [246, 386]) {
    r(x, 28, 8, 65, 0x45534a);
    r(x + 1, 28, 2, 65, 0x8b9471);
    r(x + 5, 28, 2, 61, 0x34443f);
    r(x, 91, 8, 3, 0xcb9c61);
    r(x + 6, 95, 2, 12, 0xcb9c61);
    r(x + 5, 105, 4, 3, paper);
  }
  // Four authored collections, each with empty bays, folios and face-out covers.
  for (const [i, x] of [29, 129, 409, 509].entries()) drawShelf(r, x, 29, i, BOOK_COLORS);
  // A tiny wall clock and layered notices occupy narrow gaps, never walkable floor.
  r(228, 35, 16, 21, 0x49392f);
  r(230, 37, 12, 16, honey);
  r(232, 39, 8, 12, paper);
  r(235, 41, 1, 6, ink);
  r(235, 46, 4, 1, ink);
  r(233, 50, 5, 1, 0xb39974);
  r(228, 86, 15, 31, 0x49392f);
  r(230, 89, 11, 25, 0xb59b71);
  r(229, 92, 8, 11, paper);
  r(234, 101, 8, 12, 0xa9b393);
  r(232, 94, 1, 1, 0x9d6547);
  r(237, 103, 1, 1, 0x9d6547);
  r(377, 21, 21, 25, wood);
  r(380, 24, 15, 19, honey);
  r(382, 26, 11, 15, 0x435f60);
  r(383, 35, 9, 5, 0x779176);
  r(385, 30, 4, 4, paper);
  // Cushion seams and a folded window-seat blanket, safely behind the floor boundary.
  for (const [x, color] of [
    [259, 0x9c5d52],
    [302, 0x87916d],
    [345, 0x9c5d52],
  ]) {
    r(x, 143, 33, 7, color);
    r(x + 2, 142, 29, 1, paper);
    r(x + 4, 147, 24, 1, 0x644f3c);
  }
  // Worn wine-red reading rug, with a restrained woven border and floral corners.
  r(265, 205, 285, 116, 0x3d3434);
  r(269, 208, 277, 109, 0x78504b);
  r(273, 211, 269, 103, 0xbd9565);
  r(276, 214, 263, 97, 0x75464a);
  r(282, 220, 251, 85, 0x503d40);
  for (let x = 277; x < 540; x += 12) {
    r(x, 215, 5, 1, paper);
    r(x + 3, 308, 5, 1, paper);
  }
  for (const [x, y] of [
    [285, 224],
    [523, 224],
    [285, 298],
    [523, 298],
  ]) {
    r(x - 3, y, 7, 1, 0xc39769);
    r(x, y - 3, 1, 7, 0xc39769);
    r(x - 1, y - 1, 3, 3, 0xab6b59);
    r(x - 5, y - 4, 2, 2, 0x7e8970);
  }
  for (let x = 270; x < 546; x += 7) {
    r(x, 204, 1, 3, 0xd0ac7b);
    r(x + 2, 318, 1, 4, 0xd0ac7b);
  }
  for (let y = 234; y < 298; y += 12) {
    r(285, y, 8, 1, 0x79524e);
    r(287, y - 2, 4, 5, 0x79524e);
    r(529, y, 3, 1, 0x79524e);
  }
  // Contact occlusion is below sprites and furniture. Short, dark foot contact + soft apron.
  for (const [x, y, w, h] of [
    [92, 291, 128, 6],
    [329, 281, 72, 6],
    [466, 299, 36, 5],
    [541, 199, 30, 8],
    [546, 314, 58, 7],
    [33, 303, 44, 5],
  ]) {
    r(x - 3, y + 2, w + 6, h, ink, 0.12);
    r(x, y, w, h - 1, ink, 0.23);
    r(x + 3, y, w - 6, 2, ink, 0.35);
  }
  const book = (f, x, y, w, color, h = 4) => {
    f(x + 1, y + 1, w, h, ink);
    f(x, y, w, h, color);
    f(x + 2, y + 1, w - 4, Math.max(1, h - 2), paper);
    f(x + 1, y + h - 1, w - 1, 1, color);
  };
  // Rasterize immutable paint once at native density. Reuse textures on scene restart.
  const cache = (graphics, key, w, h, depth) => {
    if (!scene.textures.exists(key)) graphics.generateTexture(key, w, h);
    const image = scene.add.image(graphics.x, graphics.y, key).setOrigin(0, 0).setDepth(depth);
    graphics.destroy();
    return image;
  };
  const piece = (x, y, depth, draw) => {
    const commands = [];
    draw((...rect) => commands.push(rect));
    const left = Math.min(...commands.map(([x]) => x));
    const top = Math.min(...commands.map(([, y]) => y));
    const w = Math.max(...commands.map(([x, , w]) => x + w)) - left;
    const h = Math.max(...commands.map(([, y, , h]) => y + h)) - top;
    const object = scene.add.graphics({ x: x + left, y: y + top });
    const paint = painter(object);
    for (const [rx, ry, rw, rh, color, alpha] of commands)
      paint(rx - left, ry - top, rw, rh, color, alpha);
    return cache(object, `bookshop-piece-${x}-${y}`, w, h, depth);
  };
  // Native 1px geometry: a 40px person, 42px counter, 36px chair.
  piece(156, 253, 295, (f) => {
    f(-64, 0, 128, 11, ink);
    f(-64, -2, 128, 3, paper);
    f(-62, 1, 124, 8, honey);
    f(-59, 11, 118, 28, wood);
    for (const x of [-54, -17, 20]) {
      f(x, 14, 33, 22, 0x533c30);
      f(x + 2, 16, 29, 18, 0xa0754c);
      f(x + 12, 19, 7, 2, honey);
    }
    f(-59, 39, 118, 3, ink);
    book(f, -48, -7, 24, 0x426563);
    book(f, -46, -12, 23, 0x996354);
    f(-10, -8, 24, 9, paper);
    f(1, -8, 1, 9, 0xac8d68);
    for (let i = 0; i < 3; i++) f(-7, -6 + i * 2, 6, 1, 0xb39b76);
    f(23, -10, 17, 11, 0x364a45);
    f(25, -14, 13, 6, 0x60756a);
    f(27, -13, 8, 3, paper);
    f(47, -6, 8, 7, 0x6e8880);
  });
  piece(365, 254, 286, (f) => {
    f(-30, 7, 5, 24, ink);
    f(25, 7, 5, 24, ink);
    f(-36, 0, 72, 12, 0x593e30);
    f(-35, 0, 70, 2, paper);
    f(-34, 2, 68, 7, honey);
    f(-33, 10, 66, 2, wood);
    f(-22, -8, 26, 9, paper);
    f(-9, -8, 1, 9, 0xa28a65);
    for (let i = 0; i < 3; i++) {
      f(-19, -6 + i * 2, 7, 1, 0xbca582);
      f(-5, -6 + i * 2, 6, 1, 0xbca582);
    }
    f(15, -13, 13, 14, 0x69758c);
    f(17, -11, 1, 10, paper);
    f(21, -9, 4, 1, honey);
  });
  piece(484, 282, 303, (f) => {
    f(-16, -15, 32, 27, ink);
    f(-14, -14, 28, 22, 0x56847a);
    f(-12, -12, 24, 15, 0x6e9482);
    f(-11, -11, 1, 12, 0x9eb095);
    f(-18, 2, 6, 16, 0x9c6e53);
    f(12, 2, 6, 16, 0x9c6e53);
    f(-17, 1, 5, 2, honey);
    f(12, 1, 5, 2, honey);
    f(-12, 8, 24, 9, 0x6e9482);
    f(-13, 18, 4, 3, ink);
    f(9, 18, 4, 3, ink);
    f(-8, -6, 15, 12, 0xd9be87);
    f(-6, -4, 11, 8, 0xead5a4);
    for (let i = 0; i < 3; i++) f(9 + i * 2, -4 + i * 2, 3, 17, i % 2 ? paper : 0xa57964);
  });
  // Original Devon Rex tree: cubby, scratching post, three staggered platforms.
  piece(439, 192, 201, (f) => {
    f(-17, -4, 34, 12, 0x58483d);
    f(-16, -5, 32, 3, honey);
    f(-13, -27, 26, 23, 0x9b815f);
    f(-11, -25, 22, 19, 0xb39c77);
    f(-6, -21, 12, 15, 0x3c3c3b);
    f(-4, -9, 8, 3, 0x7b8e80);
    f(6, -62, 5, 36, 0xc0a47b);
    for (let y = -61; y < -27; y += 3) f(6, y, 5, 1, 0x8c7255);
    f(-16, -43, 25, 4, wood);
    f(-15, -44, 23, 2, 0xc3b294);
    f(-4, -63, 24, 4, wood);
    f(-3, -66, 22, 4, 0x799082);
    f(-10, -42, 3, 15, 0x8c7255);
  });
  piece(513, 194, 198, (f) => {
    f(-10, -3, 20, 4, 0x697d82);
    f(-8, -5, 16, 3, paper);
    f(-6, -5, 12, 2, 0x9c7856);
  });
  piece(575, 314, 322, (f) => {
    f(-29, -25, 58, 30, ink);
    f(-27, -23, 54, 25, wood);
    f(-23, -21, 46, 20, 0x513f30);
    for (const [x, h, color] of [
      [-21, 22, 2],
      [-13, 28, 0],
      [-4, 24, 4],
      [5, 20, 6],
      [13, 25, 3],
    ]) {
      f(x, -h - 14, 7, h, BOOK_COLORS[color]);
      f(x + 1, -h - 12, 5, 1, paper);
    }
    f(-27, -12, 54, 5, honey);
    f(-27, -1, 54, 4, honey);
    f(-24, -21, 3, 24, wood);
    f(21, -21, 3, 24, wood);
    f(-7, -10, 14, 7, paper);
    f(-4, -8, 8, 1, 0xa58a61);
  });
  piece(55, 303, 307, (f) => {
    f(-22, -23, 44, 27, 0x684937);
    f(-20, -22, 40, 24, 0xb18a5d);
    f(-20, -22, 40, 2, paper);
    f(-1, -22, 3, 24, 0x856442);
    f(-19, -4, 39, 1, 0xd0ab75);
    f(-13, -15, 13, 8, paper);
    f(-11, -13, 8, 1, 0xb59b74);
    f(7, -13, 6, 3, 0x594938);
  });
  // A rooted plant in a ribbed terracotta pot, leaf silhouettes instead of square blocks.
  piece(556, 181, 205, (f) => {
    f(-15, -3, 30, 6, 0xbc8b62);
    f(-13, 3, 26, 13, 0x9a664a);
    f(-10, 16, 20, 7, 0x6e4939);
    f(-11, 4, 2, 10, 0xc79a6a);
    f(8, 4, 2, 10, 0x684834);
    f(-12, -1, 24, 2, 0x473d30);
    f(-1, -40, 2, 38, 0x8a9664);
    for (const [x, y, side] of [
      [-22, -38, 1],
      [5, -47, -1],
      [-20, -24, 1],
      [4, -31, -1],
      [-8, -55, 1],
    ]) {
      f(x + 4, y, 8, 3, 0x8b9e6b);
      f(x + 1, y + 3, 16, 4, 0x6e8b5d);
      f(x, y + 7, 19, 4, 0x526f50);
      f(x + 4, y + 11, 12, 3, 0x3e5c47);
      f(x + (side > 0 ? 8 : 6), y + 4, 2, 7, 0xa5ad79);
    }
  });
  // Window-side display pedestal; books are supported above the floor.
  piece(263, 190, 195, (f) => {
    f(-15, -8, 30, 3, honey);
    f(-13, -5, 26, 9, wood);
    f(-11, -4, 2, 8, 0xc99b69);
    f(-12, 3, 5, 2, ink);
    f(7, 3, 5, 2, ink);
    book(f, -12, -13, 24, BOOK_COLORS[3]);
    book(f, -10, -18, 23, BOOK_COLORS[2]);
    f(-3, -15, 2, 7, 0xa56153);
  });
  // Slim returns trolley beside the counter. No unexplained floor books.
  piece(59, 245, 250, (f) => {
    f(-15, -4, 30, 3, honey);
    f(-13, -2, 26, 6, wood);
    f(-14, -15, 2, 18, 0x684937);
    f(12, -15, 2, 18, 0x684937);
    f(-14, -17, 28, 2, honey);
    f(-11, 3, 4, 2, ink);
    f(7, 3, 4, 2, ink);
    book(f, -11, -9, 23, BOOK_COLORS[5]);
    book(f, -9, -14, 21, BOOK_COLORS[4]);
  });
  // Entry: panelled oak door, glazed transom, umbrella hooks, coir doormat.
  r(571, 147, 49, 72, 0x322e29);
  r(576, 150, 38, 63, wood);
  r(581, 155, 28, 23, 0x3c5761);
  r(583, 157, 24, 18, 0x587782);
  r(594, 156, 2, 22, honey);
  r(581, 177, 28, 3, honey);
  r(581, 184, 28, 24, 0x654937);
  r(584, 187, 22, 18, 0x956e49);
  r(602, 184, 4, 3, paper);
  r(603, 187, 2, 3, honey);
  r(573, 213, 44, 5, 0x433a2c);
  r(560, 218, 60, 5, 0xd0a770);
  r(562, 223, 56, 4, 0x674c35);
  r(548, 232, 72, 20, 0x3e3832);
  r(551, 234, 66, 16, 0x866c49);
  for (let x = 553; x < 616; x += 4) r(x, 236, 1, 12, 0xa68a5c);
  // Gently shaded pendant and reading lamp. Pools are layered low-alpha bands,
  // not full-screen filters or a single hard circular halo.
  r(319, 9, 2, 24, 0xc0a16d);
  r(316, 31, 8, 3, honey);
  for (let i = 0; i < 6; i++)
    r(
      307 - i * 2,
      34 + i * 3,
      26 + i * 4,
      3,
      [0xb98750, 0xc89b5e, 0xd8ad6b, 0xe3bc7c, 0xf3d49a, 0xf5d89d][i],
    );
  r(296, 52, 48, 2, 0x614431);
  r(301, 54, 38, 2, 0xffdfa1);
  const pool = (x, y, w, h, depth) => {
    const glow = scene.add.graphics({ x: x - w / 2, y: y - h / 2 });
    for (let i = 0; i < 6; i++) {
      glow.fillStyle(0xffcf87, 0.018 + i * 0.005);
      glow.fillEllipse(w / 2, h / 2, w - i * 12, h - i * 10);
    }
    return cache(glow, `bookshop-glow-${x}-${y}`, w, h, depth);
  };
  const halo = pool(320, 78, 146, 138, 2);
  const readingGlow = pool(492, 267, 106, 94, 310);
  piece(523, 300, 305, (f) => {
    f(-8, 0, 19, 4, 0x463a30);
    f(-4, -2, 12, 3, honey);
    f(0, -62, 2, 61, 0xb19461);
    f(2, -62, 1, 61, 0x4c4736);
    for (let i = 0; i < 5; i++)
      f(-6 - i, -69 + i * 2, 14 + i * 2, 2, [0x8d7956, 0xb39b65, 0xc8b478, 0xdfc28a, 0xe9d39e][i]);
    f(-10, -59, 23, 2, paper);
    f(-5, -57, 13, 2, 0xffdc99);
  });
  // Cold reflected window light rests on the floor, below the actors.
  const reflection = scene.add.graphics().setDepth(0.5);
  for (let i = 0; i < 5; i++) {
    const y = 163 + i * 7;
    const f = painter(reflection);
    f(276 - i * 2, y, 34 + i * 3, 4, 0x86a3ab, 0.06 - i * 0.008);
    f(326, y, 42 + i * 3, 4, 0x86a3ab, 0.06 - i * 0.008);
  }
  const parcel = piece(170, 246, 296, (f) => {
    f(0, -2, 29, 9, 0x96744b);
    f(0, -2, 29, 5, 0xddc395);
    f(1, -2, 27, 1, paper);
    f(12, -2, 2, 9, 0x8b6345);
    f(0, 1, 29, 1, 0x8b6345);
    f(17, -1, 8, 3, paper);
  }).setVisible(false);
  const steam = scene.add.graphics().setDepth(318).setAlpha(0.2);
  steam.lineStyle(1, paper, 1);
  steam.lineBetween(205, 247, 203, 242);
  steam.lineBetween(203, 242, 205, 238);
  steam.lineBetween(210, 244, 208, 239);
  // Architectural foreground frames the room without obstructing the walkable aisle.
  const front = scene.add.graphics().setDepth(350);
  const f = painter(front);
  f(12, 9, 9, 337, 0x473b30);
  f(14, 9, 2, 334, honey);
  f(619, 9, 9, 337, 0x473b30);
  f(620, 9, 1, 334, honey);
  f(12, 9, 616, 7, 0x342f2b);
  f(17, 15, 606, 2, 0xa77d53);
  f(12, 342, 616, 7, 0x332c29);
  f(17, 341, 606, 2, honey);
  f(21, 337, 598, 4, ink, 0.2);
  cache(g, 'bookshop-native-background', WIDTH, HEIGHT, 0);
  return { halo, readingGlow, parcel, steam };
}
