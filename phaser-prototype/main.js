import Phaser from 'phaser';
import './style.css';
import { FiveDayStory } from '../src/phaser/five-day-story';

// Only the canonical route uses the shared five-day narrative.
if (location.pathname === '/') window.__lastChapterStory = new FiveDayStory();

// Bundle the engine locally; keep the isolated public modules free of production state.
window.Phaser = Phaser;
const entry = document.createElement('script');
entry.type = 'module';
entry.src = '/phaser-prototype/scene.js';
entry.addEventListener('error', (error) => {
  console.error('Bookshop initialization failed', error);
  document.querySelector('#loading').hidden = false;
  document.querySelector('#loading-message').textContent =
    'Не вдалося відчинити книгарню. Оновіть сторінку, будь ласка.';
  document.querySelector('#enter').hidden = true;
});
document.head.append(entry);
