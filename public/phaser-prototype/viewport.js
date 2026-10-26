// CSS pixels and native world pixels stay separate. Zoom is always an integer.
export function viewportPlan(width, height) {
  const zoom =
    width < 1024
      ? Math.max(1, Math.floor(width / (width < 600 ? 180 : 300)))
      : Math.max(1, Math.floor(Math.min(width / 640, height / 360)));
  return { zoom, width: width / zoom, height: height / zoom };
}
export function projectRect(rect, camera) {
  return {
    x: Math.round((rect.x - (camera.scrollX ?? camera.worldView.x)) * camera.zoom),
    y: Math.round((rect.y - (camera.scrollY ?? camera.worldView.y)) * camera.zoom),
    w: Math.round(rect.w * camera.zoom),
    h: Math.round(rect.h * camera.zoom),
  };
}

export function frameWorld(player, width, height) {
  const x =
    width >= 640 ? (640 - width) / 2 : Math.max(0, Math.min(640 - width, player.x - width / 2));
  const y =
    height >= 360
      ? (360 - height) / 2
      : Math.max(
          0,
          Math.min(
            360 - height,
            Math.max(player.y - height + 16, Math.min((360 - height) / 2, player.y - 55)),
          ),
        );
  return { x: Math.round(x), y: Math.round(y) };
}
