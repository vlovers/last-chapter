import type { ChapterStage } from './chapter';
import type { StoryTime, StoryWeather } from './staging';

/** Authored conditions are derived from saved story progress, never the clock/RNG. */
const schedule: Record<ChapterStage, readonly [StoryTime, StoryWeather]> = {
  miller: ['morning', 'cloudy'],
  mara: ['dusk', 'rain'],
  evening: ['night', 'rain'],
  complete: ['night', 'rain'],
  iris: ['morning', 'cloudy'],
  anna: ['day', 'clear'],
  leo: ['dusk', 'clear'],
  'day2-complete': ['night', 'clear'],
  eleanor: ['morning', 'rain'],
  thomas: ['day', 'cloudy'],
  nora: ['dusk', 'cloudy'],
  'book-club': ['night', 'cloudy'],
  'quiet-evening': ['night', 'cloudy'],
  'day3-complete': ['night', 'cloudy'],
  'day4-iris': ['morning', 'cloudy'],
  'day4-mara': ['day', 'clear'],
  'day4-leo': ['dusk', 'clear'],
  'day4-complete': ['night', 'clear'],
  'day5-reading': ['dusk', 'clear'],
  'season-complete': ['night', 'clear'],
};
const timeNames = { morning: 'ранок', day: 'день', dusk: 'надвечір’я', night: 'ніч' };
const weatherNames = { clear: 'ясно', cloudy: 'хмарно', rain: 'дощ' };
export function storyEnvironment(stage: ChapterStage, node = '') {
  const [scheduled, weather] = schedule[stage];
  const time = stage === 'day5-reading' && node === 'end' ? 'night' : scheduled;
  return { time, weather, label: `${timeNames[time]} · ${weatherNames[weather]}` };
}
