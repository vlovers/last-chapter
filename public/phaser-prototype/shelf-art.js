// Hand-arranged shelf contents. Each tuple is [offset, width, height, palette index].
// Empty bays, horizontal folios and face-out covers are authored, not random fill.
export const SHELF_LAYOUTS = [
  [
    [
      [0, 5, 21, 2],
      [6, 4, 19, 3],
      [11, 7, 24, 0],
      [19, 4, 22, 5],
      [25, 6, 18, 1],
      [32, 5, 20, 6],
    ],
    [
      [0, 8, 24, 1],
      [10, 4, 20, 4],
      [15, 5, 22, 0],
      [23, 6, 20, 2],
      [31, 4, 24, 3],
      [37, 5, 23, 2],
      [66, 5, 19, 5],
      [72, 5, 22, 6],
    ],
    [
      [0, 5, 22, 5],
      [7, 6, 25, 0],
      [14, 5, 22, 3],
      [20, 7, 20, 4],
      [29, 4, 23, 1],
      [55, 6, 23, 2],
      [63, 5, 22, 2],
      [70, 7, 26, 0],
    ],
  ],
  [
    [
      [0, 5, 19, 5],
      [7, 5, 24, 0],
      [14, 7, 23, 1],
      [23, 5, 19, 4],
      [56, 5, 25, 6],
      [63, 6, 22, 6],
      [71, 6, 24, 2],
    ],
    [
      [0, 5, 24, 3],
      [6, 4, 23, 3],
      [11, 6, 25, 0],
      [19, 6, 20, 4],
      [26, 5, 21, 5],
      [64, 6, 19, 1],
      [72, 5, 22, 0],
    ],
    [
      [0, 5, 22, 6],
      [6, 7, 20, 4],
      [15, 5, 24, 3],
      [22, 5, 21, 5],
      [30, 8, 26, 2],
      [40, 4, 23, 6],
    ],
  ],
  [
    [
      [0, 5, 25, 3],
      [6, 5, 25, 3],
      [12, 5, 25, 3],
      [18, 5, 25, 3],
      [52, 7, 23, 0],
      [61, 4, 19, 2],
      [67, 5, 22, 4],
      [73, 4, 20, 1],
    ],
    [
      [0, 7, 24, 2],
      [9, 6, 19, 4],
      [17, 5, 22, 6],
      [24, 5, 20, 5],
      [61, 5, 23, 0],
      [68, 4, 21, 1],
      [73, 4, 24, 1],
    ],
    [
      [0, 5, 23, 1],
      [7, 5, 24, 4],
      [14, 6, 25, 0],
      [22, 5, 22, 2],
      [29, 4, 20, 2],
      [35, 5, 23, 5],
      [42, 6, 25, 3],
    ],
  ],
  [
    [
      [0, 6, 23, 2],
      [8, 5, 19, 1],
      [15, 7, 22, 4],
      [24, 5, 24, 0],
      [31, 5, 20, 6],
      [66, 5, 19, 3],
      [72, 5, 22, 5],
    ],
    [
      [0, 7, 24, 0],
      [9, 4, 22, 5],
      [15, 6, 25, 6],
      [23, 5, 19, 1],
      [30, 5, 21, 4],
    ],
    [
      [0, 5, 23, 3],
      [7, 6, 21, 4],
      [16, 5, 25, 6],
      [23, 5, 20, 0],
      [31, 5, 23, 5],
      [57, 6, 22, 1],
      [65, 4, 19, 2],
      [71, 6, 21, 0],
    ],
  ],
];

export function drawShelf(r, x, y, layout, colors) {
  const dark = 0x29292c,
    walnut = 0x684536,
    honey = 0xc39562,
    paper = 0xe9d5af;
  // Recess, fluted uprights, crown, shelf undersides and inset cabinet panels.
  r(x + 2, y + 3, 94, 119, 0x28262a);
  r(x, y, 94, 117, walnut);
  r(x + 6, y + 7, 81, 103, dark);
  r(x - 2, y - 2, 98, 4, 0x49392f);
  r(x, y - 2, 93, 1, honey);
  r(x + 2, y + 2, 3, 111, 0xa5754e);
  r(x + 89, y + 2, 3, 113, 0x3d302b);
  r(x + 86, y + 7, 2, 104, 0x80553c);
  for (let level = 0; level < 3; level++) {
    const base = y + 34 + level * 34;
    r(x + 6, base - 26, 80, 3, 0x22262a);
    for (const [offset, w, h, color] of SHELF_LAYOUTS[layout][level]) {
      const bx = x + 8 + offset,
        by = base - h;
      r(bx, by, w, h, colors[color]);
      r(bx, by, 1, h, 0x3a3332);
      r(bx + 1, by + 1, w - 1, 1, paper);
      if (w > 5) r(bx + 2, by + 5, w - 3, 1, honey);
      r(bx + 1, base - 4, w - 1, 1, honey);
      if ((offset + level) % 3 === 0) r(bx + 2, by + 9, 1, Math.max(2, h - 16), paper);
    }
    r(x + 4, base, 84, 3, honey);
    r(x + 5, base + 3, 83, 2, 0x3d302b);
    r(x + 5, base, 82, 1, 0xe1b778);
  }
  const folios = (sx, base, count, color) => {
    for (let i = 0; i < count; i++) {
      r(sx + (i % 2), base - i * 4 - 3, 22 - (i % 2), 3, colors[(color + i) % colors.length]);
      r(sx + 2 + (i % 2), base - i * 4 - 2, 17, 1, paper);
    }
  };
  const cover = (sx, base, color) => {
    r(sx, base - 24, 17, 24, 0x25272c);
    r(sx + 1, base - 25, 15, 23, color);
    r(sx + 3, base - 23, 11, 1, honey);
    r(sx + 3, base - 5, 11, 1, honey);
    r(sx + 6, base - 18, 5, 7, paper);
    r(sx + 8, base - 20, 1, 11, honey);
  };
  if (layout === 0) {
    cover(x + 53, y + 34, colors[2]);
    folios(x + 53, y + 68, 3, 1);
    folios(x + 44, y + 102, 2, 5);
  }
  if (layout === 1) {
    folios(x + 39, y + 34, 3, 4);
    cover(x + 48, y + 68, colors[0]);
    folios(x + 61, y + 102, 5, 2);
  }
  if (layout === 2) {
    cover(x + 35, y + 34, colors[1]);
    folios(x + 44, y + 68, 4, 0);
    folios(x + 64, y + 102, 2, 4);
  }
  if (layout === 3) {
    folios(x + 49, y + 34, 3, 3);
    cover(x + 49, y + 68, colors[6]);
    // Brass bird bookend beside the face-out poetry volume.
    r(x + 75, y + 57, 5, 8, honey);
    r(x + 74, y + 55, 7, 4, honey);
    r(x + 79, y + 54, 3, 2, paper);
    folios(x + 46, y + 102, 2, 2);
  }
  r(x + 4, y + 111, 86, 6, 0x49392f);
  r(x + 8, y + 117, 78, 3, 0x28262a);
}
