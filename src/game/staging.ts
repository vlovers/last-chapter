/** Presentation commands: no flags, knowledge, inventory or save mutations. */
export type StageActor = 'visitor' | 'player';
export type StageCommand =
  | { readonly kind: 'move'; readonly actor: StageActor; readonly x: number; readonly y: number }
  | {
      readonly kind: 'face';
      readonly actor: StageActor;
      readonly direction: 'left' | 'right' | 'up' | 'down';
    }
  | {
      readonly kind: 'gesture';
      readonly actor: StageActor;
      readonly action: 'greet' | 'give' | 'receive' | 'talk' | 'sit';
      readonly duration?: number;
    }
  | {
      readonly kind: 'cat';
      readonly action: 'rest' | 'look';
      readonly x?: number;
      readonly y?: number;
    }
  | { readonly kind: 'wait'; readonly duration: number }
  | { readonly kind: 'exit'; readonly actor: StageActor }
  | { readonly kind: 'camera'; readonly x: number };

export type StoryTime = 'morning' | 'day' | 'dusk' | 'night';
export type StoryWeather = 'clear' | 'cloudy' | 'rain';

/** Content/import boundary validation; an invalid cue must not reach a renderer. */
export function validateStaging(commands: readonly StageCommand[]): string[] {
  const errors: string[] = [];
  if (!Array.isArray(commands) || commands.length > 24) return ['Invalid staging length'];
  for (const command of commands) {
    if (!command || typeof command !== 'object') {
      errors.push('Invalid command');
      continue;
    }
    if (
      ['move', 'face', 'gesture', 'exit'].includes(command.kind) &&
      (!('actor' in command) || !['visitor', 'player'].includes(command.actor))
    )
      errors.push('Invalid actor');
    if (
      command.kind === 'move' &&
      (!Number.isFinite(command.x) ||
        !Number.isFinite(command.y) ||
        command.x < 30 ||
        command.x > 610 ||
        command.y < 166 ||
        command.y > 335)
    )
      errors.push('Invalid movement target');
    if (
      (command.kind === 'gesture' || command.kind === 'wait') &&
      command.duration !== undefined &&
      (!Number.isFinite(command.duration) || command.duration < 0 || command.duration > 3000)
    )
      errors.push('Invalid cue duration');
    if (command.kind === 'face' && !['left', 'right', 'up', 'down'].includes(command.direction))
      errors.push('Invalid facing');
    if (
      command.kind === 'gesture' &&
      !['greet', 'give', 'receive', 'talk', 'sit'].includes(command.action)
    )
      errors.push('Invalid gesture');
    if (
      command.kind === 'cat' &&
      (!['rest', 'look'].includes(command.action) ||
        [command.x, command.y].some((value) => value !== undefined && !Number.isFinite(value)))
    )
      errors.push('Invalid cat cue');
    if (
      command.kind === 'camera' &&
      (!Number.isFinite(command.x) || command.x < 0 || command.x > 640)
    )
      errors.push('Invalid camera target');
    if (!['move', 'face', 'gesture', 'exit', 'wait', 'cat', 'camera'].includes(command.kind))
      errors.push('Unknown command');
  }
  return errors;
}
