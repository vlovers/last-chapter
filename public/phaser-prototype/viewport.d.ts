interface Point {
  x: number;
  y: number;
}
interface Rect extends Point {
  w: number;
  h: number;
}
export function frameDialogue(
  player: Point,
  companion: Point | null,
  width: number,
  height: number,
  zoom: number,
  dock: { width: number; height: number },
): Point;
export function touchTarget(projected: Rect, width: number, height: number): Rect;
