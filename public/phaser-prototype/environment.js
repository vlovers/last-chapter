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
  // Contact occlusion is below sprites and furniture. Short, dark foot contact + soft apron.
  for (const [x, y, w, h] of [
    [70, 309, 180, 8],
    [313, 283, 104, 10],
    [457, 297, 54, 10],
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
  const piece = (x, y, depth, draw) => {
    const object = scene.add.graphics({ x, y }).setDepth(depth);
    draw(painter(object));
    return object;
  };
  // Counter: thick bevelled top, glazed panels, moulding and worn brass handles.
  piece(160, 261, 316, (f) => {
    f(-90, -18, 180, 19, 0x543d30);
    f(-90, -18, 180, 3, paper);
    f(-88, -15, 176, 13, 0xb68b5b);
    f(-85, -12, 170, 8, 0xc99e6c);
    f(-90, -2, 180, 3, 0x61432f);
    f(-86, 1, 172, 48, wood);
    for (const x of [-79, -24, 31]) {
      f(x, 7, 48, 34, 0x533c30);
      f(x + 2, 9, 44, 29, 0xa0754c);
      f(x + 5, 12, 38, 24, 0x80573c);
      f(x + 5, 12, 1, 24, 0xba8a55);
      f(x + 19, 16, 8, 2, 0x332d29);
      f(x + 20, 16, 6, 1, honey);
    }
    f(-86, 45, 172, 5, honey);
    f(-86, 50, 172, 5, 0x3d302b);
    f(-79, -11, 28, 1, 0x8e6847);
    f(44, -7, 29, 1, 0xab7d50);
    book(f, -67, -23, 32, 0x426563, 5);
    book(f, -63, -29, 31, 0x996354, 5);
    book(f, -68, -34, 34, 0xb59b71, 4);
    // A paper roll, order ledger, fountain pen, register, mug and bell.
    f(-21, -23, 25, 8, 0xc7ad82);
    f(-19, -25, 23, 4, paper);
    f(-18, -24, 2, 1, 0x977455);
    f(6, -24, 26, 9, paper);
    f(18, -24, 1, 9, 0xac8d68);
    for (let i = 0; i < 3; i++) {
      f(9, -22 + i * 2, 6, 1, 0xb39b76);
      f(22, -22 + i * 2, 7, 1, 0xb39b76);
    }
    f(35, -23, 1, 8, ink);
    f(35, -24, 1, 2, honey);
    f(45, -24, 19, 9, 0x364a45);
    f(47, -29, 15, 7, 0x60756a);
    f(49, -27, 10, 3, 0xc3c19b);
    f(48, -20, 2, 1, paper);
    f(52, -20, 2, 1, paper);
    f(56, -20, 2, 1, paper);
    f(67, -23, 10, 8, 0x527878);
    f(68, -25, 8, 2, paper);
    f(77, -22, 3, 5, honey);
    f(78, -21, 1, 3, 0x544331);
    f(-33, -20, 9, 4, honey);
    f(-31, -22, 5, 2, honey);
    f(-29, -24, 1, 2, paper);
  });
  // Reading table, open book with bookmark, pencil, saucer and a small dried flower.
  piece(365, 261, 291, (f) => {
    f(-43, 2, 8, 28, 0x4b382d);
    f(35, 2, 8, 28, 0x4b382d);
    f(-42, 10, 2, 18, 0xb18a55);
    f(36, 10, 2, 18, 0xb18a55);
    f(-37, 18, 74, 4, 0x654831);
    f(-52, -17, 104, 23, 0x593e30);
    f(-50, -17, 100, 3, paper);
    f(-50, -14, 100, 16, honey);
    f(-47, -11, 94, 11, 0xb18352);
    f(-49, 3, 98, 3, 0x745035);
    f(-37, -15, 33, 13, 0x475f58);
    f(-35, -16, 29, 12, paper);
    f(-21, -16, 1, 12, 0xa28a65);
    for (let i = 0; i < 3; i++) {
      f(-32, -13 + i * 3, 8, 1, 0xbca582);
      f(-17, -13 + i * 3, 8, 1, 0xbca582);
    }
    f(-12, -5, 2, 6, 0xa95f4e);
    f(2, -9, 1, 9, 0x635239);
    f(13, -6, 13, 3, 0xe4c994);
    f(16, -11, 7, 6, 0x6e8880);
    f(17, -12, 5, 1, paper);
    f(35, -10, 6, 8, 0x76856e);
    f(37, -20, 1, 10, 0x84986c);
    f(34, -22, 6, 3, 0xc6a877);
  });
  // Upholstered armchair: rounded stepped silhouette, piping and a knitted throw.
  piece(484, 286, 305, (f) => {
    f(-23, -43, 46, 3, ink);
    f(-26, -40, 52, 39, ink);
    f(-22, -40, 44, 34, 0x355e5b);
    f(-19, -38, 38, 29, 0x56847a);
    f(-17, -36, 1, 23, 0x8ca58c);
    f(17, -36, 1, 23, 0x294c4b);
    f(-28, -14, 10, 21, 0x9c6e53);
    f(18, -14, 10, 21, 0x9c6e53);
    f(-27, -16, 8, 3, 0xd1a57a);
    f(19, -16, 8, 3, 0xd1a57a);
    f(-19, -9, 38, 14, 0x6e9482);
    f(-17, -8, 34, 2, 0x9eb095);
    f(-18, 5, 36, 3, 0x3b5c50);
    f(-23, 8, 7, 11, 0x4e382d);
    f(16, 8, 7, 11, 0x4e382d);
    f(-11, -31, 24, 20, 0xd9be87);
    f(-9, -29, 20, 16, 0xead5a4);
    f(-7, -26, 16, 1, 0xb79b70);
    // Throw hangs over the right arm, within the chair's solid footprint.
    for (let i = 0; i < 5; i++) f(12 + i * 2, -34 + i * 3, 6, 25, i % 2 ? 0xa57964 : 0xc09b76);
    for (let i = 0; i < 4; i++) f(16 + i * 3, 6, 1, 4, paper);
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
  // The existing small book piles retain their original solid footprints.
  piece(250, 189, 194, (f) => {
    book(f, 0, 0, 25, BOOK_COLORS[3]);
    book(f, 3, -5, 24, BOOK_COLORS[1]);
    book(f, 1, -10, 25, BOOK_COLORS[2]);
  });
  piece(45, 245, 249, (f) => {
    book(f, 0, 0, 25, BOOK_COLORS[5]);
    book(f, 2, -5, 24, BOOK_COLORS[4]);
    book(f, 0, -10, 26, BOOK_COLORS[0]);
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
    const glow = scene.add.graphics().setDepth(depth);
    for (let i = 0; i < 6; i++) {
      glow.fillStyle(0xffcf87, 0.018 + i * 0.005);
      glow.fillEllipse(x, y, w - i * 12, h - i * 10);
    }
    return glow;
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
  const parcel = piece(113, 229, 318, (f) => {
    f(0, -2, 29, 9, 0x96744b);
    f(0, -2, 29, 5, 0xddc395);
    f(1, -2, 27, 1, paper);
    f(12, -2, 2, 9, 0x8b6345);
    f(0, 1, 29, 1, 0x8b6345);
    f(17, -1, 8, 3, paper);
  }).setVisible(false);
  const steam = scene.add.graphics().setDepth(318).setAlpha(0.2);
  steam.lineStyle(1, paper, 1);
  steam.lineBetween(230, 234, 228, 229);
  steam.lineBetween(228, 229, 230, 225);
  steam.lineBetween(235, 231, 233, 226);
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
  return { halo, readingGlow, parcel, steam };
}
