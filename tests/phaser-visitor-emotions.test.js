import { describe, expect, it } from 'vitest';
import { normalizeEmotion, emotionLabel } from '../public/phaser-prototype/visitor-emotions.js';
describe('dialogue portrait emotions', () => {
  it('supports joy, sadness, surprise, thought and determination', () => {
    expect(normalizeEmotion('happy')).toBe('warm');
    expect(normalizeEmotion('worried')).toBe('sad');
    expect(normalizeEmotion('startled')).toBe('surprised');
    expect(normalizeEmotion('thinking')).toBe('thoughtful');
    expect(normalizeEmotion('serious')).toBe('firm');
  });
  it('provides Ukrainian labels and a safe neutral fallback', () => {
    for (const mood of ['warm', 'sad', 'surprised', 'thoughtful', 'firm', 'quiet'])
      expect(emotionLabel(mood).length).toBeGreaterThan(3);
    expect(normalizeEmotion(undefined)).toBe('quiet');
    expect(normalizeEmotion('unrecognized')).toBe('quiet');
  });
});
