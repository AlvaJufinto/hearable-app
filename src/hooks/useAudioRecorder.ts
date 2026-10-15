/** @format */

import { useState } from "react";
import {
  AudioModule,
  RecordingPresets,
  useAudioRecorder as useExpoAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

export function useAudioRecorder() {
  const recorder = useExpoAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(recorder);

  const [isGranted, setIsGranted] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      setIsGranted(permission.granted);
      return permission.granted;
    } catch {
      setIsGranted(false);
      return false;
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      setRecordingUri(null);

      if (!isGranted) {
        const granted = await requestPermission();
        if (!granted) {
          setError("Microphone permission was denied.");
          return;
        }
      }

      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start recording.");
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    try {
      await recorder.stop();
      const uri = recorder.uri;
      setRecordingUri(uri);
      return uri;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to stop recording.");
      return null;
    }
  };

  return {
    isRecording: recorderState.isRecording,
    isGranted,
    duration: recorderState.durationMillis ?? 0,
    metering: recorderState.metering ?? null,
    requestPermission,
    startRecording,
    stopRecording,
  };
}
