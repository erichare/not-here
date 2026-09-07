/** Quiet procedural environmental beds. Separate from the authored musical score. */
import { ENVIRONMENTS, renderEnvironment } from './environment-audio.ts';
export const createSoundscape = (context: AudioContext, destination: AudioNode) => {
  let location: string | null = null;
  let active: { source: AudioBufferSourceNode; filter: BiquadFilterNode; gain: GainNode } | null = null;
  return {
    set: (next: string | null) => {
      if (next === location) return;
      location = next;
      const now = context.currentTime;
      if (active) {
        const previous = active;
        previous.gain.gain.setTargetAtTime(0, now, .4);
        previous.source.stop(now + 2);
        previous.source.onended = () => { previous.source.disconnect(); previous.filter.disconnect(); previous.gain.disconnect(); };
        active = null;
      }
      if (!next) return;
      const { level } = ENVIRONMENTS[next] ?? ENVIRONMENTS.shore!;
      const samples = renderEnvironment(next, context.sampleRate);
      const buffer = context.createBuffer(1, samples.length, context.sampleRate);
      buffer.getChannelData(0).set(samples);
      const source = context.createBufferSource(); source.buffer = buffer; source.loop = true;
      const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = ['shore', 'wharf', 'shelter'].includes(next) ? 10000 : 5500;
      const gain = context.createGain(); gain.gain.value = 0; gain.gain.setTargetAtTime(level, now, .6);
      source.connect(filter); filter.connect(gain); gain.connect(destination); source.start();
      active = { source, filter, gain };
    },
  };
};
