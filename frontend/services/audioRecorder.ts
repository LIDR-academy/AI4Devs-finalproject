import { useEffect } from "react";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";

/**
 * Wraps expo-audio's recorder hook with mic-permission + audio-mode setup,
 * so components only deal with start()/stop() and the resulting file uri.
 */
export function useVoiceNoteRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  useEffect(() => {
    (async () => {
      const status = await requestRecordingPermissionsAsync();
      if (status.granted) {
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      }
    })();
  }, []);

  async function start(): Promise<void> {
    await recorder.prepareToRecordAsync();
    recorder.record();
  }

  async function stop(): Promise<string | null> {
    await recorder.stop();
    return recorder.uri;
  }

  return { start, stop, isRecording: recorder.isRecording };
}
