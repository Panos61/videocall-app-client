/**
 * Creates a dummy audio track wrapped in a MediaStream.
 *
 * This function generates a MediaStream containing an audio track that produces
 * a silent sine wave. We must use it in our app in case both audio and video tracks are muted when user joins the call,
 * or when an application requires an audio track placeholder in scenarios
 * where no real audio input is available (e.g., user permissions are not granted). We make sure that the signalling process will be smooth.
 *
 * @returns {MediaStream} A MediaStream containing a single dummy audio track.
 *
 */

export const createDummyAudioTrack = () => {
  const audioCtx = new AudioContext();
  const oscillator = audioCtx.createOscillator();
  const destination = audioCtx.createMediaStreamDestination();

  oscillator.type = 'sine';
  oscillator.frequency.value = 0;
  oscillator.connect(destination);
  oscillator.start();

  return destination.stream;
};
