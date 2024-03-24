import { useState, useEffect, useCallback } from "react";

type RecordingState = "idle" | "recording" | "stopped";

interface UseMediaRecorderReturn {
  mediaUrl: string | null;
  recordingState: RecordingState;
  startRecording: () => void;
  stopRecording: () => void;
  deleteRecording: () => void;
  error: string | null;
  analyser: AnalyserNode | null;
}

export const useMediaRecorder = (): UseMediaRecorderReturn => {
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    return () => {
      mediaRecorder?.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    };
  }, [mediaRecorder]);

  const createMediaBlob = useCallback((chunks: Blob[], stream: MediaStream) => {
    const mediaBlob = new Blob(chunks, { type: "audio/webm" });
    const mediaUrl = URL.createObjectURL(mediaBlob);
    setMediaUrl(mediaUrl);
    setRecordingState("stopped");
    stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
  }, []);

  const startRecording = useCallback(async () => {
    if (recordingState !== "idle") return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const mediaStreamSource = audioContext.createMediaStreamSource(stream);
      const analyserNode = audioContext.createAnalyser();
      mediaStreamSource.connect(analyserNode);
      setAnalyser(analyserNode);

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      let chunks: Blob[] = [];
      recorder.ondataavailable = (e: BlobEvent) => chunks.push(e.data);
      recorder.onstop = () => createMediaBlob(chunks, stream);
      setMediaRecorder(recorder);
      recorder.start();
      setRecordingState("recording");
    } catch (err) {
      setError("Failed to start recording. Please ensure you have granted access.");
    }
  }, [recordingState, createMediaBlob]); // Now createMediaBlob is included as a dependency

  const stopRecording = useCallback(() => {
    if (recordingState === "recording" && mediaRecorder) {
      mediaRecorder.stop();
    }
  }, [recordingState, mediaRecorder]);

  const deleteRecording = useCallback(() => {
    if (mediaUrl) {
      URL.revokeObjectURL(mediaUrl);
      setMediaUrl(null);
      setRecordingState("idle");
    }
  }, [mediaUrl]);

  return {
    mediaUrl,
    recordingState,
    startRecording,
    stopRecording,
    deleteRecording,
    error,
    analyser,
  };
};