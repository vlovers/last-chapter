export function initialState() {
  return {
    mode: 'explore',
    mara: 'arriving',
    inspected: [],
    book: null,
    privacy: null,
    completed: false,
  };
}
export function transition(state, event) {
  switch (event.type) {
    case 'arrive':
      return { ...state, mara: 'ready' };
    case 'inspect':
      return state.mode === 'explore' &&
        ['shelves', 'window', 'counter', 'table'].includes(event.id)
        ? { ...state, inspected: [...new Set([...state.inspected, event.id])] }
        : state;
    case 'open':
      return state.mode === 'explore' ? { ...state, mode: 'dialogue' } : state;
    case 'close':
      return { ...state, mode: 'explore' };
    case 'choose': {
      if (state.mode !== 'dialogue' || state.completed) return state;
      const effect = event.effect ?? {};
      return {
        ...state,
        book: ['station', 'roads'].includes(effect.book) ? effect.book : state.book,
        privacy: ['respected', 'asked'].includes(effect.privacy) ? effect.privacy : state.privacy,
      };
    }
    case 'complete':
      return state.mode === 'dialogue' && state.book ? { ...state, completed: true } : state;
    default:
      return state;
  }
}
