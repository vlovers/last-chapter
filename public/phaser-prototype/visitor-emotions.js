const ALIASES = Object.freeze({
  warm: 'warm',
  happy: 'warm',
  joy: 'warm',
  smile: 'warm',
  thoughtful: 'thoughtful',
  thinking: 'thoughtful',
  curious: 'thoughtful',
  firm: 'firm',
  serious: 'firm',
  determined: 'firm',
  sad: 'sad',
  sorrow: 'sad',
  worried: 'sad',
  surprised: 'surprised',
  surprise: 'surprised',
  startled: 'surprised',
  quiet: 'quiet',
  neutral: 'quiet',
});
const LABELS = Object.freeze({
  warm: 'Усміхається',
  thoughtful: 'Замислено',
  firm: 'Серйозно',
  sad: 'Засмучено',
  surprised: 'Здивовано',
  quiet: 'Тиха мить',
});
export function normalizeEmotion(mood) {
  return ALIASES[typeof mood === 'string' ? mood.toLowerCase() : ''] ?? 'quiet';
}
export function emotionLabel(mood) {
  return LABELS[normalizeEmotion(mood)];
}
