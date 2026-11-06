// A visitor is stationary during conversations and resumes browsing after
// the player closes the conversation, unless another interaction is underway.
export function pauseVisitor(roaming) {
  return { ...roaming, engaged: true, path: [], goal: null };
}
export function resumeVisitor(roaming, pause = 2400) {
  return { ...roaming, engaged: false, path: [], goal: null, pause };
}
export function shouldBrowse(roaming, mode, visible, reduced) {
  return !roaming.engaged && mode === 'explore' && visible && !reduced;
}
