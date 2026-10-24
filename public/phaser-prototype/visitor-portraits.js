import { VISITOR_PALETTES } from './visitor-art.js';

// Hand-authored geometric pixel portraits. Canvas stays local and deterministic;
// no remote media, user images or character text is involved.
const SKIN = {
  mara: '#e3ad8c', miller: '#e1b393', iris: '#e9bf9d', anna: '#dbad88',
  leo: '#d8a585', eleanor: '#d7a98b', thomas: '#c99d82', nora: '#dfa98d',
};
const NAMES = {
  mara: 'Мара', miller: 'Пані Міллер', iris: 'Ірис', anna: 'Анна',
  leo: 'Лео', eleanor: 'Елеонора', thomas: 'Томас', nora: 'Нора',
};
export const PORTRAIT_NAMES = Object.freeze(NAMES);

export function portraitDataUrl(id, mood = 'quiet') {
  if (!Object.hasOwn(NAMES, id)) return null;
  const p = VISITOR_PALETTES[id] ?? {};
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 80;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const r = (x, y, w, h, color) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
  const hair = p.hair ?? '#674a45';
  const hairLight = p.hairLight ?? '#a77967';
  const coat = p.coat ?? '#8b5261';
  const light = p.light ?? '#b97a83';
  const skin = SKIN[id];
  r(0, 0, 64, 80, '#374d48');
  r(4, 4, 56, 72, '#60746a');
  r(7, 7, 50, 66, '#a28d70');
  r(9, 9, 46, 64, '#56665d');
  r(11, 64, 42, 12, '#364d49');
  r(5, 72, 54, 4, '#c3a277');
  // Shoulders and distinctive coat.
  r(7, 58, 50, 17, coat);
  r(12, 53, 40, 17, coat);
  r(15, 57, 9, 16, light);
  r(40, 57, 9, 16, light);
  r(25, 56, 14, 19, '#e4d2aa');
  r(27, 57, 10, 17, '#ede0c2');
  // Neck, ears, face.
  r(26, 49, 12, 11, skin);
  r(15, 29, 34, 24, skin);
  r(18, 21, 28, 31, skin);
  r(14, 34, 5, 10, skin);
  r(45, 34, 5, 10, skin);
  r(16, 19, 32, 10, hair);
  r(14, 25, 8, 12, hair);
  r(43, 25, 7, 12, hair);
  r(19, 16, 25, 6, hairLight);
  if (id === 'miller' || id === 'eleanor') {
    r(17, 17, 31, 7, hairLight);
    r(12, 24, 8, 27, hair);
    r(44, 24, 8, 27, hair);
    if (id === 'miller') {
      r(22, 12, 21, 7, hairLight);
      r(23, 32, 9, 2, '#5c514f');
      r(35, 32, 9, 2, '#5c514f');
      r(30, 32, 5, 1, '#5c514f');
      r(24, 35, 7, 2, '#d8c7a1');
      r(36, 35, 7, 2, '#d8c7a1');
    }
  } else if (id === 'iris' || id === 'nora' || id === 'anna') {
    r(11, 24, 9, 34, hair);
    r(44, 23, 9, 34, hair);
    r(14, 20, 36, 9, hair);
    if (id === 'anna') r(15, 19, 33, 3, hairLight);
    if (id === 'nora') r(11, 49, 8, 10, hairLight);
  } else if (id === 'leo' || id === 'thomas') {
    r(18, 15, 28, 9, hair);
    r(22, 12, 19, 5, hairLight);
    if (id === 'thomas') r(26, 61, 12, 14, '#a9bbba');
  } else {
    r(12, 23, 9, 25, hair);
    r(43, 23, 9, 25, hair);
    r(17, 17, 30, 8, hairLight);
  }
  // Expressions retain a clear silhouette at 64×80.
  const eyeY = mood === 'thoughtful' ? 37 : 35;
  r(23, eyeY, 5, 2, '#443e3b');
  r(37, eyeY, 5, 2, '#443e3b');
  r(32, 38, 2, 5, '#b47f68');
  if (mood === 'warm') {
    r(28, 46, 10, 2, '#925d56');
    r(30, 48, 6, 1, '#925d56');
  } else if (mood === 'firm') {
    r(27, 46, 11, 2, '#794b48');
    r(21, 32, 7, 2, hair);
    r(37, 32, 7, 2, hair);
  } else {
    r(29, 46, 8, 1, '#925d56');
  }
  return canvas.toDataURL('image/png');
}
