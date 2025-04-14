import { Howl } from 'howler';

export type SoundType = 'notification' | 'call' | 'message' | 'success' | 'error';

class SoundService {
  private sounds: Record<SoundType, Howl> = {
    notification: new Howl({
      src: ['/sounds/notification.mp3'],
      volume: 0.5,
    }),
    call: new Howl({
      src: ['/sounds/call.mp3'],
      volume: 0.7,
    }),
    message: new Howl({
      src: ['/sounds/message.mp3'],
      volume: 0.4,
    }),
    success: new Howl({
      src: ['/sounds/success.mp3'],
      volume: 0.6,
    }),
    error: new Howl({
      src: ['/sounds/error.mp3'],
      volume: 0.6,
    }),
  };

  private isMuted = false;

  play(type: SoundType) {
    if (!this.isMuted) {
      this.sounds[type].play();
    }
  }

  stop(type: SoundType) {
    this.sounds[type].stop();
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  isSoundMuted() {
    return this.isMuted;
  }

  setVolume(type: SoundType, volume: number) {
    this.sounds[type].volume(volume);
  }
}

export const soundService = new SoundService(); 