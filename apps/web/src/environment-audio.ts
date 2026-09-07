/** Authored, deterministic Foley synthesis. These are designed sounds, not field recordings. */
export const ENVIRONMENT_SECONDS = 24;
export const ENVIRONMENTS: Readonly<Record<string, { cutoff: number; level: number; hum: number }>> = {
  kettle: { cutoff: 240, level: .08, hum: 60 }, motel: { cutoff: 150, level: .055, hum: 50 },
  shore: { cutoff: 1100, level: .16, hum: 0 }, general: { cutoff: 420, level: .07, hum: 60 },
  wharf: { cutoff: 700, level: .13, hum: 43 }, clinic: { cutoff: 180, level: .045, hum: 60 },
  boathouse: { cutoff: 950, level: .095, hum: 0 }, hall: { cutoff: 350, level: .07, hum: 50 },
  shelter: { cutoff: 550, level: .12, hum: 38 },
};
const transient = (t: number, at: number, decay: number) => t < at ? 0 : Math.exp(-(t - at) * decay);
const burst = (t: number, at: number, duration: number) => t < at || t > at + duration ? 0 : Math.sin(Math.PI * (t - at) / duration) ** 2;
export const renderEnvironment = (location: string, sampleRate: number): Float32Array => {
  const profile = ENVIRONMENTS[location] ?? ENVIRONMENTS.shore!;
  const samples = new Float32Array(Math.round(sampleRate * ENVIRONMENT_SECONDS));
  let seed = [...location].reduce((sum, c) => Math.imul(sum, 31) + c.charCodeAt(0), 0x7ea) >>> 0;
  let low = 0;
  const alpha = 1 - Math.exp(-2 * Math.PI * profile.cutoff / sampleRate);
  for (let i = 0; i < samples.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const noise = seed / 0xffffffff - .5;
    low += alpha * (noise - low);
    const t = i / sampleRate;
    const swell = .6 + .22 * Math.sin(2 * Math.PI * t / 8) + .12 * Math.sin(2 * Math.PI * t / 12);
    const hum = profile.hum ? Math.sin(2 * Math.PI * profile.hum * t) * .065 : 0;
    let detail = 0;
    if (location === 'kettle') { // Spoon against ceramic, small cutlery shift.
      detail = [4.2, 13.7, 18.4].reduce((v, at) => v + transient(t, at, 18) * (Math.sin(t * 2 * Math.PI * 1700) + .4 * Math.sin(t * 2 * Math.PI * 2460)) * .19, 0);
    } else if (location === 'motel') { // Cooling metal in an ordinary heater.
      detail = [2.1, 9.6, 19.8].reduce((v, at) => v + transient(t, at, 36) * Math.sin(t * 2 * Math.PI * 870) * .28, 0);
    } else if (location === 'general') { // A short label feed; upstairs wood under a step.
      detail = burst(t, 6, .85) * (noise * .25 + Math.sin(t * 2 * Math.PI * 145) * .1) + transient(t, 17.3, 9) * Math.sin(t * 2 * Math.PI * 94) * .3;
    } else if (location === 'clinic') {
      detail = (burst(t, 5.8, .5) + burst(t, 16.4, 1.1)) * noise * .55;
    } else if (location === 'wharf') {
      detail = [3.4, 10.8, 20].reduce((v, at) => v + transient(t, at, 4.5) * Math.sin(t * 2 * Math.PI * 82) * .2, 0) + burst(t, 15.1, 1.3) * noise * .25;
    } else if (location === 'boathouse') {
      detail = [5.1, 5.9, 6.7, 17.8, 18.6].reduce((v, at) => v + burst(t, at, .45) * noise * .45, 0) + transient(t, 12.4, 14) * Math.sin(t * 2 * Math.PI * 130) * .22;
    } else if (location === 'hall') {
      detail = burst(t, 8.3, .8) * (noise * .35 + Math.sin(t * 2 * Math.PI * 220) * .08) + transient(t, 19.7, 25) * Math.sin(t * 2 * Math.PI * 620) * .17;
    } else if (location === 'shelter') {
      detail = Math.sin(t * 2 * Math.PI * 76) * (.025 + .015 * Math.sin(t * 2 * Math.PI * 6)) + burst(t, 14, 2) * low * .5;
    } else { // Pebbles and small waves, never an ocean surf crash.
      detail = low * (.35 * burst(t, 3, 3) + .45 * burst(t, 11, 2.8) + .3 * burst(t, 19, 3));
    }
    const edge = Math.min(1, i / (sampleRate * .025), (samples.length - 1 - i) / (sampleRate * .025));
    samples[i] = Math.max(-1, Math.min(1, (low * swell + hum + detail) * edge));
  }
  return samples;
};
