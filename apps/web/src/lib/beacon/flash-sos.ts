/**
 * Flash SOS using device torch/flashlight.
 * Pattern: 3 short (200ms) + 3 long (600ms) + 3 short (200ms)
 * Uses ImageCapture/MediaStream API to control torch.
 */
export class FlashSOS {
  private track: MediaStreamTrack | null = null;
  private isPlaying = false;
  private abortController: AbortController | null = null;

  private async getTorchTrack(): Promise<MediaStreamTrack | null> {
    if (this.track) return this.track;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      this.track = stream.getVideoTracks()[0] || null;
      return this.track;
    } catch {
      return null;
    }
  }

  private async setTorch(on: boolean) {
    const track = await this.getTorchTrack();
    if (!track) return;

    try {
      await track.applyConstraints({
        advanced: [{ torch: on } as any],
      });
    } catch {
      // Torch not supported on this device
    }
  }

  private sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, ms);
      signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new Error('Aborted'));
      });
    });
  }

  /**
   * Play one complete SOS flash pattern
   */
  async playSOS() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      const pattern = [
        // S: 3 short
        200, 200, 200, 200, 200, 400,
        // O: 3 long
        600, 200, 600, 200, 600, 400,
        // S: 3 short
        200, 200, 200, 200, 200,
      ];

      let torchOn = true;
      for (const duration of pattern) {
        if (signal.aborted) break;
        await this.setTorch(torchOn);
        await this.sleep(duration, signal);
        torchOn = !torchOn;
      }

      await this.setTorch(false);
    } catch {
      // Aborted or error
      await this.setTorch(false);
    } finally {
      this.isPlaying = false;
    }
  }

  stop() {
    this.abortController?.abort();
    this.isPlaying = false;
    this.setTorch(false);
    if (this.track) {
      this.track.stop();
      this.track = null;
    }
  }
}
