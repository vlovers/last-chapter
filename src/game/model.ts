/** Pure, deterministic narrative state. Do not mix this module with DOM or persistence. */
export type KnowledgeStatus = 'rumor' | 'observation' | 'confirmed';
export type Phase = 'day' | 'evening';
export type Choice = 'listen' | 'share' | 'verify';

export interface StoryState {
  readonly day: number;
  readonly phase: Phase;
  readonly trust: number;
  readonly reputation: number;
  readonly knowledge: KnowledgeStatus;
  readonly journal: readonly string[];
}

export const initialStory = (): StoryState => ({
  day: 1,
  phase: 'day',
  trust: 0,
  reputation: 0,
  knowledge: 'rumor',
  journal: [],
});

/** Hearing or repeating a rumor cannot turn it into confirmed truth. */
export function choose(state: StoryState, choice: Choice): StoryState {
  if (state.phase !== 'day') return state;
  switch (choice) {
    case 'listen':
      return { ...state, trust: state.trust + 1, journal: [...state.journal, 'You listened.'] };
    case 'share':
      return {
        ...state,
        reputation: state.reputation - 1,
        journal: [...state.journal, 'You repeated an unverified story.'],
      };
    case 'verify':
      return {
        ...state,
        knowledge: 'observation',
        journal: [...state.journal, 'You looked for another perspective.'],
      };
  }
}

export function advance(state: StoryState): StoryState {
  return state.phase === 'day'
    ? { ...state, phase: 'evening' }
    : { ...state, day: state.day + 1, phase: 'day' };
}
