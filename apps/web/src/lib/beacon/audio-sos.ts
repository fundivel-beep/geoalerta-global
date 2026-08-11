/**
 * Audio SOS signal generator using Web Audio API.
 * Emits tones between 2000-4000Hz in SOS pattern:
 * 3 short (200ms) + 3 long (600ms) + 3 short (200ms)
 * Pauses of 200ms between tones.
 */
export class AudioSOS {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;

  private getContext(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    return this.audioCtx;
  }

  /**
   * Play one complete SOS pattern
   */
  async playSOS() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    const ctx = this.getContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const pattern = [
      // 3 short (S: dit dit dit)
      { freq: 2500, duration: 0.2 },
      { freq: 0, duration: 0.2 }, // pause
      { freq: 2500, duration: 0.2 },
      { freq: 0, duration: 0.2 },
      { freq: 2500, duration: 0.2 },
      { freq: 0, duration: 0.4 }, // letter pause
      // 3 long (O: dah dah dah)
      { freq: 3000, duration: 0.6 },
      { freq: 0, duration: 0.2 },
      { freq: 3000, duration: 0.6 },
      { freq: 0, duration: 0.2 },
      { freq: 3000, duration: 0.6 },
      { freq: 0, duration: 0.4 }, // letter pause
      // 3 short (S: dit dit dit)
      { freq: 3500, duration: 0.2 },
      { freq: 0, duration: 0.2 },
      { freq: 3500, duration: 0.2 },
      { freq: 0, duration: 0.2 },
      { freq: 3500, duration: 0.2 },
    ];

    let time = ctx.currentTime;

    for (const step of pattern) {
      if (step.freq > 0) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = step.freq;
        gainNode.gain.value = 0.8;

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(time);
        oscillator.stop(time + step.duration);
      }
      time += step.duration;
    }

    // Wait for pattern to complete
    setTimeout(() => {
      this.isPlaying = false;
    }, (time - ctx.currentTime) * 1000 + 100);
  }

  stop() {
    this.isPlaying = false;
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}
