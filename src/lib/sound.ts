// A short two-note chime for new notifications, built with the Web Audio API so
// the app ships no audio file. Browsers refuse to make sound until the person has
// touched the page, so we wait for the first click or key press before arming it.

const STORAGE_KEY = 'birdie.sound';

let context: AudioContext | null = null;
let armed = false;

type AudioContextCtor = new () => AudioContext;

function audioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { AudioContext?: AudioContextCtor; webkitAudioContext?: AudioContextCtor };
  return w.AudioContext || w.webkitAudioContext || null;
}

export function isSoundOn() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(STORAGE_KEY) !== 'off';
}

export function setSoundOn(on: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off');
  if (on) playNotificationSound();
}

// Call once when the app mounts. Safe to call more than once.
export function armNotificationSound() {
  if (armed || typeof window === 'undefined') return;
  armed = true;
  const unlock = () => {
    const Ctor = audioContextCtor();
    if (!Ctor) return;
    if (!context) context = new Ctor();
    if (context.state === 'suspended') void context.resume();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
}

function tone(ctx: AudioContext, frequency: number, startAt: number, length: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(0.14, startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + length + 0.02);
}

export function playNotificationSound() {
  if (!isSoundOn()) return;
  const Ctor = audioContextCtor();
  if (!Ctor) return;
  try {
    if (!context) context = new Ctor();
    if (context.state === 'suspended') void context.resume();
    const now = context.currentTime;
    tone(context, 880, now, 0.16);
    tone(context, 1318.5, now + 0.13, 0.22);
  } catch {
    // A browser that will not make sound is not worth an error.
  }
}
