interface IntroAudio {
  start(): Promise<void>;
  titleIntro(revealMenu: () => void): () => void;
}

/** Keep an in-flight audio unlock from starting the opening after it is skipped. */
export const startTitleIntro = (audio: IntroAudio, revealMenu: () => void, unavailable: () => void): (() => void) => {
  let canceled = false;
  let cancelMarker = () => {};
  void audio.start().then(() => {
    if (!canceled) cancelMarker = audio.titleIntro(() => { if (!canceled) revealMenu(); });
  }).catch(() => {
    if (!canceled) { unavailable(); revealMenu(); }
  });
  return () => { canceled = true; cancelMarker(); };
};
