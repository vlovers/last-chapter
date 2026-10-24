// Original 32×48 V4 actor art. One-pixel contours and stepped silhouettes match
// the environment's native density. All direction/stride variants share feet anchors.
export function drawPerson(context, ox, direction, frame, mara, palette = {}) {
  const r = (x, y, w, h, color) => {
    context.fillStyle = color;
    context.fillRect(ox + x, y, w, h);
  };
  const c = {
    outline: '#292c30',
    skin: '#e8b88a',
    shade: '#c08766',
    blush: '#cf8b74',
    hair: mara ? '#683e32' : '#3b3636',
    hairLight: mara ? '#a56c43' : '#635245',
    coat: mara ? '#ad6849' : '#406f68',
    light: mara ? '#ce9161' : '#729789',
    dark: mara ? '#7e4c39' : '#2c514f',
    trouser: '#474c4b',
    boot: '#382f2d',
    paper: '#efdbb1',
    gold: '#dfb66e',
    ...palette,
  };
  const side = direction === 'left' || direction === 'right';
  const right = direction === 'right';
  const up = direction === 'up';
  const walk = frame >= 2;
  const stride = walk ? [0, 2, 0, -2][frame - 2] : 0;
  const bob = walk && frame % 2 ? -1 : 0;
  const breath = !walk && frame === 1 ? 1 : 0;
  const by = 22 + bob + breath;
  // Feet are never scaled; side poses use narrower shoulders and a real profile nose.
  if (side) {
    r(12, 34, 6, 11 + stride, c.trouser);
    r(18, 34, 5, 11 - stride, '#343d3e');
    r(10, 43 + stride, 9, 3, c.boot);
    r(17, 43 - stride, 9, 3, c.outline);
    r(right ? 18 : 10, 43 + stride, 2, 1, '#a08562');
    r(10, by, 13, 14, c.outline);
    r(11, by, 10, 13, c.coat);
    r(right ? 18 : 11, by + 1, 3, 12, c.light);
    r(13, by + 4 - stride / 2, 5, 12, c.dark);
    r(14, by + 4 - stride / 2, 3, 10, c.coat);
    r(14, by + 14 - stride / 2, 4, 3, c.skin);
    r(13, 18 + bob, 7, 5, c.shade);
    r(10, 5 + bob, 13, 15, c.hair);
    r(8, 8 + bob, 17, 10, c.hair);
    r(right ? 17 : 9, 10 + bob, 7, 10, c.skin);
    r(right ? 23 : 8, 14 + bob, 2, 3, c.skin);
    r(right ? 21 : 10, 13 + bob, 2, 2, c.outline);
    r(right ? 22 : 10, 12 + bob, 1, 1, c.hair);
    r(right ? 20 : 10, 19 + bob, 3, 1, c.blush);
    r(11, 5 + bob, 9, 3, c.hairLight);
    r(9, 8 + bob, 4, 11, c.hairLight);
    if (mara) {
      r(right ? 7 : 21, 11 + bob, 4, 11, c.hair);
      r(right ? 8 : 22, 10 + bob, 2, 8, c.hairLight);
      r(right ? 8 : 20, 8 + bob, 4, 2, c.gold);
      r(right ? 20 : 11, by + 5, 2, 10, c.paper);
      r(11, by + 10, 10, 4, '#d1bd95');
      r(13, by + 7 - stride / 2, 1, 1, c.paper);
    } else {
      r(12, by + 1, 10, 3, c.gold);
      r(10, by + 4, 3, 8, '#ab814d');
    }
    return;
  }
  // Front/back legs alternate while the planted foot stays close to y=46.
  r(9, 34, 6, 11 + stride, c.trouser);
  r(18, 34, 6, 11 - stride, '#374442');
  r(8, 43 + stride, 8, 3, c.boot);
  r(18, 43 - stride, 8, 3, c.boot);
  r(9, 43 + stride, 5, 1, '#9c7a57');
  r(19, 43 - stride, 5, 1, '#9c7a57');
  r(9, by - 1, 15, 3, c.outline);
  r(7, by + 2, 19, 11, c.outline);
  r(9, by + 13, 15, 2, c.outline);
  r(9, by, 15, 14, c.coat);
  r(10, by + 1, 3, 11, c.light);
  r(22, by + 1, 2, 12, c.dark);
  r(5, by + 3 + stride / 2, 4, 10, c.coat);
  r(25, by + 3 - stride / 2, 3, 10, c.dark);
  r(5, by + 12 + stride / 2, 4, 3, c.skin);
  r(25, by + 12 - stride / 2, 3, 3, c.shade);
  r(13, 18 + bob, 7, 5, c.shade);
  // Stepped head contour, visible ears, separate hair sheen and cheek shading.
  r(11, 3 + bob, 10, 2, c.hair);
  r(8, 5 + bob, 16, 3, c.hair);
  r(7, 8 + bob, 18, 10, c.hair);
  r(9, 17 + bob, 14, 4, c.hair);
  r(10, 5 + bob, 10, 2, c.hairLight);
  r(8, 8 + bob, 3, 8, c.hairLight);
  if (up) {
    r(11, 8 + bob, 10, 10, c.hair);
    r(12, 17 + bob, 8, 3, c.hairLight);
    if (mara) {
      r(19, 13 + bob, 6, 10, c.hair);
      r(21, 13 + bob, 2, 9, c.hairLight);
      r(21, 9 + bob, 4, 2, c.gold);
    }
    if (mara) {
      r(10, by + 9, 13, 2, c.paper);
      r(15, by + 10, 2, 5, '#bba77e');
    } else {
      r(12, by, 10, 3, c.gold);
      r(13, by + 3, 3, 8, '#b88950');
    }
  } else {
    r(9, 12 + bob, 2, 5, c.shade);
    r(23, 12 + bob, 2, 5, c.shade);
    r(11, 9 + bob, 12, 11, c.skin);
    r(12, 19 + bob, 10, 2, c.shade);
    r(11, 8 + bob, 12, 3, c.hair);
    r(11, 11 + bob, 2, 2, c.hair);
    r(12, 13 + bob, 2, 2, c.outline);
    r(20, 13 + bob, 2, 2, c.outline);
    if (!walk && frame === 1) {
      r(12, 13 + bob, 2, 1, c.skin);
      r(20, 13 + bob, 2, 1, c.skin);
    } else {
      r(12, 13 + bob, 1, 1, c.paper);
      r(20, 13 + bob, 1, 1, c.paper);
    }
    r(17, 15 + bob, 1, 2, c.shade);
    r(12, 17 + bob, 2, 1, c.blush);
    r(21, 17 + bob, 2, 1, c.blush);
    r(16, 19 + bob, 3, 1, '#925c4d');
    if (mara) {
      r(7, 12 + bob, 4, 11, c.hair);
      r(8, 13 + bob, 2, 9, c.hairLight);
      r(22, 7 + bob, 4, 2, c.gold);
      r(12, by + 4, 9, 3, c.paper);
      r(11, by + 7, 12, 7, '#d6c29b');
      r(12, by + 7, 10, 1, c.paper);
      r(14, by + 10, 5, 3, '#bda780');
      r(21, by + 3, 1, 2, c.paper);
    } else {
      r(11, by, 12, 3, c.gold);
      r(20, by + 3, 3, 7, '#bc8e50');
      r(14, by + 6, 1, 1, c.paper);
      r(14, by + 10, 1, 1, c.paper);
      r(10, by + 7, 2, 3, '#c9c9a4');
    }
  }
}
