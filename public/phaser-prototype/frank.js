// Frank, the bookshop's small grey Devon Rex. Static pixel-art resident.
export function createFrank(scene) {
  const cat = scene.add.graphics().setDepth(207);
  const r = (x, y, w, h, color) => {
    cat.fillStyle(color);
    cat.fillRect(x, y, w, h);
  };
  r(473, 192, 20, 9, 0x777781);
  r(469, 186, 7, 9, 0x777781);
  r(467, 183, 4, 6, 0x9998a2);
  r(478, 181, 14, 14, 0x9998a2);
  r(478, 175, 5, 9, 0x777781);
  r(487, 173, 5, 11, 0x777781);
  r(480, 177, 2, 5, 0xc38f9e);
  r(489, 175, 2, 6, 0xc38f9e);
  r(481, 186, 3, 2, 0xe6c77e);
  r(488, 186, 3, 2, 0xe6c77e);
  r(484, 190, 3, 2, 0xd5afb0);
  r(478, 197, 4, 3, 0xbbb5bb);
  r(488, 197, 4, 3, 0xbbb5bb);
  return cat;
}
