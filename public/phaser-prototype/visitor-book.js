// Small foreground props communicate what a visitor is doing while browsing.
// Shapes are intentionally pixel-aligned and live in the Phaser scene.
export function createVisitorBook(scene) {
  const book = scene.add.graphics();
  book.setVisible(false);
  return {
    update(visitor, active, elapsed, reduced) {
      book.clear();
      book.setVisible(active);
      if (!active) return;
      const sway = reduced ? 0 : Math.round(Math.sin(elapsed / 320) * 1);
      const x = Math.round(visitor.x + (visitor.direction === 'left' ? -12 : 6));
      const y = Math.round(visitor.y - 25 + sway);
      book.fillStyle(0x352c3c);
      book.fillRect(x - 1, y - 1, 18, 14);
      book.fillStyle(0xd8bc86);
      book.fillRect(x, y, 8, 12);
      book.fillRect(x + 9, y, 7, 12);
      book.fillStyle(0x94765a);
      book.fillRect(x + 8, y, 1, 12);
      book.lineStyle(1, 0xb59b71);
      book.lineBetween(x + 2, y + 3, x + 6, y + 3);
      book.lineBetween(x + 11, y + 5, x + 14, y + 5);
      book.setDepth(visitor.y + 2);
    },
    destroy() {
      book.destroy();
    },
  };
}
