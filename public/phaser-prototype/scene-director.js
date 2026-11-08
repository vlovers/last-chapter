/** Bounded deterministic timeline. Drivers own visual objects, never story state.
 * A reload reconstructs the beat from the persisted dialogue node. A skipped or
 * interrupted beat settles its endpoints; no timers or delayed callbacks survive.
 */
export function createSceneDirector(driver) {
  let timeline = null;
  let lastKey = null;
  const complete = (notify) => {
    const done = timeline?.done;
    timeline = null;
    driver.release?.();
    if (notify) done?.();
  };
  const begin = () => {
    while (timeline && timeline.index < timeline.commands.length) {
      const command = timeline.commands[timeline.index];
      const step = driver.begin(command);
      if (!step) {
        timeline.index++;
        continue;
      }
      timeline.step = step;
      timeline.elapsed = 0;
      return;
    }
    if (timeline) complete(true);
  };
  return {
    get active() {
      return Boolean(timeline);
    },
    get key() {
      return lastKey;
    },
    play(key, commands, done) {
      if (key === lastKey) {
        done();
        return;
      }
      this.finish(false);
      lastKey = key;
      timeline = { commands: commands.slice(0, 24), index: 0, elapsed: 0, step: null, done };
      begin();
    },
    update(delta, reduced = false) {
      if (!timeline) return;
      if (reduced) {
        this.finish();
        return;
      }
      const step = timeline.step;
      timeline.elapsed += Math.max(0, Math.min(delta, 50));
      const progress = Math.min(1, timeline.elapsed / Math.max(1, step.duration ?? 1));
      step.update?.(progress);
      if (progress >= 1) {
        step.finish?.();
        timeline.index++;
        begin();
      }
    },
    finish(notify = true) {
      if (!timeline) return;
      timeline.step?.finish?.();
      for (let i = timeline.index + 1; i < timeline.commands.length; i++)
        driver.begin(timeline.commands[i])?.finish?.();
      complete(notify);
    },
    reset() {
      this.finish(false);
      lastKey = null;
    },
  };
}
