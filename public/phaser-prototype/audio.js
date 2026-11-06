// Original synthesized sounds. No recordings, downloaded samples, or autoplay.
export class BookshopAudio {
  constructor(Context = globalThis.AudioContext ?? globalThis.webkitAudioContext) {
    this.Context = Context;
    this.muted = true;
    this.volume = 0.4;
    this.music = false;
    this.failed = false;
    this.lastStep = 0;
    this.lastNote = 0;
    this.note = 0;
  }
  async unlock() {
    if (!this.Context || this.failed) return false;
    try {
      if (!this.context) {
        const c = (this.context = new this.Context());
        this.master = c.createGain();
        this.master.gain.value = 0;
        this.master.connect(c.destination);
        const buffer = c.createBuffer(1, c.sampleRate * 3, c.sampleRate);
        const data = buffer.getChannelData(0);
        let seed = 73;
        for (let i = 0; i < data.length; i++) {
          seed = (seed * 16807) % 2147483647;
          data[i] = ((seed / 2147483647) * 2 - 1) * 0.22;
        }
        this.rain = c.createBufferSource();
        this.rain.buffer = buffer;
        this.rain.loop = true;
        const filter = c.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1500;
        this.rain.connect(filter).connect(this.master);
        this.rain.start();
      }
      await this.context.resume();
      this.applyVolume();
      return true;
    } catch (error) {
      console.warn('Audio unavailable; continuing silently', error);
      this.failed = true;
      await this.dispose();
      return false;
    }
  }
  applyVolume() {
    if (this.master && this.context.state !== 'closed') {
      this.master.gain.setTargetAtTime(
        this.muted ? 0 : this.volume,
        this.context.currentTime,
        0.04,
      );
    }
  }
  async toggle() {
    if (!(await this.unlock())) return false;
    this.muted = !this.muted;
    this.applyVolume();
    return true;
  }
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, Number(value) || 0));
    this.applyVolume();
  }
  tone(frequency, duration, gain, type = 'sine') {
    if (!this.context || this.muted || this.context.state !== 'running') return;
    const c = this.context,
      now = c.currentTime;
    const oscillator = c.createOscillator(),
      envelope = c.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(gain, now + 0.01);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(envelope).connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
    oscillator.onended = () => {
      oscillator.disconnect();
      envelope.disconnect();
    };
  }
  play(kind) {
    if (kind === 'book') {
      this.tone(170, 0.12, 0.2, 'triangle');
      this.tone(890, 0.07, 0.03);
    } else if (kind === 'step') this.tone(85, 0.07, 0.16, 'triangle');
    else this.tone(520, 0.07, 0.065);
  }
  update(time, walking) {
    if (walking && time - this.lastStep > 340) {
      this.play('step');
      this.lastStep = time;
    }
    if (this.music && time - this.lastNote > 2200) {
      this.tone(
        [196, 246.94, 293.66, 220, 261.63, 329.63, 293.66, 246.94][this.note++ % 8],
        2,
        0.06,
      );
      this.lastNote = time;
    }
  }
  suspend() {
    this.context?.suspend().catch(() => {});
  }
  async dispose() {
    if (this.context && this.context.state !== 'closed') await this.context.close().catch(() => {});
  }
}
