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
