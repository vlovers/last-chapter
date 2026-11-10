// CSS pixels and native world pixels stay separate. Zoom is always an integer.
export function viewportPlan(width, height) {
  // A landscape phone is wide but short: zooming from width alone crops the room.
  // Use a single world pixel per CSS pixel so the full 640px room fits horizontally.
  const zoom =
    width > height && height < 550 && width >= 640 && width < 1024
      ? 1
      : width < 1024
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

/** Landscape reading uses the left half of the room; portrait uses the space above the dock. */
export function frameDialogue(player, companion, width, height, zoom, dock) {
  const frame = frameWorld(player, width / zoom, height / zoom);
  if (width > height && height < 550) {
    // A bottom-mounted landscape dialogue does not obscure the world horizontally.
    // Never subtract its width from the camera's available scene width.
    if (width / zoom >= 640) return frame;
    const available = Math.max(64, (width - Math.min(dock.width, width / 3) - 24) / zoom);
    const center = companion
      ? Math.abs(player.x - companion.x) > available - 64
        ? companion.x
        : (player.x + companion.x) / 2
      : player.x;
    return { x: Math.round(center - (width - dock.width - 24) / (2 * zoom)), y: frame.y };
  }
  return {
    x: companion
      ? frameWorld(
          {
            x:
              Math.abs(player.x - companion.x) > width / zoom - 64
                ? companion.x
                : (player.x + companion.x) / 2,
            y: player.y,
          },
          width / zoom,
          height / zoom,
        ).x
      : frame.x,
    y: Math.round(player.y - Math.max(65, (height - dock.height - 24) * 0.7) / zoom),
  };
}

/** A partially visible object's hit area still fits entirely inside the viewport. */
export function touchTarget(projected, width, height) {
  const visibleLeft = Math.max(0, projected.x),
    visibleTop = Math.max(0, projected.y);
  const visibleWidth = Math.max(0, Math.min(width, projected.x + projected.w) - visibleLeft);
  const visibleHeight = Math.max(0, Math.min(height, projected.y + projected.h) - visibleTop);
  const w = Math.max(44, visibleWidth),
    h = Math.max(44, visibleHeight);
  return {
    x: Math.max(0, Math.min(width - w, visibleLeft + (visibleWidth - w) / 2)),
    y: Math.max(0, Math.min(height - h, visibleTop + (visibleHeight - h) / 2)),
    w,
    h,
  };
}
