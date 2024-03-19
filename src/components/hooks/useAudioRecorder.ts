// src/components/hooks/useAudioRecorder.ts
import { useState, useEffect } from "react";

type RecordingState = "idle" | "recording" | "stopped";

interface UseAudioRecorderReturn {
  audioUrl: string | null;
  recordingState: RecordingState;
  startRecording: () => void;
  stopRecording: () => void;
  deleteRecording: () => void;
  error: string | null;
  analyser: AnalyserNode | null;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    return () => {
      // Ensure all tracks are stopped when the component unmounts
      mediaRecorder?.stream.getTracks().forEach((track) => track.stop());
    };
  }, [mediaRecorder]);

  const startRecording = async () => {
    if (recordingState !== "idle") return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        setError("Audio format not supported");
        return;
      }

      // Visualization setup
      // Note: You might need to move or adjust this part based on your application structure.
      const audioContext = new AudioContext();
      const mediaStreamSource = audioContext.createMediaStreamSource(stream);
      const analyserNode = audioContext.createAnalyser();
      mediaStreamSource.connect(analyserNode);
      // Optionally connect the analyserNode to audioContext.destination if you want to hear the audio while recording
      setAnalyser(analyserNode);
      // Here you would need to ensure that your AudioVisualizer component can accept and use the analyser node for real-time visualization.
      // For example, you could add a state to store the analyser node and pass it to the AudioVisualizer component.


      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      let chunks: Blob[] = [];

      recorder.ondataavailable = (e: BlobEvent) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setRecordingState("stopped");

        // Release the microphone by stopping the stream's tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      setMediaRecorder(recorder);
      recorder.start();
      setRecordingState("recording");
    } catch (err) {
      setError(
        "Failed to start recording. Please ensure you have granted microphone access."
      );
    }
  };

  const stopRecording = () => {
    if (recordingState === "recording" && mediaRecorder) {
      mediaRecorder.stop(); // This triggers the onstop event where the stream tracks are stopped
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setRecordingState("idle");
    }
  };

  return {
    audioUrl,
    recordingState,
    startRecording,
    stopRecording,
    deleteRecording,
    analyser,
    error,
  };
};
